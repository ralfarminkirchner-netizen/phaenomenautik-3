// PHÄNOMENAUTIK 3 — NPC-Dialog-Overlay: freie Eingabe + Schnellthemen,
// lokale Dialog-KI (npcReply) mit Krisenerkennung, Quests, Gedächtnis.

import { useCallback, useEffect, useRef, useState } from "react";
import { NPCS, type NpcDef } from "../game/npc";
import { npcReply, questById } from "../game/dialogAI";
import { store } from "../game/store";
import { getWorld } from "../game/runtime";
import { audio } from "../game/audio";
import { areUiTimersPaused, useInterfacePaused, usePausedTypewriter } from "./usePausedTimers";

interface Line {
  who: "npc" | "me";
  text: string;
}

function NpcTypewriter({ text }: { text: string }) {
  const { shown, reveal } = usePausedTypewriter(text);
  return <span onClick={reveal}>{shown}</span>;
}

export function DialogOverlay() {
  const [npcId, setNpcId] = useState(store.get().dialogNpc);
  useEffect(() => store.subscribe(() => setNpcId(store.get().dialogNpc)), []);
  if (!npcId) return null;
  const npc = NPCS.find((n) => n.id === npcId);
  if (!npc) return null;
  return <DialogInner key={npc.id} npc={npc} />;
}

function DialogInner({ npc }: { npc: NpcDef }) {
  const world = getWorld()!;
  const paused = useInterfacePaused();
  const [lines, setLines] = useState<Line[]>(() => [{ who: "npc", text: npc.greeting }]);
  const [input, setInput] = useState("");
  const [turn, setTurn] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
  }, [lines]);

  const ask = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text || areUiTimersPaused()) return;
      const save = world.getSave();
      const reply = npcReply(npc, text, save, turn);
      audio.select();
      setLines((l) => [...l, { who: "me", text }, { who: "npc", text: reply.text }]);
      setTurn((t) => t + 1);
      setInput("");
      if (reply.action) {
        if (reply.action.type === "setName") {
          save.playerName = reply.action.name;
        } else if (reply.action.type === "acceptQuest") {
          save.quests[reply.action.questId] = "active";
        } else if (reply.action.type === "turnInQuest") {
          const q = questById(reply.action.questId);
          if (q) {
            q.applyReward(save);
            save.quests[reply.action.questId] = "done";
            audio.victory();
          }
        }
        // Themen merken
        const mem = save.npcMemory[npc.id] ?? { met: true, topics: [], favors: 0 };
        if (!mem.topics.includes(text.slice(0, 24))) mem.topics.push(text.slice(0, 24));
        save.npcMemory[npc.id] = mem;
        world.persistPublic();
      }
    },
    [npc, turn, world],
  );

  const close = () => {
    if (areUiTimersPaused()) return;
    audio.cancel();
    store.set({ dialogNpc: null });
  };

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 pointer-events-auto flex justify-center px-4 pb-4">
      <div className="w-full max-w-2xl rounded-2xl border border-white/15 bg-[#0d1522]/92 backdrop-blur-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-black/40 border-b border-white/10">
          <div>
            <span className="font-bold text-amber-100">{npc.name}</span>
            <span className="ml-2 text-xs italic text-white/50">{npc.role}</span>
          </div>
          <button className="text-white/50 hover:text-white text-lg px-2" onClick={close} disabled={paused} title="Beenden (Esc)">
            ✕
          </button>
        </div>
        <div ref={scrollRef} className="max-h-[38vh] overflow-y-auto px-4 py-3 space-y-3">
          {lines.map((l, i) =>
            l.who === "npc" ? (
              <div key={i} className="text-sm leading-relaxed text-sky-50 whitespace-pre-wrap">
                {i === lines.length - 1 ? <NpcTypewriter text={l.text} /> : l.text}
              </div>
            ) : (
              <div key={i} className="text-sm text-right text-amber-200/90 italic">{l.text}</div>
            ),
          )}
        </div>
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {npc.chips.map((c) => (
            <button
              key={c}
              disabled={paused}
              className="rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 px-3 py-1 text-xs text-white/85 transition"
              onClick={() => ask(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <form
          className="flex gap-2 px-4 py-3 border-t border-white/10"
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
        >
          <input
            disabled={paused}
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Sag etwas zu ${npc.name} … (frei schreiben, z. B. „Ich heiße …“)`}
            className="flex-1 rounded-lg bg-black/40 border border-white/15 px-3 py-2 text-sm text-white outline-none focus:border-amber-300/60"
          />
          <button type="submit" disabled={paused} className="rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 text-sm transition">
            Senden
          </button>
        </form>
      </div>
    </div>
  );
}
