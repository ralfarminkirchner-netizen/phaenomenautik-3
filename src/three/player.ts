// PHÄNOMENAUTIK 3 — Spielerfigur: geriggter KayKit-Charakter („Rogue Hooded“)
// mit AnimationStateMachine (Idle/Gehen/Rennen/Sprung/Angriff/Ausweichen/Treffer),
// Axt am Hand-Slot. Darunter: derselbe bewährte Kapsel-Controller.
// M3: Klettern an Mooswänden (Zelda-Regel) mit Ausdauer-Kopplung.

import * as THREE from "three";
import { clamp, lerp } from "../game/noise";
import type { ParticleSystem } from "./particles";
import { cloneSkinned, getModel, normalizeHeight, setShadows } from "./assets";
import { wallCoords, wallFrame, type ClimbWallDef } from "../game/climb";

export interface MoveInput {
  x: number;
  z: number;
  sprint: boolean;
  jump: boolean;
}

/** Kletter-Kontext aus der Welt: Wandliste + Ausdauer-Abfluss (false = leer) */
export interface ClimbCtx {
  walls: ClimbWallDef[];
  drain: (perSecond: number, dt: number) => boolean;
}

const WALK = 6.4;
const SPRINT = 10.2;
const ACCEL = 34;
const GRAVITY = 24;
const JUMP_VEL = 9.2;
const COYOTE = 0.14;
const BUFFER = 0.14;
const CLIMB_SPEED = 2.1;

type LocoState = "idle" | "walk" | "run" | "air" | "climb" | "glide";

export class Player {
  group = new THREE.Group();
  pos = new THREE.Vector3();
  vel = new THREE.Vector3();
  facing = 0;
  grounded = true;
  private coyote = 0;
  private jumpBuf = 0;
  private airJumps = 0;
  attackT = 0;
  dodgeT = 0;
  hitT = 0;
  speed2D = 0;
  climbing: { def: ClimbWallDef; u: number; v: number } | null = null;
  hasGlider = false; // M3: gefertigter Gleitschirm (Ausrüstung)
  gliding = false;

  private rig: THREE.Object3D;
  private mixer: THREE.AnimationMixer;
  private actions = new Map<string, THREE.AnimationAction>();
  private current: THREE.AnimationAction | null = null;
  private loco: LocoState = "idle";

  // Kamera-Rig
  camYaw = Math.PI;
  camPitch = 0.32;
  camDist = 8.5;
  private camPos = new THREE.Vector3();
  private camTarget = new THREE.Vector3();

  constructor(scene: THREE.Scene) {
    this.rig = cloneSkinned("rogue");
    normalizeHeight(this.rig, 1.85);
    setShadows(this.rig, true, false);
    this.rig.position.y = 0;
    // Im GLB gebündelte Waffen/Props ausblenden (Armbrust, Messer etc.)
    const HIDDEN = ["Knife", "Knife_Offhand", "1H_Crossbow", "2H_Crossbow", "Throwable", "Quiver", "Spellbook"];
    this.rig.traverse((o) => {
      if (HIDDEN.includes(o.name)) o.visible = false;
    });

    // Axt in die rechte Hand (normiert, am Handknochen ausgerichtet)
    // Hinweis: Der GLTF-Loader entfernt Punkte aus Knotennamen → „handslot.r“ wird „handslotr“
    const slot =
      this.rig.getObjectByName("handslotr") ??
      this.rig.getObjectByName("handr") ??
      this.rig.getObjectByName("handslot.r");
    if (slot) {
      const axe = getModel("axe").scene.clone(true);
      setShadows(axe, true, false);
      const box = new THREE.Box3().setFromObject(axe);
      const size = new THREE.Vector3();
      box.getSize(size);
      const sc = 0.62 / Math.max(size.x, size.y, size.z, 0.001);
      axe.scale.setScalar(sc);
      axe.position.set(0, -0.02, 0);
      slot.add(axe);
    }

    this.group.add(this.rig);
    this.group.visible = false;
    scene.add(this.group);

    this.mixer = new THREE.AnimationMixer(this.rig);
    for (const clip of getModel("rogue").animations) {
      this.actions.set(clip.name, this.mixer.clipAction(clip));
    }
    this.play("Idle", 0);
  }

