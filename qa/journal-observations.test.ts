import test from "node:test";
import assert from "node:assert/strict";
import { ROOMS, addObservation, compareObservations, createOpenWorld, ensureOpenWorld, isOpenWorldState, recordRoomAction, reviseObservation, sampleFields, setWorldTime, setWorldWeather, stepOpenWorld, type OpenWorldState } from "../src/game/openWorld.ts";
import { loadSave, newGame, parseImportedSave, persistSave } from "../src/game/state.ts";
import { handleProtectionKeyDown } from "../src/game/pause.ts";
import { initialHud, store } from "../src/game/store.ts";

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

test("comparison revisions survive reload and explicit import without rewriting observations", () => {
  data.clear(); loadSave();
  const save = newGame(), world = ensureOpenWorld(save);
  const a = addObservation(world, "bay", "Das Licht wirkt nah.");
  stepOpenWorld(world, 15);
  const b = addObservation(world, "harbor", "Der Blickort wirkt mit.");
  const observations = structuredClone(world.notes);
  compareObservations(world, a, b, "similar");
  const firstComparison = structuredClone(world.comparisons);
  compareObservations(world, b, a, "similar");
  assert.deepEqual(world.comparisons, firstComparison, "repeating a relationship in reversed order is a no-op");
  stepOpenWorld(world, 10);
  compareObservations(world, b, a, "contradicts");
  stepOpenWorld(world, 8);
  compareObservations(world, a, b, "open");
  assert.equal(world.comparisons?.length, 1);
  assert.deepEqual(world.comparisons?.[0].revisions, [{ at: 25, previous: "similar" }, { at: 33, previous: "contradicts" }]);
  assert.equal(world.comparisons?.[0].relation, "open");
  assert.deepEqual(world.notes, observations);
  assert.equal(persistSave(save), true);
  const restored = loadSave();
  assert.deepEqual(restored?.openWorld?.comparisons, world.comparisons);
  const previousStorage = data.get("phaenomenautik3-save-v1");
  const imported = parseImportedSave(JSON.stringify(save));
  assert.deepEqual(imported.openWorld?.comparisons, world.comparisons);
  assert.deepEqual(imported.openWorld?.notes, observations);
  assert.equal(data.get("phaenomenautik3-save-v1"), previousStorage);
  assert.equal(persistSave(imported), true);
  assert.deepEqual(loadSave()?.openWorld?.comparisons, world.comparisons);
});

test("old saves without comparisons import with an empty list and unchanged observations", () => {
  data.clear(); loadSave();
  const save = newGame(), world = ensureOpenWorld(save);
  addObservation(world, "shelter", "Ruhe ist gerade genug.");
  delete world.comparisons;
  const observations = structuredClone(world.notes);
  const imported = parseImportedSave(JSON.stringify(save));
  assert.deepEqual(imported.openWorld?.comparisons, []);
  assert.deepEqual(imported.openWorld?.notes, observations);
});

test("invalid comparison imports cannot replace the existing save", () => {
  data.clear(); loadSave();
  const save = newGame(), world = ensureOpenWorld(save);
  stepOpenWorld(world, 10);
  const a = addObservation(world, "bay");
  stepOpenWorld(world, 10);
  const b = addObservation(world, "harbor");
  stepOpenWorld(world, 10);
  compareObservations(world, a, b, "similar");
  stepOpenWorld(world, 20);
  assert.equal(persistSave(save), true);
  const previousStorage = data.get("phaenomenautik3-save-v1");
  const corruptions: [string, (state: OpenWorldState) => void][] = [
    ["missing note reference", (state) => { state.comparisons![0].a = "absent"; }],
    ["empty note reference", (state) => { state.comparisons![0].a = ""; }],
    ["future comparison", (state) => { state.comparisons![0].at = state.seconds + 1; }],
    ["negative revision", (state) => { state.comparisons![0].revisions = [{ at: -1, previous: "open" }]; }],
    ["reversed revision times", (state) => { state.comparisons![0].revisions = [{ at: 40, previous: "open" }, { at: 35, previous: "different" }]; }],
    ["duplicate unordered pair", (state) => { state.comparisons!.push({ ...state.comparisons![0], id: "second", a: b, b: a }); }],
    ["comparison before its notes", (state) => { state.comparisons![0].at = 15; }],
  ];
  for (const [name, corrupt] of corruptions) {
    const invalid = structuredClone(save);
    corrupt(invalid.openWorld!);
    assert.equal(isOpenWorldState(invalid.openWorld), false, name);
    assert.throws(() => parseImportedSave(JSON.stringify(invalid)), name);
    assert.equal(data.get("phaenomenautik3-save-v1"), previousStorage, name);
  }
});

function keyboardEvent(key = "Escape", repeat = false) {
  const calls = { prevented: false, stopped: false };
  const event = {
    key, repeat,
    preventDefault() { calls.prevented = true; },
    stopImmediatePropagation() { calls.stopped = true; },
  } as KeyboardEvent;
  return { event, calls };
}

test("Escape closes the journal before opening pause, including held-key repeats", () => {
  store.set({ ...initialHud, journalOpen: true });
  const { event, calls } = keyboardEvent();
  handleProtectionKeyDown(event);
  assert.equal(store.get().journalOpen, false);
  assert.equal(store.get().paused, false);
  assert.equal(store.get().protectionOpen, null);
  assert.deepEqual(calls, { prevented: true, stopped: true });
  handleProtectionKeyDown(keyboardEvent("Escape", true).event);
  assert.equal(store.get().protectionOpen, null, "holding Escape does not open a second panel");
  handleProtectionKeyDown(keyboardEvent().event);
  assert.equal(store.get().paused, true);
  assert.equal(store.get().protectionOpen, "pause", "a new Escape press still opens protection");
});

test("Escape in protection does not close an underlying journal or resume the world", () => {
  store.set({ ...initialHud, journalOpen: true, paused: true, protectionOpen: "help" });
  handleProtectionKeyDown(keyboardEvent().event);
  assert.equal(store.get().journalOpen, true);
  assert.equal(store.get().paused, true);
  assert.equal(store.get().protectionOpen, "pause");
});

test("journal Escape does not clear an independent pause, other keys remain untouched", () => {
  store.set({ ...initialHud, journalOpen: true, paused: true });
  const { event, calls } = keyboardEvent("j");
  handleProtectionKeyDown(event);
  assert.equal(store.get().journalOpen, true);
  assert.deepEqual(calls, { prevented: false, stopped: false });
  handleProtectionKeyDown(keyboardEvent().event);
  assert.equal(store.get().journalOpen, false);
  assert.equal(store.get().paused, true);
  assert.equal(store.get().protectionOpen, null);
});
