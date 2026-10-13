# Gemeinsame Weiterarbeit

Stand: 13. Oktober 2026. Auftrag: [Issue #2](https://github.com/ralfarminkirchner-netizen/phaenomenautik-3/issues/2). GitHub überträgt weder Kimi-Chatverlauf noch lokale Browser-Spielstände. Diese Datei bei jedem Rechnerwechsel aktualisieren.

## Arbeitsstand und Bestandsschutz

Fortsetzung im vorhandenen externen Worktree `/Volumes/ThunderBolt4_2TB/Development/Projects/phaenomenautik-3-mac-mini`, Branch `codex/world-continuation-mac-mini-20261013`. Remote: `https://github.com/ralfarminkirchner-netizen/phaenomenautik-3.git`. PR #8 und #9 sind mit erhaltener Historie lokal integriert, noch nicht auf diesem Branch gepusht. Kein Vollmerge des abweichenden `main`.

**Zuletzt tatsächlich gepusht:** `8ae7a004dbf7267d970d16895e143e56dacb426b` auf `origin/codex/open-world-mac-mini-20261010`. Der heutige Ausbau zählt bis zum bestätigten Push nicht dazu; diese Angabe danach aktualisieren.

Die ursprüngliche Arbeitskopie `/Volumes/ThunderBolt4_2TB/Development/Projects/phaenomenautik-3` bleibt mit 23 geänderten versionierten Dateien und neun unversionierten Gruppen erhalten. Alle 72 Quellhashes aus `LOCAL-BASELINE-2026-10-10.json` sind unverändert. Ungesyncte Arbeit auf dem iMac bleibt unbekannt und muss dort zuerst geprüft werden.

## Hier spielbar

- Vier frei erreichbare Orte: Flimmerbucht, Werkhafen, Stiller Strand und neues Strömungsfeld. Gemeinsame Zeit, Wetter und Felder laufen auch außerhalb des gewählten Ortes weiter; keine Freischaltfolge.
- Im Strömungsfeld folgen Boot und angebundene Boje demselben örtlichen Strömungsfeld. Leittorstellungen 0/45/90 Grad verändern dessen Richtung; eine feste Referenz macht Bewegung vergleichbar. Tor, Boje und Referenz werden gespeichert.
- Das Hauptjournal bewahrt historische Beobachtungsbedingungen, Deutungsrevisionen und jetzt dauerhafte, revidierbare Beziehungen zwischen zwei Beobachtungen. Importprüfung schützt Referenzen und Zeitfolgen; normale Ansichten zeigen verständliche Bezeichnungen statt IDs.
- Vorhandener Materialkreislauf, nutzbarer reparierter Steg und empfängerbezogenes NPC-Wissen bleiben erhalten. Maskentastatur, mobiles HUD und Journal-Escape sind korrigiert; lokaler Wind verändert nicht mehr versehentlich globale Wellen.

Browserbelegt: freie Ortswechsel, echtes Segeln, bewegte Boje, zwei Beobachtungen und ein Vergleich mit Revision nach Reload und echtem JSON-Export/Import/Reload; Mobilansicht ohne horizontales Überlaufen oder HUD-Überlappung. Abschließend erfolgreich: 71 Welt-, 16 Strömungs-, drei Server- und 31 Browserprüfungen sowie der Produktionsbuild. Heutige Belege, Testgrenzen und Leistungsbedingungen: [PRUEFUNG-2026-10-13.md](PRUEFUNG-2026-10-13.md). Issue #2 ist nicht vollständig umgesetzt; technische Prüfung ist keine menschliche Gestaltungs- oder Klangabnahme.

## Einrichten, starten, prüfen

Vor Schreibarbeiten Volume und Ziel prüfen. Registrierung: `/Volumes/ThunderBolt4_2TB/Development/Storage-Control`; erwartete UUID `A03B10FD-5F22-4366-A71C-2D95AC701BD2`. Kein stiller interner Ersatz. Auf dem iMac dessen tatsächlich vorhandene Speicherpfade verwenden.

```sh
/Users/ralfkirchner/.config/external-development/bin/extern-dev check /Volumes/ThunderBolt4_2TB/Development/Projects/phaenomenautik-3-mac-mini
cd /Volumes/ThunderBolt4_2TB/Development/Projects/phaenomenautik-3-mac-mini
npm ci --cache /Volumes/ThunderBolt4_2TB/Development/Caches/npm
npm run dev -- --host 127.0.0.1 --port 4179 --strictPort
```

Benötigt: Node >=22.12.0, vorhandene Manifeste und `package-lock.json`. Keine Geheimnisse oder zusätzlichen Backend-Zugangsdaten für das Spiel. Abhängigkeiten, Testbundles und `dist/` bleiben im externen Worktree; npm-Cache bleibt extern. Spiel: `http://127.0.0.1:4179/`.

```sh
npm run build
npm run test:world
npm run test:current
TMPDIR=/Volumes/ThunderBolt4_2TB/Development/Caches/phaenomenautik-qa npm run test:server
```

`test:world` führt `test:current` zusätzlich als Nachlauf aus; der Einzelaufruf ist für gezielte Prüfung. 60 FPS bleiben ein Messziel: die heutige benannte Desktopmessung lag bei 58,79 FPS im Mittel, nicht bei nachgewiesenen 60 FPS.

## Spielstand und Atlas

Speicherung: Browser-`localStorage`, Schlüssel `phaenomenautik3-save-v1`. Unter „Spielstand mitnehmen“ Reise als JSON exportieren und auf dem anderen Rechner ausdrücklich importieren. Der Checkpoint vor einem Import benutzt denselben Speicherkey und ist **kein separates Backup**. Vor einem Austausch deshalb eine Datei exportieren. Ungültige Daten und inzwischen geänderte Browserquellen blockieren das Ersetzen. Unterschiedliche Browser und Origins, auch andere Ports, besitzen getrennte Spielstände; Git überträgt sie nicht.

Der tatsächlich geprüfte Atlasvertrag betrifft nur Flimmerbucht: `http://127.0.0.1:4322/ganzsein?ganz=understand&encounter=flimmerbucht-r1`, Rückkehr `http://127.0.0.1:4179/?encounter=flimmerbucht-r1`. Quellengeprüfte Hin-/Rückverknüpfung, keine allgemeine Synchronisation der vier Orte oder Weltzustände. Der separate Atlasbestand gehört nicht zu diesem Repository-Push. Kein belegter nativer Neuroatlas-Empfängervertrag und keine Unreal-Integration. Details: [ATLAS-ANSCHLUSS.md](ATLAS-ANSCHLUSS.md) und [Unreal-Verbindungsprompt](UNREAL-VERBINDUNGSPROMPT-2026-10-11.md). Die menschliche Originalfundstelle zu „Teil 4“ fehlt weiterhin; nicht mit M4 gleichsetzen.

## Nächste Schritte und Rechnerwechsel

1. Geprüfte zusammengehörige Änderungen gezielt committen und pushen; bestätigten Remote-Stand oben ersetzen und PR auf den gemeinsamen Arbeitsbranch anlegen.
2. Längeres freies Segeln mit Wetterwechseln und Begegnungsfolgen prüfen; Leistung unter benannten, vergleichbaren Bedingungen weiter messen. Resonanzraum und freiwilligen Kompass im bestehenden System weiterentwickeln.
3. Gestaltungsfreude, Sammeln und Segeln ohne Reflexionspflicht erhalten. Physisches Hören sowie menschliche Spiel-, Form- und Klangabnahme bleiben offen.

Auf jedem Mac zuerst `git status`, Branch, Remote und lokale Änderungen prüfen, danach den gepushten Stand übernehmen. Bei gleichzeitiger Arbeit getrennte Branches und Pull Requests. Kein blindes Pull, automatisches Stash, Reset, pauschales `git add -A`, Force-Push oder Umschreiben gemeinsamer Historie. Vor Übergabe `git log -1 --oneline` und `git ls-remote origin refs/heads/codex/world-continuation-mac-mini-20261013` abgleichen.

Historie und frühere Abnahmen bleiben in [Prüfung 10.10.](PRUEFUNG-2026-10-10.md), [Prüfung 11.10.](PRUEFUNG-2026-10-11.md) sowie [Neuroatlas-Recherche](NEUROATLAS-RECHERCHE-2026-10-11.md). Hier wird das bestehende Segelspiel fortgeführt, keine parallele Forschungsbuch-App.
