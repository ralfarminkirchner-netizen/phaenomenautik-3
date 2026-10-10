# Aktuelle Gestaltung — 10. Oktober 2026

Einstieg und Flimmerbucht verwenden jetzt die laufende dreidimensionale Spielwelt. Die zuvor erzeugte statische Abendbucht wurde als Gestaltung zurückgewiesen und wird hier nicht mehr angezeigt. Die alten Bilddateien und ihre Herkunft bleiben als historischer Nachweis erhalten.

## Tatsächliche Browseransichten

- [Begegnung mit gesetzter 3D-Boje, 1280 × 800](evidence/dynamic-encounter-desktop.jpg).
- [Blick vom Ufer, 390 × 844](evidence/dynamic-encounter-mobile.jpg).
- [Einstieg in derselben laufenden Welt, 1280 × 800](evidence/dynamic-title-desktop.jpg).

Die Ansichten stammen aus dem laufenden lokalen Browser. Der kleine Handlungsteil sitzt am unteren Rand; Wasser, Küste und Schiff bleiben der Raum der Begegnung. „Zum Stegende“, „Boje setzen“ und „Zum Ufer“ ändern Kamera oder Spielobjekt unmittelbar. Pause, Verlassen, Hilfe und Ton bleiben erreichbar. Bei 390 × 844 waren alle neun sichtbaren Schaltflächen mindestens 44 Pixel hoch und innerhalb des Bildschirms.

Geprüft wurden Blickwechsel, die sichtbare Boje, Pause, Hilfe, bewusste Fortsetzung und Neuladen. In der Pause blieb der visuelle Framezähler über zwei getrennte Beobachtungen unverändert. Nach Neuladen öffnete „Ankommen“ wieder den zuletzt gewählten Blick vom Ufer. Der Atlasanschluss und sein Rückweg wurden am 10. Oktober erneut geöffnet; der gewählte Begegnungsstand blieb erhalten.

Ein zusätzlicher Browserlauf prüfte zwei gleichzeitig geöffnete Spielansichten: Beide luden die gesetzte Boje. Die erste speicherte den Blick vom Ufer; die ältere zweite versuchte danach, den Blick vom Steg zu speichern. Sie zeigte die [verständliche Konfliktmeldung](evidence/stale-tab-save-protection.jpg). Auch nach dem Schließen der älteren Ansicht und dem Neuladen der ersten blieb der Blick vom Ufer gespeichert. Die Originalbytes werden vor dem Schreiben verglichen; dieser Schutz ist keine atomare Transaktion zwischen Tabs.

## Bestand, Bildrate und Grenzen

Der jüngste Kimi-Quellstand `a54593eff6495ea06c89022834e6c55390c09717` und die laufende Railway-Fassung wurden tatsächlich angesehen. [Quellvergleich und Herkunft](evidence/kimi-source/a54593e-2026-10-10/README.md) halten den Vergleich mit dem lokalen Ausgangsstand fest. Die bestehende Wasser-, Schiffs-, Licht- und Shader-Implementierung wird weiterverwendet. Ausgewählte spätere Szenenkorrekturen sind übernommen; spätere Spielfeatures sind nicht Bestandteil dieser Änderung.

Die eingeblendeten beziehungsweise am Canvas ablesbaren Bildraten schwankten im Browserlauf ungefähr zwischen 29 und 69 FPS. Das ist kein kontrollierter Leistungsbenchmark und belegt keine konstanten 60 FPS. Physikalische Korrektheit wird durch die Sichtprüfung ebenfalls nicht nachgewiesen.

TypeScript und Produktionsbuild bestanden. Die bestehende Warnung über das große Bundle bleibt. Der gezielte Lintlauf und die Schutz-/Laufzeitaudits sind im [Lieferbericht](lieferung.md) und [Sicherheitsnachweis](safety-evidence.md) dokumentiert. Die Audits ersetzen keine reale WebGL- oder persönliche Geräteprüfung.

Menschliche Gestaltungsabnahme, persönliche Geräteprüfung und fachliche Textprüfung bleiben offen. Die Änderungen sind lokal; es wurde nichts veröffentlicht.
