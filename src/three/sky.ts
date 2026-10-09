// PHÄNOMENAUTIK 3 — Himmel: Tag/Nacht-Kuppel (Gradient, Sonne, Wolken, Sterne)
// + Licht-Rigg (Sonne/Mond, Hemisphäre) und Nebel-Synchronisation.

import * as THREE from "three";
import { clamp, lerp, smoothstep } from "../game/noise";

const SKY_VERT = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_Position.z = gl_Position.w; // immer am Fernpunkt
}
`;

const SKY_FRAG = /* glsl */ `
uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform float uNight;     // 0 = Tag, 1 = Nacht
uniform float uTime;
uniform float uCloudCover; // 0..1
varying vec3 vDir;

float hash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i); float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0)); float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float s = 0.0; float a = 0.5;
  for (int i = 0; i < 4; i++) { s += vnoise(p) * a; p = p * 2.13 + 17.3; a *= 0.5; }
  return s;
}

void main() {
  vec3 dir = normalize(vDir);
  float up = clamp(dir.y, -0.12, 1.0);

  // Basis-Gradient
  float g = pow(clamp(up * 1.6 + 0.08, 0.0, 1.0), 0.62);
  vec3 col = mix(uHorizon, uZenith, g);

  // Warme Dämmerungsband um die Sonne (wenn sie tief steht)
  float sunAmount = max(dot(dir, uSunDir), 0.0);
  float duskBand = pow(sunAmount, 3.0) * (1.0 - abs(uSunDir.y) * 3.0);
  if (duskBand > 0.0) col += vec3(1.0, 0.42, 0.18) * clamp(duskBand, 0.0, 1.0) * 0.55 * (1.0 - uNight * 0.85);

  // Sonne: Kern + Halo
  float disc = smoothstep(0.9993, 0.99965, sunAmount);
  float halo = pow(sunAmount, 350.0) * 0.45 + pow(sunAmount, 24.0) * 0.10;
  col += uSunColor * (disc * 1.7 + halo);

  // Sterne (nur Nachts, über dem Horizont)
  if (uNight > 0.15 && dir.y > 0.02) {
    vec2 sp = dir.xz / (dir.y + 0.35) * 130.0;
    vec2 cell = floor(sp);
    float star = step(0.9955, hash(cell));
    float tw = 0.55 + 0.45 * sin(uTime * 2.2 + hash(cell + 7.0) * 40.0);
    vec2 c = fract(sp) - 0.5;
    float dotStar = smoothstep(0.24, 0.02, length(c));
    col += vec3(0.9, 0.93, 1.0) * star * dotStar * tw * uNight * smoothstep(0.02, 0.2, dir.y);
  }

  // Wolken: auf eine Ebene projiziert, treiben mit der Zeit
  if (dir.y > 0.015) {
    vec2 cp = dir.xz / (dir.y + 0.22);
    cp = cp * 1.7 + vec2(uTime * 0.006, uTime * 0.0023);
    float cl = fbm(cp);
    float cov = smoothstep(0.62 - uCloudCover * 0.34, 0.94 - uCloudCover * 0.28, cl);
    float shade = fbm(cp * 2.7 + 3.1);
    vec3 cloudLight = mix(uHorizon * 1.06 + uSunColor * 0.10, vec3(0.32, 0.35, 0.42), uCloudCover * 0.75);
    vec3 cloudDark = mix(cloudLight * 0.78, vec3(0.16, 0.18, 0.24), uCloudCover * 0.8);
    vec3 ccol = mix(cloudLight, cloudDark, shade * 0.8);
    ccol = mix(ccol, vec3(0.03, 0.04, 0.09), uNight * 0.9);
    float fade = smoothstep(0.015, 0.14, dir.y);
    col = mix(col, ccol, cov * fade * 0.9);
  }

  gl_FragColor = vec4(col, 1.0);
}
`;

export interface SkyPalette {
  zenith: THREE.Color;
  horizon: THREE.Color;
  sunColor: THREE.Color;
  fog: THREE.Color;
  sunIntensity: number;
  hemiIntensity: number;
  night: number;
}

/** Tageszeit (0–24) → Farbpalette & Sonnenrichtung */
export function paletteFor(timeOfDay: number, storm: number): SkyPalette {
  // Sonnenbahn: Aufgang 6:00, Zenit 13:00, Untergang 20:00
  const dayT = (timeOfDay - 6) / 14; // 0..1 über dem Tag
  const elevation = Math.sin(clamp(dayT, -0.2, 1.2) * Math.PI); // <0 = Nacht
  const day = smoothstep(-0.06, 0.22, elevation);
  const dusk = (1 - Math.abs(elevation - 0.12) / 0.2) * (elevation > -0.1 ? 1 : 0);
  const duskC = clamp(dusk, 0, 1) * (1 - storm * 0.6);

  const zenithDay = new THREE.Color(0.1, 0.3, 0.7);
  const zenithNight = new THREE.Color(0.012, 0.02, 0.06);
  const horizonDay = new THREE.Color(0.44, 0.66, 0.86);
  const horizonNight = new THREE.Color(0.045, 0.07, 0.14);
  const duskTint = new THREE.Color(0.98, 0.52, 0.28);

  const zenith = zenithNight.clone().lerp(zenithDay, day);
  const horizon = horizonNight.clone().lerp(horizonDay, day).lerp(duskTint, duskC * 0.45);

  // Sturm drückt alles Richtung Bleigrau
  const stormGrey = new THREE.Color(0.24, 0.27, 0.32);
  zenith.lerp(stormGrey, storm * 0.62);
  horizon.lerp(new THREE.Color(0.38, 0.42, 0.47), storm * 0.6);

  const sunColor = new THREE.Color(1.0, 0.96, 0.88).lerp(new THREE.Color(1.0, 0.55, 0.3), duskC).lerp(stormGrey, storm * 0.7);
  const fog = horizon.clone().lerp(zenith, 0.25);

  return {
    zenith,
    horizon,
    sunColor,
    fog,
    sunIntensity: lerp(0.02, 2.6, day) * (1 - storm * 0.55),
    hemiIntensity: lerp(0.15, 0.78, day) * (1 - storm * 0.4),
    night: 1 - day,
  };
}

export function sunDirection(timeOfDay: number, out: THREE.Vector3): THREE.Vector3 {
  const dayT = (timeOfDay - 6) / 14;
  const ang = dayT * Math.PI; // 0 (Osten) → π (Westen)
  const el = Math.sin(ang);
  out.set(-Math.cos(ang), el * 0.9 + 0.06, 0.35 * Math.sin(ang * 2)).normalize();
  return out;
}

export class Sky {
  mesh: THREE.Mesh;
  private mat: THREE.ShaderMaterial;
  sun: THREE.DirectionalLight;
  moon: THREE.DirectionalLight;
  hemi: THREE.HemisphereLight;
  private sunDir = new THREE.Vector3(0, 1, 0);
  private fog: THREE.Fog;

  constructor(scene: THREE.Scene) {
    this.mat = new THREE.ShaderMaterial({
      vertexShader: SKY_VERT,
      fragmentShader: SKY_FRAG,
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uZenith: { value: new THREE.Color() },
        uHorizon: { value: new THREE.Color() },
        uSunDir: { value: new THREE.Vector3(0, 1, 0) },
        uSunColor: { value: new THREE.Color(1, 1, 1) },
        uNight: { value: 0 },
        uTime: { value: 0 },
        uCloudCover: { value: 0.35 },
      },
    });
    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(3600, 40, 20), this.mat);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -10;
    scene.add(this.mesh);

    this.sun = new THREE.DirectionalLight(0xffffff, 2.2);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.camera.near = 10;
    this.sun.shadow.camera.far = 700;
    const s = 85;
    this.sun.shadow.camera.left = -s;
    this.sun.shadow.camera.right = s;
    this.sun.shadow.camera.top = s;
    this.sun.shadow.camera.bottom = -s;
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.5;
    scene.add(this.sun, this.sun.target);

    this.moon = new THREE.DirectionalLight(0x8fa8d8, 0.0);
    scene.add(this.moon, this.moon.target);

    this.hemi = new THREE.HemisphereLight(0xbdd8ee, 0x2e3a2e, 0.8);
    scene.add(this.hemi);

    this.fog = new THREE.Fog(0xbfd8e8, 250, 1500);
    scene.fog = this.fog;
  }

  /** Pro Frame: Tageszeit, Sturm, Kamera- und Fokusposition (Schatten folgt dem Fokus) */
  update(t: number, timeOfDay: number, storm: number, camPos: THREE.Vector3, focus: THREE.Vector3) {
    const p = paletteFor(timeOfDay, storm);
    const u = this.mat.uniforms;
    (u.uZenith.value as THREE.Color).copy(p.zenith);
    (u.uHorizon.value as THREE.Color).copy(p.horizon);
    (u.uSunColor.value as THREE.Color).copy(p.sunColor);
    u.uNight.value = p.night;
    u.uTime.value = t;
    u.uCloudCover.value = 0.3 + storm * 0.65;

    sunDirection(timeOfDay, this.sunDir);
    (u.uSunDir.value as THREE.Vector3).copy(this.sunDir);

    this.mesh.position.copy(camPos);

    // Sonne / Mond
    this.sun.color.copy(p.sunColor);
    this.sun.intensity = p.sunIntensity;
    this.sun.position.copy(focus).addScaledVector(this.sunDir, 320);
    this.sun.target.position.copy(focus);
    this.sun.visible = p.night < 0.85;

    this.moon.intensity = p.night * 0.3;
    this.moon.position.copy(focus).addScaledVector(this.sunDir, -280).add(new THREE.Vector3(0, 140, 0));
    this.moon.target.position.copy(focus);
    this.moon.visible = p.night > 0.5;

    this.hemi.intensity = p.hemiIntensity;
    this.hemi.color.copy(p.zenith).lerp(new THREE.Color(1, 1, 1), 0.4);
    this.hemi.groundColor.setRGB(0.16, 0.2, 0.16).lerp(p.horizon, 0.25);

    this.fog.color.copy(p.fog);
    this.fog.near = lerp(340, 130, storm);
    this.fog.far = lerp(1900, 640, storm) * lerp(0.55, 1, 1 - p.night);
  }
}
