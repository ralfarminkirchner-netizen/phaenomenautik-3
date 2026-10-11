# PR #4: Abgleich und gezielte Korrekturen

Geprüft am 11. Oktober 2026 gegen den gemeinsamen Entwicklungsstand
`30987d34daaae42478b3c7b8afe9e116825ce359` von
[Draft-PR #3](https://github.com/ralfarminkirchner-netizen/phaenomenautik-3/pull/3).
Der im Auftrag genannte Merge `4fd984f5cd71866ad3ca41341fc0ac6785f8bc2d`
aus [PR #4](https://github.com/ralfarminkirchner-netizen/phaenomenautik-3/pull/4)
ist ein Vorfahr dieses Stands. Der Remote-Abgleich vor dem Korrekturcommit
bestätigt weiterhin `30987d3` als Head des gemeinsamen Zweigs.

Die Korrektur liegt auf `fix/pr4-regressions-20261011` und richtet sich gegen
`codex/open-world-mac-mini-20261010`. Sie führt dieselbe Anwendung und die
bestehende Git-Historie fort. Bestehende Arbeitskopien und laufende Kimi-Ports
wurden nicht verändert. Keine Zusammenführung nach `main`, kein Deployment.

## Die sechs Review-Funde am aktuellen Stand

| Fund | Abgleich am Ausgangsstand | Beitrag dieser Korrektur |
| --- | --- | --- |
| [P1: fehlendes `npcMemory`](https://github.com/ralfarminkirchner-netizen/phaenomenautik-3/pull/4#discussion_r4242076825) | Bereits in `073ad3f` / PR #5 behoben: Normalisierung beim Laden, Importieren und Synchronisieren. | Zusätzlicher Test des normalen Start-/Ladewegs, Sync, Speichern und Neuladen eines alten v3-Stands. |
| [P1: strukturierte Erinnerungen im NPC-Dialog](https://github.com/ralfarminkirchner-netizen/phaenomenautik-3/pull/4#discussion_r4242076832) | Bereits in `073ad3f` / PR #5 behoben: `npcReply` liest empfängerbezogene `KnowledgeEntry` und nutzt `knowledgeLine`. | Tove-Chronologie mit wiederholtem gleichem Fakt, Rücknahme, Quelle/Art/Zeit/Ort, Empfängertrennung, Reload und Export/Import geprüft. Fehlende historische Metadaten bleiben unbekannt. |
| [P2: Werkzeugwechsel löst Haken nicht](https://github.com/ralfarminkirchner-netizen/phaenomenautik-3/pull/4#discussion_r4242076835) | Weiterhin bestätigt: Tastaturwahl setzte nur `store.tool`; der Haken zog weiter. | Tastaturwahl delegiert an `selectTool`; Axt/Schaufel lösen den Haken mit `releaseHook(false)`. Seil und Hakenkopf verschwinden, es entsteht kein neuer Launch. |
| [P2: Hook-Gleiten verbraucht Ausdauer](https://github.com/ralfarminkirchner-netizen/phaenomenautik-3/pull/4#discussion_r4242076837) | Bereits in `b5f3698` behoben: `hookGlide` umgeht `drain`. | Zusätzliche Tests bei null Ausdauer, mit und ohne gefertigten Gleitschirm sowie über echtes `GameWorld.simulate`. Gewöhnliches Gleiten verbraucht weiterhin Ausdauer. |
| [P2: Wind und Kompass vertauschen Nord/Süd](https://github.com/ralfarminkirchner-netizen/phaenomenautik-3/pull/4#discussion_r4242076842) | Bereits in `b5f3698` behoben: `atan2(windX, -windZ)` und tatsächlicher Kamerablick. | Reale HUD-Veröffentlichung für N/O/S/W und Wind in beiden Nord-/Südhälften des Richtungsraums geprüft. |
| [P2: Schaufel-Sperrzeiten gehen beim Neuladen verloren](https://github.com/ralfarminkirchner-netizen/phaenomenautik-3/pull/4#discussion_r4242076845) | Weiterhin bestätigt: Zeitpunkte standen nur in einer flüchtigen `GameWorld`-Map. | Optionales validiertes v3-Savefeld `dugSpots`; reale Schaufelaktion verwendet die gespeicherte Weltuhr. Fund und Sperre werden unmittelbar gemeinsam gespeichert. |

Die vier bereits vorhandenen Reparaturen werden nicht erneut implementiert.
Die ursprünglichen Review-Threads werden durch diesen neuen, noch nicht
integrierten Korrekturzweig nicht automatisch als gelöst markiert.

## Verhalten und Kompatibilität

Schaufelzellen behalten das bisherige Raster `Math.round(x / 3):Math.round(z / 3)`.
Eine Zelle bleibt bis zum Ablauf von 90 **Simulationssekunden** gesperrt.
Pause, geschlossene Anwendung und Neuladen erfinden keine verstrichene Spielzeit.
Abgelaufene Reservierungen werden beim nächsten erfolgreichen Graben entfernt.
Auch Versuche ohne Fund reservieren die Stelle; Wasser, Luft, Klettern und
laufende Angriffssperren reservieren keine Stelle.

Alte v3-Stände ohne `dugSpots` bleiben gültig und erhalten beim ersten Graben
ihre erste Reservierung. Vorhandene Reservierungen müssen Rasterzellen mit
endlichen, nicht negativen Weltzeitpunkten sein. Ungültige Importdaten werden
abgewiesen, ohne den vorhandenen Browserstand zu ersetzen.

Die bisherige 320-ms-Verzögerung der Schaufelbelohnung entfällt: Fund, Feedback
und Speicherung erfolgen jetzt innerhalb derselben Aktion. Dadurch kann ein
sofortiges Neuladen weder einen bereits vergebenen Fund ohne Sperre erhalten
noch einen verspäteten Belohnungs-Callback aus der alten Welt ausführen.
Fundwahrscheinlichkeiten und Ressourcenarten bleiben unverändert.

Ein Werkzeugwechsel löst einen fliegenden oder befestigten Haken ohne zusätzlichen
Auftrieb. Bereits durch bewusstes Loslassen entstandener Schwung bleibt beim
anschließenden Werkzeugwechsel erhalten. Die bisherige Orts-/Moduswechselregel
über `clearHook` bleibt bestehen.

## Ausgeführte Prüfungen

Umgebung: Node `v24.19.0`, npm `11.9.0`, Linux. Vorhandene Abhängigkeiten wurden
aus der bestehenden Arbeitskopie übernommen; das Lockfile ist unverändert.
Keine neue lokale Clean-Install-Prüfung behauptet. Die bestehende GitHub-Matrix
für Node 22.12.0, 22 und 24 führt weiterhin `npm ci` aus und prüft nun zusätzlich
`npm run test:world` bei Pull Requests.

| Prüfung | Ergebnis |
| --- | --- |
| `npm run test:world` | **63/63 bestanden**, einschließlich 23 neuer Regressionstests: 3 NPC-, 15 Bewegungs-/Richtungs- und 5 Schaufeltests. |
| `node qa/graph.cjs` | **18/18 bestanden**, 120 Knoten, 279 Kanten. |
| `npm run build` | TypeScript und Vite-Produktionsbuild erfolgreich. Die vorhandene Chunkgrößenwarnung bleibt. |
| `npm run test:server` | **3/3 bestanden**, einschließlich Assets und fehlerhafter URL-Escapes. |
| ESLint der geänderten Spielquellen und neuen Testdateien | Bestanden. Kein neuer vollständiger Repository-Lint behauptet. |
| `git diff --check` | Bestanden. |
| Bestand visueller Assets | Alle **94 Dateien** aus `public/` bytegleich in `dist/`; keine Änderungen an `public/` oder `package-lock.json`. |

Die zusätzlichen Tests stehen in `qa/npc-review.test.ts`,
`qa/movement-review.test.ts` und `qa/digging-review.test.ts` und sind Teil des
regulären Welt-Testbefehls sowie der bestehenden CI.

Die Tests verwenden synthetische v3-Spielstände und einen `localStorage`-Adapter;
sie ändern keine Nutzer-Spielstände. Laden, Importvalidierung und Persistenz
laufen durch die echten Spielfunktionen. NPC-Antworten nutzen das tatsächliche
`npcReply`. Bewegungs-/Schaufeltests rufen echte `Player`- und
`GameWorld`-Methoden auf; Renderer, Assetladen und UI-Timer sind CPU-Testadapter.
Im Schaufeltest ersetzt ein Aufruf von echtem `persistSave` die Kamera-/
Schiffssynchronisierung von `GameWorld.persist`.

## Verbleibende Grenzen und Browserabnahme

In dieser Sitzung ist der vorgesehene `control-browser`-Zugang nicht verfügbar.
Deshalb wurde kein Vorschau-Browser gestartet und keine neue WebGL-, Bild-,
Klang-, Bedien- oder Leistungsabnahme behauptet. Frühere Browserprüfungen des
gemeinsamen Zweigs bleiben historische Nachweise und gelten nicht als neue
Prüfung dieser Korrektur.

Vor Spielabnahme noch im tatsächlichen Browser prüfen:

1. Haken auswerfen/befestigen, dann 1 bzw. 2 drücken: Seil verschwindet und
   weiterer Seilzug endet. Bewusstes Loslassen trägt weiterhin den Schwung.
2. Nach Hook-Schwung bei leerer Ausdauer gleiten, auch mit gebautem Gleitschirm;
   anschließend gewöhnliches Gleiten auf unveränderten Ausdauerverbrauch prüfen.
3. Windpfeil und Kompass bei unterschiedlichen Kamerablicken auf Nord/Süd sowie
   Ost/West vergleichen.
4. Graben und sofort speichern/neuladen: derselbe Ort liefert vor 90
   Spielsekunden keinen zweiten Fund; nach Ablauf ist er wieder verfügbar.
   Export/Import erhält die Sperre.
5. Alten Stand ohne `npcMemory` laden; Mara/Tove getrennt ansprechen und
   Mitteilung, Übergabe und Rücknahme nach Neuladen mit Art/Quelle/Zeit/Ort abrufen.

Laufende Masken-/Register-/Journalvergleichsarbeiten sowie tatsächliche
Atlasverbindungen gehören weiter zum bestehenden gemeinsamen Ausbau und wurden
durch diesen begrenzten Korrekturauftrag nicht übernommen oder als fertig erklärt.
