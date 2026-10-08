// PHÄNOMENAUTIK 3 — NPCs auf dem Ankerplatz: KayKit-Figuren mit Idle-
// Animationen, Namensschildern und Blickkontakt bei Annäherung.

import * as THREE from "three";
import { NPCS, type NpcDef } from "../game/npc";
import { cloneSkinned, getModel, normalizeHeight, setShadows, type ModelKey } from "./assets";
import { terrainHeight } from "../game/worldLayout";

const MODEL_FOR: Record<string, ModelKey> = {
  mara: "roguePlain",
  tove: "mage",
  kaj: "barbarian",
  ilse: "knight",
  ben: "rogue",
};

const SITTING: Record<string, boolean> = { ben: true };

export interface NpcSpot {
  x: number;
  z: number;
  faceDeg?: number; // Grundblickrichtung
}

export class Npcs {
  group = new THREE.Group();
  private list: { def: NpcDef; obj: THREE.Object3D; mixer: THREE.AnimationMixer; label: THREE.Sprite; baseYaw: number }[] = [];

  constructor(scene: THREE.Scene, spots: Record<string, NpcSpot>) {
    scene.add(this.group);
    for (const def of NPCS) {
      const spot = spots[def.id];
      if (!spot) continue;
      const obj = cloneSkinned(MODEL_FOR[def.id]);
      normalizeHeight(obj, def.id === "kaj" ? 1.95 : 1.8);
      setShadows(obj, true, false);
      // Ben: dunklerer Ton, Unterscheidung vom Spieler
      if (def.id === "ben") {
        obj.traverse((o) => {
          if (o instanceof THREE.Mesh) {
            const m = (o.material as THREE.MeshStandardMaterial).clone();
            m.color = new THREE.Color(0.55, 0.62, 0.78);
            o.material = m;
          }
        });
      }
      const y = terrainHeight(spot.x, spot.z);
      obj.position.set(spot.x, SITTING[def.id] ? y : y, spot.z);
      const baseYaw = ((spot.faceDeg ?? 0) * Math.PI) / 180;
      obj.rotation.y = baseYaw;
      this.group.add(obj);

      // Namensschild
      const label = makeLabel(def.name, def.role);
      label.position.set(spot.x, y + 2.6, spot.z);
      this.group.add(label);

      const mixer = new THREE.AnimationMixer(obj);
      const clips = getModel(MODEL_FOR[def.id]).animations;
      const clip =
        clips.find((c) => c.name === (SITTING[def.id] ? "Sit_Floor_Idle" : "Idle")) ??
        clips.find((c) => c.name === "Idle")!;
      const action = mixer.clipAction(clip);
      action.time = Math.random() * clip.duration;
      action.play();

      this.list.push({ def, obj, mixer, label, baseYaw });
    }
  }

  nearestNpc(x: number, z: number, range: number): NpcDef | null {
    let best: NpcDef | null = null;
    let bd = range * range;
    for (const n of this.list) {
      const d = (n.obj.position.x - x) ** 2 + (n.obj.position.z - z) ** 2;
      if (d < bd) {
        bd = d;
        best = n.def;
      }
    }
    return best;
  }

  update(dt: number, playerPos: THREE.Vector3, uiLock: boolean) {
    for (const n of this.list) {
      n.mixer.update(dt);
      // Blickkontakt bei Nähe (nicht bei sitzendem Ben — er schauts Feuer an, bis man nah ist)
      const dx = playerPos.x - n.obj.position.x;
      const dz = playerPos.z - n.obj.position.z;
      const d2 = dx * dx + dz * dz;
      const lookRange = n.def.id === "ben" ? 4.5 : 7;
      let want = n.baseYaw;
      if (d2 < lookRange * lookRange && !uiLock) want = Math.atan2(dx, dz);
      let diff = want - n.obj.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      n.obj.rotation.y += diff * Math.min(1, dt * 4);
      // Label nur in Nähe zeigen
      const dist = Math.sqrt(d2);
      n.label.material.opacity = dist < 42 ? Math.min(1, (42 - dist) / 12) : 0;
    }
  }
}

function makeLabel(name: string, role: string): THREE.Sprite {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.textAlign = "center";
  ctx.font = "600 44px system-ui, sans-serif";
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  const w = Math.max(ctx.measureText(name).width + 40, 120);
  roundRect(ctx, 256 - w / 2, 14, w, 66, 14);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillText(name, 256, 60);
  ctx.font = "italic 400 26px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,220,150,0.9)";
  ctx.fillText(role, 256, 100);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(3.4, 0.85, 1);
  return sprite;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
