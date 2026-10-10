// PHÄNOMENAUTIK 3 — Bau-Chat (Revolution I): Freitext-Bauanweisungen in
// deutscher Grammatik. Parser → Rezeptprüfung → Geist-Vorschau in der Welt.

import { useEffect, useRef, useState } from "react";
import { store } from "../game/store";
import { getWorld } from "../game/runtime";
import { parseBuildCommand, missingMaterials, matName } from "../game/materials";
import { audio } from "../game/audio";
import { areUiTimersPaused, useInterfacePaused } from "./usePausedTimers";

interface Line {
  who: "me" | "sys";
  text: string;
}

const OPENING: Line = {
  who: "sys",
  text: "Was soll gebaut werden? Zum Beispiel: „baue floß“, „baue eine leiter“, „brücke über das wasser“. Hilfe gibt's mit „hilfe“.",
};

export function ChatOverlay() {
  const [open, setOpen] = useState(store.get().chatOpen);
  useEffect(() => store.subscribe(() => setOpen(store.get().chatOpen)), []);
  if (!open) return null;
  return <ChatInner />;
}

function ChatInner() {
  const paused = useInterfacePaused();
  const [lines, setLines] = useState<Line[]>([OPENING]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 999999 });
  }, [lines]);

  const close = () => { if (!areUiTimersPaused()) store.set({ chatOpen: false }); };

  const answer = (raw: string): string => {
    const world = getWorld();
    if (!world) return "Die Welt lädt noch …";
    const parsed = parseBuildCommand(raw);
    const save = world.getSave();

    if (parsed.kind === "help") {
      return "Grammatik: BAUE <objekt>. Baubar: Floß (4 Treibstamm + 2 Hanseil), Strickleiter (3 Stangen + 1 Hanseil), Bohlenbrücke (4 Bohlen + 2 Hanseil) — und Geräte: Gleitschirm (2 Tuch + 2 Stangen + Windkern, wird gefertigt), Ventilator (2 Stangen + 1 Tuch + Windkern), Aufzug (2 Stangen + 2 Seile + 2 Steine + Erdkern). Kerne sind seltene Funde im Landesinneren. Inventar im Journal (J).";
    }
    if (parsed.kind === "build") {
      const def = parsed.def;
      const missing = missingMaterials(def, save.materials);
      if (missing.length > 0) {
        return `Für „${def.name}“ fehlt dir: ${missing.map((m) => `${m.need}× ${matName(m.id)}`).join(", ")}. Treibstämme treiben an Stränden, Seile und Tuche am Ankerplatz, Stangen im Wald.`;
      }
      world.beginBuild(def.id);
      store.set({ chatOpen: false });
      return `${def.name}: Material reicht. Die Geist-Vorschau folgt dir — [E] baut, [Esc] bricht ab. ${def.hint}`;
    }
    return "Das verstehe ich (noch) nicht. Sag zum Beispiel „baue floß“ oder „hilfe“.";
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || areUiTimersPaused()) return;
    audio.select();
    const reply = answer(text);
    setLines((l) => [...l, { who: "me", text }, { who: "sys", text: reply }]);
    setInput("");
  };

  return (
    <div className="absolute left-1/2 bottom-24 -translate-x-1/2 z-30 pointer-events-auto w-[min(560px,92vw)]">
      <div className="rounded-2xl border border-white/15 bg-[#0d1522]/92 backdrop-blur-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/10">
          <span className="text-sm font-semibold text-amber-100">🔨 Bau-Chat</span>
          <button className="text-white/50 hover:text-white px-2" onClick={close} disabled={paused} title="Schließen (Esc)">
            ✕
          </button>
        </div>
        <div ref={scrollRef} className="max-h-44 overflow-y-auto px-4 py-3 space-y-2.5">
          {lines.map((l, i) =>
            l.who === "sys" ? (
              <div key={i} className="text-[13px] leading-relaxed text-sky-50">{l.text}</div>
            ) : (
              <div key={i} className="text-[13px] text-right text-amber-200/90 italic">{l.text}</div>
            ),
          )}
        </div>
        <form className="flex gap-2 px-3 py-2.5 border-t border-white/10" onSubmit={submit}>
          <input
            disabled={paused}
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="baue floß …"
            className="flex-1 rounded-lg bg-black/40 border border-white/15 px-3 py-2 text-sm text-white outline-none focus:border-amber-300/60"
          />
          <button type="submit" disabled={paused} className="rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 text-sm transition">
            Bau
          </button>
        </form>
      </div>
    </div>
  );
}
