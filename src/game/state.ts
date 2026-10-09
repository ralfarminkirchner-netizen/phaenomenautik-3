// PHÄNOMENAUTIK 3 — Spielstand & Persistenz (v3: See/Land, Holz, Waffe)

import { PHENOMENA, levelForXp, maxPresence, maxStability, maxStamina } from "./data";
import { HARBOR, ISLANDS } from "./worldLayout";
import { emptyGraphProgress, graphProgressFromIslands, type GraphProgress } from "./phenomenaGraph";
import type { ActiveMeal, MicroKey } from "./cooking";

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
  stamina: number; // Ausdauer: Sprint & Klettern (M3)
  maxStamina: number;
  items: Record<string, number>;
}

export type QuestState = "unknown" | "active" | "done";
export type TravelMode = "sailing" | "onfoot";

export interface PlacedStructure {
  id: string;
  type: "floss" | "leiter" | "bruecke" | "ventilator" | "aufzug";
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
  // Küche & Ernährung (M3)
  food: Record<string, number>; // Zutaten-Inventar (Zutat → Anzahl Portionen)
  activeMeals: ActiveMeal[]; // laufende Essens-Wirkungen
  recipesFound: string[]; // gelernte Rezept-Ids
  mealsCooked: number; // Statistik für Experiment-Freischaltung
  recentMicros: { micros: Partial<Record<MicroKey, number>>; at: number }[]; // Mikros der letzten Mahlzeiten (Körperkarte)
  glutenFree: boolean; // Glutenfrei-Modus (M3, Bildungs-Feature)
  gfMealCooked?: boolean; // einmal glutenfrei gekocht (Tove-Quest)
  equipment: string[]; // gefertigte Ausrüstung (M3): „gleitschirm“, später mehr
  // Rededuelle (M3)
  duelsDone: string[]; // abgeschlossene Duell-Ids
  compassEntries: string[]; // erkannte Manipulations-Taktiken (Manipulations-Kompass)
  // Phänomen-Netz (M4)
  graph: GraphProgress; // Nebel-of-War: verstandene / begegnete Knoten, befahrene Kanten
}

const SAVE_KEY = "phaenomenautik3-save-v1";
const GF_KEY = "phaenomenautik3-gf-mode"; // Titel-Schalter, unabhängig vom Spielstand

export function loadGfMode(): boolean {
  try {
    return localStorage.getItem(GF_KEY) === "1";
  } catch {
    return false;
  }
}
export function saveGfMode(on: boolean) {
  try {
    localStorage.setItem(GF_KEY, on ? "1" : "0");
  } catch {
    /* ignorieren */
  }
}

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
    food: { apfel: 2, heidelbeere: 1 },
    activeMeals: [],
    recipesFound: [],
    mealsCooked: 0,
    recentMicros: [],
    glutenFree: loadGfMode(),
    equipment: [],
    duelsDone: [],
    compassEntries: [],
    graph: emptyGraphProgress(),
  };
}

export function freshPlayer(xp: number): PlayerState {
  const level = levelForXp(xp);
  const maxS = maxStability(level);
  const maxP = maxPresence(level);
  const maxSt = maxStamina(level);
  return {
    xp,
    level,
    stability: maxS,
    maxStability: maxS,
    presence: maxP,
    maxPresence: maxP,
    stamina: maxSt,
    maxStamina: maxSt,
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
    player.maxStamina = maxStamina(player.level);
    player.stability = player.maxStability;
    player.presence = player.maxPresence;
    player.stamina = player.maxStamina;
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
    s.player.maxStamina ??= maxStamina(s.player.level);
    s.player.stamina ??= s.player.maxStamina;
    s.food ??= { apfel: 2, heidelbeere: 1 };
    s.activeMeals ??= [];
    s.recipesFound ??= [];
    s.mealsCooked ??= 0;
    s.recentMicros ??= [];
    s.glutenFree ??= loadGfMode();
    s.equipment ??= [];
    s.duelsDone ??= [];
    s.compassEntries ??= [];
    s.graph ??= graphProgressFromIslands(s.islands); // M4: alter Insel-Fortschritt wird ins Netz übernommen
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
