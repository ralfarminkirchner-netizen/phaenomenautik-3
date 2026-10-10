// PHÄNOMENAUTIK 3 — Welt-Orchestrierung: Renderer, Module, Spielmodi
// (Segeln ↔ Zu Fuß), Interaktionen, Action-Kampf, Wetter, Tag/Nacht,
// Kompass-Ziel, Persistenz und adaptives Performance-Budget.

import * as THREE from "three";
import { Sky, paletteFor, sunDirection } from "./sky";
import { Water } from "./water";
import { Terrain } from "./terrain";
import { Props, type TreeRec } from "./props";
import { Ship } from "./ship";
import { Player } from "./player";
import { ShadowEnemy } from "./enemy";
import { Beacon } from "./beacon";
import { ParticleSystem } from "./particles";
import { clamp, lerp, mulberry32 } from "../game/noise";
import { HARBOR, ISLANDS, islandAt, terrainHeight, terrainSlope } from "../game/worldLayout";
import { persistSave, grantXp, checkFinalUnlock, hasUnreadableSave, type SaveGame, type PlayerState } from "../game/state";
import { Npcs } from "./npcs";
import { Loot } from "./loot";
import { Structures, buildFloss, buildLeiter, buildBruecke, buildVentilator, buildAufzug, clampSpan } from "./structures";
import { BUILDABLES, missingMaterials, matName, matCostText, type BuildableDef } from "../game/materials";
import { LoreStones } from "./lorestones";
import { Creature } from "./creature";
import { CliffWalls } from "./cliffwalls";
import { CLIMB_WALLS, cliffTopAt } from "../game/climb";
import { computeDish, mealsToActive, mealBonus, pruneMeals, ingById, type DishResult } from "../game/cooking";
import { shrinePoint } from "../game/worldLayout";
import { PHENOMENA } from "../game/data";
import { audio } from "../game/audio";
import { store } from "../game/store";
import { isProtectionPaused } from "../game/pause";
import { preloadAll, extractMerged, getModel, setShadows } from "./assets";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

import { createFixedStepper } from "../game/fixedStep";
import { ROOMS, ensureOpenWorld, stepOpenWorld, sampleFields, applyWorldAction, addObservation, reviseObservation, type RoomId } from "../game/openWorld";
import { PhenomenonRooms } from "./phenomenonRooms";
import { NODE_BY_ID } from "../game/phenomenaGraph";

export type PresentationMode = "title" | "arrival" | "look" | "mark" | "distance";

interface PresentationSnapshot {
  cameraPosition: THREE.Vector3;
  cameraQuaternion: THREE.Quaternion;
  visibility: { object: THREE.Object3D; visible: boolean }[];
  cloudPositions: THREE.Vector3[];
}

export class GameWorld {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private sky: Sky;
  private water: Water;
  private props: Props;
  private ship: Ship;
  private player: Player;
  private beacon: Beacon;
  private particles: ParticleSystem;
  private enemies: ShadowEnemy[] = [];
  private save: SaveGame;
  private rooms!: PhenomenonRooms;
  private stepper = createFixedStepper(1 / 60, 5 / 60);
  private simulationWasPaused = true;
  private simulationSteps = 0;
  private droppedSeconds = 0;
  private frameTimes: number[] = [];
  private roomView: RoomId | null = null;
  private container: HTMLElement;

  private keys = new Set<string>();
  private clock = new THREE.Clock();
  private raf = 0;
  private elapsed = 0;
  private disposed = false;
  private unsubscribeStore: (() => void) | null = null;
  private frozenAt: number | null = null;
  private attackTimer: number | null = null;
  private duelEscrow = 0;

  // Segel-Kamera
  private sailYaw = 0;
  private sailPitch = 0.52;
  private sailDist = 17;

  private storm = 0;
  private staminaDelay = 0; // Sperrzeit nach Ausdauer-Abfluss, bevor regeneriert wird
  readonly climbWalls = CLIMB_WALLS; // QA-Hook (Playwright)
  private hudTimer = 0;
  private saveTimer = 0;
  private fpsEma = 60;
  private qualityLevel = 0; // 0 = voll, 1 = PR 1.25, 2 = PR 1 + Wasser lo, 3 = kleinere Schatten
  private reflFrame = 0; // Zähler für 30-Hz-Spiegelpass
  private qualityTimer = 0;
  private presentation: PresentationMode | null = null;
  private presentationSnapshot: PresentationSnapshot | null = null;
  private presentationShip: Ship | null = null;
  private presentationParticles: ParticleSystem | null = null;
  private presentationObjects: THREE.Object3D[] = [];
  private shipObjects: THREE.Object3D[] = [];
  private presentationBuoy: THREE.Group | null = null;
  private presentationSails: { node: THREE.Object3D; rotation: THREE.Euler }[] = [];
  private presentationElapsed = 0;
  private presentationFrame = 0;
  private presentationFps = 60;
  private readonly presentationMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Kampf
  private attackCooldown = 0;
  private fireBuffUntil = 0;
  private composer!: EffectComposer;
  private bloom!: UnrealBloomPass;
  private clouds: { mesh: THREE.Mesh; speed: number }[] = [];
  private npcs!: Npcs;
  private loreStones!: LoreStones;
  private creatures = new Map<string, Creature>();
  private echoOrb: THREE.Mesh | null = null;
  private loot!: Loot;
  private structures!: Structures;
  private buildSession: {
    def: BuildableDef;
    ghost: THREE.Object3D;
    x: number; z: number; yaw: number;
    ex?: number; ez?: number; topY?: number;
    valid: boolean;
  } | null = null;
  private treasure: { id: string; x: number; z: number; obj: THREE.Object3D }[] = [];

  onReady: (() => void) | null = null;

  static async create(container: HTMLElement, save: SaveGame, isCurrent: () => boolean = () => true, presentation: PresentationMode | null = null): Promise<GameWorld> {
    await preloadAll();
    if (!isCurrent()) throw new DOMException("World loading cancelled", "AbortError");
    return new GameWorld(container, save, presentation);
  }

  constructor(container: HTMLElement, save: SaveGame, presentation: PresentationMode | null = null) {
    this.container = container;
    this.save = save;

    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.tabIndex = 0;
    this.renderer.domElement.setAttribute("aria-label", "Spielwelt · Segeln und Erkunden");
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(62, container.clientWidth / container.clientHeight, 0.3, 5200);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      0.38, // Stärke
      0.5, // Radius
      0.85, // Schwelle — nur Sonne, Feuer, Glitzer, Emissives
    );
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    this.sky = new Sky(this.scene);
    this.water = new Water(this.scene);
    this.water.setReflSize(container.clientWidth, container.clientHeight, this.renderer.getPixelRatio());
    new CliffWalls(this.scene); // Kletterwände (Moosfelsen) in die Szene hängen
    new Terrain(this.scene);
    this.props = new Props(this.scene);
    const beforeShip = new Set(this.scene.children);
    this.ship = new Ship(this.scene);
    this.shipObjects = this.scene.children.filter((object) => !beforeShip.has(object));
    this.player = new Player(this.scene);
    this.beacon = new Beacon(this.scene);
    this.particles = new ParticleSystem(this.scene);
    this.createClouds();

    // Feuer aus Spielstand entzünden
    for (const id of save.litFires) this.props.setFireLit(id, true);

    // NPCs auf dem Ankerplatz
    {
      const d = this.props.dock;
      const wb = this.props.workbench;
      const fire = this.props.fireById("feuer_harbor")!;
      this.npcs = new Npcs(this.scene, {
        mara: { x: d.x + 5, z: d.z - 8, faceDeg: 170 },
        tove: { x: fire.x + 6, z: fire.z - 3, faceDeg: -110 },
        kaj: { x: wb.x + 1.5, z: wb.z + 2.2, faceDeg: 200 },
        ilse: { x: wb.x + 9, z: wb.z - 3.5, faceDeg: 130 },
        ben: { x: fire.x - 2.1, z: fire.z + 1.8, faceDeg: 40 },
        vessa: { x: d.x + 2, z: d.z + 7, faceDeg: 185 },
      });
    }

    // Lore-Runensteine
    this.loreStones = new LoreStones(this.scene, save.echoesFound);

    // Sammelbare Materialien + gebaute Strukturen
    this.loot = new Loot(this.scene, save.lootTaken);
    this.structures = new Structures(this.scene, save.structures);

    // Schatztruhe auf der Scholle (Floß-Rätsel)
    {
      const chest = getModel("chest").scene.clone(true);
      setShadows(chest, true, false);
      const cx = 2210;
      const cz = 3560;
      const cy = terrainHeight(cx, cz);
      chest.position.set(cx, cy, cz);
      chest.rotation.y = 0.7;
      this.scene.add(chest);
      if (!save.chestsOpened?.includes("scholle_truhe")) {
        this.treasure.push({ id: "scholle_truhe", x: cx, z: cz, obj: chest });
      } else {
        chest.scale.setScalar(1);
      }
    }

    // Phänomen-Wächter auf den Inseln
    for (const isl of ISLANDS) {
      const phen = PHENOMENA.find((pp) => pp.id === isl.id);
      if (!phen) continue;
      const st = save.islands.find((i) => i.id === isl.id);
      const sp = shrinePoint(isl);
      const c = new Creature(phen, sp.y, phen.final ? 1.7 : 1.15, this.scene);
      c.group.position.set(sp.x, 0, sp.z);
      if (st?.overcome && st?.understood) c.setPeace(1);
      else if (st?.overcome) {
        c.dead = true;
        c.group.visible = false;
      }
      this.creatures.set(isl.id, c);
    }

    // Hinterlassenes Echo aus Spielstand
    if (save.echoDrop) this.spawnEchoOrb(save.echoDrop.x, save.echoDrop.z);

    // Schatten-Gegner auf den Phänomen-Inseln
    for (const isl of ISLANDS) {
      if (isl.id === "sturmherd") continue;
      const rng = mulberry32(isl.seed + 999);
      const count = 2 + Math.floor(rng() * 2);
      for (let i = 0; i < count; i++) {
        let x = isl.x;
        let z = isl.z;
        for (let tries = 0; tries < 40; tries++) {
          const a = rng() * Math.PI * 2;
          const r = (0.25 + rng() * 0.5) * isl.radius;
          const tx = isl.x + Math.cos(a) * r;
          const tz = isl.z + Math.sin(a) * r;
          const h = terrainHeight(tx, tz);
          if (h > 3 && h < isl.peak * 0.75 && terrainSlope(tx, tz) < 0.3) {
            x = tx;
            z = tz;
            break;
          }
        }
        this.enemies.push(new ShadowEnemy(this.scene, `shadow_${isl.id}_${i}`, x, z, (gx, gz) => this.props.groundHeight(gx, gz)));
      }
    }

