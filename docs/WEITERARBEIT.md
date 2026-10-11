# Gemeinsame Weiterarbeit

Stand: 11. Oktober 2026. Auftrag: [Issue #2](https://github.com/ralfarminkirchner-netizen/phaenomenautik-3/issues/2). GitHub überträgt weder Kimi-Chatverlauf noch Browser-Spielstände.

Zuletzt gesicherter und gepushter Spielcode: `0f1e78ab56e2457fe7c23d2c27a2310086888115` auf `codex/open-world-mac-mini-20261010`, einschließlich Overlay-Fix in `src/ui/protection.css`. NPC-, Material- und Journaländerungen aus [PR #5](https://github.com/ralfarminkirchner-netizen/phaenomenautik-3/pull/5), [PR #6](https://github.com/ralfarminkirchner-netizen/phaenomenautik-3/pull/6) und [PR #7](https://github.com/ralfarminkirchner-netizen/phaenomenautik-3/pull/7) sind integriert. Frühere Push-Angaben unten sind historische Zwischenstände. Der spätere Dokumentationscommit ist vor dem Rechnerwechsel gesondert mit dem Remote abzugleichen.

Der Materialkreislauf, der sichtbar nutzbare reparierte Steg und Neuladen wurden im Browser geprüft. Ein unabhängiger Prüfer meldet zusätzlich erfolgreiche Journalhistorie, Revision, Export und Import mit erhaltenen Zuständen. 40 Tests (18 Welt, 10 Schiff, 9 Material, 3 Journal) bestanden am integrierten Stand `624d1b4`; TypeScript und Vite-Build bestanden auch nach dem Overlay-Fix. Bei 1280 × 800 und 1280 × 720 sind Journalkopf, Tabs und Schließen vollständig im Fenster; Canvas-Klicks sind erreichbar, die Fehlerliste ist leer. Die unabhängige Prüfung auf Port 4181 bestätigte unveränderte historische Beobachtungen/frühere Deutung und echtes Segeln. Einzelheiten und offene Abnahmen: [PRUEFUNG-2026-10-11.md](PRUEFUNG-2026-10-11.md).

Kimi hat den selektiven Port aus `main` (Ausgangsstand `8be9f0a`, 357 Masken/119 Knoten) gegen `624d1b4` in einem getrennten Worktree ausdrücklich angenommen und begonnen. Der neueste `origin/main` ist `44b222d`; weiter gezielt portieren, keinen Vollmerge durchführen. Masken/Atlasregister, freiwillige Sprache und eine persistierte Journal-Vergleichsbeziehung sind noch ungepusht und nicht integriert. Die Codex-Korrektur des höhenlosen Overlaycontainers ist dagegen gepusht und sichtbar geprüft.

Die menschliche Originalfundstelle zu „Teil 4“ fehlt weiterhin. Der Variantenraum ist Kimis heutiger Vorschlag, keine bestätigte Zuordnung dieses Teils; „Teil 4“ wird nicht mit M4 gleichgesetzt.

## Arbeitsstand und Schutz des Bestands

Die ursprüngliche Arbeitskopie `/Volumes/ThunderBolt4_2TB/Development/Projects/phaenomenautik-3` enthält zahlreiche lokale Änderungen und bleibt erhalten. Der geprüfte Szenen-, Text- und Schutzstand wurde als Ausgangspunkt gesichert; der bestehende Produktions-Build-Fix wurde zusammengeführt. Die Fortsetzung liegt im isolierten Worktree `/Volumes/ThunderBolt4_2TB/Development/Projects/phaenomenautik-3-mac-mini`, Branch `codex/open-world-mac-mini-20261010`. Remote: `https://github.com/ralfarminkirchner-netizen/phaenomenautik-3.git`.

Der erste zusammenhängende Ausbau enthält Flimmerbucht, Werkhafen und Stillen Strand. Alle sind ohne Freischaltung erreichbar; die Segelhilfe ist optional. Gemeinsame Zeit, Wetter, Wind, Wasserfelder, Licht und Klang beeinflussen Boot und Begegnungen. Buchtversuche, getrennte Zeugenaussagen, gezielte Mitteilungen und begrenzte Materialien im Hafen sowie aktuelle Einladungen am Strand haben konkrete Zustandsfolgen. Beobachtungsnotizen trennen festgehaltene Tatsachen von eigener Deutung und bewahren frühere Formulierungen bei Revisionen. Freies Segeln ist der Haupteinstieg; ruhiges Ankommen und Reflexion bleiben freiwillig. Issue #2 ist damit noch nicht vollständig umgesetzt.

## Historisches Kimi-Paket vom 11.10.

Die folgenden Paketangaben und Browserbeobachtungen stammen aus Kimis damaligem Bericht. Der aktuelle geprüfte Umfang und seine Grenzen stehen im neuen Prüfprotokoll.

- **Böenfeld + Enterhaken** (`f07b471`, `ab76aeb`, `b4a07cb`): ortsgebundener Böenanteil (`gust`) in `openWorld.sampleFields`, identisch gespiegelt in Wellen-CPU und -Shader (höhere Wellenberge, wo der Wind stark ist). Schiff fängt Böen mit dem Wind als sichtbaren Schub; Enterhaken-Schwung trägt nach dem Loslassen weiter; Gleiten nutzt Böen. Fix: Schiff fuhr mit Heck voraus (`MODEL_YAW = π`); Segelknoten akzeptieren alle GLB-Namensschreibweisen; Sprungtaste feuert den Doppelsprung nur noch auf der Tastenflanke. Neuer wellenfolgender Schatten des Rumpfs auf dem Wasser (DOM-sicher, Node-Tests unberührt). Wasser: Nahfeld-Reflexion, Flachwasser gibt den Meeresboden frei. Werkzeuge 1/2/3 (Axt/Schaufel/Enterhaken); HUD-Windanzeige mit Pfeil, Gradzahl, m/s und Bö-Label. Browser-Abnahme 11.10.: Bug voraus, Schatten sichtbar, „13,2 m/s Bö!“, 0 Konsolenfehler.
- **Auftrag 1 aus Issue #2: Mara/Tove-Gedächtnis** (`c351057`): `KnowledgeEntry` trägt Ort (`room`) und Art (`kind`: message/delivery/retraction/observation) neben Zeit und Quelle; Mitteilung, Ausführung und Rücknahme bleiben getrennt gespeichert. Fragen nach Mara/Tove erzählt die gesamte Folge in Reihenfolge mit Art, Quelle, Weltzeit und Ort. `syncNpcMemory` verknüpft das Empfängerwissen mit der vorhandenen NPC-Erinnerung (`save.npcMemory.mara/tove`); ohne Übermittlung bleibt die andere Person außerhalb und bekommt keinen Eintrag. Alte Spielstände ohne Ort/Art bleiben importierbar. Browser-Abnahme 11.10.: Mara erinnert sich nach Neuladen wortgleich an beide Ereignisse (inkl. Original-Weltzeiten), Tove weiß nichts.

## Vorangegangener Stand (geprüft 10.10.)

Am 10. Oktober wurde der inzwischen gepushte Branch `kimi/open-world-20261010` gegen diesen Arbeitsbranch geprüft. Kimi dokumentiert in `4d3e148` die Übernahme des damaligen, noch uncommitteten Codex-Ausbaus. Weltmodell, Festzeitschritt, drei Raumdarstellungen, Schiffsfelder und Atlas-Dokumentation sind auf beiden Seiten identisch; das sind dieselben Systeme, keine zwei unabhängig gebauten Spiele.

Kimis zusätzliche Qualitätsleiter aus `073469e` senkt die Darstellungsqualität unter 52 FPS und erhöht sie erst über 58,5 FPS. Sie ist in `5e4a324` unter Erhalt beider Git-Historien zusammengeführt und gepusht. Die späteren Codex-Reparaturen an Anker, Ortskamera, Eingabefokus, Wasserreflexion und Importprüfung bleiben erhalten. Zusammenführung und spätere Änderungen gehen weiterhin über Draft-PR #3; `main` wird nicht direkt verändert. TypeScript/Vite-Build und 20 Weltprüfungen bestanden; daraus folgt keine neue Leistungs- oder menschliche Abnahme.

Parallel existiert die Aufgabe „Phänomenautik neu entwerfen“ mit der eigenen App „Feldbuch“ im KiNTEGRiTY-Variantenraum (lokal `http://127.0.0.1:5187/?variante=gpt-6`). Diese Aufgabe verantwortet die Konzept-/Forschungsbuchvariante. Hier wird das vorhandene Segelspiel fortgesetzt. Keine zweite allgemeine Forschungsbuch-, Linsen- oder Chat-App in diesem Repository beginnen. Spielbeobachtungen erst über tatsächlich vorhandene Verträge anschließen.

Der damalige Anschlussauftrag für NPC, Inventar und Journal ist inzwischen durch PR #5/#6/#7 umgesetzt. Der verbleibende Begegnungs-/Registeranschluss gehört zum laufenden selektiven Kimi-Port. Vor jedem neuen System beide gepushten Branches und laufende lokale Arbeit vergleichen; ungesyncte Arbeit auf dem anderen Mac bleibt ausdrücklich unbekannt.

Aufgabenverteilung nach ausdrücklicher Nutzerklärung: Codex verantwortet Denkentscheidungen, Prioritäten, Systemzusammenhänge, präzise Aufträge und Ergebnisprüfung. Kimi übernimmt überwiegend Recherche und Umsetzung. Codex übernimmt schwierige konzeptionelle, visuelle oder spielerische Lösungen selbst, wenn Kimi sie nicht erreicht. Aufträge über den gemeinsamen GitHub-Kontext übergeben; eine dort hinterlegte Aufgabe ist noch keine bestätigte Arbeitsaufnahme durch Kimi.

Abgleich der vier bereits erteilten Aufträge:
1. Mara/Tove: empfängerbezogenes Wissen mit Zeit, Ort und Quelle ist integriert. Mitteilung, Ausführung und Rücknahme bleiben getrennt; die andere Person erhält ohne Übermittlung kein Wissen.
2. Materialfluss: ausdrückliche Hin- und Rücktransfers verbinden Hafenlager und Bootsinventar; Bauverbrauch und nutzbarer Steg sind integriert und im Browser geprüft. `save.wood` bezeichnet Brennholz, `save.materials.stamm` echte Treibstämme; diese Bestände nicht vermischen. Rücknahme bei fehlender Kapazität wird atomar abgewiesen.
3. Journal: historische Bedingungen und revidierbare Deutungen sind integriert; Reload, Export und Import wurden unabhängig geprüft. Die persistierte Beziehung zwischen zwei freiwillig verglichenen Beobachtungen gehört noch zum laufenden Kimi-Port.
4. Neuroatlas-Recherche: [drei begrenzte Vorschläge](NEUROATLAS-RECHERCHE-2026-10-11.md) liegen mit Belegen aus dem tatsächlichen nativen Korpus vor. Spielbezüge sind Interpretationen; Korpusclaims sind nicht menschlich bestätigt. Keine Diagnose aus Spielverhalten und keine fertige Integration. GANZ-SEiN-Flimmerbucht-Link und nativer Neuroatlas bleiben getrennte Systeme; die synthetische Übergabefixtur belegt keinen bestätigten Browser-Vertrag oder Empfänger.

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

Die beiden Prüfskripte gehören zu diesem Ausbau. Aktuelle technische und Browserprüfung: [PRUEFUNG-2026-10-11.md](PRUEFUNG-2026-10-11.md); die [Prüfung vom 10.10.](PRUEFUNG-2026-10-10.md) bleibt historisch erhalten. 60 FPS bleiben ein Leistungsziel unter ausdrücklich benannten Bedingungen.


## Offene Aufgaben (aus Issue #2 und Übergabe-Kommentar)

1. **Laufender Kimi-Port**: vorhandene Masken und Knoten selektiv übernehmen, tatsächliche Begegnungen im bestehenden Atlasregister lesbar machen und Pflicht-/Freischalttexte korrigieren. Abnahme: frei gewählte Begegnung ohne Aufgabenleiter; ihre Registerspur nach Neuladen im vorhandenen Journal sichtbar. Kein paralleler Bauauftrag für dieselben Dateien.
2. **Persistierter Journalvergleich im selben Kimi-Auftrag**: zwei historische Beobachtungen freiwillig als ähnlich/anders/widerspricht/noch offen verbinden. Abnahme: Beziehung und aktuelle/frühere Deutung bleiben nach Neuladen und Export/Import erhalten.
3. **Sichtprüfung nach Kimi-Port**: die gemeinsame Overlaykorrektur ist mit `0f1e78a` gepusht und geprüft. Neue Vergleichs- und Maskenwege nach ihrer Integration nochmals im echten Browser abnehmen.
4. **Quellen- und Atlasgrenzen**: Originalfundstelle zu „Teil 4“ weiter offen; echter GANZ-SEiN-Rückweg zum aktuellen Origin und ein nativer Neuroatlas-Empfängervertrag sind nicht belegt.
5. Weiterer Umfang aus Issue #2 (Strömungs-/Resonanzbereiche, freiwilliger Kompass, längeres freies Segeln) folgt nach Abnahme des vorhandenen Ports. Der historische Gesamt-Lint-Befund wurde hier nicht neu geprüft.

## Spielstand und Atlas

Der Spielstand liegt im Browser in `localStorage` unter `phaenomenautik3-save-v1`. Unter „Spielstand mitnehmen“ lässt sich die aktuelle Reise als JSON exportieren und eine ausgewählte Datei ausdrücklich laden. Vor dem Ersetzen wird der aktuelle Stand gesichert; ungültige Daten oder eine inzwischen geänderte Browserquelle blockieren das Ersetzen. Für einen Rechnerwechsel vorher exportieren und auf dem anderen Rechner importieren. Unterschiedliche Browser und Origins, insbesondere Port 4178 und 4179, haben getrennte Speicher. Git-Commits enthalten diese Spielstände nicht.

Der tatsächliche Atlas-Anschluss unterstützt bisher nur Flimmerbucht. Atlas-URL: `http://127.0.0.1:4322/ganzsein?ganz=understand&encounter=flimmerbucht-r1`. Seine vorhandene Rückkehradresse ist fest auf `http://127.0.0.1:4178/?encounter=flimmerbucht-r1` gesetzt. Dieser Worktree läuft auf 4179; ein vollständiger Hin- und Rückweg zum aktuellen Worktree ist deshalb noch nicht belegt. Kein automatischer Austausch von Weltzuständen, Hafen-/Strandnotizen oder Atlas-Anliegen. Siehe [ATLAS-ANSCHLUSS.md](ATLAS-ANSCHLUSS.md).

## Nächste konkrete Schritte

1. Laufenden Kimi-Port abschließen, gezielt prüfen und über den bestehenden PR-Weg zusammenführen. Der gemeinsame Overlay-Fix ist bereits gepusht. Uncommittete Arbeit vor jedem neuen Auftrag prüfen und erhalten.
2. Im Browser Overlaylage, frei wählbare Masken, Registerspur und persistierten Journalvergleich samt Reload/Export/Import prüfen; technische Tests ersetzen diese Sichtprüfung nicht.
3. Erst danach weitere Räume und längeres freies Segeln prüfen. Den wirklichen Atlas-Rückweg separat mit dem Atlas-Projekt koordinieren, ohne einen allgemeinen Vertrag vorzutäuschen. Menschliche Gestaltungs- und Klangabnahme bleiben eigene Schritte.

Bei jedem Rechnerwechsel diese Datei aktualisieren. Zuerst `git status`, Branch, Remote und lokale Änderungen prüfen. Zusammengehörige eigene Änderungen gezielt committen und pushen; auf dem anderen Mac erst nach Bestandsprüfung übernehmen. Bei gleichzeitiger Arbeit getrennte Branches und Pull Requests verwenden. Kein blindes Pull, automatisches Stash, Reset, pauschales `git add -A`, Force-Push oder Umschreiben gemeinsamer Historie.

Zuletzt bestätigter Push des hier geprüften Spielcodes: `0f1e78ab56e2457fe7c23d2c27a2310086888115` auf `origin/codex/open-world-mac-mini-20261010`, am 11. Oktober 2026. `624d1b4` und der frühere Push `5e4a3249d4e054268bba6ec0301b29a5a75b91a3` vom 10.10. bleiben historische Zwischenstände. [Draft-PR #3](https://github.com/ralfarminkirchner-netizen/phaenomenautik-3/pull/3) bündelt die Fortsetzung. Der neueste `origin/main`-Stand `44b222d` ist nicht vollständig in diesem Branch enthalten. Den späteren Dokumentationscommit und Remote vor dem Rechnerwechsel mit `git log -1 --oneline` und `git ls-remote origin refs/heads/codex/open-world-mac-mini-20261010` abgleichen; laufende ungepushte Portarbeit zählt nicht zum bestätigten Push.
