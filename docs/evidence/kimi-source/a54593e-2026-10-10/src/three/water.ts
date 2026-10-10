// PHÄNOMENAUTIK 3 — Wasser: Gerstner-Wellen + Detail-Normalen + Tiefenfarbe
// + Küstenbrandung + Kammschaum + planare Echtzeit-Reflexion (Qualität „Hoch",
// Messlatte: traumaatlas-3-Ozean) + Nebel-Anbindung (kein Horizont-Pop im Sturm).
// Behebt gezielt die V2/V3-Mängel: große lesbare Wellen, Noise-Normalmaps gegen
// „flach", Schaum gegen „klinisch", Glitzer mit Rauschmaske + Distanz gegen
// Funkelflimmern, Nebel gegen sichtbare Ebenen-Kante.

import * as THREE from "three";
import { WAVES_GLSL, waveHeight } from "./waves";
import { terrainHeight, WORLD_SIZE } from "../game/worldLayout";
import { clamp } from "../game/noise";

const WATER_VERT = /* glsl */ `
uniform float uTime;
uniform mat4 uTextureMatrix;
${WAVES_GLSL}
varying vec3 vWorld;
varying vec3 vNormal;
varying float vCrest;
varying vec4 vRefl;
void main() {
  vec2 p = (modelMatrix * vec4(position, 1.0)).xz;
  vec3 nrm; float crest;
  vec3 disp = gerstner(p, uTime, nrm, crest);
  vWorld = vec3(disp.x, disp.y, disp.z);
  vNormal = nrm;
  vCrest = crest;
  vRefl = uTextureMatrix * vec4(vWorld, 1.0);
  gl_Position = projectionMatrix * viewMatrix * vec4(vWorld, 1.0);
}
`;

