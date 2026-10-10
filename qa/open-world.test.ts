import test from "node:test";
import assert from "node:assert/strict";
import { ROOMS, createOpenWorld, ensureOpenWorld, stepOpenWorld, sampleFields, bayOptics, applyWorldAction, availableActions, addObservation, reviseObservation, isOpenWorldState, setWorldTime, setWorldWeather, type RoomId } from "../src/game/openWorld.ts";
import { createFixedStepper } from "../src/game/fixedStep.ts";
import { newGame, loadSave, persistSave, parseImportedSave } from "../src/game/state.ts";

const SAVE_KEY = "phaenomenautik3-save-v1";
const data = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", { value: {
  getItem: (key: string) => data.get(key) ?? null,
  setItem: (key: string, value: string) => { data.set(key, value); },
  removeItem: (key: string) => { data.delete(key); },
}, configurable: true });
const near = (a: number, b: number, epsilon = 1e-8) => assert.ok(Math.abs(a - b) < epsilon, `${a} and ${b} must agree`);

test("all six room orders preserve free actions and independent physical changes", () => {
  const orders: RoomId[][] = [["bay", "harbor", "shelter"], ["bay", "shelter", "harbor"], ["harbor", "bay", "shelter"], ["harbor", "shelter", "bay"], ["shelter", "bay", "harbor"], ["shelter", "harbor", "bay"]];
  for (const order of orders) {
    const s = createOpenWorld();
    for (const room of order) {
      assert.ok(availableActions(s, room).length > 0);
      if (room === "bay") applyWorldAction(s, room, "cover");
      if (room === "harbor") {
        applyWorldAction(s, room, "task-repair"); applyWorldAction(s, room, "choose-Mara"); applyWorldAction(s, room, "deliver");
      }
      if (room === "shelter") {
        applyWorldAction(s, room, "seat"); applyWorldAction(s, room, "path"); applyWorldAction(s, room, "invite");
      }
    }
    assert.equal(s.bay.covered, true);
    assert.deepEqual(s.harbor.inventory, { wood: 2, rope: 1 });
    assert.equal(s.shelter.boundary, "conversation");
    assert.equal(s.notes.length, 0, "reflection remains optional");
    assert.equal(isOpenWorldState(s), true);
    assert.equal(ROOMS.length, 3);
  }
});

test("fixed integration yields the same clock and coupled fields at 15, 30, 60 and 144 FPS", () => {
  const worlds = [15, 30, 60, 144].map((fps) => {
    const s = createOpenWorld(), fixed = createFixedStepper();
    for (let frame = 0; frame < fps * 60; frame++) fixed.advance(1 / fps, (dt) => stepOpenWorld(s, dt));
    return s;
  });
  for (const s of worlds) {
    near(s.seconds, 60); near(s.timeOfDay, worlds[0].timeOfDay); near(s.windAngle, worlds[0].windAngle);
    assert.deepEqual(sampleFields(s, 2420, 3230), sampleFields(worlds[0], 2420, 3230));
  }
  const sea = sampleFields(worlds[0], 2420, 3230), shelter = sampleFields(worlds[0], 1150, 3050);
  assert.ok(shelter.windSpeed < sea.windSpeed);
  assert.ok(shelter.soundMask < sea.soundMask);
  near(shelter.tide, sea.tide);
});

test("manual weather and daylight survive stepping without rewinding observation time", () => {
  const s = createOpenWorld();
  stepOpenWorld(s, 80); const before = s.seconds;
  setWorldWeather(s, "rain"); setWorldTime(s, 14);
  stepOpenWorld(s, 25);
  assert.equal(s.weather, "rain"); near(s.timeOfDay, 15); near(s.seconds, before + 25);
  assert.equal(bayOptics(s).lightAvailable, false);
  const restored = JSON.parse(JSON.stringify(s));
  assert.equal(isOpenWorldState(restored), true);
  stepOpenWorld(restored, 25);
  assert.equal(restored.weather, "rain"); near(restored.timeOfDay, 16);
  setWorldWeather(restored, null);
  assert.equal(restored.weatherOverride, null);
});

test("bay cover, reflector angle, observer position, reference and sunlight have distinct effects", () => {
  const s = createOpenWorld();
  assert.equal(bayOptics(s).visible, true);
  applyWorldAction(s, "bay", "cover");
  assert.equal(bayOptics(s).aligned, true); assert.equal(bayOptics(s).visible, false);
  applyWorldAction(s, "bay", "cover"); applyWorldAction(s, "bay", "rotate-right");
  assert.equal(bayOptics(s).visible, false);
  applyWorldAction(s, "bay", "rotate-left"); assert.equal(bayOptics(s).visible, true);
  applyWorldAction(s, "bay", "viewpoint"); assert.equal(bayOptics(s).visible, false);
  applyWorldAction(s, "bay", "rotate-right"); assert.equal(bayOptics(s).visible, true);
  assert.equal(bayOptics(s).referenceStable, false);
  applyWorldAction(s, "bay", "reference"); assert.equal(bayOptics(s).referenceStable, true);
  setWorldTime(s, 22); assert.equal(bayOptics(s).visible, false);
});

