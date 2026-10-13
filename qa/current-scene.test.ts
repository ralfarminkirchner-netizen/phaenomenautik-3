// CPU scene checks; geometry is real, only the ship's asset loader is stubbed.
import assert from "node:assert/strict";
import { test } from "node:test";
import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { CURRENT_ROOM, applyWorldAction, createOpenWorld, ensureCurrentRoom, sampleFields, stepOpenWorld } from "../src/game/openWorld";
import { preloadAll } from "../src/three/assets";
import { PhenomenonRooms } from "../src/three/phenomenonRooms";
import type { ParticleSystem } from "../src/three/particles";
import { Ship } from "../src/three/ship";

const heightAt = (x: number, z: number, t: number) => x * 0.002 + z * 0.001 + Math.sin(t);
const close = (actual: number, expected: number) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);
const closeVector = (actual: THREE.Vector3, expected: THREE.Vector3) => {
  close(actual.x, expected.x);
  close(actual.y, expected.y);
  close(actual.z, expected.z);
};

function named(rooms: PhenomenonRooms, name: string) {
  const object = rooms.group.getObjectByName(name);
  assert.ok(object, name);
  return object;
}

test("visible marker follows the world position and local water height without advancing it", () => {
  const rooms = new PhenomenonRooms(new THREE.Scene());
  const state = createOpenWorld();
  try {
    for (let i = 0; i < 60; i++) stepOpenWorld(state, 1 / 60);
    const current = ensureCurrentRoom(state);
    const before = structuredClone(current);
    rooms.update(state, state.seconds, heightAt);
    closeVector(named(rooms, "Treibende Markierboje").position, new THREE.Vector3(
      current.marker.x, heightAt(current.marker.x, current.marker.z, state.seconds), current.marker.z,
    ));
    assert.deepEqual(current, before);
  } finally { rooms.dispose(); }
});

test("visible gate rotation and field rotation agree for every selectable angle", () => {
  const rooms = new PhenomenonRooms(new THREE.Scene());
  const state = createOpenWorld();
  const initial = sampleFields(state, CURRENT_ROOM.x, CURRENT_ROOM.z);
  const initialDirection = new THREE.Vector3(initial.currentX, 0, initial.currentZ);
  try {
    for (const angle of [0, 45, 90]) {
      applyWorldAction(state, "current", `gate:${angle}`);
      rooms.update(state, state.seconds, heightAt);
      const gate = named(rooms, "Leittor");
      const field = sampleFields(state, CURRENT_ROOM.x, CURRENT_ROOM.z);
      closeVector(initialDirection.clone().applyQuaternion(gate.quaternion), new THREE.Vector3(field.currentX, 0, field.currentZ));
      closeVector(gate.position, new THREE.Vector3(CURRENT_ROOM.x, heightAt(CURRENT_ROOM.x, CURRENT_ROOM.z, state.seconds), CURRENT_ROOM.z));
    }
  } finally { rooms.dispose(); }
});

test("fixed reference keeps its horizontal location while following the waves", () => {
  const rooms = new PhenomenonRooms(new THREE.Scene());
  const state = createOpenWorld();
  const reference = named(rooms, "Feste Vergleichsmarke");
  try {
    rooms.update(state, 0, heightAt);
    assert.equal(reference.visible, false);
    applyWorldAction(state, "current", "reference");
    applyWorldAction(state, "current", "gate:90");
    for (const time of [0.5, 1, 2]) {
      stepOpenWorld(state, 1 / 60);
      rooms.update(state, time, heightAt);
      assert.equal(reference.visible, true);
      closeVector(reference.position, new THREE.Vector3(CURRENT_ROOM.referenceX, heightAt(CURRENT_ROOM.referenceX, CURRENT_ROOM.referenceZ, time), CURRENT_ROOM.referenceZ));
    }
    applyWorldAction(state, "current", "reference");
    rooms.update(state, 3, heightAt);
    assert.equal(reference.visible, false);
    close(reference.position.x, CURRENT_ROOM.referenceX);
    close(reference.position.z, CURRENT_ROOM.referenceZ);
  } finally { rooms.dispose(); }
});

