// Real Player and GameWorld methods with CPU scene fixtures. No WebGL or
// rendered HUD appearance is claimed by this suite; those require separate browser QA.
import assert from "node:assert/strict";
import { before, beforeEach, test } from "node:test";
import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { preloadAll } from "../src/three/assets";
import { Player } from "../src/three/player";
import { GameWorld } from "../src/three/world";
import type { ParticleSystem } from "../src/three/particles";
import { initialHud, store, type HudState } from "../src/game/store";
import { newGame, type SaveGame } from "../src/game/state";
import { createOpenWorld, sampleFields } from "../src/game/openWorld";

const dt = 1 / 60;
const particles = { spawn() {}, burst() {}, update() {} } as unknown as ParticleSystem;
Object.defineProperty(globalThis, "window", { value: { setTimeout() { return 0; } }, configurable: true });

before(async () => {
  const original = GLTFLoader.prototype.loadAsync;
  const scene = new THREE.Group();
  scene.add(new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshStandardMaterial()));
  GLTFLoader.prototype.loadAsync = async () => ({ scene, animations: [] } as unknown as GLTF);
  try { await preloadAll(); } finally { GLTFLoader.prototype.loadAsync = original; }
});
beforeEach(() => { store.set({ ...initialHud }); });

interface HookFixture {
  state: "idle" | "flying" | "attached";
  point: THREE.Vector3;
  vel: THREE.Vector3;
  line: THREE.Line;
  head: THREE.Mesh;
}
interface WorldFixture {
  selectTool(tool: HudState["tool"]): void;
  releaseHook(launch: boolean): void;
  updateHook(dt: number): void;
  simulate(dt: number): void;
  hook: HookFixture;
  player: Player;
  save: SaveGame;
  camera: THREE.PerspectiveCamera;
  compassTarget(): { x: number; z: number; name: string };
  groundAt(x: number, z: number): number;
  keys: Set<string>;
  hudTimer: number;
  staminaDelay: number;
}

function makeWorld(): WorldFixture {
  const player = new Player(new THREE.Scene());
  const save = newGame();
  const hook: HookFixture = {
    state: "attached", point: new THREE.Vector3(0, 35, 40), vel: new THREE.Vector3(),
    line: new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial()),
    head: new THREE.Mesh(new THREE.ConeGeometry(), new THREE.MeshStandardMaterial()),
  };
  const group = new THREE.Group();
  // Preserve the actual movement, hook, HUD and stamina methods. Scene modules
  // below are inert render adapters; Player remains the real controller.
  return Object.assign(Object.create(GameWorld.prototype), {
    save, player, hook, keys: new Set<string>(), scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(), particles,
    ship: { x: 0, z: 0, heading: 0, group, sailDt() {} },
    sky: { update() {} },
    water: { setEnvironment() {}, update() {}, heightAt: () => 0 },
    props: { collectDriftwood: () => 0, update() {}, colliders: [] },
    structures: { raftUnder: () => null, updateRafts() {}, updateDevices: () => ({ riding: null }) },
    loot: { update() {} },
    creatures: new Map(), enemies: [], npcs: { update() {} }, loreStones: { update() {} },
    beacon: { group: new THREE.Group(), setTarget() {}, update() {} }, rooms: { update() {} },
    presentation: null, currentPrompt: null, echoOrb: null, buildSession: null,
    elapsed: 0, hudTimer: 1, saveTimer: 0, staminaDelay: 0, attackCooldown: 0,
    fireBuffUntil: 0, fpsEma: 60,
    groundAt: () => 0, computePrompt() {}, updateSailCamera() {}, updateClouds() {},
    compassTarget: () => ({ x: 0, z: -100, name: "Norden" }),
  }) as WorldFixture;
}

for (const tool of ["axe", "shovel"] as const) {
  for (const state of ["flying", "attached"] as const) {
    test(`switching a ${state} hook to ${tool} removes the rope and stops its pull`, () => {
      const world = makeWorld();
      world.hook.state = state;
      world.player.place(0, 20, 0, 0);
      world.player.grounded = false;
      world.player.vel.set(2, -1, 3);
      const velocity = world.player.vel.clone();
      store.set({ tool: "hook" });
      world.selectTool(tool);
      assert.equal(store.get().tool, tool);
      assert.equal(world.hook.state, "idle");
      assert.equal(world.hook.line.visible, false);
      assert.equal(world.hook.head.visible, false);
      assert.equal(world.player.hookGlide, false, "tool selection does not launch a new glide");
      world.updateHook(dt);
      assert.deepEqual(world.player.vel, velocity, "no hidden rope acceleration follows tool selection");
    });
  }
}

