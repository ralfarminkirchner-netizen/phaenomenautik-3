// ═══════════════════════════════════════════════════════════════════
// PHÄNOMENAUTIK — M4.2: DER VARIANTEN-MOTOR („Catch 'em all, würdevoll")
// Varianten = Masken derselben Wahrheit. Jeder Phänomen-Knoten hat
// 3–8 Ausprägungen: gleicher Kern, anderes Kostüm, andere wahre Zeile.
//
// Regeln (Brief §1.5, verbindlich):
//  · Tages-Rotation deterministisch aus dailySeed — KEIN FOMO, was
//    verpasst wird, kommt wieder. Der Ball rollt weiter, nirgendwo hin.
//  · Drift: unbemerkt gebliebene Masken wandern entlang der Kanten —
//    der Graph wird fühlbar, bevor er verstanden ist.
//  · Begreifen statt Fangen. Tonlage: Zärtlichkeit. Immer.
//  · Wer den Kern begreift, durchschaut alle seine Masken auf den
//    ersten Blick (Erkenntnis-Regel §1.5).
//  · Alle Knoten tragen Masken (außer dem Auge — das Auge ist die
//    Mitte, keine Maske). Strand-Masken an Hauptstädten (zu Fuß),
//    Meer-Masken schwimmen vor dem Kontinent (begegnbar vom Schiff).
// Reines TS-Datenmodul, keine Laufzeit-Abhängigkeiten (kein three.js).
// ═══════════════════════════════════════════════════════════════════

import { ISLANDS, terrainHeight, terrainSlope } from "./worldLayout";
import { NODE_BY_ID, GRAPH_NODES, dailySeed, hashId, neighborIndex, type GraphProgress, type PhenomenonNode } from "./phenomenaGraph";
import { mulberry32 } from "./noise";
import { MASK_TUPLES } from "./variantMasks";

// ─── Datenmodell (Brief §1.5.1) ────────────────────────────────────

export interface VariantSpawnRules {
  drift: boolean; // darf entlang der Kanten wandern
}

export interface VariantDef {
  id: string;
  nodeId: string; // Kern-Knoten, dessen Wahrheit die Maske trägt
  maskName: string; // Name der Maske
  epithet: string; // poetischer Beiname der Maske
  hue: number; // Farbwelt 0–360
  sizeScale: number; // Gestalt 0.7–1.5 (Wisp-Renderer)
  spawnRules: VariantSpawnRules;
  line: string; // die wahre Zeile der Maske
  begreifen: string; // Enthüllung: „Das war … — in einer anderen Maske"
}

// ─── Katalog-Aufbau: Masken-Daten → VariantDef ─────────────────────
// Die ersten 12 Masken (unten, v()) sind der redaktionelle
// Qualitätsmaßstab — vollständig handschriftlich. Der große Katalog
// (variantMasks.ts) bringt pro Knoten drei Masken: Maske (Name,
// Beiname, wahre Zeile) + ein Wahrheits-Satz; das Ritual „Das war X —
// in einer anderen Maske“ setzt der Katalog selbst. Farbe und Gestalt
// leiten sich deterministisch vom Kern-Knoten ab.

function coreShortName(nodeId: string): string {
  const n = NODE_BY_ID.get(nodeId);
  if (!n) return nodeId;
  return n.name.replace(/^(Der|Die|Das) /, "").split(",")[0];
}

function v(
  id: string, nodeId: string, maskName: string, epithet: string,
  hue: number, sizeScale: number, line: string, begreifen: string,
): VariantDef {
  return { id, nodeId, maskName, epithet, hue, sizeScale, spawnRules: { drift: true }, line, begreifen };
}

const HUE_OFFSETS = [-32, 24, 52];
const SIZES = [1.1, 0.8, 1.3];
const nodeMaskCounter: Record<string, number> = {};

function m(id: string, nodeId: string, maskName: string, epithet: string, line: string, truth: string): VariantDef {
  const node = NODE_BY_ID.get(nodeId);
  if (!node) throw new Error(`Maske ohne gültigen Kern-Knoten: ${id} -> ${nodeId}`);
  const idx = (nodeMaskCounter[nodeId] = (nodeMaskCounter[nodeId] ?? 0) + 1);
  const hue = (((node.hue + HUE_OFFSETS[idx % 3]) % 360) + 360) % 360;
  const sizeScale = SIZES[idx % 3];
  const begreifen = `Das war ${coreShortName(nodeId)} — in einer anderen Maske. ${truth}`;
  return { id, nodeId, maskName, epithet, hue, sizeScale, spawnRules: { drift: true }, line, begreifen };
}