  private play(name: string, fade = 0.18, opts?: { once?: boolean; timeScale?: number }) {
    const next = this.actions.get(name);
    if (!next) return;
    if (this.current === next) return;
    next.reset();
    next.timeScale = opts?.timeScale ?? 1;
    if (opts?.once) {
      next.setLoop(THREE.LoopOnce, 1);
      next.clampWhenFinished = true;
    } else {
      next.setLoop(THREE.LoopRepeat, Infinity);
    }
    if (this.current) {
      next.crossFadeFrom(this.current, fade, false);
    }
    next.play();
    this.current = next;
  }

  place(x: number, y: number, z: number, facing: number) {
    this.pos.set(x, y, z);
    this.vel.set(0, 0, 0);
    this.facing = facing;
    this.camYaw = facing + Math.PI;
    this.grounded = true;
    this.climbing = null;
  }

  /** Loslassen von der Wand (kleiner Abstoß optional) */
  releaseClimb(push = 0) {
    if (!this.climbing) return;
    const { nx, nz } = wallFrame(this.climbing.def);
    this.climbing = null;
    if (push > 0) {
      this.vel.set(nx * push * 8, 1.5, nz * push * 8);
    }
  }

  /** Greifversuch: Spieler drückt zur Wand oder ist in der Luft davor */
  private tryGrab(ctx: ClimbCtx, wx: number, wz: number) {
    for (const def of ctx.walls) {
      const { nx, nz } = wallFrame(def);
      const c = wallCoords(def, this.pos.x, this.pos.y, this.pos.z);
      if (c.dist < -0.2 || c.dist > 1.15) continue;
      if (c.v < -0.3 || c.v > def.height - 0.4) continue;
      if (Math.abs(c.lateral) > def.width / 2 + 0.6) continue;
      // Greifen nur, wenn zur Wand gedrückt wird — oder mitten im Sprung davor
      const toward = -(wx * nx + wz * nz);
      if (this.grounded && toward < 0.25) continue;
      this.climbing = {
        def,
        u: clamp(c.lateral, -def.width / 2, def.width / 2),
        v: clamp(c.v, 0, def.height),
      };
      this.vel.set(0, 0, 0);
      this.grounded = false;
      this.loco = "idle";
      this.play(this.actions.has("Climbing_A") ? "Climbing_A" : "Jump_Idle", 0.1);
      return;
    }
  }

  /** Kletter-Bewegung: W/S hoch/runter, A/D seitlich, Leertaste Absprung */
  private updateClimb(
    dt: number,
    input: MoveInput,
    ctx: ClimbCtx | undefined,
    groundAt: (x: number, z: number) => number,
    particles: ParticleSystem,
  ) {
    const c = this.climbing!;
    const def = c.def;
    const { nx, nz, rx, rz } = wallFrame(def);
    const moving = Math.abs(input.x) + Math.abs(input.z) > 0.1;

    // Ausdauer: Halten kostet wenig, Bewegen mehr — leer = loslassen
    if (ctx && !ctx.drain(moving ? 4.5 : 1.2, dt)) {
      this.releaseClimb(0.4);
      return;
    }

    // Absprung von der Wand
    if (input.jump) {
      this.releaseClimb();
      this.vel.set(nx * 5.5, 4.4, nz * 5.5);
      this.airJumps = 1; // kein Doppelsprung direkt nach Absprung
      particles.burst(8, {
        x: this.pos.x, y: this.pos.y + 0.4, z: this.pos.z, spread: 0.5,
        vy: 0.8, life: 0.45, size: 1.3, color: [0.65, 0.75, 0.45], gravity: 3, drag: 0.94,
      });
      return;
    }

    c.v += input.z * CLIMB_SPEED * dt;
    c.u += input.x * CLIMB_SPEED * dt;
    c.u = clamp(c.u, -def.width / 2, def.width / 2);

    // Über die Kante klettern (Manteln): oben auf dem Plateau abstellen
    if (c.v >= def.height) {
      const lx = def.x - nx * 1.7 + rx * c.u;
      const lz = def.z - nz * 1.7 + rz * c.u;
      const g = groundAt(lx, lz);
      if (g > def.baseY + def.height * 0.5) {
        this.pos.set(lx, g, lz);
        this.releaseClimb();
        this.grounded = true;
        particles.burst(7, {
          x: lx, y: g + 0.15, z: lz, spread: 0.5,
          vy: 1.1, life: 0.5, size: 1.4, color: [0.75, 0.72, 0.62], gravity: 4, drag: 0.93,
        });
        return;
      }
      c.v = def.height; // Kante noch nicht erreichbar — an der Oberkante halten
    }
    if (c.v < 0) c.v = 0;

    this.pos.set(
      def.x + nx * 0.5 + rx * c.u,
      def.baseY + c.v,
      def.z + nz * 0.5 + rz * c.u,
    );
    this.facing = def.yaw + Math.PI; // zur Wand schauen
    this.vel.set(0, 0, 0);
    this.grounded = false;

    // Am Fuß der Wand wieder Bodenkontakt → sanft absteigen
    if (c.v <= 0.02) {
      const g = groundAt(this.pos.x, this.pos.z);
      if (g >= this.pos.y - 0.35) {
        this.pos.y = g;
        this.releaseClimb();
        this.grounded = true;
      }
    }
  }

