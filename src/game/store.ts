// PHÄNOMENAUTIK 3 — Mini-Store: Brücke zwischen Game-Loop (three.js) und React-HUD

export interface HudState {
  mode: "title" | "sailing" | "onfoot";
  stability: number;
  maxStability: number;
  presence: number;
  maxPresence: number;
  stamina: number;
  maxStamina: number;
  level: number;
  wood: number;
  crystals: number;
  weaponLevel: number;
  prompt: string | null;
  promptKey: string | null; // z. B. "E"
  compassYaw: number; // Kamerablick (rad)
  targetName: string;
  targetBearing: number; // relativ zum Norden (rad)
  targetDist: number;
  timeOfDay: number;
  storm: number; // 0..1
  fps: number;
  showFps: boolean;
  toasts: { id: number; text: string; kind: "info" | "good" | "bad" }[];
  menuOpen: boolean;
  dead: boolean;
  dialogNpc: string | null;
  battlePhen: string | null;
  journalOpen: boolean;
  loreStone: string | null; // Id des offenen Lore-Steins
  chatOpen: boolean;
  cookOpen: boolean; // Koch-UI am Feuer (M3)
  meals: { name: string; kind: string; secondsLeft: number; crash: boolean }[]; // aktive Essens-Wirkungen
  damageFlash: number; // 0..1 roter Vignetten-Blitz
  fireBuffUntil: number; // Timestamp (performance.now), 0 = kein Buff
}

export const initialHud: HudState = {
  mode: "title",
  stability: 1,
  maxStability: 1,
  presence: 1,
  maxPresence: 1,
  stamina: 1,
  maxStamina: 1,
  level: 1,
  wood: 0,
  crystals: 0,
  weaponLevel: 1,
  prompt: null,
  promptKey: null,
  compassYaw: 0,
  targetName: "",
  targetBearing: 0,
  targetDist: 0,
  timeOfDay: 9.4,
  storm: 0,
  fps: 0,
  showFps: false,
  toasts: [],
  menuOpen: false,
  dead: false,
  dialogNpc: null,
  battlePhen: null,
  journalOpen: false,
  loreStone: null,
  chatOpen: false,
  cookOpen: false,
  meals: [],
  damageFlash: 0,
  fireBuffUntil: 0,
};

type Listener = () => void;

class GameStore {
  private state: HudState = { ...initialHud };
  private listeners = new Set<Listener>();
  private toastId = 1;

  get(): HudState {
    return this.state;
  }

  set(patch: Partial<HudState>) {
    this.state = { ...this.state, ...patch };
    for (const l of this.listeners) l();
  }

  toast(text: string, kind: "info" | "good" | "bad" = "info") {
    const id = this.toastId++;
    const toasts = [...this.state.toasts, { id, text, kind }].slice(-4);
    this.set({ toasts });
    window.setTimeout(() => {
      this.set({ toasts: this.state.toasts.filter((t) => t.id !== id) });
    }, 4200);
  }

  subscribe(l: Listener): () => void {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }
}

export const store = new GameStore();

// QA-Hook (Playwright)
if (typeof window !== "undefined") {
  (window as unknown as { __store: GameStore }).__store = store;
}
