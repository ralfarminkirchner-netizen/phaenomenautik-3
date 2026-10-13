import test from "node:test";
import assert from "node:assert/strict";
import { applyWorldAction, ensureOpenWorld, stepOpenWorld, syncNpcMemory } from "../src/game/openWorld";
import { npcReply } from "../src/game/dialogAI";
import { NPCS } from "../src/game/npc";
import { loadSave, newGame, parseImportedSave, persistSave } from "../src/game/state";

const SAVE_KEY = "phaenomenautik3-save-v1";
const storage = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => { storage.set(key, value); },
    removeItem: (key: string) => { storage.delete(key); },
  },
});

function resetStorage() {
  storage.clear();
  loadSave();
}

const mara = NPCS.find(npc => npc.id === "mara")!;
const tove = NPCS.find(npc => npc.id === "tove")!;
const question = "Was erinnerst du über die Materialübergabe im Hafen?";

test("an existing browser save without npcMemory can resume, synchronize, save and reload", () => {
  resetStorage();
  const original = newGame();
  original.playerName = "Vorhandene Reise";
  original.materials = { stamm: 7, seil: 4, segeltuch: 2 };
  const world = ensureOpenWorld(original);
  stepOpenWorld(world, 78);
  applyWorldAction(world, "harbor", "task-repair");
  applyWorldAction(world, "harbor", "tell-Mara");
  const legacy = JSON.parse(JSON.stringify(original));
  delete legacy.npcMemory;
  const raw = JSON.stringify(legacy);
  storage.set(SAVE_KEY, raw);

  const unprepared = JSON.parse(raw);
  assert.doesNotThrow(() => syncNpcMemory(unprepared, unprepared.openWorld));
  assert.equal(unprepared.npcMemory.mara.met, true);
  assert.equal(unprepared.npcMemory.tove, undefined);

  // The old save is accepted through the ordinary startup path, not only import.
  const loaded = loadSave();
  assert.ok(loaded);
  assert.equal(storage.get(SAVE_KEY), raw, "loading never overwrites the old save");
  assert.deepEqual(loaded.npcMemory, {});
  assert.doesNotThrow(() => syncNpcMemory(loaded, ensureOpenWorld(loaded)));
  assert.deepEqual(loaded.npcMemory.mara, {
    met: true,
    topics: [world.harbor.knowledge.Mara[0].fact],
    favors: 0,
  });
  assert.equal(loaded.npcMemory.tove, undefined);
  assert.match(npcReply(mara, question, loaded, 0).text,
    /Erzählt \(gehört, Weltzeit 0:01:18 h, Werkhafen\)/);
  assert.equal(persistSave(loaded), true);
  const reloaded = loadSave();
  assert.ok(reloaded);
  assert.equal(reloaded.playerName, original.playerName);
  assert.deepEqual(reloaded.materials, original.materials);
  assert.deepEqual(reloaded.openWorld, original.openWorld);
  assert.deepEqual(reloaded.npcMemory, loaded.npcMemory);
  resetStorage();
});

