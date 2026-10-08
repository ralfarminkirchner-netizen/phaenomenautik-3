// PHÄNOMENAUTIK 3 — Journal: Erkenntnisse, Aufgaben, Lore, Beziehungen.
// Mit Disclaimer (Pflicht an Titel/Journal/Abspann).

import { useEffect, useState } from "react";
import { PHENOMENA, DISCLAIMER } from "../game/data";
import { LORE } from "../game/echoes";
import { NPCS } from "../game/npc";
import { activeQuests, QUESTS } from "../game/quests";
import { store } from "../game/store";
import { getWorld } from "../game/runtime";

export function JournalOverlay() {
  const [open, setOpen] = useState(store.get().journalOpen);
  useEffect(() => store.subscribe(() => setOpen(store.get().journalOpen)), []);
  if (!open) return null;
  const world = getWorld()!;
  const save = world.getSave();

  const overcome = save.islands.filter((i) => i.overcome);
  const quests = activeQuests(save);
  const foundLore = LORE.filter((l) => save.echoesFound.includes(l.id));
  const metNpcs = NPCS.filter((n) => save.npcMemory[n.id]?.met);
  const remaining = PHENOMENA.filter((p) => !p.final && !save.islands.find((i) => i.id === p.id)?.overcome).length;

  return (
    <div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-sm flex items-center justify-center pointer-events-auto p-6">
      <div className="w-full max-w-2xl max-h-[86vh] flex flex-col rounded-2xl border border-amber-200/20 bg-[#101a2a] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-black/30">
          <h2 className="text-lg font-bold text-amber-100 tracking-wide">📖 Atlas-Journal</h2>
          <button className="text-white/50 hover:text-white text-lg px-2" onClick={() => store.set({ journalOpen: false })} title="Schließen (J/Esc)">
            ✕
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4 space-y-6 text-sm">
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
