// PHÄNOMENAUTIK 3 — Rededuell-Overlay (M3): Typewriter-Zeilen des NPC,
// Haltungs-Optionen statt Freitext, Muster-Radar (Taktik benennen aus 3
// Optionen), Debrief mit klarer Rahmung. Keine Bestrafung fürs Nichterkennen.

import { useEffect, useRef, useState } from "react";
import { store } from "../game/store";
import { getWorld } from "../game/runtime";
import { duelById, tacticById, HALTUNGEN, type DuelDef, type Haltung } from "../game/duels";
import { audio } from "../game/audio";

function Typewriter({ text, onDone }: { text: string; onDone?: () => void }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    let i = 0;
    const iv = setInterval(() => {
      i += 2;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(iv);
        onDone?.();
      }
    }, 13);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  return (
    <span onClick={() => setShown(text)}>
      {shown}
      {shown.length < text.length && <span className="animate-pulse">▊</span>}
    </span>
  );
}

export function DuelOverlay() {
  const [duelId, setDuelId] = useState(store.get().duelId);
  useEffect(() => store.subscribe(() => setDuelId(store.get().duelId)), []);
  if (!duelId) return null;
  const def = duelById(duelId);
  if (!def) return null;
  return <DuelInner key={def.id} def={def} />;
}

type Phase =
  | { kind: "beat"; idx: number }
  | { kind: "quiz"; idx: number }
  | { kind: "resolve" }
  | { kind: "debrief" };