const WATER_FRAG = /* glsl */ `
uniform float uTime;
uniform sampler2D uNormals;   // Kachel-Noise-Normalmap (A: Höhenrauschen)
uniform sampler2D uTerrain;   // gebackene Terrainhöhe (R: kodiert)
uniform sampler2D tReflect;   // planare Reflexion (RenderTarget)
uniform float uReflOn;        // 1 = planare Reflexion aktiv
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uDeep;
uniform vec3 uShallow;
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
uniform float uNight;
uniform float uStorm;
uniform float uWorldSize;
varying vec3 vWorld;
varying vec3 vNormal;
varying float vCrest;
varying vec4 vRefl;

float decodeHeight(vec2 worldXZ) {
  vec2 uv = worldXZ / uWorldSize;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return -22.0;
  return texture2D(uTerrain, uv).r * 90.0 - 30.0;
}

vec3 skyColor(vec3 dir) {
  float g = pow(clamp(dir.y * 1.5 + 0.10, 0.0, 1.0), 0.6);
  vec3 c = mix(uHorizon, uZenith, g);
  float s = max(dot(dir, uSunDir), 0.0);
  c += uSunColor * (pow(s, 260.0) * 1.8 + pow(s, 20.0) * 0.10);
  return c;
}

void main() {
  vec3 view = normalize(cameraPosition - vWorld);
  float dist = length(cameraPosition - vWorld);

  // Detail-Normalen: zwei scrollende Oktaven der Noise-Normalmap
  vec3 n1 = texture2D(uNormals, vWorld.xz * 0.055 + vec2(uTime * 0.021, uTime * 0.013)).xyz * 2.0 - 1.0;
  vec3 n2 = texture2D(uNormals, vWorld.xz * 0.16 - vec2(uTime * 0.013, uTime * 0.024)).xyz * 2.0 - 1.0;
  float detailFade = 1.0 - smoothstep(120.0, 700.0, dist); // ferne Flächen bleiben ruhig
  vec3 nrm = normalize(vNormal + vec3(n1.x + n2.x * 0.6, 0.0, n1.y + n2.y * 0.6) * 0.42 * detailFade);

  // Wassertiefe aus gebackener Terrainhöhe
  float floorH = decodeHeight(vWorld.xz);
  float depth = clamp(vWorld.y - floorH, 0.0, 30.0);

  // Farbe: Tiefe absorbiert, Ufer wird türkis
  float shallowMix = exp(-depth * 0.24);
  vec3 waterCol = mix(uDeep, uShallow, shallowMix);
  // leichte Subsurface-Helligkeit auf Wellenflanken Richtung Sonne
  float sss = clamp(dot(normalize(vec3(uSunDir.x, 0.0, uSunDir.z)), -view) * 0.5 + 0.5, 0.0, 1.0)
            * clamp(vWorld.y * 0.6 + 0.35, 0.0, 1.0);
  waterCol += uSunColor * sss * 0.10 * (1.0 - uNight * 0.85);

  // Nacht abdunkeln: nur den Wasserkörper — die Reflexion (analytisch wie
  // planar) trägt die Nacht bereits in ihren Farben, doppeltes Dimmen
  // erzeugt schwarze Schmiere auf streifenden Blickwinkeln.
  waterCol *= (1.0 - uNight * 0.72);

  // Fresnel → Himmels-/Spiegelreflexion. Maximalgewicht < 1: Die Körperfarbe
  // des Meeres bleibt immer präsent — das Meer bleibt blau statt milchig.
  float fres = pow(1.0 - max(dot(view, nrm), 0.0), 5.0);
  fres = mix(0.035, 1.0, fres);
  vec3 refl = skyColor(reflect(-view, nrm));
  // Planare Reflexion: projektives Sampling, Wellen-Distortion, Randmaske.
  // Zwei weiche Grenzen: Frustum-Rand breit ausgefedert (keine sichtbare
  // Kante) und Distanz-Fade — in der Ferne reicht der analytische Himmel,
  // die Plane lohnt sich nur dort, wo sie Objekte spiegelt (Schiff, Inseln).
  if (uReflOn > 0.5) {
    vec2 ruv = vRefl.xy / max(vRefl.w, 1e-4);
    ruv += nrm.xz * 0.035;
    vec2 inEdge = smoothstep(0.0, 0.14, ruv) * (1.0 - smoothstep(0.86, 1.0, ruv));
    float mask = inEdge.x * inEdge.y;
    mask *= smoothstep(750.0, 180.0, dist);
    // Nachts spiegelt die Plane fast nur dunklen Himmel — die Helligkeits-
    // differenz zum analytischen Himmel zeichnet den Frustum-Keil ab.
    // Plane dimmen: Objektreflexionen (Feuer, Inseln) bleiben, der Keil nicht.
    mask *= 1.0 - uNight * 0.6;
    vec3 planar = texture2D(tReflect, clamp(ruv, vec2(0.002), vec2(0.998))).rgb;
    refl = mix(refl, planar, mask * 0.92);
  }
  // Sturm: die See streut statt zu spiegeln — Reflexion zurücknehmen
  vec3 col = mix(waterCol, refl, min(fres * 1.15, 0.88) * (1.0 - uStorm * 0.35));

  // Ambienter Indigo-Lift: Schattenseite kippt nie zu Plastik-Schwarz
  col += vec3(0.040, 0.062, 0.105) * (1.0 - fres) * (0.30 + uNight * 0.45 + uStorm * 0.25);

  // Sonnenglitzer: scharfer Term mit Rauschmaske (bricht gleichmäßiges Funkeln),
  // weiter Term für die Bahn; beides mit Distanz gedämpft gegen Funkelflimmern.
  vec3 half_ = normalize(view + uSunDir);
  float dh = max(dot(nrm, half_), 0.0);
  float sparkle = texture2D(uNormals, vWorld.xz * 0.6 + vec2(uTime * 0.05, -uTime * 0.041)).w;
  float sparkleMask = 0.30 + 0.70 * smoothstep(0.35, 0.75, sparkle);
  float spec = pow(dh, 640.0) * 3.2 * sparkleMask + pow(dh, 90.0) * 0.5;
  col += uSunColor * spec * (1.0 - uNight * 0.9) * (1.0 - uStorm * 0.4) * mix(0.35, 1.0, detailFade);

  // ── Schaum ──
  float foamNoise = texture2D(uNormals, vWorld.xz * 0.11 + vec2(uTime * 0.03, -uTime * 0.017)).z;
  // Brandung: zwei schmale Bänder direkt an der Wasserlinie
  float shore = 1.0 - smoothstep(0.0, 1.7, depth);
  float bands = sin(depth * 4.2 - uTime * 1.9 + foamNoise * 4.0) * 0.5 + 0.5;
  float surf = shore * smoothstep(0.58, 0.95, bands + foamNoise * 0.3);
  // Kamm-Schaum auf Wellenspitzen (stärker bei Sturm)
  float crestF = smoothstep(0.38 - uStorm * 0.14, 0.85, vCrest + foamNoise * 0.2 - 0.08);
  float foam = clamp(surf + crestF * (0.3 + uStorm * 0.6), 0.0, 1.0);
  foam *= mix(0.22, 1.0, detailFade); // ferne Kämme nicht mehr als weiße Flächen
  vec3 foamCol = vec3(0.92, 0.96, 0.98) * (1.0 - uNight * 0.75);
  col = mix(col, foamCol, foam * 0.68);

  // Transparenz: Ufer lässt den Sand durchscheinen, Tiefe wird undurchsichtig
  float alpha = mix(0.94, 0.45, shallowMix);
  alpha = clamp(alpha + foam * 0.35 + fres * 0.3, 0.0, 0.97);

  // Nebel wie die Szene (linear): ferne Flächen gehen in Fog-Farbe auf und
  // werden deckend — die Ebenen-Kante am Horizont verschwindet im Dunst.
  float fogF = clamp((uFogFar - dist) / max(uFogFar - uFogNear, 1.0), 0.0, 1.0);
  col = mix(uFogColor, col, fogF);
  alpha = mix(0.97, alpha, fogF);

  gl_FragColor = vec4(col, alpha);
}
`;