    // Ausgangsposition aus Spielstand
    this.ship.setPose(save.ship.x, save.ship.z, save.ship.heading);
    if (save.mode === "onfoot" && save.playerPos) {
      const y = this.groundAt(save.playerPos.x, save.playerPos.z);
      this.player.place(save.playerPos.x, y, save.playerPos.z, Math.PI);
      this.player.group.visible = true;
      this.ship.moored = true;
    } else if (presentation === null) {
      save.mode = "sailing";
    }
    const openWorld = ensureOpenWorld(save);
    this.elapsed = openWorld.seconds;
    this.sailYaw = openWorld.camera?.yaw ?? save.ship.heading;
    this.sailPitch = openWorld.camera?.pitch ?? this.sailPitch;
    this.sailDist = openWorld.camera?.distance ?? this.sailDist;
    this.roomView = openWorld.camera?.room ?? null;
    if (save.mode === "sailing" && this.roomView) this.ship.moored = true;
    this.rooms = new PhenomenonRooms(this.scene);
    this.rooms.update(openWorld, this.elapsed, (x, z, t) => this.water.heightAt(x, z, t));

    this.bindInput();
    this.unsubscribeStore = store.subscribe(this.syncProtection);
    store.set({
      mode: save.mode === "onfoot" ? "onfoot" : "sailing",
      activeRoom: openWorld.activeRoom,
      openWorldRevision: store.get().openWorldRevision + 1,
    });

    // Start-Kamera
    if (this.save.mode === "sailing") this.snapSailCamera();
    else this.player.snapCamera(this.camera, (x, z) => this.groundAt(x, z));

