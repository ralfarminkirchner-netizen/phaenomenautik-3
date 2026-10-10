// Bestehende 3D-Welt mit einer in jedem Zustand erreichbaren Schutzleiste.
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { HUD } from "./ui/HUD";
import { TitleScreen } from "./ui/TitleScreen";
import { BattleOverlay } from "./ui/BattleOverlay";
import { DialogOverlay } from "./ui/DialogOverlay";
import { JournalOverlay, LoreOverlay } from "./ui/JournalOverlay";
import { ChatOverlay } from "./ui/ChatOverlay";
import { CookOverlay } from "./ui/CookOverlay";
import { DuelOverlay } from "./ui/DuelOverlay";
import { Protection } from "./ui/Protection";
import { GentleEncounter } from "./ui/GentleEncounter";
import { OpenWorldPanel } from "./ui/OpenWorldPanel";
import { SurfaceBoundary } from "./ui/SurfaceBoundary";
import { loadSave, newGame, persistSave, parseImportedSave, hasUnreadableSave, type SaveGame } from "./game/state";
import { startWorld, stopWorld, getWorld } from "./game/runtime";
import { store, initialHud } from "./game/store";
import { audio } from "./game/audio";
import "./ui/protection.css";

type Phase = "title" | "loading" | "game" | "error";

