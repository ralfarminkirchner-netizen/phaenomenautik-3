// PHÄNOMENAUTIK 3 — CPU-Partikelsystem (Points, Pool): Funken, Sprühnebel,
// Holzspäne, Auflösungseffekte. Ein Draw Call.

import * as THREE from "three";

interface Particle {
  alive: boolean;
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  life: number; maxLife: number;
  size: number;
  r: number; g: number; b: number;
  gravity: number;
  drag: number;
}

export interface SpawnOpts {
  x: number; y: number; z: number;
  vx?: number; vy?: number; vz?: number;
  spread?: number;
  life?: number;
  size?: number;
  color: [number, number, number];
  gravity?: number;
  drag?: number;
}

const MAX = 2200;

export class ParticleSystem {
  points: THREE.Points;
  private pool: Particle[] = [];
  private geo: THREE.BufferGeometry;
  private posAttr: THREE.BufferAttribute;
  private colAttr: THREE.BufferAttribute;
  private sizeAttr: THREE.BufferAttribute;
  private cursor = 0;

  constructor(scene: THREE.Scene) {
    for (let i = 0; i < MAX; i++) {
      this.pool.push({ alive: false, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0, maxLife: 1, size: 1, r: 1, g: 1, b: 1, gravity: 0, drag: 1 });
    }
    this.geo = new THREE.BufferGeometry();
    this.posAttr = new THREE.BufferAttribute(new Float32Array(MAX * 3), 3);
    this.colAttr = new THREE.BufferAttribute(new Float32Array(MAX * 3), 3);
    this.sizeAttr = new THREE.BufferAttribute(new Float32Array(MAX), 1);
    this.geo.setAttribute("position", this.posAttr);
    this.geo.setAttribute("color", this.colAttr);
    this.geo.setAttribute("psize", this.sizeAttr);

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        attribute float psize;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = psize * 260.0 / max(1.0, -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vColor;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float a = smoothstep(0.5, 0.08, length(c));
          if (a < 0.02) discard;
          gl_FragColor = vec4(vColor, a);
        }
      `,
      vertexColors: true,
    });
    this.points = new THREE.Points(this.geo, mat);
    this.points.frustumCulled = false;
    this.points.renderOrder = 5;
    scene.add(this.points);
  }

  spawn(o: SpawnOpts) {
    const p = this.pool[this.cursor];
    this.cursor = (this.cursor + 1) % MAX;
    const sp = o.spread ?? 0;
    p.alive = true;
    p.x = o.x + (Math.random() - 0.5) * sp;
    p.y = o.y + (Math.random() - 0.5) * sp * 0.5;
    p.z = o.z + (Math.random() - 0.5) * sp;
    p.vx = (o.vx ?? 0) + (Math.random() - 0.5) * sp * 0.6;
    p.vy = o.vy ?? 0;
    p.vz = (o.vz ?? 0) + (Math.random() - 0.5) * sp * 0.6;
    p.maxLife = (o.life ?? 1) * (0.7 + Math.random() * 0.6);
    p.life = p.maxLife;
    p.size = (o.size ?? 1) * (0.7 + Math.random() * 0.6);
    p.r = o.color[0];
    p.g = o.color[1];
    p.b = o.color[2];
    p.gravity = o.gravity ?? 0;
    p.drag = o.drag ?? 0.98;
  }

  burst(n: number, o: SpawnOpts) {
    for (let i = 0; i < n; i++) this.spawn(o);
  }

  update(dt: number) {
    const pos = this.posAttr.array as Float32Array;
    const col = this.colAttr.array as Float32Array;
    const siz = this.sizeAttr.array as Float32Array;
    for (let i = 0; i < MAX; i++) {
      const p = this.pool[i];
      if (!p.alive) {
        siz[i] = 0;
        continue;
      }
      p.life -= dt;
      if (p.life <= 0) {
        p.alive = false;
        siz[i] = 0;
        continue;
      }
      p.vy -= p.gravity * dt;
      const d = Math.pow(p.drag, dt * 60);
      p.vx *= d;
      p.vy *= d;
      p.vz *= d;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      const f = p.life / p.maxLife;
      pos[i * 3] = p.x;
      pos[i * 3 + 1] = p.y;
      pos[i * 3 + 2] = p.z;
      col[i * 3] = p.r;
      col[i * 3 + 1] = p.g;
      col[i * 3 + 2] = p.b;
      siz[i] = p.size * (0.4 + f * 0.6);
    }
    this.posAttr.needsUpdate = true;
    this.colAttr.needsUpdate = true;
    this.sizeAttr.needsUpdate = true;
  }
}
