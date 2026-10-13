import test from "node:test";
import assert from "node:assert/strict";
import { ROOMS, createOpenWorld, ensureOpenWorld, stepOpenWorld, sampleFields, bayOptics, applyWorldAction, availableActions, addObservation, reviseObservation, compareObservations, isOpenWorldState, setWorldTime, setWorldWeather, syncNpcMemory, knowledgeLine, type RoomId } from "../src/game/openWorld.ts";
import { createFixedStepper } from "../src/game/fixedStep.ts";
import { newGame, loadSave, persistSave, parseImportedSave } from "../src/game/state.ts";
import { npcReply } from "../src/game/dialogAI.ts";
import { NPCS } from "../src/game/npc.ts";

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
    assert.deepEqual(ROOMS.map(room => room.id), ["bay", "harbor", "shelter", "current"]);
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

test("import rejects malformed runtime collections before replacing the saved game, while retaining legacy defaults", () => {
  data.clear(); loadSave();
  const original = newGame();
  original.structures = [{ id: "bridge", type: "bruecke", x: 2270, z: 3300, yaw: 0, ex: 2275, ez: 3300, topY: 2 }];
  original.activeMeals = [{ name: "Mahlzeit", kind: "energie", magnitude: 0.2, expiresAt: 2000, crashAt: 2000, crashMagnitude: -0.1, crashExpiresAt: 3000 }];
  original.recentMicros = [{ micros: { B1: 4, calcium: 12 }, at: 1000 }];
  assert.equal(persistSave(original), true);
  const exported = JSON.stringify(original), stored = data.get(SAVE_KEY);
  const valid = parseImportedSave(exported);
  assert.deepEqual(valid.structures, original.structures);
  assert.deepEqual(valid.activeMeals, original.activeMeals);
  assert.deepEqual(valid.recentMicros, original.recentMicros);

  const malformed: [string, unknown][] = [
    ["structures", {}], ["structures", [null]], ["structures", [{ ...original.structures[0], type: "unknown" }]],
    ["structures", [{ ...original.structures[0], x: "2270" }]], ["structures", [{ ...original.structures[0], topY: "high" }]],
    ["activeMeals", {}], ["activeMeals", [null]], ["activeMeals", [{ ...original.activeMeals[0], kind: "unknown" }]],
    ["activeMeals", [{ ...original.activeMeals[0], expiresAt: "later" }]], ["activeMeals", [{ ...original.activeMeals[0], crashMagnitude: "low" }]],
    ["recentMicros", {}], ["recentMicros", [null]], ["recentMicros", [{ micros: null, at: 1000 }]],
    ["recentMicros", [{ micros: { B1: "four" }, at: 1000 }]], ["recentMicros", [{ micros: {}, at: -1 }]],
  ];
  for (const [field, value] of malformed) {
    const damaged = JSON.parse(exported); damaged[field] = value;
    assert.throws(() => parseImportedSave(JSON.stringify(damaged)), /gültigen/, field);
    assert.equal(data.get(SAVE_KEY), stored, "a rejected import must preserve the existing browser save");
  }
  const legacy = JSON.parse(exported);
  delete legacy.structures; delete legacy.activeMeals; delete legacy.recentMicros;
  const restored = parseImportedSave(JSON.stringify(legacy));
  assert.deepEqual(restored.structures, []);
  assert.deepEqual(restored.activeMeals, []);
  assert.deepEqual(restored.recentMicros, []);
  assert.equal(data.get(SAVE_KEY), stored);
  data.clear(); loadSave();
});

