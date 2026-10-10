// CPU-only regression checks of the real Ship and Water classes.
// The asset loader supplies a small hull; the sailing implementation is unchanged.
// Run from the repository (build output stays in ignored, external node_modules):
// node_modules/.bin/esbuild qa/ship-fields.test.ts --bundle --platform=node --format=esm --packages=external --outfile=node_modules/.cache/phaenomenautik-qa/ship-fields.test.mjs
// node --test "$PWD/node_modules/.cache/phaenomenautik-qa/ship-fields.test.mjs"
import assert from "node:assert/strict";
import { before, test } from "node:test";
import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { preloadAll } from "../src/three/assets";
import { Ship } from "../src/three/ship";
import { Water } from "../src/three/water";
import { WAVES_GLSL, waveHeight } from "../src/three/waves";
import type { ParticleSystem } from "../src/three/particles";
import { createFixedStepper } from "../src/game/fixedStep";
import { ROOMS, createOpenWorld, sampleFields, stepOpenWorld } from "../src/game/openWorld";
import { terrainHeight } from "../src/game/worldLayout";

type Field = NonNullable<Parameters<Ship["sailDt"]>[6]>;
const particles = { spawn() {} } as unknown as ParticleSystem;
const dt = 1 / 60;
const still = { forward: 0, turn: 0, turbo: false };
const sailing = { forward: 1, turn: 0, turbo: false };
const flatSea = () => 0;
const noFlow: Field = { windX: 0, windZ: -7, windSpeed: 7, currentX: 0, currentZ: 0, tide: 0 };

before(async () => {
  const original = GLTFLoader.prototype.loadAsync;
  const scene = new THREE.Group();
  scene.add(new THREE.Mesh(new THREE.BoxGeometry(4, 2, 15), new THREE.MeshStandardMaterial()));
  for (const name of ["BackSail", "Front_Sail", "MidleSail"]) {
    const sail = new THREE.Group();
    sail.name = name;
    scene.add(sail);
  }
  GLTFLoader.prototype.loadAsync = async () => ({ scene } as GLTF);
  try { await preloadAll(); } finally { GLTFLoader.prototype.loadAsync = original; }
});

function makeShip() {
  const ship = new Ship(new THREE.Scene());
  ship.setPose(2420, 3320, 0);
  return ship;
}

function integrate(ship: Ship, ticks: number, field: Field, input = sailing) {
  for (let i = 1; i <= ticks; i++) ship.sailDt(dt, i * dt, input, 0, particles, flatSea, field);
}

