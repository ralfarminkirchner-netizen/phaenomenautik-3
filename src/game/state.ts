// PHÄNOMENAUTIK 3 — Spielstand & Persistenz (v3: See/Land, Holz, Waffe)

import { PHENOMENA, levelForXp, maxPresence, maxStability } from "./data";
import { HARBOR, ISLANDS } from "./worldLayout";

export interface IslandState {
  id: string;
  overcome: boolean;
  understood: boolean;
}

export interface PlayerState {
  xp: number;
  level: number;
  stability: number;
  maxStability: number;
  presence: number;
  maxPresence: number;
  items: Record<string, number>;
}

export type QuestState = "unknown" | "active" | "done";
export type TravelMode = "sailing" | "onfoot";

export interface PlacedStructure {
  id: string;
  type: "floss" | "leiter" | "bruecke";
  x: number;
  z: number;
  yaw: number;
  ex?: number;
  ez?: number;
  topY?: number;
}

export interface SaveGame {
  version: 3;
  player: PlayerState;
  islands: IslandState[];
  ship: { x: number; z: number; heading: number };
  mode: TravelMode;
  playerPos: { x: number; z: number } | null; // wenn zu Fuß
  finalUnlocked: boolean;
  won: boolean;
  playerName: string;
  // Ressourcen & Fortschritt V3
  wood: number;
  crystals: number;
  weaponLevel: number; // 1 = Axt, 2 = Axt der Klarheit, 3 = später
  driftwood: number; // gesammeltes Treibholz (Quest-Kompatibilität)
  shipSpeedLevel: number;
  litFires: string[]; // Feuer-IDs
  timeOfDay: number; // 0..24
  echoesFound: string[]; // Lore-Stein-IDs
  echoDrop: { x: number; z: number; crystals: number } | null; // hinterlassenes Echo (Souls-Regel)
  materials: Record<string, number>; // Inventar
  lootTaken: string[]; // eingesammelte Loot-Ids
  structures: PlacedStructure[]; // gebaute Objekte
  chestsOpened: string[]; // Truhen-Ids
  npcMemory: Record<string, { met: boolean; topics: string[]; favors: number }>;
  quests: Record<string, QuestState>;
  questProgress: Record<string, number>;
  visitedArchipelagos: string[];
}

const SAVE_KEY = "phaenomenautik3-save-v1";

export const SHIP_START = { x: HARBOR.x, z: HARBOR.z + 260, heading: 0 };

export function newGame(): SaveGame {
  const islands: IslandState[] = ISLANDS.map((p) => ({ id: p.id, overcome: false, understood: false }));
  const player = freshPlayer(0);
  return {
    version: 3,
    player,
    islands,
    ship: { ...SHIP_START },
    mode: "sailing",
    playerPos: null,
    finalUnlocked: false,
    won: false,
    playerName: "",
    wood: 2,
    crystals: 0,
    weaponLevel: 1,
    driftwood: 0,
    shipSpeedLevel: 0,
    litFires: [],
    timeOfDay: 9.4,
    echoesFound: [],
    echoDrop: null,
    materials: { stamm: 2, seil: 1 },
    lootTaken: [],
    structures: [],
    chestsOpened: [],
    quests: {},
    questProgress: {},
    npcMemory: {},
    visitedArchipelagos: [],
  };
}

export function freshPlayer(xp: number): PlayerState {
  const level = levelForXp(xp);
  const maxS = maxStability(level);
  const maxP = maxPresence(level);
  return {
    xp,
    level,
    stability: maxS,
    maxStability: maxS,
    presence: maxP,
    maxPresence: maxP,
    items: { wasser: 3, karte: 1, anker: 2 },
  };
}

export function grantXp(player: PlayerState, xp: number): { leveledUp: boolean; newLevel: number } {
  const before = player.level;
  player.xp += xp;
  player.level = levelForXp(player.xp);
  if (player.level > before) {
    player.maxStability = maxStability(player.level);
    player.maxPresence = maxPresence(player.level);
    player.stability = player.maxStability;
    player.presence = player.maxPresence;
    return { leveledUp: true, newLevel: player.level };
  }
  return { leveledUp: false, newLevel: player.level };
}

export function regularOvercome(islands: IslandState[]): number {
  return islands.filter((i) => i.id !== "sturmherd" && i.overcome).length;
}

export function checkFinalUnlock(s: SaveGame): boolean {
  if (!s.finalUnlocked && regularOvercome(s.islands) >= 12) s.finalUnlocked = true;
  return s.finalUnlocked;
}

export function phenomenonIdFor(islandId: string) {
  return PHENOMENA.find((p) => p.id === islandId) ?? null;
}

export function loadSave(): SaveGame | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as SaveGame;
    if (s.version !== 3 || !Array.isArray(s.islands) || s.islands.length !== ISLANDS.length) return null;
    s.echoesFound ??= [];
    s.echoDrop ??= null;
    s.crystals ??= 0;
    s.materials ??= { stamm: 2, seil: 1 };
    s.lootTaken ??= [];
    s.structures ??= [];
    s.chestsOpened ??= [];
    return s;
  } catch {
    return null;
  }
}

export function persistSave(s: SaveGame) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(s));
  } catch {
    /* ignorieren */
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* ignorieren */
  }
}
