// PHÄNOMENAUTIK 3 — Deterministisches Noise (CPU: Terrain, Props, Wellen)

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash2(ix: number, iz: number, seed: number): number {
  let h = ix * 374761393 + iz * 668265263 + seed * 144665;
  h = (h ^ (h >> 13)) * 1274126177;
  h = h ^ (h >> 16);
  return ((h >>> 0) % 100000) / 100000;
}

const smooth = (t: number) => t * t * (3 - 2 * t);

/** Value-Noise 2D ∈ [-1, 1] */
export function noise2(x: number, z: number, seed = 0): number {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;
  const a = hash2(ix, iz, seed);
  const b = hash2(ix + 1, iz, seed);
  const c = hash2(ix, iz + 1, seed);
  const d = hash2(ix + 1, iz + 1, seed);
  const ux = smooth(fx);
  const uz = smooth(fz);
  const v = a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
  return v * 2 - 1;
}

/** fraktale Brownsche Bewegung ∈ [-1, 1] (normalisiert) */
export function fbm2(x: number, z: number, octaves: number, seed = 0, lacunarity = 2.02, gain = 0.5): number {
  let amp = 1;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += noise2(x * freq, z * freq, seed + i * 101) * amp;
    norm += amp;
    amp *= gain;
    freq *= lacunarity;
  }
  return sum / norm;
}

/** Ridged-Noise für Felsen/Kämme ∈ [0, 1] */
export function ridged2(x: number, z: number, octaves: number, seed = 0): number {
  let amp = 0.55;
  let freq = 1;
  let sum = 0;
  for (let i = 0; i < octaves; i++) {
    sum += (1 - Math.abs(noise2(x * freq, z * freq, seed + i * 77))) * amp;
    amp *= 0.5;
    freq *= 2.1;
  }
  return sum;
}

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
