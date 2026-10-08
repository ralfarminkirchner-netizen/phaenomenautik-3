// PHÄNOMENAUTIK 3 — Ziel-Beacon: Lichtsäule + schwebender Kristall über dem
// aktuellen Kompassziel, aus jeder Distanz sichtbar.

import * as THREE from "three";

export class Beacon {
  group = new THREE.Group();
  private crystal: THREE.Mesh;
  private beam: THREE.Mesh;
  private beamMat: THREE.ShaderMaterial;

  constructor(scene: THREE.Scene) {
    this.beamMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 } },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          float fade = pow(1.0 - vUv.y, 1.6);
          float pulse = 0.75 + 0.25 * sin(uTime * 2.4);
          gl_FragColor = vec4(1.0, 0.85, 0.45, fade * 0.34 * pulse);
        }
      `,
    });
    const beamGeo = new THREE.CylinderGeometry(1.4, 2.6, 260, 10, 1, true);
    beamGeo.translate(0, 130, 0);
    this.beam = new THREE.Mesh(beamGeo, this.beamMat);
    this.beam.renderOrder = 4;
    this.group.add(this.beam);

    this.crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(2.4, 0),
      new THREE.MeshStandardMaterial({
        color: 0xffd97a, emissive: 0xd8982e, emissiveIntensity: 1.1, roughness: 0.3,
      }),
    );
    this.group.add(this.crystal);
    scene.add(this.group);
  }

  setTarget(x: number, z: number, baseY: number) {
    this.group.position.set(x, baseY, z);
  }

  update(t: number) {
    this.beamMat.uniforms.uTime.value = t;
    this.crystal.position.y = 24 + Math.sin(t * 1.4) * 2.2;
    this.crystal.rotation.y = t * 0.9;
    this.crystal.rotation.x = Math.sin(t * 0.6) * 0.2;
  }
}