test("two bay observers keep different sight and heard testimony, with source and simulation time", () => {
  const s = createOpenWorld();
  const shoreAnswer = applyWorldAction(s, "bay", "ask-observer");
  assert.match(shoreAnswer, /erscheint ein Lichtfleck/);
  assert.equal(s.bay.offsetKnowledge.length, 0);
  const offsetAnswer = applyWorldAction(s, "bay", "ask-offset-observer");
  assert.match(offsetAnswer, /außerhalb/);
  assert.equal(s.bay.knowledge[0].source, "seen");
  stepOpenWorld(s, 1);
  applyWorldAction(s, "bay", "share-offset");
  assert.equal(s.bay.offsetKnowledge.at(-1)?.source, "heard");
  assert.equal(s.bay.offsetKnowledge.at(-1)?.at, 1);
  assert.equal(s.bay.knowledge.length, 1);
  const oldFact = s.bay.knowledge[0].fact;
  applyWorldAction(s, "bay", "cover");
  assert.equal(s.bay.knowledge[0].fact, oldFact, "unseen changes cannot silently rewrite a memory");
  applyWorldAction(s, "bay", "ask-observer");
  assert.match(s.bay.knowledge.at(-1)!.fact, /Abdeckung/);
});

test("harbor intention reaches only its spoken recipient; material transfer changes real stock", () => {
  const s = createOpenWorld();
  applyWorldAction(s, "harbor", "task-repair");
  assert.equal(s.harbor.knowledge.Mara.length, 0);
  applyWorldAction(s, "harbor", "tell-Mara");
  assert.equal(s.harbor.knowledge.Mara[0].source, "heard");
  assert.equal(s.harbor.knowledge.Tove.length, 0);
  assert.match(applyWorldAction(s, "harbor", "ask-Tove"), /noch keine Absicht/);
  applyWorldAction(s, "harbor", "task-supplies"); applyWorldAction(s, "harbor", "choose-Tove");
  assert.match(applyWorldAction(s, "harbor", "ask-Mara"), /Ausbesserung/);
  stepOpenWorld(s, 2); applyWorldAction(s, "harbor", "deliver");
  assert.deepEqual(s.harbor.inventory, { wood: 3, rope: 2 });
  assert.deepEqual(s.harbor.delivered, { wood: 1, rope: 0 });
  assert.equal(s.harbor.knowledge.Tove.at(-1)?.source, "seen");
  assert.equal(s.harbor.knowledge.Tove.at(-1)?.at, 2);
  assert.doesNotMatch(s.harbor.knowledge.Tove.at(-1)!.fact, /Vorrat/);
  applyWorldAction(s, "harbor", "undo-delivery");
  assert.deepEqual(s.harbor.inventory, { wood: 4, rope: 2 });
  assert.deepEqual(s.harbor.delivered, { wood: 0, rope: 0 });
  assert.equal(s.harbor.knowledge.Mara.length, 1, "physical reversal does not erase heard intent");
});

test("finite harbor materials cannot become negative or silently regenerate", () => {
  const s = createOpenWorld();
  applyWorldAction(s, "harbor", "task-repair"); applyWorldAction(s, "harbor", "choose-Mara");
  applyWorldAction(s, "harbor", "deliver"); applyWorldAction(s, "harbor", "deliver");
  assert.match(applyWorldAction(s, "harbor", "deliver"), /nicht genug/);
  stepOpenWorld(s, 100);
  assert.deepEqual(s.harbor.inventory, { wood: 0, rope: 0 });
  assert.deepEqual(s.harbor.delivered, { wood: 4, rope: 2 });
});

test("shelter conversation requires a current explicit invitation and respects changing conditions", () => {
  const s = createOpenWorld();
  assert.match(applyWorldAction(s, "shelter", "talk"), /Ruhe/);
  applyWorldAction(s, "shelter", "invite"); assert.equal(s.shelter.boundary, "quiet");
  applyWorldAction(s, "shelter", "seat"); applyWorldAction(s, "shelter", "path");
  assert.equal(s.shelter.invitation, false);
  assert.equal(s.shelter.boundary, "quiet", "a better arrangement is not automatic consent");
  applyWorldAction(s, "shelter", "invite"); assert.equal(s.shelter.boundary, "conversation");
  setWorldWeather(s, "rain"); assert.equal(s.shelter.boundary, "quiet");
  setWorldWeather(s, "calm"); stepOpenWorld(s, 1); assert.equal(s.shelter.boundary, "quiet");
  applyWorldAction(s, "shelter", "invite"); assert.equal(s.shelter.boundary, "conversation");
  applyWorldAction(s, "shelter", "withdraw"); assert.equal(s.shelter.invitation, false);
});

