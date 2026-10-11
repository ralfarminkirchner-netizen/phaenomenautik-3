import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { applyWorldAction, createOpenWorld, ensureOpenWorld, isOpenWorldState, transferHarborMaterial } from "../src/game/openWorld";
import { HARBOR_PIER, PhenomenonRooms, harborPierHeightAt } from "../src/three/phenomenonRooms";
import { newGame, loadSave, persistSave, parseImportedSave } from "../src/game/state";
import { terrainHeight } from "../src/game/worldLayout";

const data = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", { value: {
  getItem: (key: string) => data.get(key) ?? null,
  setItem: (key: string, value: string) => { data.set(key, value); },
  removeItem: (key: string) => { data.delete(key); },
}, configurable: true });
const act = (s: ReturnType<typeof createOpenWorld>, action: string) => applyWorldAction(s, "harbor", action);

test("boat and harbor remain distinct finite stores with explicit two-way transfers", () => {
  const s = createOpenWorld(), materials = { stamm: 2, seil: 1, segeltuch: 3 };
  transferHarborMaterial(s, materials, "unload", "wood");
  assert.deepEqual(materials, { stamm: 1, seil: 1, segeltuch: 3 });
  assert.deepEqual(s.harbor.inventory, { wood: 5, rope: 2 });
  transferHarborMaterial(s, materials, "unload", "rope");
  assert.equal(materials.seil, 0); assert.equal(s.harbor.inventory.rope, 3);
  assert.match(transferHarborMaterial(s, materials, "unload", "rope"), /nicht genug/);
  transferHarborMaterial(s, materials, "load", "wood", 2);
  assert.equal(materials.stamm, 3); assert.equal(s.harbor.inventory.wood, 3);
  transferHarborMaterial(s, materials, "load", "rope");
  assert.equal(materials.seil, 1); assert.equal(s.harbor.inventory.rope, 2);
  assert.deepEqual(s.harbor.delivered, { wood: 0, rope: 0 });
  assert.equal(s.harbor.knowledge.Mara.length, 0);
  const before = JSON.stringify({ s, materials });
  for (const quantity of [0, -1, 0.5, NaN, Infinity]) transferHarborMaterial(s, materials, "unload", "wood", quantity);
  assert.equal(JSON.stringify({ s, materials }), before);
});

test("only a recipient's actual repair parcel can close the gap, consumed exactly once", () => {
  const s = createOpenWorld();
  act(s, "task-repair"); act(s, "choose-Mara"); act(s, "tell-Mara");
  assert.match(act(s, "repair-pier"), /fehlt/);
  assert.equal(s.harbor.pierRepair, null);
  act(s, "deliver"); act(s, "choose-Tove");
  assert.match(act(s, "repair-pier"), /gewählte Empfängerin/);
  act(s, "choose-Mara"); act(s, "repair-pier");
  assert.equal(s.harbor.pierRepair?.recipient, "Mara");
  assert.deepEqual(s.harbor.inventory, { wood: 2, rope: 1 });
  assert.deepEqual(s.harbor.delivered, { wood: 0, rope: 0 });
  assert.equal(s.harbor.deliveries?.[0].status, "consumed");
  assert.equal(s.harbor.knowledge.Tove.length, 0);
  const stock = JSON.stringify(s.harbor);
  assert.match(act(s, "repair-pier"), /bereits/);
  assert.match(act(s, "undo-delivery"), /bereits im Steg verbaut/);
  assert.equal(JSON.stringify(s.harbor), stock);
  assert.equal(isOpenWorldState(s), true);
});

for (const material of ["wood", "rope"] as const) {
  test(`a full ${material} store rejects return atomically until room is made, then returns once`, () => {
    const s = createOpenWorld(), materials = { stamm: 2, seil: 1 };
    const quantity = material === "wood" ? 2 : 1;
    s.harbor.inventory[material] = 10000;
    act(s, "task-repair"); act(s, "choose-Mara"); act(s, "deliver");
    transferHarborMaterial(s, materials, "unload", material, quantity);
    assert.equal(s.harbor.inventory[material], 10000);
    const beforeRejection = structuredClone(s), boatBefore = { ...materials };
    assert.match(act(s, "undo-delivery"), /nicht genug Platz/);
    assert.deepEqual(s, beforeRejection);
    assert.deepEqual(materials, boatBefore);
    assert.equal(isOpenWorldState(s), true);

    transferHarborMaterial(s, materials, "load", material, quantity);
    act(s, "undo-delivery");
    assert.equal(s.harbor.inventory[material], 10000);
    assert.deepEqual(s.harbor.delivered, { wood: 0, rope: 0 });
    assert.equal(s.harbor.deliveries?.[0].status, "returned");
    assert.equal(s.harbor.lastDelivery, null);
    assert.equal(isOpenWorldState(s), true);
    const afterReturn = structuredClone(s);
    act(s, "undo-delivery");
    assert.deepEqual(s, afterReturn);
  });
}

