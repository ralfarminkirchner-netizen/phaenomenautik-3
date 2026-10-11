import test from "node:test";
import assert from "node:assert/strict";
import { ROOMS, addObservation, createOpenWorld, ensureOpenWorld, isOpenWorldState, recordRoomAction, reviseObservation, sampleFields, setWorldTime, setWorldWeather, stepOpenWorld } from "../src/game/openWorld.ts";
import { loadSave, newGame, parseImportedSave, persistSave } from "../src/game/state.ts";

const data = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", { value: {
  getItem: (key: string) => data.get(key) ?? null,
  setItem: (key: string, value: string) => { data.set(key, value); },
  removeItem: (key: string) => { data.delete(key); },
}, configurable: true });

test("a captured situation stays historical through world changes, revision, reload and explicit import", () => {
  data.clear(); loadSave();
  const save = newGame(), world = ensureOpenWorld(save);
  stepOpenWorld(world, 40); setWorldTime(world, 18); setWorldWeather(world, "rain");
  world.bay.reflectorAngle = 90; world.bay.covered = true;
  recordRoomAction(world, "bay", "cover", "Der Spiegel ist abgedeckt.");
  const place = ROOMS.find((room) => room.id === "bay")!, fields = sampleFields(world, place.x, place.z);
  const id = addObservation(world, "bay", "Das Licht kommt nur vom Spiegel.", "Was ändert der Wind?");
  const captured = structuredClone(world.notes[0]);
  assert.deepEqual(captured.snapshot, {
    timeOfDay: 18, weather: "rain", wind: { x: fields.windX, z: fields.windZ, speed: fields.windSpeed },
    tide: fields.tide, visibility: fields.visibility,
    configuration: { reflectorAngle: 90, covered: true, reference: false, viewpoint: "shore" },
    action: { room: "bay", at: 40, action: "cover", outcome: "Der Spiegel ist abgedeckt." },
  });
  stepOpenWorld(world, 60); setWorldTime(world, 12); setWorldWeather(world, "calm");
  world.bay.reflectorAngle = 180; world.bay.covered = false;
  recordRoomAction(world, "bay", "uncover", "Der Spiegel ist offen.");
  reviseObservation(world, id, "Auch Blickort, Wind und Sonne wirken mit.");
  assert.deepEqual(world.notes[0].facts, captured.facts);
  assert.deepEqual(world.notes[0].snapshot, captured.snapshot, "room configuration and last action must be detached from live state");
  assert.deepEqual(world.notes[0].revisions, [{ at: 100, previous: captured.interpretation, text: world.notes[0].interpretation }]);
  assert.equal(persistSave(save), true);
  const restored = loadSave();
  assert.deepEqual(restored?.openWorld?.notes, world.notes);
  const previousStorage = data.get("phaenomenautik3-save-v1");
  const imported = parseImportedSave(JSON.stringify(save));
  assert.deepEqual(imported.openWorld?.notes, world.notes);
  assert.equal(data.get("phaenomenautik3-save-v1"), previousStorage, "previewing an import must not rewrite the saved game");
});

test("old observations remain importable without filling missing history from today's world", () => {
  data.clear(); loadSave();
  const save = newGame(), world = ensureOpenWorld(save);
  const id = addObservation(world, "shelter", "Ich möchte Abstand.");
  delete world.notes[0].snapshot;
  stepOpenWorld(world, 30); setWorldWeather(world, "rain");
  reviseObservation(world, id, "Heute möchte ich ein Gespräch.");
  const historicalNote = structuredClone(world.notes[0]);
  assert.equal(isOpenWorldState(world), true);
  const imported = parseImportedSave(JSON.stringify(save));
  assert.deepEqual(imported.openWorld?.notes[0], historicalNote);
  assert.equal(imported.openWorld?.notes[0].snapshot, undefined);
});

test("import rejects malformed snapshots and actions that postdate or belong to another room", () => {
  const world = createOpenWorld();
  stepOpenWorld(world, 10);
  recordRoomAction(world, "bay", "cover", "Der Spiegel ist abgedeckt.");
  addObservation(world, "bay");
  stepOpenWorld(world, 20);
  const corruptions = [
    (entry: any) => { entry.snapshot.wind.speed = -1; },
    (entry: any) => { entry.snapshot.weather = "unknown"; },
    (entry: any) => { entry.snapshot.configuration.covered = {}; },
    (entry: any) => { entry.snapshot.action.at = 20; },
    (entry: any) => { entry.snapshot.action.room = "shelter"; },
  ];
  for (const corrupt of corruptions) {
    const imported = JSON.parse(JSON.stringify(world));
    corrupt(imported.notes[0]);
    assert.equal(isOpenWorldState(imported), false);
  }
  recordRoomAction(world, "shelter", "seat", "Die Sitzrichtung ist verändert.");
  addObservation(world, "harbor");
  assert.equal(world.notes[1].snapshot?.action, null, "a different room's action cannot be attributed to this observation");
  assert.equal(isOpenWorldState(world), true);
});