// ─── Die ersten 12 Masken — redaktioneller Qualitätsmaßstab ────────
// Vier Knoten (die Hauptstädte der ersten Stunde), je drei Masken.
// Jede Zeile wahr, nie Klinik-Deutsch, nie Karikatur.

const HERZRASEN = "herzrasen";
const HYPERVIGILANZ = "hypervigilanz";
const DISSOZIATION = "dissoziation";
const ERSTARUNG = "erstarrung";

const QUALITY_12: VariantDef[] = [
  // ── Das Herzrasen (Galopp ohne Pferd) ──
  v("rasendes-herz", HERZRASEN, "Das rasende Herz", "Rennt, als gäbe es ein Ziel", 350, 1.1,
    "Es rennt, als gäbe es ein Ziel. Aber es gibt kein Ziel — es gibt nur dich, genau hier, und es versucht, bei dir anzukommen.",
    "Das war Herzrasen — in einer anderen Maske. Es rennt nicht vor der Welt davon, es rennt zu dir. Du musst nur still genug stehen, dass es dich erreicht."),
  v("trommelfeuer", HERZRASEN, "Das Trommelfeuer in der Brust", "Ein Marsch ohne Kommando", 8, 1.25,
    "Eine Trommel, die sich selber schlägt — immer im Takt einer Gefahr, die längst vorbei ist. Langes Ausatmen ist der einzige Taktstock, den sie akzeptiert.",
    "Das war Herzrasen — in einer anderen Maske. Die Trommel wollte nie recht haben. Sie wollte nur gehört werden, bevor sie leiser wird."),
  v("kolibri", HERZRASEN, "Der Kolibri im Hals", "Winzig, schnell, hungrig nach Luft", 42, 0.75,
    "Etwas Kleines und Schnelles sitzt dir im Hals und schlägt mit den Flügeln gegen die Luft. Es fliegt nicht weg, wenn du es jagst — nur, wenn du atemlos wirst. Also atme. Lang.",
    "Das war Herzrasen — in einer anderen Maske. Der Kolibri braucht keinen Käfig und keinen Kampf. Er braucht Raum zum Landen: deinen ruhigen Atem."),

  // ── Der Hypervigilanz-Wächter (Der niemals blinkt) ──
  v("lauscher", HYPERVIGILANZ, "Der Lauscher in der Wand", "Hört Schritte, die niemand geht", 18, 1.0,
    "Er lauscht mit dem ganzen Körper: jede Tür, jedes Geräusch, jede Stille. Er hört Schritte, die niemand geht — weil er einmal welche gehört hat, die es gab.",
    "Das war Hypervigilanz — in einer anderen Maske. Der Lauscher war nie paranoid. Er war gründlich — mit einem alten Dienstplan, den niemand abbestellt hat."),
  v("scheinwerfer", HYPERVIGILANZ, "Der Scheinwerfer im Nacken", "Licht, das keine Quelle hat", 30, 1.15,
    "Ein Lichtstrahl liegt auf deinem Nacken, wo kein Licht ist. Du drehst dich um — nichts. Der Strahl bleibt. Er sucht nicht dich. Er sucht, was einmal hinter dir stand.",
    "Das war Hypervigilanz — in einer anderen Maske. Der Scheinwerfer sucht keine Schuld. Er sucht eine Gefahr — und er darf lernen, dass die Schicht vorbei ist."),
  v("unbekannter-hinterhof", HYPERVIGILANZ, "Der Unbekannte auf dem Hinterhof", "Bleibt stehen, wenn du stehen bleibst", 12, 1.3,
    "Jenseits des Zauns steht jemand und sieht zu. Bewegst du dich, bewegt er sich. Bleibst du stehen, wartet er — geduldig, lautlos, treu auf eine falsche Art.",
    "Das war Hypervigilanz — in einer anderen Maske. Der Unbekannte auf dem Hinterhof ist dein eigener Wachposten. Man muss ihn nicht vertreiben — man muss ihn nur versetzen."),

  // ── Dissozia, die Glasgeistin (Sie ist hier und nicht hier) ──
  v("fernrohr", DISSOZIATION, "Das Fernrohr aus Watte", "Alles da, alles weit weg", 190, 0.9,
    "Du siehst die Welt durch ein Fernrohr aus Watte: alles ist da, alles ist scharf — nur nicht hier. Der Abstand tut nicht weh. Das ist sein Geschenk und sein Preis.",
    "Das war Dissoziation — in einer anderen Maske. Das Fernrohr hat dich einmal gerettet, als Nähe zu viel war. Du darfst es absetzen. Die Welt kommt näher, wenn du es zulässt."),
  v("nebelfenster", DISSOZIATION, "Das Nebelfenster", "Berühren von der anderen Seite", 200, 1.05,
    "Zwischen dir und dem Tag liegt eine Scheibe, beschlagen von innen. Du schreibst mit dem Finger hinein — die Buchstaben bleiben, aber sie stehen auf der anderen Seite.",
    "Das war Dissoziation — in einer anderen Maske. Das Nebelfenster trennt nicht aus Bosheit. Es hat gelernt, dass Abstand sicherer war. Auch Scheiben dürfen geöffnet werden."),
  v("puppenspieler", DISSOZIATION, "Die Puppe an der Hand", "Lächlt pünktlich, kommt nie an", 175, 0.85,
    "Eine Puppe geht an deiner Stelle durch den Tag: Sie lacht pünktlich, antwortet brav, kommt aber nie wirklich an. Irgendwo hinten hält jemand die Fäden — müde, fleißig, ungesehen.",
    "Das war Dissoziation — in einer anderen Maske. Die Puppe ist kein Verrat an dir. Sie ist ein Double, das dich vertreten hat, als du nicht konntest. Jetzt darf sie Pause machen."),

  // ── Erstarrion (Der eingefrorene Schrei) ──
  v("eisblume", ERSTARUNG, "Die Eisblume am Fenster", "Wächst, während du zählst", 210, 1.0,
    "Am Fenster deiner Brust wächst eine Blume aus Eis. Jedes Blatt ist ein stiller Countdown: Eins. Zwei. Drei. Sie wächst nicht, um dich einzusperren — sie wächst, während du zählst.",
    "Das war Erstarrung — in einer anderen Maske. Die Eisblume ist kein Gefängnis. Sie ist der Ort, an dem du damals gewartet hast, bis es vorbei ist. Es ist vorbei. Die Blume darf schmelzen."),
  v("stillgestanden", ERSTARUNG, "Der Stillgestandene", "Wartet auf ein Zeichen, das nie kam", 195, 1.2,
    "Mitten im Raum steht jemand, der nicht mehr weiß, wohin mit den Händen, mit dem Satz, mit dem Körper. Er wartet auf ein Zeichen, das einmal nicht kam — und wartet es bis heute nach.",
    "Das war Erstarrung — in einer anderen Maske. Stillgestanden ist kein Versagen. Es ist ein Körper, der einmal die richtige Antwort auf eine falsche Zeit gefunden hat. Die Zeit hat sich geändert. Er darf gehen."),
  v("panzerglas", ERSTARUNG, "Das Panzerglas", "Hält, was Eis nicht hält", 220, 1.35,
    "Zwischen dir und allem anderen steht eine Scheibe, härter als Glas, kälter als Eis. Nichts kommt durch — auch das Gute nicht. Die Scheibe hat einmal einen Sturm ausgehalten, den niemand sonst gesehen hat.",
    "Das war Erstarrung — in einer anderen Maske. Das Panzerglas war nie Kälte. Es war Architektur: das stabilste, was du in einer Nacht bauen konntest. Nachts sind alle Mauern erlaubt. Aber es wird Tag."),
];

