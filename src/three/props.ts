// PHÄNOMENAUTIK 3 — Props: fällbare Bäume als GLTF-Modelle (Palmen & Laubbäume,
// instanziiert), Felsen, Treibholz, Lagerfeuer-Modell, Werkbank, Steg,
// Hafen-Dekoration (Ruderboot, Zelt, Fässer, Truhe).

import * as THREE from "three";
import { ALL_LAND, HARBOR, terrainHeight, terrainSlope } from "../game/worldLayout";
import { mulberry32 } from "../game/noise";
import type { ParticleSystem } from "./particles";
import { extractMerged, getModel, normalizeHeight, setShadows, type ModelKey } from "./assets";

type TreeVariant = "palmA" | "palmB" | "treeSingleA" | "treeSingleB";

export interface TreeRec {
  id: string;
  x: number; y: number; z: number;
  scale: number;
  variant: TreeVariant;
  state: "standing" | "falling" | "stump";
  fallT: number;
  fallDirX: number; fallDirZ: number;
  hits: number;
  respawnAt: number;
  idx: number; // Instanz-Index (identisch in allen Meshes)
}

export interface FireRec {
  id: string;
  x: number; y: number; z: number;
  lit: boolean;
  light: THREE.PointLight;
  group: THREE.Group;
}

export interface DriftRec {
  mesh: THREE.Mesh;
  x: number; z: number;
  taken: boolean;
  respawnAt: number;
  spin: number;
}

const TREE_KEYS: TreeVariant[] = ["palmA", "palmB", "treeSingleA", "treeSingleB"];
const STUMP_OF: Record<TreeVariant, ModelKey> = {
  palmA: "stumpB", palmB: "stumpB", treeSingleB: "stumpB", treeSingleA: "stumpA",
};
const TREE_HEIGHT: Record<TreeVariant, number> = {
  palmA: 7.5, palmB: 8.5, treeSingleA: 8, treeSingleB: 9,
};
const STUMP_HEIGHT: Record<string, number> = { stumpA: 1.1, stumpB: 1.1 };

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _v = new THREE.Vector3();
const _s = new THREE.Vector3();
const _e = new THREE.Euler();

export class Props {
  group = new THREE.Group();
  trees: TreeRec[] = [];
  fires: FireRec[] = [];
  driftwood: DriftRec[] = [];
  colliders: { x: number; z: number; r: number }[] = [];

  private variantMeshes = new Map<string, THREE.InstancedMesh>();
  private treeCount = 0;
  workbench = { x: 0, y: 0, z: 0 };
  dock = { x: 0, z: 0, len: 26, width: 4.2, y: 1.5, dirX: 0, dirZ: 1 };

  constructor(scene: THREE.Scene) {
    this.group.name = "props";
    scene.add(this.group);
    this.placeHarborStructures();
    this.placeTrees();
    this.placeRocks();
    this.placeDriftwood();
    this.placeFires();
    this.placeHarborDecor();
  }

  private makeInstancedVariant(key: ModelKey, capacity: number, targetH: number): THREE.InstancedMesh {
    const { geometry, materials } = extractMerged(key);
    // normieren: Modellhöhe → targetH
    geometry.computeBoundingBox();
    const bb = geometry.boundingBox!;
    const h = Math.max(bb.max.y - bb.min.y, 0.0001);
    const s = targetH / h;
    geometry.translate(0, -bb.min.y, 0);
    geometry.scale(s, s, s);
    const mat = materials.length === 1 ? materials[0] : materials;
    const mesh = new THREE.InstancedMesh(geometry, mat, capacity);
    mesh.castShadow = true;
    mesh.receiveShadow = false;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    // alles auf 0 = unsichtbar
    _m.makeScale(0, 0, 0);
    for (let i = 0; i < capacity; i++) mesh.setMatrixAt(i, _m);
    this.group.add(mesh);
    return mesh;
  }

