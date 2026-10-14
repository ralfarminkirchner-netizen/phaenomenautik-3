// PHÄNOMENAUTIK — Post-Pipeline „NG" (M5 Grafiksprung):
// Render → GTAO (niedrige Qualitätsstufen) → UnrealBloom (Schwelle 0.85
// unverändert, M1-Lektion) → Grade (Vignette, Korn, Farb-Stimmung, dezente
// chromatische Aberration) → Output.
// Der Grade-Pass arbeitet im Display-Raum und bleibt bewusst subtil:
// Kino-Look, kein Filter-Regen. GTAO ist an die adaptive Qualitätsleiter
// gekoppelt (Stufe 0–1 an, 2–3 aus) und budgetiert so den Mehraufwand.

import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { GTAOPass } from "three/examples/jsm/postprocessing/GTAOPass.js";
import { clamp, lerp } from "../game/noise";

const GradeShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uTime: { value: 0 },
    uVignette: { value: 0.3 },
    uSaturation: { value: 1.05 },
    uTint: { value: new THREE.Color(1, 1, 1) },
    uGrain: { value: 0.028 },
    uAberration: { value: 0.5 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uVignette;
    uniform float uSaturation;
    uniform float uGrain;
    uniform float uAberration;
    uniform vec3 uTint;
    varying vec2 vUv;

    float hashg(vec2 p) {
      p = fract(p * vec2(443.897, 441.423));
      p += dot(p, p + 19.19);
      return fract(p.x * p.y);
    }

    void main() {
      vec2 uv = vUv;
      vec2 d = uv - 0.5;
      float r2 = dot(d, d);

      // chromatische Aberration: nur am Bildrand, dezent (max ~0,15 % Versatz)
      float ab = uAberration * r2 * r2 * 0.006;
      vec3 col;
      col.r = texture2D(tDiffuse, uv + d * ab).r;
      col.g = texture2D(tDiffuse, uv).g;
      col.b = texture2D(tDiffuse, uv - d * ab).b;

      // Sättigung
      float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col = mix(vec3(l), col, uSaturation);

      // Farb-Stimmung (Dämmerung wärmt, Nacht kühlt ab)
      col *= uTint;

      // Vignette
      col *= 1.0 - uVignette * smoothstep(0.12, 0.62, r2);

      // animiertes Filmkorn, subtil
      float gn = hashg(uv * vec2(1920.0, 1080.0) + fract(uTime * 13.7) * 913.7);
      col += (gn - 0.5) * uGrain;

      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

export interface GradeMood {
  night: number;
  dusk: number;
  storm: number;
}

export class PostFX {
  readonly composer: EffectComposer;
  private bloom: UnrealBloomPass;
  private gtao: GTAOPass;
  private grade: ShaderPass;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, w: number, h: number) {
    this.composer = new EffectComposer(renderer);
    this.composer.addPass(new RenderPass(scene, camera));

    // GTAO: bodenverankerte Objekte (Bäume, Felsen, Schiff, Steg) bekommen
    // Kontakt-Schatten — der bisher fehlende „Set"-Look. Welt-Clip-Box groß
    // ziehen, sonst klippt die AO am Kamera-Frustum.
    this.gtao = new GTAOPass(scene, camera, w, h);
    this.gtao.output = GTAOPass.OUTPUT.Default;
    this.gtao.blendIntensity = 0.85;
    this.gtao.updateGtaoMaterial({
      radius: 1.1,
      distanceExponent: 1.2,
      thickness: 1.5,
      scale: 1.1,
      samples: 12,
      screenSpaceRadius: false,
    });
    this.gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2.5, normalPhi: 4, radius: 3, rings: 3, samples: 12 });
    this.gtao.setSceneClipBox(
      new THREE.Box3(new THREE.Vector3(-800, -60, -800), new THREE.Vector3(5200, 320, 5200)),
    );
    this.composer.addPass(this.gtao);

    this.bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.38, 0.5, 0.85);
    this.composer.addPass(this.bloom);

    this.grade = new ShaderPass(GradeShader);
    this.composer.addPass(this.grade);
    this.composer.addPass(new OutputPass());
  }

  /** Adaptive Qualitätsleiter: AO nur auf den beiden besten Stufen. */
  setQuality(level: number) {
    this.gtao.enabled = level <= 1;
    this.bloom.enabled = level < 3;
  }

  setSize(w: number, h: number) {
    this.composer.setSize(w, h);
  }

  setPixelRatio(pr: number) {
    this.composer.setPixelRatio(pr);
  }

  /** Stimmungs-Grading aus Tageszeit/Wetter treiben. */
  update(t: number, mood: GradeMood) {
    const u = this.grade.uniforms;
    u.uTime.value = t;
    u.uSaturation.value = clamp(1.08 - mood.night * 0.16 - mood.storm * 0.07, 0.85, 1.1);
    const tint = u.uTint.value as THREE.Color;
    tint.setRGB(1, 1, 1);
    // Dämmerung: warmes Gold sichtbar anheben
    tint.r = lerp(tint.r, 1.09, mood.dusk);
    tint.g = lerp(tint.g, 1.0, mood.dusk);
    tint.b = lerp(tint.b, 0.9, mood.dusk);
    // Nacht: kühles Mondblau
    tint.r = lerp(tint.r, 0.92, mood.night * 0.85);
    tint.g = lerp(tint.g, 0.97, mood.night * 0.85);
    tint.b = lerp(tint.b, 1.09, mood.night * 0.85);
    u.uVignette.value = 0.32 + mood.dusk * 0.12 + mood.night * 0.1;
    u.uGrain.value = 0.026;
    u.uAberration.value = 0.5;
  }

  render(dt: number) {
    this.composer.render(dt);
  }
}
