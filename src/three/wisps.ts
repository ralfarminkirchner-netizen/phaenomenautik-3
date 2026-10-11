// PHÄNOMENAUTIK — M4/M4.2: Strandläufer & Masken (Wisps)
// Kleine leuchtende Phänomen-Gestalten am Strand: Glühkern + Hülle +
// drei kreisende Funken. Distanz-gated, lösen sich beim Begreifen auf.
// Masken (Varianten) nutzen denselben Renderer — andere Farbe, andere
// Größe (hue/sizeScale aus variants.ts).

import * as THREE from "three";
import type { ParticleSystem } from "./particles";
import { STRAND_ENCOUNTERS, encounterNode, strandVisible, type StrandEncounterDef } from "../game/encounters";
import { NODE_BY_ID, type GraphProgress, type PhenomenonNode } from "../game/phenomenaGraph";
import type { VariantSpawn } from "../game/variants";

export type WispItem =
  | { kind: "strand"; def: StrandEncounterDef; node: PhenomenonNode; obj: THREE.Group; core: THREE.Mesh; motes: THREE.Object3D[]; phase: number }
  | { kind: "variant"; spawn: VariantSpawn; node: PhenomenonNode; obj: THREE.Group; core: THREE.Mesh; motes: THREE.Object3D[]; phase: number };

export class Wisps {
  private items: WispItem[] = [];
  private scene: THREE.Scene;
  /** M4.2 (Vollkatalog): alle Masken des Tages — aktiv gerendert wird nur die Nähe. */
  private variantDay: VariantSpawn[] = [];

  constructor(scene: THREE.Scene, progress: GraphProgress) {
    this.scene = scene;
    for (const def of STRAND_ENCOUNTERS) {
      if (!strandVisible(def.nodeId, progress)) continue;
      this.spawnStrand(def);
    }
  }

  /** M4.2: Tagesliste setzen (Rotation, Drift) — aktive Masken werden erst bei Nähe gerendert. */
  setVariantDay(spawns: VariantSpawn[]) {
    this.variantDay = spawns;
    for (let i = this.items.length - 1; i >= 0; i--) {
      if (this.items[i].kind === "variant") {
        this.scene.remove(this.items[i].obj);
        this.items.splice(i, 1);
      }
    }
  }