test("supplies do not become repair material; undone parcels cannot be consumed", () => {
  const s = createOpenWorld();
  act(s, "task-supplies"); act(s, "choose-Mara"); act(s, "deliver"); act(s, "deliver");
  assert.match(act(s, "repair-pier"), /fehlt/);
  act(s, "task-repair"); act(s, "deliver"); act(s, "undo-delivery");
  assert.equal(s.harbor.deliveries?.at(-1)?.status, "returned");
  assert.match(act(s, "repair-pier"), /fehlt/);
  assert.deepEqual(s.harbor.inventory, { wood: 2, rope: 2 });
  assert.deepEqual(s.harbor.delivered, { wood: 2, rope: 0 });
  assert.equal(isOpenWorldState(s), true);
});

test("legacy aggregate remains intact and acquires only the proven last parcel", () => {
  const s = createOpenWorld();
  s.harbor.delivered = { wood: 5, rope: 3 };
  s.harbor.lastDelivery = { wood: 1, rope: 0, recipient: "Tove", task: "supplies", at: 0 };
  assert.equal(isOpenWorldState(s), true);
  ensureOpenWorld({ openWorld: s });
  assert.deepEqual(s.harbor.delivered, { wood: 5, rope: 3 });
  assert.equal(s.harbor.deliveries?.length, 1);
  assert.match(act(s, "repair-pier"), /fehlt/, "unproven old aggregate cannot imply a repair purpose");
  act(s, "undo-delivery");
  assert.deepEqual(s.harbor.delivered, { wood: 4, rope: 3 });
  assert.deepEqual(s.harbor.inventory, { wood: 5, rope: 2 });
  assert.equal(isOpenWorldState(s), true);
});

test("reload and the real import parser preserve inventories, receipt and built section", () => {
  const save = newGame("Materialreise"), s = ensureOpenWorld(save);
  applyWorldAction(s, "harbor", "unload-wood", save.materials);
  act(s, "task-repair"); act(s, "choose-Mara"); act(s, "deliver"); act(s, "repair-pier");
  assert.equal(persistSave(save), true);
  const loaded = loadSave()!;
  assert.deepEqual(loaded.materials, save.materials);
  assert.deepEqual(loaded.openWorld?.harbor, s.harbor);
  const imported = parseImportedSave(JSON.stringify(loaded));
  assert.deepEqual(imported.materials, loaded.materials);
  assert.deepEqual(imported.openWorld?.harbor, loaded.openWorld?.harbor);
  assert.equal(isOpenWorldState(imported.openWorld), true);
});

test("receipt inconsistencies and material duplication are rejected on import validation", () => {
  const s = createOpenWorld();
  act(s, "task-repair"); act(s, "choose-Mara"); act(s, "deliver"); act(s, "repair-pier");
  for (const corrupt of [
    (copy: typeof s) => { copy.harbor.pierRepair!.recipient = "Tove"; },
    (copy: typeof s) => { copy.harbor.deliveries![0].status = "available"; },
    (copy: typeof s) => { copy.harbor.pierRepair!.deliveryId = 9; },
    (copy: typeof s) => { copy.harbor.pierRepair = null; },
    (copy: typeof s) => { copy.harbor.deliveries!.push({ ...copy.harbor.deliveries![0] }); },
  ]) {
    const copy = structuredClone(s); corrupt(copy);
    assert.equal(isOpenWorldState(copy), false);
  }
});

test("visible replacement planks and walkable deck change at the identical repaired bounds", () => {
  const s = createOpenWorld(), scene = new THREE.Scene(), rooms = new PhenomenonRooms(scene);
  const x = HARBOR_PIER.x + 11, z = HARBOR_PIER.z;
  assert.equal(harborPierHeightAt(s, x, z), null);
  assert.notEqual(harborPierHeightAt(s, HARBOR_PIER.x + 8, z), null);
  act(s, "task-repair"); act(s, "choose-Mara"); act(s, "deliver"); act(s, "repair-pier");
  rooms.update(s, 0, () => 0);
  const height = harborPierHeightAt(s, x, z)!;
  assert.ok(Number.isFinite(height));
  assert.ok(height > terrainHeight(x, z), "the repaired deck stays above underlying terrain");
  assert.equal(harborPierHeightAt(s, HARBOR_PIER.x + 12.6, z), null);
  assert.equal(harborPierHeightAt(s, x, z + 5.5), null);
  const planks = scene.getObjectByName("Ausgebesserter Stegabschnitt")!;
  assert.equal(planks.visible, true);
  assert.equal(planks.children.length, 12);
  scene.updateMatrixWorld(true);
  const mesh = planks.children[5] as THREE.Mesh;
  const bounds = new THREE.Box3().setFromObject(mesh);
  assert.ok(Math.abs(bounds.max.y - height) < 1e-6);
  assert.equal(scene.getObjectByName("Beschädigter Stegabschnitt")?.visible, false);
  rooms.dispose();
});