    if (presentation !== null) this.setPresentation(presentation);
    else this.composer.render();
    this.loop();
    if (this.onReady) this.onReady();
  }

  /** Begehbare Höhe: Terrain/Steg + gebaute Strukturen */
  groundAt(x: number, z: number): number {
    const base = this.props.groundHeight(x, z);
    const st = this.structures.heightAt(x, z);
    const ct = cliffTopAt(x, z); // Felsturm-Plateaus (Kletterwände)
    let g = ct !== null && ct > base ? ct : base;
    if (st !== null && st > g) g = st;
    return g;
  }

  get uiLock(): boolean {
    const st = store.get();
    return !!(this.presentation !== null || isProtectionPaused(st) || st.dead || st.dialogNpc || st.battlePhen || st.journalOpen || st.loreStone || st.chatOpen || st.cookOpen || st.duelId);
  }

  /** Ruhige Darstellung derselben Welt; die Spielsimulation bleibt eingefroren. */
  setPresentation(mode: PresentationMode | null): void {
    if (this.disposed || mode === this.presentation) return;
    const entering = mode !== null && this.presentationSnapshot === null;
    if (mode !== null && this.presentationSnapshot === null) {
      this.presentationSnapshot = {
        cameraPosition: this.camera.position.clone(),
        cameraQuaternion: this.camera.quaternion.clone(),
        visibility: [...this.shipObjects, this.player.group].map((object) => ({ object, visible: object.visible })),
        cloudPositions: this.clouds.map(({ mesh }) => mesh.position.clone()),
      };
      for (const { object } of this.presentationSnapshot.visibility) object.visible = false;
      this.createPresentationObjects();
      for (const object of this.presentationObjects) object.visible = object !== this.presentationBuoy;
      this.presentationElapsed = this.elapsed;
      this.releaseInput();
    }
    this.presentation = mode;
    if (mode === null && this.presentationSnapshot !== null) {
      const snapshot = this.presentationSnapshot;
      this.camera.position.copy(snapshot.cameraPosition);
      this.camera.quaternion.copy(snapshot.cameraQuaternion);
      for (const { object, visible } of snapshot.visibility) object.visible = visible;
      this.clouds.forEach(({ mesh }, i) => mesh.position.copy(snapshot.cloudPositions[i]));
      for (const object of this.presentationObjects) object.visible = false;
      this.presentationSnapshot = null;
    }
    this.syncProtection();
    this.updatePresentationEvidence();
    if (entering && !this.presentationPaused()) this.renderPresentation(0, true);
  }

  private presentationPaused(): boolean {
    const state = store.get();
    return state.paused || state.protectionOpen !== null || document.hidden;
  }

  private updatePresentationEvidence(): void {
    const data = this.renderer.domElement.dataset;
    data.presentationMode = this.presentation ?? "game";
    data.presentationStatus = this.presentation !== null ? (this.presentationPaused() ? "paused" : "running") : (this.uiLock ? "paused" : "game");
    data.presentationFrame = String(this.presentationFrame);
    data.presentationFps = this.presentationFps.toFixed(1);
    data.presentationMotion = this.presentationMotion.matches ? "reduced" : "full";
    data.presentationMarked = String(this.presentation !== null && this.presentationBuoy?.visible === true);
  }

  private createPresentationObjects(): void {
    if (this.presentationShip !== null) return;
    const previous = new Set(this.scene.children);
    this.presentationShip = new Ship(this.scene);
    this.presentationParticles = new ParticleSystem(this.scene);
    const dock = this.props.dock;
    this.presentationShip.setPose(dock.x + 13, dock.z + dock.len + 15, Math.PI * 0.72);
    this.presentationShip.moored = true;
    this.presentationShip.group.traverse((node) => {
      if (["BackSail", "Front_Sail", "MidleSail"].includes(node.name))
        this.presentationSails.push({ node, rotation: node.rotation.clone() });
    });
    const buoy = new THREE.Group();
    const float = new THREE.Mesh(new THREE.SphereGeometry(0.65, 20, 12), new THREE.MeshStandardMaterial({ color: 0xdc9f56, roughness: 0.55 }));
    float.scale.set(1, 0.7, 1);
    float.castShadow = true;
    buoy.add(float);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 1.6, 8), new THREE.MeshStandardMaterial({ color: 0xe8ded0, roughness: 0.7 }));
    mast.position.y = 0.9;
    mast.castShadow = true;
    buoy.add(mast);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.36, 6, 1), new THREE.MeshStandardMaterial({ color: 0xe7c689, roughness: 0.9, side: THREE.DoubleSide }));
    flag.position.set(0.37, 1.55, 0);
    flag.castShadow = true;
    buoy.add(flag);
    buoy.position.set(dock.x + 3.5, 0, dock.z + dock.len + 9);
    this.scene.add(buoy);
    buoy.visible = false;
    this.presentationBuoy = buoy;
    this.presentationObjects = this.scene.children.filter((object) => !previous.has(object));
  }

  private renderPresentation(dt: number, snap = false): void {
    if (this.presentation === null || this.presentationShip === null || this.presentationParticles === null) return;
    const reducedMotion = this.presentationMotion.matches;
    if (reducedMotion) dt = 0;
    const t = (this.presentationElapsed += dt);
    const dock = this.props.dock;
    const distant = this.presentation === "distance";
    const close = this.presentation === "look" || this.presentation === "mark";
    const focus = new THREE.Vector3(dock.x + 7, 2.1, dock.z + dock.len + 13);
    const cameraPosition = new THREE.Vector3(
      dock.x - (distant ? 14 : close ? 5.5 : 10) + Math.sin(t * 0.055) * 0.45,
      distant ? 7.5 : close ? 3.9 : 5.2,
      dock.z + (distant ? 0 : close ? 17 : 9) + Math.cos(t * 0.045) * 0.4,
    );
    this.camera.position.lerp(cameraPosition, snap || reducedMotion ? 1 : 1 - Math.exp(-dt * 1.2));
    this.camera.lookAt(focus);
    const hour = 17;
    const palette = paletteFor(hour, 0);
    this.water.setEnvironment(0, 0);
    this.sky.update(t, hour, 0, this.camera.position, focus);
    this.water.update(t, this.camera.position, 0, sunDirection(hour, new THREE.Vector3()), palette.sunColor, palette.zenith, palette.horizon, palette.night, this.scene.fog as THREE.Fog);
    this.presentationShip.sailDt(dt, t, { forward: 0, turn: 0, turbo: false }, 0, this.presentationParticles, (x, z) => this.water.heightAt(x, z, t));
    for (const { node, rotation } of this.presentationSails) {
      node.scale.set(0.85, 0.56, 1);
      node.rotation.z = rotation.z + Math.sin(t * 0.8 + node.position.y) * 0.022;
    }
    if (this.presentationBuoy !== null) {
      const buoy = this.presentationBuoy;
      buoy.visible = this.presentation === "mark";
      buoy.position.y = this.water.heightAt(buoy.position.x, buoy.position.z, t) * 0.85 + 0.35;
      buoy.rotation.set(Math.sin(t * 0.7) * 0.06, 0, Math.cos(t * 0.55) * 0.07);
    }
    this.presentationParticles.update(dt);
    this.updateClouds(dt * 0.35, focus);
    this.bloom.enabled = this.qualityLevel < 3;
    const reflEvery = this.qualityLevel < 2 ? 2 : this.qualityLevel === 2 ? 4 : 0;
    if (reflEvery > 0 && this.reflFrame++ % reflEvery === 0)
      this.water.renderReflection(this.renderer, this.scene, this.camera);
    this.composer.render();
    this.presentationFrame++;
    this.updatePresentationEvidence();
  }

  private releaseInput() {
    this.keys.clear();
    if (this.attackTimer !== null) window.clearTimeout(this.attackTimer);
    this.attackTimer = null;
    if (document.pointerLockElement === this.renderer.domElement) document.exitPointerLock();
  }

  private extendFrozenDurations() {
    if (this.frozenAt === null) return;
    const frozenMs = Math.max(0, Date.now() - this.frozenAt);
    if (this.fireBuffUntil > performance.now() - frozenMs) this.fireBuffUntil += frozenMs;
    for (const meal of this.save.activeMeals) {
      meal.expiresAt += frozenMs;
      if (meal.crashAt !== undefined) meal.crashAt += frozenMs;
      if (meal.crashExpiresAt !== undefined) meal.crashExpiresAt += frozenMs;
    }
    this.frozenAt = Date.now();
  }

  private syncProtection = () => {
    if (this.disposed) return;
    if (this.uiLock) {
      if (this.frozenAt === null) {
        this.frozenAt = Date.now();
        this.releaseInput();
      }
    } else if (this.frozenAt !== null) {
      this.extendFrozenDurations();
      this.frozenAt = null;
    }
    audio.setPaused(this.presentation !== null || isProtectionPaused());
    this.updatePresentationEvidence();
  };

  private releaseGameInput = () => { this.keys.clear(); };

  private onBlur = () => {
    store.set({ paused: true, protectionOpen: "pause" });
  };
  private onVisibilityChange = () => {
    if (document.hidden) this.onBlur();
  };

  // ── Eingaben ─────────────────────────────────────────────────────
  private onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) return;
    const k = e.key.toLowerCase();
    if (k === "escape") {
      e.preventDefault();
      store.set({ paused: true, protectionOpen: "pause" });
      return;
    }
    if (this.uiLock) return;
    if (e.target instanceof Element && e.target.closest("input,textarea,select,[contenteditable=true],button")) return;
    this.keys.add(k);
    if (k === "e") this.tryInteract();
    if (k === "q") this.tryDodge();
    if (k === "m") {
      audio.setMuted(!audio.isMuted);
      store.toast(audio.isMuted ? "Ton aus" : "Ton an");
    }
    if (k === "f3") {
      store.set({ showFps: !store.get().showFps });
      e.preventDefault();
    }
    if ((k === "t" || k === "b") && !this.uiLock && this.save.mode === "onfoot") {
      store.set({ chatOpen: true });
      if (document.pointerLockElement) document.exitPointerLock();
    }
    if (k === "j" && !this.uiLock) {
      store.set({ journalOpen: true });
      if (document.pointerLockElement) document.exitPointerLock();
    }
    if (k === "k") this.tryCookOpen();
  };
  private onKeyUp = (e: KeyboardEvent) => this.keys.delete(e.key.toLowerCase());

  private onMouseMove = (e: MouseEvent) => {
    if (this.uiLock || document.pointerLockElement !== this.renderer.domElement) return;
    const dx = e.movementX * 0.0026;
    const dy = e.movementY * 0.0022;
    if (this.save.mode === "onfoot") {
      this.player.camYaw -= dx;
      this.player.camPitch = clamp(this.player.camPitch + dy, -0.5, 1.15);
    } else {
      this.sailYaw -= dx;
      this.sailPitch = clamp(this.sailPitch + dy, 0.08, 1.2);
    }
  };

  private onMouseDown = (e: MouseEvent) => {
    if (this.uiLock || e.target !== this.renderer.domElement) return;
    this.renderer.domElement.focus({ preventScroll: true });
    if (document.pointerLockElement !== this.renderer.domElement) {
      try {
        const r = this.renderer.domElement.requestPointerLock() as unknown;
        if (r instanceof Promise) r.catch(() => {});
      } catch {
        /* Headless/QA: kein Pointer-Lock verfügbar */
      }
      audio.startSea();
      return;
    }
    if (e.button === 0 && this.save.mode === "onfoot") this.tryAttack();
  };

  private onWheel = (e: WheelEvent) => {
    if (this.uiLock || e.target !== this.renderer.domElement) return;
    const d = Math.sign(e.deltaY) * 1.4;
    if (this.save.mode === "onfoot") this.player.camDist = clamp(this.player.camDist + d, 4.5, 13);
    else this.sailDist = clamp(this.sailDist + d * 1.6, 10, 30);
  };

  private onResize = () => {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer?.setSize(w, h);
    this.water?.setReflSize(w, h, this.renderer.getPixelRatio());
  };

  private bindInput() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("wheel", this.onWheel);
    window.addEventListener("resize", this.onResize);
    window.addEventListener("blur", this.onBlur);
    window.addEventListener("focusin", this.releaseGameInput);
    document.addEventListener("visibilitychange", this.onVisibilityChange);
  }

  // ── Interaktionen ────────────────────────────────────────────────
  private currentPrompt: { key: string; text: string; action: () => void } | null = null;

  private computePrompt(): void {
    this.currentPrompt = null;
    if (this.uiLock) return;
    if (this.save.mode === "sailing") {
      // Anlegen möglich?
      const depth = terrainHeight(this.ship.x, this.ship.z);
      if (depth > -5.5 && Math.abs(this.ship.speed) < 6) {
        this.currentPrompt = { key: "E", text: "Anlegen & aussteigen", action: () => this.disembark() };
      }
      return;
    }
    // Zu Fuß
    const p = this.player.pos;

    // Bau-Modus: Geist platzieren
    if (this.buildSession) {
      const b = this.buildSession;
      this.currentPrompt = {
        key: "E",
        text: b.valid ? `${b.def.name} hier bauen (${matCostText(b.def)})` : `${b.def.name}: hier nicht möglich — ${b.def.hint}`,
        action: () => this.confirmBuild(),
      };
      return;
    }

    // Truhe
    for (const tr of this.treasure) {
      if (Math.hypot(p.x - tr.x, p.z - tr.z) < 2.6) {
        this.currentPrompt = {
          key: "E",
          text: "Verschlossene Truhe öffnen",
          action: () => this.openTreasure(tr.id),
        };
        return;
      }
    }

    // Material aufheben
    const it = this.loot.nearest(p.x, p.z, 2.6);
    if (it) {
      const name = it.food ? ingById(it.food)?.name ?? it.matId : matName(it.matId);
      this.currentPrompt = {
        key: "E",
        text: `${name} aufheben`,
        action: () => this.takeLoot(it),
      };
      return;
    }

    // Floß-Hinweis beim Draufstehen
    const raft = this.structures.raftUnder(p.x, p.z);
    if (raft) {
      this.currentPrompt = null; // Paddelhinweis kommt über HUD-Textzeile
    }

    // Phänomen-Begegnung am Schrein
    const islHere = islandAt(p.x, p.z);
    if (islHere) {
      const c = this.creatures.get(islHere.id);
      const stIsl = this.save.islands.find((i) => i.id === islHere.id);
      if (c && !c.dead && !stIsl?.overcome) {
        const cp = c.group.position;
        if (Math.hypot(p.x - cp.x, p.z - cp.z) < 17) {
          const phen = c.def;
          this.currentPrompt = {
            key: "E",
            text: `Begegnung: ${phen.name} — ${phen.epithet}`,
            action: () => this.startEncounter(islHere.id),
          };
          return;
        }
      }
    }

    // NPC-Gespräch
    const npc = this.npcs.nearestNpc(p.x, p.z, 4.2);
    if (npc) {
      this.currentPrompt = {
        key: "E",
        text: `Mit ${npc.name} sprechen (${npc.role})`,
        action: () => this.openDialog(npc.id),
      };
      return;
    }

    // Lore-Runenstein
    const stone = this.loreStones.nearest(p.x, p.z, 3.2);
    if (stone) {
      this.currentPrompt = {
        key: "E",
        text: "Runenstein berühren",
        action: () => this.readStone(stone.line.id),
      };
      return;
    }

    // Hinterlassenes Echo aufnehmen
    if (this.save.echoDrop) {
      const ed = this.save.echoDrop;
      if (Math.hypot(p.x - ed.x, p.z - ed.z) < 3.2) {
        this.currentPrompt = {
          key: "E",
          text: `Echo aufnehmen (${ed.crystals} Kristalle)`,
          action: () => this.pickupEcho(),
        };
        return;
      }
    }

    // Einsteigen
    const ds = Math.hypot(p.x - this.ship.x, p.z - this.ship.z);
    if (ds < 10) {
      this.currentPrompt = { key: "E", text: "An Bord der TOLERANZ gehen", action: () => this.board() };
      return;
    }
    // Aufzug fahren (M3)
    {
      const lift = this.structures.aufzugNear(p.x, p.z);
      if (lift && Math.abs(p.y - lift.deckY) < 1.4) {
        const up = (lift.rideT ?? 0) < 0.5;
        this.currentPrompt = {
          key: "E",
          text: up ? "Aufzug: hochfahren (Erdkern)" : "Aufzug: hinunterfahren (Erdkern)",
          action: () => {
            this.structures.toggleRide(lift);
            audio.confirm();
          },
        };
        return;
      }
    }
    // Baum fällen
    const tree = this.props.nearestTree(p.x, p.z, 3.4);
    if (tree) {
      this.currentPrompt = { key: "E", text: "Baum fällen (Axt)", action: () => this.chop(tree) };
      return;
    }
    // Feuer
    const fire = this.props.nearestFire(p.x, p.z, 3.4);
    if (fire) {
      if (!fire.lit) {
        const can = this.save.wood >= 2;
        this.currentPrompt = {
          key: "E",
          text: can ? "Feuer anzünden (2 Holz)" : "Feuer anzünden — braucht 2 Holz",
          action: () => {
            if (this.save.wood < 2) {
              store.toast("Nicht genug Holz. Bäume liefern welches.", "bad");
              audio.cancel();
              return;
            }
            this.save.wood -= 2;
            fire.lit = true;
            if (!this.save.litFires.includes(fire.id)) this.save.litFires.push(fire.id);
            audio.confirm();
            store.toast("Das Feuer knistert. Wärme breitet sich aus.", "good");
            this.persist();
          },
        };
        return;
      }
      if ((this.save.materials["eimer"] ?? 0) > 0) {
        this.currentPrompt = {
          key: "E",
          text: "Rasten + Eimer-Wasser erwärmen (→ Warmes Wasser) · [K] Kochen",
          action: () => {
            this.restAtFire();
            this.save.player.items.wasser = (this.save.player.items.wasser ?? 0) + 1;
            store.toast("Das Wasser im Eimer dampft. Einweisgefüllt: +1 Warmes Wasser.", "good");
          },
        };
      } else {
        this.currentPrompt = {
          key: "E",
          text: (this.save.wood >= 1 ? "Rasten: Kraft ins Feuer (1 Holz → Stärkung)" : "Rasten (Stabilität auffrischen)") + " · [K] Kochen",
          action: () => this.restAtFire(),
        };
      }
      return;
    }
    // Werkbank
    const wb = this.props.workbench;
    if (Math.hypot(p.x - wb.x, p.z - wb.z) < 3.4) {
      if (this.save.weaponLevel === 1) {
        const can = this.save.wood >= 5;
        this.currentPrompt = {
          key: "E",
          text: can ? "Axt verbessern: „Axt der Klarheit“ (5 Holz)" : "Axt verbessern — braucht 5 Holz",
          action: () => {
            if (this.save.wood < 5) {
              store.toast("Nicht genug Holz für den Ausbau.", "bad");
              audio.cancel();
              return;
            }
            this.save.wood -= 5;
            this.save.weaponLevel = 2;
            audio.victory();
            store.toast("„Axt der Klarheit“ — deutlich mehr Schaden, spürbar besser im Griff.", "good");
            this.persist();
          },
        };
      } else {
        this.currentPrompt = {
          key: "E",
          text: "Werkbank — Kristall-Upgrades folgen",
          action: () => store.toast("Kaj arbeitet schon an der nächsten Stufe. (Bald)", "info"),
        };
      }
      return;
    }
  }

  private tryInteract() {
    if (this.uiLock) return;
    if (this.currentPrompt) this.currentPrompt.action();
  }

  private restAtFire() {
    const p = this.save.player;
    p.stability = Math.min(p.maxStability, p.stability + p.maxStability * 0.45);
    p.presence = Math.min(p.maxPresence, p.presence + p.maxPresence * 0.3);
    audio.heal();
    if (this.save.wood >= 1) {
      this.save.wood -= 1;
      this.fireBuffUntil = performance.now() + 5 * 60 * 1000;
      store.toast("Du gibst Holz ins Feuer — die Wärme zieht in die Arme. +25% Schaden (5 Min).", "good");
    } else {
      store.toast("Du rastest am Feuer. Stabilität kehrt zurück.", "good");
    }
    this.persist();
  }

  /** Kochen öffnen (Taste K): nur an einem brennenden Feuer */
  private tryCookOpen() {
    if (this.uiLock) return;
    if (this.save.mode !== "onfoot") return;
    const p = this.player.pos;
    const fire = this.props.nearestFire(p.x, p.z, 4.0);
    if (fire && fire.lit) {
      store.set({ cookOpen: true });
      if (document.pointerLockElement) document.exitPointerLock();
    } else {
      store.toast("Kochen geht nur an einem brennenden Feuer.", "info");
    }
  }

  /** Gericht kochen & essen: Zutaten verbrauchen, Wirkung aktivieren, Rezept lernen */
  cookDish(ids: string[]): DishResult | null {
    const dish = computeDish(ids);
    if (!dish) return null;
    // Vorrat prüfen & verbrauchen
    const need: Record<string, number> = {};
    for (const id of ids) need[id] = (need[id] ?? 0) + 1;
    for (const [id, n] of Object.entries(need)) {
      if ((this.save.food[id] ?? 0) < n) return null;
    }
    for (const [id, n] of Object.entries(need)) {
      this.save.food[id] -= n;
      if (this.save.food[id] <= 0) delete this.save.food[id];
    }
    // Wirkung aktivieren
    const now = Date.now();
    this.save.activeMeals = pruneMeals(this.save.activeMeals, now).concat(mealsToActive(dish, now));
    this.save.mealsCooked++;
    this.save.recentMicros = [...this.save.recentMicros, { micros: dish.micros, at: now }].slice(-6);
    // Tove-Quest (M3): einmal glutenfrei mit ≥ 2 Zutaten gekocht
    if (this.save.glutenFree && dish.gluten === "frei" && ids.length >= 2) this.save.gfMealCooked = true;
    // Rezept lernen
    if (dish.matchedRecipeId && !this.save.recipesFound.includes(dish.matchedRecipeId)) {
      this.save.recipesFound.push(dish.matchedRecipeId);
      store.toast(`„${dish.name}" — diese Kombination wirkt. Notiert im Journal.`, "good");
    } else {
      store.toast(`„${dish.name}" — gut gekocht.`, "good");
    }
    this.persist();
    return dish;
  }

  private chop(tree: TreeRec) {
    this.player.swing();
    audio.hit();
    const felled = this.props.chopTree(tree, this.particles, this.elapsed);
    if (felled) {
      this.save.wood += 3;
      store.toast("+3 Holz", "good");
      audio.confirm();
      this.persist();
    }
  }

  private tryAttack() {
    if (this.save.mode !== "onfoot" || this.attackCooldown > 0 || this.uiLock || !store.get().combatEnabled) return;
    this.attackCooldown = 0.42;
    this.player.swing();
    audio.select();
    // Trefferprüfung nach kurzer Verzögerung (Schwung)
    this.attackTimer = window.setTimeout(() => {
      this.attackTimer = null;
      if (this.disposed || this.uiLock || !store.get().combatEnabled || this.save.mode !== "onfoot") return;
      const p = this.player.pos;
      const fx = Math.sin(this.player.facing);
      const fz = Math.cos(this.player.facing);
      const buffed = performance.now() < this.fireBuffUntil;
      const dmg = (12 + (this.save.weaponLevel - 1) * 9) * (buffed ? 1.25 : 1);
      for (const e of this.enemies) {
        if (e.dead) continue;
        const dx = e.x - p.x;
        const dz = e.z - p.z;
        const d = Math.hypot(dx, dz);
        if (d > 3.0) continue;
        const dot = (dx * fx + dz * fz) / (d || 1);
        if (dot < 0.35) continue;
        audio.hit();
        const killed = e.hit(dmg, this.particles);
        if (killed) {
          this.save.crystals += 1;
          store.toast("Der Schatten löst sich. +1 Kristall — es wird stiller auf der Insel.", "good");
          audio.understand();
          this.persist();
        }
      }
    }, 130);
  }

  private tryDodge() {
    if (this.save.mode !== "onfoot" || this.uiLock) return;
    if (this.player.dodgeT > 0 || !this.player.grounded) return;
    this.player.dodge();
    audio.cancel();
  }

  // ── Moduswechsel ─────────────────────────────────────────────────
  private disembark() {
    // Strandpunkt in Richtung Inselmitte suchen
    const isl = islandAt(this.ship.x, this.ship.z) ?? this.nearestIslandDef(this.ship.x, this.ship.z);
    let bx = this.ship.x;
    let bz = this.ship.z;
    if (isl) {
      const dx = isl.x - this.ship.x;
      const dz = isl.z - this.ship.z;
      const d = Math.hypot(dx, dz) || 1;
      for (let s = 0; s < d + 40; s += 2) {
        const x = this.ship.x + (dx / d) * s;
        const z = this.ship.z + (dz / d) * s;
        if (terrainHeight(x, z) > 0.7) {
          bx = x;
          bz = z;
          break;
        }
      }
    }
    const y = this.groundAt(bx, bz);
    this.player.place(bx, y, bz, this.ship.heading + Math.PI);
    this.player.group.visible = true;
    this.ship.moored = true;
    this.save.mode = "onfoot";
    this.save.playerPos = { x: bx, z: bz };
    audio.dock();
    store.set({ mode: "onfoot" });
    store.toast("Du stehst an Land. [E] interagiert, [Klick] schwingt die Axt, [Q] weicht aus.", "info");
    this.player.snapCamera(this.camera, (x, z) => this.groundAt(x, z));
    this.persist();
  }

  private board() {
    this.save.mode = "sailing";
    this.save.playerPos = null;
    this.player.group.visible = false;
    this.ship.moored = false;
    this.sailYaw = this.ship.heading;
    audio.dock();
    store.set({ mode: "sailing" });
    this.snapSailCamera();
    this.persist();
  }

  private nearestIslandDef(x: number, z: number) {
    let best = HARBOR;
    let bd = Infinity;
    for (const isl of [...ISLANDS, HARBOR]) {
      const d = (isl.x - x) ** 2 + (isl.z - z) ** 2;
      if (d < bd) {
        bd = d;
        best = isl;
      }
    }
    return best;
  }

  private snapSailCamera() {
    const cp = Math.cos(this.sailPitch);
    this.camera.position.set(
      this.ship.x + Math.sin(this.sailYaw) * cp * this.sailDist,
      4 + Math.sin(this.sailPitch) * this.sailDist,
      this.ship.z + Math.cos(this.sailYaw) * cp * this.sailDist,
    );
    this.camera.lookAt(this.ship.x, 5, this.ship.z);
  }

  private playerDied() {
    store.set({ dead: true });
    audio.defeat();
    if (document.pointerLockElement) document.exitPointerLock();
  }

  respawn() {
    // nächstes entzündetes Feuer zum Todesort/Echo (Souls-Regel: dicht), sonst Hafen
    let f = this.props.fireById("feuer_harbor")!;
    let bd = Infinity;
    const ref = this.save.echoDrop ?? { x: this.player.pos.x, z: this.player.pos.z, crystals: 0 };
    for (const fid of this.save.litFires) {
      const cand = this.props.fireById(fid);
      if (!cand) continue;
      const d = (cand.x - ref.x) ** 2 + (cand.z - ref.z) ** 2;
      if (d < bd) {
        bd = d;
        f = cand;
      }
    }
    const y = this.groundAt(f.x + 2, f.z + 2);
    this.player.place(f.x + 2, y, f.z + 2, 0);
    this.save.mode = "onfoot";
    this.save.playerPos = { x: f.x + 2, z: f.z + 2 };
    this.save.player.stability = this.save.player.maxStability * 0.6;
    this.save.player.presence = this.save.player.maxPresence * 0.5;
    // Schiff liegt am Hafen, falls man woanders war
    this.ship.setPose(HARBOR.x, HARBOR.z + HARBOR.radius + 40, Math.PI);
    this.ship.moored = true;
    store.set({ dead: false, mode: "onfoot" });
    store.toast("Du wachst am Feuer des Ankerplatzes auf. Jemand hat dich hereingetragen.", "info");
    this.persist();
  }

  // ── Kompass-Ziel ─────────────────────────────────────────────────
  private compassTarget(): { x: number; z: number; name: string } {
    const px = this.save.mode === "onfoot" ? this.player.pos.x : this.ship.x;
    const pz = this.save.mode === "onfoot" ? this.player.pos.z : this.ship.z;
    const chosen = this.roomView ?? store.get().activeRoom;
    const room = ROOMS.find(value => value.id === chosen) ?? [...ROOMS].sort((a, b) =>
      Math.hypot(a.x - px, a.z - pz) - Math.hypot(b.x - px, b.z - pz))[0];
    return { x: room.x, z: room.z, name: room.name };
  }

  // ── Begegnungen, Dialoge, Lore, Echo ────────────────────────────
  startEncounter(islandId: string) {
    if (this.uiLock) return;
    if (!store.get().combatEnabled) {
      if (hasUnreadableSave()) { store.set({ paused: true, protectionOpen: "pause" }); return; }
      store.set({ explorationOpen: true });
      return;
    }
    const c = this.creatures.get(islandId);
    if (!c || c.dead) return;
    c.lookAt(this.player.pos.clone());
    c.setAgitation(0.95);
    if (document.pointerLockElement) document.exitPointerLock();
    audio.understand();
    store.set({ battlePhen: islandId });
  }

  creatureHook(action: "hit" | "attack" | "dissolve", peace?: number) {
    if (isProtectionPaused()) return;
    const id = store.get().battlePhen;
    if (!id) return;
    const c = this.creatures.get(id);
    if (!c) return;
    if (action === "hit") c.hit();
    else if (action === "attack") c.attack();
    else if (action === "dissolve") c.dissolve(this.particles);
    if (peace !== undefined) c.setPeace(peace);
  }

  endEncounter(outcome: "win" | "peace" | "flee" | "defeat", phenId: string, player: PlayerState) {
    if (isProtectionPaused() || store.get().battlePhen !== phenId) return;
    if (outcome === "flee") {
      this.retreatEncounter();
      return;
    }
    if (outcome === "win" || outcome === "peace") this.save.player = player;
    const c = this.creatures.get(phenId);
    const stIsl = this.save.islands.find((i) => i.id === phenId);
    const phen = PHENOMENA.find((pp) => pp.id === phenId);
    if (outcome === "win" || outcome === "peace") {
      if (stIsl) {
        stIsl.overcome = true;
        stIsl.understood = outcome === "peace";
      }
      if (phen) {
        const res = grantXp(this.save.player, phen.xp);
        this.save.crystals += 2;
        if (c) {
          if (outcome === "peace") c.setPeace(1);
          else c.dissolve(this.particles);
        }
        if (res.leveledUp) {
          store.toast(`Stufe ${res.newLevel} erreicht — Stabilität und Präsenz wachsen.`, "good");
          audio.victory();
        }
        store.toast(phen.insight, "good");
        checkFinalUnlock(this.save);
        if (this.save.finalUnlocked) {
          store.toast("Das Auge des Atlanten ist offen. Der Sturmherd wartet in der Mitte der Karte.", "info");
        }
      }
    } else if (outcome === "defeat") {
      this.respawn();
    }
    store.set({ battlePhen: null });
    this.persist();
  }

  /** Leave any encounter without transferring provisional damage or item costs. */
  retreatEncounter(): boolean {
    const id = store.get().battlePhen;
    if (id) this.creatures.get(id)?.setAgitation(0);
    this.save.crystals += this.duelEscrow;
    this.duelEscrow = 0;
    this.releaseInput();
    store.set({
      battlePhen: null, duelId: null, dialogNpc: null, chatOpen: false,
      cookOpen: false, journalOpen: false, loreStone: null,
      paused: true, protectionOpen: "pause", combatEnabled: false,
      damageFlash: 0, wood: this.save.wood, crystals: this.save.crystals,
    });
    return this.checkpoint();
  }

  openDialog(npcId: string) {
    // Rededuell (M3): Vessa startet ihr Duell statt des freien Dialogs
    if (npcId === "vessa" && !this.save.duelsDone.includes("duell_vessa")) {
      if (document.pointerLockElement) document.exitPointerLock();
      audio.select();
      store.set({ duelId: "duell_vessa" });
      return;
    }
    const mem = this.save.npcMemory[npcId] ?? { met: false, topics: [], favors: 0 };
    mem.met = true;
    this.save.npcMemory[npcId] = mem;
    if (document.pointerLockElement) document.exitPointerLock();
    audio.select();
    store.set({ dialogNpc: npcId });
  }

  // ── Rededuell-API (M3) ──
  /** Kristalle bezahlen (Duell) — false bei Deckungslücke */
  duelPay(n: number): boolean {
    if (isProtectionPaused() || !store.get().duelId || !Number.isFinite(n) || n < 0) return false;
    if (this.save.crystals < n) return false;
    this.save.crystals -= n;
    this.duelEscrow += n;
    return true;
  }

  /** Handel abschließen: benannt = fairer Preis (Differenz zurück), sonst teuer */
  duelSettle(kind: "named" | "unnamed", paid: number, fairPrice: number) {
    if (isProtectionPaused() || !store.get().duelId) return;
    if (kind === "named") {
      const back = Math.max(0, paid - fairPrice);
      if (back > 0) {
        this.save.crystals += back;
        store.toast(`${back} Kristalle zurück — fairer Preis.`, "good");
      }
      if (paid === 0 && this.save.crystals >= fairPrice) this.save.crystals -= fairPrice;
      grantXp(this.save.player, 25);
      this.save.player.items.karte = (this.save.player.items.karte ?? 0) + 1;
      store.toast("+25 Einsicht — Muster erkannt. Karte erhalten.", "good");
    } else {
      if (paid >= fairPrice) {
        this.save.player.items.karte = (this.save.player.items.karte ?? 0) + 1;
        store.toast("Strömungskarte erhalten — teuer erkauft.", "info");
      }
      grantXp(this.save.player, 8);
    }
    this.duelEscrow = 0;
    this.persist();
  }

  /** Taktik in den Manipulations-Kompass aufnehmen (+Einsicht) */
  addCompassEntry(tacticId: string) {
    if (this.save.compassEntries.includes(tacticId)) return;
    this.save.compassEntries.push(tacticId);
    grantXp(this.save.player, 15);
    audio.understand();
    store.toast("🧭 Manipulations-Kompass: Eintrag hinzugefügt. +15 Einsicht.", "good");
    this.persist();
  }

  finishDuel(id: string) {
    if (!this.save.duelsDone.includes(id)) this.save.duelsDone.push(id);
    this.persist();
  }

  readStone(id: string) {
    if (!this.save.echoesFound.includes(id)) {
      this.save.echoesFound.push(id);
      this.loreStones.markFound(id);
      grantXp(this.save.player, 8);
      audio.understand();
    }
    if (document.pointerLockElement) document.exitPointerLock();
    store.set({ loreStone: id });
    this.persist();
  }

  private spawnEchoOrb(x: number, z: number) {
    if (this.echoOrb) this.scene.remove(this.echoOrb);
    const y = this.props.groundHeight(x, z);
    this.echoOrb = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.55, 0),
      new THREE.MeshStandardMaterial({ color: 0x9fd8ff, emissive: 0x3aa8e8, emissiveIntensity: 2.2, roughness: 0.2 }),
    );
    this.echoOrb.position.set(x, y + 1.4, z);
    this.scene.add(this.echoOrb);
  }

  pickupEcho() {
    const ed = this.save.echoDrop;
    if (!ed) return;
    this.save.crystals += ed.crystals;
    this.save.echoDrop = null;
    if (this.echoOrb) {
      this.scene.remove(this.echoOrb);
      this.echoOrb = null;
    }
    audio.victory();
    store.toast(`Echo aufgenommen: ${ed.crystals} Kristalle kehren zurück.`, "good");
    this.persist();
  }

  // ── M2: Bauen, Loot, Truhen ─────────────────────────────────────
  beginBuild(defId: string) {
    const def = BUILDABLES.find((b) => b.id === defId);
    if (!def) return;
    const missing = missingMaterials(def, this.save.materials);
    if (missing.length > 0) {
      store.toast(`Für „${def.name}“ fehlt: ${missing.map((m) => `${m.need}× ${matName(m.id)}`).join(", ")}`, "bad");
      return;
    }
    // Fertigung statt Platzierung (M3): Ausrüstung wie der Gleitschirm
    if (def.craftOnly) {
      for (const [id, n] of Object.entries(def.materials)) {
        this.save.materials[id] = (this.save.materials[id] ?? 0) - n;
      }
      if (!this.save.equipment.includes(def.id)) this.save.equipment.push(def.id);
      audio.confirm();
      store.toast(
        def.id === "gleitschirm"
          ? "Gleitschirm gefertigt. In der Luft [Leertaste] halten — der Windkern trägt."
          : `${def.name} gefertigt.`,
        "good",
      );
      this.persist();
      return;
    }
    this.cancelBuild();
    let ghost: THREE.Object3D;
    if (def.id === "floss") ghost = buildFloss();
    else if (def.id === "leiter") ghost = buildLeiter({ id: "ghost", type: "leiter", x: 0, z: 0, yaw: 0 });
    else if (def.id === "ventilator") ghost = buildVentilator();
    else if (def.id === "aufzug") ghost = buildAufzug({ id: "ghost", type: "aufzug", x: 0, z: 0, yaw: 0, topY: terrainHeight(0, 0) + 8 });
    else ghost = buildBruecke({ id: "ghost", type: "bruecke", x: 0, z: 0, yaw: 0, ex: 0, ez: 8 });
    ghost.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.material = new THREE.MeshStandardMaterial({ color: 0x6aff8a, transparent: true, opacity: 0.55, depthWrite: false });
        o.castShadow = false;
      }
    });
    this.scene.add(ghost);
    this.buildSession = { def, ghost, x: 0, z: 0, yaw: 0, valid: false };
    store.toast(def.hint, "info");
  }

  cancelBuild() {
    if (this.buildSession) {
      this.scene.remove(this.buildSession.ghost);
      this.buildSession = null;
    }
  }

  get isBuilding(): boolean {
    return this.buildSession !== null;
  }

  private updateBuildGhost() {
    const b = this.buildSession;
    if (!b) return;
    const p = this.player.pos;
    const fx = Math.sin(this.player.facing);
    const fz = Math.cos(this.player.facing);
    b.yaw = this.player.facing;

    if (b.def.id === "floss") {
      b.x = p.x + fx * 5;
      b.z = p.z + fz * 5;
      const h = terrainHeight(b.x, b.z);
      b.valid = h < 1.2; // nasser Sand oder Wasser
      b.ghost.position.set(b.x, h < 0.4 ? this.water.heightAt(b.x, b.z, this.elapsed) : h + 0.3, b.z);
      b.ghost.rotation.y = b.yaw;
    } else if (b.def.id === "leiter") {
      b.x = p.x + fx * 1.6;
      b.z = p.z + fz * 1.6;
      const g0 = terrainHeight(b.x, b.z);
      const tx = b.x + fx * 5.2;
      const tz = b.z + fz * 5.2;
      const gTop = terrainHeight(tx, tz);
      b.ex = tx;
      b.ez = tz;
      b.topY = Math.max(gTop, g0 + 3.2);
      b.valid = gTop - g0 > 1.6;
      b.ghost.position.set(b.x, g0, b.z);
      b.ghost.rotation.y = b.yaw + Math.PI;
    } else if (b.def.id === "ventilator") {
      // Ventilator: 2,5 m vor dem Spieler auf ebenem Boden, Windkegel in Blickrichtung
      b.x = p.x + fx * 2.5;
      b.z = p.z + fz * 2.5;
      const g = terrainHeight(b.x, b.z);
      b.valid = g > 0.3 && terrainSlope(b.x, b.z) < 0.4;
      b.ghost.position.set(b.x, g, b.z);
      b.ghost.rotation.y = b.yaw;
    } else if (b.def.id === "aufzug") {
      // Aufzug: 2 m vor dem Spieler auf festem Boden, oberer Stopp = Basis + 8 m
      b.x = p.x + fx * 2.0;
      b.z = p.z + fz * 2.0;
      const g = terrainHeight(b.x, b.z);
      b.topY = g + 8;
      b.valid = g > 0.3;
      b.ghost.position.set(b.x, g, b.z);
      b.ghost.rotation.y = b.yaw;
    } else {
      // Brücke: Start vor dem Spieler, Ende bis zu 14 m in Blickrichtung
      b.x = p.x + fx * 1.5;
      b.z = p.z + fz * 1.5;
      const span = clampSpan(b.x, b.z, b.x + fx * 14, b.z + fz * 14, 14);
      b.ex = span.ex;
      b.ez = span.ez;
      const g0 = terrainHeight(b.x, b.z);
      const g1 = terrainHeight(span.ex, span.ez);
      let hasGap = false;
      for (let f = 0.15; f < 1; f += 0.15) {
        if (terrainHeight(b.x + (span.ex - b.x) * f, b.z + (span.ez - b.z) * f) < Math.min(g0, g1) - 0.8) hasGap = true;
      }
      b.valid = g0 > 0.2 && g1 > -0.6 && hasGap && Math.hypot(span.ex - b.x, span.ez - b.z) > 3;
      b.topY = Math.max(g0, g1);
      b.ghost.position.set(b.x, b.topY, b.z);
      b.ghost.rotation.y = Math.atan2(span.ex - b.x, span.ez - b.z);
    }
    // Färben: grün = gültig, rot = ungültig
    b.ghost.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        (o.material as THREE.MeshStandardMaterial).color.setHex(b.valid ? 0x6aff8a : 0xff5a5a);
      }
    });
  }

  confirmBuild() {
    const b = this.buildSession;
    if (!b) return;
    if (!b.valid) {
      store.toast(b.def.hint, "bad");
      audio.cancel();
      return;
    }
    for (const [id, n] of Object.entries(b.def.materials)) {
      this.save.materials[id] = (this.save.materials[id] ?? 0) - n;
    }
    const def = {
      id: `b_${b.def.id}_${Date.now() % 100000}`,
      type: b.def.id as "floss" | "leiter" | "bruecke" | "ventilator" | "aufzug",
      x: b.x,
      z: b.z,
      yaw: b.ghost.rotation.y,
      ex: b.ex,
      ez: b.ez,
      topY: b.topY,
    };
    this.structures.add(def);
    this.save.structures = this.structures.toSave();
    audio.confirm();
    store.toast(`${b.def.name} gebaut. MacGyver wäre stolz.`, "good");
    this.cancelBuild();
    this.persist();
  }

  private takeLoot(it: Parameters<Loot["take"]>[0]) {
    const res = this.loot.take(it, this.elapsed);
    if (res) {
      if (res.food) this.save.food[res.food] = (this.save.food[res.food] ?? 0) + 1;
      else this.save.materials[it.matId] = (this.save.materials[it.matId] ?? 0) + 1;
      if (!this.save.lootTaken.includes(it.key)) this.save.lootTaken.push(it.key);
      audio.confirm();
      store.toast(`+1 ${res.name}`, "good");
      this.persist();
    }
  }

  private openTreasure(id: string) {
    if (this.save.chestsOpened.includes(id)) return;
    this.save.chestsOpened.push(id);
    const tr = this.treasure.find((t) => t.id === id);
    if (tr) {
      this.treasure = this.treasure.filter((t) => t.id !== id);
      tr.obj.rotation.x = -0.2;
    }
    this.save.crystals += 5;
    this.save.materials.segeltuch = (this.save.materials.segeltuch ?? 0) + 1;
    this.save.materials.eimer = (this.save.materials.eimer ?? 0) + 1;
    audio.victory();
    store.toast("Truhe geöffnet: 5 Kristalle, 1 Segeltuch, 1 Eimer. Der Weg hat sich gelohnt.", "good");
    this.persist();
  }

  /** Spielstand-Zugriff für Dialog-Overlay */
  getSave(): SaveGame {
    return this.save;
  }

  /** Zeit für Anzeigen: verbleibende Wirkungen laufen während einer Pause nicht ab. */
  getGameTime(): number {
    return this.frozenAt ?? Date.now();
  }

  // ── Persistenz ───────────────────────────────────────────────────
  private persist(): boolean {
    this.extendFrozenDurations();
    this.save.ship = { x: this.ship.x, z: this.ship.z, heading: this.ship.heading };
    if (this.save.mode === "onfoot") this.save.playerPos = { x: this.player.pos.x, z: this.player.pos.z };
    this.save.timeOfDay = this.save.timeOfDay % 24;
    ensureOpenWorld(this.save).camera = { yaw: this.sailYaw, pitch: this.sailPitch, distance: this.sailDist, room: this.roomView };
    // Unfinished dialogue payments stay provisional across save/reload or exit.
    return persistSave(this.duelEscrow > 0 ? { ...this.save, crystals: this.save.crystals + this.duelEscrow } : this.save);
  }

  // ── Haupt-Loop ───────────────────────────────────────────────────
  private loop = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    const rawDt = this.clock.getDelta();
    const dt = Math.min(rawDt, 0.1);
    if (this.presentation !== null) {
      this.stepper.reset();
      this.simulationWasPaused = true;
      if (this.presentationPaused()) { this.updatePresentationEvidence(); return; }
      this.updateRenderBudget(rawDt, dt);
      this.renderPresentation(dt);
      return;
    }
    if (this.uiLock || document.hidden) {
      this.stepper.reset();
      this.simulationWasPaused = true;
      return;
    }
    this.updateRenderBudget(rawDt, dt);
    if (this.simulationWasPaused) {
      this.simulationWasPaused = false;
      this.stepper.reset();
    } else {
      this.droppedSeconds += Math.max(0, rawDt - 5 / 60);
      this.simulationSteps += this.stepper.advance(rawDt, dt => this.simulate(dt));
      if (rawDt > 0) {
        this.frameTimes.push(rawDt);
        if (this.frameTimes.length > 1800) this.frameTimes.shift();
      }
    }
    this.bloom.enabled = this.qualityLevel < 3;
    const reflEvery = this.qualityLevel < 2 ? 2 : this.qualityLevel === 2 ? 4 : 0;
    if (reflEvery > 0 && this.reflFrame++ % reflEvery === 0)
      this.water.renderReflection(this.renderer, this.scene, this.camera);
    this.composer.render();
    this.presentationFrame++;
    this.updatePresentationEvidence();
  };

  private simulate(dt: number) {
    const state = ensureOpenWorld(this.save);
    stepOpenWorld(state, dt);
    const t = this.elapsed = state.seconds;
    this.save.timeOfDay = state.timeOfDay;
    const localPosition = this.save.mode === "sailing" ? this.ship : this.player.pos;
    const field = sampleFields(state, localPosition.x, localPosition.z);
    this.storm = field.storm;
    this.water.setEnvironment(this.storm, field.tide);
    audio.setStormIntensity(this.storm, field.windSpeed, field.soundMask);

    // Fokus & Modi
    const sailing = this.save.mode === "sailing";
    const focus = sailing ? this.ship.group.position : this.player.pos;
    this.computePrompt();

    if (sailing) {
      const fwd = (this.keys.has("w") || this.keys.has("arrowup") ? 1 : 0) - (this.keys.has("s") || this.keys.has("arrowdown") ? 0.55 : 0);
      const turn = (this.keys.has("a") || this.keys.has("arrowleft") ? 1 : 0) - (this.keys.has("d") || this.keys.has("arrowright") ? 1 : 0);
      if (fwd || turn) {
        this.roomView = null;
        this.ship.moored = false;
      }
      this.ship.sailDt(
        dt,
        t,
        { forward: fwd, turn, turbo: this.keys.has("shift") },
        this.save.shipSpeedLevel,
        this.particles,
        (x, z) => this.water.heightAt(x, z, t),
        field,
      );
      // Treibholz einsammeln
      const got = this.props.collectDriftwood(this.ship.x, this.ship.z, 7.5, this.elapsed);
      if (got > 0) {
        this.save.wood += got;
        this.save.driftwood += got;
        audio.confirm();
        store.toast(`+${got} Treibholz`, "good");
      }
      this.updateSailCamera(dt);
    } else {
      const locked = this.uiLock;
      let input = locked
        ? { x: 0, z: 0, sprint: false, jump: false }
        : {
            x: (this.keys.has("d") || this.keys.has("arrowright") ? 1 : 0) - (this.keys.has("a") || this.keys.has("arrowleft") ? 1 : 0),
            z: (this.keys.has("w") || this.keys.has("arrowup") ? 1 : 0) - (this.keys.has("s") || this.keys.has("arrowdown") ? 1 : 0),
            sprint: this.keys.has("shift"),
            jump: this.keys.has(" "),
          };

      // Floß-Modus: Wer auf einem Floß steht und W drückt, paddelt statt zu laufen
      const raft = this.structures.raftUnder(this.player.pos.x, this.player.pos.z);
      const paddling = !!(raft && input.z > 0 && !locked);
      if (paddling) input = { x: 0, z: 0, sprint: false, jump: false };

      // Ausdauer-Gate: Sprint nur, wenn Ausdauer vorhanden (Klettern entleert via drain)
      const pl = this.save.player;
      if (input.sprint && pl.stamina <= 0.5) input.sprint = false;

      this.player.update(dt, input, (x, z) => this.groundAt(x, z), this.props.colliders, this.particles, {
        walls: CLIMB_WALLS,
        drain: (perSecond, ddt) => {
          this.staminaDelay = 0.9;
          pl.stamina = Math.max(0, pl.stamina - perSecond * ddt);
          return pl.stamina > 0;
        },
      });

      // Ausdauer-Buchhaltung: Sprint kostet, Stillstand/Gehen regeneriert
      // (Essens-Wirkung „Energie" verstärkt, Zucker-Crash schwächt die Regeneration)
      const nowMs0 = Date.now();
      const eBonus = mealBonus(this.save.activeMeals, "energie", nowMs0);
      if (this.player.climbing) {
        // drain läuft bereits über den Kletter-Kontext
      } else if (input.sprint && this.player.speed2D > 3 && !paddling) {
        this.staminaDelay = 0.9;
        pl.stamina = Math.max(0, pl.stamina - 4.5 * dt);
      } else {
        this.staminaDelay = Math.max(0, this.staminaDelay - dt);
        if (this.staminaDelay <= 0)
          pl.stamina = Math.min(pl.maxStamina, pl.stamina + 6.5 * (1 + eBonus) * dt);
      }

      // Bau-Geist folgt dem Spieler
      if (this.buildSession) this.updateBuildGhost();

      if (paddling && raft) {
        const dirX = Math.sin(this.player.camYaw + Math.PI);
        const dirZ = Math.cos(this.player.camYaw + Math.PI);
        const moved = this.structures.updateRafts(dt, t, (x, z) => this.water.heightAt(x, z, t), {
          active: true,
          dirX,
          dirZ,
          rec: raft,
        });
        // Spieler bleibt auf dem Deck
        this.player.pos.x = raft.def.x + Math.sin(this.player.camYaw) * -0.3;
        this.player.pos.z = raft.def.z + Math.cos(this.player.camYaw) * -0.3;
        this.player.pos.y = raft.deckY + 0.42;
        if (moved.movedX !== 0 || moved.movedZ !== 0) {
          this.player.facing = Math.atan2(dirX, dirZ);
          if (Math.random() < dt * 0.5) this.save.structures = this.structures.toSave();
        }
      } else {
        this.structures.updateRafts(dt, t, (x, z) => this.water.heightAt(x, z, t), { active: false, dirX: 0, dirZ: 0, rec: null });
      }
      // Geräte (M3): Ventilator-Schub, Aufzug-Fahrt — der Spieler fährt mit
      const dev = this.structures.updateDevices(dt, t, this.player.pos, (fx, fz) => {
        // Schub: Impuls plus sanfte Verdrängung (Reibung frisst reine Geschwindigkeit)
        this.player.vel.x += fx * 2.0;
        this.player.vel.z += fz * 2.0;
        const nx = this.player.pos.x + fx * 0.5;
        const nz = this.player.pos.z + fz * 0.5;
        const gHere = this.groundAt(this.player.pos.x, this.player.pos.z);
        const gNext = this.groundAt(nx, nz);
        if (gNext > -0.55 && gNext - gHere < 1.2) {
          this.player.pos.x = nx;
          this.player.pos.z = nz;
        }
      });
      if (dev.riding) {
        this.player.pos.y = dev.riding.deckY + 0.12;
        this.player.vel.y = 0;
        this.player.grounded = true;
      }
      this.player.hasGlider = this.save.equipment.includes("gleitschirm");
      this.loot.update(t, this.elapsed, this.camera.position);

      // Begegnungs-Kamera: rahmt Spieler und Wächter
      const battleId = store.get().battlePhen;
      const bc = battleId ? this.creatures.get(battleId) : null;
      if (bc) {
        const cp = bc.group.position;
        const mid = new THREE.Vector3().addVectors(this.player.pos, cp).multiplyScalar(0.5);
        const dx = cp.x - this.player.pos.x;
        const dz = cp.z - this.player.pos.z;
        const perp = new THREE.Vector3(-dz, 0, dx).normalize();
        const want = mid.clone().addScaledVector(perp, 19).add(new THREE.Vector3(0, 6.5, 0));
        const g = this.groundAt(want.x, want.z) + 0.6;
        if (want.y < g) want.y = g;
        const k = 1 - Math.pow(0.02, dt);
        this.camera.position.lerp(want, k);
        this.camera.lookAt(mid.x, mid.y + 4.6, mid.z);
      } else {
        this.player.updateCamera(this.camera, dt, (x, z) => this.groundAt(x, z));
      }
      // Schiff wiegt vertäut sanft
      const wy = this.water.heightAt(this.ship.x, this.ship.z, t);
      this.ship.group.position.y = wy * 0.8 + 0.35;
      this.ship.group.rotation.z = Math.sin(t * 0.8) * 0.02;

      // Gegner
      this.attackCooldown = Math.max(0, this.attackCooldown - dt);
      const enemyList = this.uiLock || !store.get().combatEnabled ? [] : this.enemies;
      for (const e of this.enemies) {
        // Sichtbarkeit strikt nach Distanz (Render-Last)
        const rvx = e.x - focus.x;
        const rvz = e.z - focus.z;
        const vis = !e.dead && rvx * rvx + rvz * rvz <= 260 * 260;
        if (e.group.visible !== vis) e.group.visible = vis;
      }
      for (const e of enemyList) {
        const ddx = e.x - this.player.pos.x;
        const ddz = e.z - this.player.pos.z;
        const d2 = ddx * ddx + ddz * ddz;
        if (d2 > 120 * 120 && !e.dead) continue; // ferne Gegner ruhen
        const dmg = e.update(dt, t, this.player.pos.x, this.player.pos.z, this.player.dodgeT > 0, this.particles);
        if (dmg > 0 && !store.get().dead) {
          this.save.player.stability -= dmg;
          audio.playerHit();
          this.player.hurt();
          store.set({ damageFlash: 1 });
          if (this.save.player.stability <= 0) {
            this.save.player.stability = 0;
            this.playerDied();
          }
        }
      }
    }

    // Welt-Module
    const sunDir = sunDirection(this.save.timeOfDay, new THREE.Vector3());
    const pal = paletteFor(this.save.timeOfDay, this.storm);
    this.sky.update(t, this.save.timeOfDay, this.storm, this.camera.position, focus);
    if (this.scene.fog instanceof THREE.Fog) this.scene.fog.far = field.visibility;
    this.water.update(
      t,
      this.camera.position,
      this.storm,
      sunDir,
      pal.sunColor,
      pal.zenith,
      pal.horizon,
      pal.night,
      this.scene.fog as THREE.Fog,
    );
    this.props.update(t, dt, this.elapsed, this.particles, (x, z) => this.water.heightAt(x, z, t), this.camera.position);
    this.particles.update(dt);

    // Phänomen-Wächter
    for (const c of this.creatures.values()) {
      if (c.dead) continue;
      const dx = c.group.position.x - focus.x;
      const dz = c.group.position.z - focus.z;
      const near = dx * dx + dz * dz <= 380 * 380;
      if (c.group.visible !== near) c.group.visible = near;
      if (!near) continue;
      if (!this.uiLock && this.save.mode === "onfoot" && !c.dead) {
        const stIsl = this.save.islands.find((i) => i.id === c.def.id);
        const pd = Math.hypot(c.group.position.x - this.player.pos.x, c.group.position.z - this.player.pos.z);
        if (pd < 45 && !stIsl?.overcome) c.lookAt(this.player.pos.clone());
        else if (store.get().battlePhen !== c.def.id) c.lookAt(null);
      }
      c.update(t, dt, this.particles);
    }

    // NPCs & Lore-Steine
    this.npcs.update(dt, this.player.pos, this.uiLock);
    this.loreStones.update(t, this.camera.position);

    // Echo-Orb schwebt
    if (this.echoOrb) {
      this.echoOrb.rotation.y = t * 1.2;
      this.echoOrb.position.y += Math.sin(t * 2.1) * 0.15 * dt;
    }

    // Beacon & Kompass
    const target = this.compassTarget();
    const ty = Math.max(terrainHeight(target.x, target.z), 0);
    this.beacon.setTarget(target.x, target.z, ty);
    this.beacon.update(t);
    const distT = Math.hypot(target.x - focus.x, target.z - focus.z);
    this.beacon.group.visible = distT > 120;

    // HUD (10 Hz)
    this.hudTimer += dt;
    if (this.hudTimer > 0.1) {
      this.hudTimer = 0;
      const camYaw = sailing ? this.sailYaw : this.player.camYaw;
      const bearing = Math.atan2(target.x - focus.x, -(target.z - focus.z));
      store.set({
        stability: this.save.player.stability,
        maxStability: this.save.player.maxStability,
        presence: this.save.player.presence,
        maxPresence: this.save.player.maxPresence,
        stamina: this.save.player.stamina,
        maxStamina: this.save.player.maxStamina,
        level: this.save.player.level,
        wood: this.save.wood,
        crystals: this.save.crystals,
        weaponLevel: this.save.weaponLevel,
        prompt: this.currentPrompt ? this.currentPrompt.text : null,
        promptKey: this.currentPrompt ? this.currentPrompt.key : null,
        compassYaw: camYaw,
        targetName: target.name,
        targetBearing: bearing,
        targetDist: Math.round(distT),
        timeOfDay: this.save.timeOfDay,
        storm: this.storm,
        glutenFree: this.save.glutenFree,
        fps: Math.round(this.fpsEma),
        fireBuffUntil: this.fireBuffUntil,
        damageFlash: Math.max(0, store.get().damageFlash - 0.34),
        meals: this.save.activeMeals.map((m) => {
          const nowMs = Date.now();
          const crashing = m.expiresAt <= nowMs && m.crashExpiresAt !== undefined && nowMs < m.crashExpiresAt;
          return {
            name: m.name,
            kind: m.kind,
            secondsLeft: Math.max(0, Math.round(((crashing ? m.crashExpiresAt! : m.expiresAt) - nowMs) / 1000)),
            crash: crashing,
          };
        }),
      });
    }

    // Essens-Wirkungen (M3): passive Regeneration durch Mahlzeiten —
    // Konzentration → Präsenz, Regulation → Stabilität (modest, max. %/s)
    {
      const nowMs = Date.now();
      this.save.activeMeals = pruneMeals(this.save.activeMeals, nowMs);
      if (this.save.activeMeals.length) {
        const p = this.save.player;
        const konz = mealBonus(this.save.activeMeals, "konzentration", nowMs);
        if (konz > 0) p.presence = Math.min(p.maxPresence, p.presence + p.maxPresence * konz * 0.02 * dt);
        const regu = mealBonus(this.save.activeMeals, "regulation", nowMs);
        if (regu > 0) p.stability = Math.min(p.maxStability, p.stability + p.maxStability * regu * 0.02 * dt);
      }
    }

    // Autosave
    this.saveTimer += dt;
    if (this.saveTimer > 12) {
      this.saveTimer = 0;
      this.persist();
    }

    this.updateClouds(dt, focus);
    this.rooms.update(state, t, (x, z, time) => this.water.heightAt(x, z, time));
    const nearby = [...ROOMS].sort((a,b) => Math.hypot(focus.x-a.x, focus.z-a.z) - Math.hypot(focus.x-b.x, focus.z-b.z)).find(room => Math.hypot(focus.x - room.x, focus.z - room.z) < 190)?.id ?? null;
    if (state.activeRoom !== nearby) {
      state.activeRoom = nearby;
      store.set({ activeRoom: nearby, openWorldRevision: store.get().openWorldRevision + 1 });
    }
  }

  private createClouds() {
    const keys = ["cloudBig", "cloudSmall"] as const;
    for (let i = 0; i < 16; i++) {
      const key = keys[i % 2];
      const { geometry, materials } = extractMerged(key);
      const mat = materials[0] as THREE.MeshStandardMaterial;
      mat.transparent = true;
      mat.opacity = 0.88;
      mat.fog = true;
      const mesh = new THREE.Mesh(geometry, mat);
      const a = Math.random() * Math.PI * 2;
      const r = 250 + Math.random() * 900;
      mesh.position.set(Math.cos(a) * r, 130 + Math.random() * 110, Math.sin(a) * r);
      const s = 18 + Math.random() * 26;
      mesh.scale.setScalar(s / 10);
      mesh.rotation.y = Math.random() * Math.PI;
      this.clouds.push({ mesh, speed: 2.2 + Math.random() * 2.4 });
      this.scene.add(mesh);
    }
  }

  private updateClouds(dt: number, focus: THREE.Vector3) {
    for (const c of this.clouds) {
      c.mesh.position.x += c.speed * dt;
      // um den Fokus herum kreisen lassen
      if (c.mesh.position.x - focus.x > 1100) c.mesh.position.x = focus.x - 1100;
      if (focus.x - c.mesh.position.x > 1100) c.mesh.position.x = focus.x + 1100;
      if (c.mesh.position.z - focus.z > 1100) c.mesh.position.z = focus.z - 1100;
      if (focus.z - c.mesh.position.z > 1100) c.mesh.position.z = focus.z + 1100;
    }
  };

  private updateRenderBudget(rawDt: number, dt: number): void {
    // Die Messung nutzt echte Frame-Zeit; nur die Simulation wird gekappt.
    if (rawDt >= 0.001) {
      const fps = 1 / Math.max(rawDt, 0.0001);
      this.presentationFps = fps;
      this.fpsEma = lerp(this.fpsEma, fps, 0.05);
    }
    this.qualityTimer += dt;
    if (this.qualityTimer > 4) {
      this.qualityTimer = 0;
      // Kimi: Unter anhaltender Last blieb die EMA über 44 hängen. Frühere
      // Absenkung und getrennte Rückkehrschwelle vermeiden das Pendeln.
      if (this.fpsEma < 52 && this.qualityLevel < 3) {
        this.qualityLevel++;
        this.applyQuality();
      } else if (this.fpsEma > 58.5 && this.qualityLevel > 0) {
        this.qualityLevel--;
        this.applyQuality();
      }
    }
  }

  private applyQuality() {
    // Remote a54593e: Schatten bleiben, ihre Auflösung sinkt mit dem Budget.
    const sunShadow = this.sky.sun.shadow;
    const setShadowRes = (px: number) => {
      if (sunShadow.mapSize.x !== px) {
        sunShadow.mapSize.set(px, px);
        sunShadow.map?.dispose();
        sunShadow.map = null;
      }
    };
    switch (this.qualityLevel) {
      case 0:
        this.composer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
        this.water.setHighQuality(true);
        this.water.setReflection(true);
        setShadowRes(2048);
        this.renderer.shadowMap.enabled = true;
        break;
      case 1:
        this.composer.setPixelRatio(1.25);
        this.water.setHighQuality(true);
        this.water.setReflection(true);
        setShadowRes(1536);
        this.renderer.shadowMap.enabled = true;
        break;
      case 2:
        this.composer.setPixelRatio(1);
        this.water.setHighQuality(false);
        this.water.setReflection(true);
        setShadowRes(1024);
        this.renderer.shadowMap.enabled = true;
        break;
      case 3:
        this.composer.setPixelRatio(0.85);
        this.water.setHighQuality(false);
        this.water.setReflection(false);
        setShadowRes(512);
        this.renderer.shadowMap.enabled = true;
        break;
    }
  }

  private updateSailCamera(dt: number) {
    if (this.roomView) {
      const room = ROOMS.find(r => r.id === this.roomView)!;
      const y = Math.max(2, terrainHeight(room.x, room.z) + 2);
      const viewpoint = room.id === "bay" ? (this.getOpenWorldState().bay.viewpoint === "offset" ? 40 : 0) : 30;
      const yaw = this.sailYaw + viewpoint * Math.PI / 180;
      const radius = this.sailDist * 3.2;
      const want = new THREE.Vector3(
        room.x + Math.sin(yaw) * Math.cos(this.sailPitch) * radius,
        y + Math.sin(this.sailPitch) * radius,
        room.z + Math.cos(yaw) * Math.cos(this.sailPitch) * radius,
      );
      this.camera.position.lerp(want, 1 - Math.pow(0.001, dt));
      this.camera.lookAt(room.x, y, room.z);
      return;
    }
    const cp = Math.cos(this.sailPitch);
    const sp = Math.sin(this.sailPitch);
    const want = new THREE.Vector3(
      this.ship.x + Math.sin(this.sailYaw) * cp * this.sailDist,
      this.ship.group.position.y + 3.5 + sp * this.sailDist,
      this.ship.z + Math.cos(this.sailYaw) * cp * this.sailDist,
    );
    want.y = Math.max(want.y, 2.2);
    const k = 1 - Math.pow(0.001, dt);
    this.camera.position.lerp(want, k);
    this.camera.lookAt(this.ship.x, this.ship.group.position.y + 4.5, this.ship.z);
  }

  saveMode(): "sailing" | "onfoot" {
    return this.save.mode === "onfoot" ? "onfoot" : "sailing";
  }

  /** Für Overlays (Dialog-Aktionen verändern den Spielstand) */
  persistPublic(): boolean {
    return this.persist();
  }

  /** Öffentlich: Menü-Button „Speichern“ */
  saveNow(): boolean {
    return this.persist();
  }

  checkpoint(): boolean {
    return this.saveNow();
  }

  getOpenWorldState() { return ensureOpenWorld(this.save); }

  travelToRoom(id: RoomId): void {
    if (this.uiLock) return;
    const room = ROOMS.find(r => r.id === id);
    if (!room) return;
    this.save.mode = "sailing";
    this.player.group.visible = false;
    this.ship.moored = true;
    this.ship.speed = 0;
    this.ship.setPose(room.arrivalX, room.arrivalZ, Math.atan2(room.arrivalX - room.x, room.arrivalZ - room.z));
    this.roomView = id;
    this.sailYaw = 0;
    this.getOpenWorldState().activeRoom = id;
    this.updateSailCamera(1);
    store.set({ mode: "sailing", activeRoom: id, openWorldRevision: store.get().openWorldRevision + 1 });
    this.persist();
  }

  actInRoom(room: RoomId, action: string): string {
    if (this.uiLock) return "Die Welt ist gerade angehalten.";
    if (!action.startsWith("weather:") && !action.startsWith("time:") && this.getOpenWorldState().activeRoom !== room) return "Fahre zuerst zu diesem Ort.";
    const result = applyWorldAction(this.getOpenWorldState(), room, action);
    this.rooms.update(this.getOpenWorldState(), this.elapsed, (x,z,t) => this.water.heightAt(x,z,t));
    store.set({ openWorldRevision: store.get().openWorldRevision + 1 });
    this.persist();
    return result;
  }

  recordObservation(room: RoomId, interpretation?: string, question?: string): string {
    if (this.uiLock || this.getOpenWorldState().activeRoom !== room) return "";
    const id = addObservation(this.getOpenWorldState(), room, interpretation, question);
    this.persist();
    store.set({ openWorldRevision: store.get().openWorldRevision + 1 });
    return id;
  }

  reviseObservation(id: string, text: string): void {
    if (this.uiLock) return;
    reviseObservation(this.getOpenWorldState(), id, text);
    this.persist();
    store.set({ openWorldRevision: store.get().openWorldRevision + 1 });
  }

  exportSave(): string {
    this.checkpoint(); // Export also preserves the in-memory state if local storage is blocked.
    return JSON.stringify(this.save, null, 2);
  }

  getDiagnostics() {
    const sorted = [...this.frameTimes].sort((a,b) => a-b);
    const sum = this.frameTimes.reduce((a,b) => a+b, 0);
    const size = this.renderer.getSize(new THREE.Vector2());
    return { samples: sorted.length, windowSeconds: sum, meanFps: sum ? sorted.length / sum : 0,
      p95FrameMs: (sorted[Math.max(0, Math.ceil(sorted.length * .95) - 1)] ?? 0) * 1000,
      framesOver33ms: sorted.filter(t => t > .033).length,
      quality: this.qualityLevel, pixelRatio: this.renderer.getPixelRatio(), resolution: `${size.x} × ${size.y}`,
      steps: this.simulationSteps, droppedSeconds: this.droppedSeconds,
      geometries: this.renderer.info.memory.geometries, textures: this.renderer.info.memory.textures,
      calls: this.renderer.info.render.calls };
  }

  /** Kompatibilität mit vorhandener optionaler Strandbegegnung. */
  completeStrandEncounter(nodeId: string) {
    const node = NODE_BY_ID.get(nodeId);
    if (!node) return;
    if (!this.save.graph.met.includes(nodeId)) this.save.graph.met.push(nodeId);
    if (!this.save.graph.understood.includes(nodeId)) this.save.graph.understood.push(nodeId);
    this.persist();
    store.set({ encounterId: null });
    store.toast(`Begegnung mit ${node.name} im Register bewahrt.`);
  }

  get canvasElement() {
    return this.renderer.domElement;
  }

  dispose(persistState = true) {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.releaseInput();
    this.unsubscribeStore?.();
    if (persistState) {
      audio.setPaused(true);
      this.persist();
    }
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("wheel", this.onWheel);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("blur", this.onBlur);
    window.removeEventListener("focusin", this.releaseGameInput);
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    for (const object of this.presentationObjects) {
      this.scene.remove(object);
      // Das Modell teilt Quellen-Materialien; nur eigene Preview-Geometrie freigeben.
      if (object === this.presentationShip?.group) continue;
      object.traverse((node) => {
        if (node instanceof THREE.Mesh || node instanceof THREE.Points) {
          node.geometry.dispose();
          const materials = Array.isArray(node.material) ? node.material : [node.material];
          for (const material of materials) material.dispose();
        }
      });
    }
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) this.container.removeChild(this.renderer.domElement);
  }
}
