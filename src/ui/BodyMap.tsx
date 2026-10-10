// PHÄNOMENAUTIK 3 — Körperkarte (Journal-Tab „Körper“, M3): stilisierte
// Silhouette, Bereiche leuchten je nach Status. Tooltip pro Bereich in einer
// Zeile Alltagssprache: welche Spielressourcen die Anzeige auslösen.

import { useEffect, useState } from "react";
import { getWorld } from "../game/runtime";
import { mealBonus, GF_WATCH, type MicroKey } from "../game/cooking";
import { areUiTimersPaused, useInterfacePaused } from "./usePausedTimers";

interface Zone {
  id: string;
  label: string;
  icon: string;
  tip: string; // eine Zeile Alltagssprache
  // Position in der Silhouette (0..100, % der ViewBox)
  spots: { x: number; y: number; r: number }[];
}

const ZONES: Zone[] = [
  {
    id: "gehirn",
    label: "Gehirn",
    icon: "🧠",
    tip: "Diese Zone leuchtet bei bestimmten Mahlzeitenwerten im Spiel. Sie zeigt keine Konzentration oder Gehirnfunktion einer Person.",
    spots: [{ x: 50, y: 10, r: 9 }],
  },
  {
    id: "schilddruese",
    label: "Schilddrüse",
    icon: "🦋",
    tip: "Diese Zone verwendet den Jodwert der Spielzutaten. Daraus lässt sich keine Aussage über eine Schilddrüse ableiten.",
    spots: [{ x: 50, y: 21, r: 4.5 }],
  },
  {
    id: "blut",
    label: "Blut",
    icon: "🩸",
    tip: "Diese Zone verwendet den Eisenwert der Spielzutaten. Blutwerte oder die Versorgung einer Person werden hier nicht erfasst.",
    spots: [{ x: 44, y: 32, r: 6 }],
  },
  {
    id: "darm",
    label: "Bauch & Darm",
    icon: "🌿",
    tip: "Diese Zone leuchtet, solange eine Spielmahlzeit aktiv ist. Das Bild beschreibt keine tatsächliche Verdauung.",
    spots: [{ x: 50, y: 46, r: 7.5 }],
  },
  {
    id: "muskeln",
    label: "Muskeln",
    icon: "💪",
    tip: "Diese Zone folgt dem zeitlich begrenzten Energiewert einer Spielmahlzeit. Daraus lässt sich keine körperliche Wirkung ableiten.",
    spots: [
      { x: 30, y: 34, r: 5 },
      { x: 70, y: 34, r: 5 },
      { x: 42, y: 72, r: 5.5 },
      { x: 58, y: 72, r: 5.5 },
    ],
  },
];

interface ZoneStatus {
  lit: boolean;
  strained?: boolean; // z. B. Zucker-Crash
  reason: string; // warum beleuchtet (kurz)
}

export function useBodyStatus(): Record<string, ZoneStatus> {
  const paused = useInterfacePaused();
  const [now, setNow] = useState(() => getWorld()?.getGameTime() ?? Date.now());
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => { if (!areUiTimersPaused()) setNow(getWorld()?.getGameTime() ?? Date.now()); }, 1000);
    return () => window.clearInterval(id);
  }, [paused]);
  const world = getWorld();
  const save = world?.getSave();
  const meals = save?.activeMeals ?? [];
  const recent = save?.recentMicros ?? [];

  const microSum = (k: MicroKey) => recent.reduce((s, r) => s + (r.micros[k] ?? 0), 0);
  const bScore = (microSum("B1") + microSum("B6") + microSum("B12")) / 3;
  const eBonus = mealBonus(meals, "energie", now);
  const kBonus = mealBonus(meals, "konzentration", now);
  const crashing = eBonus < 0;

  return {
    gehirn: {
      lit: kBonus > 0 || bScore >= 20,
      reason: kBonus > 0 ? "Spielbonus Konzentration aktiv" : bScore >= 20 ? "B-Vitamin-Spielwert erreicht" : "",
    },
    schilddruese: {
      lit: microSum("iodine") >= 25,
      reason: microSum("iodine") >= 25 ? "Jod-Spielwert erreicht" : "",
    },
    blut: {
      lit: microSum("iron") >= 30,
      reason: microSum("iron") >= 30 ? "Eisen-Spielwert erreicht" : "",
    },
    darm: {
      lit: meals.length > 0,
      reason: meals.length > 0 ? "Spielmahlzeit aktiv" : "",
    },
    muskeln: {
      lit: eBonus > 0,
      strained: crashing,
      reason: eBonus > 0 ? "Spielbonus Energie aktiv" : crashing ? "Spielbonus vorübergehend vermindert" : "",
    },
  };
}

