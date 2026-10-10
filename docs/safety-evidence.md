# Schutz und Treibholz: technische Nachweise

Stand: 10. Oktober 2026. Ausgangspunkt: Phänomenautik 3, Commit `3343519`.
Die Änderungen bleiben im bestehenden Spiel und seinem bestehenden Speicherformat.

## Reproduktion

Im Projektverzeichnis mit den vorhandenen Abhängigkeiten:

```sh
node docs/safety-audit.mjs
node docs/safety-audit.mjs --baseline
npx tsc --noEmit
```

Beide Auditaufrufe liefen am 10. Oktober erfolgreich: der aktuelle Stand mit 349
ausgeführten Assertion-Aufrufen, die Treibholzfolge aus dem Ausgangscommit mit 27.
Schleifendurchläufe werden einzeln gezählt; das sind keine 349 unabhängigen Testfälle.
Der bereits dokumentierte TypeScript-Aufruf lief ebenfalls erfolgreich; dieser
Auditlauf ersetzt den aktuellen Gesamtbuild nicht. Bundles entstehen ausschließlich im
ignorierten `node_modules/.cache/safety-audit` dieses externen Checkouts. Die Prüfung
verwendet einen isolierten Speicher im Arbeitsspeicher; vorhandene Browserstände
werden weder gelesen noch verändert.

## Nachgewiesene Schutzfälle

- Ohne bewusst eingeschaltete Spielherausforderung erzeugt der Angriff keine
  verzögerte Trefferprüfung. Eine Begegnung öffnet die milde Erkundung und keinen Kampf.
- Der tatsächliche Weltaufruf öffnet den Steg über den vorhandenen `explorationOpen`-
  Zustand. Der aktuelle App-JSX-Ausdruck erzeugt dabei die Begegnung mit genau dem
  Live-Spielstand und setzt die darunterliegende Oberfläche auf `inert`. Ein zweites
  Öffnungs-Boolean wird nicht mehr benötigt. Öffnen aus Hilfe/Pause löst den Schutz
  erst bei Erfolg; ein unlesbarer Originalstand hält Pause und geschlossene Begegnung
  sowohl im App- als auch im Weltpfad aufrecht.
- Eine echte angesetzte Trefferprüfung wird beim Pausieren gelöscht. Auch ein
  anschließend manuell ausgelöster, bereits ausgelieferter Callback trifft nicht.
  Gehaltene Bewegungstasten und der Pointer Lock werden freigegeben.
- Zwei Aufrufe des tatsächlichen Weltloops während der Pause verändern weder
  Spielstand noch Simulationszeit. Aktive Essenswirkungen behalten bei einer
  kontrollierten Pause von 60 Sekunden ihre verbleibende Dauer, auch beim Speichern.
  Die öffentliche Uhr für Anzeigen bleibt vor dem Speichern dabei unverändert;
  nach der bewussten Fortsetzung läuft sie wieder mit. Speichern erhält den Abstand
  zwischen dieser Uhr und dem Wirkungsende.
- Titel, Ankunft, Betrachten, Markieren und Abstand laufen durch den tatsächlichen
  Präsentations- und Framepfad derselben Welt. Dabei bleiben der gesamte Spielstand,
  Simulationszeit und Speicher-/HUD-Timer unverändert. Pause, Hilfe und verborgenes
  Fenster stoppen auch die visuellen Frames, Wasser-/Schiffsaktualisierung und Wolken.
  Reduzierte Bewegung hält die visuelle Zeit an. Bei gemeinsam kontrollierter
  Kalender- und Leistungsuhr bleiben nach drei Pausen von je 60 Sekunden die
  verbleibenden 10 Sekunden Essenswirkung und 12 Sekunden Feuerwirkung erhalten.
  Speichern/Wiederladen erhält die Essensdauer; Fortsetzen erhält die Feuerdauer.
  Spielkamera, Sichtbarkeit der Spielfiguren und Wolkenpositionen werden wiederhergestellt.
- Rückzug übernimmt keine beschädigten provisorischen Spielerwerte oder verbrauchten
  Gegenstände. Stabilität, Präsenz, Inventar, Holz, Kristalle, Materialien, Essen und
  Aufgaben bleiben unverändert. Ein früherer provisorischer Duellbetrag wird beim
  Rückzug zurückgegeben; im gespeicherten Stand wird er während der offenen
  Begegnung nicht abgezogen. Wiederladen bestätigt dieselben Spielerwerte.
