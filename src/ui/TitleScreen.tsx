import { useState } from "react";
import { DISCLAIMER } from "../game/data";
import { loadGfMode, saveGfMode } from "../game/state";

export function TitleScreen({ ready, hasSave, onNew, onContinue, onEncounter }: {
  ready: boolean; hasSave: boolean; onNew: () => void; onContinue: () => void; onEncounter: () => void;
}) {
  const [gf, setGf] = useState(loadGfMode());
  return <main className="title-harbor">
    <div className="title-copy">
      <p className="scene-location">Eine fiktive Erkundung</p>
      <h1>Phänomenautik</h1>
      <div className="title-actions">
        <button className="primary-action" disabled={!ready} onClick={onEncounter}>Ankommen</button>
        <button className="text-action" disabled={!ready} onClick={hasSave ? onContinue : onNew}>{hasSave ? "Reise fortsetzen" : "Frei erkunden"}</button>
      </div>
      <details className="scene-details">
        <summary>Über die Reise</summary>
        <p>{DISCLAIMER}</p>
        <p>Du kannst jederzeit pausieren, dich zurückziehen oder gehen. Fiktive Herausforderungen mit Angriffen beginnen ausgeschaltet. Spielwerte beschreiben die erfundene Welt; sie sagen nichts über deinen gesundheitlichen Zustand.</p>
        <p>Der ruhige Steg lässt sich mit der Tastatur bedienen. In der freien Inselwelt: WASD zum Gehen, Maus zum Schauen, E zum Ansprechen, Escape für Pause.</p>
        <label className="recipe-choice"><input type="checkbox" checked={gf} onChange={e => { setGf(e.target.checked); saveGfMode(e.target.checked); }} /> Glutenfreie Spielrezepte bevorzugen</label>
        <p>Die Rezeptwahl ist eine Spieleinstellung und keine Ernährungsempfehlung.</p>
        <p className="review-status">Fachliche Prüfung und Prüfung durch Menschen mit eigener Erfahrung: Prüfung offen.</p>
      </details>
    </div>
  </main>;
}
