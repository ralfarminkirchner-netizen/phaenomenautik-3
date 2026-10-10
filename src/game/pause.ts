import { store, type HudState } from "./store";

/** Protected panels require an explicit continuation before the world runs. */
export function isProtectionPaused(state: HudState = store.get()): boolean {
  return state.paused || state.protectionOpen !== null || state.explorationOpen || state.menuOpen;
}

