// PHÄNOMENAUTIK 3 — Gebaute Strukturen: Floß (befahrbar!), Strickleiter
// (bekletterbar), Bohlenbrücke (begehbar). Jede liefert eine begehbare
// Höhenfunktion; Flöße wiegen sich auf den Wellen und nehmen den Spieler mit.

import * as THREE from "three";
import { terrainHeight } from "../game/worldLayout";
import { clamp } from "../game/noise";
import type { PlacedStructure } from "../game/state";

export type { PlacedStructure };

export interface StructureRec {
  def: PlacedStructure;
  obj: THREE.Object3D;
  deckY: number; // dynamisch (Floß folgt Wellen)
}

const woodMat = new THREE.MeshStandardMaterial({ color: 0x8a6b45, roughness: 0.85 });
const darkWood = new THREE.MeshStandardMaterial({ color: 0x6b4e33, roughness: 0.9 });
const ropeMat = new THREE.MeshStandardMaterial({ color: 0xc9a86a, roughness: 1 });
const sailMat = new THREE.MeshStandardMaterial({ color: 0xe8dfc8, roughness: 0.9, side: THREE.DoubleSide });

export function buildFloss(): THREE.Group {
  const g = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.32, 3.6, 7), woodMat);
    log.rotation.x = Math.PI / 2;
    log.position.set((i - 1.5) * 0.62, 0, 0);
    log.castShadow = true;
    g.add(log);
  }
  for (const zz of [-1.3, 0, 1.3]) {
    const lash = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 5), ropeMat);
    lash.rotation.z = Math.PI / 2;
    lash.position.set(0, 0.3, zz);
    g.add(lash);
  }
  // Mast + kleines Segel
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 2.8, 6), darkWood);
  mast.position.set(0, 1.5, -1.1);
  g.add(mast);
  const sail = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), sailMat);
  sail.position.set(0, 2.0, -1.05);
  g.add(sail);
  return g;
}

export function buildLeiter(def: PlacedStructure): THREE.Group {
  const g = new THREE.Group();
  const len = 6.5;
  for (const s of [-0.35, 0.35]) {
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, len, 5), woodMat);
    rail.rotation.x = -Math.PI / 3.4; // angelehnt
    rail.position.set(s, (len / 2) * Math.cos(Math.PI / 3.4), -(len / 2) * Math.sin(Math.PI / 3.4) * -1);
    rail.castShadow = true;
    g.add(rail);
  }
  for (let i = 0; i < 6; i++) {
    const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 5), ropeMat);
    rung.rotation.z = Math.PI / 2;
    const f = (i + 0.6) / 6.6;
    rung.position.set(0, f * len * Math.cos(Math.PI / 3.4), f * len * Math.sin(Math.PI / 3.4));
    g.add(rung);
  }
  void def;
  return g;
}

export function buildBruecke(def: PlacedStructure): THREE.Group {
  const g = new THREE.Group();
  const len = Math.hypot((def.ex ?? def.x) - def.x, (def.ez ?? def.z) - def.z);
  const n = Math.max(3, Math.floor(len / 1.1));
  for (let i = 0; i < n; i++) {
    const s = (i + 0.5) / n;
    const plank = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.12, len / n - 0.15), woodMat);
    plank.position.set(0, -Math.sin(s * Math.PI) * 0.25, s * len);
    plank.castShadow = true;
    plank.receiveShadow = true;
    g.add(plank);
  }
  for (const s of [-1, 1]) {
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, len, 4), ropeMat);
    rope.rotation.x = Math.PI / 2;
    rope.position.set(s * 0.9, 0.55, len / 2);
    g.add(rope);
    for (let i = 0; i <= 3; i++) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.7, 5), darkWood);
      post.position.set(s * 0.9, 0.2, (i / 3) * len);
      g.add(post);
    }
  }
  return g;
}

export class Structures {
  group = new THREE.Group();
  items: StructureRec[] = [];

  constructor(scene: THREE.Scene, placed: PlacedStructure[]) {
    scene.add(this.group);
    for (const def of placed) this.add(def, false);
  }

  add(def: PlacedStructure, live = true): StructureRec {
    let obj: THREE.Object3D;
    if (def.type === "floss") obj = buildFloss();
    else if (def.type === "leiter") obj = buildLeiter(def);
    else obj = buildBruecke(def);
    obj.position.set(def.x, def.type === "floss" ? 0.1 : def.topY ? terrainHeight(def.x, def.z) : 0, def.z);
    obj.rotation.y = def.yaw;
    if (def.type === "bruecke") obj.position.y = (def.topY ?? terrainHeight(def.x, def.z));
    if (def.type === "leiter") obj.position.y = terrainHeight(def.x, def.z);
    this.group.add(obj);
    const rec: StructureRec = { def, obj, deckY: obj.position.y };
    this.items.push(rec);
    if (live) this.dirty = true;
    return rec;
  }