export function BodyMap() {
  const paused = useInterfacePaused();
  const status = useBodyStatus();
  const [hover, setHover] = useState<string | null>(null);
  const gfMode = getWorld()?.getSave().glutenFree ?? false;
  const recent = getWorld()?.getSave().recentMicros ?? [];
  const microSum = (k: MicroKey) => recent.reduce((s, r) => s + (r.micros[k] ?? 0), 0);

  return (
    <div className="flex gap-5 items-start">
      {/* Silhouette */}
      <svg viewBox="0 0 100 100" className="w-44 shrink-0" style={{ filter: "drop-shadow(0 0 6px rgba(120,180,255,0.15))" }}>
        {/* Figur */}
        <g fill="rgba(148,178,210,0.22)" stroke="rgba(180,205,230,0.4)" strokeWidth="0.8">
          <circle cx="50" cy="10" r="8" />
          <rect x="43" y="18" width="14" height="40" rx="6" />
          <rect x="27" y="22" width="7" height="26" rx="3.5" />
          <rect x="66" y="22" width="7" height="26" rx="3.5" />
          <rect x="40" y="58" width="8" height="32" rx="4" />
          <rect x="52" y="58" width="8" height="32" rx="4" />
        </g>
        {/* Leuchtende Zonen */}
        {ZONES.map((z) => {
          const st = status[z.id];
          if (!st?.lit && !st?.strained) return null;
          const col = st.strained ? "rgba(251,113,133,0.85)" : "rgba(110,231,183,0.85)";
          return (
            <g key={z.id} style={{ cursor: "pointer" }} onMouseEnter={() => setHover(z.id)} onMouseLeave={() => setHover(null)}>
              {z.spots.map((s, i) => (
                <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={col} opacity={0.28}>
                  {!paused && <animate attributeName="opacity" values="0.22;0.4;0.22" dur="3.2s" repeatCount="indefinite" />}
                </circle>
              ))}
              {z.spots.map((s, i) => (
                <circle key={`c${i}`} cx={s.x} cy={s.y} r={s.r * 0.45} fill={col} opacity={0.85} />
              ))}
            </g>
          );
        })}
        {/* unsichtbare Hover-Flächen auch für dunkle Zonen */}
        {ZONES.map((z) =>
          z.spots.map((s, i) => (
            <circle
              key={`${z.id}-h${i}`}
              cx={s.x}
              cy={s.y}
              r={Math.max(s.r, 5)}
              fill="transparent"
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHover(z.id)}
              onMouseLeave={() => setHover(null)}
            />
          )),
        )}
      </svg>

      {/* Legende + Tooltip */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {ZONES.map((z) => {
          const st = status[z.id];
          const active = hover === z.id;
          return (
            <div
              key={z.id}
              className={`rounded-lg border px-3 py-2 transition ${
                active ? "border-sky-400/50 bg-sky-900/30" : "border-white/10 bg-black/25"
              }`}
              onMouseEnter={() => setHover(z.id)}
              onMouseLeave={() => setHover(null)}
            >
              <div className="flex items-center gap-2 text-[13px]">
                <span>{z.icon}</span>
                <span className="text-white/90 font-medium">{z.label}</span>
                <span
                  className={`ml-auto text-[10px] rounded-full px-2 py-0.5 ${
                    st?.strained
                      ? "bg-rose-900/60 text-rose-200"
                      : st?.lit
                        ? "bg-emerald-900/60 text-emerald-200"
                        : "bg-white/5 text-white/35"
                  }`}
                >
                  {st?.strained ? "Spielabzug" : st?.lit ? "Spielwert aktiv" : "ohne Spielbonus"}
                </span>
              </div>
              {active && <div className="text-[11px] text-white/60 mt-1.5 leading-relaxed">{z.tip}</div>}
              {!active && st?.reason && <div className="text-[11px] text-emerald-200/50 mt-0.5">{st.reason}</div>}
            </div>
          );
        })}
        <p className="text-[10px] text-white/35 leading-relaxed pt-1">
          Die Karte bildet Mahlzeiten deiner Spielfigur ab. Farben und Werte gehören zu den Spielregeln;
          sie beschreiben keinen realen Körper und geben keine Ernährungs- oder Gesundheitsauskunft.
        </p>
        {/* Mangel-Wächter (nur Info): bei langem glutenfreien Spiel im Blick behalten */}
        {gfMode && (
          <div className="rounded-xl border border-amber-400/25 bg-amber-900/20 px-3 py-2.5 mt-2">
            <div className="text-[11px] uppercase tracking-wider text-amber-200/75 mb-1.5">🌾 Zutatenwerte im Glutenfrei-Spielmodus</div>
            <div className="space-y-1">
              {GF_WATCH.map((w) => {
                const sum = microSum(w.micro);
                const ok = sum >= 25;
                return (
                  <div key={w.micro} className="flex items-baseline gap-2 text-[11px]">
                    <span className={ok ? "text-emerald-300" : "text-amber-300"}>{ok ? "✓" : "•"}</span>
                    <span className="text-white/80 font-medium">{w.label}</span>
                    <span className="text-white/45">— im Spiel: {w.sources}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-white/35 mt-1.5 leading-relaxed">
              Diese Zuordnung gehört zum Kochspiel. Sie prüft keine Mangelzustände und ersetzt keine
              individuelle Ernährungsberatung.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
