import { useState, useSyncExternalStore } from "react";
import { ROOMS, availableActions, describeRoom, type RoomId } from "../game/openWorld";
import { getWorld } from "../game/runtime";
import { store } from "../game/store";
import { ATLAS_HREF } from "./GentleEncounter";
import "./open-world.css";

const weatherNames = { calm: "Stille Luft", breeze: "Frische Brise", rain: "Regen" };

export function OpenWorldPanel({ checkpoint, onImport }: { checkpoint: () => boolean; onImport: (raw: string) => void }) {
  const h = useSyncExternalStore(cb => store.subscribe(cb), () => store.get());
  const world = getWorld();
  const state = world?.getOpenWorldState();
  const [expanded, setExpanded] = useState(true);
  const [interpretation, setInterpretation] = useState("");
  const [question, setQuestion] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [revision, setRevision] = useState("");
  const [notice, setNotice] = useState("");
  const [importRaw, setImportRaw] = useState<string | null>(null);
  const [importError, setImportError] = useState("");
  const [diagnostics, setDiagnostics] = useState<ReturnType<NonNullable<ReturnType<typeof getWorld>>["getDiagnostics"]> | null>(null);
  if (!world || !state || h.paused || h.protectionOpen || h.battlePhen || h.dialogNpc || h.duelId || h.journalOpen || h.loreStone || h.chatOpen || h.cookOpen) return null;
  const room = h.activeRoom;
  const place = ROOMS.find(value => value.id === room);
  const act = (target: RoomId, action: string) => {
    const result = world.actInRoom(target, action);
    setNotice(typeof result === "string" ? result : "Die Veränderung bleibt in der Welt.");
  };
  const exportSave = () => {
    try {
      const json = world.exportSave();
      const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "Phaenomenautik-Spielstand.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice("Der Spielstand wurde als Datei ausgegeben. Bewahre ihn für den anderen Mac auf.");
    } catch { setNotice("Der Spielstand konnte nicht exportiert werden. Prüfe den Speicherhinweis in der Schutzleiste."); }
  };
  return <aside className={`open-world-shelf ${expanded ? "is-open" : "is-folded"}`} aria-label="Orte und Feldnotizen" onKeyDown={event => { if (event.key !== "Escape") event.stopPropagation(); }}>
    <button className="shelf-toggle" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>
      <span>{place?.name || "Auf See"}</span><span className="shelf-toggle-hint">{expanded ? "Einklappen" : "Orte öffnen"}</span>
    </button>
    {expanded && <div className="shelf-content">
      <nav aria-label="Frei erreichbare Orte" className="room-routes">
        {ROOMS.map(value => <button key={value.id} aria-current={room === value.id ? "location" : undefined} onClick={() => { world.travelToRoom(value.id); setNotice(`Du bist bei ${value.name}. Du kannst jederzeit weitersegeln.`); setInterpretation(""); setQuestion(""); }}>
          {value.name}
        </button>)}
      </nav>
      <p className="shelf-invitation">Alle Orte sind offen. Wechsle direkt oder segle selbst dorthin.</p>
      <p className="shelf-invitation">Nach der Ortswahl liegt das Boot vor Anker. Zum Weitersegeln die Spielwelt anklicken und W oder die Pfeiltasten drücken.</p>
      <p className="world-conditions">{weatherNames[state.weather]} · {Math.floor(state.timeOfDay).toString().padStart(2, "0")}:{Math.floor(state.timeOfDay % 1 * 60).toString().padStart(2, "0")}</p>
      {room && place && <section className="room-field" aria-label={`Erkundung: ${place.name}`}>
        <p className="room-reason">{place.reason}</p>
        <ul className="room-observables">{describeRoom(state, room).map((fact, index) => <li key={index}>{fact}</li>)}</ul>
        <div className="room-actions">{availableActions(state, room).map(action => <button key={action.id} onClick={() => act(room, action.id)}>{action.label}</button>)}</div>
        <details className="field-details">
          <summary>Eine Beobachtung festhalten · freiwillig</summary>
          <p>Die sichtbaren Bedingungen werden bewahrt. Deine Deutung bleibt veränderbar.</p>
          <label>Eigene Deutung <span>(freiwillig)</span><textarea value={interpretation} maxLength={2000} onChange={event => setInterpretation(event.target.value)} /></label>
          <label>Offene Frage <span>(freiwillig)</span><textarea value={question} maxLength={1000} onChange={event => setQuestion(event.target.value)} /></label>
          <button onClick={() => { world.recordObservation(room, interpretation.trim(), question.trim()); setInterpretation(""); setQuestion(""); setNotice("Beobachtung und Bedingungen sind im Logbuch festgehalten."); }}>Beobachtung bewahren</button>
        </details>
        {room === "bay" && <details className="field-details">
          <summary>Kontext im vorhandenen Atlas</summary>
          <p>Der vorhandene Atlasanschluss öffnet den Lesekontext zur Flimmerbucht. Eigene Notizen werden dort nur durch dein ausdrückliches Speichern bewahrt.</p>
          <a href={ATLAS_HREF} target="_blank" rel="noreferrer" onClick={event => { if (!checkpoint()) { event.preventDefault(); return; } store.set({ paused: true, protectionOpen: "pause" }); }}>Atlas öffnen</a>
        </details>}
      </section>}
      <details className="field-details">
        <summary>Wind und Licht vergleichen</summary>
        <p>Die gewählte Bedingung verändert dieselbe Welt, an allen Orten.</p>
        <div className="condition-actions">{(["calm", "breeze", "rain"] as const).map(value => <button key={value} aria-pressed={state.weather === value} onClick={() => act(room || "bay", `weather:${value}`)}>{weatherNames[value]}</button>)}</div>
        <div className="condition-actions">{[{ id: "dawn", label: "Morgen" }, { id: "noon", label: "Mittag" }, { id: "dusk", label: "Abend" }].map(value => <button key={value.id} onClick={() => act(room || "bay", `time:${value.id}`)}>{value.label}</button>)}</div>
      </details>
      <details className="field-details">
        <summary>Logbuch {state.notes.length ? `· ${state.notes.length} ${state.notes.length === 1 ? "Beobachtung" : "Beobachtungen"}` : "· noch offen"}</summary>
        {state.notes.length === 0 && <p>Segeln, Gestalten und Sammeln brauchen keinen Eintrag.</p>}
        <ol className="field-notes">{state.notes.map((note, index) => <li key={note.id}>
          <h3>{ROOMS.find(value => value.id === note.room)?.name || "Unterwegs"} · Beobachtung {index + 1}</h3>
          <ul>{note.facts.map((fact, factIndex) => <li key={factIndex}>{fact}</li>)}</ul>
          {note.interpretation && <p><strong>Meine Deutung:</strong> {note.interpretation}</p>}
          {note.question && <p><strong>Offene Frage:</strong> {note.question}</p>}
          {editing === note.id ? <div className="note-revision"><label>Deutung neu formulieren<textarea value={revision} maxLength={2000} onChange={event => setRevision(event.target.value)} /></label><button onClick={() => { world.reviseObservation(note.id, revision.trim()); setEditing(null); setNotice("Die Deutung wurde geändert. Die frühere Formulierung bleibt erhalten."); }}>Revision bewahren</button><button onClick={() => setEditing(null)}>Abbrechen</button></div> : <button className="field-text-action" onClick={() => { setEditing(note.id); setRevision(note.interpretation); }}>Deutung überdenken</button>}
          {note.revisions.length > 0 && <details className="note-history"><summary>Frühere Formulierungen</summary>{note.revisions.map((entry, entryIndex) => <p key={entryIndex}>{entry.previous || "Noch keine Deutung"}</p>)}</details>}
        </li>)}</ol>
      </details>
      <details className="field-details">
        <summary>Spielstand mitnehmen</summary>
        <p>Der Browser speichert auf diesem Mac. GitHub überträgt diesen Spielstand nicht.</p>
        <button onClick={exportSave}>Spielstand als Datei exportieren</button>
        <p>Eine importierte Datei ersetzt nach deiner Auswahl den Spielstand in diesem Browser. Exportiere den bisherigen Stand, wenn du ihn behalten möchtest.</p>
        <label className="import-choice">Spielstanddatei auswählen<input type="file" accept="application/json,.json" onChange={async event => { const file = event.currentTarget.files?.[0]; setImportRaw(null); setImportError(""); if (!file) return; if (file.size > 5_000_000) { setImportError("Die Datei ist zu groß für einen Spielstand."); return; } try { setImportRaw(await file.text()); } catch { setImportError("Die Datei konnte nicht gelesen werden."); } }} /></label>
        {importRaw !== null && <button onClick={() => { try { onImport(importRaw); setImportRaw(null); setImportError(""); } catch (error) { setImportError(error instanceof Error ? error.message : "Der Spielstand konnte nicht übernommen werden."); } }}>Ausgewählten Spielstand hier laden</button>}
        {importError && <p role="alert">{importError}</p>}
      </details>
      <details className="field-details technical-measurement">
        <summary>Technische Messung</summary>
        <p>Die Bildrate gilt für diese Browseransicht und ihre aktuellen Bedingungen. Aktualisiere die Momentaufnahme nach dem Segeln.</p>
        <button onClick={() => setDiagnostics(world.getDiagnostics())}>Messung aktualisieren</button>
        {diagnostics && <dl>
          <dt>Messfenster</dt><dd>{diagnostics.samples} Bilder · {diagnostics.windowSeconds.toFixed(1)} s</dd>
          <dt>Mittlere Bildrate</dt><dd>{diagnostics.meanFps.toFixed(1)} FPS</dd>
          <dt>Langsame Bilder, 95. Perzentil</dt><dd>{diagnostics.p95FrameMs.toFixed(1)} ms</dd>
          <dt>Bilder über 33 ms</dt><dd>{diagnostics.framesOver33ms}</dd>
          <dt>Grafikqualität</dt><dd>{diagnostics.quality}</dd>
          <dt>Auflösung</dt><dd>{String(diagnostics.resolution)} · Pixelfaktor {diagnostics.pixelRatio.toFixed(2)}</dd>
          <dt>Simulationsschritte</dt><dd>{diagnostics.steps}</dd>
          <dt>Verworfene Simulationszeit</dt><dd>{diagnostics.droppedSeconds.toFixed(3)} s</dd>
        </dl>}
      </details>
      {notice && <p className="field-notice" role="status">{notice}</p>}
    </div>}
  </aside>;
}