  dirty = false;

  /** Begehbare Höhe an (x,z) — oder null, wenn keine Struktur darunter */
  heightAt(x: number, z: number): number | null {
    for (const rec of this.items) {
      const d = rec.def;
      if (d.type === "floss") {
        const dx = x - d.x;
        const dz = z - d.z;
        const c = Math.cos(-d.yaw);
        const s = Math.sin(-d.yaw);
        const lx = dx * c - dz * s;
        const lz = dx * s + dz * c;
        if (Math.abs(lx) < 1.3 && Math.abs(lz) < 2.0) return rec.deckY + 0.42;
      } else if (d.type === "leiter") {
        // entlang der Richtung projizieren
        const fx = Math.sin(d.yaw + Math.PI);
        const fz = Math.cos(d.yaw + Math.PI);
        const dx = x - d.x;
        const dz = z - d.z;
        const s = dx * fx + dz * fz;
        const across = Math.abs(dx * -fz + dz * fx);
        if (s >= 0 && s <= 6.2 && across < 0.9) {
          const g0 = terrainHeight(d.x, d.z);
          const top = d.topY ?? g0 + 4;
          return g0 + (s / 6.2) * (top - g0) + 0.1;
        }
      } else if (d.type === "bruecke") {
        const ex = d.ex ?? d.x;
        const ez = d.ez ?? d.z;
        const fx = ex - d.x;
        const fz = ez - d.z;
        const len = Math.hypot(fx, fz);
        if (len < 0.1) continue;
        const nx = fx / len;
        const nz = fz / len;
        const dx = x - d.x;
        const dz = z - d.z;
        const s = dx * nx + dz * nz;
        const across = Math.abs(dx * -nz + dz * nx);
        if (s >= -0.6 && s <= len + 0.6 && across < 1.1) {
          return (d.topY ?? terrainHeight(d.x, d.z)) + 0.22;
        }
      }
    }
    return null;
  }

  /** Floß unter dem Spieler (falls darauf stehend) */
  raftUnder(x: number, z: number): StructureRec | null {
    for (const rec of this.items) {
      if (rec.def.type !== "floss") continue;
      const d = rec.def;
      const dx = x - d.x;
      const dz = z - d.z;
      const c = Math.cos(-d.yaw);
      const s = Math.sin(-d.yaw);
      const lx = dx * c - dz * s;
      const lz = dx * s + dz * c;
      if (Math.abs(lx) < 1.5 && Math.abs(lz) < 2.2) return rec;
    }
    return null;
  }

  /** Flöße wiegen; Paddeln bewegt sie (nur im Wasser) */
  updateRafts(
    dt: number,
    t: number,
    waveY: (x: number, z: number) => number,
    paddle: { active: boolean; dirX: number; dirZ: number; rec: StructureRec | null },
  ): { movedX: number; movedZ: number } {
    let movedX = 0;
    let movedZ = 0;
    for (const rec of this.items) {
      if (rec.def.type !== "floss") continue;
      const d = rec.def;
      // Paddeln
      if (paddle.active && paddle.rec === rec) {
        const depthNow = terrainHeight(d.x, d.z);
        const depth = terrainHeight(d.x + paddle.dirX * 2.5, d.z + paddle.dirZ * 2.5);
        if (depth < -0.4 || depth < depthNow - 0.05) {
          const sp = 3.1 * dt;
          d.x += paddle.dirX * sp;
          d.z += paddle.dirZ * sp;
          movedX = paddle.dirX * sp;
          movedZ = paddle.dirZ * sp;
          this.dirty = true;
        }
      }
      const wy = waveY(d.x, d.z);
      const inWater = terrainHeight(d.x, d.z) < 0.4;
      rec.deckY = inWater ? wy : terrainHeight(d.x, d.z);
      rec.obj.position.set(d.x, rec.deckY, d.z);
      rec.obj.rotation.y = d.yaw + Math.sin(t * 0.7 + d.x) * 0.02;
      rec.obj.rotation.x = Math.sin(t * 1.1 + d.z) * 0.035;
      rec.obj.rotation.z = Math.cos(t * 0.9 + d.x) * 0.04;
    }
    return { movedX, movedZ };
  }

  /** Zum Speichern */
  toSave(): PlacedStructure[] {
    return this.items.map((r) => ({ ...r.def }));
  }
}

export function clampSpan(x0: number, z0: number, x1: number, z1: number, maxLen: number): { ex: number; ez: number } {
  const dx = x1 - x0;
  const dz = z1 - z0;
  const len = Math.hypot(dx, dz) || 1;
  const f = Math.min(1, maxLen / len);
  return { ex: x0 + dx * f, ez: z0 + dz * f };
}
