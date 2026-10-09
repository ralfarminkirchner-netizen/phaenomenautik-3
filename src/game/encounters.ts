// ═══════════════════════════════════════════════════════════════════
// PHÄNOMENAUTIK — M4: Strand-Begegnungen (Stufe 1, Brief §1.4/§6.1)
// Sechs „Strandläufer“ auf den zwei Kontinenten der ersten Stunde
// (Alarm-Atoll & Glaswelt): kurz, wahr, freundlich — eine Zeile zum
// Ankommen, ein Verstehen-Mini, eine Friedenszeile, eine wahre Zeile
// fürs Atlas-Register. Kein Kampf, kein Fangen — Begreifen.
// ═══════════════════════════════════════════════════════════════════

import { ISLANDS, terrainHeight, terrainSlope } from "./worldLayout";
import { NODE_BY_ID, fogStateOf, hashId, type GraphProgress, type PhenomenonNode } from "./phenomenaGraph";
import { mulberry32 } from "./noise";

export interface StrandEncounterDef {
  nodeId: string;
  islandId: string; // Gastgeber-Insel (bestehende Landmasse)
  x: number;
  z: number;
  y: number; // Bodenhöhe am Strandpunkt
}

// Die sechs Starter — alle Nachbarn alter Hauptstädte (s. visibilityRule).
const HOST_ISLAND: Record<string, string> = {
  atemdruck: "herzrasen", // Alarm-Atoll
  tunnelblick: "hypervigilanz",
  motor: "hypervigilanz",
  zeitverlust: "dissoziation", // Glaswelt
  schalter: "erstarrung",
  glaspanzer: "erstarrung",
};

export const STRAND_IDS: readonly string[] = Object.keys(HOST_ISLAND);

/** Strandpunkt auf der Gastgeber-Insel: deterministisch, flach, über der Wasserlinie */
function beachPoint(nodeId: string, islandId: string): { x: number; z: number; y: number } {
  const isl = ISLANDS.find((i) => i.id === islandId);
  if (!isl) throw new Error(`Unbekannte Gastgeber-Insel: ${islandId}`);
  const rng = mulberry32(hashId(nodeId));
  for (let tries = 0; tries < 60; tries++) {
    const a = rng() * Math.PI * 2;
    const r = (0.55 + rng() * 0.35) * isl.radius;
    const x = isl.x + Math.cos(a) * r;
    const z = isl.z + Math.sin(a) * r;
    const y = terrainHeight(x, z);
    if (y > 0.8 && y < 5 && terrainSlope(x, z) < 0.28) return { x, y, z };
  }
  // Fallback: Schrein-Nähe (immer begehbar)
  return { x: isl.x, y: terrainHeight(isl.x, isl.z + isl.radius * 0.3), z: isl.z + isl.radius * 0.3 };
}

export const STRAND_ENCOUNTERS: readonly StrandEncounterDef[] = STRAND_IDS.map((nodeId) => ({
  nodeId,
  islandId: HOST_ISLAND[nodeId],
  ...beachPoint(nodeId, HOST_ISLAND[nodeId]),
}));

/** Node-Objekt zur Begegnung (wirft bei unbekannter Id — Datenfehler früh zeigen) */
export function encounterNode(nodeId: string): PhenomenonNode {
  const n = NODE_BY_ID.get(nodeId);
  if (!n) throw new Error(`Unbekannter Begegnungs-Knoten: ${nodeId}`);
  return n;
}

/**
 * Sichtbarkeit in der Welt (nicht der Karte): Die sechs Strandläufer
 * halten sich in den Gewässern der alten Hauptstädte auf — sie sind
 * von Anfang an da, weil die Hauptstädte ihre Umgebung ausleuchten.
 * Tiefere Knoten folgen dem Nebel (sichtbar/befahrbar/begegnet).
 */
export function strandVisible(nodeId: string, p: GraphProgress): boolean {
  if (p.understood.includes(nodeId)) return false; // begriffene lösen sich auf (Friedenszeile)
  const fog = fogStateOf(nodeId, p);
  if (fog !== "verborgen") return true;
  for (const nb of NODE_BY_ID.get(nodeId)?.edges ?? []) {
    if (NODE_BY_ID.get(nb.to)?.legacy) return true;
  }
  return false;
}
