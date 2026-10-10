// PHÄNOMENAUTIK 3 — Runtime: hält die GameWorld-Instanz (außerhalb von React-Render)

import { GameWorld, type PresentationMode } from "../three/world";
import type { SaveGame } from "./state";

let world: GameWorld | null = null;
let generation = 0;
let pending: { generation: number; promise: Promise<GameWorld> } | null = null;

export function startWorld(container: HTMLElement, save: SaveGame, presentation: PresentationMode | null = null): Promise<GameWorld> {
  if (world) return Promise.resolve(world);
  if (pending) return pending.promise;
  const requestGeneration = ++generation;
  const promise = GameWorld.create(container, save, () => generation === requestGeneration, presentation)
    .then(created => {
      if (generation !== requestGeneration) {
        created.dispose(false);
        throw new DOMException("World loading cancelled", "AbortError");
      }
      world = created;
      // QA-Hook (Playwright-Screenshots & Debugging)
      (window as unknown as { __game: GameWorld }).__game = created;
      return created;
    })
    .finally(() => {
      if (pending?.generation === requestGeneration) pending = null;
    });
  pending = { generation: requestGeneration, promise };
  return promise;
}

export function getWorld(): GameWorld | null {
  return world;
}

export function stopWorld(persistState = true) {
  generation++;
  pending = null;
  const previous = world;
  world = null;
  delete (window as unknown as { __game?: GameWorld }).__game;
  if (persistState) previous?.dispose();
  else previous?.dispose(false);
}
