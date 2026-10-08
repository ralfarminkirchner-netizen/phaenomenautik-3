// PHÄNOMENAUTIK 3 — Schatten: animierte KayKit-Skelette, dunkel-violett getönt,
// mit Awaken-/Angriffs-/Todes-Animationen. KI: Wandern, Aggro, Telegraph, Zustoßen.

import * as THREE from "three";
import { lerp } from "../game/noise";
import type { ParticleSystem } from "./particles";
import { cloneSkinned, getModel, normalizeHeight, setShadows } from "./assets";

export type ShadowState = "dormant" | "awaken" | "wander" | "chase" | "windup" | "strike" | "cooldown" | "dying";

export class ShadowEnemy {
  group = new THREE.Group();
  hp = 30;
  maxHp = 30;
  state: ShadowState = "dormant";
  x: number;
  z: number;
  homeX: number;
  homeZ: number;
  facing = 0;
  dead = false;
  id: string;
  private stateT = 0;
  private wanderA = Math.random() * Math.PI * 2;
  private groundAt: (x: number, z: number) => number;
  private rig: THREE.Object3D;
  private mixer: THREE.AnimationMixer;
  private actions = new Map<string, THREE.AnimationAction>();
  private current: THREE.AnimationAction | null = null;
  private hasAwoken = false;

  constructor(scene: THREE.Scene, id: string, x: number, z: number, groundAt: (x: number, z: number) => number) {
    this.id = id;
    this.x = x;
    this.z = z;
    this.homeX = x;
    this.homeZ = z;
    this.groundAt = groundAt;

    this.rig = cloneSkinned("skeleton");
    normalizeHeight(this.rig, 1.75);
    setShadows(this.rig, true, false);
    // Schatten-Tönung: dunkles Violett mit schwachem Glühen
    this.rig.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        const m = (o.material as THREE.MeshStandardMaterial).clone();
        m.color = new THREE.Color(0.22, 0.14, 0.34);
        m.emissive = new THREE.Color(0.25, 0.08, 0.42);
        m.emissiveIntensity = 0.55;
        o.material = m;
      }
    });
    this.group.add(this.rig);
    scene.add(this.group);

    this.mixer = new THREE.AnimationMixer(this.rig);
    for (const clip of getModel("skeleton").animations) {
      this.actions.set(clip.name, this.mixer.clipAction(clip));
    }
    // reglos bis zur Annäherung
    this.play("Skeleton_Inactive_Standing_Pose", 0);
    this.syncPos();
  }

  private play(name: string, fade = 0.18, once = false, timeScale = 1) {
    const next = this.actions.get(name);
    if (!next || this.current === next) return;
    next.reset();
    next.timeScale = timeScale;
    if (once) {
      next.setLoop(THREE.LoopOnce, 1);
      next.clampWhenFinished = true;
    } else {
      next.setLoop(THREE.LoopRepeat, Infinity);
    }
    if (this.current) next.crossFadeFrom(this.current, fade, false);
    next.play();
    this.current = next;
  }

  private syncPos() {
    const g = this.groundAt(this.x, this.z);
    this.group.position.set(this.x, g, this.z);
    this.group.rotation.y = this.facing;
  }

  hit(dmg: number, particles: ParticleSystem): boolean {
    if (this.dead || this.state === "dying") return false;
    this.hp -= dmg;
    particles.burst(12, {
      x: this.x, y: this.group.position.y + 1.2, z: this.z, spread: 0.9,
      vy: 2.5, life: 0.6, size: 1.7, color: [0.7, 0.45, 0.95], gravity: 3, drag: 0.95,
    });
    if (this.hp <= 0) {
      this.state = "dying";
      this.stateT = 0;
      this.play("Death_C_Skeletons", 0.08, true);
      return true;
    }
    if (this.hasAwoken && this.state !== "strike") this.play("Hit_A", 0.06, true, 1.2);
    if (this.state === "dormant" || this.state === "wander") {
      this.state = this.hasAwoken ? "chase" : "awaken";
      this.stateT = 0;
    }
    return false;
  }

  update(dt: number, t: number, px: number, pz: number, playerDodging: boolean, particles: ParticleSystem): number {
    this.mixer.update(dt);
    void t;

    if (this.state === "dying") {
      this.stateT += dt;
      if (this.stateT > 1.6 && !this.dead) {
        this.dead = true;
        this.group.visible = false;
        particles.burst(40, {
          x: this.x, y: this.group.position.y + 0.8, z: this.z, spread: 1.4,
          vy: 3.5, life: 1.2, size: 2.2, color: [0.75, 0.5, 0.95], gravity: -1, drag: 0.96,
        });
      }
      return 0;
    }

    const dx = px - this.x;
    const dz = pz - this.z;
    const dist = Math.hypot(dx, dz);
    let damage = 0;
    this.stateT += dt;

    switch (this.state) {
      case "dormant": {
        if (dist < 13) {
          this.state = "awaken";
          this.stateT = 0;
          this.hasAwoken = true;
          this.play("Skeletons_Awaken_Standing", 0.15, true);
        }
        break;
      }
      case "awaken": {
        if (this.stateT > 1.4) {
          this.state = "chase";
          this.stateT = 0;
        }
        break;
      }
      case "wander": {
        if (dist < 15) {
          this.state = "chase";
          this.play("Idle_Combat", 0.2);
          break;
        }
        this.wanderA += (Math.random() - 0.5) * dt * 2.4;
        this.moveToward(this.homeX + Math.cos(this.wanderA) * 6, this.homeZ + Math.sin(this.wanderA) * 6, 1.4, dt, "Walking_D_Skeletons");
        break;
      }
      case "chase": {
        if (dist > 26) {
          this.state = "wander";
          break;
        }
        if (dist < 2.3) {
          this.state = "windup";
          this.stateT = 0;
          this.play("1H_Melee_Attack_Chop", 0.08, true, 0.85);
          break;
        }
        this.moveToward(px, pz, 4.6, dt, "Running_A");
        break;
      }
      case "windup": {
        if (this.stateT > 0.75) {
          this.state = "strike";
          this.stateT = 0;
          if (dist < 2.6 && !playerDodging) damage = 9;
        }
        break;
      }
      case "strike": {
        // kurzer Nachschub während des Hiebs
        this.x += Math.sin(this.facing) * 3.5 * dt;
        this.z += Math.cos(this.facing) * 3.5 * dt;
        if (this.stateT > 0.35) {
          this.state = "cooldown";
          this.stateT = 0;
          this.play("Idle_Combat", 0.25);
        }
        break;
      }
      case "cooldown": {
        if (this.stateT > 1.4) {
          this.state = dist < 15 ? "chase" : "wander";
          this.stateT = 0;
        }
        break;
      }
    }

    if (this.groundAt(this.x, this.z) < 0.25) {
      this.x = lerp(this.x, this.homeX, dt * 2);
      this.z = lerp(this.z, this.homeZ, dt * 2);
    }

    this.syncPos();
    return damage;
  }

  private moveToward(tx: number, tz: number, speed: number, dt: number, clip: string) {
    this.play(clip, 0.18, false, 1.1);
    const dx = tx - this.x;
    const dz = tz - this.z;
    const d = Math.hypot(dx, dz);
    if (d < 0.05) return;
    this.x += (dx / d) * speed * dt;
    this.z += (dz / d) * speed * dt;
    const want = Math.atan2(dx, dz);
    let diff = want - this.facing;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    this.facing += diff * Math.min(1, dt * 8);
  }

  dispose(scene: THREE.Scene) {
    scene.remove(this.group);
  }
}
