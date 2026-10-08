// PHÄNOMENAUTIK 3 — Kletterwände (Zelda-Regel): Felstürme mit hellen
// Moosflecken. Die Welt hat keine natürlichen Klippen (max. Steigung ≈ 1 m
// auf 4,5 m) — darum sind die Wände freistehende Felsformationen, die an
// Hänge gelehnt werden: kletterbare Front, begehbares Plateau als Aussicht.
// Datengetrieben: pro Insel wird deterministisch der steilste Hangpunkt
// gesucht; die Terrain-Höhenfunktion bleibt die Wahrheit für den Wandfuß.

import { ALL_LAND, terrainHeight } from "./worldLayout";
import { clamp } from "./noise";

export interface ClimbWallDef {
  id: string;
  island: string;
  x: number; // Wandmitte (Basis)
  z: number;
  yaw: number; // Blickrichtung der Wand (Normalenrichtung, zeigt inslandauswärts)
  width: number; // kletterbare Breite (m)
  height: number; // kletterbare Höhe (m)
  baseY: number; // Höhe des Wandfußes
  topDepth: number; // Tiefe des Plateaus hinter der Wandkante (m)
}

/** Sucht den steilsten Hangpunkt einer Insel als Standort für den Felsturm. */
function scanWall(islandId: string, wantHeight: number, angleOffsetDeg: number): ClimbWallDef | null {
  const isl = ALL_LAND.find((i) => i.id === islandId);
  if (!isl) return null;

  let best: { score: number; x: number; z: number; a: number; baseY: number } | null = null;
  for (let deg = angleOffsetDeg; deg < angleOffsetDeg + 360; deg += 5) {
    const a = (deg * Math.PI) / 180;
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    for (let r = isl.radius * 0.9; r > isl.radius * 0.25; r -= 2.5) {
      const x = isl.x + dx * r;
      const z = isl.z + dz * r;
      const hOut = terrainHeight(x, z);
      if (hOut < 1.4 || hOut > isl.peak * 0.5) continue; // Fuß bequem vom Strand erreichbar
      const slope = (terrainHeight(x - dx * 4.5, z - dz * 4.5) - hOut) / 4.5;
      const score = slope + hOut * 0.01;
      if (!best || score > best.score) best = { score, x, z, a, baseY: hOut };
      break; // pro Richtung nur die äußerste Stelle
    }
  }
  if (!best) return null;

  return {
    id: `wand_${islandId}`,
    island: islandId,
    x: best.x,
    z: best.z,
    yaw: Math.atan2(Math.sin(best.a), Math.cos(best.a)),
    width: 7,
    height: clamp(wantHeight, 5, 14),
    baseY: best.baseY,
    topDepth: 4.2,
  };
}

// Gewünschte Wände: Wunsch-Höhe + Drehung des Suchstartwinkels (Varianz)
const WALL_SPOTS: { island: string; height: number; angleOffset: number }[] = [
  { island: "harbor", height: 7, angleOffset: 0 },
  { island: "erstarrung", height: 13, angleOffset: 37 },
  { island: "hypervigilanz", height: 11, angleOffset: 71 },
  { island: "verdraengung", height: 11, angleOffset: 113 },
  { island: "scham", height: 10, angleOffset: 149 },
  { island: "misstrauen", height: 9, angleOffset: 191 },
  { island: "leere", height: 8, angleOffset: 223 },
  { island: "sturmherd", height: 14, angleOffset: 269 },
];

export const CLIMB_WALLS: ClimbWallDef[] = WALL_SPOTS.map((s) =>
  scanWall(s.island, s.height, s.angleOffset),
).filter((w): w is ClimbWallDef => w !== null);

/** Wand-Koordinatenrahmen: Normale (zeigt vom Hang weg) und Rechtsvektor */
export function wallFrame(def: ClimbWallDef): { nx: number; nz: number; rx: number; rz: number } {
  return {
    nx: Math.sin(def.yaw),
    nz: Math.cos(def.yaw),
    rx: -Math.cos(def.yaw),
    rz: Math.sin(def.yaw),
  };
}

/** Projiziert eine Position in den Wandrahmen. */
export function wallCoords(
  def: ClimbWallDef,
  px: number,
  py: number,
  pz: number,
): { dist: number; lateral: number; v: number } {
  const { nx, nz, rx, rz } = wallFrame(def);
  const dx = px - def.x;
  const dz = pz - def.z;
  return {
    dist: dx * nx + dz * nz, // Abstand vor der Wandebene (m)
    lateral: dx * rx + dz * rz, // seitlich entlang der Wand (m)
    v: py - def.baseY, // Höhe entlang der Wand (m)
  };
}

/** Begehbares Plateau auf dem Felsturm: Höhe, wenn (x,z) auf der Plattform liegt. */
export function cliffTopAt(x: number, z: number): number | null {
  for (const def of CLIMB_WALLS) {
    const { nx, nz, rx, rz } = wallFrame(def);
    const dx = x - def.x;
    const dz = z - def.z;
    const dist = dx * nx + dz * nz;
    const lateral = dx * rx + dz * rz;
    if (dist > 0.4 || dist < -def.topDepth) continue;
    if (Math.abs(lateral) > def.width / 2 + 1.2) continue;
    return def.baseY + def.height;
  }
  return null;
}