export const VARIANTS: readonly VariantDef[] = [...QUALITY_12, ...MASK_TUPLES.map((t) => m(...t))];

export const VARIANT_BY_ID: ReadonlyMap<string, VariantDef> = new Map(VARIANTS.map((x) => [x.id, x]));

export function variantsOf(nodeId: string): VariantDef[] {
  return VARIANTS.filter((x) => x.nodeId === nodeId);
}

// ─── Register-Zustände (Atlas-Register, „Pokédex") ─────────────────

export type VariantRegisterState = "unerkannt" | "gefunden" | "begriffen";

export interface VariantProgress {
  variantsUnderstood: string[]; // begriffene Masken
  variantsMet: string[]; // gefundene (begegnete) Masken
}

export function variantState(x: VariantDef, p: GraphProgress, vp: VariantProgress): VariantRegisterState {
  if (p.understood.includes(x.nodeId) || vp.variantsUnderstood.includes(x.id)) return "begriffen";
  if (vp.variantsMet.includes(x.id)) return "gefunden";
  return "unerkannt";
}

/** Masken, die durch das Begreifen des Kerns automatisch begriffen sind. */
export function autoUnderstoodByNode(nodeId: string, vp: VariantProgress): VariantDef[] {
  return variantsOf(nodeId).filter((x) => !vp.variantsUnderstood.includes(x.id));
}

