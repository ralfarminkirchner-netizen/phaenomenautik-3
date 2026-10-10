import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { type GentleEncounterState, type SaveGame } from "../game/state";
import { store } from "../game/store";
import type { PresentationMode } from "../three/world";

export const ATLAS_HREF = "http://127.0.0.1:4322/ganzsein?ganz=understand&encounter=flimmerbucht-r1";
const initial: GentleEncounterState = { step: "arrival", choice: null, completed: false };
const choices = [
  { id: "look" as const, label: "Zum Stegende", result: "Blick vom Steg" },
  { id: "mark" as const, label: "Boje setzen", result: "Die Boje liegt am Steg" },
  { id: "distance" as const, label: "Zum Ufer", result: "Blick vom Ufer" },
];

export function GentleEncounter({ save, checkpoint, onScene, onChange, onClose, onRetreat }: {
  save: SaveGame; checkpoint: () => boolean; onScene: (mode: PresentationMode) => void;
  onChange: (next: GentleEncounterState) => void; onClose: () => void; onRetreat: () => void;
}) {
  const [state, setState] = useState<GentleEncounterState>(() => save.gentleEncounter && ["arrival", "signs", "choice", "result", "context"].includes(save.gentleEncounter.step) ? save.gentleEncounter : initial);
  const h = useSyncExternalStore(cb => store.subscribe(cb), () => store.get());
  const heading = useRef<HTMLHeadingElement>(null);
  const [atlasChecked, setAtlasChecked] = useState(false);
  const mode = state.choice || (state.step === "signs" || state.step === "choice" ? "look" : "arrival");
  useEffect(() => { onScene(mode); }, [mode, onScene]);
  useEffect(() => { if (!h.protectionOpen) heading.current?.focus(); }, [state.choice, h.protectionOpen]);
  const change = (next: Partial<GentleEncounterState>) => { const value = { ...state, ...next }; setState(value); onChange(value); };
  const openAtlas = (event: React.MouseEvent<HTMLAnchorElement>) => { if (!checkpoint()) { event.preventDefault(); return; } setAtlasChecked(true); };
  const selected = choices.find(choice => choice.id === state.choice);
  return <section className={`gentle-encounter ${h.protectionOpen ? "surface-paused" : ""}`} aria-label="Fiktive Begegnung Flimmerbucht" inert={Boolean(h.protectionOpen || h.paused)}>
    <div className="encounter-copy">
      <p className="scene-location">Flimmerbucht · Fiktive Erkundung</p>
      <h1 ref={heading} tabIndex={-1}>{selected?.result || "Am ruhigen Steg"}</h1>
      <div className="encounter-choices">{choices.map(choice => <button key={choice.id} aria-pressed={state.choice === choice.id} onClick={() => change({ choice: choice.id, step: "result", completed: false })}>{choice.label}</button>)}</div>
      <div className="encounter-return">
        <button className="text-action" onClick={onRetreat}>Zurückziehen</button>
        <button className="text-action" onClick={() => { change({ step: "context", completed: true }); onClose(); }}>Begegnung abschließen</button>
      </div>
      <details className="scene-details">
        <summary>Kontext und Atlas</summary>
        <p>Dies ist eine fiktive Erkundung. Spielwerte und ein Abschluss sagen nichts über Gesundheit oder psychische Bewältigung aus. Jede Handlung ist ohne Ton und ohne Zeitlimit möglich und kostet keine Spielressourcen.</p>
        <p>Der Atlas bietet Kontext. Eigene Beobachtungen werden nur auf deinen ausdrücklichen Wunsch im vorhandenen GANZ-SEiN-Speicher bewahrt.</p>
        <a className="atlas-link" href={ATLAS_HREF} target="_blank" rel="noreferrer" onClick={openAtlas}>Im vorhandenen Atlas ansehen</a>
        {atlasChecked && <p role="status">Der Spielstand ist gesichert. Der Atlas öffnet in einer eigenen Ansicht.</p>}
        <p className="review-status">Fachliche Prüfung und Rückmeldungen von Menschen mit eigener Erfahrung: Prüfung offen.</p>
      </details>
    </div>
  </section>;
}
