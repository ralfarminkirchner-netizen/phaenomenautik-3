// ═══════════════════════════════════════════════════════════════════
// PHÄNOMENAUTIK — M4: Das Phänomen-NETZ
// Graph statt Insel-Liste: Knoten = Phänomene, Kanten = indirekte
// Verbindungen. Verstehen eines Knotens beleuchtet seine Nachbarn
// (Nebel-of-War auf der Seekarte). Die 12 Bestandsinseln bleiben die
// „alten Hauptstädte“ ihrer Kontinente — ihre Texte kommen aus
// data.ts (die Bibel bleibt heilig), hier nur verknüpft.
//
// Inhaltsquellen: TRAUMAATLAS (32 Symptome, 6 Kategorien) +
// redaktionelle Erweiterung auf 120+ Knoten.
// Erste Regel jeder Zeile: wahr, nie Klinik-Deutsch, nie Karikatur.
// Krisenerkennung: siehe DISCLAIMER in data.ts — gilt für alle Texte.
// ═══════════════════════════════════════════════════════════════════

import { PHENOMENA } from "./data";
import { ISLANDS, WORLD_SIZE } from "./worldLayout";
import { GRAPH_SEEDS, type PhenomenonSeed } from "./phenomenaCatalog";

// ─── Grundtypen (nach M4-Brief §1.1) ──────────────────────────────

export type EdgeKind = "komorbid" | "uebergang" | "schutz-vor" | "echo";
export type NodeKind = "symptom" | "schutz" | "zustand" | "muster";
export type Intensity = 1 | 2 | 3; // 1 = Strand-Begegnung · 2 = Kammer · 3 = Arena (alte Hauptstädte)

export interface GraphEdge {
  to: string;
  kind: EdgeKind;
}

export interface PhenomenonText {
  intro: string;
  verstehen: string[]; // rotierende Zeilen beim Begreifen
  frieden: string; // Zeile, wenn begriffen
  insight: string; // Atlas-Wissen (Journal) — die wahre Zeile
}

export interface PhenomenonNode {
  id: string;
  name: string; // spielerischer Name (keine Diagnose-Sprache!)
  epithet: string; // poetischer Beiname
  cluster: string; // Kontinent-Zugehörigkeit
  kind: NodeKind;
  text: PhenomenonText;
  edges: GraphEdge[];
  intensity: Intensity;
  hue: number; // Farbwelt 0–360
  x: number; // Seekarten-Position (Weltkoordinaten)
  z: number;
  legacy?: boolean; // alte Hauptstadt — Texte leben in data.ts
  atlasId?: string; // Quelle im TRAUMAATLAS-Symptomatlas
}

export interface ClusterDef {
  id: string;
  name: string;
  epithet: string; // Arbeitsname aus dem Brief („Alarm & Erregung“ …)
  cx: number; // Kontinent-Mitte (Weltkoordinaten)
  cz: number;
  hue: number; // Leitfarbe
  blurb: string;
}

// ─── Kontinente ────────────────────────────────────────────────────
// Positionen der alten Hauptstädte liegen fest (worldLayout.ISLANDS);
// neue Kontinente bekommen Seegebiet, das später bebaut wird.

