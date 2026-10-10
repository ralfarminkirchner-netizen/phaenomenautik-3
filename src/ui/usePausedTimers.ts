import { useEffect, useState, useSyncExternalStore } from "react";
import { store } from "../game/store";

/** One pause boundary for React text playback and user actions. */
export function areUiTimersPaused(): boolean {
  const state = store.get();
  return !!(state.paused || state.protectionOpen || state.explorationOpen || state.menuOpen);
}

export function useInterfacePaused(): boolean {
  return useSyncExternalStore(store.subscribe.bind(store), areUiTimersPaused, () => true);
}

/** Playback preserves its position while paused; no completion action is scheduled. */
export function usePausedTypewriter(text: string, speed = 14, step = 2) {
  const paused = useInterfacePaused();
  const [playback, setPlayback] = useState({ text, count: 0 });
  const count = playback.text === text ? playback.count : 0;
  useEffect(() => {
    if (paused || count >= text.length) return;
    const timer = window.setTimeout(() => {
      if (!areUiTimersPaused()) setPlayback((value) => ({ text, count: Math.min(text.length, (value.text === text ? value.count : 0) + step) }));
    }, speed);
    return () => window.clearTimeout(timer);
  }, [text, count, paused, speed, step]);
  return {
    shown: text.slice(0, count),
    complete: count >= text.length,
    reveal: () => { if (!areUiTimersPaused()) setPlayback({ text, count: text.length }); },
  };
}
