// PHÄNOMENAUTIK — M4: Strandläufer (Wisps)
// Kleine leuchtende Phänomen-Gestalten am Strand: Glühkern + Hülle +
// drei kreisende Funken. Distanz-gated, lösen sich beim Begreifen auf.

import * as THREE from "three";
import type { ParticleSystem } from "./particles";
import { STRAND_ENCOUNTERS, encounterNode, strandVisible, type StrandEncounterDef } from "../game/encounters";
import type { GraphProgress, PhenomenonNode } from "../game/phenomenaGraph";

interface WispItem {
  def: StrandEncounterDef;
  node: PhenomenonNode;
  obj: THREE.Group;
  core: THREE.Mesh;
  motes: THREE.Object3D[];
  phase: number;
}

export class Wisps {
  private items: WispItem[] = [];
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene, progress: GraphProgress) {
    this.scene = scene;
    for (const def of STRAND_ENCOUNTERS) {
      if (!strandVisible(def.nodeId, progress)) continue;
      this.spawn(def);
    }
  }

  private spawn(def: StrandEncounterDef) {
    const node = encounterNode(def.nodeId);
    const tint = new THREE.Color().setHSL((((node.hue % 360) + 360) % 360) / 360, 0.85, 0.6);

    const obj = new THREE.Group();
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.55, 1),
      new THREE.MeshStandardMaterial({
        color: tint.clone().multiplyScalar(0.5),
        emissive: tint,
        emissiveIntensity: 1.5,
        roughness: 0.35,
      }),
    );
    obj.add(core);

    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.95, 1),
      new THREE.MeshBasicMaterial({ color: tint, transparent: true, opacity: 0.22, depthWrite: false }),
    );
    obj.add(shell);

    const motes: THREE.Object3D[] = [];
    for (let i = 0; i < 3; i++) {
      const mote = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 6, 6),
        new THREE.MeshBasicMaterial({ color: tint.clone().lerp(new THREE.Color(1, 1, 1), 0.55) }),
      );
      mote.userData.phase = (i / 3) * Math.PI * 2;
      motes.push(mote);
      obj.add(mote);
    }

    obj.position.set(def.x, def.y + 1.5, def.z);
    this.scene.add(obj);
    this.items.push({ def, node, obj, core, motes, phase: Math.random() * Math.PI * 2 });
  }

  /** Nächster aktiver Strandläufer im Radius r (für die Interaktion) */
  nearest(x: number, z: number, r: number): WispItem | null {
    let best: WispItem | null = null;
    let bd = r * r;
    for (const w of this.items) {
      const d2 = (w.def.x - x) ** 2 + (w.def.z - z) ** 2;
      if (d2 < bd) {
        bd = d2;
        best = w;
      }
    }
    return best;
  }

  /** QA/Register: aktive Strandläufer mit Position */
  list(): { nodeId: string; x: number; z: number }[] {
    return this.items.map((w) => ({ nodeId: w.node.id, x: w.def.x, z: w.def.z }));
  }

  /** Begreifen: auflösen (Funkensturm) und aus der Welt nehmen */
  dissolve(nodeId: string, particles: ParticleSystem) {
    const idx = this.items.findIndex((w) => w.node.id === nodeId);
    if (idx < 0) return;
    const w = this.items[idx];
    particles.burst(46, {
      x: w.obj.position.x,
      y: w.obj.position.y,
      z: w.obj.position.z,
      vy: 3.2,
      spread: 4.5,
      life: 1.8,
      size: 1.8,
      color: [1.0, 0.92, 0.65],
      gravity: -1.2,
      drag: 0.95,
    });
    this.scene.remove(w.obj);
    this.items.splice(idx, 1);
  }

  update(t: number, focus: THREE.Vector3) {
    for (const w of this.items) {
      const dx = w.def.x - focus.x;
      const dz = w.def.z - focus.z;
      const near = dx * dx + dz * dz <= 220 * 220; // Sicht-Gating (Performance-Budget)
      if (w.obj.visible !== near) w.obj.visible = near;
      if (!near) continue;
      w.obj.position.y = w.def.y + 1.5 + Math.sin(t * 1.6 + w.phase) * 0.28;
      w.obj.rotation.y = t * 0.5 + w.phase;
      const breathe = 1 + Math.sin(t * 2.3 + w.phase) * 0.08;
      w.core.scale.setScalar(breathe);
      for (const mote of w.motes) {
        const ph = (mote.userData.phase as number) + t * 1.4;
        mote.position.set(Math.cos(ph) * 1.25, Math.sin(ph * 1.7) * 0.5, Math.sin(ph) * 1.25);
      }
    }
  }
}