- Rückzug schließt Begegnung, Duell, Dialog, Bordgespräch, Küche, Journal und Lore;
  die Schutzpause bleibt bis zur bewussten Fortsetzung geöffnet.
- Audio beginnt stumm. Ein kontrollierter AudioContext wird beim Pausieren suspendiert;
  ein Soundaufruf währenddessen setzt ihn nicht fort. Bewusste Fortsetzung setzt ihn fort.
- Abbruch während des verzögerten Modellladens verhindert den Aufbau einer Welt.
  Wiederholter Start verwendet dieselbe ausstehende Promise. Eine ältere, verspätete
  Instanz wird ohne Speicherung entsorgt und beendet keine neuere Welt. Stop entfernt
  auch den technischen QA-Hook.
- Eine verweigerte Speicheroperation liefert `false` und eine verständliche Fehlermeldung;
  sie behauptet keinen Erfolg und verändert den bisherigen Rohstand nicht. Sowohl
  kaputtes JSON als auch eine unpassende Speicherstruktur bleiben unverändert erhalten;
  ein neuer Stand darf sie nicht still ersetzen.
- Zwei unabhängig gebündelte Persistenz- und Store-Instanzen teilen ausschließlich
  einen kontrollierten Browserspeicher. Ein inzwischen von der anderen Instanz
  geänderter oder entfernter Stand wird bei einer alten Speicherung nicht überschrieben
  oder wiederhergestellt; die ursprünglichen Bytes bleiben exakt erhalten. Ein späteres
  Lesen oder ein neuer Titel-Vorschauzustand berechtigt den alten Live-Stand nicht
  erneut zum Schreiben. Der Fehler bleibt verständlich und enthält keine Kennungen.
- Erste Speicherung, eigenes Wiederholspeichern, direktes Laden und anschließendes
  Speichern sowie bestehende Format-Ergänzungen funktionieren. Die flache Duellkopie
  und ihr Original teilen dieselbe Schreibherkunft. Nach einem Quota-Fehler bleibt
  diese Herkunft erhalten, sodass ein erfolgreicher eigener Wiederholversuch möglich ist.
  Eine ausdrücklich begonnene neue Reise darf ihren unveränderten gelesenen Ursprung
  ersetzen; auch sie verweigert später geänderte Bytes. Beschädigte, einschließlich
  leer gespeicherter Bytes werden auch bei direktem `newGame()` ohne vorheriges
  `loadSave()` nicht ersetzt. Das gespeicherte JSON-Format bleibt unverändert.
- Bei verweigerter Speicherung führen die tatsächlichen App-Callbacks trotzdem zum
  Eingang zurück. Sie behalten den aktuellen Weltstand in der vorhandenen Sitzungsreferenz.
  Eine fertig aufgebaute Welt bleibt dabei in der Titelpräsentation erhalten; diese
  darf sich sichtbar bewegen, ohne Spielzeit oder Ressourcen fortzuschreiben. Fortsetzen
  nutzt dieselbe Instanz. Entsorgung ist weiterhin für abgebrochene, noch nicht fertige
  oder veraltete Ladegenerationen erforderlich, jeweils ohne Speicherung.
  Fortsetzen verwendet genau diesen Stand mit 73 Holz und 37 Stabilität statt des älteren
  gespeicherten Standes. Auch die ruhige Begegnung lässt sich dann öffnen. Verlassen
  während eines ausstehenden Weltstarts bricht das Laden ab und erhält dieselbe Referenz.
  Ein inzwischen defekter Rohstand bleibt unverändert; die vorhandene Sitzung kann
  fortgesetzt werden, während ein neuer Spielstand ohne Sitzung weiterhin blockiert ist.
- Die tatsächlichen App-Ladeeffekte bewahren eine während des Ladens geöffnete Pause,
  Hilfe oder ruhige Begegnung beim Abschluss. Ausstieg vor Ablauf des 60-ms-Timers
  entfernt den Timer, ohne eine Welt zu erstellen. Ausstieg während der Erstellung
  verwirft die verspätete Instanz ohne Speicherung; der alte Effekt öffnet kein Spiel.
  Ein absichtlich ausgelöster Ladefehler erhält die Sitzungsreferenz, unveränderten
  Rohstand und die globale Schutzoberfläche; Ausstieg bleibt möglich.
