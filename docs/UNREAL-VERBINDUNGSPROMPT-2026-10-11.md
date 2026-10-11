# Fortsetzungsprompt: Neuro Atlas mit Phänomenautik verbinden

Dieser Prompt ist für den bestehenden Unreal-Projektchat bestimmt. Seine Erstellung startet keinen Unreal-Umbau. Die browserbasierte Phänomenautik wird separat im bestehenden Projekt weiter verfeinert. Bestandsprüfung: 11. Oktober 2026.

---

Setze das vorhandene native **Neuro-Atlas-Spiel** auf diesem Mac Mini fort und verbinde seine Welt mit den tragfähigen Konzepten der bestehenden **Phänomenautik**. Ziel ist eine zusammenhängende 3D-Open-World in der heutigen Zeit: Stadt und Hafen, große befahrbare Flusswege, Flussmündung, Meer, Küsten und Inseln. Der Phänomenatlas gehört als freiwillig nutzbarer Wissens- und Deutungsraum in diese Welt. Segeln, Erkunden, Gestalten, Sammeln und Begegnungen dürfen für sich Freude machen.

## Tatsächliche Bestände zuerst prüfen

- Entwickle im bestehenden Projekt `/Volumes/ThunderBolt4_2TB/Unreal/Projects/neuro-atlas`. `NeuroAtlas.uproject` verwendet EngineAssociation `5.8`; die installierte Engine wurde als **5.8.2** geprüft. Modulname `Phaenomenatlas` bleibt für serialisierte Klassen kompatibel. Standardkarte ist `/Game/Maps/NeuroAtlas`, mit `CityExplorerGameMode`.
- Lies die dortige `AGENTS.md`, `HANDOFF-20260906.md`, `HANDOFF-TECHNIK.md` und `AUFTRAG-STADTUMBAU.md`; lokalisiere fehlende Übergabedateien vor einer Annahme. Das eingefrorene Original `/Volumes/ThunderBolt4_2TB/Unreal/Projects/phaenomenatlas` und vorhandene Sicherungen bleiben erhalten.
- Phänomenautik-Referenz: `/Volumes/ThunderBolt4_2TB/Development/Projects/phaenomenautik-3-mac-mini`, Branch `codex/open-world-mac-mini-20261010`, Repository <https://github.com/ralfarminkirchner-netizen/phaenomenautik-3>, vollständiger Auftrag Issue #2, bestehender Draft-PR #3. Lies zuerst `docs/WEITERARBEIT.md`, `docs/PRUEFUNG-2026-10-11.md`, `docs/ATLAS-ANSCHLUSS.md` und `docs/NEUROATLAS-RECHERCHE-2026-10-11.md`. Prüfe die tatsächlichen jüngsten Commits und laufenden Änderungen: Es gibt zusätzliche Kimi-Iterationen und einen ungepushten Port in `phaenomenautik-3-masks-port`; einen GitHub-Auftrag nicht mit gelesener oder fertiger Arbeit gleichsetzen.
- Vor Schreibarbeiten `/Users/ralfkirchner/.config/external-development/bin/extern-dev status` ausführen. Erwartete Volume-UUID: `A03B10FD-5F22-4366-A71C-2D95AC701BD2`. Arbeitskopien, Abhängigkeiten, Builds, große Caches und neue persistente Daten bleiben auf diesem externen Volume. Kein interner Ersatzpfad.
- Prüfe Gitstatus und laufende Agentenarbeit. Der Unreal-Bestand hat zahlreiche uncommittete Stadt-, Dialog- und Begegnungsänderungen. Erhalte sie vollständig; kein blindes Pull, Reset, automatisches Stash, `git add -A` oder Force-Push. Verwende getrennte Branches bei paralleler Umsetzung und Pull Requests zur Zusammenführung. Vor UI-Arbeit das `/Volumes/ThunderBolt4_2TB/Development/GRUNDMANIFEST-MENSCHLICHE-OBERFLAECHEN.md` lesen.

## Ein gemeinsames Spielkonzept