test("optional notes preserve factual snapshots and append interpretation revisions across persistence", () => {
  const s = createOpenWorld(), id = addObservation(s, "bay", "Das Licht hängt nur vom Spiegel ab.", "Was ändert der Wind?");
  const initial = [...s.notes[0].facts];
  stepOpenWorld(s, 50); applyWorldAction(s, "bay", "cover");
  reviseObservation(s, id, "Auch Abdeckung, Blickort und Sonne wirken mit.");
  assert.deepEqual(s.notes[0].facts, initial);
  assert.equal(s.notes[0].revisions[0].previous, "Das Licht hängt nur vom Spiegel ab.");
  assert.equal(s.notes[0].revisions[0].at, 50);
  const restored = JSON.parse(JSON.stringify(s));
  assert.equal(isOpenWorldState(restored), true); assert.deepEqual(restored.notes, s.notes);
  const oldSave: { timeOfDay: number; openWorld?: ReturnType<typeof createOpenWorld> } = { timeOfDay: 17 };
  near(ensureOpenWorld(oldSave).timeOfDay, 17);
  assert.equal(ensureOpenWorld(oldSave), oldSave.openWorld);
});

test("global weather and daylight actions affect the shared fields without moving the player to a room", () => {
  const s = createOpenWorld();
  stepOpenWorld(s, 17);
  for (const weather of ["calm", "breeze", "rain"] as const) {
    applyWorldAction(s, "bay", `weather:${weather}`);
    assert.equal(s.weather, weather);
    assert.equal(s.activeRoom, null);
    stepOpenWorld(s, 1);
    assert.equal(s.weather, weather);
  }
  for (const [name, hour] of [["dawn", 7], ["noon", 12], ["dusk", 18]] as const) {
    const seconds = s.seconds;
    applyWorldAction(s, "bay", `time:${name}`);
    near(s.timeOfDay, hour);
    assert.equal(s.seconds, seconds);
    assert.equal(s.activeRoom, null);
  }
});

test("legacy load keeps its existing play mode until the world is explicitly initialized", () => {
  data.clear(); loadSave();
  const legacy = newGame(); delete legacy.openWorld;
  data.set(SAVE_KEY, JSON.stringify(legacy));
  const restored = loadSave();
  assert.ok(restored);
  assert.equal(restored.openWorld, undefined);
  const imported = parseImportedSave(JSON.stringify(legacy));
  assert.ok(imported.openWorld);
  assert.equal(data.get(SAVE_KEY), JSON.stringify(legacy));
  data.clear(); loadSave();
});

test("explicit import validates state and preserves stale-tab and unreadable-save protection", () => {
  data.clear(); loadSave();
  const original = newGame(); original.playerName = "Seglerin";
  assert.equal(persistSave(original), true);
  const exportRaw = JSON.stringify(original), stored = data.get(SAVE_KEY);
  const imported = parseImportedSave(exportRaw);
  assert.equal(data.get(SAVE_KEY), stored, "parsing an import never writes storage");
  data.set(SAVE_KEY, JSON.stringify({ ...original, playerName: "Andere Sitzung" }));
  assert.equal(persistSave(imported), false);
  assert.equal(JSON.parse(data.get(SAVE_KEY)!).playerName, "Andere Sitzung");
  const valid = JSON.parse(exportRaw);
  valid.openWorld.harbor.inventory.wood = -1;
  assert.throws(() => parseImportedSave(JSON.stringify(valid)), /gültigen/);
  const invalidParcel = JSON.parse(exportRaw);
  invalidParcel.openWorld.harbor.lastDelivery = { wood: 2, rope: 1, recipient: "Mara", task: "repair", at: 0 };
  assert.throws(() => parseImportedSave(JSON.stringify(invalidParcel)), /gültigen/, "an imported parcel must not let an undo make delivered stock negative");
  const futureWitness = JSON.parse(exportRaw);
  futureWitness.openWorld.bay.knowledge = [{ at: 100, source: "seen", fact: "Licht" }];
  assert.throws(() => parseImportedSave(JSON.stringify(futureWitness)), /gültigen/);
  assert.throws(() => parseImportedSave(JSON.stringify({ ...original, ship: { x: "kaputt", z: 1, heading: 0 } })), /gültigen/);
  data.set(SAVE_KEY, "unlesbar"); loadSave();
  assert.throws(() => parseImportedSave(exportRaw), /zuerst geprüft/);
  assert.equal(data.get(SAVE_KEY), "unlesbar");
  data.clear(); loadSave();
});