/** Noise-Normalmap als DataTexture erzeugen (kachelbar) */
function makeNormalTexture(size = 256): THREE.DataTexture {
  const h = new Float32Array(size * size);
  // kachelbares Value-Noise: Gitterwerte auf Perioden-Rand spiegeln
  const period = 8;
  const grid: number[][] = [];
  for (let gy = 0; gy < period; gy++) {
    grid[gy] = [];
    for (let gx = 0; gx < period; gx++) grid[gy][gx] = Math.random();
  }
  const val = (x: number, y: number) => {
    const fx = (x / size) * period;
    const fy = (y / size) * period;
    const ix = Math.floor(fx);
    const iy = Math.floor(fy);
    const tx = fx - ix;
    const ty = fy - iy;
    const sx = tx * tx * (3 - 2 * tx);
    const sy = ty * ty * (3 - 2 * ty);
    const g = (axx: number, ayy: number) => grid[((ayy % period) + period) % period][((axx % period) + period) % period];
    const a = g(ix, iy);
    const b = g(ix + 1, iy);
    const c = g(ix, iy + 1);
    const d = g(ix + 1, iy + 1);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  };
  // 3 Oktaven
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      h[y * size + x] =
        val(x, y) * 0.55 + val((x * 2) % size, (y * 2) % size) * 0.3 + val((x * 4) % size, (y * 4) % size) * 0.15;
    }
  }
  const data = new Uint8Array(size * size * 4);
  const str = 2.2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const hl = h[y * size + ((x - 1 + size) % size)];
      const hr = h[y * size + ((x + 1) % size)];
      const hd = h[((y - 1 + size) % size) * size + x];
      const hu = h[((y + 1 + size) % size) * size + x];
      let nx = (hl - hr) * str;
      let ny = (hd - hu) * str;
      let nz = 1;
      const l = Math.sqrt(nx * nx + ny * ny + nz * nz);
      nx /= l;
      ny /= l;
      nz /= l;
      const i = (y * size + x) * 4;
      data[i] = (nx * 0.5 + 0.5) * 255;
      data[i + 1] = (ny * 0.5 + 0.5) * 255;
      data[i + 2] = (nz * 0.5 + 0.5) * 255;
      data[i + 3] = h[y * size + x] * 255; // Höhe als Schaum-/Glitzer-Noise
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
}

