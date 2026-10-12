// PHÄNOMENAUTIK — M4.2: Masken-Begegnung
// Leichtes Overlay: die Maske zeigt eine mögliche Zeile — eine Lesart, die
// sich überdenken lässt. Beim Begreifen fällt die Maske, dahinter steht der
// Kern. Register-Eintrag, Zärtlichkeit. Es heißt begreifen, nie fangen.

import { useCallback, useEffect, useState } from "react";
import { store } from "../game/store";
import { getWorld } from "../game/runtime";
import { loadSave } from "../game/state";
import { audio } from "../game/audio";
import { CLUSTER_BY_ID, NODE_BY_ID } from "../game/phenomenaGraph";
import { VARIANT_BY_ID } from "../game/variants";

export function VariantOverlay() {
  const [variantId, setVariantId] = useState(store.get().variantId);
  useEffect(() => store.subscribe(() => setVariantId(store.get().variantId)), []);
  if (!variantId) return null;
  return <VariantInner key={variantId} variantId={variantId} />;
}

function VariantInner({ variantId }: { variantId: string }) {
  const x = VARIANT_BY_ID.get(variantId);
  const [revealed, setRevealed] = useState(false);
  if (!x) return null;
  const node = NODE_BY_ID.get(x.nodeId);
  const cluster = node ? CLUSTER_BY_ID.get(node.cluster) : undefined;
  // Wiederbegegnung: eine schon begriffene Maske bleibt ansehbar; der Eintrag
  // im Register bleibt einmalig.
  const alreadyUnderstood = loadSave()?.variantsUnderstood.includes(variantId) ?? false;

  const reveal = useCallback(() => {
    if (revealed) return;
    audio.select();
    setRevealed(true);
  }, [revealed]);

  // Tastatur: E / Enter / Leertaste enthüllen den Kern
  useEffect(() => {
    const h = (ev: KeyboardEvent) => {
      const k = ev.key.toLowerCase();
      if (k === "e" || k === "enter" || k === " ") {
        ev.preventDefault();
        if (!revealed) reveal();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [revealed, reveal]);

  const complete = () => {
    getWorld()?.completeVariantEncounter(variantId);
  };

  const close = () => {
    audio.cancel();
    store.set({ variantId: null });
  };

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 pointer-events-auto flex justify-center px-4 pb-6">
      <div className="w-full max-w-xl rounded-2xl border border-white/15 bg-[#0d1522]/92 backdrop-blur-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-black/40 border-b border-white/10">
          <div>
            <span className="font-bold" style={{ color: `hsl(${x.hue}, 75%, 72%)` }}>
              {x.maskName}
            </span>
            <span className="ml-2 text-xs italic text-white/50">{x.epithet}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-white/40">
              Eine Maske{cluster ? ` · ${cluster.name}` : ""}
            </span>
            <button className="text-white/50 hover:text-white text-lg px-2" onClick={close} title="Später weiter (Esc)">
              ✕
            </button>
          </div>
        </div>

        <div className="px-5 py-4 min-h-[92px]">
          {alreadyUnderstood && (
            <p className="text-[11px] text-sky-200/60 italic mb-2">
              Diese Maske hast du schon begriffen — gerne bleibst du und siehst sie dir erneut an.
            </p>
          )}
          {!revealed ? (
            <p className="text-sm leading-relaxed text-sky-50 whitespace-pre-wrap">{x.line}</p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-emerald-100 whitespace-pre-wrap">{x.begreifen}</p>
              <p className="text-xs leading-relaxed text-white/60 border-l-2 border-amber-200/40 pl-3">
                Mögliche Deutung: Hinter der Maske steht {node?.name ?? "ein noch unbenannter Kern"}. Wie jede
                Lesart darfst du sie später im Journal überdenken — die Begegnung selbst wandert ins Atlas-Register.
              </p>
            </div>
          )}
        </div>

        <div className="px-4 pb-3 flex items-center justify-between">
          <span className="text-[10px] text-white/35">
            {revealed
              ? "Die Maske fällt — der Kern bleibt"
              : "Hinhören · manche lesen in jeder Maske etwas Wahres — eine mögliche Deutung, keine Pflicht"}
          </span>
          {revealed ? (
            <button
              onClick={complete}
              className="rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-1.5 text-sm transition"
            >
              Ins Register aufnehmen
            </button>
          ) : (
            <button
              onClick={reveal}
              className="rounded-lg bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 px-4 py-1.5 text-sm text-white/85 transition"
            >
              Begreifen [E]
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
