// PHÄNOMENAUTIK 3 — Weltlayout & Terrain-Höhenfunktion
// Eine einzige Höhenfunktion (CPU) treibt Terrain-Mesh, Kollision,
// Wassertiefen-Textur und Prop-Platzierung — alles konsistent.

import { clamp, fbm2, smoothstep } from "./noise";

export const WORLD_SIZE = 4200;
export const SEA_FLOOR = -22;

export interface IslandDef {
  id: string; // Phänomen-ID oder "harbor"
  x: number;
  z: number;
  radius: number; // Küstenlinien-Radius (h ≈ 0)
  peak: number; // Maximalhöhe
  seed: number;
  trees: number;
  flat: number; // 0..1 — wie stark das Relief im Kern eingeebnet wird (begehbarer)
}

export const HARBOR: IslandDef = {
  id: "harbor",
  x: 2100,
  z: 3300,
  radius: 175,
  peak: 26,
  seed: 42,
  trees: 60,
  flat: 0.55,
};

// Positionen wie in V2 bewährt, Radien deutlich größer (begehbare Inseln)
export const ISLANDS: IslandDef[] = [
  { id: "flashback", x: 760, z: 1020, radius: 165, peak: 30, seed: 1001, trees: 55, flat: 0.35 },
  { id: "albtraum", x: 1150, z: 640, radius: 150, peak: 34, seed: 1002, trees: 45, flat: 0.3 },
  { id: "hypervigilanz", x: 2050, z: 520, radius: 170, peak: 44, seed: 1003, trees: 40, flat: 0.25 },
  { id: "herzrasen", x: 2520, z: 830, radius: 145, peak: 28, seed: 1004, trees: 50, flat: 0.4 },
  { id: "vermeidung", x: 3330, z: 900, radius: 160, peak: 32, seed: 1005, trees: 55, flat: 0.35 },
  { id: "verdraengung", x: 3560, z: 1330, radius: 175, peak: 40, seed: 1006, trees: 35, flat: 0.3 },
  { id: "dissoziation", x: 3450, z: 2520, radius: 165, peak: 36, seed: 1007, trees: 45, flat: 0.35 },
  { id: "erstarrung", x: 3120, z: 3030, radius: 180, peak: 52, seed: 1008, trees: 30, flat: 0.2 },
  { id: "scham", x: 2140, z: 2560, radius: 170, peak: 38, seed: 1009, trees: 45, flat: 0.3 },
  { id: "leere", x: 1620, z: 2940, radius: 155, peak: 30, seed: 1010, trees: 35, flat: 0.45 },
  { id: "misstrauen", x: 820, z: 2500, radius: 150, peak: 33, seed: 1011, trees: 50, flat: 0.35 },
  { id: "naehe", x: 1040, z: 3050, radius: 150, peak: 29, seed: 1012, trees: 60, flat: 0.4 },
  { id: "sturmherd", x: 2100, z: 1760, radius: 200, peak: 64, seed: 1013, trees: 0, flat: 0.15 },
];

// Die Scholle: winziges Eiland südlich des Hafens — nur per Floß/Brücke erreichbar
export const SCHOLLE: IslandDef = {
  id: "scholle",
  x: 2210,
  z: 3560,
  radius: 34,
  peak: 7,
  seed: 4711,
  trees: 6,
  flat: 0.4,
};

export const ALL_LAND: IslandDef[] = [...ISLANDS, HARBOR, SCHOLLE];