function close(actual: number, expected: number, tolerance = 1e-9, context = "") {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${context}: ${actual} != ${expected}`);
}

// Interpret coefficients emitted into the actual shader, rather than repeating
// the WAVES configuration or calling the CPU implementation as its own oracle.
// This verifies phase/vertical displacement at the undeformed vertex coordinate.
// It is not a WebGL image/float-precision or displaced-surface intersection test.
function shaderHeight(shader: string, x: number, z: number, time: number, amplitude: number) {
  const blocks = [...shader.matchAll(/vec2 d = normalize\(vec2\(([-\d.]+), ([-\d.]+)\)\);\s*float k = ([-\d.]+) \/ ([-\d.]+);\s*float a = ([-\d.]+) \* uStormAmp;[\s\S]*?float f = k \* dot\(d, p\) - t \* ([-\d.]+) \* k \* sqrt\(([-\d.]+) \/ k\) \* ([-\d.]+);/g)];
  assert.equal(blocks.length, 4, "all four emitted wave blocks are understood");
  return blocks.reduce((sum, match) => {
    const [dx, dz, circle, wavelength, a, speed, gravity, multiplier] = match.slice(1).map(Number);
    const length = Math.hypot(dx, dz);
    const k = circle / wavelength;
    const phase = k * (dx * x + dz * z) / length - time * speed * k * Math.sqrt(gravity / k) * multiplier;
    return sum + a * amplitude * Math.sin(phase);
  }, 0);
}

test("CPU wave height agrees with emitted GPU phase at world coordinates and storm amplitudes", () => {
  for (const [x, z] of [[0, 0], [2420, 3230], [2270, 3300], [1150, 3050], [4190, 4190]]) {
    for (const time of [0, 1 / 60, 60, 240]) {
      for (const amplitude of [0.75, 1, 2.25]) {
        close(waveHeight(x, z, time, amplitude), shaderHeight(WAVES_GLSL, x, z, time, amplitude), 0.0002, `wave ${x},${z} t=${time} a=${amplitude}`);
      }
    }
  }
});

test("Water publishes the same tide and storm amplitude to CPU hull sampling and its material", () => {
  const water = new Water(new THREE.Scene());
  const material = water.mesh.material as THREE.ShaderMaterial;
  for (const [storm, tide] of [[0, -0.42], [0.6, 0.32], [1, 0.42]]) {
    water.setEnvironment(storm, tide);
    close(material.uniforms.uTide.value, tide);
    close(material.uniforms.uStormAmp.value, water.stormAmp);
    close(water.heightAt(2420, 3230, 32), shaderHeight(material.vertexShader, 2420, 3230, 32, material.uniforms.uStormAmp.value) + tide, 0.0002);
  }
});

test("a sailing hull responds to wind direction and strength", () => {
  const tailwind = makeShip(), headwind = makeShip(), lightWind = makeShip();
  integrate(tailwind, 120, noFlow);
  integrate(headwind, 120, { ...noFlow, windZ: 7 });
  integrate(lightWind, 120, { ...noFlow, windZ: -2, windSpeed: 2 });
  assert.ok(tailwind.speed > headwind.speed * 1.5, "following wind materially improves progress");
  assert.ok(tailwind.speed > lightWind.speed * 1.5, "wind strength materially improves progress");
  assert.ok(tailwind.z < headwind.z && tailwind.z < lightWind.z, "speed changes world movement");
  const sail = tailwind.group.getObjectByName("Front_Sail")!;
  const crosswind = makeShip();
  integrate(crosswind, 60, { ...noFlow, windX: 7, windZ: 0 });
  assert.ok(Math.abs(crosswind.group.getObjectByName("Front_Sail")!.rotation.y - sail.rotation.y) > 0.2, "wind reaches the existing sail nodes");
});

test("current carries an unpowered hull and mooring holds a moving hull while water still moves", () => {
  const drift = makeShip();
  integrate(drift, 60, { ...noFlow, currentX: 0.8, currentZ: -0.35 }, still);
  close(drift.x, 2420.8, 1e-8);
  close(drift.z, 3319.65, 1e-8);
  const moored = makeShip();
  moored.speed = 12;
  moored.moored = true;
  const field = { ...noFlow, currentX: 0.8, currentZ: -0.35 };
  for (let i = 1; i <= 60; i++) moored.sailDt(dt, i * dt, sailing, 0, particles, () => i / 60, field);
  close(moored.x, 2420);
  close(moored.z, 3320);
  close(moored.heading, 0);
  assert.ok(moored.group.position.y > 0.5, "anchoring preserves vertical wave response");
});

test("the real hull samples bow, stern and both sides to follow a sloping water surface", () => {
  const ship = makeShip();
  const samples: [number, number][] = [];
  for (let i = 1; i <= 60; i++) {
    ship.sailDt(dt, i * dt, still, 0, particles, (x, z) => { samples.push([x, z]); return (x - 2420) * 0.12 + (z - 3320) * 0.16; }, noFlow);
  }
  assert.ok(samples.some(([x, z]) => z < ship.z - 4 && x === ship.x), "bow sample");
  assert.ok(samples.some(([x, z]) => z > ship.z + 4 && x === ship.x), "stern sample");
  assert.ok(samples.some(([x]) => x < ship.x - 2), "port sample");
  assert.ok(samples.some(([x]) => x > ship.x + 2), "starboard sample");
  assert.ok(Math.abs(ship.group.rotation.x) > 0.08 && Math.abs(ship.group.rotation.z) > 0.05, "water slope changes both hull axes");
});

test("30, 60 and 144 presentation frames produce the same 60 actual sailing ticks", () => {
  function run(frames: number) {
    const ship = makeShip();
    const state = createOpenWorld();
    const stepper = createFixedStepper();
    let ticks = 0;
    for (let frame = 0; frame < frames; frame++) {
      stepper.advance(1 / frames, (step) => {
        ticks++;
        stepOpenWorld(state, step);
        const field = sampleFields(state, ship.x, ship.z);
        ship.sailDt(step, state.seconds, { forward: 1, turn: 0.3, turbo: false }, 0, particles,
          (x, z) => waveHeight(x, z, state.seconds, 0.75 + field.storm * 1.5) + field.tide, field);
      });
    }
    return { ticks, seconds: state.seconds, x: ship.x, z: ship.z, speed: ship.speed, heading: ship.heading, height: ship.group.position.y, quaternion: ship.group.quaternion.toArray() };
  }
  const sixty = run(60);
  assert.equal(sixty.ticks, 60);
  assert.ok(Math.hypot(sixty.x - 2420, sixty.z - 3320) > 1, "sailing occurred");
  for (const frames of [30, 144]) assert.deepEqual(run(frames), sixty, `${frames}Hz presentation`);
});

test("all room arrivals have depth around the entire hull at the lowest tide", () => {
  for (const room of ROOMS) {
    for (const [dx, dz] of [[0, 0], [-3, -7.5], [3, -7.5], [-3, 7.5], [3, 7.5]]) {
      const floor = terrainHeight(room.arrivalX + dx, room.arrivalZ + dz);
      assert.ok(floor < -0.42 - 2.2, `${room.name}: arrival hull clears seabed at ${dx},${dz} (${floor} m)`);
    }
    const ship = makeShip();
    ship.setPose(room.arrivalX, room.arrivalZ, 0);
    const result = ship.sailDt(dt, dt, still, 0, particles, flatSea, { ...noFlow, tide: -0.42 });
    assert.equal(result.blocked, false, `${room.name}: real collision check accepts arrival`);
  }
});
