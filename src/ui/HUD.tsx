// PHÄNOMENAUTIK 3 — HUD: Kompassrose mit Zielmarkierung, Statusbalken,
// Ressourcen, Interaktions-Prompt, Toasts, Menü, Todesbildschirm.

import { useSyncExternalStore } from "react";
import { store } from "../game/store";
import { getWorld } from "../game/runtime";
import { DISCLAIMER } from "../game/data";

function useHud() {
  return useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => store.get(),
  );
}

const DIRS = ["N", "NO", "O", "SO", "S", "SW", "W", "NW"];

function Compass({ yaw, bearing, targetName, targetDist }: { yaw: number; bearing: string | number; targetName: string; targetDist: number }) {
  // Kompass-Strip: 240° sichtbar, Mitte = Blickrichtung
  const heading = Math.atan2(Math.sin(yaw), Math.cos(yaw));
  const items: { label: string; off: number; major: boolean }[] = [];
  for (let i = 0; i < 8; i++) {
    const ang = (i * Math.PI) / 4; // Nord = 0
    let off = ang - (-heading); // Kamera-Yaw in Kompassrichtung übersetzen
    while (off > Math.PI) off -= Math.PI * 2;
    while (off < -Math.PI) off += Math.PI * 2;
    items.push({ label: DIRS[i], off, major: i % 2 === 0 });
  }
  let tOff = (bearing as number) - -heading;
  while (tOff > Math.PI) tOff -= Math.PI * 2;
  while (tOff < -Math.PI) tOff += Math.PI * 2;
  const px = (o: number) => `${50 + (o / (Math.PI * 0.75)) * 50}%`;
  return (
    <div className="pointer-events-none select-none">
      <div className="relative w-[340px] h-8 overflow-hidden rounded-full bg-black/35 backdrop-blur-sm border border-white/15">
        {items.map((it) =>
          Math.abs(it.off) < Math.PI * 0.75 ? (
            <div
              key={it.label}
              className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold ${
                it.major ? "text-[13px] text-white/90" : "text-[10px] text-white/50"
              }`}
              style={{ left: px(it.off) }}
            >
              {it.label}
            </div>
          ) : null,
        )}
        {Math.abs(tOff) < Math.PI * 0.75 ? (
          <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-300 text-sm drop-shadow" style={{ left: px(tOff) }}>
            ◆
          </div>
        ) : (
          <div
            className={`absolute top-1/2 -translate-y-1/2 text-amber-300/80 text-xs ${tOff > 0 ? "right-1.5" : "left-1.5"}`}
          >
            {tOff > 0 ? "▶" : "◀"}
          </div>
        )}
        <div className="absolute left-1/2 top-0 h-full w-px bg-white/40" />
      </div>
      <div className="mt-1 text-center text-[11px] text-white/80 drop-shadow">
        {targetName} · {targetDist} m
      </div>
    </div>
  );
}

function Bar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="w-52">
      <div className="flex justify-between text-[10px] uppercase tracking-wider text-white/70 mb-0.5">
        <span>{label}</span>
        <span>
          {Math.round(value)}/{Math.round(max)}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-black/40 border border-white/10 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function HUD() {
  const h = useHud();
  if (h.mode === "title") return null;
  const overlayOpen = !!(h.dialogNpc || h.battlePhen || h.journalOpen || h.loreStone);

  const hh = Math.floor(h.timeOfDay);
  const mm = Math.floor((h.timeOfDay - hh) * 60);
  const buffLeft = h.fireBuffUntil > performance.now() ? Math.ceil((h.fireBuffUntil - performance.now()) / 1000) : 0;

  return (
    <div className="absolute inset-0 pointer-events-none font-sans">
      {/* Schadens-Vignette */}
      <div
        className="absolute inset-0 transition-opacity duration-200"
        style={{
          opacity: h.damageFlash,
          background: "radial-gradient(ellipse at center, transparent 45%, rgba(180,20,20,0.55) 100%)",
        }}
      />

      {/* Kompass oben mittig */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <Compass yaw={h.compassYaw} bearing={h.targetBearing} targetName={h.targetName} targetDist={h.targetDist} />
      </div>

      {/* Uhrzeit & Wetter */}
      <div className="absolute top-4 right-5 text-right text-white/80 text-xs drop-shadow">
        <div className="text-base font-semibold tabular-nums">
          {String(hh).padStart(2, "0")}:{String(mm).padStart(2, "0")}
        </div>
        <div>{h.storm > 0.6 ? "⛈ Sturm" : h.storm > 0.25 ? "🌦 Böig" : "🌊 Ruhige See"}</div>
        {h.showFps && <div className="mt-1 text-emerald-300">{h.fps} fps</div>}
      </div>

      {/* Statusbalken unten links */}
      <div className="absolute bottom-5 left-5 flex flex-col gap-2">
        <Bar value={h.stability} max={h.maxStability} color="bg-gradient-to-r from-teal-400 to-emerald-400" label="Stabilität" />
        <Bar value={h.presence} max={h.maxPresence} color="bg-gradient-to-r from-sky-400 to-indigo-400" label="Präsenz" />
        <Bar value={h.stamina} max={h.maxStamina} color="bg-gradient-to-r from-amber-400 to-lime-400" label="Ausdauer" />
        <div className="text-[10px] text-white/60 uppercase tracking-wider">Stufe {h.level}</div>
      </div>

      {/* Ressourcen unten rechts */}
      <div className="absolute bottom-5 right-5 text-right text-white/90 text-sm drop-shadow space-y-1">
        <div>🪵 Holz: <span className="font-semibold">{h.wood}</span></div>
        <div>💎 Kristalle: <span className="font-semibold">{h.crystals}</span></div>
        <div className="text-xs text-white/70">
          {h.weaponLevel >= 2 ? "⚔ Axt der Klarheit" : "🪓 Axt"}
          {buffLeft > 0 && <span className="ml-2 text-amber-300">🔥 {Math.floor(buffLeft / 60)}:{String(buffLeft % 60).padStart(2, "0")}</span>}
        </div>
      </div>

      {/* Interaktions-Prompt */}
      {h.prompt && !overlayOpen && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-2.5 rounded-xl bg-black/55 backdrop-blur px-4 py-2.5 border border-white/15 shadow-lg">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-amber-400 text-black font-bold text-sm shadow">
              {h.promptKey}
            </span>
            <span className="text-white/95 text-sm">{h.prompt}</span>
          </div>
        </div>
      )}

      {/* Steuerungshilfe */}
      {!overlayOpen && (
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-white/40 text-center">
        {h.mode === "sailing"
          ? "W/S Segel · A/D Ruder · Shift Turbo · Maus Umschauen · E Anlegen"
          : "WASD Laufen · Shift Sprint · Leertaste Sprung · Klick Axt · Q Ausweichen · E Interaktion · J Journal · T Bauen · Mooswände klettern"}
      </div>
      )}

      {/* Toasts */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        {h.toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2 rounded-lg text-sm shadow-lg backdrop-blur border ${
              t.kind === "good"
                ? "bg-emerald-900/70 border-emerald-400/30 text-emerald-100"
                : t.kind === "bad"
                  ? "bg-rose-900/70 border-rose-400/30 text-rose-100"
                  : "bg-slate-900/70 border-white/15 text-slate-100"
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>

      {/* Menü */}
      {h.menuOpen && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
          <div className="bg-slate-900/90 border border-white/15 rounded-2xl p-8 w-80 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6 text-center tracking-wide">Pause</h2>
            <div className="flex flex-col gap-3">
              <button
                className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold transition"
                onClick={() => store.set({ menuOpen: false })}
              >
                Weitersegeln
              </button>
              <button
                className="w-full py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition"
                onClick={() => {
                  getWorld()?.saveNow();
                  store.toast("Gespeichert.", "good");
                }}
              >
                Speichern
              </button>
              <button
                className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white/70 transition text-sm"
                onClick={() => window.location.reload()}
              >
                Zum Titel (speichert automatisch)
              </button>
            </div>
            <p className="mt-6 text-[10px] leading-relaxed text-white/45">{DISCLAIMER}</p>
          </div>
        </div>
      )}

      {/* Zusammenbruch */}
      {h.dead && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
          <div className="text-center max-w-md px-6">
            <div className="text-4xl mb-4">🌑</div>
            <h2 className="text-2xl font-bold text-white mb-3">Zusammenbruch</h2>
            <p className="text-white/70 mb-8 leading-relaxed">
              Die Stabilität ist auf null. Das ist kein Ende — nur ein Rückzug.
              Du wachst am Feuer des Ankerplatzes wieder auf.
            </p>
            <button
              className="px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition"
              onClick={() => getWorld()?.respawn()}
            >
              Aufwachen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
