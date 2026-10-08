// PHÄNOMENAUTIK 3 — Begegnungs-Overlay: portierte V2-Kampflogik
// (Erregungsmatrix, Verstehen bis 100 %, rollende Zähler, Typewriter),
// aber die Kreatur steht leibhaftig in der Welt und reagiert über Hooks.

import { useCallback, useEffect, useRef, useState } from "react";
import {
  EXERCISES,
  ITEMS,
  PHENOMENA,
  effectiveness,
  effectivenessLabel,
  AROUSAL_LABEL,
  type ExerciseDef,
} from "../game/data";
import { audio } from "../game/audio";
import { store } from "../game/store";
import { getWorld } from "../game/runtime";
import type { PlayerState } from "../game/state";

function RollingNumber({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(value);
  const target = useRef(value);
  target.current = value;
  useEffect(() => {
    let raf = 0;
    const step = () => {
      setDisplay((d) => {
        const diff = target.current - d;
        if (diff === 0) return d;
        const move = Math.sign(diff) * Math.max(1, Math.round(Math.abs(diff) * 0.18));
        const next = d + move;
        if ((move > 0 && next > target.current) || (move < 0 && next < target.current)) return target.current;
        return next;
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <span className={className}>{Math.max(0, Math.round(display))}</span>;
}

function Typewriter({ text, onDone, speed = 16 }: { text: string; onDone?: () => void; speed?: number }) {
  const [shown, setShown] = useState("");
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  useEffect(() => {
    doneRef.current = false;
    setShown("");
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(iv);
        if (!doneRef.current) {
          doneRef.current = true;
          onDoneRef.current?.();
        }
      }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);
  return (
    <span
      onClick={() => {
        if (!doneRef.current) {
          doneRef.current = true;
          setShown(text);
          onDoneRef.current?.();
        }
      }}
    >
      {shown}
      {shown.length < text.length && <span className="animate-pulse">▊</span>}
    </span>
  );
}

type Phase =
  | { kind: "intro"; line: number }
  | { kind: "menu" }
  | { kind: "submenu"; menu: "exercise" | "item" }
  | { kind: "message"; text: string; then: () => void }
  | { kind: "enemyTurn"; text: string }
  | { kind: "won"; peace: boolean }
  | { kind: "lost" };

export function BattleOverlay() {
  const battlePhen = useStoreBattle();
  if (!battlePhen) return null;
  return <BattleInner key={battlePhen} phenId={battlePhen} />;
}

function useStoreBattle() {
  const [id, setId] = useState(store.get().battlePhen);
  useEffect(() => store.subscribe(() => setId(store.get().battlePhen)), []);
  return id;
}

function BattleInner({ phenId }: { phenId: string }) {
  const phen = PHENOMENA.find((p) => p.id === phenId)!;
  const world = getWorld()!;
  const [player, setPlayer] = useState<PlayerState>(() => {
    const p = world.getSave().player;
    return { ...p, items: { ...p.items } };
  });
  const [enemyHp, setEnemyHp] = useState(phen.intensity);
  const [understanding, setUnderstanding] = useState(0);
  const [understandIdx, setUnderstandIdx] = useState(0);
  const [guard, setGuard] = useState(false);
  const [enemyWeakened, setEnemyWeakened] = useState(0);
  const [phase, setPhase] = useState<Phase>({ kind: "intro", line: 0 });
  const [shake, setShake] = useState(0);

  useEffect(() => {
    if (shake > 0) {
      const to = setTimeout(() => setShake(0), 400);
      return () => clearTimeout(to);
    }
  }, [shake]);

  const resolve = useCallback(
    (outcome: "win" | "peace" | "flee" | "defeat") => {
      world.endEncounter(outcome, phenId, player);
    },
    [world, phenId, player],
  );

  const advanceIntro = useCallback(() => {
    audio.select();
    setPhase((ph) => {
      if (ph.kind !== "intro") return ph;
      if (ph.line + 1 < phen.intro.length) return { kind: "intro", line: ph.line + 1 };
      return { kind: "menu" };
    });
  }, [phen]);

  const enemyAttack = useCallback(() => {
    const atk = phen.attacks[Math.floor(Math.random() * phen.attacks.length)];
    let dmg = atk.min + Math.floor(Math.random() * (atk.max - atk.min + 1));
    dmg = Math.round(dmg * (1 - enemyWeakened * 0.5));
    if (guard) dmg = Math.ceil(dmg / 2);
    setGuard(false);
    setShake(1);
    world.creatureHook("attack");
    audio.playerHit();
    store.set({ damageFlash: 1 });
    setPlayer((pl) => {
      const next = { ...pl, stability: Math.max(0, pl.stability - dmg), presence: Math.min(pl.maxPresence, pl.presence + 2) };
      const text = `${atk.line}${guard ? " (Dein Körperscan federt ab!)" : ""} ${dmg} Schaden.`;
      setTimeout(() => {
        if (next.stability <= 0) {
          audio.defeat();
          setPhase({ kind: "lost" });
        } else {
          setPhase({ kind: "enemyTurn", text });
        }
      }, 500);
      return next;
    });
  }, [phen, enemyWeakened, guard, world]);

  const checkVictory = useCallback(
    (hp: number): boolean => {
      if (hp <= 0) {
        audio.victory();
        world.creatureHook("dissolve");
        setTimeout(() => setPhase({ kind: "won", peace: false }), 800);
        return true;
      }
      return false;
    },
    [world],
  );

  const useExercise = useCallback(
    (ex: ExerciseDef) => {
      if (player.presence < ex.cost) {
        audio.cancel();
        setPhase({ kind: "message", text: "Nicht genug Präsenz … erst durchatmen.", then: () => setPhase({ kind: "submenu", menu: "exercise" }) });
        return;
      }
      audio.confirm();
      const mult = effectiveness(ex.effect, phen.arousal);
      let dmg = Math.round(ex.power * (1 + player.level * 0.07) * mult - phen.armor * (1 - understanding / 260));
      dmg = Math.max(1, dmg);
      const heal = ex.heal;
      const label = effectivenessLabel(mult);
      const newHp = Math.max(0, enemyHp - dmg);
      setEnemyHp(newHp);
      world.creatureHook("hit");
      audio.hit();
      if (ex.guard) setGuard(true);
      setPlayer((pl) => ({
        ...pl,
        presence: pl.presence - ex.cost,
        stability: Math.min(pl.maxStability, pl.stability + heal),
      }));
      if (heal > 0) audio.heal();
      const parts = [`Du wendest „${ex.name}“ an. ${dmg} Wirkung gegen ${phen.name}!`];
      if (label) parts.push(label);
      if (heal > 0) parts.push(`+${heal} Stabilität.`);
      setTimeout(() => {
        if (!checkVictory(newHp)) {
          setPhase({ kind: "message", text: parts.join(" "), then: enemyAttack });
        }
      }, 480);
    },
    [player.presence, player.level, phen, enemyHp, understanding, checkVictory, enemyAttack, world],
  );

  const useItem = useCallback(
    (itemId: string) => {
      const item = ITEMS.find((i) => i.id === itemId)!;
      if ((player.items[itemId] ?? 0) <= 0) return;
      audio.heal();
      setPlayer((pl) => {
        const next = { ...pl, items: { ...pl.items, [itemId]: pl.items[itemId] - 1 } };
        if (item.heal > 0) next.stability = Math.min(next.maxStability, next.stability + item.heal);
        else next.presence = Math.min(next.maxPresence, next.presence + 14);
        return next;
      });
      const text =
        item.heal > 0
          ? `${item.name}: ${item.desc} +${item.heal} Stabilität.`
          : `${item.name}: ${item.desc} +14 Präsenz.`;
      setPhase({ kind: "message", text, then: enemyAttack });
    },
    [player.items, enemyAttack],
  );

  const tryUnderstand = useCallback(() => {
    audio.understand();
    const gain = 16 + Math.floor(Math.random() * 18);
    const nu = Math.min(100, understanding + gain);
    setUnderstanding(nu);
    const line = phen.understand[Math.min(understandIdx, phen.understand.length - 1)];
    setUnderstandIdx((i) => Math.min(i + 1, phen.understand.length - 1));
    setEnemyWeakened(nu / 140);
    world.creatureHook("hit", nu / 100);
    if (nu >= 100) {
      setPhase({ kind: "message", text: `${line} — Verständnis: 100 %. Etwas löst sich …`, then: () => {} });
      setTimeout(() => {
        audio.victory();
        world.creatureHook("hit", 1);
        setPhase({ kind: "won", peace: true });
      }, 1700);
    } else {
      setPhase({ kind: "message", text: `${line} (Verständnis: ${nu} %)`, then: enemyAttack });
    }
  }, [understanding, understandIdx, phen, enemyAttack, world]);

  const flee = useCallback(() => {
    audio.cancel();
    setPhase({
      kind: "message",
      text: "Du trittst zurück. Das Phänomen bleibt — Inseln laufen nicht weg.",
      then: () => resolve("flee"),
    });
  }, [resolve]);

  const hue = `hsl(${phen.hue}, 70%, 60%)`;

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 pointer-events-auto">
      {/* Begegnungs-Panel */}
      <div className="mx-auto max-w-3xl px-4 pb-4" style={{ transform: shake ? `translateX(${(Math.random() - 0.5) * 8}px)` : undefined }}>
        <div className="rounded-t-2xl border border-white/15 bg-black/60 backdrop-blur-md px-4 py-2.5 shadow-2xl">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <span className="text-sm font-bold tracking-wide text-amber-100">{phen.name}</span>
              <span className="ml-2 text-[11px] italic text-sky-200/70">{phen.epithet}</span>
            </div>
            <span className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ background: hue }}>
              {AROUSAL_LABEL[phen.arousal]}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-[10px] text-rose-100/80">
            <span className="w-16">Intensität</span>
            <div className="h-2 flex-1 overflow-hidden rounded bg-black/60">
              <div className="h-full transition-all duration-500" style={{ width: `${(enemyHp / phen.intensity) * 100}%`, background: hue }} />
            </div>
            <RollingNumber value={enemyHp} className="text-rose-100 font-mono w-8 text-right" />
          </div>
          <div className="mt-1 flex items-center gap-2 text-[10px] text-violet-100/80">
            <span className="w-16">Verständnis</span>
            <div className="h-2 flex-1 overflow-hidden rounded bg-black/60">
              <div className="h-full bg-violet-400 transition-all duration-500" style={{ width: `${understanding}%` }} />
            </div>
            <span className="w-9 text-right">{understanding}%</span>
          </div>
        </div>

        <div className="rounded-b-2xl border border-t-0 border-white/15 bg-[#0d1522]/90 backdrop-blur-md p-4 shadow-2xl">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-bold tracking-widest text-amber-200 text-xs">DU · STUFE {player.level}</span>
            <span className="flex items-center gap-4 font-mono text-sm">
              <span className="text-emerald-200">
                STAB <RollingNumber value={player.stability} />/{player.maxStability}
              </span>
              <span className="text-sky-200">
                PRÄS <RollingNumber value={player.presence} />/{player.maxPresence}
              </span>
            </span>
          </div>

          <div className="min-h-[72px] rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-sm leading-relaxed text-sky-50 mb-3">
            {phase.kind === "intro" && (
              <button className="block w-full text-left" onClick={advanceIntro}>
                <Typewriter text={phen.intro[phase.line]} />
                <span className="float-right text-xs text-sky-300/60">▼ weiter</span>
              </button>
            )}
            {phase.kind === "menu" && <Typewriter text={`Was tust du? (${phen.name} wirkt ${AROUSAL_LABEL[phen.arousal].toLowerCase()}.)`} />}
            {phase.kind === "submenu" && <Typewriter text={phase.menu === "exercise" ? "Welche Übung?" : "Welche Ressource?"} />}
            {phase.kind === "message" && <Typewriter text={phase.text} onDone={phase.then} />}
            {phase.kind === "enemyTurn" && <Typewriter text={phase.text} onDone={() => setPhase({ kind: "menu" })} />}
            {phase.kind === "won" && (
              <Typewriter
                text={phase.peace ? phen.peaceLine : phen.winLine}
                onDone={() => setTimeout(() => resolve(phase.peace ? "peace" : "win"), 1400)}
              />
            )}
            {phase.kind === "lost" && (
              <Typewriter
                text="Deine Stabilität sinkt gegen null … Das ist kein Ende — nur ein Rückzug. Du wachst am nächsten Feuer wieder auf. Das Phänomen bleibt. Aber du auch."
                onDone={() => setTimeout(() => resolve("defeat"), 1600)}
              />
            )}
          </div>

          {phase.kind === "menu" && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <button className="battle-btn" onClick={() => { audio.select(); setPhase({ kind: "submenu", menu: "exercise" }); }}>
                🫁 Übung
              </button>
              <button className="battle-btn" onClick={() => { audio.select(); tryUnderstand(); }}>
                💬 Verstehen
              </button>
              <button className="battle-btn" onClick={() => { audio.select(); setPhase({ kind: "submenu", menu: "item" }); }}>
                🎒 Ressource
              </button>
              <button className="battle-btn" onClick={flee}>
                🚶 Zurücktreten
              </button>
            </div>
          )}

          {phase.kind === "submenu" && phase.menu === "exercise" && (
            <div className="grid max-h-52 grid-cols-1 gap-1.5 overflow-y-auto sm:grid-cols-2">
              {EXERCISES.map((ex) => {
                const mult = effectiveness(ex.effect, phen.arousal);
                const afford = player.presence >= ex.cost;
                return (
                  <button
                    key={ex.id}
                    disabled={!afford}
                    className={`battle-btn flex items-center justify-between gap-2 px-3 py-1.5 text-left text-[13px] ${!afford ? "opacity-40" : ""}`}
                    title={ex.desc}
                    onClick={() => useExercise(ex)}
                  >
                    <span>
                      {ex.name}
                      {mult >= 1.5 && <span className="ml-1 text-amber-300">★</span>}
                      {mult <= 0.6 && <span className="ml-1 text-slate-400">▽</span>}
                    </span>
                    <span className="text-[11px] text-sky-300/80">{ex.cost} PRÄS</span>
                  </button>
                );
              })}
              <button className="battle-btn col-span-full" onClick={() => { audio.cancel(); setPhase({ kind: "menu" }); }}>
                ← Zurück
              </button>
            </div>
          )}

          {phase.kind === "submenu" && phase.menu === "item" && (
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
              {ITEMS.map((it) => (
                <button
                  key={it.id}
                  disabled={(player.items[it.id] ?? 0) <= 0}
                  className={`battle-btn flex items-center justify-between gap-2 px-3 py-1.5 text-left text-[13px] ${(player.items[it.id] ?? 0) <= 0 ? "opacity-40" : ""}`}
                  title={it.desc}
                  onClick={() => useItem(it.id)}
                >
                  <span>{it.name}</span>
                  <span className="text-[11px] text-amber-200/80">× {player.items[it.id] ?? 0}</span>
                </button>
              ))}
              <button className="battle-btn col-span-full" onClick={() => { audio.cancel(); setPhase({ kind: "menu" }); }}>
                ← Zurück
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
