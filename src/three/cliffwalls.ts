// PHÄNOMENAUTIK 3 — Kletterwand-Visualisierung: Felsturm mit aufgebuckelter
// Kletterfront (helle Moosflecken = „hier geht es hoch", Zelda-Markierung)
// und begehbarem Plateau. Vertexfarben statt Shader — Licht, Schatten und
// Nebel kommen gratis vom Standardmaterial.

import * as THREE from "three";
import { CLIMB_WALLS, wallFrame, type ClimbWallDef } from "../game/climb";
import { fbm2 } from "../game/noise";

const ROCK = new THREE.Color(0.30, 0.275, 0.25);
const ROCK_DARK = new THREE.Color(0.19, 0.175, 0.16);
const MOSS = new THREE.Color(0.33, 0.58, 0.16);
const MOSS_BRIGHT = new THREE.Color(0.62, 0.88, 0.28);

function paintVertex(c: THREE.Color, lx: number, wy: number, edge: number, seed: number) {
  // Felsgrund mit Maserung, dann Moosflecken, dann helle Griffpunkte
  const grain = fbm2(lx * 0.9 + seed, wy * 0.9, 3, seed + 11) * 0.5 + 0.5;
  c.copy(ROCK_DARK).lerp(ROCK, grain);
  const mossN = fbm2(lx * 0.42 + 13.7, wy * 0.38 + seed * 1.3, 3, seed + 23) * 0.5 + 0.5;
  const mossMask = Math.min(1, Math.max(0, (mossN - 0.47) * 4.2)) * edge;
  c.lerp(MOSS, Math.min(1, mossMask));
  // Helle Griff-Moosflecken in leichten Horizontalbändern — lesbare Kletterroute
  const band = 0.5 + 0.5 * Math.sin(wy * 1.35 + seed);
  const dotN = fbm2(lx * 1.5 + seed * 2.9, wy * 1.4, 2, seed + 41) * 0.5 + 0.5;
  const dotMask = Math.min(1, Math.max(0, (dotN * (0.5 + band * 0.7) - 0.50) * 5.0)) * Math.max(mossMask, 0.3) * edge;
  c.lerp(MOSS_BRIGHT, Math.min(1, dotMask * 1.3));
}

function colorize(
  geo: THREE.PlaneGeometry,
  secondCoord: (i: number) => number, // zweite Flächenkoordinate (Front: y, Plateau: z)
  wyOf: (lx: number, s: number) => number,
  edgeOf: (lx: number, s: number) => number,
  seed: number,
) {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const lx = pos.getX(i);
    const s = secondCoord(i);
    paintVertex(c, lx, wyOf(lx, s), edgeOf(lx, s), seed);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
}

function rockMaterial() {
  return new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.97, metalness: 0 });
}

function buildWall(def: ClimbWallDef, seed: number): THREE.Group {
  const group = new THREE.Group();
  const { nx, nz } = wallFrame(def);

  // ── Kletterfront (senkrecht, aufgebuckelt) ──
  const W = def.width + 3.4;
  const H = def.height + 3.0;
  const front = new THREE.PlaneGeometry(W, H, 12, 16);
  {
    const pos = front.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const lx = pos.getX(i);
      const ly = pos.getY(i);
      // Taper: nach oben leicht verjüngt — Fels-Silhouette statt Rechteck
      const taper = 1 - ((ly + H / 2) / H) * 0.28;
      const edge = Math.min(1, (1 - Math.abs(lx) / (W / 2)) * 2.5) * Math.min(1, (1 - Math.abs(ly) / (H / 2)) * 2.0);
      const bump = (fbm2(lx * 0.33 + seed * 7.1, ly * 0.31 - seed * 3.7, 3, seed) * 0.5 + 0.5) * 1.3 * edge;
      pos.setX(i, lx * taper + fbm2(ly * 0.4 + seed, lx * 0.2, 2, seed + 77) * 0.9);
      pos.setZ(i, bump + 0.25);
    }
    colorize(
      front,
      (i) => (front.attributes.position as THREE.BufferAttribute).getY(i),
      (_lx, ly) => def.baseY + ly + H / 2,
      (lx) => Math.min(1, (1 - Math.abs(lx) / (W / 2)) * 2.5),
      seed,
    );
  }
  const frontMesh = new THREE.Mesh(front, rockMaterial());
  frontMesh.castShadow = true;
  frontMesh.receiveShadow = true;
  frontMesh.position.set(def.x + nx * 0.1, def.baseY + H / 2 - 1.6, def.z + nz * 0.1);
  frontMesh.rotation.y = def.yaw;
  frontMesh.rotateX(-0.14); // leicht an den Hang gelehnt
  group.add(frontMesh);

  // ── Plateau (waagerecht hinter der Kante, begehbar) ──
  const D = def.topDepth + 1.6;
  const top = new THREE.PlaneGeometry(def.width + 2.6, D, 10, 6);
  top.rotateX(-Math.PI / 2);
  {
    const pos = top.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const lx = pos.getX(i);
      const lz = pos.getZ(i);
      const bump = fbm2(lx * 0.5 + seed, lz * 0.5 - seed, 2, seed + 5) * 0.22;
      pos.setY(i, bump);
    }
    colorize(
      top,
      (i) => (top.attributes.position as THREE.BufferAttribute).getZ(i),
      (_lx, lz) => def.baseY + def.height + lz * 0.4,
      () => 1,
      seed + 3,
    );
  }
  const topMesh = new THREE.Mesh(top, rockMaterial());
  topMesh.castShadow = true;
  topMesh.receiveShadow = true;
  const topY = def.baseY + def.height;
  topMesh.position.set(def.x - nx * (D / 2 - 0.4), topY, def.z - nz * (D / 2 - 0.4));
  topMesh.rotation.y = def.yaw;
  group.add(topMesh);

  return group;
}

export class CliffWalls {
  group = new THREE.Group();

  constructor(scene: THREE.Scene) {
    CLIMB_WALLS.forEach((def, i) => {
      this.group.add(buildWall(def, 100 + i * 17));
    });
    scene.add(this.group);
  }
}
