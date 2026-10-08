// PHÄNOMENAUTIK 3 — Terrain: pro Insel ein heightmap-basiertes Mesh mit
// Vertexfarben nach Höhe & Hang (Sand/Gras/Fels/Schnee), exakt konsistent
// mit der Kollisionsfunktion in worldLayout.

import * as THREE from "three";
import { ALL_LAND, SEA_FLOOR, terrainHeight, type IslandDef } from "../game/worldLayout";
import { clamp, fbm2, smoothstep } from "../game/noise";

const C_SAND = new THREE.Color(0.78, 0.68, 0.47);
const C_SAND_WET = new THREE.Color(0.62, 0.55, 0.42);
const C_GRASS = new THREE.Color(0.23, 0.42, 0.21);
const C_GRASS_DRY = new THREE.Color(0.42, 0.46, 0.22);
const C_ROCK = new THREE.Color(0.42, 0.4, 0.38);
const C_ROCK_DARK = new THREE.Color(0.3, 0.29, 0.29);
const C_SNOW = new THREE.Color(0.9, 0.92, 0.94);
const C_FLOOR = new THREE.Color(0.32, 0.4, 0.36);

function colorAt(x: number, z: number, h: number, slope: number, seed: number, out: THREE.Color): THREE.Color {
  const varn = fbm2(x * 0.03, z * 0.03, 3, seed + 5) * 0.5 + 0.5; // 0..1 Variation
  out.copy(C_FLOOR);
  if (h > -0.4) {
    // Strand
    const sand = 1 - smoothstep(0.8 + varn * 0.8, 2.6 + varn * 1.4, h);
    out.copy(C_GRASS).lerp(C_GRASS_DRY, varn * 0.65);
    out.lerp(C_SAND, sand);
    // Fels bei Steilhang oder großer Höhe
    const rock = Math.max(smoothstep(0.4, 0.66, slope), smoothstep(26, 44, h + varn * 8));
    out.lerp(varn > 0.5 ? C_ROCK : C_ROCK_DARK, rock);
    // Gipfel-Schnee nur bei sehr hohen Inseln
    if (h > 46) out.lerp(C_SNOW, smoothstep(46, 58, h));
    // feuchte Wasserlinie
    if (h < 0.9) out.lerp(C_SAND_WET, smoothstep(0.9, 0.05, h) * 0.55);
  } else {
    // Unterwasser: Sand → dunkler Meeresboden
    const deep = smoothstep(-1, -14, h);
    out.copy(C_SAND_WET).lerp(C_FLOOR, 0.5 + deep * 0.5).multiplyScalar(1 - deep * 0.45);
  }
  // dezente Helligkeitsvariation
  const l = 0.94 + varn * 0.12;
  out.multiplyScalar(l);
  return out;
}

function buildIslandMesh(def: IslandDef): THREE.Mesh {
  const extent = def.radius * 2.7;
  const segs = clamp(Math.round(def.radius * 0.72), 72, 148);
  const geo = new THREE.PlaneGeometry(extent, extent, segs, segs);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  const col = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const wx = def.x + pos.getX(i);
    const wz = def.z + pos.getZ(i);
    const h = terrainHeight(wx, wz);
    pos.setY(i, h);
  }
  geo.computeVertexNormals();
  const nrm = geo.attributes.normal as THREE.BufferAttribute;

  for (let i = 0; i < pos.count; i++) {
    const wx = def.x + pos.getX(i);
    const wz = def.z + pos.getZ(i);
    const h = pos.getY(i);
    const slope = clamp(1 - nrm.getY(i), 0, 1) * 1.6;
    colorAt(wx, wz, h, slope, def.seed, col);
    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const mesh = new THREE.Mesh(geo, mat);
  // Vertex-XZ sind lokal (Ebene um 0 zentriert) → Mesh auf Inselzentrum stellen
  mesh.position.set(def.x, 0, def.z);
  mesh.receiveShadow = true;
  mesh.castShadow = def.peak > 30;
  mesh.name = `island_${def.id}`;
  return mesh;
}

export class Terrain {
  group = new THREE.Group();
  meshes: THREE.Mesh[] = [];

  constructor(scene: THREE.Scene) {
    this.group.name = "terrain";
    for (const def of ALL_LAND) {
      const m = buildIslandMesh(def);
      this.meshes.push(m);
      this.group.add(m);
    }
    // Globaler Meeresboden (weit draußen sichtbar, dunkel)
    const floorGeo = new THREE.PlaneGeometry(9000, 9000, 1, 1);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a2b33, roughness: 1 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = SEA_FLOOR - 0.5;
    floor.receiveShadow = false;
    this.group.add(floor);
    scene.add(this.group);
  }
}
