// PHÄNOMENAUTIK 3 — Journal: Erkenntnisse, Aufgaben, Lore, Beziehungen.
// Mit Disclaimer (Pflicht an Titel/Journal/Abspann).

import { useEffect, useState } from "react";
import { PHENOMENA, DISCLAIMER } from "../game/data";
import { LORE } from "../game/echoes";
import { NPCS } from "../game/npc";
import { activeQuests, QUESTS } from "../game/quests";
import { store } from "../game/store";
import { getWorld } from "../game/runtime";
import { MATERIALS, matName } from "../game/materials";
import { RECIPES, INGREDIENTS, GF_DISCLAIMER } from "../game/cooking";
import { TACTICS } from "../game/duels";
import { saveGfMode } from "../game/state";
import { BodyMap } from "./BodyMap";

type JournalTab = "atlas" | "koerper" | "rezepte" | "kompass";

export function JournalOverlay() {
  const [open, setOpen] = useState(store.get().journalOpen);
  const [tab, setTab] = useState<JournalTab>("atlas");
  useEffect(() => store.subscribe(() => setOpen(store.get().journalOpen)), []);
  if (!open) return null;
  const world = getWorld()!;
  const save = world.getSave();

  const overcome = save.islands.filter((i) => i.overcome);
  const quests = activeQuests(save);
  const foundLore = LORE.filter((l) => save.echoesFound.includes(l.id));
  const metNpcs = NPCS.filter((n) => save.npcMemory[n.id]?.met);
  const remaining = PHENOMENA.filter((p) => !p.final && !save.islands.find((i) => i.id === p.id)?.overcome).length;
  const foundRecipes = RECIPES.filter((r) => save.recipesFound.includes(r.id));
  const foodStock = Object.entries(save.food).filter(([, n]) => n > 0);

  const TABS: { id: JournalTab; label: string }[] = [
    { id: "atlas", label: "🗺 Atlas" },
    { id: "koerper", label: "🧍 Körper" },
    { id: "rezepte", label: "🍲 Rezepte" },
    { id: "kompass", label: "🧭 Kompass" },
  ];

  return (
    <div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-sm flex items-center justify-center pointer-events-auto p-6">
      <div className="w-full max-w-2xl max-h-[86vh] flex flex-col rounded-2xl border border-amber-200/20 bg-[#101a2a] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-black/30">
          <h2 className="text-lg font-bold text-amber-100 tracking-wide">📖 Atlas-Journal</h2>
          <button className="text-white/50 hover:text-white text-lg px-2" onClick={() => store.set({ journalOpen: false })} title="Schließen (J/Esc)">
            ✕
          </button>
        </div>
        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-3 bg-black/20">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-t-lg px-4 py-2 text-sm font-medium transition ${
                tab === t.id ? "bg-[#16233a] text-amber-100 border border-white/10 border-b-transparent" : "text-white/45 hover:text-white/75"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="overflow-y-auto px-5 py-4 space-y-6 text-sm bg-[#16233a]">
          {tab === "koerper" && (
            <section>
              <h3 className="text-xs uppercase tracking-widest text-sky-300/70 mb-3">Körperkarte — was wirkt gerade?</h3>
              <BodyMap />
            </section>
          )}
          {tab === "kompass" && (
            <section>
              <h3 className="text-xs uppercase tracking-widest text-purple-300/70 mb-2">
                Manipulations-Kompass ({save.compassEntries.length}/{TACTICS.length})
              </h3>
              {save.compassEntries.length === 0 ? (
                <p className="text-white/50 italic">
                  Noch leer. Manche Menschen auf Reisen wollen dich zu etwas bringen — benenne, was sie tun, und es
                  verliert seine Macht. Die Taktik, wie sie sich anfühlt und das Gegenmittel landen dann hier.
                </p>
              ) : (
                <ul className="space-y-2">
                  {TACTICS.filter((t) => save.compassEntries.includes(t.id)).map((t) => (
                    <li key={t.id} className="rounded-lg bg-purple-900/20 border border-purple-400/20 px-3 py-2.5">
                      <div className="font-semibold text-purple-100">{t.name}</div>
                      <div className="text-white/60 text-xs mt-0.5">
                        <span className="text-white/40">Wie sie sich anfühlt:</span> {t.feelsLike}
                      </div>
                      <div className="text-emerald-200/80 text-xs mt-1">
                        <span className="text-emerald-200/50">Gegenmittel:</span> {t.counter}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-white/35 text-[11px] leading-relaxed mt-3">
                Diese Dynamiken lernst du hier im fiktiven Rahmen — damit du sie draußen früher erkennst. Erkennen ist
                kein Vorwurf: Es ist der Moment, in dem ein Muster seine Macht verliert.
              </p>
            </section>
          )}
          {tab === "rezepte" && (
            <>
              <section>
                {/* Glutenfrei-Modus: jederzeit umschaltbar */}
                <button
                  className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                    save.glutenFree
                      ? "border-emerald-400/40 bg-emerald-900/30"
                      : "border-white/10 bg-black/25 hover:border-white/25"
                  }`}
                  onClick={() => {
                    save.glutenFree = !save.glutenFree;
                    saveGfMode(save.glutenFree);
                    store.set({ glutenFree: save.glutenFree });
                    world.saveNow();
                  }}
                >
                  <span className={`w-3 h-3 rounded-full shrink-0 ${save.glutenFree ? "bg-emerald-400" : "bg-white/20"}`} />
                  <span>
                    <span className={`block text-sm font-medium ${save.glutenFree ? "text-emerald-200" : "text-white/75"}`}>
                      🌾 Glutenfrei-Modus {save.glutenFree ? "an" : "aus"}
                    </span>
                    <span className="block text-[11px] text-white/45 mt-0.5">
                      Praktisch glutenfrei kochen lernen: Tagging, Tausch-Vorschläge, sichere Vorratskammer.
                    </span>
                  </span>
                </button>
                {save.glutenFree && <p className="text-[10px] text-white/40 leading-relaxed mt-2">{GF_DISCLAIMER}</p>}
              </section>
              <section>
                <h3 className="text-xs uppercase tracking-widest text-sky-300/70 mb-2">Gelernte Rezepte ({foundRecipes.length}/{RECIPES.length})</h3>
                {foundRecipes.length === 0 ? (
                  <p className="text-white/50 italic">Noch keine. Koch am Feuer (K) und probiere Kombinationen — was wirkt, wird notiert.</p>
                ) : (
                  <ul className="space-y-2">
                    {foundRecipes.map((r) => (
                      <li key={r.id} className="rounded-lg bg-black/30 border border-white/10 px-3 py-2">
                        <div className="font-semibold text-amber-100">{r.name}</div>
                        <div className="text-white/60 text-xs">
                          {r.ingredients.map((id) => INGREDIENTS.find((i) => i.id === id)?.name ?? id).join(" · ")}
                        </div>
                        <div className="text-white/75 text-xs mt-1 italic">{r.text}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              <section>
                <h3 className="text-xs uppercase tracking-widest text-sky-300/70 mb-2">Vorrat ({foodStock.length})</h3>
                {foodStock.length === 0 ? (
                  <p className="text-white/50 italic">Leer. Beeren, Pilze, Algen, Fische und Kräuter warten in der Welt.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                    {foodStock.map(([id, n]) => {
                      const ing = INGREDIENTS.find((i) => i.id === id);
                      return (
                        <div key={id} className="rounded-lg bg-black/30 border border-white/10 px-2.5 py-1.5" title={ing ? `${ing.kcal} kcal/100 g · ${ing.source}` : ""}>
                          <div className="text-[13px] text-white/85">{ing?.name ?? id}</div>
                          <div className="text-[11px] text-sky-300/70">× {n} · {ing?.gluten === "frei" ? "🌾✓" : ing?.gluten === "haltig" ? "🌾✗" : "🌾?"}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}
          {tab === "atlas" && (
          <>
          {/* Fortschritt */}
          <section>
            <h3 className="text-xs uppercase tracking-widest text-sky-300/70 mb-2">Die Reise</h3>
            <p className="text-white/85">
              {overcome.length} von 12 Phänomenen überwunden
              {overcome.filter((i) => i.understood).length > 0 && `, davon ${overcome.filter((i) => i.understood).length} verstanden`}
              {save.finalUnlocked ? " — das Auge des Atlanten ist offen." : ` — ${remaining} warten noch.`}
            </p>
          </section>

          {/* Aufgaben */}
          <section>
            <h3 className="text-xs uppercase tracking-widest text-sky-300/70 mb-2">Aufgaben</h3>
            {quests.length === 0 ? (
              <p className="text-white/50 italic">Keine offenen Aufgaben. Die Menschen am Ankerplatz haben welche — frag sie.</p>
            ) : (
              <ul className="space-y-2">
                {quests.map((q) => (
                  <li key={q.id} className="rounded-lg bg-black/30 border border-white/10 px-3 py-2">
                    <div className="font-semibold text-amber-100">{q.title}</div>
                    <div className="text-white/70">{q.desc}</div>
                    <div className="text-xs text-sky-300/80 mt-1">{q.goalDesc(save)}</div>
                    <div className="text-[11px] text-emerald-300/70">Lohn: {q.reward}</div>
                  </li>
                ))}
              </ul>
            )}
            {QUESTS.filter((q) => save.quests[q.id] === "done").length > 0 && (
              <p className="text-white/40 text-xs mt-2">
                Erledigt: {QUESTS.filter((q) => save.quests[q.id] === "done").map((q) => q.title).join(" · ")}
              </p>
            )}
          </section>

          {/* Erkenntnisse */}
          <section>
            <h3 className="text-xs uppercase tracking-widest text-sky-300/70 mb-2">Erkenntnisse (Atlas)</h3>
            {overcome.length === 0 ? (
              <p className="text-white/50 italic">Noch keine. Die erste Insel wartet — folge dem Kompass.</p>
            ) : (
              <ul className="space-y-2">
                {overcome.map((i) => {
                  const p = PHENOMENA.find((pp) => pp.id === i.id)!;
                  return (
                    <li key={i.id} className="rounded-lg bg-black/30 border border-white/10 px-3 py-2">
                      <div className="font-semibold" style={{ color: `hsl(${p.hue}, 70%, 70%)` }}>
                        {p.name} {i.understood && <span className="text-amber-300 text-xs ml-1">— verstanden ✦</span>}
                      </div>
                      <div className="text-white/75 leading-relaxed">{p.insight}</div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Lore */}
          <section>
            <h3 className="text-xs uppercase tracking-widest text-sky-300/70 mb-2">Echos der Inseln ({foundLore.length}/{LORE.length})</h3>
            {foundLore.length === 0 ? (
              <p className="text-white/50 italic">Runensteine glühen bläulich. Berühre sie.</p>
            ) : (
              <ul className="space-y-1.5">
                {foundLore.map((l) => (
                  <li key={l.id} className="text-white/70 italic border-l-2 border-sky-400/40 pl-3">
                    {l.text}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Materialien */}
          <section>
            <h3 className="text-xs uppercase tracking-widest text-sky-300/70 mb-2">Materialien ({Object.keys(save.materials).filter((k) => (save.materials[k] ?? 0) > 0).length})</h3>
            {Object.keys(save.materials).filter((k) => (save.materials[k] ?? 0) > 0).length === 0 ? (
              <p className="text-white/50 italic">Noch leer. Material glänzt in der Welt — Treibstämme am Strand, Seile am Steg, Federn im Wald.</p>
            ) : (
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {Object.entries(save.materials)
                  .filter(([, n]) => (n ?? 0) > 0)
                  .map(([id, n]) => {
                    const def = MATERIALS.find((m) => m.id === id);
                    return (
                      <div key={id} className="rounded-lg bg-black/30 border border-white/10 px-2.5 py-1.5" title={def?.desc ?? ""}>
                        <div className="text-[13px] text-white/85">{matName(id)}</div>
                        <div className="text-[11px] text-sky-300/70">× {n} · {def?.kategorie ?? ""}</div>
                      </div>
                    );
                  })}
              </div>
            )}
            <p className="text-white/40 text-xs mt-2">Bauen mit Taste <span className="text-amber-300">T</span> — z. B. „baue floß“ (4 Treibstamm + 2 Hanseil).</p>
          </section>

          {/* Beziehungen */}
          <section>
            <h3 className="text-xs uppercase tracking-widest text-sky-300/70 mb-2">Menschen</h3>
            {metNpcs.length === 0 ? (
              <p className="text-white/50 italic">Der Ankerplatz ist bewohnt. Stell dich vor.</p>
            ) : (
              <ul className="space-y-1.5">
                {metNpcs.map((n) => (
                  <li key={n.id} className="text-white/80">
                    <span className="font-semibold text-amber-100">{n.name}</span>, {n.role}
                  </li>
                ))}
              </ul>
            )}
          </section>
          </>
          )}
        </div>
        <div className="px-5 py-3 border-t border-white/10 bg-black/30 text-[10px] leading-relaxed text-white/45">{DISCLAIMER}</div>
      </div>
    </div>
  );
}

/** Lore-Stein-Lesekarte */
export function LoreOverlay() {
  const [id, setId] = useState(store.get().loreStone);
  useEffect(() => store.subscribe(() => setId(store.get().loreStone)), []);
  if (!id) return null;
  const line = LORE.find((l) => l.id === id);
  if (!line) return null;
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none p-6">
      <div className="pointer-events-auto max-w-lg rounded-2xl border border-sky-300/25 bg-[#0c1626]/92 backdrop-blur-md px-6 py-5 shadow-2xl text-center">
        <div className="text-sky-300/70 text-xs uppercase tracking-widest mb-3">Runenstein</div>
        <p className="text-white/90 text-lg leading-relaxed italic mb-5">„{line.text}“</p>
        <button
          className="rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold px-6 py-2 text-sm transition"
          onClick={() => store.set({ loreStone: null })}
        >
          In sich ruhen lassen
        </button>
      </div>
    </div>
  );
}