test("Mara and Tove remember only what reached them: message, delivery and retraction stay separate with place and time", () => {
  const s = createOpenWorld();
  stepOpenWorld(s, 5 * 60); // Welt läuft weiter, bevor im Hafen gesprochen wird
  applyWorldAction(s, "harbor", "task-repair");
  applyWorldAction(s, "harbor", "choose-Mara");
  applyWorldAction(s, "harbor", "tell-Mara");
  const told = s.harbor.knowledge.Mara[s.harbor.knowledge.Mara.length - 1];
  assert.equal(told.kind, "message");
  assert.equal(told.source, "heard");
  assert.equal(told.room, "harbor");
  assert.equal(told.at, s.seconds);
  assert.equal(s.harbor.knowledge.Tove.length, 0, "Tove war nicht im Gespräch");
  assert.match(applyWorldAction(s, "harbor", "ask-Tove"), /keine Absicht erzählt/);
  applyWorldAction(s, "harbor", "deliver");
  const delivered = s.harbor.knowledge.Mara[s.harbor.knowledge.Mara.length - 1];
  assert.equal(delivered.kind, "delivery");
  assert.equal(delivered.source, "seen");
  applyWorldAction(s, "harbor", "undo-delivery");
  const undone = s.harbor.knowledge.Mara[s.harbor.knowledge.Mara.length - 1];
  assert.equal(undone.kind, "retraction");
  // Die Folge bleibt in der Reihenfolge erhalten: Mitteilung → Ausführung → Rücknahme.
  assert.deepEqual(s.harbor.knowledge.Mara.map(e => e.kind), ["message", "delivery", "retraction"]);
  const recall = applyWorldAction(s, "harbor", "ask-Mara");
  assert.match(recall, /Mara erinnert sich an 3 Ereignisse/);
  assert.match(recall, /Erzählt \(gehört/);
  assert.match(recall, /Übergabe \(gesehen/);
  assert.match(recall, /Rücknahme \(gesehen/);
  assert.match(recall, /Werkhafen/);
  assert.match(recall, /Weltzeit 0:05/);
  assert.match(recall, /außerhalb/);
  // Jede Zeile trägt Art, Quelle, Zeit und Ort getrennt.
  for (const entry of s.harbor.knowledge.Mara) {
    const line = knowledgeLine(entry);
    assert.match(line, /^(Erzählt|Übergabe|Rücknahme|Beobachtet) \((gehört|gesehen), Weltzeit \d+:\d\d:\d\d h, /);
  }
  // Persistenz: Nach Speichern und erneutem Laden (Neuladen) bleibt das Wissen,
  // und Tove weiß ohne Übermittlung weiterhin nichts.
  assert.equal(isOpenWorldState(s), true);
  const restored = JSON.parse(JSON.stringify(s));
  assert.equal(isOpenWorldState(restored), true);
  assert.equal(restored.harbor.knowledge.Mara.length, 3);
  assert.equal(restored.harbor.knowledge.Tove.length, 0);
  assert.match(applyWorldAction(restored, "harbor", "ask-Mara"), /erinnert sich an 3 Ereignisse/);
  assert.match(applyWorldAction(restored, "harbor", "ask-Tove"), /keine Absicht erzählt/);
  // Alte Stände ohne Ort und Art bleiben gültig (fehlende Felder sind erlaubt).
  const legacy = JSON.parse(JSON.stringify(s));
  delete legacy.harbor.knowledge.Mara[0].room;
  delete legacy.harbor.knowledge.Mara[0].kind;
  assert.equal(isOpenWorldState(legacy), true);
});

test("harbor knowledge becomes the existing NPC memory: mara remembers, tove stays outside", () => {
  const s = createOpenWorld();
  applyWorldAction(s, "harbor", "task-repair");
  applyWorldAction(s, "harbor", "choose-Mara");
  applyWorldAction(s, "harbor", "tell-Mara");
  applyWorldAction(s, "harbor", "deliver");
  const save = newGame();
  assert.equal(save.npcMemory.mara, undefined);
  syncNpcMemory(save, s);
  assert.equal(save.npcMemory.mara.met, true);
  assert.equal(save.npcMemory.mara.topics.length, 2);
  assert.ok(save.npcMemory.mara.topics.some(t => /Ausbesserung des Stegs/.test(t)));
  assert.ok(save.npcMemory.mara.topics.some(t => /tatsächlich an Mara übergeben/.test(t)));
  assert.equal(save.npcMemory.tove, undefined, "Tove ohne Übermittlung: kein Eintrag, kein implizites Wissen");
  // Wiederholtes Synchronisieren verdoppelt die Themen nicht.
  syncNpcMemory(save, s);
  assert.equal(save.npcMemory.mara.topics.length, 2);
  // Die Reise trägt die Erinnerung: Export und erneuter Import bewahren sie.
  assert.equal(isOpenWorldState(s), true);
  const saveRaw = JSON.parse(JSON.stringify({ ...save, openWorld: JSON.parse(JSON.stringify(s)) }));
  syncNpcMemory(saveRaw, saveRaw.openWorld);
  assert.equal(saveRaw.npcMemory.mara.topics.length, 2);
  assert.equal(saveRaw.npcMemory.tove, undefined);
});

test("accepted legacy imports normalize NPC memory without losing valid topics or facts", () => {
  data.clear(); loadSave();
  const world = createOpenWorld();
  applyWorldAction(world, "harbor", "task-repair");
  applyWorldAction(world, "harbor", "tell-Mara");
  const priorTopics = ["flashback", ...Array.from({ length: 14 }, (_, i) => `earlier-topic-${i}`)];
  const cases: unknown[] = [undefined, null, 7, [],
    { mara: { met: true, topics: false, favors: null } },
    { mara: { met: true, topics: "Früher gehörte Aussage", favors: 3 } },
    { mara: { met: true, topics: [...priorTopics, null, 7], favors: 4 }, kaj: { met: true, topics: ["schiff"], favors: 2 } },
  ];
  for (const memory of cases) {
    const raw = { ...newGame(), openWorld: world, npcMemory: memory };
    const imported = parseImportedSave(JSON.stringify(raw));
    assert.ok(imported.npcMemory && !Array.isArray(imported.npcMemory));
    syncNpcMemory(imported, imported.openWorld!);
    assert.equal(imported.npcMemory.mara.met, true);
    assert.ok(imported.npcMemory.mara.topics.some(topic => /Ausbesserung des Stegs/.test(topic)));
    assert.equal(imported.npcMemory.tove, undefined);
    assert.ok(imported.npcMemory.mara.topics.every(topic => typeof topic === "string"));
    if (typeof memory === "object" && memory !== null && "kaj" in memory) {
      assert.deepEqual(imported.npcMemory.mara.topics.slice(0, priorTopics.length), priorTopics);
      assert.equal(imported.npcMemory.mara.favors, 4);
      assert.deepEqual(imported.npcMemory.kaj, { met: true, topics: ["schiff"], favors: 2 });
    }
    if (typeof memory === "object" && memory !== null && "mara" in memory &&
        typeof (memory as { mara: { topics: unknown } }).mara.topics === "string") {
      assert.ok(imported.npcMemory.mara.topics.includes("Früher gehörte Aussage"));
      assert.equal(imported.npcMemory.mara.favors, 3);
    }
  }
  // Sync is also safe before a legacy object has passed through prepareSave.
  const unprepared = { npcMemory: { mara: { topics: false } } };
  assert.doesNotThrow(() => syncNpcMemory(unprepared, world));
  data.clear(); loadSave();
});

test("normal NPC dialogue recalls only witnessed harbor events across save/load and export/import", () => {
  data.clear(); loadSave();
  const save = newGame();
  const world = ensureOpenWorld(save);
  stepOpenWorld(world, 300);
  applyWorldAction(world, "harbor", "task-repair");
  applyWorldAction(world, "harbor", "choose-Mara");
  applyWorldAction(world, "harbor", "tell-Mara");
  stepOpenWorld(world, 45);
  applyWorldAction(world, "harbor", "deliver");
  stepOpenWorld(world, 45);
  applyWorldAction(world, "harbor", "undo-delivery");
  // Selecting a recipient conveys neither a message nor a delivery.
  applyWorldAction(world, "harbor", "choose-Tove");
  save.npcMemory.mara = { met: true, topics: ["flashback"], favors: 2 };
  syncNpcMemory(save, world);
  const mara = NPCS.find(npc => npc.id === "mara")!;
  const tove = NPCS.find(npc => npc.id === "tove")!;
  const question = "Was weißt du über meine Materialübergabe im Hafen?";
  const remembered = npcReply(mara, question, save, 0).text;
  assert.match(remembered, /Erzählt \(gehört, Weltzeit 0:05:00 h, Werkhafen\)/);
  assert.match(remembered, /Übergabe \(gesehen, Weltzeit 0:05:45 h, Werkhafen\)/);
  assert.match(remembered, /Rücknahme \(gesehen, Weltzeit 0:06:30 h, Werkhafen\)/);
  assert.ok(remembered.indexOf("Erzählt (") < remembered.indexOf("Übergabe ("));
  assert.ok(remembered.indexOf("Übergabe (") < remembered.indexOf("Rücknahme ("));
  const beforeQuestion = JSON.stringify(save);
  assert.match(npcReply(tove, question, save, 0).text, /nichts gehört oder gesehen/);
  assert.equal(JSON.stringify(save), beforeQuestion, "Nichtwissen wird nicht als Fakt gespeichert");
  assert.equal(save.npcMemory.tove, undefined);
  assert.equal(persistSave(save), true);
  const reloaded = loadSave()!;
  assert.equal(npcReply(mara, question, reloaded, 8).text, remembered);
  // This is the same JSON serialization used by the existing save export.
  const exported = JSON.stringify(reloaded, null, 2);
  const imported = parseImportedSave(exported);
  assert.equal(persistSave(imported), true);
  const reopened = loadSave()!;
  assert.equal(npcReply(mara, question, reopened, 12).text, remembered);
  assert.match(npcReply(tove, question, reopened, 12).text, /nichts gehört oder gesehen/);
  assert.deepEqual(reopened.openWorld!.harbor.knowledge, world.harbor.knowledge);
  assert.deepEqual(reopened.openWorld!.harbor.inventory, world.harbor.inventory);
  assert.ok(reopened.npcMemory.mara.topics.includes("flashback"));
  assert.equal(reopened.npcMemory.mara.favors, 2);
  data.clear(); loadSave();
});

test("legacy harbor facts do not gain an invented event kind or place", () => {
  assert.match(knowledgeLine({ at: 60, source: "heard", fact: "Alte Aussage" }),
    /^Erinnert \(gehört, Weltzeit 0:01:00 h, Ort nicht überliefert\)/);
});


test("observation comparisons: selectable relation persists across reload and stays revisable", () => {
  const s = createOpenWorld();
  applyWorldAction(s, "bay", "cover");
  const idA = addObservation(s, "bay", "erste Deutung", "");
  stepOpenWorld(s, 30);
  applyWorldAction(s, "bay", "cover"); // Bedingung ändern
  const idB = addObservation(s, "bay", "zweite Deutung", "");
  assert.match(compareObservations(s, idA, idB, "similar"), /festgehalten/);
  assert.equal(s.comparisons?.length, 1);
  assert.equal(s.comparisons![0].relation, "similar");
  // Revidieren: frühere Beziehung bleibt erhalten, kein zweiter Eintrag.
  assert.match(compareObservations(s, idB, idA, "contradicts"), /revidiert/);
  assert.equal(s.comparisons?.length, 1);
  assert.equal(s.comparisons![0].relation, "contradicts");
  assert.deepEqual(s.comparisons![0].revisions.map((r) => r.previous), ["similar"]);
  // Ungültige Paare werden abgelehnt, ohne Zustand zu ändern.
  assert.match(compareObservations(s, idA, idA, "open"), /zwei verschiedene/);
  assert.match(compareObservations(s, idA, "unbekannt", "open"), /vorhanden/);
  assert.equal(s.comparisons?.length, 1);
  // Persistenz: Neuladen/Export/Import-Runde bewahrt Vergleich samt Revision.
  assert.equal(isOpenWorldState(s), true);
  const restored = JSON.parse(JSON.stringify(s));
  assert.equal(isOpenWorldState(restored), true);
  assert.equal(restored.comparisons.length, 1);
  assert.equal(restored.comparisons[0].relation, "contradicts");
  assert.equal(restored.comparisons[0].revisions.length, 1);
  // Alte Stände ohne Vergleichsliste bleiben gültig.
  const legacy = JSON.parse(JSON.stringify(s));
  delete legacy.comparisons;
  assert.equal(isOpenWorldState(legacy), true);
  // Malformed Vergleiche werden beim Import abgewiesen.
  const malformed = JSON.parse(JSON.stringify(s));
  malformed.comparisons = [{ id: "x", a: idA, b: idB, relation: "unmöglich", at: 1, revisions: [] }];
  assert.equal(isOpenWorldState(malformed), false);
});