/** Terrainhöhe in eine Welt-Textur backen (für Wassertiefe/Brandung) */
function makeTerrainTexture(size = 1024): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const wx = (x / (size - 1)) * WORLD_SIZE;
      const wz = (y / (size - 1)) * WORLD_SIZE;
      const hgt = clamp(terrainHeight(wx, wz), -30, 60);
      const v = ((hgt + 30) / 90) * 255;
      const i = (y * size + x) * 4;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

// ── Planare Reflexion: gespiegelte Kamera + obliquer Near-Clip an y=0 ────────

const CLIP_BIAS = 0.004;
const _plane = new THREE.Plane();
const _clip = new THREE.Vector4();
const _q = new THREE.Vector4();
const _look = new THREE.Vector3();
const _up = new THREE.Vector3();
const _target = new THREE.Vector3();
const _bias = new THREE.Matrix4().set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);

/** Spiegelt die Kamera an der Ebene y=0 und setzt den obliquen Near-Clip. */
function updateMirrorCam(src: THREE.Camera, mirror: THREE.PerspectiveCamera, texMatrix: THREE.Matrix4) {
  _look.set(0, 0, -1).applyQuaternion(src.quaternion);
  _up.set(0, 1, 0).applyQuaternion(src.quaternion);
  mirror.position.set(src.position.x, -src.position.y, src.position.z);
  _look.y *= -1;
  _up.y *= -1;
  _target.copy(mirror.position).add(_look);
  mirror.up.copy(_up);
  mirror.lookAt(_target);
  mirror.updateMatrixWorld();

  const srcP = (src as THREE.PerspectiveCamera).projectionMatrix;
  mirror.projectionMatrix.copy(srcP);

  _plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0));
  _plane.applyMatrix4(mirror.matrixWorldInverse);
  _clip.set(_plane.normal.x, _plane.normal.y, _plane.normal.z, _plane.constant);
  const pm = mirror.projectionMatrix.elements;
  _q.set(
    (Math.sign(_clip.x) + pm[8]) / pm[0],
    (Math.sign(_clip.y) + pm[9]) / pm[5],
    -1,
    (1 + pm[10]) / pm[14],
  );
  _clip.multiplyScalar(2 / _clip.dot(_q));
  pm[2] = _clip.x;
  pm[6] = _clip.y;
  pm[10] = _clip.z + 1 - CLIP_BIAS;
  pm[14] = _clip.w;
  mirror.projectionMatrixInverse.copy(mirror.projectionMatrix).invert();

  texMatrix.copy(_bias).multiply(mirror.projectionMatrix).multiply(mirror.matrixWorldInverse);
}

export class Water {
  mesh: THREE.Mesh;
  private mat: THREE.ShaderMaterial;
  private hiGeo: THREE.PlaneGeometry;
  private loGeo: THREE.PlaneGeometry;
  private useHi = true;
  private reflRT: THREE.WebGLRenderTarget;
  private mirrorCam: THREE.PerspectiveCamera;
  private texMatrix = new THREE.Matrix4();
  private reflEnabled = true;
  stormAmp = 1;

