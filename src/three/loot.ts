// PHÄNOMENAUTIK 3 — Sammelbare Materialien in der Welt: sinnvoll platzierte
// Loot-Punkte (Treibholz am Strand, Seile am Steg, Muscheln im Watt, Federn
// unter Bäumen, Harz an Kiefern …) mit sanftem Schweben und Aufheben.

import * as THREE from "three";
import { ALL_LAND, terrainHeight, terrainSlope } from "../game/worldLayout";
import { mulberry32 } from "../game/noise";
import { matById } from "../game/materials";

export interface LootRec {
  key: string; // eindeutige Id (persistiert)
  matId: string;
  x: number;
  y: number;
  z: number;
  mesh: THREE.Mesh;
  taken: boolean;
  respawnAt: number; // 0 = einmalig
}

const LOOT_STYLE: Record<string, { color: number; emissive?: number; shape: "box" | "roll" | "ball" | "disc" | "can" }> = {
  stamm: { color: 0x8a6b45, shape: "roll" },
  bohle: { color: 0x9c7a4f, shape: "box" },
  reisig: { color: 0x7a5c3a, shape: "ball" },
  rinde: { color: 0x6b4e33, shape: "disc" },
  holzgerte: { color: 0xa8875a, shape: "roll" },
  stange: { color: 0x8a6b45, shape: "roll" },
  paddel: { color: 0x9c7a4f, shape: "roll" },
  tuch: { color: 0xd8cfc0, shape: "disc" },
  segeltuch: { color: 0xe8dfc8, shape: "disc" },
  sackleinen: { color: 0xb09a6a, shape: "disc" },
  wollknäuel: { color: 0xd8d8e0, shape: "ball" },
  seil: { color: 0xc9a86a, shape: "roll" },
  tauwerk: { color: 0xa8875a, shape: "roll" },
  fischernetz: { color: 0x9ab08a, shape: "disc" },
  kette: { color: 0x7a7d84, shape: "roll" },
  eimer: { color: 0x8a9099, shape: "can" },
  flasche: { color: 0x7ab8a0, emissive: 0x1a4a3a, shape: "can" },
  schale: { color: 0x9c7a4f, shape: "can" },
  blasebalg: { color: 0xa8755a, shape: "box" },
  schlauch: { color: 0x8a6b55, shape: "can" },
  naegel: { color: 0x9aa2ad, shape: "ball" },
  haken: { color: 0x8a9099, shape: "can" },
  ring: { color: 0x9aa2ad, shape: "roll" },
  schrott: { color: 0x6d6a66, shape: "box" },
  stein: { color: 0x8a8a86, shape: "ball" },
  feder: { color: 0xe8e8f0, emissive: 0x404048, shape: "disc" },
  muschel: { color: 0xe0c8d0, emissive: 0x3a2a30, shape: "ball" },
  harz: { color: 0xd8982e, emissive: 0x5a380a, shape: "ball" },
  algen: { color: 0x4a7a4a, shape: "disc" },
  knochen: { color: 0xd8d0c0, shape: "roll" },
  feuerstein: { color: 0x5a5a60, emissive: 0x181818, shape: "ball" },
  schaufel: { color: 0x8a9099, shape: "roll" },
  regenschirm: { color: 0xc94a5a, shape: "can" },
  laterne: { color: 0xd8a85a, emissive: 0x6a4a1a, shape: "can" },
  zeltbahn: { color: 0xa89878, shape: "disc" },
  ankerstein: { color: 0x6d6a66, shape: "ball" },
};

