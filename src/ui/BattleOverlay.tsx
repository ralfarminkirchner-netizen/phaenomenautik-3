// Optional fictional turn sequence. Text playback never performs a game action.
import { useEffect, useRef, useState } from "react";
import { EXERCISES, ITEMS, PHENOMENA, effectiveness, effectivenessLabel, type ExerciseDef } from "../game/data";
import { audio } from "../game/audio";
import { store } from "../game/store";
import { getWorld } from "../game/runtime";
import type { PlayerState } from "../game/state";
import { areUiTimersPaused, useInterfacePaused, usePausedTypewriter } from "./usePausedTimers";

// Random game variation is requested by deliberate event handlers, never playback.
function randomGameInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function Typewriter({ text }: { text: string }) {
  const { shown, reveal } = usePausedTypewriter(text);
  return <span onClick={reveal}>{shown}</span>;
}
type Phase =
  | { kind: "intro"; line: number } | { kind: "menu" }
  | { kind: "submenu"; which: "exercise" | "item" }
  | { kind: "message"; text: string; next: "response" | "menu" | "peace" }
  | { kind: "response"; text: string } | { kind: "won"; peace: boolean } | { kind: "lost" };
export function BattleOverlay() {
  const [phenId, setPhenId] = useState(store.get().battlePhen);
  useEffect(() => store.subscribe(() => setPhenId(store.get().battlePhen)), []);
  return phenId ? <BattleInner key={phenId} phenId={phenId} /> : null;
}
function BattleInner({ phenId }: { phenId: string }) {
  const phen = PHENOMENA.find((p) => p.id === phenId)!;
  const world = getWorld()!;
  const paused = useInterfacePaused();
  const [original] = useState<PlayerState>(() => ({ ...world.getSave().player, items: { ...world.getSave().player.items } }));
  const [player, setPlayer] = useState<PlayerState>(() => ({ ...original, items: { ...original.items } }));
  const [enemyHp, setEnemyHp] = useState(phen.intensity);
  const [understanding, setUnderstanding] = useState(0);
  const [understandIdx, setUnderstandIdx] = useState(0);
  const [guard, setGuard] = useState(false);
  const [weakened, setWeakened] = useState(false);
  const [phase, setPhase] = useState<Phase>({ kind: "intro", line: 0 });
  const phaseRef = useRef(phase);
  const closed = useRef(false);
  const stage = (next: Phase) => { phaseRef.current = next; setPhase(next); };
  const allowed = () => !closed.current && !areUiTimersPaused();
  const resolve = (outcome: "win" | "peace" | "flee" | "defeat") => {
    if (!allowed()) return;
    closed.current = true;
    world.endEncounter(outcome, phenId, outcome === "flee" ? original : player);
  };
  const hasChallenge = () => !!(store.get() as ReturnType<typeof store.get> & { combatEnabled?: boolean }).combatEnabled;
  const win = (peace: boolean) => { audio.victory(); world.creatureHook("dissolve", peace ? 1 : 0); stage({ kind: "won", peace }); };
  const response = () => {
    if (!allowed() || phaseRef.current.kind !== "message") return;
    const current = phaseRef.current;
    if (current.next === "peace") { win(true); return; }
    if (current.next === "menu" || !hasChallenge()) { stage({ kind: "menu" }); return; }
    const attack = phen.attacks[randomGameInt(0, phen.attacks.length - 1)];
    const base = randomGameInt(attack.min, attack.max);
    const damage = Math.max(1, Math.round(base * (weakened ? 0.75 : 1) * (guard ? 0.5 : 1)));
    setGuard(false);
    const nextPlayer = { ...player, stability: Math.max(0, player.stability - damage), presence: Math.min(player.maxPresence, player.presence + 2) };
    setPlayer(nextPlayer); world.creatureHook("attack"); audio.playerHit();
    stage(nextPlayer.stability <= 0 ? { kind: "lost" } : { kind: "response", text: `${attack.line} Spielwert Stabilität: −${damage}.` });
  };
  const applyExercise = (exercise: ExerciseDef) => {
    if (!allowed() || phaseRef.current.kind !== "submenu") return;
    if (hasChallenge() && player.presence < exercise.cost) {
      stage({ kind: "message", text: "Für diese Spielaktion reicht der Wert Präsenz gerade nicht. Du kannst eine andere Aktion wählen oder die Begegnung verlassen.", next: "menu" }); return;
    }
    audio.confirm();
    const mult = effectiveness(exercise.effect, phen.arousal);
    const damage = Math.max(1, Math.round(exercise.power * mult + player.level * 2 - phen.armor));
    const hp = Math.max(0, enemyHp - damage); setEnemyHp(hp);
    if (exercise.guard) setGuard(true);
    if (hasChallenge()) setPlayer({ ...player, presence: player.presence - exercise.cost, stability: Math.min(player.maxStability, player.stability + exercise.heal) });
    world.creatureHook("hit");
    if (hp <= 0) { win(false); return; }
    stage({ kind: "message", text: `Spielaktion „${exercise.name}“: −${damage} Intensität. ${effectivenessLabel(mult) ?? ""} Diese Zahlen beschreiben ausschließlich die Spielregel.`, next: "response" });
  };
  const applyItem = (itemId: string) => {
    if (!allowed() || phaseRef.current.kind !== "submenu" || !player.items[itemId]) return;
    const item = ITEMS.find((entry) => entry.id === itemId)!; audio.confirm();
    setPlayer({ ...player, items: { ...player.items, [itemId]: player.items[itemId] - 1 }, stability: Math.min(player.maxStability, player.stability + item.heal), presence: Math.min(player.maxPresence, player.presence + (itemId === "anker" ? 14 : 0)) });
    stage({ kind: "message", text: `„${item.name}“ eingesetzt. ${item.desc} Die Änderung betrifft Spielwerte.`, next: "response" });
  };
  const observe = () => {
    if (!allowed() || phaseRef.current.kind !== "menu") return;
    audio.understand();
    const value = Math.min(100, understanding + randomGameInt(22, 34));
    setUnderstanding(value); setUnderstandIdx(understandIdx + 1); setWeakened(true);
    stage({ kind: "message", text: `${phen.understand[understandIdx % phen.understand.length]} Erkundung dieser Szene: ${value} %.`, next: value >= 100 ? "peace" : "response" });
  };
  const advanceIntro = () => {
    if (!allowed() || phaseRef.current.kind !== "intro") return;
    const line = phaseRef.current.line + 1; stage(line < phen.intro.length ? { kind: "intro", line } : { kind: "menu" });
  };
  const message = phase.kind === "intro" ? phen.intro[phase.line]
    : phase.kind === "message" || phase.kind === "response" ? phase.text
    : phase.kind === "won" ? (phase.peace ? phen.peaceLine : phen.winLine)
    : phase.kind === "lost" ? "Diese Spielrunde ist beendet. Du kannst die Begegnung jetzt ohne Verlust verlassen."
    : phase.kind === "submenu" ? (phase.which === "exercise" ? "Welche Spielaktion möchtest du wählen? Körperübungen musst du dafür nicht ausführen." : "Welche Spielressource möchtest du einsetzen?")
    : "Wie möchtest du in dieser fiktiven Szene weitergehen?";
  const button = "rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-4 py-2 text-sm disabled:opacity-40";
  return <div className="absolute inset-x-0 bottom-0 z-30 pointer-events-auto flex justify-center px-4 pb-4">
    <section aria-label="Fiktive Begegnung" className="w-full max-w-2xl rounded-2xl border border-white/20 bg-[#0d1522]/95 text-white shadow-xl overflow-hidden">
      <header className="flex items-start justify-between gap-4 border-b border-white/15 px-4 py-3">
        <div><h2 className="font-bold text-amber-100">{phen.name}</h2><p className="text-xs text-white/60">{phen.epithet}</p></div>
        <button className={button} onClick={() => resolve("flee")} disabled={paused}>Verlassen ohne Verlust</button>
      </header>
      <div className="px-4 pt-3 text-xs text-white/60">Fiktive Szene · freiwillig · Spielwerte beschreiben keine persönliche Verfassung</div>
      <div className="flex gap-5 px-4 py-2 text-xs"><span>Intensität: {enemyHp}/{phen.intensity}</span><span>Erkundung: {understanding} %</span>{hasChallenge() && <span>Spielwerte: Stabilität {Math.round(player.stability)} · Präsenz {Math.round(player.presence)}</span>}</div>
      <div className="min-h-24 px-4 py-4 text-sm leading-relaxed"><Typewriter text={message} /></div>
      <div className="px-4 pb-4 flex flex-wrap gap-2">
        {phase.kind === "intro" && <button className={button} disabled={paused} onClick={advanceIntro}>Weiterlesen</button>}
        {phase.kind === "menu" && <>
          <button className={button} disabled={paused} onClick={() => stage({ kind: "submenu", which: "exercise" })}>Spielaktion wählen</button>
          <button className={button} disabled={paused} onClick={observe}>Szene betrachten</button>
          <button className={button} disabled={paused} onClick={() => stage({ kind: "submenu", which: "item" })}>Spielressource</button>
        </>}
        {phase.kind === "submenu" && <>
          {phase.which === "exercise" ? EXERCISES.map((exercise) => <button key={exercise.id} className={button} title={exercise.desc} disabled={paused || (hasChallenge() && player.presence < exercise.cost)} onClick={() => applyExercise(exercise)}>{exercise.name}{hasChallenge() ? ` · ${exercise.cost} Präsenz` : ""}</button>) : ITEMS.filter((item) => player.items[item.id] > 0).map((item) => <button key={item.id} className={button} disabled={paused} onClick={() => applyItem(item.id)}>{item.name} · {player.items[item.id]}</button>)}
          <button className={button} disabled={paused} onClick={() => stage({ kind: "menu" })}>Zur Auswahl</button>
        </>}
        {phase.kind === "message" && <button className={button} disabled={paused} onClick={response}>{phase.next === "response" && hasChallenge() ? "Gegenreaktion als nächsten Spielzug ausführen" : "Weiter"}</button>}
        {phase.kind === "response" && <button className={button} disabled={paused} onClick={() => stage({ kind: "menu" })}>Zur Auswahl</button>}
        {phase.kind === "won" && <button className={button} disabled={paused} onClick={() => resolve(phase.peace ? "peace" : "win")}>Szene abschließen</button>}
        {phase.kind === "lost" && <button className={button} disabled={paused} onClick={() => resolve("flee")}>Zur Welt ohne Verlust</button>}
      </div>
    </section>
  </div>;
}
