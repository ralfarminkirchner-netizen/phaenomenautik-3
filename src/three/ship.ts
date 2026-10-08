// PHÄNOMENAUTIK 3 — Die TOLERANZ: echtes Galeonen-Modell (CC0) mit
// Wellen-Wiegen, Krängung beim Wenden, Kielwasser-Schaum und Bug-Gischt.

import * as THREE from "three";
import { terrainHeight } from "../game/worldLayout";
import { clamp, lerp } from "../game/noise";
import type { ParticleSystem } from "./particles";
import { getModel, setShadows } from "./assets";

// Modell-Ausrichtung: ggf. anpassen, falls das GLB anders orientiert ist
const MODEL_YAW = 0;

export class Ship {
  group = new THREE.Group();
  x = 0;
  z = 0;
  heading = 0;
  speed = 0;
  private turnLean = 0;
  private wake: THREE.Mesh;
  private wakeMat: THREE.ShaderMaterial;
  moored = false;
  private sailNodes: THREE.Object3D[] = [];
  private sailAmount = 1;

  constructor(scene: THREE.Scene) {
    const model = getModel("ship").scene.clone(true);
    // Auf ~15m Länge normieren, Deck auf y≈2
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);
    const s = 15 / Math.max(size.x, size.z, 0.001);
    model.scale.setScalar(s);
    const box2 = new THREE.Box3().setFromObject(model);
    model.position.y -= box2.min.y + size.y * s * 0.18; // Rumpf leicht eintauchen
    model.rotation.y = MODEL_YAW;
    setShadows(model, true, false);
    this.group.add(model);
    // Segel-Knoten für Einholen/Aussetzen
    model.traverse((o) => {
      if (["BackSail", "Front Sail", "MidleSail"].includes(o.name)) this.sailNodes.push(o);
    });

    scene.add(this.group);

    this.wakeMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: { value: 0 }, uStrength: { value: 0 } },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform float uStrength;
        varying vec2 vUv;
        float hash(vec2 p){ p = fract(p*vec2(234.34,435.345)); p += dot(p,p+34.23); return fract(p.x*p.y); }
        void main() {
          float spread = mix(0.06, 0.5, vUv.y);
          float d = abs(vUv.x - 0.5);
          float edge = 1.0 - smoothstep(spread * 0.5, spread, d);
          float n = hash(floor(vUv * vec2(14.0, 40.0)) + floor(uTime * 2.0));
          float a = edge * (1.0 - vUv.y) * (0.4 + n * 0.6) * uStrength;
          gl_FragColor = vec4(0.9, 0.95, 0.97, a * 0.55);
        }
      `,
    });
    const wakeGeo = new THREE.PlaneGeometry(8, 38, 1, 8);
    wakeGeo.rotateX(-Math.PI / 2);
    this.wake = new THREE.Mesh(wakeGeo, this.wakeMat);
    this.wake.renderOrder = 2;
    scene.add(this.wake); // Szenen-Ebene: folgt Wellen statt Schiffsbewegung
  }

  sailDt(
    dt: number,
    t: number,
    input: { forward: number; turn: number; turbo: boolean },
    speedLevel: number,
    particles: ParticleSystem,
    waveY: (x: number, z: number) => number,
  ): { blocked: boolean } {
    if (this.moored) {
      input = { forward: 0, turn: 0, turbo: false };
    }
    const maxSpeed = (24 + speedLevel * 5) * (input.turbo ? 1.6 : 1);
    const accel = 14;
    const target = input.forward * maxSpeed;
    this.speed = Math.abs(this.speed - target) < accel * dt ? target : this.speed + Math.sign(target - this.speed) * accel * dt;
    const turnRate = 0.85 * clamp(Math.abs(this.speed) / maxSpeed + 0.15, 0, 1) * Math.sign(this.speed || 1);
    this.heading += input.turn * turnRate * dt;
    this.turnLean = lerp(this.turnLean, input.turn * clamp(Math.abs(this.speed) / maxSpeed, 0, 1), dt * 4);

    const nx = this.x - Math.sin(this.heading) * this.speed * dt;
    const nz = this.z - Math.cos(this.heading) * this.speed * dt;

    let blocked = false;
    if (terrainHeight(nx, nz) > -2.2) {
      blocked = true;
      if (terrainHeight(nx, this.z) <= -2.2) {
        this.x = nx;
      } else if (terrainHeight(this.x, nz) <= -2.2) {
        this.z = nz;
      } else {
        this.speed *= 0.4;
      }
    } else {
      this.x = nx;
      this.z = nz;
    }

    const y = waveY(this.x, this.z);
    const yBow = waveY(this.x - Math.sin(this.heading) * 5, this.z - Math.cos(this.heading) * 5);
    const yStern = waveY(this.x + Math.sin(this.heading) * 5, this.z + Math.cos(this.heading) * 5);
    const yPort = waveY(this.x - Math.cos(this.heading) * 2.5, this.z + Math.sin(this.heading) * 2.5);
    const yStar = waveY(this.x + Math.cos(this.heading) * 2.5, this.z - Math.sin(this.heading) * 2.5);
    this.group.position.set(this.x, y * 0.85 + 0.25, this.z);
    this.group.rotation.set(0, 0, 0);
    this.group.rotateY(this.heading);
    this.group.rotateX(Math.atan2(yStern - yBow, 10) * 0.8);
    this.group.rotateZ(Math.atan2(yStar - yPort, 5) * 0.7 + this.turnLean * 0.14);

    // Segel: steht das Schiff → eingerollt; Fahrt → gesetzt
    const targetSail = this.moored ? 0.12 : 0.25 + 0.75 * clamp(Math.abs(this.speed) / maxSpeed, 0, 1);
    this.sailAmount = lerp(this.sailAmount, targetSail, dt * 2.5);
    for (const sn of this.sailNodes) {
      sn.scale.y = Math.max(0.08, this.sailAmount);
      sn.scale.x = 0.7 + 0.3 * this.sailAmount;
    }

    const strength = clamp(Math.abs(this.speed) / maxSpeed, 0, 1);
    this.wakeMat.uniforms.uTime.value = t;
    this.wakeMat.uniforms.uStrength.value = strength;
    // Kielwasser hinter dem Schiff, auf mittlerer Wellenhöhe, nur mit Kurs gedreht
    const wBack = 22;
    const wx = this.x + Math.sin(this.heading) * wBack;
    const wz = this.z + Math.cos(this.heading) * wBack;
    this.wake.position.set(wx, waveY(wx, wz) + 0.18, wz);
    this.wake.rotation.set(0, this.heading, 0);
    if (strength > 0.45 && Math.random() < strength * 0.6) {
      particles.spawn({
        x: this.x - Math.sin(this.heading) * 8.5 + (Math.random() - 0.5) * 2.4,
        y: 0.4,
        z: this.z - Math.cos(this.heading) * 8.5 + (Math.random() - 0.5) * 2.4,
        vy: 1.4 + Math.random() * 1.6, life: 0.7, size: 2.2,
        color: [0.85, 0.93, 0.96], gravity: 5, drag: 0.94,
      });
    }
    return { blocked };
  }

  setPose(x: number, z: number, heading: number) {
    this.x = x;
    this.z = z;
    this.heading = heading;
    this.speed = 0;
    this.group.position.set(x, 0.3, z);
    this.group.rotation.set(0, heading, 0);
  }
}
