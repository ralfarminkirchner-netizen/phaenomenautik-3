import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { claimDigSpot } from "../src/game/digging";
import { ensureOpenWorld, stepOpenWorld } from "../src/game/openWorld";
import { loadSave, newGame, parseImportedSave, persistSave, type SaveGame } from "../src/game/state";
import { GameWorld } from "../src/three/world";

const SAVE_KEY = "phaenomenautik3-save-v1";
const data = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
  getItem: (key: string) => data.get(key) ?? null,
  setItem: (key: string, value: string) => { data.set(key, value); },
  removeItem: (key: string) => { data.delete(key); },
} });
// UI toast timers are irrelevant here; reward/save must not await any timer.
Object.defineProperty(globalThis, "window", { configurable: true, value: { setTimeout: () => 0 } });
beforeEach(() => { data.clear(); loadSave(); });

test("older saves without dig reservations load, import and start their first reservation", () => {
  const legacy = newGame();
  delete legacy.dugSpots;
  data.set(SAVE_KEY, JSON.stringify(legacy));
  const loaded = loadSave()!;
  assert.ok(loaded);
  assert.equal(claimDigSpot(loaded, 12, -9), true);
  assert.deepEqual(loaded.dugSpots, { "4:-3": 0 });
  assert.equal(persistSave(loaded), true);
  assert.equal(claimDigSpot(parseImportedSave(JSON.stringify(loaded)), 12, -9), false);
});

test("reservations survive real persistence, reload, export/import and simulation pauses", () => {
  const save = newGame();
  stepOpenWorld(ensureOpenWorld(save), 120);
  assert.equal(claimDigSpot(save, 12, -9), true);
  assert.equal(persistSave(save), true);
  const loaded = loadSave()!;
  assert.equal(loaded.openWorld!.seconds, 120);
  assert.equal(claimDigSpot(loaded, 12.2, -8.8), false, "same rounded cell");
  assert.equal(claimDigSpot(loaded, 15, -9), true, "another cell remains available");
  const imported = parseImportedSave(JSON.stringify(loaded));
  assert.equal(claimDigSpot(imported, 12, -9), false);
  stepOpenWorld(imported.openWorld!, 89.999);
  assert.equal(claimDigSpot(imported, 12, -9), false);
  stepOpenWorld(imported.openWorld!, 0.001);
  assert.equal(claimDigSpot(imported, 12, -9), true, "90 simulation seconds expire the reservation");
  assert.deepEqual(imported.dugSpots, { "4:-3": 210 }, "expired cells are removed");
});

test("malformed reservation imports are rejected without changing the saved journey", () => {
  const save = newGame();
  assert.equal(persistSave(save), true);
  const original = data.get(SAVE_KEY);
  for (const dugSpots of [null, [], { "4:-3": -1 }, { "4:-3": "120" }, { "not-a-cell": 120 }]) {
    assert.throws(() => parseImportedSave(JSON.stringify({ ...save, dugSpots })), /gültigen/);
    assert.equal(data.get(SAVE_KEY), original);
  }
});

interface DigWorld {
  dig(): void;
  attackCooldown: number;
}
function digWorld(save: SaveGame): DigWorld {
  // Invoke the real action without constructing WebGL. Only rendering/audio/UI
  // surroundings are inert; the save/reward/cooldown implementation is real.
  return Object.assign(Object.create(GameWorld.prototype), {
    save, elapsed: ensureOpenWorld(save).seconds, disposed: false,
    attackCooldown: 0, dugSpots: new Map(),
    player: { pos: { x: 12, z: -9 }, grounded: true, climbing: false, facing: 0, swing() {} },
    groundAt: () => 1,
    particles: { burst() {} },
    persist: () => persistSave(save),
  });
}

test("the real dig action checkpoints its reward and reservation together before reload", () => {
  const random = Math.random;
  Math.random = () => 0; // deterministic wood find
  try {
    const save = newGame(), wood = save.wood, driftwood = save.driftwood;
    const world = digWorld(save);
    world.dig();
    assert.equal(save.wood, wood + 1);
    assert.equal(save.driftwood, driftwood + 1);
    const loaded = loadSave()!;
    assert.ok(loaded, "dig writes immediately, before any delayed callback");
    assert.equal(loaded.wood, wood + 1);
    assert.deepEqual(loaded.dugSpots, { "4:-3": 0 });
    const rebuilt = digWorld(loaded);
    rebuilt.dig();
    assert.equal(loaded.wood, wood + 1, "reconstruction cannot farm the same cell");
    assert.equal(rebuilt.attackCooldown, 0, "blocked dig does not start an attack");
    stepOpenWorld(loaded.openWorld!, 90);
    rebuilt.dig();
    assert.equal(loaded.wood, wood + 2);
    assert.equal(loadSave()!.wood, wood + 2);
  } finally { Math.random = random; }
});

test("the real dig action leaves water, airborne and busy attempts unreserved", () => {
  for (const patch of [
    { groundAt: () => 0 },
    { player: { pos: { x: 12, z: -9 }, grounded: false, climbing: false } },
    { player: { pos: { x: 12, z: -9 }, grounded: true, climbing: true } },
    { attackCooldown: 0.1 },
  ]) {
    const save = newGame(), world = Object.assign(digWorld(save), patch);
    world.dig();
    assert.deepEqual(save.dugSpots, {});
    assert.equal(save.wood, 2);
    assert.equal(data.get(SAVE_KEY), undefined);
  }
});