- Beim ersten Titel ohne Spielstand erstellt der tatsächliche Szeneneffekt nur die
  Vorschau. Die App übergibt `canSave=false`, und `checkpoint()` liefert `false`.
  Rückzug verändert diese Vorschau nicht; Rückzug, Ausstieg und Effektbereinigung
  erzeugen keinen Speicherstand aus ihr. Der Einstieg behauptet keinen Speichererfolg.

## Treibholz vor und nach der Änderung

Die Prüfung nutzt die tatsächliche Sammlung in `Props.collectDriftwood`, den
Zählerblock der Welt, Kaj-Dialogaktionen, Aufgabenbelohnungen sowie Speichern und
Wiederladen. Ein bereits eingesammeltes Stück wird kein zweites Mal gezählt. Im
geschützten Dialog folgt auf das Angebot eine ausdrückliche Aufgabenannahme.

| Schritt | Holz | Treibholz | Schiffstempo |
| --- | ---: | ---: | ---: |
| 5 Stück vor dem Hafen | 7 | 5 | 0 |
| Erste Aufgabe angenommen | 7 | 5 | 0 |
| Erste Aufgabe abgegeben | 7 | 0 | 1 |
| 3 Stück nach dem Hafengespräch | 10 | 3 | 1 |
| Zweite Aufgabe angenommen | 10 | 3 | 1 |
| Weitere 5 Stück gesammelt | 15 | 8 | 1 |
| Zweite Aufgabe abgegeben | 15 | 0 | 2 |
| Weitere 2 Stück gesammelt | 17 | 2 | 2 |
| Gespeichert und wieder geladen | 17 | 2 | 2 |

Diese Folge ist im Ausgangscommit und im aktuellen Stand identisch. Die Aufgaben
verbrauchen absichtlich den Aufgabenwert Treibholz; das Bauholz wächst weiter. Der
historische Fehler aus einer früheren Fassung ließ sich hier nicht reproduzieren.
Deshalb wurde die Sammlungslogik in `props.ts` nicht verändert.

## Grenzen

Der Mehrtab-Schutz vergleicht die beim Laden oder beim letzten eigenen Speichern
beobachteten Originalbytes unmittelbar vor dem Schreiben. Vergleich und `setItem`
sind getrennte synchrone Speicheroperationen; das ist keine atomare Transaktion
zwischen Tabs. Nachgewiesen sind geänderte Bestände vor dem Vergleich, keine
garantierte gegenseitige Sperre bei exakt gleichzeitig ineinandergreifenden Schreibvorgängen.

Der Audit ersetzt den visuellen Weltkonstruktor, das Modellladen und die visuellen
Renderer-/Wasser-/Schiffsadapter durch kontrollierte Testgrenzen. Die Kamerageometrie
kommt aus Three.js; Adapteraufrufe werden gezählt. Weltmethoden einschließlich
Präsentationswechsel, Loop und Dauerverlängerung sowie Zählerblock, Aufgaben und
Persistenz kommen aus dem jeweiligen Quellstand. Audio wird mit einem kontrollierten
AudioContext geprüft. Das belegt die Logik, weder WebGL-Darstellung noch körperliches
Hören oder menschliche Freigabe. Browserinteraktion und sichtbare Form bleiben eigene
Prüfschritte.

Die Sitzungsprüfung extrahiert `begin`, `checkpoint`, `exit`, `openEncounter`, `retreat`,
`presentEncounter`, `onContinue` und die beiden Szene-/Ladeeffekte unmittelbar aus
der aktuellen `App.tsx`; React-Zustandssetter sind
kontrolliert. Der tatsächliche JSX-Rückgabeausdruck wird zusätzlich mit einer
kontrollierten Elementfabrik ausgewertet, um Öffnung, Spielstand und `inert` zu prüfen.
Sie verwendet dieselben Runtime- und Speichermodule statt einer nachgebauten
Ablaufsteuerung. Effektfunktionen und Bereinigung werden gezielt aufgerufen;
Browserdarstellung, tatsächliche React-Effektplanung und Fokus werden damit nicht belegt.

ESLint wurde für Store, Audio, Runtime, Pause und Welt separat geprüft: keine Fehler
oder Warnungen. Die unveränderte Ausgangsfassung hat bei Prüfung ihrer 133 getrackten
JS-/TS-Dateien über `git show HEAD:pfad` und ESLint-stdin 25 Fehler, keine Warnungen.
Ein vollständiger grüner Lintlauf wird damit nicht behauptet; die umfassende
Altcodebereinigung ist nicht Teil dieses Auftrags.
