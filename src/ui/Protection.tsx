import { useEffect, useRef, useSyncExternalStore } from "react";
import { store } from "../game/store";
import { audio } from "../game/audio";
import { Pause, LogOut, LifeBuoy, Volume2, VolumeX } from "lucide-react";

export function Protection({ phase, canSave, onExit, onRetreat, onEncounter, checkpoint }: {
  phase: string; canSave: boolean; onExit: () => void; onRetreat: () => void; onEncounter: () => void; checkpoint: () => boolean;
}) {
  const h = useSyncExternalStore(cb => store.subscribe(cb), () => store.get());
  const muted = audio.isMuted;
  const panel = useRef<HTMLElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const open = (kind: "pause" | "help") => {
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    store.set({ paused: true, protectionOpen: kind });
  };
  const resume = () => {
    store.set({ paused: false, protectionOpen: null, menuOpen: false });
    previousFocus.current?.focus();
  };
  useEffect(() => {
    if (h.protectionOpen) panel.current?.focus({ preventScroll: true });
  }, [h.protectionOpen]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault(); e.stopImmediatePropagation();
      store.set({ paused: true, protectionOpen: "pause", menuOpen: false });
    };
    window.addEventListener("keydown", key, true);
    return () => window.removeEventListener("keydown", key, true);
  }, []);
  return <>
    <nav className="protection-bar" aria-label="Unterbrechen, verlassen und Hilfe">
      <span className="protection-name">Phänomenautik</span>
      <div className="protection-actions">
        <button onClick={() => open("pause")}><Pause aria-hidden="true" />Pause</button>
        <button onClick={onExit}><LogOut aria-hidden="true" />Verlassen</button>
        <button onClick={() => open("help")}><LifeBuoy aria-hidden="true" />Hilfe</button>
        <button aria-pressed={!muted} onClick={() => { audio.setMuted(!muted); store.set({}); }}>{muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}Ton {muted ? "an" : "aus"}</button>
      </div>
    </nav>
    {h.saveError && <p className="save-warning" role="alert">{h.saveError}</p>}
    {h.protectionOpen && <div className="protection-shade">
      <section className="protection-panel" ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="protection-heading" onKeyDown={e => {
        if (e.key !== "Tab") return;
        const nodes = panel.current?.querySelectorAll<HTMLElement>('button, a[href], summary, input, textarea');
        const list = nodes ? [...nodes].filter(n => n.getClientRects().length) : [];
        if (!list.length) { e.preventDefault(); return; }
        const first = list[0], last = list[list.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && (document.activeElement === last || document.activeElement === panel.current)) { e.preventDefault(); first.focus(); }
      }}>
        {h.protectionOpen === "pause" ? <>
          <h1 id="protection-heading">Hier ist Pause.</h1>
          <p>Die Spielwelt steht still, der Spielton ist unterbrochen. Du entscheidest, wann es weitergeht.</p>
          <div className="protection-stack">
            <button className="primary-action" onClick={resume}>Bewusst fortsetzen</button>
            {(phase === "game" || h.explorationOpen) && <button onClick={onRetreat}>Zum Ankerort zurückziehen — ohne Ressourcenverlust</button>}
            <button onClick={onEncounter}>Zum ruhigen Steg</button>
            <button onClick={() => open("help")}>Hilfe ansehen</button>
            {canSave && <button onClick={() => { if (checkpoint()) store.toast("Spielstand in diesem Browser gespeichert.", "good"); }}>Spielstand speichern</button>}
            <button onClick={onExit}>Zum Einstieg zurückkehren</button>
          </div>
          {phase === "game" && <label className="challenge-choice"><input type="checkbox" checked={h.combatEnabled} onChange={e => store.set({ combatEnabled: e.target.checked })} /> Fiktive Spielherausforderungen mit Angriffen einschalten. Anfangs ausgeschaltet; jederzeit wieder ausschaltbar.</label>}
        </> : <>
          <h1 id="protection-heading">Hilfe in Deutschland</h1>
          <p>Du kannst Hilfe ohne Anmeldung und ohne Spielfortschritt erreichen. Die Spielwelt bleibt währenddessen in Pause.</p>
          <dl className="help-lines">
            <dt><a href="tel:112">112 · akute Lebensgefahr</a></dt><dd>Wenn Lebensgefahr besteht oder schwere bleibende Schäden möglich sind, ruf 112 an. Kostenfrei, rund um die Uhr. <a href="https://gesund.bund.de/notfallnummern" target="_blank" rel="noreferrer">Offizielle Informationen</a></dd>
            <dt><a href="tel:116123">116 123 · TelefonSeelsorge</a></dt><dd>Wenn du in einer Krise bist oder jemanden zum Reden brauchst: auch 0800 1110111 und 0800 1110222. Anonym, kostenfrei, Tag und Nacht. Leitungen können belegt sein. <a href="https://www.telefonseelsorge.de/telefon/" target="_blank" rel="noreferrer">Kontakt und weitere Wege</a></dd>
            <dt><a href="tel:116117">116117 · dringende ärztliche Hilfe</a></dt><dd>Außerhalb der Sprechzeiten, wenn ärztliche Hilfe nicht bis zur nächsten Sprechstunde warten kann und keine Lebensgefahr besteht. Telefonisch rund um die Uhr; mit deutschem Anschluss kostenfrei. <a href="https://www.116117.de/de/haeufige-fragen.php" target="_blank" rel="noreferrer">Offizielle Informationen</a></dd>
          </dl>
          <p className="review-status">Kontaktdaten geprüft am 9. Oktober 2026. Fachliche Textprüfung und Rückmeldungen von Menschen mit eigener Erfahrung: Prüfung offen.</p>
          <button className="primary-action" onClick={() => store.set({ protectionOpen: "pause" })}>Zur Pause zurück</button>
          <button onClick={onExit}>Zum Einstieg zurückkehren</button>
        </>}
        <details className="privacy-details"><summary>Speicherung und Quellen</summary><p>Der Spielstand wird im lokalen Speicher dieses Browsers gesichert, sofern das Speichern gelingt. Bei einem Speicherfehler bleibt der aktuelle Stand für diese Sitzung erhalten; Schließen oder Neuladen kann ihn verlieren. Persönliche Beobachtungen speicherst du auf Wunsch im vorhandenen GANZ-SEiN-Speicher auf diesem Mac. Es gibt keine automatische Übertragung deiner Beobachtung aus dem Spiel.</p><p>Beim Laden der App und beim Öffnen externer Links können die jeweiligen Server Verbindungsdaten erhalten. Ihre Protokolle sind hier nicht überprüft. Lokale Browserspeicherung kann durch Browserbereinigung verloren gehen.</p><p>Dies ist eine fiktive Erkundung. Spielwerte und Abschlüsse sagen nichts über deinen gesundheitlichen Zustand oder psychische Bewältigung aus.</p></details>
      </section>
    </div>}
  </>;
}
