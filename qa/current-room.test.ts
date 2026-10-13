import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CURRENT_ROOM, ROOMS, addObservation, applyWorldAction, availableActions,
  createOpenWorld, ensureCurrentRoom, ensureOpenWorld, isOpenWorldState,
  recordRoomAction, sampleFields, setWorldWeather, stepOpenWorld,
} from "../src/game/openWorld";
import { createFixedStepper } from "../src/game/fixedStep";
import { terrainHeight } from "../src/game/worldLayout";

const dt = 1 / 60;
function close(actual: number, expected: number, tolerance = 1e-9) {
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);
}
function advance(state: ReturnType<typeof createOpenWorld>, seconds: number) {
  for (let i = 0; i < seconds * 60; i++) stepOpenWorld(state, dt);
}

test("the current room and all gate settings are available before any other encounter", () => {
  const state = createOpenWorld();
  assert.ok(ROOMS.some(room => room.id === "current"));
  const actions = availableActions(state, "current").map(action => action.id);
  for (const gate of [90, 0, 45, 90]) {
    assert.ok(actions.includes(`gate:${gate}`));
    applyWorldAction(state, "current", `gate:${gate}`);
    assert.equal(ensureCurrentRoom(state).gateAngle, gate);
  }
  assert.equal(state.notes.length, 0);
  assert.equal(state.harbor.task, "none");
  assert.equal(state.shelter.boundary, "quiet");
});

test("the gate deflects the existing local current without affecting other rooms", () => {
  const state = createOpenWorld();
  const original = sampleFields(state, CURRENT_ROOM.x, CURRENT_ROOM.z);
  const outside = ROOMS.filter(room => room.id !== "current").map(room => sampleFields(state, room.x, room.z));
  applyWorldAction(state, "current", "gate:45");
  const diagonal = sampleFields(state, CURRENT_ROOM.x, CURRENT_ROOM.z);
  close(diagonal.currentX, (original.currentX - original.currentZ) / Math.SQRT2);
  close(diagonal.currentZ, (original.currentX + original.currentZ) / Math.SQRT2);
  applyWorldAction(state, "current", "gate:90");
  const deflected = sampleFields(state, CURRENT_ROOM.x, CURRENT_ROOM.z);
  close(deflected.currentX, -original.currentZ);
  close(deflected.currentZ, original.currentX);
  assert.deepEqual(ROOMS.filter(room => room.id !== "current").map(room => sampleFields(state, room.x, room.z)), outside);
  for (const key of ["windSpeed", "windX", "windZ", "tide", "storm", "soundMask"] as const) assert.equal(deflected[key], original[key]);
  applyWorldAction(state, "current", "gate:0");
  assert.deepEqual(sampleFields(state, CURRENT_ROOM.x, CURRENT_ROOM.z), original);
});

test("the marker is advected by precisely the same sampled current as the boat", () => {
  const state = createOpenWorld();
  applyWorldAction(state, "current", "gate:45");
  const before = { ...ensureCurrentRoom(state).marker };
  const next = structuredClone(state);
  next.seconds += dt;
  const field = sampleFields(next, before.x, before.z);
  stepOpenWorld(state, dt);
  close(ensureCurrentRoom(state).marker.x, before.x + field.currentX * dt);
  close(ensureCurrentRoom(state).marker.z, before.z + field.currentZ * dt);
});

test("the marker continues away from the room and weather changes its trajectory", () => {
  const present = createOpenWorld(), away = createOpenWorld(), rainy = createOpenWorld();
  present.activeRoom = "current";
  away.activeRoom = "bay";
  setWorldWeather(present, "calm");
  setWorldWeather(away, "calm");
  setWorldWeather(rainy, "rain");
  for (const state of [present, away, rainy]) advance(state, 15);
  assert.deepEqual(present.current, away.current);
  assert.notDeepEqual(present.current?.marker, rainy.current?.marker);
  assert.equal(away.notes.length, 0);
});

test("a tether limits travel and a fixed reference never moves the marker", () => {
  const state = createOpenWorld();
  setWorldWeather(state, "rain");
  let reachedTether = false;
  for (let i = 0; i < 240 * 60; i++) {
    stepOpenWorld(state, dt);
    const marker = ensureCurrentRoom(state).marker;
    const distance = Math.hypot(marker.x - CURRENT_ROOM.anchorX, marker.z - CURRENT_ROOM.anchorZ);
    assert.ok(distance <= CURRENT_ROOM.tetherRadius + 1e-8);
    reachedTether ||= distance > CURRENT_ROOM.tetherRadius - 0.01;
  }
  assert.ok(reachedTether, "the test actually reached the tether");
  const before = structuredClone(state.current);
  applyWorldAction(state, "current", "reference");
  assert.deepEqual(state.current?.marker, before?.marker);
  assert.equal(state.current?.reference, true);
  assert.ok(isOpenWorldState(JSON.parse(JSON.stringify(state))));
});

