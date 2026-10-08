// PHÄNOMENAUTIK 3 — Runtime: hält die GameWorld-Instanz (außerhalb von React-Render)

import { GameWorld } from "../three/world";
import type { SaveGame } from "./state";

let world: GameWorld | null = null;

export async function startWorld(container: HTMLElement, save: SaveGame): Promise<GameWorld> {
  if (world) return world;
  world = await GameWorld.create(container, save);
  // QA-Hook (Playwright-Screenshots & Debugging)
  (window as unknown as { __game: GameWorld }).__game = world;
  return world;
}

export function getWorld(): GameWorld | null {
  return world;
}

export function stopWorld() {
  if (world) {
    world.dispose();
    world = null;
  }
}