test("selecting the hook again keeps an attached rope; a later explicit release carries momentum", () => {
  const world = makeWorld();
  world.player.place(0, 20, 0, 0);
  world.player.grounded = false;
  world.selectTool("hook");
  assert.equal(world.hook.state, "attached");
  assert.equal(world.hook.line.visible, true);
  world.releaseHook(true);
  assert.equal(world.hook.state, "idle");
  assert.equal(world.player.hookGlide, true);
  assert.equal(world.player.vel.y, 3.4);
  world.selectTool("axe");
  assert.equal(world.player.hookGlide, true, "an intentional airborne release survives later tool selection");
});

for (const hasGlider of [false, true]) {
  test(`hook momentum glides at zero stamina with crafted glider=${hasGlider}`, () => {
    const world = makeWorld();
    const player = world.player;
    player.place(0, 50, 0, 0);
    player.grounded = false;
    player.hasGlider = hasGlider;
    world.releaseHook(true);
    let drains = 0;
    const climb = { walls: [], drain() { drains++; return false; } };
    const input = { x: 0, z: 0, sprint: false, jump: true };
    for (let frame = 0; frame < 80; frame++) player.update(dt, input, () => 0, [], particles, climb);
    assert.equal(player.gliding, true);
    assert.equal(player.hookGlide, true);
    assert.equal(drains, 0);
    assert.ok(player.pos.y > 0);
  });
}

test("ordinary crafted gliding still drains stamina and stops when empty", () => {
  const player = makeWorld().player;
  player.place(0, 50, 0, 0);
  player.grounded = false;
  player.hasGlider = true;
  let stamina = 1, drains = 0;
  const climb = { walls: [], drain(rate: number, tick: number) { drains++; stamina = Math.max(0, stamina - rate * tick); return stamina > 0; } };
  const input = { x: 0, z: 0, sprint: false, jump: true };
  for (let frame = 0; frame < 60; frame++) player.update(dt, input, () => 0, [], particles, climb);
  assert.ok(drains > 0);
  assert.equal(stamina, 0);
  assert.equal(player.gliding, false);
});

test("the real world stamina bookkeeping preserves hook glide even with a crafted glider", () => {
  const world = makeWorld();
  world.save.mode = "onfoot";
  world.save.equipment.push("gleitschirm");
  world.save.player.stamina = 0;
  world.staminaDelay = 5; // Prevent regeneration from hiding an attempted drain.
  world.player.place(0, 50, 0, 0);
  world.player.grounded = false;
  world.player.hasGlider = true;
  world.releaseHook(true);
  world.keys.add(" ");
  for (let frame = 0; frame < 80; frame++) world.simulate(dt);
  assert.equal(world.player.gliding, true);
  assert.equal(world.save.player.stamina, 0);
  assert.ok(world.staminaDelay < 5 - 1, "hook glide did not invoke the stamina drain delay");
});

const normalizedDegrees = (angle: number) => ((angle * 180 / Math.PI) % 360 + 360) % 360;
const close = (actual: number, expected: number, label: string) => assert.ok(Math.abs(actual - expected) < 1e-7, `${label}: ${actual} != ${expected}`);

for (const [name, x, z, expected] of [["N", 0, -100, 0], ["O", 100, 0, 90], ["S", 0, 100, 180], ["W", -100, 0, 270]] as const) {
  test(`HUD bearing and actual camera direction agree on ${name}`, () => {
    const world = makeWorld();
    world.camera.lookAt(x, 0, z);
    world.compassTarget = () => ({ x, z, name });
    // Internal orbit angles deliberately disagree; the actual camera is authoritative.
    world.player.camYaw = 1.123;
    world.simulate(0);
    close(normalizedDegrees(store.get().targetBearing), expected, `${name} target`);
    close(normalizedDegrees(-store.get().compassYaw), expected, `${name} camera`);
  });
}

for (const seconds of [0, 260 * Math.PI * 1.5]) {
  test(`wind direction agrees with compass bearing in the ${seconds === 0 ? "southern" : "northern"} hemisphere`, () => {
    const world = makeWorld();
    world.save.openWorld = createOpenWorld();
    world.save.openWorld.seconds = seconds;
    world.simulate(0);
    const field = sampleFields(world.save.openWorld, 0, 0);
    const degrees = store.get().windDeg;
    const radians = degrees * Math.PI / 180;
    close(Math.sin(radians), field.windX / field.windSpeed, "east component of HUD wind");
    close(-Math.cos(radians), field.windZ / field.windSpeed, "north component of HUD wind");
    assert.ok(seconds === 0 ? degrees > 90 && degrees < 180 : degrees > 0 && degrees < 90);
    world.compassTarget = () => ({ x: field.windX * 100, z: field.windZ * 100, name: "Windziel" });
    world.hudTimer = 1;
    world.simulate(0);
    close(normalizedDegrees(store.get().targetBearing), degrees, "wind and compass share a north reference");
  });
}