Übernimm Konzepte und geprüfte Zustandsregeln aus Phänomenautik in die vorhandenen nativen Systeme. Die bisherige Figur, Kamera, Stadt, Fahrzeuge, Begegnungen, Quellenregister und private Reisespur sind die Grundlage. Die vorhandene Talstadt kann einen heutigen Hafen und Wasserwege erhalten. Der vollständige Atlas bleibt die einzige Quellenbasis; zusätzliche Deutungen erhalten eigene Herkunft. Entwickle keine weitere Ersatz-App und kopiere nicht ungeprüft die Three.js-Implementierung in Unreal.

Verbindlich bleibt: Spieler folgen Aufmerksamkeit, Neugier oder gegenwärtigem Bedürfnis. Orte und Begegnungen sind in beliebiger Reihenfolge erreichbar und wieder besuchbar. Es gibt keine verpflichtende Geschichte, Freischaltleiter oder erforderliche Reflexion. Deutungen bleiben revidierbar. ADHS-bezogene Erfahrungen dürfen in Atmosphäre, Situationen und frei wählbaren Hilfen vorkommen; Spielhandlungen erzeugen keine Diagnose, Symptomwertung oder Aussage über die Person.

Die drei vorhandenen Phänomenräume liefern konkrete Mechaniken:

1. **Flimmerbucht:** Licht, Blickwinkel, Wetter und Reflektoren verändern sichtbare Erscheinungen. Figuren kennen nur ihren eigenen Blick und ausdrücklich mitgeteilte Beobachtungen. Unterschiedliche Wahrnehmungen bleiben nebeneinander lesbar.
2. **Werkhafen:** Material hat reale Mengen, Wege und Empfänger. Übergabe, Bau und Rücknahme unterscheiden sich. Ein reparierter Steg verändert sichtbare Geometrie und tatsächliche Begehbarkeit. Eine Absicht allein verändert weder Inventar noch NPC-Wissen.
3. **Stiller Strand:** Abstand, Geräuschlage und Gesprächswunsch sind freiwillig veränderbar. Rückzug und erneute Annäherung bleiben möglich.

Das Journal hält damalige Bedingungen und Handlungen fest. Eigene Deutungen und spätere Revisionen bleiben getrennt von historischen Beobachtungen. Vergleiche können freiwillig „ähnlich“, „anders“, „widerspricht“ oder „noch offen“ lauten. Erfundenes Szenenmaterial, Primärquelle, Modellvorschlag und menschliches Urteil bleiben unterscheidbar. Begegnungsregister und freie Wiederbegegnungen nur aus dem tatsächlich geprüften Kimi-Port übernehmen; dessen Abschluss nicht vorwegnehmen.

## Technische Reihenfolge und sichtbare Abnahme

**Erster Auftrag: den vorhandenen nativen Stand zuverlässig wieder betreten.** Die gespeicherte `Content/Maps/NeuroAtlas.umap` wurde noch vom 6. September, 04:38 Uhr, vorgefunden. Ein alter `stage-result.json` mit Erfolg bestätigt nicht den späteren Umbau. Der zweite Kartenaufbau stürzte laut `Saved/NeuroAtlasReview/Town-stage2.log` mit `RenderResource.cpp:254` ab; als Besitzer ist `SM_STADT_ValleyTerrain` genannt. `TownScene.surface()` baut vorhandene Static Meshes mehrfach um. Prüfe diesen Ressourcenlebenszyklus als Reparaturansatz; die Ursache ist noch nicht bewiesen. Sichere den vorhandenen Stand, repariere gezielt und speichere die bestehende Karte erfolgreich. Abnahme: native Eingabe, Bewegung, Brückenroute, Begegnung, Quellenaufruf sowie Speichern und erneutes Öffnen funktionieren sichtbar. Ein Build allein erfüllt sie nicht.