/** Höhenbeitrag einer einzelnen Insel (auch negativ unter Wasser, sanfter Abfall) */
function islandHeight(def: IslandDef, x: number, z: number): number {
  const dx = x - def.x;
  const dz = z - def.z;
  const d = Math.sqrt(dx * dx + dz * dz);
  const t = d / def.radius; // 0 = Zentrum, 1 = Küste

  // Meeresboden-Abfall außerhalb
  if (t >= 1.35) return SEA_FLOOR;

  // Basisprofil:Plateau-artiger Kern, langer flacher Strand
  const inland = Math.max(0, 1 - t); // 1 → 0
  let h = def.peak * Math.pow(inland, 1.55);

  // Relief: fBm, zum Strand hin gedämpft (sauberer Strand), Kern je nach flat eingeebnet
  const reliefAmp = def.peak * 0.5 * (1 - def.flat);
  const relief = fbm2(x * 0.011, z * 0.011, 4, def.seed) * reliefAmp * smoothstep(0.06, 0.5, inland);
  h += relief;

  // Felsige Sekundärkämme weit drinnen
  if (def.peak > 36) {
    h += Math.max(0, fbm2(x * 0.02 + 40, z * 0.02 - 17, 3, def.seed + 9)) * def.peak * 0.22 * smoothstep(0.35, 0.75, inland);
  }

  // Strand-Shelf: weicher Übergang durch die Wasserlinie
  const shore = smoothstep(1.35, 0.92, t); // 0 draußen → 1 am Strand
  const underwater = SEA_FLOOR * (1 - smoothstep(1.35, 1.0, t));
  h = h * shore + underwater;

  // Mikrovariation am Strand (breche Brandung sieht lebendiger aus)
  h += fbm2(x * 0.05, z * 0.05, 2, def.seed + 31) * 0.5 * (1 - Math.abs(t - 1));

  return h;
}

/** Weltweite Terrainhöhe (Maximum aller Inseln, Meeresgrund als Boden) */
export function terrainHeight(x: number, z: number): number {
  let h = SEA_FLOOR;
  for (const isl of ALL_LAND) {
    // Schneller Ausschluss per Bounding-Box
    const ext = isl.radius * 1.35;
    if (x < isl.x - ext || x > isl.x + ext || z < isl.z - ext || z > isl.z + ext) continue;
    const ih = islandHeight(isl, x, z);
    if (ih > h) h = ih;
  }
  return h;
}

/** Schrein-Punkt einer Insel: flache, erhöhte Stelle etwas südlich des Zentrums */
export function shrinePoint(isl: IslandDef): { x: number; z: number; y: number } {
  for (let dd = isl.radius * 0.12; dd < isl.radius * 0.5; dd += 2.5) {
    const x = isl.x;
    const z = isl.z + dd;
    const h = terrainHeight(x, z);
    if (h > 3.2 && terrainSlope(x, z) < 0.2) return { x, z, y: h };
  }
  const h = terrainHeight(isl.x, isl.z);
  return { x: isl.x, z: isl.z, y: h };
}

/** Welche Insel trägt diese Position (h > 0.2), sonst null */
export function islandAt(x: number, z: number): IslandDef | null {
  for (const isl of ALL_LAND) {
    const dx = x - isl.x;
    const dz = z - isl.z;
    if (dx * dx + dz * dz > (isl.radius * 1.3) ** 2) continue;
    if (islandHeight(isl, x, z) > 0.2) return isl;
  }
  return null;
}

export function distTo(x1: number, z1: number, x2: number, z2: number): number {
  return Math.sqrt((x1 - x2) ** 2 + (z1 - z2) ** 2);
}

/** Annäherung der Terrain-Normale per Zentraldifferenzen */
export function terrainNormal(x: number, z: number, out: { x: number; y: number; z: number }): void {
  const e = 0.9;
  const hL = terrainHeight(x - e, z);
  const hR = terrainHeight(x + e, z);
  const hD = terrainHeight(x, z - e);
  const hU = terrainHeight(x, z + e);
  out.x = hL - hR;
  out.y = 2 * e;
  out.z = hD - hU;
  const l = Math.sqrt(out.x ** 2 + out.y ** 2 + out.z ** 2) || 1;
  out.x /= l;
  out.y /= l;
  out.z /= l;
}

/** Hangneigung (0 = flach, 1 = senkrecht) */
export function terrainSlope(x: number, z: number): number {
  const n = { x: 0, y: 0, z: 0 };
  terrainNormal(x, z, n);
  return clamp(1 - n.y, 0, 1);
}
