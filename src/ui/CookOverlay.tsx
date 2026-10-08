// PHÄNOMENAUTIK 3 — Koch-UI am Feuer (M3): 1–5 Zutaten kombinieren, live
// Nährwertkarte (Makros als Balken, Mikros als Symbole), Wirkung + Wirkdauer,
// Gluten-Status. Werte kommen aus dem echten Datenmodell (game/cooking.ts).

import { useEffect, useMemo, useState } from "react";
import { store } from "../game/store";
import { getWorld } from "../game/runtime";
import { computeDish, INGREDIENTS, type DishResult, type GlutenStatus } from "../game/cooking";
import { audio } from "../game/audio";

const GLUTEN_BADGE: Record<GlutenStatus, { icon: string; label: string; cls: string }> = {
  frei: { icon: "🌾", label: "glutenfrei", cls: "text-emerald-300 border-emerald-400/40 bg-emerald-900/40" },
  verdaechtig: { icon: "🌾", label: "verdächtig (Verarbeitung)", cls: "text-amber-300 border-amber-400/40 bg-amber-900/40" },
  haltig: { icon: "🌾", label: "enthält Gluten", cls: "text-rose-300 border-rose-400/40 bg-rose-900/40" },
};

const MICRO_META: Record<string, { icon: string; label: string }> = {
  B1: { icon: "🧠", label: "B1" },
  B6: { icon: "🧠", label: "B6" },
  B12: { icon: "🧠", label: "B12" },
  folate: { icon: "🌿", label: "Folat" },
  C: { icon: "🍊", label: "C" },
  D: { icon: "☀️", label: "D" },
  iron: { icon: "🩸", label: "Eisen" },
  magnesium: { icon: "💪", label: "Magnesium" },
  zinc: { icon: "🛡", label: "Zink" },
  iodine: { icon: "🦋", label: "Jod" },
  calcium: { icon: "🦴", label: "Calcium" },
};

function MacroBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="w-40 text-white/70">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-black/40 border border-white/10 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-14 text-right tabular-nums text-white/85">{value.toFixed(value < 10 ? 1 : 0)} g</span>
    </div>
  );
}

export function CookOverlay() {
  const [open, setOpen] = useState(store.get().cookOpen);
  useEffect(() => store.subscribe(() => setOpen(store.get().cookOpen)), []);
  if (!open) return null;
  return <CookInner />;
}