test("zero-length tether is hidden and finite, and an extended tether joins the endpoints", () => {
  const rooms = new PhenomenonRooms(new THREE.Scene());
  const state = createOpenWorld();
  const { currentTether: tether, currentAnchor: anchor } = rooms as unknown as {
    currentTether: THREE.Mesh;
    currentAnchor: THREE.Mesh;
  };
  const marker = named(rooms, "Treibende Markierboje");
  try {
    rooms.update(state, 0, heightAt);
    assert.equal(tether.visible, false);
    ensureCurrentRoom(state).marker.x += 12;
    ensureCurrentRoom(state).marker.z += 5;
    rooms.update(state, 1, heightAt);
    assert.equal(tether.visible, true);
    const direction = marker.position.clone().sub(anchor.position);
    close(tether.scale.y, direction.length());
    closeVector(new THREE.Vector3(0, 1, 0).applyQuaternion(tether.quaternion), direction.normalize());
    const midpoint = marker.position.clone().add(anchor.position).multiplyScalar(0.5);
    midpoint.y += 0.25;
    closeVector(tether.position, midpoint);
    applyWorldAction(state, "current", "reset-marker");
    rooms.update(state, 2, heightAt);
    assert.equal(tether.visible, false);
    close(tether.scale.y, 0);
    for (const number of [...tether.position.toArray(), ...tether.scale.toArray(), ...tether.quaternion.toArray()]) assert.ok(Number.isFinite(number));
  } finally { rooms.dispose(); }
});

test("dispose releases every unique scene geometry and material, including hidden reference meshes", () => {
  const scene = new THREE.Scene();
  const rooms = new PhenomenonRooms(scene);
  rooms.update(createOpenWorld(), 0, heightAt);
  assert.equal(named(rooms, "Feste Vergleichsmarke").visible, false);
  const resources = new Map<THREE.BufferGeometry | THREE.Material, number>();
  rooms.group.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    resources.set(object.geometry, 0);
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) resources.set(material, 0);
  });
  assert.ok(resources.size > 0);
  for (const resource of resources.keys()) resource.addEventListener("dispose", () => resources.set(resource, resources.get(resource)! + 1));
  rooms.dispose();
  assert.equal(rooms.group.parent, null);
  assert.ok(!scene.children.includes(rooms.group));
  for (const count of resources.values()) assert.equal(count, 1);
});

test("an unmoored real Ship follows the same gate-dependent current as the marker", async () => {
  const original = GLTFLoader.prototype.loadAsync;
  const hull = new THREE.Group();
  hull.add(new THREE.Mesh(new THREE.BoxGeometry(4, 2, 15), new THREE.MeshStandardMaterial()));
  for (const name of ["BackSail", "Front_Sail", "MidleSail"]) {
    const sail = new THREE.Group();
    sail.name = name;
    hull.add(sail);
  }
  GLTFLoader.prototype.loadAsync = async () => ({ scene: hull, animations: [] } as unknown as GLTF);
  try { await preloadAll(); } finally { GLTFLoader.prototype.loadAsync = original; }
  const particles = { spawn() {}, burst() {} } as unknown as ParticleSystem;
  const positions: THREE.Vector2[] = [];
  for (const angle of [0, 45, 90]) {
    const state = createOpenWorld();
    applyWorldAction(state, "current", `gate:${angle}`);
    const ship = new Ship(new THREE.Scene());
    ship.setPose(CURRENT_ROOM.anchorX, CURRENT_ROOM.anchorZ, 0);
    ship.moored = false;
    stepOpenWorld(state, 1 / 60);
    const field = sampleFields(state, ship.x, ship.z);
    const result = ship.sailDt(1 / 60, state.seconds, { forward: 0, turn: 0, turbo: false }, 0, particles, () => 0, field);
    assert.equal(result.blocked, false);
    close(ship.x, ensureCurrentRoom(state).marker.x);
    close(ship.z, ensureCurrentRoom(state).marker.z);
    positions.push(new THREE.Vector2(ship.x, ship.z));
  }
  assert.ok(positions[0].distanceTo(positions[1]) > 0.001);
  assert.ok(positions[1].distanceTo(positions[2]) > 0.001);
});