export default function App() {
  const [entry] = useState(() => {
    const saved = loadSave();
    const requested = new URLSearchParams(location.search).get("encounter") === "flimmerbucht-r1";
    const resume = requested && Boolean(saved?.openWorld) && !hasUnreadableSave();
    return { saved, resume, encounter: requested && !resume && !hasUnreadableSave() ? saved || newGame() : null };
  });
  const [phase, setPhase] = useState<Phase>("title");
  const [hasSave, setHasSave] = useState(Boolean(entry.encounter || entry.saved));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [encounterSave, setEncounterSave] = useState<SaveGame | null>(entry.encounter || entry.saved);
  const [surfaceEpoch, setSurfaceEpoch] = useState(0);
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneEpoch, setSceneEpoch] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const saveRef = useRef<SaveGame | null>(entry.encounter || entry.saved);
  const previewRef = useRef<SaveGame>(entry.encounter || entry.saved || newGame());
  const resumeEntryRef = useRef(entry.resume);
  const generation = useRef(0);
  const h = useSyncExternalStore(cb => store.subscribe(cb), () => store.get());
  const presentEncounter = useCallback((mode: Parameters<NonNullable<ReturnType<typeof getWorld>>["setPresentation"]>[0]) => getWorld()?.setPresentation(mode), []);

  useEffect(() => {
    if (entry.encounter) store.set({ explorationOpen: true });
    const visibility = () => { if (document.hidden) store.set({ paused: true, protectionOpen: "pause" }); };
    const pagehide = () => { if (saveRef.current) getWorld()?.checkpoint(); };
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", pagehide);
    return () => { document.removeEventListener("visibilitychange", visibility); window.removeEventListener("pagehide", pagehide); };
  }, [entry]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let active = true;
    const resume = resumeEntryRef.current;
    void startWorld(container, saveRef.current || previewRef.current, resume ? null : entry.encounter ? "arrival" : "title").then(world => {
      if (!active) return;
      const encounter = store.get().explorationOpen;
      world.setPresentation(encounter ? (saveRef.current?.gentleEncounter?.choice || "arrival") : resume ? null : "title");
      resumeEntryRef.current = false;
      if (resume) { store.set({ mode: world.saveMode(), paused: false, protectionOpen: null }); setPhase("game"); }
      setSceneReady(true);
    }).catch((error: unknown) => {
      if (!active || (error instanceof Error && error.name === "AbortError")) return;
      setLoadError("Die Spielwelt konnte nicht geöffnet werden. Dein bisheriger Spielstand bleibt erhalten.");
      setPhase("error");
    });
    return () => { active = false; if (saveRef.current) getWorld()?.checkpoint(); stopWorld(false); };
  }, [entry, sceneEpoch]);

  const begin = (save: SaveGame) => {
    if (hasUnreadableSave() && save !== saveRef.current) { store.set({ paused: true, protectionOpen: "pause" }); return; }
    if (getWorld()?.getSave() !== save) { stopWorld(false); setSceneReady(false); }
    saveRef.current = save;
    setHasSave(true);
    setEncounterSave(save);
    setLoadError(null);
    store.set({ explorationOpen: false, paused: false, protectionOpen: null });
    setPhase("loading");
  };

  useEffect(() => {
    if (phase !== "loading" || !containerRef.current || !saveRef.current) return;
    const token = ++generation.current;
    let active = true;
    const id = window.setTimeout(() => {
      const container = containerRef.current;
      const save = saveRef.current;
      if (!container || !save) return;
      void startWorld(container, save).then(w => {
        if (!active || generation.current !== token) return;
        const current = store.get();
        w.setPresentation(current.explorationOpen ? (save.gentleEncounter?.choice || "arrival") : null);
        store.set({ mode: w.saveMode() });
        setSceneReady(true);
        setPhase("game");
      }).catch((error: unknown) => {
        if (!active) return;
        if (error instanceof Error && error.name === "AbortError") return;
        setLoadError("Die Spielwelt konnte nicht geöffnet werden. Hilfe bleibt verfügbar. Dein bisheriger Spielstand bleibt erhalten.");
        setPhase("error");
      });
    }, 60);
    return () => { active = false; window.clearTimeout(id); };
  }, [phase]);

  const checkpoint = () => {
    if (!saveRef.current) return false;
    const world = getWorld();
    if (world) return world.checkpoint();
    return saveRef.current ? persistSave(saveRef.current) : true;
  };
  const importSave = (raw: string) => {
    if (!checkpoint()) throw new Error("Der aktuelle Spielstand konnte nicht gesichert werden. Der Import bleibt geschlossen; dein vorhandener Stand bleibt erhalten.");
    const imported = parseImportedSave(raw);
    if (!persistSave(imported)) throw new Error("Der Spielstand konnte nicht übernommen werden. Prüfe den Speicherhinweis in der Schutzleiste.");
    begin(imported);
  };
  const exit = () => {
    resumeEntryRef.current = false;
    if (saveRef.current) saveRef.current = getWorld()?.getSave() || saveRef.current;
    checkpoint();
    generation.current++;
    const world = getWorld();
    if (world) world.setPresentation("title");
    else { stopWorld(false); setSceneReady(false); setSceneEpoch(value => value + 1); }
    const saveError = store.get().saveError;
    audio.setMuted(true);
    setSurfaceEpoch(value => value + 1);
    store.set({ ...initialHud, saveError });
    setHasSave(saveRef.current !== null);
    setPhase("title");
  };
  const openEncounter = () => {
    const candidate = getWorld()?.getSave() || saveRef.current || previewRef.current;
    if (hasUnreadableSave()) { store.set({ paused: true, protectionOpen: "pause" }); return; }
    saveRef.current = candidate || newGame();
    setHasSave(true);
    checkpoint();
    setEncounterSave(saveRef.current);
    getWorld()?.setPresentation(saveRef.current.gentleEncounter?.choice || "arrival");
    store.set({ explorationOpen: true, paused: false, protectionOpen: null, menuOpen: false });
  };
  const retreat = () => {
    if (saveRef.current && (phase === "game" || store.get().explorationOpen)) getWorld()?.retreatEncounter();
    getWorld()?.setPresentation(phase === "game" ? null : "title");
    store.set({ explorationOpen: false, paused: true, protectionOpen: "pause", battlePhen: null, duelId: null, dialogNpc: null, chatOpen: false, cookOpen: false, journalOpen: false, loreStone: null });
    checkpoint();
  };

  return (
    <div className="fixed inset-0 bg-[#08131f] overflow-hidden">
      <div ref={containerRef} className="absolute inset-0 scene-world" inert={Boolean(h.paused || h.protectionOpen || h.explorationOpen || phase !== "game")} onClick={() => { if (phase === "game") audio.startSea(); }} />
      <SurfaceBoundary key={surfaceEpoch}><div className={`game-surfaces ${h.paused || h.protectionOpen ? "surface-paused" : ""}`} inert={Boolean(h.paused || h.protectionOpen || h.explorationOpen)}>
        {(!sceneReady || phase === "loading") && phase !== "error" && <p className="scene-loading" role="status">Die See wird bereitet …</p>}
        {phase === "error" && <div className="load-error"><h1>Die Spielwelt bleibt geschlossen</h1><p role="alert">{loadError}</p><button onClick={() => setPhase("title")}>Zum Einstieg</button></div>}
        {phase === "game" && !h.explorationOpen && <><HUD /><OpenWorldPanel checkpoint={checkpoint} onImport={importSave} /><BattleOverlay /><DialogOverlay /><JournalOverlay /><LoreOverlay /><ChatOverlay /><CookOverlay /><DuelOverlay /></>}
        {phase === "title" && !h.explorationOpen && <TitleScreen ready={sceneReady} hasSave={hasSave} onEncounter={openEncounter} onNew={() => begin(newGame())} onContinue={() => { const s = saveRef.current || loadSave(); if (s) begin(s); }} />}
      </div></SurfaceBoundary>
      {h.explorationOpen && encounterSave && <SurfaceBoundary><GentleEncounter save={encounterSave} checkpoint={checkpoint} onScene={presentEncounter} onChange={next => { if (saveRef.current) { saveRef.current.gentleEncounter = next; persistSave(saveRef.current); } }} onClose={() => { checkpoint(); getWorld()?.setPresentation(phase === "game" ? null : "title"); store.set({ explorationOpen: false, paused: true, protectionOpen: "pause" }); }} onRetreat={retreat} /></SurfaceBoundary>}
      <Protection phase={phase} canSave={hasSave} onExit={exit} onRetreat={retreat} onEncounter={openEncounter} checkpoint={checkpoint} />
    </div>
  );
}
