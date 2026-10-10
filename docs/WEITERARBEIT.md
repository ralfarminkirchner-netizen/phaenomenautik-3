# Gemeinsame Weiterarbeit

Stand: 10. Oktober 2026. Auftrag: [Issue #2](https://github.com/ralfarminkirchner-netizen/phaenomenautik-3/issues/2). Dies ist der gemeinsame Arbeitskontext beim Wechsel zwischen Mac Mini und iMac; GitHub überträgt weder Kimi-Chatverlauf noch lokale Browser-Spielstände.

## Arbeitsstand und Schutz des Bestands

Die ursprüngliche Arbeitskopie `/Volumes/ThunderBolt4_2TB/Development/Projects/phaenomenautik-3` enthält zahlreiche lokale Änderungen und bleibt erhalten. Der geprüfte Szenen-, Text- und Schutzstand wurde als Ausgangspunkt gesichert; der bestehende Produktions-Build-Fix wurde zusammengeführt. Die Fortsetzung liegt im isolierten Worktree `/Volumes/ThunderBolt4_2TB/Development/Projects/phaenomenautik-3-mac-mini`, Branch `codex/open-world-mac-mini-20261010`. Remote: `https://github.com/ralfarminkirchner-netizen/phaenomenautik-3.git`.

Der erste zusammenhängende Ausbau enthält Flimmerbucht, Werkhafen und Stillen Strand. Alle sind ohne Freischaltung erreichbar; die Segelhilfe ist optional. Gemeinsame Zeit, Wetter, Wind, Wasserfelder, Licht und Klang beeinflussen Boot und Begegnungen. Buchtversuche, getrennte Zeugenaussagen, gezielte Mitteilungen und begrenzte Materialien im Hafen sowie aktuelle Einladungen am Strand haben konkrete Zustandsfolgen. Beobachtungsnotizen trennen festgehaltene Tatsachen von eigener Deutung und bewahren frühere Formulierungen bei Revisionen. Freies Segeln ist der Haupteinstieg; ruhiges Ankommen und Reflexion bleiben freiwillig. Issue #2 ist damit noch nicht vollständig umgesetzt.

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

## Spielstand und Atlas

Der Spielstand liegt im Browser in `localStorage` unter `phaenomenautik3-save-v1`. Unter „Spielstand mitnehmen“ lässt sich die aktuelle Reise als JSON exportieren und eine ausgewählte Datei ausdrücklich laden. Vor dem Ersetzen wird der aktuelle Stand gesichert; ungültige Daten oder eine inzwischen geänderte Browserquelle blockieren das Ersetzen. Für einen Rechnerwechsel vorher exportieren und auf dem anderen Rechner importieren. Unterschiedliche Browser und Origins, insbesondere Port 4178 und 4179, haben getrennte Speicher. Git-Commits enthalten diese Spielstände nicht.

Der tatsächliche Atlas-Anschluss unterstützt bisher nur Flimmerbucht. Atlas-URL: `http://127.0.0.1:4322/ganzsein?ganz=understand&encounter=flimmerbucht-r1`. Seine vorhandene Rückkehradresse ist fest auf `http://127.0.0.1:4178/?encounter=flimmerbucht-r1` gesetzt. Dieser Worktree läuft auf 4179; ein vollständiger Hin- und Rückweg zum aktuellen Worktree ist deshalb noch nicht belegt. Kein automatischer Austausch von Weltzuständen, Hafen-/Strandnotizen oder Atlas-Anliegen. Siehe [ATLAS-ANSCHLUSS.md](ATLAS-ANSCHLUSS.md).

## Nächste konkrete Schritte

1. Bildrate und räumliche Lesbarkeit verbessern und längeres freies Segeln bei wechselndem Wetter prüfen. Die erste Browserprüfung ist im Prüfprotokoll festgehalten; sie ist keine menschliche Gestaltungs- oder Klangabnahme.
2. Den wirklichen Atlas-Rückweg mit dem Atlas-Projekt koordinieren, ohne eine allgemeine Schnittstelle vorzutäuschen.
3. Strömungs- und Resonanzbereich gemäß Issue #2 an denselben Weltzustand anschließen, anschließend weitere situationsabhängige Begegnungen und nachvollziehbare Zusammenhänge ausbauen.

Bei jedem Rechnerwechsel diese Datei aktualisieren. Zuerst `git status`, Branch, Remote und lokale Änderungen prüfen. Zusammengehörige eigene Änderungen gezielt committen und pushen; auf dem anderen Mac erst nach Bestandsprüfung übernehmen. Bei gleichzeitiger Arbeit getrennte Branches und Pull Requests verwenden. Kein blindes Pull, automatisches Stash, Reset, pauschales `git add -A`, Force-Push oder Umschreiben gemeinsamer Historie.

Zuletzt tatsächlich gepushter Stand dieses Ausbaus: **noch offen; wird nach erfolgreichem Push mit Branch, Commit und gegebenenfalls Pull Request ergänzt.**
