// PHÄNOMENAUTIK 3 — Asset-Pipeline: GLTF/GLB-Lader mit Cache,
// skinned-clone für Charaktere, Geometrie-Extraktion für Instancing.

import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";

const loader = new GLTFLoader();
const cache = new Map<string, Promise<GLTF>>();

export const MODELS = {
  rogue: "assets/models/char/rogue_hooded.glb",
  knight: "assets/models/char/Knight.glb",
  barbarian: "assets/models/char/Barbarian.glb",
  mage: "assets/models/char/Mage.glb",
  roguePlain: "assets/models/char/Rogue.glb",
  axe: "assets/models/char/axe_1handed.gltf",
  skeleton: "assets/models/enemy/skeleton_minion.glb",
  ship: "assets/models/pirate/ship_b.glb",
  palmA: "assets/models/pirate/palm_a.glb",
  palmB: "assets/models/pirate/palm_b.glb",
  barrel: "assets/models/pirate/barrel.glb",
  chest: "assets/models/pirate/chest.glb",
  campfire: "assets/models/pirate/campfire.glb",
  rowboat: "assets/models/pirate/rowboat.glb",
  tent: "assets/models/pirate/tent.glb",
  treeAL: "assets/models/nature/trees_A_large.gltf",
  treeAM: "assets/models/nature/trees_A_medium.gltf",
  treeAS: "assets/models/nature/trees_A_small.gltf",
  treeBL: "assets/models/nature/trees_B_large.gltf",
  treeBM: "assets/models/nature/trees_B_medium.gltf",
  treeBS: "assets/models/nature/trees_B_small.gltf",
  treeSingleA: "assets/models/nature/tree_single_A.gltf",
  stumpA: "assets/models/nature/tree_single_A_cut.gltf",
  treeSingleB: "assets/models/nature/tree_single_B.gltf",
  stumpB: "assets/models/nature/tree_single_B_cut.gltf",
  rockB: "assets/models/nature/rock_single_B.gltf",
  rockC: "assets/models/nature/rock_single_C.gltf",
  rockD: "assets/models/nature/rock_single_D.gltf",
  rockE: "assets/models/nature/rock_single_E.gltf",
  cloudBig: "assets/models/nature/cloud_big.gltf",
  cloudSmall: "assets/models/nature/cloud_small.gltf",
} as const;

export type ModelKey = keyof typeof MODELS;

export function loadGLTF(url: string): Promise<GLTF> {
  let p = cache.get(url);
  if (!p) {
    p = loader.loadAsync(url);
    cache.set(url, p);
  }
  return p;
}

const loaded = new Map<ModelKey, GLTF>();

/** Alle Modelle vorladen (mit Fortschritts-Callback) */
export async function preloadAll(onProgress?: (done: number, total: number) => void): Promise<void> {
  const keys = Object.keys(MODELS) as ModelKey[];
  let done = 0;
  await Promise.all(
    keys.map(async (k) => {
      loaded.set(k, await loadGLTF(MODELS[k]));
      done++;
      onProgress?.(done, keys.length);
    }),
  );
}

export function getModel(key: ModelKey): GLTF {
  const g = loaded.get(key);
  if (!g) throw new Error(`Modell nicht geladen: ${key}`);
  return g;
}

/** Tiefer Klon für geriggte Modelle (Skeleton/Bindings korrekt) */
export function cloneSkinned(key: ModelKey): THREE.Object3D {
  return SkeletonUtils.clone(getModel(key).scene);
}

export interface ExtractedModel {
  geometry: THREE.BufferGeometry;
  materials: THREE.Material[];
}

/**
 * Backt eine (ggf. mehrteilige) GLTF-Szene in EINE Geometrie (+ Gruppen/Material-Array)
 * für InstancedMesh. Welttransformationen der Knoten werden eingerechnet.
 */
export function extractMerged(key: ModelKey): ExtractedModel {
  const scene = getModel(key).scene;
  scene.updateMatrixWorld(true);
  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];
  const matIndex = new Map<THREE.Material, number>();

  scene.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    const g = o.geometry.clone();
    g.applyMatrix4(o.matrixWorld);
    // auf Positions-/Normalen-/UV-Attribute reduzieren (Instancing-Kompatibilität)
    const keep = ["position", "normal", "uv", "color"];
    for (const name of Object.keys(g.attributes)) {
      if (!keep.includes(name)) g.deleteAttribute(name);
    }
    g.morphAttributes = {};
    const mat = Array.isArray(o.material) ? o.material[0] : o.material;
    let gi = matIndex.get(mat);
    if (gi === undefined) {
      gi = mats.length;
      mats.push(mat);
      matIndex.set(mat, gi);
    }
    g.clearGroups();
    g.addGroup(0, g.getIndex() ? g.getIndex()!.count : g.getAttribute("position").count, gi);
    geos.push(g);
  });

  const merged = geos.length === 1 ? geos[0] : BufferGeometryUtils.mergeGeometries(geos, true);
  if (!merged) throw new Error(`merge fehlgeschlagen: ${key}`);
  return { geometry: merged, materials: mats };
}

/** Szene auf Zielgröße normieren (Höhe), zentriert am Boden */
export function normalizeHeight(obj: THREE.Object3D, targetH: number): number {
  const box = new THREE.Box3().setFromObject(obj);
  const size = new THREE.Vector3();
  box.getSize(size);
  const s = targetH / Math.max(size.y, 0.0001);
  obj.scale.setScalar(s);
  const box2 = new THREE.Box3().setFromObject(obj);
  obj.position.y -= box2.min.y;
  return s;
}

/** Alle Mesh-Schattenflags setzen */
export function setShadows(obj: THREE.Object3D, cast: boolean, receive: boolean) {
  obj.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.castShadow = cast;
      o.receiveShadow = receive;
    }
  });
}