export const CLUSTERS: ClusterDef[] = [
  { id: "alarm", name: "Der Alarm-Atoll", epithet: "Alarm & Erregung", cx: 2285, cz: 675, hue: 15, blurb: "Kontinent der Anspannung: Hier wacht alles, hier pocht alles, hier springt alles." },
  { id: "glas", name: "Die Glaswelt", epithet: "Glas & Nebel", cx: 3285, cz: 2775, hue: 185, blurb: "Der Kontinent des Abschaltens: nah und unerreichbar zugleich." },
  { id: "scham", name: "Das Trauer-Atoll", epithet: "Scham & Leere", cx: 1880, cz: 2750, hue: 345, blurb: "Mauern aus fremden Urteilen, Brunnen aus früherem Gefühl." },
  { id: "misstrauen", name: "Das Misstrauens-Riff", epithet: "Misstrauen & Nähe", cx: 930, cz: 2775, hue: 120, blurb: "Fallen, zweite Böden — und die Frage, wer bleiben darf." },
  { id: "wiederkehr", name: "Das Wiederkehr-Riff", epithet: "Gedächtnis & Wiederkehr", cx: 955, cz: 830, hue: 290, blurb: "Wo das Gestern ins Heute flimmert." },
  { id: "koerper", name: "Der Körperstrand", epithet: "Körper & Schutz", cx: 480, cz: 1800, hue: 85, blurb: "Hier spricht der Körper — in Schmerz, Haut und Atem." },
  { id: "bindung", name: "Die Bindungssunde", epithet: "Bindung & Verlust", cx: 1500, cz: 3550, hue: 50, blurb: "Gewässer der Anwesenheit und der Abwesenheit." },
  { id: "wut", name: "Der Zorn-Atoll", epithet: "Wut & Grenze", cx: 3520, cz: 380, hue: 6, blurb: "Feuer, das einmal gerecht war — und Grenzen, die wachsen dürfen." },
  { id: "muedigkeit", name: "Die Nebelbank", epithet: "Müdigkeit & Rückzug", cx: 3445, cz: 1115, hue: 222, blurb: "Weiche Mauern, graue Zeit, der lange Weg zurück nach draußen." },
  { id: "auge", name: "Das Auge des Atlanten", epithet: "Das Ganze", cx: 2100, cz: 1760, hue: 280, blurb: "Die Mitte aller Karten." },
];

export const CLUSTER_BY_ID: ReadonlyMap<string, ClusterDef> = new Map(CLUSTERS.map((c) => [c.id, c]));

// ─── Legacy-Verknüpfung: die 13 Bestandsphänomene ─────────────────

const LEGACY_CLUSTER: Record<string, string> = {
  flashback: "wiederkehr",
  albtraum: "wiederkehr",
  hypervigilanz: "alarm",
  herzrasen: "alarm",
  vermeidung: "muedigkeit",
  verdraengung: "muedigkeit",
  dissoziation: "glas",
  erstarrung: "glas",
  scham: "scham",
  leere: "scham",
  misstrauen: "misstrauen",
  naehe: "misstrauen",
  sturmherd: "auge",
};

const LEGACY_KIND: Record<string, NodeKind> = {
  vermeidung: "schutz",
  verdraengung: "schutz",
  sturmherd: "muster",
};

// Handkuratierte Kanten der Hauptstädte (Komorbidität, Übergänge, Echos).
const LEGACY_EDGES: Record<string, GraphEdge[]> = {
  flashback: [
    { to: "albtraum", kind: "komorbid" },
    { to: "aufdringlich", kind: "komorbid" },
    { to: "trigger", kind: "uebergang" },
  ],
  albtraum: [
    { to: "flashback", kind: "komorbid" },
    { to: "schlaf", kind: "komorbid" },
  ],
  hypervigilanz: [
    { to: "herzrasen", kind: "komorbid" },
    { to: "schreck", kind: "komorbid" },
    { to: "erstarrung", kind: "uebergang" }, // Pendel: Daueralarm ↔ Abschaltung
  ],
  herzrasen: [
    { to: "hypervigilanz", kind: "komorbid" },
    { to: "panik", kind: "komorbid" },
    { to: "atemdruck", kind: "komorbid" },
  ],
  vermeidung: [
    { to: "flashback", kind: "schutz-vor" }, // Vermeidung schützt vor Wiedererleben
    { to: "verdraengung", kind: "komorbid" },
    { to: "zurueckgezogen", kind: "komorbid" },
  ],
  verdraengung: [
    { to: "aufdringlich", kind: "schutz-vor" },
    { to: "vermeidung", kind: "komorbid" },
    { to: "luecken", kind: "uebergang" },
  ],
  dissoziation: [
    { to: "erstarrung", kind: "komorbid" },
    { to: "depersonalisierung", kind: "komorbid" },
    { to: "derealisation", kind: "komorbid" },
  ],
  erstarrung: [
    { to: "dissoziation", kind: "komorbid" },
    { to: "watte", kind: "komorbid" },
    { to: "hypervigilanz", kind: "uebergang" },
  ],
  scham: [
    { to: "leere", kind: "komorbid" },
    { to: "misstrauen", kind: "komorbid" },
    { to: "schuld", kind: "komorbid" },
  ],
  leere: [
    { to: "scham", kind: "komorbid" },
    { to: "taubheit", kind: "komorbid" },
    { to: "hoffnungslos", kind: "komorbid" },
  ],
  misstrauen: [
    { to: "naehe", kind: "komorbid" },
    { to: "scham", kind: "komorbid" },
    { to: "verratserwartung", kind: "komorbid" },
  ],
  naehe: [
    { to: "misstrauen", kind: "komorbid" },
    { to: "verlustangst", kind: "komorbid" },
    { to: "verlassenheit", kind: "komorbid" },
  ],
  sturmherd: [
    { to: "flashback", kind: "echo" },
    { to: "hypervigilanz", kind: "echo" },
    { to: "vermeidung", kind: "echo" },
    { to: "dissoziation", kind: "echo" },
    { to: "scham", kind: "echo" },
    { to: "misstrauen", kind: "echo" },
  ],
};