function CookInner() {
  const world = getWorld();
  const [pot, setPot] = useState<string[]>([]);
  const [result, setResult] = useState<DishResult | null>(null);
  const [, forceTick] = useState(0);

  const save = world?.getSave();
  const food = save?.food ?? {};

  const dish = useMemo(() => (pot.length ? computeDish(pot) : null), [pot]);

  const close = () => store.set({ cookOpen: false });

  const add = (id: string) => {
    if (pot.length >= 5) return;
    const inPot = pot.filter((p) => p === id).length;
    if ((food[id] ?? 0) <= inPot) return;
    setPot([...pot, id]);
    setResult(null);
  };
  const removeAt = (idx: number) => {
    setPot(pot.filter((_, i) => i !== idx));
    setResult(null);
  };

  const cook = () => {
    if (!world || !dish || pot.length === 0) return;
    const res = world.cookDish(pot);
    if (res) {
      setResult(res);
      setPot([]);
      forceTick((n) => n + 1); // Vorrat neu lesen
      audio.confirm();
    } else {
      audio.cancel();
    }
  };

  const available = INGREDIENTS.filter((i) => (food[i.id] ?? 0) > 0);
  const badge = dish ? GLUTEN_BADGE[dish.gluten] : null;

  return (
    <div className="absolute inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center pointer-events-auto z-20">
      <div className="bg-slate-900/95 border border-white/15 rounded-2xl shadow-2xl w-[760px] max-w-[94vw] max-h-[88vh] flex flex-col">
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/10">
          <h2 className="text-lg font-bold text-white tracking-wide">🔥 Kochen am Feuer</h2>
          <button onClick={close} className="text-white/50 hover:text-white text-xl leading-none px-2" aria-label="Schließen">
            ×
          </button>
        </div>

        <div className="flex gap-5 px-6 py-4 overflow-hidden">
          {/* Vorrat */}
          <div className="w-64 shrink-0 flex flex-col">
            <div className="text-[11px] uppercase tracking-wider text-white/50 mb-2">Vorrat (klicken = in den Topf)</div>
            <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 min-h-[180px]">
              {available.length === 0 && (
                <div className="text-white/40 text-sm">Der Vorrat ist leer. Sammle Beeren, Pilze, Fische und Kräuter in der Welt.</div>
              )}
              {available.map((ing) => {
                const left = (food[ing.id] ?? 0) - pot.filter((p) => p === ing.id).length;
                return (
                  <button
                    key={ing.id}
                    onClick={() => add(ing.id)}
                    disabled={left <= 0 || pot.length >= 5}
                    className="w-full flex items-center justify-between rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-35 border border-white/10 px-3 py-1.5 text-left transition"
                  >
                    <span className="text-sm text-white/90">{ing.name}</span>
                    <span className="text-xs text-white/50 tabular-nums">×{left}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-3">
              <div className="text-[11px] uppercase tracking-wider text-white/50 mb-1.5">Topf ({pot.length}/5)</div>
              <div className="flex flex-wrap gap-1.5 min-h-[34px] rounded-lg bg-black/30 border border-dashed border-white/15 p-1.5">
                {pot.map((id, i) => (
                  <button
                    key={`${id}-${i}`}
                    onClick={() => removeAt(i)}
                    title="Zurücklegen"
                    className="rounded-md bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs px-2 py-1 hover:bg-rose-500/25"
                  >
                    {INGREDIENTS.find((x) => x.id === id)?.name} ✕
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Nährwertkarte */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            {!dish && !result && (
              <div className="h-full flex items-center justify-center text-center text-white/40 text-sm px-6">
                Wähle 1–5 Zutaten. Die Nährwertkarte zeigt, was die Mahlzeit dem Körper gibt —
                echte Werte, ehrliche Wirkung.
              </div>
            )}
            {result && !dish && (
              <div className="mb-3 rounded-xl bg-emerald-900/40 border border-emerald-400/30 px-4 py-3">
                <div className="text-emerald-200 font-semibold">„{result.name}“ ist serviert.</div>
                <div className="text-emerald-100/70 text-xs mt-1">
                  {result.matchedRecipeId ? "Rezept notiert — steht jetzt im Journal." : "Eine Improvisation. Manche Kombinationen wirken besonders …"}
                </div>
              </div>
            )}
            {dish && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-white font-bold">{dish.name}</div>
                    <div className="text-white/50 text-xs tabular-nums">
                      {dish.grams} g · {dish.kcal} kcal
                    </div>
                  </div>
                  {badge && (
                    <span className={`text-[11px] rounded-full border px-2.5 py-1 ${badge.cls}`} title="Gluten-Status">
                      {badge.icon} {badge.label}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <MacroBar label="Kohlenhydrate" value={dish.carbs} max={60} color="bg-amber-400" />
                  <MacroBar label="davon Zucker" value={dish.sugar} max={30} color="bg-rose-400" />
                  <MacroBar label="Protein" value={dish.protein} max={35} color="bg-sky-400" />
                  <MacroBar label="Fett" value={dish.fat} max={40} color="bg-violet-400" />
                  <MacroBar label="Ballaststoffe" value={dish.fiber} max={15} color="bg-emerald-400" />
                  <MacroBar label="Omega-3" value={dish.omega3} max={4} color="bg-cyan-300" />
                </div>

                {Object.entries(dish.micros).filter(([, v]) => (v ?? 0) >= 10).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {Object.entries(dish.micros)
                      .filter(([, v]) => (v ?? 0) >= 10)
                      .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
                      .map(([k, v]) => (
                        <span key={k} className="text-[11px] rounded-full bg-white/8 border border-white/15 px-2 py-0.5 text-white/85" title={`${MICRO_META[k]?.label}: % Tagesbedarf`}>
                          {MICRO_META[k]?.icon} {MICRO_META[k]?.label} {Math.round(v ?? 0)} %
                        </span>
                      ))}
                  </div>
                )}

                {dish.effects.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {dish.effects.map((e, i) => (
                      <div key={i} className="text-xs text-white/85 flex items-start gap-2">
                        <span>{e.kind === "energie" ? "⚡" : e.kind === "konzentration" ? "🧠" : "🌿"}</span>
                        <span>
                          {e.label} · {Math.round(e.durationSec / 60)} Min
                          {e.crashAfterSec !== undefined && <span className="text-rose-300/90"> · danach 1 Min Energieminus</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {dish.notes.length > 0 && (
                  <div className="text-[11px] text-white/45 leading-relaxed border-t border-white/10 pt-2">
                    {dish.notes.map((n, i) => (
                      <div key={i}>{n}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-6 pb-5">
          <div className="text-[11px] text-white/40">Rezepte findest du in der Welt — oder probiere Kombinationen aus.</div>
          <button
            onClick={cook}
            disabled={!dish}
            className="rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold px-6 py-2.5 transition"
          >
            Kochen &amp; Essen
          </button>
        </div>
      </div>
    </div>
  );
}
