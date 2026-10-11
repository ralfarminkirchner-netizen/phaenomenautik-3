// PHÄNOMENAUTIK 3 — Die TOLERANZ: echtes Galeonen-Modell (CC0) mit
// Wellen-Wiegen, Krängung beim Wenden, Kielwasser-Schaum und Bug-Gischt.

import * as THREE from "three";
import { terrainHeight } from "../game/worldLayout";
import { clamp, lerp } from "../game/noise";
import type { ParticleSystem } from "./particles";
import { getModel, setShadows } from "./assets";

// Modell-Ausrichtung: Im GLB zeigt der Bug Richtung +Z (Front Sail z≈+1.13,
// BackSail z≈−1.05). Die Fahrtrichtung ist (−sin h, −cos h), also −Z bei h=0.
// Ohne Drehung fuhr das Schiff sichtbar mit dem Heck voraus — MODEL_YAW=π
// richtet den Bug in die tatsächliche Fahrtrichtung aus.
const MODEL_YAW = Math.PI;

export class Ship {
  group = new THREE.Group();
  x = 0;
  z = 0;
  heading = 0;
  speed = 0;
  private turnLean = 0;
  private hullPitch = 0;
  private hullRoll = 0;
  private wake: THREE.Mesh;
  private wakeMat: THREE.ShaderMaterial;
  private shadowBlob: THREE.Mesh | null = null;
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
    // Segel-Knoten für Einholen/Aussetzen. GLB: „Front Sail“ mit Leerzeichen;
    // je nach drei-Version wird der Name unverändert oder sanitisiert
    // übernommen — deshalb alle drei Schreibweisen akzeptieren.
    const SAIL_NAMES = new Set(["BackSail", "Front_Sail", "MidleSail", "Front Sail", "FrontSail"]);
    model.traverse((o) => {
      if (SAIL_NAMES.has(o.name)) this.sailNodes.push(o);
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

    // Weicher Schatten auf dem Wasser: die Wasserfläche ist ein eigener
    // Shader ohne Schattenempfang — ein wellenfolgender Dunkelkörper gibt
    // dem Rumpf sichtbaren Kontakt mit der See (kostet fast nichts).
    // Nur im Browser aufbauen: ship-fields.test.ts baut das Schiff in Node.
    if (typeof document !== "undefined") {
      const blobCanvas = document.createElement("canvas");
      blobCanvas.width = blobCanvas.height = 128;
      const bctx = blobCanvas.getContext("2d")!;
      const grad = bctx.createRadialGradient(64, 64, 6, 64, 64, 62);
      grad.addColorStop(0, "rgba(6, 18, 26, 0.62)");
      grad.addColorStop(0.55, "rgba(6, 18, 26, 0.30)");
      grad.addColorStop(1, "rgba(6, 18, 26, 0)");
      bctx.fillStyle = grad;
      bctx.fillRect(0, 0, 128, 128);
      const blobTex = new THREE.CanvasTexture(blobCanvas);
      const shadowMat = new THREE.MeshBasicMaterial({
        map: blobTex, transparent: true, depthWrite: false, opacity: 0.9,
      });
      const blobGeo = new THREE.PlaneGeometry(11, 19);
      blobGeo.rotateX(-Math.PI / 2);
      this.shadowBlob = new THREE.Mesh(blobGeo, shadowMat);
      this.shadowBlob.renderOrder = 3; // nach dem (transparenten) Wasser zeichnen
      scene.add(this.shadowBlob);
    }
  }

  sailDt(
    dt: number,
    t: number,
    input: { forward: number; turn: number; turbo: boolean },
    speedLevel: number,
    particles: ParticleSystem,
    waveY: (x: number, z: number) => number,
    field?: { windX: number; windZ: number; windSpeed: number; currentX: number; currentZ: number; tide: number; gust?: number },
  ): { blocked: boolean } {
    if (this.moored) {
      this.speed = 0;
      input = { forward: 0, turn: 0, turbo: false };
    }
    const windSpeed = field?.windSpeed ?? 6;
    const alignment = field ? (-Math.sin(this.heading) * field.windX - Math.cos(this.heading) * field.windZ) / Math.max(windSpeed, 0.01) : 0;
    // Vereinfachte Segelpolar: quer/mit dem Wind schneller, gegen ihn langsamer.
    // Ruhiges Wasser bleibt mit geringer Paddelhilfe befahrbar.
    const polar = clamp(0.58 + alignment * 0.28 + (1 - Math.abs(alignment)) * 0.25, 0.2, 1);
    // Böe fangen: läuft man mit dem Wind und trifft eine Bö, schiebt sie
    // sichtbar an — dieselbe Bö wirft dort auch höhere Wellen (waves.ts).
    const gustBoost = field?.gust !== undefined && alignment > 0.35 && field.gust > 0.3
      ? 1 + field.gust * 0.4
      : 1;
    const maxSpeed = (24 + speedLevel * 5) * (input.turbo ? 1.6 : 1) * Math.max(0.15, windSpeed / 7) * polar * gustBoost;
    const accel = 14;
    const target = input.forward * maxSpeed;
    this.speed = Math.abs(this.speed - target) < accel * dt ? target : this.speed + Math.sign(target - this.speed) * accel * dt;
    const turnRate = 0.85 * clamp(Math.abs(this.speed) / maxSpeed + 0.15, 0, 1) * Math.sign(this.speed || 1);
    this.heading += input.turn * turnRate * dt;
    this.turnLean = lerp(this.turnLean, input.turn * clamp(Math.abs(this.speed) / maxSpeed, 0, 1), dt * 4);

    const nx = this.x - Math.sin(this.heading) * this.speed * dt + (this.moored ? 0 : field?.currentX ?? 0) * dt;
    const nz = this.z - Math.cos(this.heading) * this.speed * dt + (this.moored ? 0 : field?.currentZ ?? 0) * dt;
    const waterline = (field?.tide ?? 0) - 2.2;

    let blocked = false;
    if (terrainHeight(nx, nz) > waterline) {
      blocked = true;
      if (terrainHeight(nx, this.z) <= waterline) {
        this.x = nx;
      } else if (terrainHeight(this.x, nz) <= waterline) {
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
    this.group.position.set(this.x, y + 0.25, this.z);
    const damping = 1 - Math.exp(-dt * 4);
    this.hullPitch = lerp(this.hullPitch, Math.atan2(yStern - yBow, 10) * 0.8, damping);
    this.hullRoll = lerp(this.hullRoll, Math.atan2(yStar - yPort, 5) * 0.7 + this.turnLean * 0.14, damping);
    this.group.rotation.set(0, 0, 0);
    this.group.rotateY(this.heading);
    this.group.rotateX(this.hullPitch);
    this.group.rotateZ(this.hullRoll);

    // Segel: steht das Schiff → eingerollt; Fahrt → gesetzt
    const targetSail = this.moored ? 0.12 : 0.25 + 0.75 * clamp(Math.abs(this.speed) / maxSpeed, 0, 1);
    this.sailAmount = lerp(this.sailAmount, targetSail, dt * 2.5);
    for (const sn of this.sailNodes) {
      sn.scale.y = Math.max(0.08, this.sailAmount);
      sn.scale.x = 0.7 + 0.3 * this.sailAmount;
      if (field) sn.rotation.y = Math.sin(Math.atan2(field.windX, field.windZ) - this.heading) * 0.35;
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

    // Schatten folgt dem Rumpf auf mittlerer Wellenhöhe, leicht zum Bug
    // versetzt; bei starker See flackert er nicht, weil er die Welle nutzt.
    if (this.shadowBlob) {
      const sx = this.x - Math.sin(this.heading) * 1.2;
      const sz = this.z - Math.cos(this.heading) * 1.2;
      this.shadowBlob.position.set(sx, waveY(sx, sz) + 0.09, sz);
      this.shadowBlob.rotation.set(0, this.heading, 0);
    }
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
    this.shadowBlob?.position.set(x - Math.sin(heading) * 1.2, 0.12, z - Math.cos(heading) * 1.2);
    if (this.shadowBlob) this.shadowBlob.rotation.set(0, heading, 0);
  }
}