function makeLootMesh(matId: string): THREE.Mesh {
  const style = LOOT_STYLE[matId] ?? { color: 0xc9c9c9, shape: "box" };
  let geo: THREE.BufferGeometry;
  switch (style.shape) {
    case "roll":
      geo = new THREE.CylinderGeometry(0.09, 0.09, 0.9, 6);
      geo.rotateZ(Math.PI / 2);
      break;
    case "ball":
      geo = new THREE.IcosahedronGeometry(0.22, 0);
      break;
    case "disc":
      geo = new THREE.CylinderGeometry(0.26, 0.26, 0.08, 7);
      break;
    case "can":
      geo = new THREE.CylinderGeometry(0.16, 0.2, 0.34, 7);
      break;
    default:
      geo = new THREE.BoxGeometry(0.5, 0.12, 0.2);
  }
  const mat = new THREE.MeshStandardMaterial({
    color: style.color,
    roughness: 0.8,
    emissive: style.emissive ?? 0x1a150a,
    emissiveIntensity: style.emissive ? 1.2 : 0.5,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  return mesh;
}

/** Platzierungsregeln pro Material: wo liegt es sinnvoll herum */
type Zone = "beach" | "inland" | "forest" | "harbor";
const MAT_ZONE: Record<string, Zone> = {
  stamm: "beach", bohle: "beach", reisig: "forest", rinde: "forest",
  holzgerte: "forest", stange: "forest", paddel: "harbor",
  tuch: "harbor", segeltuch: "harbor", sackleinen: "harbor", wollknäuel: "inland",
  seil: "harbor", tauwerk: "harbor", fischernetz: "beach", kette: "harbor",
  eimer: "harbor", flasche: "beach", schale: "harbor", blasebalg: "harbor", schlauch: "harbor",
  naegel: "harbor", haken: "harbor", ring: "harbor", schrott: "beach",
  stein: "inland", feder: "forest", muschel: "beach", harz: "forest", algen: "beach",
  knochen: "inland", feuerstein: "inland", schaufel: "harbor",
  regenschirm: "harbor", laterne: "harbor", zeltbahn: "harbor", ankerstein: "inland",
};

export class Loot {
  items: LootRec[] = [];
  group = new THREE.Group();

  constructor(scene: THREE.Scene, takenKeys: string[]) {
    scene.add(this.group);
    let n = 0;
    for (const isl of ALL_LAND) {
      const rng = mulberry32(isl.seed * 41 + 17);
      const isHarbor = isl.id === "harbor";
      const count = isHarbor ? 26 : 10 + Math.floor(rng() * 4);
      const placed: { x: number; z: number }[] = [];
      for (let i = 0; i < count; i++) {
        const matIds = Object.keys(MAT_ZONE).filter((id) =>
          isHarbor ? true : MAT_ZONE[id] !== "harbor",
        );
        const matId = matIds[Math.floor(rng() * matIds.length)];
        const zone: Zone = isHarbor && rng() < 0.45 ? "harbor" : MAT_ZONE[matId];
        let x = isl.x;
        let z = isl.z;
        let okSpot = false;
        for (let tries = 0; tries < 30; tries++) {
          const a = rng() * Math.PI * 2;
          const rr =
            zone === "beach"
              ? isl.radius * (0.86 + rng() * 0.18)
              : zone === "harbor"
                ? isl.radius * (0.35 + rng() * 0.45)
                : isl.radius * (0.25 + rng() * 0.55);
          const tx = isl.x + Math.cos(a) * rr;
          const tz = isl.z + Math.sin(a) * rr;
          const h = terrainHeight(tx, tz);
          if (h < 0.6 || h > isl.peak * 0.85) continue;
          if (terrainSlope(tx, tz) > 0.4) continue;
          if (placed.some((p) => (p.x - tx) ** 2 + (p.z - tz) ** 2 < 36)) continue;
          x = tx;
          z = tz;
          okSpot = true;
          break;
        }
        if (!okSpot) continue;
        placed.push({ x, z });
        const key = `loot_${isl.id}_${n++}`;
        const y = terrainHeight(x, z);
        const mesh = makeLootMesh(matId);
        mesh.position.set(x, y + 0.25, z);
        mesh.rotation.y = rng() * Math.PI * 2;
        const taken = takenKeys.includes(key);
        mesh.visible = !taken;
        this.group.add(mesh);
        this.items.push({
          key,
          matId,
          x,
          y,
          z,
          mesh,
          taken,
          respawnAt: matId === "stamm" || matId === "muschel" || matId === "algen" ? 240 : 0,
        });
      }
    }
  }

  nearest(x: number, z: number, range: number): LootRec | null {
    let best: LootRec | null = null;
    let bd = range * range;
    for (const it of this.items) {
      if (it.taken) continue;
      const d = (it.x - x) ** 2 + (it.z - z) ** 2;
      if (d < bd) {
        bd = d;
        best = it;
      }
    }
    return best;
  }

  take(it: LootRec, now: number): string | null {
    if (it.taken) return null;
    it.taken = true;
    it.mesh.visible = false;
    if (it.respawnAt > 0) it.respawnAt += now;
    return matById(it.matId)?.name ?? it.matId;
  }

  update(t: number, now: number, camPos: THREE.Vector3) {
    for (const it of this.items) {
      if (it.taken) {
        if (it.respawnAt > 0 && now > it.respawnAt) {
          it.taken = false;
          it.mesh.visible = true;
          it.respawnAt = it.respawnAt > 0 ? 240 : 0;
        }
        continue;
      }
      const dx = it.x - camPos.x;
      const dz = it.z - camPos.z;
      if (dx * dx + dz * dz > 160 * 160) continue;
      it.mesh.position.y = it.y + 0.25 + Math.sin(t * 2 + it.x) * 0.07;
      it.mesh.rotation.y += 0.4 * 0.016;
    }
  }
}

export const LOOT_SAVE_KEY = "lootTaken";