test("only an explicit reset returns the marker without resetting weather, time or gate", () => {
  const state = ensureOpenWorld({ openWorld: createOpenWorld() });
  applyWorldAction(state, "current", "gate:90");
  applyWorldAction(state, "current", "reference");
  advance(state, 5);
  const before = structuredClone(state);
  ensureOpenWorld({ openWorld: state });
  stepOpenWorld(state, 0);
  assert.deepEqual(state, before);
  applyWorldAction(state, "current", "reset-marker");
  assert.deepEqual(state.current?.marker, { x: CURRENT_ROOM.anchorX, z: CURRENT_ROOM.anchorZ });
  assert.equal(state.current?.gateAngle, 90);
  assert.equal(state.current?.reference, true);
  assert.equal(state.seconds, before.seconds);
  assert.equal(state.weather, before.weather);
});

test("old saves migrate without losing their clock or observations; new state round-trips", () => {
  const legacy = createOpenWorld();
  advance(legacy, 3);
  addObservation(legacy, "bay", "Eine Vermutung");
  delete legacy.current;
  assert.ok(isOpenWorldState(legacy));
  const notes = structuredClone(legacy.notes), seconds = legacy.seconds;
  const save = { openWorld: legacy };
  const state = ensureOpenWorld(save);
  assert.equal(state.seconds, seconds);
  assert.deepEqual(state.notes, notes);
  applyWorldAction(state, "current", "gate:45");
  advance(state, 2);
  state.camera = { yaw: 0, pitch: 0.2, distance: 40, room: "current" };
  state.bay.knowledge.push({ at: state.seconds, room: "current", kind: "observation", source: "heard", fact: "Eine Schilderung vom Strömungsfeld." });
  const result = applyWorldAction(state, "current", "reference");
  recordRoomAction(state, "current", "reference", result);
  addObservation(state, "current", "Vielleicht lenkt das Tor die Boje.");
  const note = state.notes.at(-1)!;
  const snapshot = structuredClone(note.snapshot);
  advance(state, 2);
  assert.deepEqual(note.snapshot, snapshot, "later drift cannot rewrite the observation");
  assert.equal(note.snapshot?.configuration.gateAngle, 45);
  assert.equal(typeof note.snapshot?.configuration.currentX, "number");
  const imported = JSON.parse(JSON.stringify(state));
  assert.ok(isOpenWorldState(imported));
  assert.deepEqual(ensureOpenWorld({ openWorld: imported }), state);
});

test("malformed current state is rejected rather than silently reset on import", () => {
  for (const invalid of [
    null, {}, { gateAngle: 30 }, { gateAngle: "45" }, { reference: "yes" },
    { marker: { x: NaN, z: CURRENT_ROOM.anchorZ } },
    { marker: { x: CURRENT_ROOM.anchorX + CURRENT_ROOM.tetherRadius + 1, z: CURRENT_ROOM.anchorZ } },
  ]) {
    const state = createOpenWorld();
    const candidate = { ...state, current: invalid === null || Object.keys(invalid).length === 0 ? invalid : { ...state.current, ...invalid } };
    assert.equal(isOpenWorldState(candidate), false, JSON.stringify(invalid));
  }
});

test("30, 60 and 144 presentation frames advance one identical current-room state", () => {
  const run = (frames: number) => {
    const state = createOpenWorld();
    applyWorldAction(state, "current", "gate:45");
    const stepper = createFixedStepper();
    for (let i = 0; i < frames; i++) stepper.advance(1 / frames, step => stepOpenWorld(state, step));
    return state;
  };
  assert.deepEqual(run(30), run(60));
  assert.deepEqual(run(144), run(60));
});

test("the arrival hull and entire marker tether are in deep open water", () => {
  for (const [dx, dz] of [[0, 0], [-3, -7.5], [3, -7.5], [-3, 7.5], [3, 7.5]]) {
    assert.ok(terrainHeight(CURRENT_ROOM.arrivalX + dx, CURRENT_ROOM.arrivalZ + dz) < -2.62);
  }
  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 16) {
    const x = CURRENT_ROOM.anchorX + Math.cos(angle) * CURRENT_ROOM.tetherRadius;
    const z = CURRENT_ROOM.anchorZ + Math.sin(angle) * CURRENT_ROOM.tetherRadius;
    assert.ok(terrainHeight(x, z) < -2.62);
  }
});
