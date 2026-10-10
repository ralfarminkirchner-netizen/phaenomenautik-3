// PHÄNOMENAUTIK 3 — Gerstner-Wellenmodell, einmal definiert, zweifach verwendet:
// CPU (Schiffswiegen, Wasserlinie) und GPU (Vertex-Shader). Lehre aus V2:
// wenige, große, gut lesbare Wellen statt vieler kleiner Summanden.

export interface WaveSpec {
  dirX: number;
  dirZ: number;
  amplitude: number; // m — wird mit stormAmp multipliziert
  wavelength: number; // m
  steepness: number; // 0..1 (Q-Faktor)
  speed: number; // Phasengeschwindigkeit-Faktor
}

export const WAVES: WaveSpec[] = [
  { dirX: 0.98, dirZ: 0.2, amplitude: 0.62, wavelength: 64, steepness: 0.42, speed: 1.0 },
  { dirX: -0.66, dirZ: 0.75, amplitude: 0.4, wavelength: 37, steepness: 0.38, speed: 1.12 },
  { dirX: 0.34, dirZ: -0.94, amplitude: 0.24, wavelength: 21, steepness: 0.32, speed: 1.25 },
  { dirX: -0.92, dirZ: -0.39, amplitude: 0.13, wavelength: 11, steepness: 0.26, speed: 1.5 },
];

const TWO_PI = Math.PI * 2;

/** Wellenhöhe auf der CPU (Spiegel des Shaders). stormAmp skaliert alle Amplituden. */
export function waveHeight(x: number, z: number, t: number, stormAmp: number): number {
  let y = 0;
  for (const w of WAVES) {
    const k = TWO_PI / w.wavelength;
    const length = Math.hypot(w.dirX, w.dirZ);
    const f = k * ((w.dirX * x + w.dirZ * z) / length) - t * w.speed * k * Math.sqrt(9.81 / k) * 1.6;
    y += w.amplitude * stormAmp * Math.sin(f);
  }
  return y;
}

/** GLSL: Wellensumme + analytische Normalen + Kammfaktor (für Schaum) */
export const WAVES_GLSL = /* glsl */ `
uniform float uStormAmp;

vec3 gerstner(vec2 p, float t, out vec3 nrm, out float crest) {
  vec3 pos = vec3(p.x, 0.0, p.y);
  vec3 tang = vec3(1.0, 0.0, 0.0);
  vec3 binm = vec3(0.0, 0.0, 1.0);
  crest = 0.0;
  ${WAVES.map(
    (w) => `{
    vec2 d = normalize(vec2(${w.dirX.toFixed(3)}, ${w.dirZ.toFixed(3)}));
    float k = 6.2831853 / ${w.wavelength.toFixed(2)};
    float a = ${w.amplitude.toFixed(3)} * uStormAmp;
    float q = ${w.steepness.toFixed(2)} / (k * a * ${WAVES.length.toFixed(1)});
    float f = k * dot(d, p) - t * ${w.speed.toFixed(2)} * k * sqrt(9.81 / k) * 1.6;
    float sf = sin(f); float cf = cos(f);
    pos.x += q * a * d.x * cf;
    pos.z += q * a * d.y * cf;
    pos.y += a * sf;
    crest += sf * ${w.amplitude.toFixed(3)};
    tang += vec3(-q * a * d.x * d.x * sf, a * d.x * k * cf, -q * a * d.x * d.y * sf);
    binm += vec3(-q * a * d.x * d.y * sf, a * d.y * k * cf, -q * a * d.y * d.y * sf);
  }`,
  ).join("\n")}
  nrm = normalize(cross(binm, tang));
  return pos;
}
`;