  update(
    dt: number,
    input: MoveInput,
    groundAt: (x: number, z: number) => number,
    colliders: { x: number; z: number; r: number }[],
    particles: ParticleSystem,
    climb?: ClimbCtx,
  ) {
    const sin = Math.sin(this.camYaw);
    const cos = Math.cos(this.camYaw);
    let wx = input.x * cos - input.z * sin;
    let wz = -input.x * sin - input.z * cos;
    const wl = Math.hypot(wx, wz);
    if (wl > 1) {
      wx /= wl;
      wz /= wl;
    }

    // Klettern: eigenes Bewegungsmodell, umgeht Schwerkraft & Schritt-Logik
    if (this.climbing) {
      this.updateClimb(dt, input, climb, groundAt, particles);
      this.speed2D = 0;
      this.group.position.copy(this.pos);
      this.group.rotation.y = this.facing;
      this.animate(dt);
      return;
    }
    if (climb) this.tryGrab(climb, wx, wz);

    const maxSp = input.sprint ? SPRINT : WALK;

    const tx = wx * maxSp;
    const tz = wz * maxSp;
    const acc = this.grounded ? ACCEL : ACCEL * 0.45;
    this.vel.x = Math.abs(this.vel.x - tx) < acc * dt ? tx : this.vel.x + Math.sign(tx - this.vel.x) * acc * dt;
    this.vel.z = Math.abs(this.vel.z - tz) < acc * dt ? tz : this.vel.z + Math.sign(tz - this.vel.z) * acc * dt;

    if (input.jump) this.jumpBuf = BUFFER;
    else this.jumpBuf = Math.max(0, this.jumpBuf - dt);
    this.coyote = this.grounded ? COYOTE : Math.max(0, this.coyote - dt);
    if (this.jumpBuf > 0 && this.coyote > 0) {
      this.vel.y = JUMP_VEL;
      this.grounded = false;
      this.coyote = 0;
      this.jumpBuf = 0;
      particles.burst(6, {
        x: this.pos.x, y: this.pos.y + 0.1, z: this.pos.z, spread: 0.5,
        vy: 1.2, life: 0.5, size: 1.4, color: [0.8, 0.78, 0.7], gravity: 4, drag: 0.94,
      });
    } else if (this.jumpBuf > 0 && !this.grounded && this.airJumps < 1) {
      // DOPPELSPRUNG: ein zweiter Sprung in der Luft
      this.vel.y = JUMP_VEL * 0.92;
      this.airJumps++;
      this.jumpBuf = 0;
      particles.burst(12, {
        x: this.pos.x, y: this.pos.y + 0.2, z: this.pos.z, spread: 0.9,
        vy: 0.6, life: 0.6, size: 1.8, color: [0.85, 0.9, 1.0], gravity: 2, drag: 0.94,
      });
    }

    // Gleitschirm (M3): in der Luft Leertaste halten — sanftes Sinken, Auftrieb
    // in Blickrichtung. Kostet Ausdauer; ist sie leer, wird es ein normaler Fall.
    if (this.hasGlider && !this.grounded && input.jump && this.vel.y < 1.5 && (!climb || climb.drain(2.2, dt))) {
      if (!this.gliding) {
        particles.burst(10, {
          x: this.pos.x, y: this.pos.y + 0.4, z: this.pos.z, spread: 1.1,
          vy: 0.4, life: 0.5, size: 1.6, color: [0.85, 0.92, 1.0], gravity: 1, drag: 0.94,
        });
      }
      this.gliding = true;
      this.vel.y = Math.max(this.vel.y - GRAVITY * dt * 0.12, -1.6);
      const fx = -Math.sin(this.camYaw);
      const fz = -Math.cos(this.camYaw);
      this.vel.x += fx * 22 * dt;
      this.vel.z += fz * 22 * dt;
      const sp = Math.hypot(this.vel.x, this.vel.z);
      if (sp > 9.5) {
        this.vel.x *= 9.5 / sp;
        this.vel.z *= 9.5 / sp;
      }
    } else {
      this.gliding = false;
      this.vel.y -= GRAVITY * dt;
    }
    this.vel.y = Math.max(this.vel.y, -30);

    const step = (dx: number, dz: number) => {
      const nx = this.pos.x + dx;
      const nz = this.pos.z + dz;
      const g = groundAt(nx, nz);
      if (g < -0.55) return false;
      const gHere = groundAt(this.pos.x, this.pos.z);
      if (this.grounded && g - gHere > 1.5) return false;
      this.pos.x = nx;
      this.pos.z = nz;
      return true;
    };
    const mx = this.vel.x * dt;
    const mz = this.vel.z * dt;
    if (!step(mx, mz)) {
      if (!step(mx, 0)) step(0, mz);
      this.vel.x *= 0.5;
      this.vel.z *= 0.5;
    }
    this.pos.y += this.vel.y * dt;

    const ground = groundAt(this.pos.x, this.pos.z);
    if (this.pos.y <= ground) {
      if (!this.grounded && this.vel.y < -9) {
        particles.burst(8, {
          x: this.pos.x, y: ground + 0.1, z: this.pos.z, spread: 0.6,
          vy: 1.5, life: 0.5, size: 1.5, color: [0.75, 0.72, 0.65], gravity: 5, drag: 0.93,
        });
      }
      this.pos.y = ground;
      this.vel.y = 0;
      this.grounded = true;
      this.airJumps = 0;
    } else if (this.pos.y - ground > 0.05) {
      this.grounded = false;
    }

    for (const c of colliders) {
      const dx = this.pos.x - c.x;
      const dz = this.pos.z - c.z;
      const rr = c.r + 0.42;
      const d2 = dx * dx + dz * dz;
      if (d2 < rr * rr && d2 > 0.0001) {
        const d = Math.sqrt(d2);
        const push = (rr - d) / d;
        this.pos.x += dx * push;
        this.pos.z += dz * push;
      }
    }

    this.speed2D = Math.hypot(this.vel.x, this.vel.z);

    if (this.speed2D > 0.6) {
      const want = Math.atan2(this.vel.x, this.vel.z);
      let diff = want - this.facing;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.facing += diff * Math.min(1, dt * 11);
    }

    this.group.position.copy(this.pos);
    this.group.rotation.y = this.facing;

    this.animate(dt);
  }

