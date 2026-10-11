# Weiterarbeit — gemeinsame Übergabe (Mac Mini ↔ iMac)

Zuletzt aktualisiert: 11. Oktober 2026, Kimi (Mac Mini).
Zuletzt tatsächlich gepushter Stand: Branch `kimi/open-world-20261010`, Commit `b4a07cb` auf `origin` (Böenpaket inkl. Auftrag 1, Build + 14 Open-World- + 8 Schiffsfeld-Tests grün, Browser-Abnahme am 11.10. bestanden).

## Arbeitskopien und Branches

| Ort | Worktree | Branch | Zweck |
| --- | --- | --- | --- |
| iMac / Hauptkopie | `…/Projects/phaenomenautik-3` | `main` | Unverändert gelassen; ihr uncommitter Stand vom 10.10. ist vollständig in `e659ac3` erhalten (hash-geprüft) |
| Codex-Sitzung | `…/Projects/phaenomenautik-3-mac-mini` | `codex/open-world-mac-mini-20261010` | War zuletzt aktiv; nicht anfassen, solange dort gearbeitet wird |
| Kimi | `…/Projects/phaenomenautik-3-kimi` | `kimi/open-world-20261010` | Aktiver Arbeitsbranch; enthält `origin/main` vollständig (M4.1/M4.1a sind Vorfahren) |

Regeln: kein Force-Push, keine umgeschriebene Historie, kein pauschales `git add -A`. Bei gleichzeitiger Arbeit getrennte Branches + Pull Requests. Vor eigenen Commits im fremden Worktree immer `git status` prüfen.

## Aktueller Stand (spielbar, geprüft 11.10.)

- **Böenfeld + Enterhaken** (`f07b471`, `ab76aeb`, `b4a07cb`): ortsgebundener Böenanteil (`gust`) in `openWorld.sampleFields`, identisch gespiegelt in Wellen-CPU und -Shader (höhere Wellenberge, wo der Wind stark ist). Schiff fängt Böen mit dem Wind als sichtbaren Schub; Enterhaken-Schwung trägt nach dem Loslassen weiter; Gleiten nutzt Böen. Fix: Schiff fuhr mit Heck voraus (`MODEL_YAW = π`); Segelknoten akzeptieren alle GLB-Namensschreibweisen; Sprungtaste feuert den Doppelsprung nur noch auf der Tastenflanke. Neuer wellenfolgender Schatten des Rumpfs auf dem Wasser (DOM-sicher, Node-Tests unberührt). Wasser: Nahfeld-Reflexion, Flachwasser gibt den Meeresboden frei. Werkzeuge 1/2/3 (Axt/Schaufel/Enterhaken); HUD-Windanzeige mit Pfeil, Gradzahl, m/s und Bö-Label. Browser-Abnahme 11.10.: Bug voraus, Schatten sichtbar, „13,2 m/s Bö!“, 0 Konsolenfehler.
- **Auftrag 1 aus Issue #2: Mara/Tove-Gedächtnis** (`c351057`): `KnowledgeEntry` trägt Ort (`room`) und Art (`kind`: message/delivery/retraction/observation) neben Zeit und Quelle; Mitteilung, Ausführung und Rücknahme bleiben getrennt gespeichert. Fragen nach Mara/Tove erzählt die gesamte Folge in Reihenfolge mit Art, Quelle, Weltzeit und Ort. `syncNpcMemory` verknüpft das Empfängerwissen mit der vorhandenen NPC-Erinnerung (`save.npcMemory.mara/tove`); ohne Übermittlung bleibt die andere Person außerhalb und bekommt keinen Eintrag. Alte Spielstände ohne Ort/Art bleiben importierbar. Browser-Abnahme 11.10.: Mara erinnert sich nach Neuladen wortgleich an beide Ereignisse (inkl. Original-Weltzeiten), Tove weiß nichts.

## Vorangegangener Stand (geprüft 10.10.)