**Zweiter Auftrag: einen zusammenhängenden Wasserweg bauen.** Fluss und See existieren bisher als eigene Meshes. Ein WaterBody-/Buoyancy-System, Boot und WorldPartition-Anbindung sind nicht nachgewiesen. Prüfe die installierte Engine, vorhandene Plugins und Mac-Leistung; wähle erst dann die passende Umsetzung. Erster spielbarer Abschnitt: heutiger Hafen → befahrbare Flussmündung → Küstenwasser → eine Insel → Rückweg. Die große Welt folgt aus derselben Geografie und denselben Systemen. Wasserstraßen verbinden Orte tatsächlich; sie sind keine getrennten Auswahlbildschirme. Sichtbare Landmarken helfen der Orientierung. Boot, Anlegen, Aussteigen und Wiederbesteigen müssen als echte Bewegung funktionieren.

Abnahme dieses Abschnitts: Mit echten Eingaben vom vorhandenen Stadtgebiet zum Hafen gehen, per Boot durch die Mündung zur Insel fahren, dort anlegen und zu Fuß erkunden, eine freiwillige Begegnung oder Bauaktion nutzen und zurückkehren. Wasser, Ufer, Kollisionsflächen, Übergänge und Kamera müssen dabei zusammenpassen. Nach Speichern und Neustart bleiben Reiseort, Materialmengen, NPC-Wissen und Journal erhalten. Dokumentiere den sichtbaren Weg mit Bildern und nenne konkrete Leistungsgrenzen auf diesem Mac Mini.

**Dritter Auftrag: Atlaswissen am Ort nutzbar machen.** Nutze den unveränderten `data/neuro-atlas/corpus.json`; zusätzliche Interpretationen getrennt speichern. Zunächst höchstens drei belegte Rechercheanschlüsse aus der vorhandenen Recherche prüfen, einschließlich ihrer Aussagegrenzen. Der Misophonie-Befund begründet beispielsweise keine positive ADHS-Zuordnung. Zeige verständliche Phänomennamen und Quellen; technische Kennungen gehören in geschlossene Diagnoseansichten. Quellenaufruf und eigene, revidierbare Notiz müssen nativ funktionieren, ohne eine Reflexion vorauszusetzen.

## Tatsächliche Schnittstellen respektieren

Der GANZ-SEiN-Flimmerbucht-Anschluss ist ein separates System: Browsernavigation von Phänomenautik auf Port 4179 zum vorhandenen Bereich auf Port 4322, mit Rückweg zum gespeicherten Browser-Spielstand. Er synchronisiert weder Weltzustand noch Journal. Die native Begegnungsbrücke `phaenomen.bruecke.v1` ist bislang eine synthetische lokale Fixture; Atlas-Ergebnisempfänger und GANZ-SEiN-Intentionsempfänger sind nicht verifiziert. Behaupte keine fertige Integration. Eine neue Verbindung braucht zuerst einen nachgewiesenen Empfänger und einen kleinen, ausdrücklich ausgelösten Übergabevertrag mit Herkunft, Version und Rückweg. Private Berichte werden nicht zu NPC-Biografien; lokale KI bleibt ausdrücklich ausgelöst gemäß Projektanweisung.

## Zusammenarbeit und Lieferung

Kimi übernimmt den Großteil von Recherche und Umsetzung; Codex steuert Architektur, Prioritäten und Abnahme und übernimmt schwierige System- oder visuelle Probleme, wenn nötig. Vergib jeweils einen begrenzten Auftrag mit sichtbarem Abnahmekriterium. Keine doppelte Bearbeitung laufender Dateien. „Teil 4“ bleibt eine ungeklärte historische Fundstelle und wird weder M4 noch einer heutigen Iteration gleichgesetzt.

Beginne mit einem knappen belegten Bestandsabgleich und dem ersten Reparaturauftrag. Liefere danach echte native Fortschritte im vorhandenen Projekt, gezielte Commits und Pull Requests sowie eine aktuelle Übergabe mit tatsächlich gepushtem Stand. Unterscheide Quellprüfung, Build, native Sichtprüfung und menschliche Gestaltungsabnahme. Die Phänomenautik bleibt währenddessen in ihrem bestehenden Projekt in Weiterentwicklung.