export interface VariantClusterStat {
  clusterId: string;
  total: number;
  understood: number;
  met: number;
}

export function variantClusterStats(p: GraphProgress, vp: VariantProgress): VariantClusterStat[] {
  const per = new Map<string, VariantClusterStat>();
  for (const x of VARIANTS) {
    const node = NODE_BY_ID.get(x.nodeId);
    if (!node) continue;
    const cur = per.get(node.cluster) ?? { clusterId: node.cluster, total: 0, understood: 0, met: 0 };
    cur.total++;
    const st = variantState(x, p, vp);
    if (st === "begriffen") cur.understood++;
    else if (st === "gefunden") cur.met++;
    per.set(node.cluster, cur);
  }
  return [...per.values()];
}

// ─── Tages-Rotation + Drift (deterministisch, kein FOMO) ───────────

export interface VariantSpawn {
  variant: VariantDef;
  /** Wo die Maske heute schwirrt: Heimat-Knoten oder Drift-Ziel. */
  hostNodeId: string;
  /** Gastgeber-Insel (Strand-Spawn) oder null (Meer-Spawn). */
  islandId: string | null;
  x: number;
  z: number;
  y: number;
  drifted: boolean;
  /** true = Meer-Spawn (begegnbar vom Schiff), false = Strand (zu Fuß). */
  water: boolean;
}

// Pro Kontinent die Legacy-Hauptstädte, an deren Stränden Masken
// landen dürfen. Kontinente ohne Hauptstadt (Körper, Bindung, Wut)
// schwirren komplett auf dem Meer — der Graph wird auf Segeltörn
// fühlbar, bevor er betreten ist.
const CLUSTER_HOSTS: Record<string, string[]> = {
  alarm: ["hypervigilanz", "herzrasen"],
  glas: ["dissoziation", "erstarrung"],
  scham: ["scham", "leere"],
  misstrauen: ["misstrauen", "naehe"],
  wiederkehr: ["flashback", "albtraum"],
  koerper: [],
  bindung: [],
  wut: [],
  muedigkeit: ["vermeidung", "verdraengung"],
  auge: [],
};

/** Heimat-Gastgeber eines Knotens: die Insel seiner Stadt, sonst null (Meer). */
function homeHostId(variantId: string, node: PhenomenonNode): string | null {
  if (node.legacy && node.id !== "sturmherd") return node.id;
  const hosts = CLUSTER_HOSTS[node.cluster] ?? [];
  if (hosts.length === 0) return null;
  return hosts[mix(`${variantId}|heimat`) % hosts.length];
}

/**
 * Drift-Ziel einer Maske an einem Tag: deterministisch gewählter
 * Nachbar (das Auge ausgenommen — es ist die Mitte, kein Ufer).
 * Nicht-Legacy-Ziele sind erlaubt: Die Maske schwimmt dann im Meer
 * vor dem Kontinent und ist vom Schiff aus zu begegnen.
 */
function driftTarget(variantId: string, dateIso: string, nodeId: string): string | null {
  const nbs = [...(neighborIndex.get(nodeId) ?? [])]
    .filter((n) => n !== "sturmherd" && NODE_BY_ID.has(n))
    .sort();
  if (nbs.length === 0) return null;
  return nbs[mix(`${dateIso}|${variantId}|ziel`) % nbs.length];
}

/** Deterministischer Strandpunkt einer Maske auf ihrer heutigen Insel. */
function maskBeachPoint(variantId: string, dateIso: string, islandId: string): { x: number; z: number; y: number } {
  const isl = ISLANDS.find((i) => i.id === islandId);
  if (!isl) throw new Error(`Unbekannte Gastgeber-Insel: ${islandId}`);
  const rng = mulberry32(hashId(`${dateIso}|${variantId}|strand`));
  for (let tries = 0; tries < 60; tries++) {
    const a = rng() * Math.PI * 2;
    const r = (0.55 + rng() * 0.35) * isl.radius;
    const x = isl.x + Math.cos(a) * r;
    const z = isl.z + Math.sin(a) * r;
    const y = terrainHeight(x, z);
    if (y > 0.8 && y < 5 && terrainSlope(x, z) < 0.28) return { x, y, z };
  }
  return { x: isl.x, y: terrainHeight(isl.x, isl.z + isl.radius * 0.3), z: isl.z + isl.radius * 0.3 };
}

