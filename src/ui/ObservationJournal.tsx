import { useEffect, useState } from "react";
import { ROOMS, type ComparisonRelation, type ObservationComparison, type ObservationNote } from "../game/openWorld";
import "./observation-journal.css";

const decimal = (value: number, digits = 1) => value.toLocaleString("de-DE", { minimumFractionDigits: digits, maximumFractionDigits: digits });
const clock = (hour: number) => {
  const minutes = Math.floor(hour * 60) % (24 * 60);
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")} Uhr`;
};
const elapsed = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")} Min. Reisezeit`;
const weather = { calm: "Ruhig", breeze: "Brise", rain: "Regen" };
const relations: Record<ComparisonRelation, string> = { similar: "Ähnlich", different: "Anders", contradicts: "Widerspricht", open: "Noch offen" };
const configurationLabels: Record<string, string> = {
  reflectorAngle: "Spiegelwinkel", covered: "Spiegel abgedeckt", reference: "Referenzpunkt",
  viewpoint: "Blickort", wood: "Holz vor Ort", rope: "Seil vor Ort", deliveredWood: "Weitergegebenes Holz",
  deliveredRope: "Weitergegebenes Seil", task: "Absicht", recipient: "Empfangende Person",
  seatAngle: "Sitzrichtung", path: "Weg", invitation: "Einladung", boundary: "Gesprächswunsch",
  gateAngle: "Leittorwinkel", markerX: "Boje Ost-West", markerZ: "Boje Nord-Süd",
  currentX: "Strömung Ost-West", currentZ: "Strömung Nord-Süd", tetherRadius: "Seillänge",
};
const configurationValues: Record<string, string> = {
  shore: "Ufer", offset: "Versetzter Blick", none: "Offen", repair: "Steg ausbessern", supplies: "Vorräte weitergeben",
  near: "Nah am Wasser", wide: "Weiter Abstand", quiet: "Ruhe", conversation: "Gespräch",
};

function configurationValue(key: string, value: string | number | boolean | null): string {
  if (value === null) return "Offen";
  if (typeof value === "boolean") return value ? "Ja" : "Nein";
  if (typeof value === "number" && (key === "currentX" || key === "currentZ")) return `${decimal(value, 2)} m/s`;
  if (typeof value === "number" && ["markerX", "markerZ", "tetherRadius"].includes(key)) return `${decimal(value)} m`;
  if (typeof value === "number") return key.endsWith("Angle") ? `${decimal(value, 0)}°` : decimal(value, 0);
  return configurationValues[value] ?? value;
}

