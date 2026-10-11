# Gemeinsame Weiterarbeit

Stand: 11. Oktober 2026. Auftrag: [Issue #2](https://github.com/ralfarminkirchner-netizen/phaenomenautik-3/issues/2). GitHub überträgt weder Kimi-Chatverlauf noch Browser-Spielstände.

Bestätigte Remote-Stände vor dieser Übernahme: Codex `3d5ca4d`, Kimi `4fc8352`. Die folgenden Browserangaben zum Kimi-Paket stammen aus Kimis Bericht; die unabhängige Abnahme hat noch offene Fehler festgestellt.

## Arbeitsstand und Schutz des Bestands

Die ursprüngliche Arbeitskopie `/Volumes/ThunderBolt4_2TB/Development/Projects/phaenomenautik-3` enthält zahlreiche lokale Änderungen und bleibt erhalten. Der geprüfte Szenen-, Text- und Schutzstand wurde als Ausgangspunkt gesichert; der bestehende Produktions-Build-Fix wurde zusammengeführt. Die Fortsetzung liegt im isolierten Worktree `/Volumes/ThunderBolt4_2TB/Development/Projects/phaenomenautik-3-mac-mini`, Branch `codex/open-world-mac-mini-20261010`. Remote: `https://github.com/ralfarminkirchner-netizen/phaenomenautik-3.git`.

Der erste zusammenhängende Ausbau enthält Flimmerbucht, Werkhafen und Stillen Strand. Alle sind ohne Freischaltung erreichbar; die Segelhilfe ist optional. Gemeinsame Zeit, Wetter, Wind, Wasserfelder, Licht und Klang beeinflussen Boot und Begegnungen. Buchtversuche, getrennte Zeugenaussagen, gezielte Mitteilungen und begrenzte Materialien im Hafen sowie aktuelle Einladungen am Strand haben konkrete Zustandsfolgen. Beobachtungsnotizen trennen festgehaltene Tatsachen von eigener Deutung und bewahren frühere Formulierungen bei Revisionen. Freies Segeln ist der Haupteinstieg; ruhiges Ankommen und Reflexion bleiben freiwillig. Issue #2 ist damit noch nicht vollständig umgesetzt.

## Kimi-Paket vom 11.10. (gepusht; unabhängige Abnahme offen)

- **Böenfeld + Enterhaken** (`f07b471`, `ab76aeb`, `b4a07cb`): ortsgebundener Böenanteil (`gust`) in `openWorld.sampleFields`, identisch gespiegelt in Wellen-CPU und -Shader (höhere Wellenberge, wo der Wind stark ist). Schiff fängt Böen mit dem Wind als sichtbaren Schub; Enterhaken-Schwung trägt nach dem Loslassen weiter; Gleiten nutzt Böen. Fix: Schiff fuhr mit Heck voraus (`MODEL_YAW = π`); Segelknoten akzeptieren alle GLB-Namensschreibweisen; Sprungtaste feuert den Doppelsprung nur noch auf der Tastenflanke. Neuer wellenfolgender Schatten des Rumpfs auf dem Wasser (DOM-sicher, Node-Tests unberührt). Wasser: Nahfeld-Reflexion, Flachwasser gibt den Meeresboden frei. Werkzeuge 1/2/3 (Axt/Schaufel/Enterhaken); HUD-Windanzeige mit Pfeil, Gradzahl, m/s und Bö-Label. Browser-Abnahme 11.10.: Bug voraus, Schatten sichtbar, „13,2 m/s Bö!“, 0 Konsolenfehler.
- **Auftrag 1 aus Issue #2: Mara/Tove-Gedächtnis** (`c351057`): `KnowledgeEntry` trägt Ort (`room`) und Art (`kind`: message/delivery/retraction/observation) neben Zeit und Quelle; Mitteilung, Ausführung und Rücknahme bleiben getrennt gespeichert. Fragen nach Mara/Tove erzählt die gesamte Folge in Reihenfolge mit Art, Quelle, Weltzeit und Ort. `syncNpcMemory` verknüpft das Empfängerwissen mit der vorhandenen NPC-Erinnerung (`save.npcMemory.mara/tove`); ohne Übermittlung bleibt die andere Person außerhalb und bekommt keinen Eintrag. Alte Spielstände ohne Ort/Art bleiben importierbar. Browser-Abnahme 11.10.: Mara erinnert sich nach Neuladen wortgleich an beide Ereignisse (inkl. Original-Weltzeiten), Tove weiß nichts.

## Vorangegangener Stand (geprüft 10.10.)

Am 10. Oktober wurde der inzwischen gepushte Branch `kimi/open-world-20261010` gegen diesen Arbeitsbranch geprüft. Kimi dokumentiert in `4d3e148` die Übernahme des damaligen, noch uncommitteten Codex-Ausbaus. Weltmodell, Festzeitschritt, drei Raumdarstellungen, Schiffsfelder und Atlas-Dokumentation sind auf beiden Seiten identisch; das sind dieselben Systeme, keine zwei unabhängig gebauten Spiele.

Kimis zusätzliche Qualitätsleiter aus `073469e` senkt die Darstellungsqualität unter 52 FPS und erhöht sie erst über 58,5 FPS. Sie ist in `5e4a324` unter Erhalt beider Git-Historien zusammengeführt und gepusht. Die späteren Codex-Reparaturen an Anker, Ortskamera, Eingabefokus, Wasserreflexion und Importprüfung bleiben erhalten. Zusammenführung und spätere Änderungen gehen weiterhin über Draft-PR #3; `main` wird nicht direkt verändert. TypeScript/Vite-Build und 20 Weltprüfungen bestanden; daraus folgt keine neue Leistungs- oder menschliche Abnahme.

Parallel existiert die Aufgabe „Phänomenautik neu entwerfen“ mit der eigenen App „Feldbuch“ im KiNTEGRiTY-Variantenraum (lokal `http://127.0.0.1:5187/?variante=gpt-6`). Diese Aufgabe verantwortet die Konzept-/Forschungsbuchvariante. Hier wird das vorhandene Segelspiel fortgesetzt. Keine zweite allgemeine Forschungsbuch-, Linsen- oder Chat-App in diesem Repository beginnen. Spielbeobachtungen erst über tatsächlich vorhandene Verträge anschließen.

Nächster gemeinsamer Schritt im Spiel: vorhandene Flimmerbucht-Begegnung, Mara/Tove, Inventar und Journal mit den neuen Raumfolgen verbinden. Erst danach weitere Strömungs-/Resonanzräume ausbauen. Vor jedem neuen System beide gepushten Branches vergleichen; ungesyncte Arbeit auf dem anderen Mac bleibt ausdrücklich unbekannt.

Aufgabenverteilung nach ausdrücklicher Nutzerklärung: Codex verantwortet Denkentscheidungen, Prioritäten, Systemzusammenhänge, präzise Aufträge und Ergebnisprüfung. Kimi übernimmt überwiegend Recherche und Umsetzung. Codex übernimmt schwierige konzeptionelle, visuelle oder spielerische Lösungen selbst, wenn Kimi sie nicht erreicht. Aufträge über den gemeinsamen GitHub-Kontext übergeben; eine dort hinterlegte Aufgabe ist noch keine bestätigte Arbeitsaufnahme durch Kimi.

Nächste begrenzte Kimi-Aufträge, nacheinander und jeweils mit prüfbarem Ergebnis:
1. Mara/Tove: vorhandene Gespräche an tatsächlich gehörte Hafenereignisse anschließen. Mitteilung, Ausführung und Rücknahme getrennt speichern; Ort, Zeit und Quelle erhalten. Fertig: Mara erinnert sich nach Neuladen an ihre Mitteilung, Tove weiß ohne Übermittlung nichts davon; lokal ohne Sprachmodell.
2. Materialfluss: `wood`/`rope` im örtlichen Lager mit `stamm`/`seil` im Bootsinventar nachvollziehbar verbinden. Getrennte Orte erhalten, ausdrückliche Transfers und einmaligen Verbrauch prüfen. Fertig: gesammeltes Holz verändert durch eine ausgeführte Bauhandlung den sichtbaren nutzbaren Steg; Mengen und Empfänger stimmen nach Neuladen. Eine bloße Absicht baut nichts.
3. Journal: vorhandenes Journal um Raumbeobachtungen mit historischen Bedingungen und Handlung ergänzen; zwei Beobachtungen freiwillig vergleichen und Deutungen revidieren. Fertig: derselbe Versuch unter zwei Wetterlagen bleibt samt früherer Deutung nach Neuladen vergleichbar; keine Notiz oder Reflexion wird zur Reisebedingung.
4. Neuroatlas-Recherche: höchstens drei belegte Verbindungsvorschläge für die drei Räume mit Phänomen, Claim und Quellenstelle aus dem tatsächlichen Neuroatlas-Korpus liefern. Beobachtung, mögliche Lesart und Quelle trennen; keine Diagnose aus Spielverhalten. Codex prüft Nutzen und Anschlussvertrag vor Umsetzung. GANZ-SEiN-Flimmerbucht-Link und nativer Neuroatlas sind getrennte Systeme; die vorläufige synthetische `phaenomen.bruecke.v1`-Fixtur belegt keinen bestätigten Browser-Vertrag oder Empfänger.

## Einrichten, starten, prüfen

Die Ortswahl ankert das Boot vorübergehend; die Welt läuft weiter. Die erste Segelsteuerung löst den Anker und die Ortskamera. Ein Neuladen bewahrt Position, Ortsblick und passende Ortsaktionen.

Vor Schreibarbeiten auf diesem Mac Mini das tatsächlich gemountete externe Volume und den Zielpfad prüfen. Registrierung: `/Volumes/ThunderBolt4_2TB/Development/Storage-Control`; erwartete Volume-UUID: `A03B10FD-5F22-4366-A71C-2D95AC701BD2`. Kein interner Ersatz bei fehlendem Volume. Auf dem iMac dessen eigene tatsächliche Registrierung prüfen.

```sh
/Users/ralfkirchner/.config/external-development/bin/extern-dev status
cd /Volumes/ThunderBolt4_2TB/Development/Projects/phaenomenautik-3-mac-mini
npm ci --cache /Volumes/ThunderBolt4_2TB/Development/Caches/npm
npm run dev -- --host 127.0.0.1 --port 4179 --strictPort
```

Benötigt: Node >=22.12.0, die vorhandenen Manifeste und `package-lock.json`. Abhängigkeiten und `dist/` liegen im externen Worktree; npm-Cache liegt extern. Für das Spiel selbst sind keine Geheimnisse oder zusätzlichen Backend-Zugangsdaten erforderlich.

```sh
npm run build
npm run test:world
TMPDIR=/Volumes/ThunderBolt4_2TB/Development/Caches/phaenomenautik-qa npm run test:server
```

Die beiden Prüfskripte gehören zu diesem Ausbau. Stand der technischen und Browserprüfung: [PRUEFUNG-2026-10-10.md](PRUEFUNG-2026-10-10.md). 60 FPS bleiben ein Leistungsziel unter ausdrücklich benannten Bedingungen.


## Offene Aufgaben (aus Issue #2 und Übergabe-Kommentar)

Teilweise umgesetzt: **Auftrag 1 (Mara/Tove-Erinnerung)**. Hafenfolge vorhanden; normale Dialognutzung und Importrobustheit noch abnehmen.

1. **Auftrag 2 — Materialfluss**: `wood`/`rope` im Hafenlager mit `stamm`/`seil` im Bootsinventar nachvollziehbar verbinden; getrennte Orte, ausdrückliche Transfers, einmaliger Verbrauch. Fertig: gesammeltes Holz verändert durch eine ausgeführte Bauhandlung den sichtbar nutzbaren Steg; Mengen und Empfänger stimmen nach Neuladen.
2. **Auftrag 3 — Journal-Vergleich**: zwei Beobachtungen mit historischen Bedingungen freiwillig vergleichen (ähnlich/anders/widerspricht/noch offen), Deutungen revidierbar. Fertig: derselbe Versuch unter zwei Wetterlagen bleibt samt früherer Deutung nach Neuladen vergleichbar.
3. **Auftrag 4 — Neuroatlas-Recherche**: höchstens drei belegte Verknüpfungen (je Raum) aus dem echten Korpus `data/neuro-atlas/corpus.json`; Beobachtung, mögliche Lesart, Quelle und fehlende Verträge benennen; keine Integration.
4. **Strömungsinsel/Resonanzhafen**: vierte/fünfte Region über dieselben Regeln anschließen (Drift, Klangkörper, Verständigung bei Wind).
5. **Atlas-Brücke erweitern**: bisher nur `flimmerbucht-r1` geprüft; keine erfundenen Verträge, bestehende Schnittstellen im Atlas (`astra-neubau`) nutzen.
6. **Freiwilliger Kompass** („Überrasche mich“, „Meiner Frage folgen“) — noch nicht begonnen.
7. Gesamt-Lint nicht grün (Altbestand, 15 Fehler) — nur bei Bedarf angehen.

## Spielstand und Atlas

Der Spielstand liegt im Browser in `localStorage` unter `phaenomenautik3-save-v1`. Unter „Spielstand mitnehmen“ lässt sich die aktuelle Reise als JSON exportieren und eine ausgewählte Datei ausdrücklich laden. Vor dem Ersetzen wird der aktuelle Stand gesichert; ungültige Daten oder eine inzwischen geänderte Browserquelle blockieren das Ersetzen. Für einen Rechnerwechsel vorher exportieren und auf dem anderen Rechner importieren. Unterschiedliche Browser und Origins, insbesondere Port 4178 und 4179, haben getrennte Speicher. Git-Commits enthalten diese Spielstände nicht.

Der tatsächliche Atlas-Anschluss unterstützt bisher nur Flimmerbucht. Atlas-URL: `http://127.0.0.1:4322/ganzsein?ganz=understand&encounter=flimmerbucht-r1`. Seine vorhandene Rückkehradresse ist fest auf `http://127.0.0.1:4178/?encounter=flimmerbucht-r1` gesetzt. Dieser Worktree läuft auf 4179; ein vollständiger Hin- und Rückweg zum aktuellen Worktree ist deshalb noch nicht belegt. Kein automatischer Austausch von Weltzuständen, Hafen-/Strandnotizen oder Atlas-Anliegen. Siehe [ATLAS-ANSCHLUSS.md](ATLAS-ANSCHLUSS.md).

## Nächste konkrete Schritte

1. Bildrate und räumliche Lesbarkeit verbessern und längeres freies Segeln bei wechselndem Wetter prüfen. Die erste Browserprüfung ist im Prüfprotokoll festgehalten; sie ist keine menschliche Gestaltungs- oder Klangabnahme.
2. Den wirklichen Atlas-Rückweg mit dem Atlas-Projekt koordinieren, ohne eine allgemeine Schnittstelle vorzutäuschen.
3. Zuerst vorhandene Begegnungs-, NPC-, Inventar- und Journalwege mit den neuen Raumfolgen verbinden; anschließend Strömungs- und Resonanzbereich gemäß Issue #2 an denselben Weltzustand anschließen.

Bei jedem Rechnerwechsel diese Datei aktualisieren. Zuerst `git status`, Branch, Remote und lokale Änderungen prüfen. Zusammengehörige eigene Änderungen gezielt committen und pushen; auf dem anderen Mac erst nach Bestandsprüfung übernehmen. Bei gleichzeitiger Arbeit getrennte Branches und Pull Requests verwenden. Kein blindes Pull, automatisches Stash, Reset, pauschales `git add -A`, Force-Push oder Umschreiben gemeinsamer Historie.

Zuletzt bestätigter Push des spielbaren Ausbaus einschließlich Kimi-Zusammenführung: `5e4a3249d4e054268bba6ec0301b29a5a75b91a3` auf `origin/codex/open-world-mac-mini-20261010`, am 10. Oktober 2026; lokaler Commit und Remote-Ref wurden identisch gelesen. [Draft-PR #3](https://github.com/ralfarminkirchner-netizen/phaenomenautik-3/pull/3) bündelt die Fortsetzung. Ein anschließender Übergabe-Commit aktualisiert ausschließlich diese Datei. Den neuesten Übergabe-Commit vor dem Rechnerwechsel mit `git log -1 --oneline` und `git ls-remote origin refs/heads/codex/open-world-mac-mini-20261010` abgleichen. Der Branch wurde nicht nach `main` zusammengeführt.
