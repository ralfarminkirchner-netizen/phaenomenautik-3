// PHÄNOMENAUTIK 3 — Die zwölf Phänomene als verkörperte Wächter:
// portierter V2-Geist-Shader (Fresnel, Vertex-Flimmern, Orbit-Partikel),
// vergrößert und mit Agitations-/Friedens-Zuständen für Begegnungen.

import * as THREE from "three";
import type { PhenomenonDef } from "../game/data";
import type { ParticleSystem } from "./particles";

const GHOST_VERT = /* glsl */ `
uniform float uTime;
uniform float uAgitation;
varying vec3 vNormal;
varying vec3 vView;
varying float vWobble;
void main() {
  vec3 pos = position;
  float wob = sin(pos.y * 2.4 + uTime * 3.0) * 0.5
            + sin(pos.x * 3.1 - uTime * 2.2) * 0.3
            + sin(pos.z * 4.2 + uTime * 4.1) * 0.2;
  vWobble = wob;
  pos += normal * wob * (0.35 + uAgitation * 0.7);
  vec4 world = modelMatrix * vec4(pos, 1.0);
  vNormal = normalize(mat3(modelMatrix) * normal);
  vView = normalize(cameraPosition - world.xyz);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const GHOST_FRAG = /* glsl */ `
uniform vec3 uTint;
uniform float uTime;
uniform float uFlash;
uniform float uPeace;
varying vec3 vNormal;
varying vec3 vView;
varying float vWobble;
void main() {
  float fres = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 1.6);
  vec3 base = mix(uTint, vec3(1.0), 0.12 + uPeace * 0.3);
  base = mix(base, vec3(1.0, 0.85, 0.5), uPeace * 0.5);
  vec3 col = base + fres * uTint * 1.15 + fres * vec3(0.9, 0.95, 1.0) * 0.2;
  col += uFlash * vec3(0.9);
  col = clamp(col, 0.0, 0.85); // knapp an/unter der Bloom-Schwelle
  float alpha = 0.42 + fres * 0.45 + sin(vWobble * 6.0 + uTime * 5.0) * 0.04;
  gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.9));
}
`;

export class Creature {
  group = new THREE.Group();
  private mats: THREE.ShaderMaterial[] = [];
  private agitation = 0.25;
  private flash = 0;
  private peace = 0;
  private baseY: number;
  private scaleBase: number;
  private appendages: THREE.Object3D[] = [];
  private lunge = 0;
  private faceTarget: THREE.Vector3 | null = null;
  def: PhenomenonDef;
  dead = false;

  constructor(def: PhenomenonDef, groundY: number, scaleBase = 1, scene?: THREE.Scene) {
    this.def = def;
    this.scaleBase = scaleBase;
    const tint = new THREE.Color().setHSL((((def.hue % 360) + 360) % 360) / 360, 0.8, 0.5);

    const makeMat = () => {
      const m = new THREE.ShaderMaterial({
        vertexShader: GHOST_VERT,
        fragmentShader: GHOST_FRAG,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uTint: { value: tint.clone() },
          uFlash: { value: 0 },
          uPeace: { value: 0 },
          uAgitation: { value: this.agitation },
        },
      });
      this.mats.push(m);
      return m;
    };

    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(6, 2), makeMat());
    core.scale.set(1, 1.25, 1);
    this.group.add(core);

    const inner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.6, 1),
      new THREE.MeshBasicMaterial({
        color: tint.clone().lerp(new THREE.Color(1, 1, 1), 0.3),
        transparent: true,
        opacity: 0.42,
      }),
    );
    this.group.add(inner);
    this.group.userData.inner = inner;

    for (const s of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.85, 8, 8), new THREE.MeshBasicMaterial({ color: 0x101018 }));
      eye.position.set(s * 2.1, 1.4, 4.9);
      this.group.add(eye);
      const glint = new THREE.Mesh(new THREE.SphereGeometry(0.26, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      glint.position.set(s * 2.1 + 0.25, 1.7, 5.55);
      this.group.add(glint);
    }

    const mat = makeMat();
    const addApp = (o: THREE.Object3D) => {
      this.appendages.push(o);
      this.group.add(o);
    };
    switch (def.shape) {
      case "eye":
      case "bird": {
        for (const s of [-1, 1]) {
          const wing = new THREE.Mesh(new THREE.ConeGeometry(2.6, 9, 4), mat);
          wing.rotation.z = s * (Math.PI / 2 + 0.5);
          wing.position.set(s * 7.5, 2, -0.5);
          wing.scale.z = 0.35;
          addApp(wing);
        }
        break;
      }
      case "golem": {
        for (const s of [-1, 1]) {
          const arm = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.6, 8, 5), mat);
          arm.rotation.z = s * 0.5;
          arm.position.set(s * 7, -1.5, 0);
          addApp(arm);
          const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(2.4, 0), mat);
          rock.position.set(s * 4.5, 5.6, 0);
          addApp(rock);
        }
        break;
      }
      case "ghost":
      case "void":
      case "storm": {
        const n = def.shape === "storm" ? 9 : 6;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          const tent = new THREE.Mesh(new THREE.ConeGeometry(1.2, 9 + Math.random() * 4, 4), mat);
          tent.rotation.x = Math.PI;
          tent.position.set(Math.cos(a) * 3.4, -6.5, Math.sin(a) * 3.4);
          tent.userData.phase = a;
          addApp(tent);
        }
        if (def.shape === "storm") {
          const ring = new THREE.Mesh(new THREE.TorusGeometry(9, 0.8, 6, 24), mat);
          ring.rotation.x = Math.PI / 2;
          addApp(ring);
        }
        break;
      }
      case "fish": {
        const tail = new THREE.Mesh(new THREE.ConeGeometry(3.4, 7, 4), mat);
        tail.rotation.z = Math.PI / 2;
        tail.position.set(-7.5, 0, 0);
        tail.scale.z = 0.4;
        addApp(tail);
        const fin = new THREE.Mesh(new THREE.ConeGeometry(2.2, 5, 4), mat);
        fin.position.set(0, 6.8, 0);
        fin.scale.z = 0.35;
        addApp(fin);
        break;
      }
      case "crystal": {
        const n = 7;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          const shard = new THREE.Mesh(new THREE.ConeGeometry(1.4, 7 + Math.random() * 3, 4), mat);
          shard.position.set(Math.cos(a) * 5.5, 3.5, Math.sin(a) * 5.5);
          shard.rotation.z = -Math.cos(a) * 0.7;
          shard.rotation.x = Math.sin(a) * 0.7;
          shard.userData.phase = a;
          addApp(shard);
        }
        break;
      }
    }

    this.group.scale.setScalar(scaleBase);
    this.baseY = groundY + 6.6 * scaleBase;
    if (scene) scene.add(this.group);
  }

  get worldPos(): THREE.Vector3 {
    return this.group.position;
  }

  hit() {
    this.flash = 1;
    this.agitation = Math.min(1.4, this.agitation + 0.25);
  }

  attack() {
    this.lunge = 1;
    this.agitation = Math.min(1.6, this.agitation + 0.2);
  }

  setAgitation(v: number) {
    this.agitation = v;
  }

  setPeace(v: number) {
    this.peace = v;
  }

  lookAt(v: THREE.Vector3 | null) {
    this.faceTarget = v;
  }

  update(t: number, dt: number, particles?: ParticleSystem) {
    if (this.dead) return;
    this.flash = Math.max(0, this.flash - dt * 3);
    this.lunge = Math.max(0, this.lunge - dt * 1.4);
    const targetAg = this.faceTarget ? 0.6 : 0.25;
    this.agitation += (targetAg - this.agitation) * dt * 0.4;

    const g = this.group;
    g.position.y = this.baseY + Math.sin(t * 1.1) * 1.6 * this.scaleBase + this.lunge * -2;
    if (this.faceTarget) {
      const want = Math.atan2(this.faceTarget.x - g.position.x, this.faceTarget.z - g.position.z);
      let diff = want - g.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      g.rotation.y += diff * Math.min(1, dt * 2.2);
    } else {
      g.rotation.y = Math.sin(t * 0.4) * 0.5 + t * 0.05;
    }
    const breathe = 1 + Math.sin(t * 2.1) * 0.04 + this.agitation * 0.05 * Math.sin(t * 9);
    g.scale.setScalar(this.scaleBase * breathe * (1 + this.lunge * 0.15));

    for (const app of this.appendages) {
      const ph = (app.userData.phase as number) ?? 0;
      app.rotation.y = Math.sin(t * 1.7 + ph) * 0.3;
      if (this.agitation > 0.7) app.rotation.x += Math.sin(t * 8 + ph) * 0.02;
    }

    const inner = g.userData.inner as THREE.Mesh | undefined;
    if (inner) {
      const m = inner.material as THREE.MeshBasicMaterial;
      m.opacity = 0.42 + Math.sin(t * 3.4) * 0.08 + this.flash * 0.25;
      inner.scale.setScalar(1 + Math.sin(t * 2.6) * 0.12 + this.agitation * 0.15);
    }

    for (const m of this.mats) {
      m.uniforms.uTime.value = t;
      m.uniforms.uFlash.value = this.flash;
      m.uniforms.uAgitation.value = this.agitation;
      m.uniforms.uPeace.value += (this.peace - m.uniforms.uPeace.value) * dt * 1.5;
    }

    if (particles && Math.random() < 0.3) {
      particles.spawn({
        x: g.position.x + (Math.random() - 0.5) * 8 * this.scaleBase,
        y: g.position.y - 4 * this.scaleBase + Math.random() * 4,
        z: g.position.z + (Math.random() - 0.5) * 8 * this.scaleBase,
        vy: 1.5, life: 1.4, size: 1.6,
        color: this.peace > 0.5 ? [1.0, 0.9, 0.6] : [0.85, 0.9, 1.0],
        drag: 0.98,
      });
    }
  }

  dissolve(particles: ParticleSystem) {
    this.dead = true;
    const p = this.group.position;
    particles.burst(90, {
      x: p.x, y: p.y, z: p.z,
      vy: 6, spread: 14 * this.scaleBase,
      life: 2.2, size: 2.6,
      color: [0.9, 0.94, 1.0], gravity: -2, drag: 0.96,
    });
    this.group.visible = false;
  }
}