  private animate(dt: number) {
    // Einmal-Overrides haben Vorrang
    if (this.attackT > 0) {
      this.attackT -= dt;
    } else if (this.dodgeT > 0) {
      this.dodgeT -= dt;
    } else if (this.hitT > 0) {
      this.hitT -= dt;
    }

    let want: LocoState;
    if (this.climbing) want = "climb";
    else if (this.gliding) want = "glide";
    else if (!this.grounded) want = "air";
    else if (this.speed2D > 7.2) want = "run";
    else if (this.speed2D > 0.7) want = "walk";
    else want = "idle";

    // Gleit-Haltung: Rigg neigt sich nach vorn
    const leanTarget = this.gliding ? 0.55 : 0;
    this.rig.rotation.x += (leanTarget - this.rig.rotation.x) * Math.min(1, dt * 6);

    if (this.attackT <= 0 && this.dodgeT <= 0 && this.hitT <= 0) {
      if (want !== this.loco) {
        this.loco = want;
        switch (want) {
          case "idle":
            this.play("Idle", 0.22);
            break;
          case "walk":
            this.play("Walking_A", 0.16, { timeScale: clamp(this.speed2D / 4.5, 0.7, 1.6) });
            break;
          case "run":
            this.play("Running_A", 0.14, { timeScale: clamp(this.speed2D / 8.5, 0.8, 1.4) });
            break;
          case "air":
            this.play("Jump_Idle", 0.1);
            break;
          case "glide":
            this.play(this.actions.has("Hang_Glide") ? "Hang_Glide" : "Jump_Idle", 0.16);
            break;
          case "climb":
            this.play(this.actions.has("Climbing_A") ? "Climbing_A" : "Jump_Idle", 0.14);
            break;
        }
      } else if (want === "walk" || want === "run") {
        // Tempo an Geschwindigkeit anpassen
        const a = this.current;
        if (a) a.timeScale = lerp(a.timeScale, clamp(this.speed2D / (want === "run" ? 8.5 : 4.5), 0.7, 1.6), dt * 6);
      }
    }

    this.mixer.update(dt);
  }

