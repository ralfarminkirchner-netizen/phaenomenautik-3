import { store, type HudState } from "./store";

/** Protected panels require an explicit continuation before the world runs. */
export function isProtectionPaused(state: HudState = store.get()): boolean {
  return state.paused || state.protectionOpen !== null || state.explorationOpen || state.menuOpen;
}

export function handleProtectionKeyDown(event: KeyboardEvent): void {
  if (event.key !== "Escape") return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (event.repeat) return;
  const state = store.get();
  if (state.journalOpen && state.protectionOpen === null) {
    store.set({ journalOpen: false });
    return;
  }
  store.set({ paused: true, protectionOpen: "pause", menuOpen: false });
}
