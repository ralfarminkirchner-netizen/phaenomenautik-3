import { ensureOpenWorld } from "./openWorld";
import type { SaveGame } from "./state";

export type DigSpots = Record<string, number>;
export const DIG_COOLDOWN_SECONDS = 90;

/** Optional on older v3 saves; new data must contain only grid cells and world times. */
export function isDigSpots(value: unknown): value is DigSpots {
  return typeof value === "object" && value !== null && !Array.isArray(value) &&
    Object.entries(value).every(([cell, at]) => /^-?\d+:-?\d+$/.test(cell) &&
      typeof at === "number" && Number.isFinite(at) && at >= 0);
}

/** Reserve the same three-metre cell against the persisted simulation clock. */
export function claimDigSpot(save: SaveGame, x: number, z: number): boolean {
  if (!Number.isFinite(x) || !Number.isFinite(z)) return false;
  const now = ensureOpenWorld(save).seconds;
  const spots = save.dugSpots ??= {};
  const cell = `${Math.round(x / 3)}:${Math.round(z / 3)}`;
  if (Object.hasOwn(spots, cell) && now - spots[cell] < DIG_COOLDOWN_SECONDS) return false;
  // Expired reservations have no effect and need not grow the save indefinitely.
  for (const [key, at] of Object.entries(spots)) {
    if (now - at >= DIG_COOLDOWN_SECONDS) delete spots[key];
  }
  spots[cell] = now;
  return true;
}