test("Tove recalls distinct repeated deliveries after a retraction, with Mara outside and prior NPC memory intact", () => {
  resetStorage();
  const save = newGame();
  save.npcMemory.kaj = { met: true, topics: ["Frühere Schiffsnotiz"], favors: 3 };
  save.npcMemory.tove = { met: true, topics: ["Frühere Übungsnotiz"], favors: 2 };
  const world = ensureOpenWorld(save);
  applyWorldAction(world, "harbor", "task-supplies");
  applyWorldAction(world, "harbor", "choose-Tove");
  stepOpenWorld(world, 100);
  applyWorldAction(world, "harbor", "deliver");
  stepOpenWorld(world, 20);
  applyWorldAction(world, "harbor", "undo-delivery");
  stepOpenWorld(world, 20);
  applyWorldAction(world, "harbor", "deliver");
  syncNpcMemory(save, world);

  // The identical delivery fact must remain two separate timed events, even
  // though the compatibility topic list intentionally stores unique strings.
  const events = world.harbor.knowledge.Tove;
  assert.deepEqual(events.map(({ at, room, kind, source }) => ({ at, room, kind, source })), [
    { at: 100, room: "harbor", kind: "delivery", source: "seen" },
    { at: 120, room: "harbor", kind: "retraction", source: "seen" },
    { at: 140, room: "harbor", kind: "delivery", source: "seen" },
  ]);
  assert.equal(events[0].fact, events[2].fact);
  assert.deepEqual(world.harbor.knowledge.Mara, []);
  const answer = npcReply(tove, question, save, 0).text;
  const first = answer.indexOf("Übergabe (gesehen, Weltzeit 0:01:40 h, Werkhafen)");
  const withdrawal = answer.indexOf("Rücknahme (gesehen, Weltzeit 0:02:00 h, Werkhafen)");
  const second = answer.indexOf("Übergabe (gesehen, Weltzeit 0:02:20 h, Werkhafen)");
  assert.ok(first >= 0 && withdrawal > first && second > withdrawal, answer);
  assert.doesNotMatch(answer, /Erzählt \(/, "a delivery never invents an unspoken message");
  assert.match(npcReply(mara, question, save, 1).text, /nichts gehört oder gesehen/);
  assert.equal(save.npcMemory.mara, undefined);
  assert.deepEqual(save.npcMemory.kaj, { met: true, topics: ["Frühere Schiffsnotiz"], favors: 3 });
  assert.ok(save.npcMemory.tove.topics.includes("Frühere Übungsnotiz"));
  assert.equal(save.npcMemory.tove.favors, 2);

  assert.equal(persistSave(save), true);
  const loaded = loadSave()!;
  const imported = parseImportedSave(JSON.stringify(loaded));
  assert.equal(persistSave(imported), true);
  const restored = loadSave()!;
  assert.deepEqual(restored.openWorld!.harbor.knowledge.Tove, events);
  assert.equal(npcReply(tove, question, restored, 10).text, answer);
  assert.match(npcReply(mara, question, restored, 10).text, /nichts gehört oder gesehen/);
  assert.deepEqual(restored.npcMemory.kaj, save.npcMemory.kaj);
  resetStorage();
});

test("normal dialogue preserves unknown legacy event kind and place after import and browser reload", () => {
  resetStorage();
  const save = newGame();
  const world = ensureOpenWorld(save);
  world.harbor.knowledge.Mara = [
    { at: 65, source: "heard", fact: "Alte überlieferte Aussage" },
    { at: 90, room: "harbor", kind: "delivery", source: "seen", fact: "Neuere überlieferte Übergabe" },
  ];
  world.seconds = 90;
  const imported = parseImportedSave(JSON.stringify(save));
  syncNpcMemory(imported, imported.openWorld!);
  const answer = npcReply(mara, question, imported, 0).text;
  assert.match(answer, /Erinnert \(gehört, Weltzeit 0:01:05 h, Ort nicht überliefert\): „Alte überlieferte Aussage“/);
  assert.match(answer, /Übergabe \(gesehen, Weltzeit 0:01:30 h, Werkhafen\): „Neuere überlieferte Übergabe“/);
  assert.ok(answer.indexOf("Alte überlieferte Aussage") < answer.indexOf("Neuere überlieferte Übergabe"));
  assert.equal(imported.openWorld!.harbor.knowledge.Mara[0].kind, undefined);
  assert.equal(imported.openWorld!.harbor.knowledge.Mara[0].room, undefined);
  assert.equal(persistSave(imported), true);
  const reloaded = loadSave()!;
  assert.equal(npcReply(mara, question, reloaded, 7).text, answer);
  assert.deepEqual(reloaded.openWorld!.harbor.knowledge, world.harbor.knowledge);
  assert.equal(reloaded.npcMemory.tove, undefined);
  resetStorage();
});