  constructor(scene: THREE.Scene) {
    const RADIUS = 1500;
    this.hiGeo = new THREE.PlaneGeometry(RADIUS * 2, RADIUS * 2, 220, 220);
    this.hiGeo.rotateX(-Math.PI / 2);
    this.loGeo = new THREE.PlaneGeometry(RADIUS * 2, RADIUS * 2, 110, 110);
    this.loGeo.rotateX(-Math.PI / 2);

    this.reflRT = new THREE.WebGLRenderTarget(960, 540, {
      type: THREE.HalfFloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    });
    this.mirrorCam = new THREE.PerspectiveCamera();
    this.mirrorCam.matrixAutoUpdate = false;

    this.mat = new THREE.ShaderMaterial({
      vertexShader: WATER_VERT,
      fragmentShader: WATER_FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uStormAmp: { value: 1 },
        uNormals: { value: makeNormalTexture(256) },
        uTerrain: { value: makeTerrainTexture(1024) },
        tReflect: { value: this.reflRT.texture },
        uTextureMatrix: { value: this.texMatrix },
        uReflOn: { value: 0 },
        uSunDir: { value: new THREE.Vector3(0, 1, 0) },
        uSunColor: { value: new THREE.Color(1, 1, 1) },
        uZenith: { value: new THREE.Color(0.2, 0.4, 0.7) },
        uHorizon: { value: new THREE.Color(0.7, 0.85, 0.9) },
        uDeep: { value: new THREE.Color(0.015, 0.09, 0.16) },
        uShallow: { value: new THREE.Color(0.12, 0.5, 0.5) },
        uFogColor: { value: new THREE.Color(0.7, 0.85, 0.9) },
        uFogNear: { value: 340 },
        uFogFar: { value: 1900 },
        uNight: { value: 0 },
        uStorm: { value: 0 },
        uWorldSize: { value: WORLD_SIZE },
      },
    });
    this.mesh = new THREE.Mesh(this.hiGeo, this.mat);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 1;
    scene.add(this.mesh);
  }

  /** Qualitätsumschaltung (Performance-Budget). „lo" schaltet die
   *  Detail-Geometrie ab; die planare Reflexion wird separat gesteuert. */
  setHighQuality(hi: boolean) {
    if (hi === this.useHi) return;
    this.useHi = hi;
    this.mesh.geometry = hi ? this.hiGeo : this.loGeo;
  }

  /** Planare Reflexion separat schalten (Qualitätsleiter: Stufe 2 = selten, 3 = aus).
   *  Beim Abschalten uReflOn sofort auf 0 — sonst friert das letzte Spiegelbild ein. */
  setReflection(on: boolean) {
    this.reflEnabled = on;
    if (!on) this.mat.uniforms.uReflOn.value = 0;
  }

  /** Reflexions-Target an den Viewport koppeln (halbe Auflösung). */
  setReflSize(wCss: number, hCss: number, pixelRatio: number) {
    this.reflRT.setSize(
      Math.max(256, Math.floor(wCss * pixelRatio * 0.5)),
      Math.max(256, Math.floor(hCss * pixelRatio * 0.5)),
    );
  }

  /** Reflexions-Pass: Szene aus gespiegelter Kamera ins RT. Tone Mapping für
   *  den Pass AUS — das RT hält lineare Werte, sonst doppelt getont. */
  renderReflection(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    const u = this.mat.uniforms;
    if (!this.reflEnabled || camera.position.y < 0.6) {
      u.uReflOn.value = 0;
      return;
    }
    u.uReflOn.value = 1;
    updateMirrorCam(camera, this.mirrorCam, this.texMatrix);
    this.mesh.visible = false;
    const prevRT = renderer.getRenderTarget();
    const prevTone = renderer.toneMapping;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setRenderTarget(this.reflRT);
    renderer.clear();
    renderer.render(scene, this.mirrorCam);
    renderer.setRenderTarget(prevRT);
    renderer.toneMapping = prevTone;
    this.mesh.visible = true;
  }

  update(
    t: number,
    center: THREE.Vector3,
    storm: number,
    sunDir: THREE.Vector3,
    sunColor: THREE.Color,
    zenith: THREE.Color,
    horizon: THREE.Color,
    night: number,
    fog: THREE.Fog,
  ) {
    // Ebene folgt dem Kamerazentrum (auf 8m-Raster gerastert, gegen Textur-Swimmen)
    const gx = Math.round(center.x / 8) * 8;
    const gz = Math.round(center.z / 8) * 8;
    this.mesh.position.set(gx, 0, gz);
    this.stormAmp = 0.75 + storm * 1.5;
    const u = this.mat.uniforms;
    u.uTime.value = t;
    u.uStormAmp.value = this.stormAmp;
    u.uStorm.value = storm;
    u.uNight.value = night;
    (u.uSunDir.value as THREE.Vector3).copy(sunDir);
    (u.uSunColor.value as THREE.Color).copy(sunColor);
    (u.uZenith.value as THREE.Color).copy(zenith);
    (u.uHorizon.value as THREE.Color).copy(horizon);
    (u.uFogColor.value as THREE.Color).copy(fog.color);
    u.uFogNear.value = fog.near;
    u.uFogFar.value = fog.far;
  }

  /** CPU-Wellenhöhe (Schiff, Bojen) */
  heightAt(x: number, z: number, t: number): number {
    return waveHeight(x, z, t, this.stormAmp);
  }
}