// ─── Deterministische Platzierung neuer Knoten ─────────────────────
// Goldener-Winkel-Spirale um die Kontinent-Mitte — stabil über
// Sessions hinweg (wichtig für teilbare Fund-Codes, Brief §1.5.7).

export function hashId(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const GOLDEN = 2.39996322972865332;

function clusterPosition(clusterId: string, index: number, id: string): { x: number; z: number } {
  const c = CLUSTER_BY_ID.get(clusterId);
  if (!c) throw new Error(`Unbekannter Cluster: ${clusterId}`);
  const jitter = (hashId(id) % 1000) / 1000; // 0..1, stabil
  const angle = index * GOLDEN + jitter * 0.6;
  const radius = 90 + index * 34 + jitter * 30;
  const clampW = (v: number) => Math.min(WORLD_SIZE - 80, Math.max(80, v));
  return { x: Math.round(clampW(c.cx + Math.cos(angle) * radius)), z: Math.round(clampW(c.cz + Math.sin(angle) * radius)) };
}

// ─── Graph-Aufbau ──────────────────────────────────────────────────

function legacyToNode(p: (typeof PHENOMENA)[number]): PhenomenonNode {
  const isl = ISLANDS.find((i) => i.id === p.id);
  return {
    id: p.id,
    name: p.name,
    epithet: p.epithet,
    cluster: LEGACY_CLUSTER[p.id],
    kind: LEGACY_KIND[p.id] ?? "symptom",
    text: {
      intro: p.intro[0],
      verstehen: p.understand,
      frieden: p.peaceLine,
      insight: p.insight,
    },
    edges: LEGACY_EDGES[p.id] ?? [],
    intensity: 3,
    hue: p.hue,
    x: isl?.x ?? 2100,
    z: isl?.z ?? 1760,
    legacy: true,
  };
}

function seedToNode(s: PhenomenonSeed, indexInCluster: number): PhenomenonNode {
  const pos = clusterPosition(s.cluster, indexInCluster, s.id);
  return { ...s, x: pos.x, z: pos.z };
}

function buildGraph(): { nodes: PhenomenonNode[]; byId: Map<string, PhenomenonNode> } {
  const nodes: PhenomenonNode[] = PHENOMENA.map(legacyToNode);
  const seen = new Set(nodes.map((n) => n.id));
  const perCluster = new Map<string, number>();
  for (const s of GRAPH_SEEDS) {
    if (seen.has(s.id)) throw new Error(`Doppelte Knoten-Id: ${s.id}`);
    seen.add(s.id);
    const idx = perCluster.get(s.cluster) ?? 0;
    perCluster.set(s.cluster, idx + 1);
    nodes.push(seedToNode(s, idx));
  }
  const byId = new Map(nodes.map((n) => [n.id, n]));
  // Kanten-Integrität sofort prüfen (Build-Zeit)
  for (const n of nodes) {
    for (const e of n.edges) {
      if (!byId.has(e.to)) throw new Error(`Kante ohne Ziel: ${n.id} -> ${e.to}`);
    }
  }
  return { nodes, byId };
}

const BUILT = buildGraph();
export const GRAPH_NODES: readonly PhenomenonNode[] = BUILT.nodes;
export const NODE_BY_ID: ReadonlyMap<string, PhenomenonNode> = BUILT.byId;

// ─── Nachbarschaft (Kanten gelten in beide Richtungen) ─────────────

export const neighborIndex: ReadonlyMap<string, Set<string>> = (() => {
  const idx = new Map<string, Set<string>>();
  const add = (a: string, b: string) => {
    if (!idx.has(a)) idx.set(a, new Set());
    idx.get(a)!.add(b);
  };
  for (const n of GRAPH_NODES) for (const e of n.edges) {
    add(n.id, e.to);
    add(e.to, n.id);
  }
  return idx;
})();

export function neighborsOf(id: string): Set<string> {
  return neighborIndex.get(id) ?? new Set();
}

export function edgeKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

// ─── Nebel-of-War ──────────────────────────────────────────────────
// sichtbar: Nachbar eines verstandenen/begegneten Knotens — oder eine
//   alte Hauptstadt (die zwölf Inseln sind von jeher eingezeichnet).
// befahrbar: sichtbar UND an einen verstandenen Knoten angrenzend
//   (der Weg dorthin ist bekannt).
// begegnet/verstanden: aus dem Fortschritt.

export type FogState = "verborgen" | "sichtbar" | "befahrbar" | "begegnet" | "verstanden";

export interface GraphProgress {
  understood: string[]; // begriffene Knoten
  met: string[]; // begegnete Knoten
  traveled: string[]; // befahrene Kanten (edgeKey)
}

export function emptyGraphProgress(): GraphProgress {
  return { understood: [], met: [], traveled: [] };
}

/** Migration: alter Insel-Fortschritt (v3) wird ins Netz übernommen. */
export function graphProgressFromIslands(islands: { id: string; overcome: boolean; understood: boolean }[]): GraphProgress {
  const understood = new Set<string>();
  const met = new Set<string>();
  for (const i of islands) {
    if (!NODE_BY_ID.has(i.id)) continue;
    if (i.understood || i.overcome) understood.add(i.id);
    if (i.overcome) met.add(i.id);
  }
  return { understood: [...understood], met: [...met], traveled: [] };
}

export function fogStateOf(id: string, p: GraphProgress): FogState {
  const node = NODE_BY_ID.get(id);
  if (!node) return "verborgen";
  if (p.understood.includes(id)) return "verstanden";
  if (p.met.includes(id)) return "begegnet";
  const nbs = neighborsOf(id);
  const touchesUnderstood = [...nbs].some((n) => p.understood.includes(n));
  if (touchesUnderstood) return "befahrbar";
  const touchesMet = [...nbs].some((n) => p.met.includes(n));
  if (node.legacy || touchesMet) return "sichtbar";
  return "verborgen";
}

export function visibleNodes(p: GraphProgress): PhenomenonNode[] {
  return GRAPH_NODES.filter((n) => fogStateOf(n.id, p) !== "verborgen");
}

/** Welche Knoten tauchen aus dem Nebel auf, wenn id verstanden wird? (für Toast/FX) */
export function revealedByUnderstanding(id: string, p: GraphProgress): string[] {
  const before = new Set(visibleNodes(p).map((n) => n.id));
  const after: string[] = [];
  for (const nb of neighborsOf(id)) {
    if (!before.has(nb) && NODE_BY_ID.has(nb)) after.push(nb);
  }
  return after;
}

// ─── Statistik (Atlas-Register, „Pokédex“) ────────────────────────

export interface ClusterStats {
  cluster: ClusterDef;
  total: number;
  understood: number;
  met: number;
  visible: number;
}

export function clusterStats(p: GraphProgress): ClusterStats[] {
  return CLUSTERS.map((c) => {
    const inCluster = GRAPH_NODES.filter((n) => n.cluster === c.id);
    return {
      cluster: c,
      total: inCluster.length,
      understood: inCluster.filter((n) => p.understood.includes(n.id)).length,
      met: inCluster.filter((n) => p.met.includes(n.id)).length,
      visible: inCluster.filter((n) => fogStateOf(n.id, p) !== "verborgen").length,
    };
  });
}

/** Kante leuchtet auf der Karte, sobald beide Enden begriffen sind (Brief §1.5.6). */
export function edgeLit(a: string, b: string, p: GraphProgress): boolean {
  return p.understood.includes(a) && p.understood.includes(b);
}

// ─── Tages-Rotation (Vorbereitung Varianten-Motor, Brief §1.5.4/7) ─
// Deterministisch aus Datum — kein FOMO, was verpasst wird, kommt wieder.

export function dailySeed(dateIso: string): number {
  return hashId(`phaenomenautik|${dateIso}`);
}