function DuelInner({ def }: { def: DuelDef }) {
  const world = getWorld()!;
  const [phase, setPhase] = useState<Phase>({ kind: "beat", idx: 0 });
  const [npcLine, setNpcLine] = useState(def.beats[0].npc);
  const [named, setNamed] = useState<string[]>([]);
  const [paid, setPaid] = useState(0);
  const [missed, setMissed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const beat = phase.kind === "beat" || phase.kind === "quiz" ? def.beats[(phase as { idx: number }).idx] : null;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
  }, [npcLine, phase]);

  const close = () => {
    world.finishDuel(def.id);
    store.set({ duelId: null });
  };

  const learnTactic = (tacticId: string) => {
    if (!named.includes(tacticId)) {
      setNamed((n) => [...n, tacticId]);
      world.addCompassEntry(tacticId);
    }
  };

  const choose = (h: Haltung) => {
    if (phase.kind !== "beat" || !beat) return;
    const idx = phase.idx;
    audio.select();
    if (h === "muster") {
      if (beat.tactic && beat.quizOptions) {
        setPhase({ kind: "quiz", idx });
      } else {
        setNpcLine("Da ist nichts zu benennen — noch nicht. Hör weiter zu.");
      }
      return;
    }
    // Haltung wirkt
    if (h === "nachgeben") {
      if (idx === 1) {
        // Kaufangebot annehmen
        if (world.duelPay(def.priceCrystals)) setPaid((p) => p + def.priceCrystals);
        else {
          setNpcLine("Oh — deine Taschen sind leerer als dein Blick. Schade. Komm wieder, wenn du dir Freundschaft leisten kannst.");
          return;
        }
      } else if (idx === 2) {
        if (world.duelPay(def.goalpostCrystals)) setPaid((p) => p + def.goalpostCrystals);
        else {
          setNpcLine("Keine Kristalle mehr? Dann eben nur die Karte. Die Hülle hebe ich mir für … zahlungskräftigere Freunde auf.");
          advanceOrResolve(idx);
          return;
        }
      }
    }
    const reply =
      h === "nachgeben" ? beat.onNachgeben : h === "nachfragen" ? beat.onNachfragen : beat.onGrenze;
    if (reply) setNpcLine(reply);
    // Grenze immer, sonst ab dem Angebots-Beat: nach der Antwort → weiter
    if (h === "grenze" || idx >= 1) {
      window.setTimeout(() => advanceOrResolve(idx), 900);
    }
  };

  const advanceOrResolve = (idx: number) => {
    if (idx + 1 < def.beats.length) {
      const next = idx + 1;
      setPhase({ kind: "beat", idx: next });
      setNpcLine(def.beats[next].npc);
    } else {
      // Auflösungstext: benannt = fair, unbenannt = teuer
      const resolved = named.length > 0;
      if (resolved) {
        // Fairer Handel: bezahlt bleibt bezahlt, Rest zurück
        world.duelSettle("named", paid, def.priceCrystals);
        setNpcLine(def.resolveNamed);
      } else {
        world.duelSettle("unnamed", paid, def.priceCrystals + def.goalpostCrystals);
        setNpcLine(def.resolveUnnamed);
      }
      setPhase({ kind: "resolve" });
    }
  };

  const quizAnswer = (option: string) => {
    if (phase.kind !== "quiz" || !beat) return;
    audio.select();
    if (option === beat.quizCorrect && beat.tactic) {
      learnTactic(beat.tactic);
      setMissed(false);
      setNpcLine(beat.onMusterHit ?? "…");
      const idx = phase.idx;
      window.setTimeout(() => advanceOrResolve(idx), 1400);
      setPhase({ kind: "beat", idx });
    } else {
      setMissed(true);
      setNpcLine(beat.onMusterMiss ?? "…");
      setPhase({ kind: "beat", idx: phase.idx });
    }
  };

  const namedTacticDefs = named.map((id) => tacticById(id)).filter((t) => !!t);

  return (
    <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center pointer-events-auto p-4">
      <div className="w-full max-w-xl rounded-2xl border border-purple-300/25 bg-[#171226] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-black/30">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-purple-300/70">Rededuell · {def.title}</div>
            <div className="text-amber-100 font-bold">{def.npcName}</div>
          </div>
          <div className="text-[11px] text-white/40" title="Benannte Muster">
            {named.length > 0 && `🧭 ${named.length} Muster benannt`}
          </div>
        </div>

        <div ref={scrollRef} className="px-5 py-4 min-h-[130px] max-h-[42vh] overflow-y-auto">
          <p className="text-white/90 leading-relaxed text-[15px]">
            <Typewriter text={npcLine} />
          </p>
          {missed && (
            <p className="text-white/40 text-xs mt-2 italic">Kein Treffer — aber das Benennen zu versuchen ist schon Übung.</p>
          )}
        </div>

        {phase.kind === "beat" && (
          <div className="px-5 pb-4 grid grid-cols-2 gap-2">
            {HALTUNGEN.map((h) => (
              <button
                key={h.id}
                onClick={() => choose(h.id)}
                className={`rounded-xl border px-3 py-2.5 text-sm transition text-left ${
                  h.id === "muster"
                    ? "border-purple-400/40 bg-purple-900/30 text-purple-100 hover:bg-purple-800/40"
                    : "border-white/15 bg-white/5 text-white/85 hover:bg-white/10"
                }`}
              >
                <span className="mr-1.5">{h.icon}</span>
                {h.label}
              </button>
            ))}
          </div>
        )}

        {phase.kind === "quiz" && beat?.quizOptions && (
          <div className="px-5 pb-4">
            <div className="text-[11px] uppercase tracking-widest text-purple-300/70 mb-2">Muster-Radar — was passiert hier gerade?</div>
            <div className="grid grid-cols-1 gap-2">
              {beat.quizOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => quizAnswer(opt)}
                  className="rounded-xl border border-purple-400/40 bg-purple-900/25 text-purple-100 px-4 py-2.5 text-sm text-left hover:bg-purple-800/40 transition"
                >
                  🧭 {tacticById(opt)?.name ?? opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase.kind === "resolve" && (
          <div className="px-5 pb-5 space-y-3">
            <button
              onClick={() => setPhase({ kind: "debrief" })}
              className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2.5 transition"
            >
              Im Journal festhalten
            </button>
          </div>
        )}

        {phase.kind === "debrief" && (
          <div className="px-5 pb-5 space-y-3 border-t border-white/10 pt-4">
            <div className="text-[11px] uppercase tracking-widest text-purple-300/70">{def.debriefIntro}</div>
            {namedTacticDefs.length === 0 ? (
              <p className="text-white/80 text-sm leading-relaxed">
                {def.beats.filter((b) => b.tactic).map((b) => tacticById(b.tactic!)!.name).join(" und ")} waren im Spiel —
                unerkannt diesmal. Kein Fehler: Das Muster steht jetzt im Journal. Beim nächsten Mal siehst du es früher.
              </p>
            ) : (
              namedTacticDefs.map((t) => (
                <div key={t!.id} className="rounded-lg bg-purple-900/25 border border-purple-400/25 px-3.5 py-2.5">
                  <div className="text-purple-100 font-semibold text-sm">Das war {t!.name}. Echte Menschen benutzen das. Du hast es erkannt.</div>
                  <div className="text-white/60 text-xs mt-1">{t!.feelsLike}</div>
                  <div className="text-emerald-200/80 text-xs mt-1">Gegenmittel: {t!.counter}</div>
                </div>
              ))
            )}
            <p className="text-white/35 text-[11px] leading-relaxed">
              Diese Dynamiken spielen nur hier, im fiktiven Rahmen, gegen erwachsene Spielfiguren — nie gegen dich als
              Person. Erkannt zu haben zählt mehr als „richtig" gehandelt zu haben.
            </p>
            <button
              onClick={close}
              className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2.5 transition"
            >
              Zurück zur Welt
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