  /** M4.2 (Vollkatalog): aktive Masken an die Spieler-Nähe angleichen (Diff nach variant.id). */
  syncVariantSpawns(near: VariantSpawn[]) {
    const nearIds = new Set(near.map((s) => s.variant.id));
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      if (it.kind === "variant" && !nearIds.has(it.spawn.variant.id)) {
        this.scene.remove(it.obj);
        this.items.splice(i, 1);
      }
    }
    const active = new Set(
      this.items.filter((w) => w.kind === "variant").map((w) => (w as { spawn: VariantSpawn }).spawn.variant.id),
    );
    for (const spawn of near) {
      if (!active.has(spawn.variant.id)) this.spawnVariant(spawn);
    }
  }

  /** QA (M4.2): die volle Tagesliste (unabhängig von der Nähe) */
  get todaysVariantSpawns(): VariantSpawn[] {
    return this.variantDay;
  }

  private makeBody(hue: number, sizeScale: number) {
    const tint = new THREE.Color().setHSL((((hue % 360) + 360) % 360) / 360, 0.85, 0.6);

    const obj = new THREE.Group();
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.55 * sizeScale, 1),
      new THREE.MeshStandardMaterial({
        color: tint.clone().multiplyScalar(0.5),
        emissive: tint,
        emissiveIntensity: 1.5,
        roughness: 0.35,
      }),
    );
    obj.add(core);

    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.95 * sizeScale, 1),
      new THREE.MeshBasicMaterial({ color: tint, transparent: true, opacity: 0.22, depthWrite: false }),
    );
    obj.add(shell);

    const motes: THREE.Object3D[] = [];
    for (let i = 0; i < 3; i++) {
      const mote = new THREE.Mesh(
        new THREE.SphereGeometry(0.09 * sizeScale, 6, 6),
        new THREE.MeshBasicMaterial({ color: tint.clone().lerp(new THREE.Color(1, 1, 1), 0.55) }),
      );
      mote.userData.phase = (i / 3) * Math.PI * 2;
      motes.push(mote);
      obj.add(mote);
    }
    return { obj, core, motes, tint };
  }

  private spawnStrand(def: StrandEncounterDef) {
    const node = encounterNode(def.nodeId);
    const { obj, core, motes } = this.makeBody(node.hue, 1);
    obj.position.set(def.x, def.y + 1.5, def.z);
    this.scene.add(obj);
    this.items.push({ kind: "strand", def, node, obj, core, motes, phase: Math.random() * Math.PI * 2 });
  }

  private spawnVariant(spawn: VariantSpawn) {
    const node = NODE_BY_ID.get(spawn.variant.nodeId);
    if (!node) return;
    const x = spawn.variant;
    const { obj, core, motes } = this.makeBody(x.hue, x.sizeScale);
    obj.position.set(spawn.x, spawn.y + 1.5, spawn.z);
    this.scene.add(obj);
    this.items.push({ kind: "variant", spawn, node, obj, core, motes, phase: Math.random() * Math.PI * 2 });
  }

  /** Nächster aktiver Strandläufer/Maske im Radius r (für die Interaktion zu Fuß) */
  nearest(x: number, z: number, r: number): WispItem | null {
    let best: WispItem | null = null;
    let bd = r * r;
    for (const w of this.items) {
      const px = w.kind === "strand" ? w.def.x : w.spawn.x;
      const pz = w.kind === "strand" ? w.def.z : w.spawn.z;
      const d2 = (px - x) ** 2 + (pz - z) ** 2;
      if (d2 < bd) {
        bd = d2;
        best = w;
      }
    }
    return best;
  }

  /** M4.2: Nächste aktive Maske im Radius r (für die Begegnung vom Schiff) */
  nearestVariant(x: number, z: number, r: number): WispItem | null {
    let best: WispItem | null = null;
    let bd = r * r;
    for (const w of this.items) {
      if (w.kind !== "variant") continue;
      const d2 = (w.spawn.x - x) ** 2 + (w.spawn.z - z) ** 2;
      if (d2 < bd) {
        bd = d2;
        best = w;
      }
    }
    return best;
  }

  /** QA/Register: aktive Strandläufer mit Position */
  list(): { nodeId: string; x: number; z: number }[] {
    return this.items.filter((w) => w.kind === "strand").map((w) => ({ nodeId: (w.node as PhenomenonNode).id, x: (w as { def: StrandEncounterDef }).def.x, z: (w as { def: StrandEncounterDef }).def.z }));
  }

  /** QA (M4.2): aktive Masken in Render-Nähe */
  variantList(): { variantId: string; maskName: string; nodeId: string; islandId: string | null; x: number; z: number; drifted: boolean }[] {
    return this.items.filter((w) => w.kind === "variant").map((w) => {
      const it = w as { spawn: VariantSpawn };
      return {
        variantId: it.spawn.variant.id,
        maskName: it.spawn.variant.maskName,
        nodeId: it.spawn.variant.nodeId,
        islandId: it.spawn.islandId,
        x: it.spawn.x,
        z: it.spawn.z,
        drifted: it.spawn.drifted,
      };
    });
  }

  /** Begreifen: auflösen (Funkensturm) und aus der Welt nehmen */
  dissolve(nodeId: string, particles: ParticleSystem) {
    const idx = this.items.findIndex((w) => w.kind === "strand" && w.node.id === nodeId);
    if (idx < 0) return;
    this.burst(this.items[idx], particles);
  }

  /** Begreifen einer Maske (M4.2): auflösen und aus der Welt nehmen */
  dissolveVariant(variantId: string, particles: ParticleSystem) {
    const idx = this.items.findIndex((w) => w.kind === "variant" && w.spawn.variant.id === variantId);
    if (idx < 0) return;
    this.burst(this.items[idx], particles);
  }

  private burst(w: WispItem, particles: ParticleSystem) {
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
    this.items.splice(this.items.indexOf(w), 1);
  }

  update(t: number, focus: THREE.Vector3) {
    for (const w of this.items) {
      const px = w.kind === "strand" ? w.def.x : w.spawn.x;
      const pz = w.kind === "strand" ? w.def.z : w.spawn.z;
      const py = w.kind === "strand" ? w.def.y : w.spawn.y;
      const dx = px - focus.x;
      const dz = pz - focus.z;
      const near = dx * dx + dz * dz <= 220 * 220; // Sicht-Gating (Performance-Budget)
      if (w.obj.visible !== near) w.obj.visible = near;
      if (!near) continue;
      const driftPulse = w.kind === "variant" && w.spawn.drifted ? 1.35 : 1; // Driftende unruhiger
      w.obj.position.y = py + 1.5 + Math.sin(t * 1.6 * driftPulse + w.phase) * 0.28;
      w.obj.rotation.y = t * 0.5 * driftPulse + w.phase;
      const breathe = 1 + Math.sin(t * 2.3 * driftPulse + w.phase) * 0.08;
      w.core.scale.setScalar(breathe);
      for (const mote of w.motes) {
        const ph = (mote.userData.phase as number) + t * 1.4 * driftPulse;
        mote.position.set(Math.cos(ph) * 1.25, Math.sin(ph * 1.7) * 0.5, Math.sin(ph) * 1.25);
      }
    }
  }
}
