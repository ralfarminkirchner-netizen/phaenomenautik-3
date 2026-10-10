// PHÄNOMENAUTIK 3 — Spielstand & Persistenz (v3: See/Land, Holz, Waffe)

import { PHENOMENA, levelForXp, maxPresence, maxStability, maxStamina } from "./data";
import { HARBOR, ISLANDS } from "./worldLayout";
import { emptyGraphProgress, graphProgressFromIslands, type GraphProgress } from "./phenomenaGraph";
import type { ActiveMeal, MicroKey } from "./cooking";
import { store } from "./store";
import { ensureOpenWorld, isOpenWorldState, type OpenWorldState } from "./openWorld";

export interface GentleEncounterState {
  step: "arrival" | "signs" | "choice" | "result" | "context";
  choice: "look" | "mark" | "distance" | null;
  completed: boolean;
}

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
  gentleEncounter?: GentleEncounterState;
  openWorld?: OpenWorldState;
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
// JSON ignores symbol keys; shallow save copies retain the shared write origin.
const saveOrigin = Symbol("save origin");
type TrackedSave = SaveGame & { [saveOrigin]?: { raw: string | null } };
function rememberSave(save: SaveGame, raw: string | null): SaveGame {
  (save as TrackedSave)[saveOrigin] = { raw };
  return save;
}
let unreadableSave = false;
export function hasUnreadableSave() { return unreadableSave; }
const unreadableMessage = "Ein vorhandener Spielstand lässt sich gerade nicht lesen. Er wurde nicht ersetzt. Hilfe bleibt erreichbar; der gespeicherte Bestand muss vor einer neuen Sicherung geprüft werden.";
const conflictMessage = "In einer anderen Ansicht wurde der Spielstand geändert. Dieser Stand wurde nicht überschrieben. Dein aktueller Stand bleibt für diese Sitzung erhalten. Zum Fortsetzen des gespeicherten Stands öffne das Spiel neu; beim Schließen oder Neuladen kann dein Sitzungsstand verloren gehen.";
function parseSave(raw: string): SaveGame {
  const value: unknown = JSON.parse(raw);
  const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
  const number = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
  const amounts = (v: unknown) => object(v) && Object.values(v).every((n) => number(n) && n >= 0);
  const strings = (v: unknown) => Array.isArray(v) && v.every((item) => typeof item === "string");
  const position = (v: unknown) => object(v) && number(v.x) && number(v.z);
  const fail = () => { throw new Error("Dieser Spielstand hat kein lesbares Spielstandformat."); };
  if (!object(value) || value.version !== 3 || !object(value.player) || !Array.isArray(value.islands) || value.islands.length !== ISLANDS.length) return fail();
  const p = value.player;
  if (!["xp", "level", "stability", "maxStability", "presence", "maxPresence"].every((key) => number(p[key]) && p[key] >= 0) || !amounts(p.items)) return fail();
  for (const key of ["stamina", "maxStamina"]) if (p[key] !== undefined && (!number(p[key]) || p[key] < 0)) return fail();
  const ids = new Set<string>();
  if (!value.islands.every((i) => {
    if (!object(i) || typeof i.id !== "string" || ids.has(i.id) || !ISLANDS.some((island) => island.id === i.id) || typeof i.overcome !== "boolean" || typeof i.understood !== "boolean") return false;
    ids.add(i.id); return true;
  })) return fail();
  if (!position(value.ship) || !number((value.ship as Record<string, unknown>).heading) || (value.mode !== "sailing" && value.mode !== "onfoot") || (value.playerPos !== null && !position(value.playerPos)) || typeof value.playerName !== "string" || typeof value.finalUnlocked !== "boolean" || typeof value.won !== "boolean") return fail();
  if (!["wood", "weaponLevel", "driftwood", "shipSpeedLevel", "timeOfDay"].every((key) => number(value[key]) && value[key] >= 0) || (value.timeOfDay as number) > 24) return fail();
  for (const key of ["crystals", "mealsCooked"]) if (value[key] !== undefined && (!number(value[key]) || value[key] < 0)) return fail();
  for (const key of ["litFires", "echoesFound", "lootTaken", "chestsOpened", "visitedArchipelagos", "recipesFound", "equipment", "duelsDone", "compassEntries"]) if (value[key] !== undefined && !strings(value[key])) return fail();
  for (const key of ["materials", "food", "questProgress"]) if (value[key] !== undefined && !amounts(value[key])) return fail();
  if (value.graph !== undefined && (!object(value.graph) || !strings(value.graph.understood) || !strings(value.graph.met) || !strings(value.graph.traveled))) return fail();
  if (value.openWorld !== undefined && !isOpenWorldState(value.openWorld)) return fail();
  return value as unknown as SaveGame;
}
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
  const save: SaveGame = {
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
  ensureOpenWorld(save);
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw !== null) parseSave(raw);
    return rememberSave(save, raw);
  } catch {
    unreadableSave = true;
    store.set({ saveError: unreadableMessage });
    return save;
  }
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
  unreadableSave = false;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw === null) return null;
    const s = parseSave(raw);
    prepareSave(s);
    return rememberSave(s, raw);
  } catch {
    unreadableSave = true;
    store.set({ saveError: unreadableMessage });
    return null;
  }
}

function prepareSave(s: SaveGame, initializeWorld = false): void {
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
    if (initializeWorld) ensureOpenWorld(s);
}

export function parseImportedSave(raw: string): SaveGame {
  if (unreadableSave) throw new Error("Der vorhandene Browser-Spielstand muss zuerst geprüft werden. Er wurde nicht ersetzt.");
  let imported: SaveGame;
  try { imported = parseSave(raw); }
  catch { throw new Error("Die Datei enthält keinen gültigen Phänomenautik-Spielstand. Dein vorhandener Stand bleibt erhalten."); }
  let current: string | null;
  try {
    current = localStorage.getItem(SAVE_KEY);
    if (current !== null) parseSave(current);
  } catch {
    unreadableSave = true;
    store.set({ saveError: unreadableMessage });
    throw new Error("Der vorhandene Browser-Spielstand lässt sich nicht prüfen. Er wurde nicht ersetzt.");
  }
  prepareSave(imported, true);
  return rememberSave(imported, current);
}

export function persistSave(s: SaveGame): boolean {
  if (unreadableSave) { store.set({ saveError: unreadableMessage }); return false; }
  try {
    const raw = JSON.stringify(s);
    const origin = (s as TrackedSave)[saveOrigin];
    const current = localStorage.getItem(SAVE_KEY);
    if (origin ? current !== origin.raw : current !== null) {
      store.set({ saveError: conflictMessage });
      return false;
    }
    localStorage.setItem(SAVE_KEY, raw);
    if (origin) origin.raw = raw;
    else rememberSave(s, raw);
    store.set({ saveError: null });
    return true;
  } catch {
    store.set({ saveError: "Der Spielstand konnte in diesem Browser nicht gespeichert werden. Für diese Sitzung bleibt er erhalten. Beim Schließen oder Neuladen kann der aktuelle Stand verloren gehen." });
    return false;
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* ignorieren */
  }
}
