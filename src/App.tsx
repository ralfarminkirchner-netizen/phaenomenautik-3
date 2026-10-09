// PHÄNOMENAUTIK 3 — App: Titel ↔ Spiel, Mounting der three.js-Welt

import { useEffect, useRef, useState } from "react";
import { HUD } from "./ui/HUD";
import { TitleScreen } from "./ui/TitleScreen";
import { BattleOverlay } from "./ui/BattleOverlay";
import { DialogOverlay } from "./ui/DialogOverlay";
import { JournalOverlay, LoreOverlay } from "./ui/JournalOverlay";
import { ChatOverlay } from "./ui/ChatOverlay";
import { CookOverlay } from "./ui/CookOverlay";
import { DuelOverlay } from "./ui/DuelOverlay";
import { loadSave, newGame, type SaveGame } from "./game/state";
import { startWorld } from "./game/runtime";
import { store } from "./game/store";
import { audio } from "./game/audio";

type Phase = "title" | "loading" | "game";

export default function App() {
  const [phase, setPhase] = useState<Phase>("title");
  const [hasSave, setHasSave] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const saveRef = useRef<SaveGame | null>(null);

  useEffect(() => {
    setHasSave(loadSave() !== null);
  }, []);

  const begin = (save: SaveGame) => {
    saveRef.current = save;
    setPhase("loading");
  };

  useEffect(() => {
    if (phase !== "loading" || !containerRef.current || !saveRef.current) return;
    // Ein Frame warten, damit der Lade-Hinweis sichtbar wird (Terrain-Bake blockiert kurz)
    const id = window.setTimeout(() => {
      void startWorld(containerRef.current!, saveRef.current!).then((w) => {
        store.set({ mode: w.saveMode() });
        setPhase("game");
      });
    }, 60);
    return () => window.clearTimeout(id);
  }, [phase]);

  return (
    <div className="fixed inset-0 bg-[#08131f] overflow-hidden">
      {/* three.js-Container bleibt gemountet, sobald das Spiel einmal läuft */}
      {(phase === "loading" || phase === "game") && (
        <div
          ref={containerRef}
          className="absolute inset-0"
          onClick={() => audio.startSea()}
        />
      )}
      {phase === "loading" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0a1626] text-white">
          <div className="text-2xl font-bold mb-3">Die See wird bereitet …</div>
          <div className="text-white/50 text-sm animate-pulse">Inseln, Wasser und Wetter entstehen</div>
        </div>
      )}
      {phase === "game" && (
        <>
          <HUD />
          <BattleOverlay />
          <DialogOverlay />
          <JournalOverlay />
          <LoreOverlay />
          <ChatOverlay />
          <CookOverlay />
          <DuelOverlay />
        </>
      )}
      {phase === "title" && (
        <TitleScreen
          hasSave={hasSave}
          onNew={() => begin(newGame())}
          onContinue={() => {
            const s = loadSave();
            if (s) begin(s);
          }}
        />
      )}
    </div>
  );
}
