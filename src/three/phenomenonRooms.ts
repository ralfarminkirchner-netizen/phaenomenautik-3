import * as THREE from "three";
import { bayOptics, type OpenWorldState } from "../game/openWorld";
import { terrainHeight } from "../game/worldLayout";

/** Small, persistent arrangements in the existing sea. No separate room scene. */
export class PhenomenonRooms {
  readonly group = new THREE.Group();
  private readonly timber = new THREE.MeshStandardMaterial({ color: 0x8c7452, roughness: 0.93 });
  private readonly darkTimber = new THREE.MeshStandardMaterial({ color: 0x4f463c, roughness: 0.98 });
  private readonly canvas = new THREE.MeshStandardMaterial({ color: 0xcfc5a2, roughness: 0.94, side: THREE.DoubleSide });
  private readonly copper = new THREE.MeshStandardMaterial({ color: 0xaf8060, metalness: 0.45, roughness: 0.42 });
  private readonly mirror = new THREE.MeshStandardMaterial({ color: 0xacc6ca, metalness: 0.7, roughness: 0.15, side: THREE.DoubleSide });
  private readonly rope = new THREE.MeshStandardMaterial({ color: 0xbca57c, roughness: 1 });
  private readonly pathMaterial = new THREE.MeshStandardMaterial({ color: 0xd2bb8a, roughness: 1 });
  private readonly rafts: THREE.Group[] = [];
  private readonly reflectors: THREE.Group[] = [];
  private readonly covers: THREE.Mesh[] = [];
  private readonly observers: THREE.Group[] = [];
  private readonly reference = new THREE.Group();
  private readonly signalMaterial = new THREE.MeshBasicMaterial({ color: 0xffe6a8, transparent: true, opacity: 0, depthWrite: false });
  private readonly signal = new THREE.Mesh(new THREE.CircleGeometry(3.5, 24), this.signalMaterial);
  private readonly woodStock: THREE.Mesh[] = [];
  private readonly ropeStock: THREE.Mesh[] = [];
  private readonly repairFlag = new THREE.Group();
  private readonly suppliesFlag = new THREE.Group();
  private readonly movableSeat = new THREE.Group();
  private readonly invitationLamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 8, 6),
    new THREE.MeshBasicMaterial({ color: 0xf3d09c }),
  );
  private readonly routeStones: THREE.Mesh[] = [];
  private lastWide: boolean | undefined;

  constructor(scene: THREE.Scene) {
    this.group.name = "Freie Phänomenräume";
    this.makeBay();
    this.makeHarbor();
    this.makeShelter();
    scene.add(this.group);
  }

  private box(parent: THREE.Group, size: [number, number, number], position: [number, number, number], material: THREE.Material) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  private pole(parent: THREE.Group, x: number, z: number, height: number) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, height, 6), this.darkTimber);
    mesh.position.set(x, height / 2, z);
    mesh.castShadow = true;
    parent.add(mesh);
  }

  private person(parent: THREE.Group, color: number) {
    const material = new THREE.MeshStandardMaterial({ color, roughness: 0.98 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.38, 1.1, 7), material);
    body.position.y = 0.88;
    body.castShadow = true;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 6), this.copper);
    head.position.y = 1.62;
    parent.add(body, head);
    this.box(parent, [0.2, 0.55, 0.24], [-0.16, 0.26, 0], this.darkTimber);
    this.box(parent, [0.2, 0.55, 0.24], [0.16, 0.26, 0], this.darkTimber);
  }

  private makeBay() {
    for (let i = 0; i < 2; i++) {
      const raft = new THREE.Group();
      raft.position.set(2420 + (i === 0 ? -8 : 8), 0, 3230);
      for (let plank = 0; plank < 5; plank++) {
        this.box(raft, [4.8, 0.22, 0.74], [0, 0.25, (plank - 2) * 0.8], this.timber);
      }
      this.box(raft, [4.2, 0.65, 0.6], [0, -0.25, -1.3], this.darkTimber);
      this.box(raft, [4.2, 0.65, 0.6], [0, -0.25, 1.3], this.darkTimber);
      const pivot = new THREE.Group();
      this.pole(pivot, -1.7, 0, 4.1);
      this.pole(pivot, 1.7, 0, 4.1);
      this.box(pivot, [3.7, 0.16, 0.15], [0, 4.05, 0], this.timber);
      this.box(pivot, [3.25, 3.2, 0.05], [0, 2.3, 0], this.mirror);
      const cover = this.box(pivot, [3.28, 3.23, 0.12], [0, 2.3, 0], this.canvas);
      cover.visible = false;
      raft.add(pivot);
      this.rafts.push(raft);
      this.reflectors.push(pivot);
      this.covers.push(cover);
      this.group.add(raft);

      const observer = new THREE.Group();
      // Two independently situated witnesses: the shore axis and 40° beside it.
      observer.position.set(2420 + (i === 0 ? 0 : 20), 0, 3230 + (i === 0 ? 30 : 24));
      this.box(observer, [4.2, 0.3, 3.2], [0, 0.25, 0], this.timber);
      this.person(observer, i === 0 ? 0x687e79 : 0x8c736b);
      this.observers.push(observer);
      this.group.add(observer);
    }

    this.reference.position.set(2432, 0, 3246);
    const float = new THREE.Mesh(new THREE.SphereGeometry(0.85, 10, 6), this.copper);
    float.scale.y = 0.6;
    this.reference.add(float);
    this.pole(this.reference, 0, 0, 3.2);
    this.box(this.reference, [1.4, 0.16, 0.12], [0, 2.7, 0], this.canvas);
    this.group.add(this.reference);
    this.signal.rotation.x = -Math.PI / 2;
    this.group.add(this.signal);
  }

  private table(parent: THREE.Group, x: number, z: number) {
    const table = new THREE.Group();
    table.position.set(x, 0, z);
    this.box(table, [5.4, 0.3, 3.1], [0, 1.3, 0], this.timber);
    for (const sx of [-2.2, 2.2]) {
      for (const sz of [-1.1, 1.1]) this.box(table, [0.25, 1.3, 0.25], [sx, 0.65, sz], this.darkTimber);
    }
    parent.add(table);
    return table;
  }

  private flag(parent: THREE.Group, flag: THREE.Group, x: number, color: number) {
    flag.position.set(x, 0, -3.2);
    this.pole(flag, 0, 0, 4);
    this.box(flag, [1.1, 0.75, 0.035], [0.55, 3.4, 0], new THREE.MeshStandardMaterial({ color, roughness: 1, side: THREE.DoubleSide }));
    parent.add(flag);
  }

  private makeHarbor() {
    const pier = new THREE.Group();
    pier.position.set(2270, Math.max(1.35, terrainHeight(2270, 3300) + 0.5), 3300);
    for (let plank = 0; plank < 12; plank++) {
      this.box(pier, [25, 0.24, 0.85], [0, -0.15, (plank - 5.5) * 0.9], this.timber);
    }
    for (const x of [-11, 0, 11]) {
      for (const z of [-4.5, 4.5]) this.box(pier, [0.45, 5, 0.45], [x, -2.3, z], this.darkTimber);
    }
    const repair = this.table(pier, -8, 0);
    this.box(repair, [3.9, 0.3, 1.5], [0, 1.64, 0], this.darkTimber);
    this.box(repair, [1.8, 0.15, 0.18], [-0.2, 1.88, -0.2], this.copper).rotation.y = 0.4;
    const supplies = this.table(pier, 0, 0);
    for (let i = 0; i < 18; i++) {
      const plank = this.box(supplies, [3.7, 0.12, 0.46], [0, 1.55 + Math.floor(i / 3) * 0.14, (i % 3 - 1) * 0.5], this.timber);
      this.woodStock.push(plank);
    }
    const use = this.table(pier, 8, 0);
    for (let i = 0; i < 12; i++) {
      const coil = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.13, 5, 12), this.rope);
      coil.rotation.x = Math.PI / 2;
      coil.position.set((i % 3 - 1) * 1.3, 1.55 + Math.floor(i / 6) * 0.3, i % 6 < 3 ? -0.6 : 0.7);
      use.add(coil);
      this.ropeStock.push(coil);
    }
    this.flag(pier, this.repairFlag, -10.5, 0xbe8b64);
    this.flag(pier, this.suppliesFlag, 3.5, 0x7c9a97);
    for (let i = 0; i < 2; i++) {
      const person = new THREE.Group();
      person.position.set(i === 0 ? -8 : 8, 0, 3.5);
      person.rotation.y = Math.PI;
      this.person(person, i === 0 ? 0x8c736b : 0x687e79);
      pier.add(person);
    }
    this.group.add(pier);
  }

  private seat(parent: THREE.Group) {
    this.box(parent, [2.8, 0.24, 1.2], [0, 0.85, 0], this.timber);
    this.box(parent, [2.8, 0.9, 0.18], [0, 1.42, -0.53], this.timber);
    for (const x of [-1.1, 1.1]) this.box(parent, [0.22, 0.85, 0.9], [x, 0.43, 0], this.darkTimber);
  }

  private makeShelter() {
    const fixedSeat = new THREE.Group();
    fixedSeat.position.set(1144, terrainHeight(1144, 3047) + 0.2, 3047);
    fixedSeat.rotation.y = Math.PI / 2;
    this.seat(fixedSeat);
    const person = new THREE.Group();
    person.position.y = 0.35;
    this.person(person, 0x687e79);
    fixedSeat.add(person);
    this.group.add(fixedSeat);
    this.seat(this.movableSeat);
    this.invitationLamp.position.set(1.65, 1.2, 0);
    this.movableSeat.add(this.invitationLamp);
    this.group.add(this.movableSeat);
    for (let i = 0; i < 16; i++) {
      const stone = new THREE.Mesh(new THREE.SphereGeometry(0.55, 6, 4), this.pathMaterial);
      stone.scale.set(1.3, 0.18, 0.8);
      this.routeStones.push(stone);
      this.group.add(stone);
    }
  }

  update(state: OpenWorldState, time: number, heightAt: (x: number, z: number, t: number) => number) {
    for (let i = 0; i < this.rafts.length; i++) {
      const raft = this.rafts[i];
      raft.position.y = heightAt(raft.position.x, raft.position.z, time);
      raft.rotation.z = (heightAt(raft.position.x + 2, raft.position.z, time) - heightAt(raft.position.x - 2, raft.position.z, time)) * 0.1;
      raft.rotation.x = (heightAt(raft.position.x, raft.position.z + 1.5, time) - heightAt(raft.position.x, raft.position.z - 1.5, time)) * 0.1;
      this.reflectors[i].rotation.y = THREE.MathUtils.degToRad(state.bay.reflectorAngle);
      this.covers[i].visible = state.bay.covered;
      const observer = this.observers[i];
      observer.position.y = heightAt(observer.position.x, observer.position.z, time);
    }
    this.reference.visible = state.bay.reference;
    this.reference.position.y = heightAt(this.reference.position.x, this.reference.position.z, time);
    const optics = bayOptics(state);
    const reflectedDirection = THREE.MathUtils.degToRad(optics.reflectionAngle);
    const signalX = 2420 + Math.sin(reflectedDirection) * 12;
    const signalZ = 3230 + Math.cos(reflectedDirection) * 12;
    this.signal.visible = optics.visible;
    this.signal.position.set(signalX, heightAt(signalX, signalZ, time) + 0.08, signalZ);
    this.signalMaterial.opacity = optics.visible ? 0.48 : 0;
    this.woodStock.forEach((mesh, i) => { mesh.visible = i < state.harbor.inventory.wood; });
    this.ropeStock.forEach((mesh, i) => { mesh.visible = i < state.harbor.inventory.rope; });
    this.repairFlag.visible = state.harbor.task === "repair";
    this.suppliesFlag.visible = state.harbor.task === "supplies";
    const wide = state.shelter.path === "wide";
    this.movableSeat.rotation.y = THREE.MathUtils.degToRad(state.shelter.seatAngle);
    this.invitationLamp.visible = state.shelter.invitation;
    if (wide !== this.lastWide) {
      this.lastWide = wide;
      const seatX = wide ? 1157 : 1150;
      const seatZ = wide ? 3056 : 3050;
      this.movableSeat.position.set(seatX, terrainHeight(seatX, seatZ) + 0.2, seatZ);
      this.routeStones.forEach((stone, i) => {
        const t = i / (this.routeStones.length - 1);
        const x = 1168 - t * 30;
        const z = 3048 + Math.sin(t * Math.PI) * (wide ? 14 : 3);
        stone.position.set(x, terrainHeight(x, z) + 0.16, z);
      });
    }
  }

  dispose() {
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    this.group.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      geometries.add(object.geometry);
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    this.group.removeFromParent();
  }
}