  // ── Hafen: Steg & Werkbank ──────────────────────────────────────
  private placeHarborStructures() {
    const dir = { x: 0, z: 1 };
    let bx = HARBOR.x;
    let bz = HARBOR.z;
    for (let d = HARBOR.radius * 0.4; d < HARBOR.radius * 1.5; d += 2) {
      const x = HARBOR.x + dir.x * d;
      const z = HARBOR.z + dir.z * d;
      if (terrainHeight(x, z) < 1.1) {
        bx = x;
        bz = z;
        break;
      }
    }
    this.dock = { x: bx, z: bz, len: 26, width: 4.2, y: 1.5, dirX: dir.x, dirZ: dir.z };

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x7a5c3d, roughness: 0.9 });
    const darkWood = new THREE.MeshStandardMaterial({ color: 0x5d4630, roughness: 0.95 });
    const dockGroup = new THREE.Group();
    for (let i = 0; i < 9; i++) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(this.dock.width, 0.18, 2.6), woodMat);
      plank.position.set(bx + dir.x * (i * 3 - 4), this.dock.y, bz + dir.z * (i * 3 - 4));
      plank.castShadow = true;
      plank.receiveShadow = true;
      dockGroup.add(plank);
    }
    for (let i = 0; i < 4; i++) {
      for (const s of [-1, 1]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 4.4, 6), darkWood);
        post.position.set(
          bx + dir.x * (i * 7.5 - 3) + s * (this.dock.width / 2 - 0.3),
          this.dock.y - 1.8,
          bz + dir.z * (i * 7.5 - 3),
        );
        post.castShadow = true;
        dockGroup.add(post);
      }
    }
    this.group.add(dockGroup);

    // Werkbank
    const wx = bx + 16;
    const wz = bz - 14;
    const wy = terrainHeight(wx, wz);
    this.workbench = { x: wx, y: wy, z: wz };
    const bench = new THREE.Group();
    const top = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.22, 1.5), woodMat);
    top.position.y = 1.05;
    top.castShadow = true;
    bench.add(top);
    for (const sx of [-1.4, 1.4]) {
      for (const sz of [-0.55, 0.55]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.05, 0.22), darkWood);
        leg.position.set(sx, 0.5, sz);
        bench.add(leg);
      }
    }
    bench.position.set(wx, wy, wz);
    bench.rotation.y = -0.4;
    this.group.add(bench);
    this.colliders.push({ x: wx, z: wz, r: 2.0 });
  }

  // ── Hafen-Dekoration (Modelle) ───────────────────────────────────
  private placeHarborDecor() {
    const add = (key: ModelKey, x: number, z: number, targetH: number, rotY = 0) => {
      const obj = getModel(key).scene.clone(true);
      normalizeHeight(obj, targetH);
      const y = key === "rowboat" ? 0 : terrainHeight(x, z);
      obj.position.set(x, y, z);
      obj.rotation.y = rotY;
      setShadows(obj, true, false);
      this.group.add(obj);
      return obj;
    };
    const d = this.dock;
    const wb = this.workbench;
    add("tent", wb.x + 10, wb.z - 6, 2.6, -0.7);
    add("barrel", wb.x - 2.5, wb.z - 2, 0.9, 0.3);
    add("barrel", wb.x - 3.4, wb.z - 1.2, 0.85, 1.8);
    add("chest", wb.x + 3.2, wb.z - 2.2, 0.8, 0.9);
    this.colliders.push({ x: wb.x + 10, z: wb.z - 6, r: 1.8 });
    this.colliders.push({ x: wb.x - 3, z: wb.z - 1.6, r: 1.0 });
    // Ruderboot neben dem Steg im Wasser
    const boat = add("rowboat", d.x + 6, d.z + 20, 1.1, 0.5);
    boat.position.y = 0.15;
  }

  // ── Bäume ────────────────────────────────────────────────────────
  private placeTrees() {
    interface P { x: number; y: number; z: number; s: number; v: TreeVariant }
    const placements: P[] = [];
    for (const isl of ALL_LAND) {
      if (isl.trees === 0) continue;
      const rng = mulberry32(isl.seed * 7 + 3);
      const pts: P[] = [];
      let attempts = 0;
      while (pts.length < isl.trees && attempts < isl.trees * 40) {
        attempts++;
        const a = rng() * Math.PI * 2;
        const r = Math.sqrt(rng()) * isl.radius * 0.9;
        const x = isl.x + Math.cos(a) * r;
        const z = isl.z + Math.sin(a) * r;
        const h = terrainHeight(x, z);
        if (h < 2.2 || h > isl.peak * 0.86) continue;
        if (terrainSlope(x, z) > 0.34) continue;
        if (isl.id === "harbor") {
          const dd = (x - this.dock.x) ** 2 + (z - this.dock.z) ** 2;
          if (dd < 30 ** 2) continue;
          const dw = (x - this.workbench.x) ** 2 + (z - this.workbench.z) ** 2;
          if (dw < 12 ** 2) continue;
        }
        let ok = true;
        for (const q of pts) {
          if ((q.x - x) ** 2 + (q.z - z) ** 2 < 5.2 ** 2) {
            ok = false;
            break;
          }
        }
        if (!ok) continue;
        // Strandnähe → Palmen, sonst Laub-Einzelbäume
        let v: TreeVariant;
        if (h < 6.2) v = rng() < 0.6 ? "palmA" : "palmB";
        else v = rng() < 0.55 ? "treeSingleA" : "treeSingleB";
        pts.push({ x, y: h, z, s: 0.8 + rng() * 0.55, v });
      }
      placements.push(...pts);
    }

    this.treeCount = placements.length;
    const n = this.treeCount;
    for (const key of TREE_KEYS) this.variantMeshes.set(key, this.makeInstancedVariant(key, n, TREE_HEIGHT[key]));
    this.variantMeshes.set("stumpA", this.makeInstancedVariant("stumpA", n, STUMP_HEIGHT.stumpA));
    this.variantMeshes.set("stumpB", this.makeInstancedVariant("stumpB", n, STUMP_HEIGHT.stumpB));

    placements.forEach((p, i) => {
      const rec: TreeRec = {
        id: `tree_${i}`,
        x: p.x, y: p.y, z: p.z, scale: p.s, variant: p.v,
        state: "standing", fallT: 0, fallDirX: 1, fallDirZ: 0, hits: 0,
        respawnAt: 0, idx: i,
      };
      this.trees.push(rec);
      this.writeTreeMatrix(rec);
      this.colliders.push({ x: p.x, z: p.z, r: 0.6 * p.s });
    });
    this.flushTreeMatrices();
  }

  private writeTreeMatrix(rec: TreeRec) {
    const standing = rec.state === "standing" || rec.state === "falling";
    let rot = 0;
    if (rec.state === "falling") rot = Math.min(1, rec.fallT / 0.95) * (Math.PI / 2) * 0.96;

    _v.set(rec.x, rec.y - 0.1, rec.z);
    _e.set(rec.fallDirZ * rot, (rec.idx * 2.39996) % (Math.PI * 2), -rec.fallDirX * rot);
    _q.setFromEuler(_e);
    _s.setScalar(standing ? rec.scale : 0.0001);
    _m.compose(_v, _q, _s);
    this.variantMeshes.get(rec.variant)!.setMatrixAt(rec.idx, _m);

    // Stumpf (nur wenn gefällt)
    const stumpKey: ModelKey = STUMP_OF[rec.variant];
    const otherStump: ModelKey = stumpKey === "stumpA" ? "stumpB" : "stumpA";
    _e.set(0, (rec.idx * 2.39996) % (Math.PI * 2), 0);
    _q.setFromEuler(_e);
    _s.setScalar(rec.state === "stump" ? rec.scale : 0.0001);
    _m.compose(_v, _q, _s);
    this.variantMeshes.get(stumpKey)!.setMatrixAt(rec.idx, _m);
    _s.setScalar(0.0001);
    _m.compose(_v, _q, _s);
    this.variantMeshes.get(otherStump)!.setMatrixAt(rec.idx, _m);
  }

  private flushTreeMatrices() {
    for (const mesh of this.variantMeshes.values()) mesh.instanceMatrix.needsUpdate = true;
  }

  nearestTree(x: number, z: number, range: number): TreeRec | null {
    let best: TreeRec | null = null;
    let bd = range * range;
    for (const t of this.trees) {
      if (t.state !== "standing") continue;
      const d = (t.x - x) ** 2 + (t.z - z) ** 2;
      if (d < bd) {
        bd = d;
        best = t;
      }
    }
    return best;
  }

  chopTree(rec: TreeRec, particles: ParticleSystem, now: number): boolean {
    rec.hits++;
    particles.burst(10, {
      x: rec.x, y: rec.y + 1.2, z: rec.z, spread: 0.8,
      vy: 3, life: 0.7, size: 1.6, color: [0.55, 0.4, 0.22], gravity: 9, drag: 0.96,
    });
    if (rec.hits >= 3) {
      rec.state = "falling";
      rec.fallT = 0;
      rec.respawnAt = now + 150;
      const a = Math.random() * Math.PI * 2;
      rec.fallDirX = Math.cos(a);
      rec.fallDirZ = Math.sin(a);
    }
    return rec.state === "falling";
  }

  // ── Felsen ───────────────────────────────────────────────────────
  private placeRocks() {
    const keys: ModelKey[] = ["rockB", "rockC", "rockD", "rockE"];
    const spots: { x: number; y: number; z: number; s: number; k: ModelKey }[] = [];
    for (const isl of ALL_LAND) {
      const rng = mulberry32(isl.seed * 13 + 7);
      const count = Math.round(isl.radius / 13);
      for (let i = 0; i < count; i++) {
        const a = rng() * Math.PI * 2;
        const r = (0.55 + rng() * 0.5) * isl.radius;
        const x = isl.x + Math.cos(a) * r;
        const z = isl.z + Math.sin(a) * r;
        const h = terrainHeight(x, z);
        if (h < 0.4) continue;
        spots.push({ x, y: h, z, s: 0.7 + rng() * 1.7, k: keys[Math.floor(rng() * keys.length)] });
      }
    }
    const byKey = new Map<ModelKey, typeof spots>();
    for (const s of spots) {
      const arr = byKey.get(s.k) ?? [];
      arr.push(s);
      byKey.set(s.k, arr);
    }
    for (const [key, arr] of byKey) {
      const { geometry, materials } = extractMerged(key);
      geometry.computeBoundingBox();
      const bb = geometry.boundingBox!;
      const h = Math.max(bb.max.y - bb.min.y, 0.0001);
      geometry.translate(0, -bb.min.y, 0);
      const mesh = new THREE.InstancedMesh(geometry, materials.length === 1 ? materials[0] : materials, arr.length);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      arr.forEach((p, i) => {
        _v.set(p.x, p.y - 0.25, p.z);
        _e.set(0, Math.random() * Math.PI * 2, 0);
        _q.setFromEuler(_e);
        const s2 = (p.s * 1.6) / h;
        _s.set(s2, s2 * (0.8 + Math.random() * 0.4), s2);
        _m.compose(_v, _q, _s);
        mesh.setMatrixAt(i, _m);
        if (p.s > 1.0) this.colliders.push({ x: p.x, z: p.z, r: p.s * 0.8 });
      });
      this.group.add(mesh);
    }
  }

  // ── Treibholz ────────────────────────────────────────────────────
  private placeDriftwood() {
    const rng = mulberry32(777);
    const geo = new THREE.BoxGeometry(2.6, 0.28, 0.5);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xc9a24e, roughness: 0.8, emissive: 0x37280a, emissiveIntensity: 0.6,
    });
    for (let i = 0; i < 42; i++) {
      const mesh = new THREE.Mesh(geo, mat);
      const x = rng() * 3800 + 200;
      const z = rng() * 3800 + 200;
      mesh.position.set(x, 0, z);
      mesh.rotation.y = rng() * Math.PI;
      this.group.add(mesh);
      this.driftwood.push({ mesh, x, z, taken: false, respawnAt: 0, spin: (rng() - 0.5) * 0.4 });
    }
  }

  collectDriftwood(x: number, z: number, radius: number, now: number): number {
    let n = 0;
    for (const d of this.driftwood) {
      if (d.taken) continue;
      const dd = (d.x - x) ** 2 + (d.z - z) ** 2;
      if (dd < radius * radius) {
        d.taken = true;
        d.mesh.visible = false;
        d.respawnAt = now + 75;
        n++;
      }
    }
    return n;
  }

  // ── Lagerfeuer ───────────────────────────────────────────────────
  private placeFires() {
    const makeFire = (id: string, x: number, z: number) => {
      const y = terrainHeight(x, z);
      const g = new THREE.Group();
      const model = getModel("campfire").scene.clone(true);
      normalizeHeight(model, 1.1);
      setShadows(model, true, false);
      g.add(model);
      const light = new THREE.PointLight(0xff8a3c, 0, 26, 1.7);
      light.position.y = 1.6;
      g.add(light);
      g.position.set(x, y, z);
      this.group.add(g);
      this.fires.push({ id, x, y, z, lit: false, light, group: g });
      this.colliders.push({ x, z, r: 1.25 });
    };

    makeFire("feuer_harbor", this.dock.x - 10, this.dock.z - 16);
    for (const isl of ALL_LAND) {
      if (isl.id === "harbor") continue;
      let fx = isl.x;
      let fz = isl.z + isl.radius * 0.55;
      for (let dd = isl.radius * 0.75; dd > isl.radius * 0.2; dd -= 3) {
        const x = isl.x;
        const z = isl.z + dd;
        if (terrainHeight(x, z) > 1.6 && terrainSlope(x, z) < 0.22) {
          fx = x;
          fz = z;
          break;
        }
      }
      makeFire(`feuer_${isl.id}`, fx, fz);
    }
  }

  setFireLit(id: string, lit: boolean) {
    const f = this.fires.find((fi) => fi.id === id);
    if (f) f.lit = lit;
  }

  fireById(id: string): FireRec | null {
    return this.fires.find((f) => f.id === id) ?? null;
  }

  nearestFire(x: number, z: number, range: number): FireRec | null {
    let best: FireRec | null = null;
    let bd = range * range;
    for (const f of this.fires) {
      const d = (f.x - x) ** 2 + (f.z - z) ** 2;
      if (d < bd) {
        bd = d;
        best = f;
      }
    }
    return best;
  }

  groundHeight(x: number, z: number): number {
    let h = terrainHeight(x, z);
    const d = this.dock;
    const relX = x - d.x;
    const relZ = z - d.z;
    const along = relX * d.dirX + relZ * d.dirZ;
    const across = Math.abs(relX * -d.dirZ + relZ * d.dirX);
    if (along > -3 && along < d.len && across < d.width / 2) {
      h = Math.max(h, d.y + 0.09);
    }
    return h;
  }

  update(t: number, dt: number, now: number, particles: ParticleSystem, waveY: (x: number, z: number) => number, camPos: THREE.Vector3) {
    let dirty = false;
    for (const rec of this.trees) {
      if (rec.state === "falling") {
        rec.fallT += dt;
        this.writeTreeMatrix(rec);
        dirty = true;
        if (rec.fallT > 1.0) {
          rec.state = "stump";
          this.writeTreeMatrix(rec);
          particles.burst(14, {
            x: rec.x + rec.fallDirX * 4, y: rec.y + 0.5, z: rec.z + rec.fallDirZ * 4,
            spread: 2, vy: 2.5, life: 0.8, size: 1.8, color: [0.5, 0.38, 0.2], gravity: 8, drag: 0.95,
          });
        }
      } else if (rec.state === "stump" && now > rec.respawnAt) {
        rec.state = "standing";
        rec.hits = 0;
        this.writeTreeMatrix(rec);
        dirty = true;
      }
    }
    if (dirty) this.flushTreeMatrices();

    for (const d of this.driftwood) {
      if (d.taken) {
        if (now > d.respawnAt) {
          d.taken = false;
          const a = Math.random() * Math.PI * 2;
          const r = 400 + Math.random() * 500;
          d.x = camPos.x + Math.cos(a) * r;
          d.z = camPos.z + Math.sin(a) * r;
          d.mesh.visible = true;
        }
        continue;
      }
      const dx = d.x - camPos.x;
      const dz = d.z - camPos.z;
      if (dx * dx + dz * dz > 700 * 700) continue;
      d.mesh.position.set(d.x, waveY(d.x, d.z) + 0.12, d.z);
      d.mesh.rotation.y += d.spin * dt;
      d.mesh.rotation.z = Math.sin(t * 0.9 + d.x) * 0.08;
    }

    for (const f of this.fires) {
      if (!f.lit) {
        f.light.intensity = 0;
        continue;
      }
      const dx = f.x - camPos.x;
      const dz = f.z - camPos.z;
      const near = dx * dx + dz * dz < 300 * 300;
      if (!near) {
        f.light.intensity = 0;
        continue;
      }
      f.light.intensity = 24 + Math.sin(t * 2.9 + f.x) * 2.5 + Math.sin(t * 5.3 + 1.7) * 1.8;
      if (Math.random() < 0.55) {
        particles.spawn({
          x: f.x + (Math.random() - 0.5) * 0.7, y: f.y + 0.5, z: f.z + (Math.random() - 0.5) * 0.7,
          vy: 1.8 + Math.random() * 1.2, life: 0.9, size: 2.6,
          color: Math.random() < 0.6 ? [1.0, 0.55, 0.18] : [1.0, 0.8, 0.35],
          gravity: -1.5, drag: 0.97,
        });
      }
      if (Math.random() < 0.06) {
        particles.spawn({
          x: f.x, y: f.y + 1.2, z: f.z, vy: 2.8, spread: 0.5, life: 1.8, size: 1.2,
          color: [1.0, 0.7, 0.3], gravity: -2, drag: 0.98,
        });
      }
    }
  }
}
