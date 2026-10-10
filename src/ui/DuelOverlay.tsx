// Optional narrated examples. A choice only changes the fictional scene.
import { useEffect, useState } from "react";
import { store } from "../game/store";
import { getWorld } from "../game/runtime";
import { duelById, tacticById, HALTUNGEN, type DuelDef, type Haltung } from "../game/duels";
import { audio } from "../game/audio";
import { areUiTimersPaused, useInterfacePaused, usePausedTypewriter } from "./usePausedTimers";

function Typewriter({ text }: { text: string }) {
  const { shown, reveal } = usePausedTypewriter(text);
  return <span onClick={reveal}>{shown}</span>;
}
export function DuelOverlay() {
  const [duelId, setDuelId] = useState(store.get().duelId);
  useEffect(() => store.subscribe(() => setDuelId(store.get().duelId)), []);
  const def = duelId ? duelById(duelId) : undefined;
  return def ? <DuelInner key={def.id} def={def} /> : null;
}
type Phase = { kind: "beat" | "quiz" | "reply"; idx: number } | { kind: "resolve" | "debrief" };
function DuelInner({ def }: { def: DuelDef }) {
  const world = getWorld()!;
  const paused = useInterfacePaused();
  const [phase, setPhase] = useState<Phase>({ kind: "beat", idx: 0 });
  const [npcLine, setNpcLine] = useState(def.beats[0].npc);
  const [named, setNamed] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const beat = "idx" in phase ? def.beats[phase.idx] : null;
  const close = () => { if (!areUiTimersPaused()) store.set({ duelId: null }); };
  const finish = () => { if (areUiTimersPaused()) return; world.finishDuel(def.id); store.set({ duelId: null }); };
  const choose = (choice: Haltung) => {
    if (areUiTimersPaused() || phase.kind !== "beat" || !beat) return;
    audio.select(); setNote("");
    if (choice === "muster") {
      if (beat.quizOptions) setPhase({ kind: "quiz", idx: phase.idx });
      else { setNpcLine("In diesem Abschnitt ist kein bestimmtes Muster hinterlegt. Du kannst die Szene weiter lesen."); setPhase({ kind: "reply", idx: phase.idx }); }
      return;
    }
    const reply = choice === "nachgeben" ? beat.onNachgeben : choice === "nachfragen" ? beat.onNachfragen : beat.onGrenze;
    setNpcLine(reply ?? "Die Szene hält hier einen Moment inne.");
    setPhase({ kind: "reply", idx: phase.idx });
  };
  const next = () => {
    if (areUiTimersPaused() || phase.kind !== "reply") return;
    setNote("");
    const index = phase.idx + 1;
    if (index < def.beats.length) { setNpcLine(def.beats[index].npc); setPhase({ kind: "beat", idx: index }); }
    else { setNpcLine(named.length ? def.resolveNamed : def.resolveUnnamed); setPhase({ kind: "resolve" }); }
  };
  const quizAnswer = (answer: string) => {
    if (areUiTimersPaused() || phase.kind !== "quiz" || !beat) return;
    audio.select();
    if (answer === beat.quizCorrect) {
      if (!named.includes(answer)) { setNamed((list) => [...list, answer]); world.addCompassEntry(answer); }
      setNpcLine(beat.onMusterHit ?? "Diese Bezeichnung ist für die Szene hinterlegt.");
      setNote("Eine mögliche Einordnung dieser erfundenen Szene.");
    } else {
      setNpcLine(beat.onMusterMiss ?? "Für diese Szene ist eine andere Bezeichnung hinterlegt.");
      setNote("Einzelne Sätze reichen nicht aus, um reale Menschen oder Beziehungen zu beurteilen.");
    }
    setPhase({ kind: "reply", idx: phase.idx });
  };
  const tactics = def.beats.flatMap((part) => part.tactic ? [tacticById(part.tactic)] : []).filter((entry) => !!entry);
  const button = "rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-4 py-2 text-sm text-white disabled:opacity-40";
  return <div className="absolute inset-x-0 bottom-0 z-30 pointer-events-auto flex justify-center px-4 pb-4">
    <section aria-label="Fiktive Gesprächsszene" className="w-full max-w-2xl rounded-2xl border border-purple-300/25 bg-[#13101e]/95 shadow-xl text-white overflow-hidden">
      <header className="flex items-start justify-between gap-3 px-5 py-3 border-b border-white/10">
        <div><h2 className="font-bold text-amber-100">{def.title}</h2><p className="text-xs text-white/60">Fiktive Szene mit {def.npcName}</p></div>
        <button className={button} disabled={paused} onClick={close}>Verlassen ohne Kosten</button>
      </header>
      <p className="px-5 pt-3 text-xs text-white/60">Du wählst eine Antwort für eine erfundene Figur. Es werden keine Kristalle ausgegeben. Du kannst jeden Abschnitt überspringen oder die Szene verlassen.</p>
      <div className="px-5 py-4 min-h-28 max-h-[35vh] overflow-y-auto"><p className="text-sm leading-relaxed"><Typewriter text={npcLine} /></p>{note && <p className="mt-2 text-xs text-white/60">{note}</p>}</div>
      <div className="px-5 pb-4 flex flex-wrap gap-2">
        {phase.kind === "beat" && <>
          {HALTUNGEN.map((choice) => <button key={choice.id} className={button} disabled={paused} onClick={() => choose(choice.id)}>{choice.label}</button>)}
          <button className={button} disabled={paused} onClick={() => setPhase({ kind: "reply", idx: phase.idx })}>Abschnitt überspringen</button>
        </>}
        {phase.kind === "quiz" && <>
          {beat?.quizOptions?.map((answer) => <button key={answer} className={button} disabled={paused} onClick={() => quizAnswer(answer)}>{tacticById(answer)?.name ?? "Weitere Einordnung"}</button>)}
          <button className={button} disabled={paused} onClick={() => setPhase({ kind: "reply", idx: phase.idx })}>Ohne Einordnung weiter</button>
        </>}
        {phase.kind === "reply" && <button className={button} disabled={paused} onClick={next}>Nächsten Abschnitt lesen</button>}
        {phase.kind === "resolve" && <button className={button} disabled={paused} onClick={() => setPhase({ kind: "debrief" })}>Einordnung ansehen</button>}
      </div>
      {phase.kind === "debrief" && <div className="border-t border-white/10 px-5 py-4 space-y-3">
        <p className="font-semibold text-sm">{def.debriefIntro}</p>
        {tactics.map((tactic) => <div key={tactic.id} className="text-sm"><p className="text-purple-100">{tactic.name}</p><p className="text-white/70">{tactic.feelsLike}</p><p className="text-white/70">Mögliche Antwort der Spielfigur: {tactic.counter}</p></div>)}
        <p className="text-xs text-white/60">Diese Begriffe ordnen Beispiele ein. Sie sind keine Diagnose und erlauben keine automatische Bewertung realer Menschen. Fachliche und Betroffenen-Prüfung offen.</p>
        <button className={button} disabled={paused} onClick={finish}>Szene abschließen und zur Welt</button>
      </div>}
    </section>
  </div>;
}