  /** Axtschlag (auch fürs Holzfällen genutzt) */
  swing() {
    this.attackT = 0.5;
    this.loco = "idle";
    this.play("1H_Melee_Attack_Chop", 0.06, { once: true, timeScale: 1.25 });
  }

  dodge() {
    this.dodgeT = 0.42;
    this.loco = "idle";
    this.play("Dodge_Backward", 0.05, { once: true, timeScale: 1.3 });
    const bx = Math.sin(this.facing + Math.PI);
    const bz = Math.cos(this.facing + Math.PI);
    this.vel.x = bx * 13;
    this.vel.z = bz * 13;
  }

  hurt() {
    if (this.attackT > 0) return; // Angriff nicht unterbrechen
    this.hitT = 0.45;
    this.play("Hit_A", 0.05, { once: true, timeScale: 1.2 });
  }

  updateCamera(camera: THREE.PerspectiveCamera, dt: number, groundAt: (x: number, z: number) => number) {
    const targetY = this.pos.y + 2.1;
    this.camTarget.set(this.pos.x, targetY, this.pos.z);

    const cp = Math.cos(this.camPitch);
    const sp = Math.sin(this.camPitch);
    const ox = Math.sin(this.camYaw) * cp;
    const oz = Math.cos(this.camYaw) * cp;
    const sx = Math.cos(this.camYaw) * 0.85;
    const sz = -Math.sin(this.camYaw) * 0.85;

    const want = new THREE.Vector3(
      this.pos.x + ox * this.camDist + sx,
      targetY + sp * this.camDist,
      this.pos.z + oz * this.camDist + sz,
    );
    const g = groundAt(want.x, want.z) + 0.5;
    if (want.y < g) want.y = g;

    const k = 1 - Math.pow(0.0001, dt);
    this.camPos.lerp(want, k);
    camera.position.copy(this.camPos);
    camera.lookAt(this.camTarget.x + sx * 0.6, this.camTarget.y, this.camTarget.z + sz * 0.6);
  }

  snapCamera(camera: THREE.PerspectiveCamera, groundAt: (x: number, z: number) => number) {
    const cp = Math.cos(this.camPitch);
    const sp = Math.sin(this.camPitch);
    this.camPos.set(
      this.pos.x + Math.sin(this.camYaw) * cp * this.camDist,
      this.pos.y + 2.1 + sp * this.camDist,
      this.pos.z + Math.cos(this.camYaw) * cp * this.camDist,
    );
    const g = groundAt(this.camPos.x, this.camPos.z) + 0.5;
    if (this.camPos.y < g) this.camPos.y = g;
    camera.position.copy(this.camPos);
  }
}
