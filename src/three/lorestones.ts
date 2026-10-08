// PHÄNOMENAUTIK 3 — Lore-Runensteine: leuchtende Echos der Inseln.
// Stein + schwebender Kristall + sanftes Licht. Gelesene Steine verlöschen.

import * as THREE from "three";
import { LORE, type LoreLine } from "../game/echoes";
import { ALL_LAND, shrinePoint, terrainHeight } from "../game/worldLayout";
import { mulberry32 } from "../game/noise";
import { extractMerged } from "./assets";

export interface StoneRec {
  line: LoreLine;
  x: number;
  y: number;
  z: number;
  group: THREE.Group;
  crystal: THREE.Mesh;
  light: THREE.PointLight;
  found: boolean;
}

export class LoreStones {
  stones: StoneRec[] = [];

  constructor(scene: THREE.Scene, foundIds: string[]) {
    const { geometry: rockGeo, materials: rockMats } = extractMerged("rockD");
    rockGeo.computeBoundingBox();
    const bb = rockGeo.boundingBox!;
    const s = 1.3 / Math.max(bb.max.y - bb.min.y, 0.001);
    rockGeo.translate(0, -bb.min.y, 0);
    rockGeo.scale(s, s, s);
    const rockMat = rockMats[0];

    const crystalGeo = new THREE.OctahedronGeometry(0.28, 0);

    for (const line of LORE) {
      const isl = ALL_LAND.find((i) => i.id === line.island);
      if (!isl) continue;
      const rng = mulberry32(isl.seed * 31 + line.id.length * 7);
      let x = isl.x;
      let z = isl.z;
      if (isl.id === "harbor") {
        // um den Südstrand verteilen
        const a = rng() * Math.PI * 2;
        const r = 20 + rng() * 55;
        x = isl.x + Math.cos(a) * r;
        z = isl.z + isl.radius * 0.55 + (rng() - 0.5) * 40;
      } else {
        // einer nahe Schrein, einer nahe Südküste
        const nearShrine = line.id.endsWith("_1");
        if (nearShrine) {
          const sp = shrinePoint(isl);
          x = sp.x + (rng() - 0.5) * 24;
          z = sp.z + (rng() - 0.5) * 24;
        } else {
          const a = Math.PI * (0.6 + rng() * 0.8); // Südhalbkreis
          const r = isl.radius * (0.55 + rng() * 0.3);
          x = isl.x + Math.cos(a) * r;
          z = isl.z + Math.sin(a) * r;
        }
      }
      const y = terrainHeight(x, z);
      if (y < 0.6) {
        z = isl.z + isl.radius * 0.45;
        x = isl.x;
      }
      const gy = terrainHeight(x, z);

      const group = new THREE.Group();
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.castShadow = true;
      rock.rotation.y = rng() * Math.PI * 2;
      group.add(rock);

      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0x7ad8ff,
        emissive: 0x2ea8e0,
        emissiveIntensity: 1.6,
        roughness: 0.25,
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.y = 2.0;
      group.add(crystal);

      const light = new THREE.PointLight(0x66c8ff, 0, 9, 2);
      light.position.y = 2.0;
      group.add(light);

      group.position.set(x, gy, z);
      scene.add(group);

      this.stones.push({
        line,
        x,
        y: gy,
        z,
        group,
        crystal,
        light,
        found: foundIds.includes(line.id),
      });
    }
  }

  nearest(x: number, z: number, range: number): StoneRec | null {
    let best: StoneRec | null = null;
    let bd = range * range;
    for (const st of this.stones) {
      if (st.found) continue;
      const d = (st.x - x) ** 2 + (st.z - z) ** 2;
      if (d < bd) {
        bd = d;
        best = st;
      }
    }
    return best;
  }

  markFound(id: string) {
    const st = this.stones.find((s) => s.line.id === id);
    if (st) st.found = true;
  }

  update(t: number, camPos: THREE.Vector3) {
    for (const st of this.stones) {
      const dx = st.x - camPos.x;
      const dz = st.z - camPos.z;
      if (dx * dx + dz * dz > 260 * 260) {
        st.light.intensity = 0;
        continue;
      }
      st.crystal.position.y = 2.0 + Math.sin(t * 1.6 + st.x) * 0.16;
      st.crystal.rotation.y = t * 0.8;
      const mat = st.crystal.material as THREE.MeshStandardMaterial;
      if (st.found) {
        mat.emissiveIntensity = 0.25;
        st.light.intensity = 0;
      } else {
        const pulse = 0.75 + Math.sin(t * 2.2 + st.z) * 0.25;
        mat.emissiveIntensity = 1.6 * pulse;
        st.light.intensity = 3.5 * pulse;
      }
    }
  }
}
