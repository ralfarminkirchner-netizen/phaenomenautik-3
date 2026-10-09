// PHÄNOMENAUTIK — M4: Strand-Begegnung (Stufe 1)
// Leichtes Overlay: eine Zeile zum Ankommen, Verstehen-Mini (Zeilen
// durchschreiten), Friedenszeile + wahre Zeile, dann ins Atlas-Register.
// Tonlage: Zärtlichkeit. Begreifen statt Fangen.

import { useCallback, useEffect, useState } from "react";
import { store } from "../game/store";
import { getWorld } from "../game/runtime";
import { audio } from "../game/audio";
import { encounterNode } from "../game/encounters";
import { CLUSTER_BY_ID } from "../game/phenomenaGraph";

export function EncounterOverlay() {
  const [encounterId, setEncounterId] = useState(store.get().encounterId);
  useEffect(() => store.subscribe(() => setEncounterId(store.get().encounterId)), []);
  if (!encounterId) return null;
  return <EncounterInner key={encounterId} nodeId={encounterId} />;
}

function EncounterInner({ nodeId }: { nodeId: string }) {
  const node = encounterNode(nodeId);
  const cluster = CLUSTER_BY_ID.get(node.cluster);
  const lines = [node.text.intro, ...node.text.verstehen];
  const [step, setStep] = useState(0);
  const onFinal = step >= lines.length;

  const advance = useCallback(() => {
    if (onFinal) return;
    audio.select();
    setStep((s) => s + 1);
  }, [onFinal]);

  // Tastatur: E / Enter / Leertaste schreiten weiter
  useEffect(() => {
    const h = (ev: KeyboardEvent) => {
      const k = ev.key.toLowerCase();
      if (k === "e" || k === "enter" || k === " ") {
        ev.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [advance]);

  const complete = () => {
    getWorld()?.completeStrandEncounter(nodeId);
  };

  const close = () => {
    audio.cancel();
    store.set({ encounterId: null });
  };

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 pointer-events-auto flex justify-center px-4 pb-6">
      <div className="w-full max-w-xl rounded-2xl border border-white/15 bg-[#0d1522]/92 backdrop-blur-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-black/40 border-b border-white/10">
          <div>
            <span className="font-bold text-amber-100">{node.name}</span>
            <span className="ml-2 text-xs italic text-white/50">{node.epithet}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-white/40">
              Strand-Begegnung{cluster ? ` · ${cluster.name}` : ""}
            </span>
            <button className="text-white/50 hover:text-white text-lg px-2" onClick={close} title="Später weiter (Esc)">
              ✕
            </button>
          </div>
        </div>

        <div className="px-5 py-4 min-h-[92px]">
          {!onFinal ? (
            <p className="text-sm leading-relaxed text-sky-50 whitespace-pre-wrap">{lines[step]}</p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-emerald-100 whitespace-pre-wrap">{node.text.frieden}</p>
              <p className="text-xs leading-relaxed text-white/60 border-l-2 border-amber-200/40 pl-3">
                {node.text.insight}
              </p>
            </div>
          )}
        </div>

        <div className="px-4 pb-3 flex items-center justify-between">
          <span className="text-[10px] text-white/35">
            {onFinal ? "Die wahre Zeile wandert ins Atlas-Register" : `Hinhören · ${step + 1} / ${lines.length}`}
          </span>
          {onFinal ? (
            <button
              onClick={complete}
              className="rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-1.5 text-sm transition"
            >
              Ins Register aufnehmen
            </button>
          ) : (
            <button
              onClick={advance}
              className="rounded-lg bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 px-4 py-1.5 text-sm text-white/85 transition"
            >
              {step === 0 ? "Hinhören" : "Weiter"} [E]
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