/** Deterministischer Meerpunkt vor einem Knoten (offenes Wasser). */
function maskSeaPoint(variantId: string, dateIso: string, node: PhenomenonNode): { x: number; z: number; y: number } {
  const rng = mulberry32(hashId(`${dateIso}|${variantId}|meer`));
  let x = node.x;
  let z = node.z;
  for (let tries = 0; tries < 60; tries++) {
    const a = rng() * Math.PI * 2;
    const r = 60 + rng() * 110;
    x = node.x + Math.cos(a) * r;
    z = node.z + Math.sin(a) * r;
    if (terrainHeight(x, z) < -1.2) break;
  }
  return { x: Math.round(x), y: 1.0, z: Math.round(z) };
}

/**
 * Welche Masken schwirren heute wo? Reine Funktion von Datum + Stand.
 *  · Masken begriffener Knoten tauchen nicht auf (durchschaut, im Register).
 *  · Begriffene Masken tauchen nicht auf (sie sind im Register).
 *  · ~1/5 der Masken pausiert pro Tag (Ruhetag) — nie verfallen, immer wieder da.
 *  · ~1/4 der anwesenden Masken driftet an einem Tag zu einem Nachbarn.
 */
export function todaysVariants(dateIso: string, p: GraphProgress, vp: VariantProgress): VariantSpawn[] {
  const spawns: VariantSpawn[] = [];
  const seed = dailySeed(dateIso);
  for (const x of VARIANTS) {
    if (p.understood.includes(x.nodeId)) continue; // Kern durchschaut → alle Masken begriffen
    if (vp.variantsUnderstood.includes(x.id)) continue;
    if (mix(`${dateIso}|${x.id}|ruhe|${seed}`) % 5 === 0) continue;
    const node = NODE_BY_ID.get(x.nodeId);
    if (!node) continue;
    const drifted = x.spawnRules.drift && mix(`${dateIso}|${x.id}|${seed}`) % 4 === 0;
    let hostId = drifted ? driftTarget(x.id, dateIso, x.nodeId) : null;
    if (!hostId) hostId = homeHostId(x.id, node);
    if (!hostId) {
      // Meer-Heimat: Die Maske schwimmt vor ihrem eigenen Kontinent.
      const pt = maskSeaPoint(x.id, dateIso, node);
      spawns.push({ variant: x, hostNodeId: node.id, islandId: null, ...pt, drifted: false, water: true });
      continue;
    }
    const host = NODE_BY_ID.get(hostId);
    if (!host) continue;
    if (host.legacy && host.id !== "sturmherd") {
      const pt = maskBeachPoint(x.id, dateIso, host.id);
      spawns.push({ variant: x, hostNodeId: host.id, islandId: host.id, ...pt, drifted, water: false });
    } else {
      const pt = maskSeaPoint(x.id, dateIso, host);
      spawns.push({ variant: x, hostNodeId: host.id, islandId: null, ...pt, drifted, water: true });
    }
  }
  return spawns;
}

/** QA: Liegt der Spawn im Wasser (Meer-Maske) oder am Strand? */
export function spawnTerrain(spawn: VariantSpawn): number {
  return terrainHeight(spawn.x, spawn.z);
}

/** Anzahl der Masken pro Tag (QA). */
export function variantsPerDay(dateIso: string, p: GraphProgress, vp: VariantProgress): number {
  return todaysVariants(dateIso, p, vp).length;
}

// ─── Hash-Helfer ───────────────────────────────────────────────────

/** Hash mit hoch-Bit-Avalanche (FNV-Niederwertbits sind für ähnliche Strings zu schwach). */
function mix(s: string): number {
  const raw = hashId(s);
  return (raw ^ (raw >>> 16)) >>> 0;
}

// Für QA: Nachbarschafts-Index, Knoten-Lookup + Graph durchreichen.
export { neighborIndex, NODE_BY_ID, GRAPH_NODES };
