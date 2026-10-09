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
import { clamp, lerp, mulberry32, fbm2 } from "../game/noise";
import { HARBOR, ISLANDS, islandAt, terrainHeight, terrainSlope } from "../game/worldLayout";
import { persistSave, grantXp, checkFinalUnlock, type SaveGame, type PlayerState } from "../game/state";
import { Npcs } from "./npcs";
import { Loot } from "./loot";
import { Structures, buildFloss, buildLeiter, buildBruecke, clampSpan } from "./structures";
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
import { preloadAll, extractMerged, getModel, setShadows } from "./assets";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

const DAY_LENGTH_S = 1080; // 18 Minuten = 1 Spieltag

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
  private container: HTMLElement;

  private keys = new Set<string>();
  private clock = new THREE.Clock();
  private raf = 0;
  private elapsed = 0;
  private disposed = false;

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
  private qualityLevel = 0; // 0 = voll, 1 = PR 1.25, 2 = PR 1 + Wasser lo, 3 = Schatten aus
  private reflFrame = 0; // Zähler für 30-Hz-Spiegelpass
  private qualityTimer = 0;

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

  static async create(container: HTMLElement, save: SaveGame): Promise<GameWorld> {
    await preloadAll();
    return new GameWorld(container, save);
  }

  constructor(container: HTMLElement, save: SaveGame) {
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
    this.ship = new Ship(this.scene);
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
    } else {
      save.mode = "sailing";
    }
    this.sailYaw = save.ship.heading;

    this.bindInput();
    store.set({ mode: save.mode === "onfoot" ? "onfoot" : "sailing" });

    // Start-Kamera
    if (this.save.mode === "sailing") this.snapSailCamera();
    else this.player.snapCamera(this.camera, (x, z) => this.groundAt(x, z));

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
    return !!(st.menuOpen || st.dead || st.dialogNpc || st.battlePhen || st.journalOpen || st.loreStone || st.chatOpen || st.cookOpen);
  }

  // ── Eingaben ─────────────────────────────────────────────────────
  private onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) return;
    const k = e.key.toLowerCase();
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
    if (k === "escape") {
      const st = store.get();
      if (this.buildSession) {
        this.cancelBuild();
      } else if (st.chatOpen) {
        store.set({ chatOpen: false });
      } else if (st.cookOpen) {
        store.set({ cookOpen: false });
      } else if (st.journalOpen || st.dialogNpc || st.loreStone) {
        store.set({ journalOpen: false, dialogNpc: null, loreStone: null });
      } else if (!st.battlePhen) {
        store.set({ menuOpen: !st.menuOpen });
      }
    }
    if (k === "k") this.tryCookOpen();
  };
  private onKeyUp = (e: KeyboardEvent) => this.keys.delete(e.key.toLowerCase());

  private onMouseMove = (e: MouseEvent) => {
    if (document.pointerLockElement !== this.renderer.domElement) return;
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
    if (store.get().menuOpen || store.get().dead) return;
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
          if (islHere.id === "sturmherd" && !this.save.finalUnlocked) {
            this.currentPrompt = {
              key: "E",
              text: "Das Auge bleibt verschlossen — zwölf Inseln warten noch",
              action: () => store.toast("Der Sturmherd öffnet sich erst, wenn alle zwölf Phänomene überwunden sind.", "info"),
            };
            return;
          }
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
    if (this.save.mode !== "onfoot" || this.attackCooldown > 0 || this.uiLock) return;
    this.attackCooldown = 0.42;
    this.player.swing();
    audio.select();
    // Trefferprüfung nach kurzer Verzögerung (Schwung)
    window.setTimeout(() => {
      if (this.disposed || this.save.mode !== "onfoot") return;
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
    this.dropEcho();
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
    let bx = HARBOR.x;
    let bz = HARBOR.z;
    let best: { x: number; z: number; name: string } | null = null;
    let bd = Infinity;
    const px = this.save.mode === "onfoot" ? this.player.pos.x : this.ship.x;
    const pz = this.save.mode === "onfoot" ? this.player.pos.z : this.ship.z;
    for (const isl of ISLANDS) {
      const st = this.save.islands.find((i) => i.id === isl.id);
      if (st?.overcome) continue;
      if (isl.id === "sturmherd" && !this.save.finalUnlocked) continue;
      const d = (isl.x - px) ** 2 + (isl.z - pz) ** 2;
      if (d < bd) {
        bd = d;
        const phen = PHENOMENA.find((p) => p.id === isl.id);
        best = { x: isl.x, z: isl.z, name: phen ? phen.name : isl.id };
        bx = isl.x;
        bz = isl.z;
      }
    }
    if (!best) {
      best = { x: bx, z: bz, name: "Ankerplatz" };
    }
    return best;
  }

  // ── Begegnungen, Dialoge, Lore, Echo ────────────────────────────
  startEncounter(islandId: string) {
    const c = this.creatures.get(islandId);
    if (!c || c.dead) return;
    c.lookAt(this.player.pos.clone());
    c.setAgitation(0.95);
    if (document.pointerLockElement) document.exitPointerLock();
    audio.understand();
    store.set({ battlePhen: islandId });
  }

  creatureHook(action: "hit" | "attack" | "dissolve", peace?: number) {
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
    this.save.player = player;
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
      this.dropEcho();
      this.respawn();
    }
    store.set({ battlePhen: null });
    this.persist();
  }

  openDialog(npcId: string) {
    const mem = this.save.npcMemory[npcId] ?? { met: false, topics: [], favors: 0 };
    mem.met = true;
    this.save.npcMemory[npcId] = mem;
    if (document.pointerLockElement) document.exitPointerLock();
    audio.select();
    store.set({ dialogNpc: npcId });
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

  private dropEcho() {
    const lost = this.save.crystals;
    if (lost > 0) {
      this.save.echoDrop = { x: this.player.pos.x, z: this.player.pos.z, crystals: lost };
      this.save.crystals = 0;
      this.spawnEchoOrb(this.player.pos.x, this.player.pos.z);
      store.toast("Dein Echo bleibt zurück — du kannst es holen, wann immer du willst. Oder nie. Beides gehört dir.", "info");
    }
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
    this.cancelBuild();
    let ghost: THREE.Object3D;
    if (def.id === "floss") ghost = buildFloss();
    else if (def.id === "leiter") ghost = buildLeiter({ id: "ghost", type: "leiter", x: 0, z: 0, yaw: 0 });
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
      type: b.def.id as "floss" | "leiter" | "bruecke",
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

  // ── Persistenz ───────────────────────────────────────────────────
  private persist() {
    this.save.ship = { x: this.ship.x, z: this.ship.z, heading: this.ship.heading };
    if (this.save.mode === "onfoot") this.save.playerPos = { x: this.player.pos.x, z: this.player.pos.z };
    this.save.timeOfDay = this.save.timeOfDay % 24;
    persistSave(this.save);
  }

  // ── Haupt-Loop ───────────────────────────────────────────────────
  private loop = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = (this.elapsed += dt);

    // FPS & adaptives Budget
    const fps = 1 / Math.max(dt, 0.0001);
    this.fpsEma = lerp(this.fpsEma, fps, 0.05);
    this.qualityTimer += dt;
    if (this.qualityTimer > 4) {
      this.qualityTimer = 0;
      if (this.fpsEma < 44 && this.qualityLevel < 3) {
        this.qualityLevel++;
        this.applyQuality();
      } else if (this.fpsEma > 57 && this.qualityLevel > 0) {
        this.qualityLevel--;
        this.applyQuality();
      }
    }

    // Tageszeit & Wetter
    this.save.timeOfDay = (this.save.timeOfDay + (dt / DAY_LENGTH_S) * 24) % 24;
    const weatherNoise = fbm2(t * 0.008, 3.7, 2, 55) * 0.5 + 0.5;
    this.storm = lerp(this.storm, clamp((weatherNoise - 0.55) * 2.4, 0, 1), dt * 0.3);
    audio.setStormIntensity(this.storm);

    // Fokus & Modi
    const sailing = this.save.mode === "sailing";
    const focus = sailing ? this.ship.group.position : this.player.pos;
    this.computePrompt();

    if (sailing) {
      const fwd = (this.keys.has("w") || this.keys.has("arrowup") ? 1 : 0) - (this.keys.has("s") || this.keys.has("arrowdown") ? 0.55 : 0);
      const turn = (this.keys.has("a") || this.keys.has("arrowleft") ? 1 : 0) - (this.keys.has("d") || this.keys.has("arrowright") ? 1 : 0);
      this.ship.sailDt(
        dt,
        t,
        { forward: fwd, turn, turbo: this.keys.has("shift") },
        this.save.shipSpeedLevel,
        this.particles,
        (x, z) => this.water.heightAt(x, z, t),
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
      const enemyList = this.uiLock ? [] : this.enemies;
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
    this.bloom.enabled = this.qualityLevel < 3;
    // Planare Wasser-Reflexion (Qualität Hoch): Spiegel-Pass vor dem Hauptbild,
    // jeden 2. Frame — Wellen bewegen sich langsam genug für 30 Hz-Spiegel
    if (this.qualityLevel < 2 && (this.reflFrame++ & 1) === 0)
      this.water.renderReflection(this.renderer, this.scene, this.camera);
    this.composer.render();
  };

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

  private applyQuality() {
    switch (this.qualityLevel) {
      case 0:
        this.composer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
        this.water.setHighQuality(true);
        this.renderer.shadowMap.enabled = true;
        break;
      case 1:
        this.composer.setPixelRatio(1.25);
        break;
      case 2:
        this.composer.setPixelRatio(1);
        this.water.setHighQuality(false);
        break;
      case 3:
        this.renderer.shadowMap.enabled = false;
        this.composer.setPixelRatio(0.85);
        break;
    }
  }

  private updateSailCamera(dt: number) {
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
  persistPublic() {
    this.persist();
  }

  /** Öffentlich: Menü-Button „Speichern“ */
  saveNow() {
    this.persist();
  }

  get canvasElement() {
    return this.renderer.domElement;
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.persist();
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("wheel", this.onWheel);
    window.removeEventListener("resize", this.onResize);
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