export function ObservationJournal({ notes, comparisons, onRevise, onCompare }: {
  notes: ObservationNote[];
  comparisons: ObservationComparison[];
  onRevise: (id: string, text: string) => void;
  onCompare: (a: string, b: string, relation: ComparisonRelation) => string;
}) {
  const [comparison, setComparison] = useState<string[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [relation, setRelation] = useState<ComparisonRelation>("open");
  const [notice, setNotice] = useState("");
  const comparing = comparison.length === 2;
  const savedComparison = comparing ? comparisons.find((entry) =>
    (entry.a === comparison[0] && entry.b === comparison[1]) || (entry.a === comparison[1] && entry.b === comparison[0])) : undefined;
  const visible = comparing ? notes.filter((note) => comparison.includes(note.id)) : notes;
  useEffect(() => { setRelation(savedComparison?.relation ?? "open"); }, [comparison[0], comparison[1], savedComparison?.relation]);
  const toggle = (id: string) => {
    setNotice("");
    setComparison((selected) => selected.includes(id) ? selected.filter((entry) => entry !== id) : [...selected, id].slice(0, 2));
  };
  const noteLabel = (id: string) => {
    const index = notes.findIndex((note) => note.id === id);
    return index < 0 ? "Nicht mehr vorhandene Beobachtung" : `Beobachtung ${index + 1} (${ROOMS.find((room) => room.id === notes[index].room)?.name ?? "Unterwegs"})`;
  };

  return (
    <section className="observation-journal" aria-label="Eigene Beobachtungen">
      <div className="observation-intro">
        <h3>Eigene Beobachtungen</h3>
        <p>Was du festgehalten hast, bleibt bei seiner damaligen Situation. Deine Deutung kannst du später ändern.</p>
        <p>Ein Eintrag ist freiwillig. Segeln, Gestalten und Sammeln dürfen für sich stehen.</p>
      </div>
      {notes.length === 0 ? <p className="observation-empty">Noch keine Beobachtung festgehalten.</p> : (
        <>
          <div className="observation-comparison-controls">
            <p>{comparing ? "Zwei Situationen nebeneinander" : `Wähle frei zwei Einträge zum Vergleich · ${comparison.length} von 2 gewählt`}</p>
            {comparison.length > 0 && <button type="button" onClick={() => { setComparison([]); setNotice(""); }}>Alle Beobachtungen zeigen</button>}
          </div>
          {comparing && <form className="observation-relation" onSubmit={(event) => { event.preventDefault(); setNotice(onCompare(comparison[0], comparison[1], relation)); }}>
            <label>Beziehung<select value={relation} onChange={(event) => setRelation(event.target.value as ComparisonRelation)}>
              {Object.entries(relations).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select></label>
            <button type="submit" disabled={savedComparison?.relation === relation}>{savedComparison ? "Beziehung revidieren" : "Vergleich speichern"}</button>
          </form>}
          {notice && <p className="observation-notice" role="status">{notice}</p>}
          {comparisons.length > 0 && <section className="observation-saved-comparisons" aria-label="Festgehaltene Vergleiche">
            <h4>Festgehaltene Vergleiche</h4>
            <ul>{comparisons.map((entry) => <li key={entry.id}>
              <p>{noteLabel(entry.a)} und {noteLabel(entry.b)}: <strong>{relations[entry.relation]}</strong></p>
              <small>Festgehalten bei {elapsed(entry.at)}</small>
              <button type="button" onClick={() => { setComparison([entry.a, entry.b]); setNotice(""); }}>Vergleich öffnen</button>
              {entry.revisions.length > 0 && <details className="observation-revisions"><summary>Frühere Beziehungen · {entry.revisions.length}</summary>
                <ol>{entry.revisions.map((revision, index) => <li key={index}>
                  <p>{relations[revision.previous]} → {relations[entry.revisions[index + 1]?.previous ?? entry.relation]}</p>
                  <small>Revidiert bei {elapsed(revision.at)}</small>
                </li>)}</ol>
              </details>}
            </li>)}</ul>
          </section>}
          <div className={`observation-pages${comparing ? " observation-pages-comparing" : ""}`}>
            {visible.map((note) => {
              const number = notes.indexOf(note) + 1;
              const snapshot = note.snapshot;
              return (
                <article className="observation-page" key={note.id}>
                  <div className="observation-heading">
                    <h4>{ROOMS.find((room) => room.id === note.room)?.name} · Beobachtung {number}</h4>
                    <label className="observation-pick"><input type="checkbox" disabled={!comparison.includes(note.id) && comparing} checked={comparison.includes(note.id)} onChange={() => toggle(note.id)} /> Vergleichen</label>
                  </div>
                  <p className="observation-time">{snapshot ? clock(snapshot.timeOfDay) : "Uhrzeit nicht festgehalten"} · {elapsed(note.at)}</p>
                  <h5>Damals beobachtet</h5>
                  <ul className="observation-facts">{note.facts.map((fact, index) => <li key={index}>{fact}</li>)}</ul>
                  <dl className="observation-conditions">
                    <div><dt>Wetter</dt><dd>{snapshot ? weather[snapshot.weather] : "Nicht festgehalten"}</dd></div>
                    <div><dt>Wind</dt><dd>{snapshot ? `${decimal(snapshot.wind.speed)} m/s` : "Nicht festgehalten"}</dd></div>
                    <div><dt>Wasserstand</dt><dd>{snapshot ? `${decimal(snapshot.tide, 2)} m` : "Nicht festgehalten"}</dd></div>
                    <div><dt>Sichtweite</dt><dd>{snapshot ? `${decimal(snapshot.visibility, 0)} m` : "Nicht festgehalten"}</dd></div>
                  </dl>
                  <details className="observation-arrangement">
                    <summary>Damals vor Ort eingestellt</summary>
                    {snapshot ? <dl className="observation-conditions">{Object.entries(snapshot.configuration).filter(([key]) => configurationLabels[key]).map(([key, value]) => <div key={key}><dt>{configurationLabels[key]}</dt><dd>{configurationValue(key, value)}</dd></div>)}</dl> : <p>Nicht festgehalten.</p>}
                  </details>
                  <div className="observation-action">
                    <h5>Letzte festgehaltene Raumhandlung</h5>
                    {snapshot?.action ? <p>{snapshot.action.outcome} <span>({elapsed(snapshot.action.at)})</span></p> : <p>Nicht festgehalten.</p>}
                  </div>
                  <h5>Meine Deutung</h5>
                  {editing === note.id ? (
                    <form onSubmit={(event) => { event.preventDefault(); onRevise(note.id, draft); setEditing(null); }}>
                      <label>Neue Formulierung<textarea value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={2000} rows={3} autoFocus /></label>
                      <div className="observation-edit-actions"><button type="submit">Deutung speichern</button><button type="button" onClick={() => setEditing(null)}>Abbrechen</button></div>
                    </form>
                  ) : <><p className="observation-interpretation">{note.interpretation || "Noch keine Deutung formuliert."}</p><button type="button" onClick={() => { setEditing(note.id); setDraft(note.interpretation); }}>Deutung überarbeiten</button></>}
                  <h5>Offene Frage</h5>
                  <p>{note.question || "Keine Frage festgehalten."}</p>
                  {note.revisions.length > 0 && <details className="observation-revisions"><summary>Frühere Formulierungen · {note.revisions.length}</summary><ol>{note.revisions.map((revision, index) => <li key={index}><p>{revision.previous || "Noch keine Deutung formuliert."}</p><small>Überarbeitet bei {elapsed(revision.at)} · neue Formulierung: {revision.text || "Deutung offengelassen."}</small></li>)}</ol></details>}
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
