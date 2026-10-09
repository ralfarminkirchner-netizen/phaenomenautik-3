// PHÄNOMENAUTIK 3 — Titelbildschirm mit Intro-Sequenz und Disclaimer

import { useState } from "react";
import { DISCLAIMER, INTRO_TEXT } from "../game/data";
import { loadGfMode, saveGfMode } from "../game/state";

export function TitleScreen({
  hasSave,
  onNew,
  onContinue,
}: {
  hasSave: boolean;
  onNew: () => void;
  onContinue: () => void;
}) {
  const [showIntro, setShowIntro] = useState(false);
  const [introStep, setIntroStep] = useState(0);
  const [gf, setGf] = useState(loadGfMode());

  const lines = INTRO_TEXT;
  const advance = () => {
    if (introStep < lines.length - 1) setIntroStep(introStep + 1);
    else onNew();
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gradient-to-b from-[#0a1626] via-[#10283e] to-[#0a1c2c] text-white overflow-hidden">
      {/* dekorativer Wellen-Schimmer */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          background:
            "radial-gradient(ellipse 80% 45% at 50% 108%, rgba(70,160,190,0.5), transparent 70%), radial-gradient(ellipse 40% 25% at 70% 110%, rgba(120,200,220,0.35), transparent 70%)",
        }}
      />
      {!showIntro ? (
        <div className="relative z-10 flex flex-col items-center px-6">
          <div className="text-amber-300/90 text-sm tracking-[0.5em] mb-3">EINE REISE DURCH DEN TRAUMAATLAS</div>
          <h1 className="text-6xl md:text-7xl font-black tracking-wide mb-2 text-center" style={{ textShadow: "0 4px 30px rgba(80,170,220,0.45)" }}>
            PHÄNOMENAUTIK
          </h1>
          <div className="text-white/60 mb-12 text-center">
            Steuere die Inseln an. Begegne den Phänomenen. Überwinde sie — oder verstehe sie, was mehr ist.
          </div>
          <div className="flex flex-col gap-3 w-72">
            {hasSave && (
              <button
                className="py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-lg transition shadow-lg shadow-amber-500/20"
                onClick={onContinue}
              >
                Weitersegeln
              </button>
            )}
            <button
              className={`py-3.5 rounded-xl font-bold text-lg transition shadow-lg ${
                hasSave
                  ? "bg-slate-700/80 hover:bg-slate-600 text-white"
                  : "bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20"
              }`}
              onClick={() => setShowIntro(true)}
            >
              Neue Reise
            </button>
          </div>
          <div className="mt-10 text-white/40 text-xs text-center max-w-md leading-relaxed">
            WASD/Segeln · Maus Umschauen · E Interagieren · F3 FPS · M Ton
          </div>
          <button
            className={`mt-4 flex items-center gap-2.5 rounded-full border px-4 py-2 text-xs transition ${
              gf ? "border-emerald-400/50 bg-emerald-900/40 text-emerald-200" : "border-white/15 bg-black/30 text-white/50 hover:text-white/75"
            }`}
            onClick={() => {
              const next = !gf;
              setGf(next);
              saveGfMode(next);
            }}
            title="Praktisch glutenfrei kochen lernen — spielerisch, nicht klinisch. Jederzeit im Journal umschaltbar."
          >
            <span className={`w-2.5 h-2.5 rounded-full ${gf ? "bg-emerald-400" : "bg-white/25"}`} />
            🌾 Glutenfrei-Modus {gf ? "an" : "aus"}
          </button>
        </div>
      ) : (
        <button className="relative z-10 max-w-2xl px-8 text-center cursor-pointer" onClick={advance}>
          <div className="min-h-[300px] flex flex-col justify-center gap-1.5">
            {lines.slice(0, introStep + 1).map((l, i) => (
              <p
                key={i}
                className={`text-lg md:text-xl leading-relaxed transition-all duration-700 ${
                  l === "" ? "h-4" : i < introStep - 2 ? "text-white/35" : i === introStep ? "text-amber-100" : "text-white/70"
                }`}
              >
                {l}
              </p>
            ))}
          </div>
          <div className="mt-8 text-white/40 text-sm animate-pulse">
            {introStep < lines.length - 1 ? "Klicken zum Weiterlesen" : "Klicken zum Ablegen"}
          </div>
        </button>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-[11px] leading-relaxed text-white/45 bg-black/30">
        {DISCLAIMER}
      </div>
    </div>
  );
}