- **M5 gekoppelte Weltzustände** (aus Codex' uncommittem Stand übernommen, da parallele Sitzung): ein persistenter Weltzustand (`src/game/openWorld.ts`) — Zeit, Wetter, Wind, Tide, Strömung, Sicht, Schall. Drei frei erreichbare Räume ohne Reihenfolgenzwang: Flimmerbucht (Reflektoren/Standpunkt), Werkhafen (verteiltes Wissen Mara/Tove, Materialübergabe), Stiller Strand (Nähe/Ruhe, ausdrückliche Einladung). Beobachtungsnotizen freiwillig, Deutungen revisionierbar, frühere Fassungen bleiben erhalten.
- **Festzeitschritt** (`src/game/fixedStep.ts`): 1/60-Simulationsschritte, Nachhol-Deckel 0,25 s — Hintergrundtabs holen keine Zeit nach (gemessen: 10,75 s verworfen).
- **Schiff/Wasser**: gemeinsames Wellenfeld für GPU und CPU-Abtastung, Rumpfpunkte, Strömung und Wind wirken auf den Rumpf (`qa/ship-fields.test.ts`).
- **Schutzpaket** (aus Hauptkopie erhalten): Schutzleiste in jedem Zustand, Pause via Escape/Sichtbarkeitswechsel, wahrheitsgemäßes Speichern mit Konfliktschutz, milde Begegnung Flimmerbucht (`GentleEncounter`), Atlas-Brücke nur für `flimmerbucht-r1` (siehe `docs/ATLAS-ANSCHLUSS.md`).
- **M4.1 Strand-Begegnungen + Sichtbarkeits-Fixes** sind über die Merge-Historie enthalten.
- **Spielstand-Export/Import**: Ortsleiste → „Spielstand mitnehmen“ (JSON, validiert; Import ersetzt erst nach ausdrücklicher Auswahl).

## Start- und Prüfkommandos

```bash
cd /Volumes/ThunderBolt4_2TB/Development/Projects/phaenomenautik-3-kimi
npm run dev          # Spiel (Vite)
npm run build        # tsc -b + vite build
npm run lint         # bekannte Altfehler, kein Gates
# Regressionstests (node:test, Bundles sind Artefakte in .qa-build/, ignoriert):
node_modules/.bin/esbuild qa/open-world.test.ts qa/ship-fields.test.ts \
  --bundle --platform=node --format=esm --packages=external --outdir=.qa-build
node --test .qa-build/open-world.test.js .qa-build/ship-fields.test.js
```

## Leistung (gemessen 10.10., Mac Mini M4, 16 GB, Produktionsbuild, eingebettete Ansicht 688×1091 @ 1,6)

- Volle Qualität (Stufe 0): **60 FPS** an Hafen, Flimmerbucht, offener See, Regen — bei ruhiger Maschine.
- Unter gleichzeitiger Last (parallele Builds/Tests einer zweiten Sitzung): 38–48 FPS.
- **Befund und Fix (`073469e`)**: die Qualitätsleiter stieg nie ab, weil die fpsEma sich bei 44,7–48 knapp über dem alten Schwellwert 44 einpendelte. Neu: Stufe sinkt unter 52 FPS, steigt erst über 58,5 (Hysterese). Reaktion synthetisch geprüft (Stufen 1→2→3 unter anhaltender Last), 19/19 Regressionstests grün.
- Die eingebaute „Technische Messung“ in der Ortsleiste liefert weiterhin ehrliche Momentaufnahmen je Browseransicht.
- Offen: Messung im Vollbild/größeren Fenstern und auf dem iMac; weitere optische Kosten (Reflexions-Kadenz, Bloom) nur bei erneutem Befund senken — Physik und Zugänge bleiben konsistent.

## Offene Aufgaben (aus Issue #2 und Übergabe-Kommentar)

Erledigt am 11.10.: **Auftrag 1 (Mara/Tove-Erinnerung)** — siehe oben.

1. **Auftrag 2 — Materialfluss**: `wood`/`rope` im Hafenlager mit `stamm`/`seil` im Bootsinventar nachvollziehbar verbinden; getrennte Orte, ausdrückliche Transfers, einmaliger Verbrauch. Fertig: gesammeltes Holz verändert durch eine ausgeführte Bauhandlung den sichtbar nutzbaren Steg; Mengen und Empfänger stimmen nach Neuladen.
2. **Auftrag 3 — Journal-Vergleich**: zwei Beobachtungen mit historischen Bedingungen freiwillig vergleichen (ähnlich/anders/widerspricht/noch offen), Deutungen revidierbar. Fertig: derselbe Versuch unter zwei Wetterlagen bleibt samt früherer Deutung nach Neuladen vergleichbar.
3. **Auftrag 4 — Neuroatlas-Recherche**: höchstens drei belegte Verknüpfungen (je Raum) aus dem echten Korpus `data/neuro-atlas/corpus.json`; Beobachtung, mögliche Lesart, Quelle und fehlende Verträge benennen; keine Integration.
4. **Strömungsinsel/Resonanzhafen**: vierte/fünfte Region über dieselben Regeln anschließen (Drift, Klangkörper, Verständigung bei Wind).
5. **Atlas-Brücke erweitern**: bisher nur `flimmerbucht-r1` geprüft; keine erfundenen Verträge, bestehende Schnittstellen im Atlas (`astra-neubau`) nutzen.
6. **Freiwilliger Kompass** („Überrasche mich“, „Meiner Frage folgen“) — noch nicht begonnen.
7. Gesamt-Lint nicht grün (Altbestand, 15 Fehler) — nur bei Bedarf angehen.

## Lokale Konfiguration (ohne Geheimnisse)

- Alles auf externem Volume `/Volumes/ThunderBolt4_2TB`; vor Schreibarbeiten `~/.config/external-development/bin/extern-dev` laufen lassen.
- Atlas-Quelle (separates Projekt): `/Volumes/ThunderBolt4_2TB/MeineApps/dein-sein-astra/astra-neubau` — Loopback-Rundlauf siehe `docs/ATLAS-ANSCHLUSS.md`.
- `node_modules` im Kimi-Worktree ist ein Symlink auf den Mac-Mini-Worktree — bei Konflikten dort `npm ci` ausführen und Symlink entfernen.
- GitHub überträgt keine Browser-Spielstände: für Rechnerwechsel „Spielstand mitnehmen“ (Export/Import) nutzen.
