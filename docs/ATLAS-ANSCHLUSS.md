# Tatsächlicher Atlasanschluss

Stand: 11. Oktober 2026. Die bestehende Brücke verbindet die Flimmerbucht mit dem vorhandenen persönlichen GANZ-SEiN-Bereich. Sie ist ein Navigationsanschluss, keine Synchronisation der Spielwelt.

- Spiel: `http://127.0.0.1:4179/`
- Atlas: `http://127.0.0.1:4322/ganzsein?ganz=understand&encounter=flimmerbucht-r1`
- Geprüfter Rückweg: `http://127.0.0.1:4179/?encounter=flimmerbucht-r1`

Der frühere feste Rückweg auf Port 4178 war für den aktuellen Arbeitsstand falsch. Am 11.10. wurde ausschließlich diese Adresse in der vorhandenen Atlasquelle `EncounterAtlasBridge.jsx` und im tatsächlich ausgelieferten Bundle `Development/Artifacts/moonfingers-kimi-20261010/dist-live/assets/Ganzsein-71vut9Tt.js` auf 4179 berichtigt. Der Atlasbestand enthält zahlreiche fremde Änderungen; es wurde kein pauschaler Build oder Commit dieses Bestands ausgeführt. Originaldateien und Vorher-/Nachher-Hashes liegen extern unter `Development/Artifacts/phaenomenautik-atlas-return-20261011/manifest.json`. Die Korrektur ist lokal wirksam; diese Dateien gehören nicht zum Phänomenautik-Repository.

Browserprüfung: vorhandenen JSON-Spielstand ausdrücklich importiert, Flimmerbucht gewählt, „Atlas öffnen“ genutzt und im tatsächlichen GANZ-SEiN-Bereich „Ohne Speichern zurückkehren“ angeklickt. Beide dort geprüften Rücklinks zeigen auf 4179. Nach Rückkehr waren Flimmerbucht, eine historische Journalbeobachtung mit früherer Deutung, Maras Gesprächsfolge, Materialmengen und Stegreparatur erhalten. Es wurde kein neuer persönlicher Atlas-Eintrag angelegt und keine Freigabe verändert.

Der Spielstand wird vor dem Öffnen gesichert; danach pausiert die Welt. Der Atlasanschluss bleibt freiwillig und ist in der freien Welt nur bei der Flimmerbucht angeboten. Werkhafen und Stiller Strand haben derzeit keinen geprüften Atlasanschluss. Der Rücksprung lädt den aktuellen lokalen Spielstand. Enthält er bereits die offene Welt, setzt die Anwendung diese Reise an ihrer gespeicherten Position fort. Ein älterer Spielstand ohne offene Welt öffnet weiterhin den vorhandenen ruhigen Steg. Die URL enthält keinen historischen Weltzustand und überschreibt keine späteren Veränderungen.

Die tatsächliche Atlasquelle liegt hier:
`/Volumes/ThunderBolt4_2TB/MeineApps/dein-sein-astra/astra-neubau/src/ganzsein/EncounterAtlasBridge.jsx`.
Die vorhandene Oberfläche liest `/api/ganzsein/atlas?limit=20&q=Dissoziatives%20Erleben`. Eine eigene Notiz wird nur durch den vorhandenen `act`-Vertrag mit `concern.create` beziehungsweise `concern.update` gespeichert. Ein bewusst ausgewählter Quellenbezug verwendet `grant.set` für `atlas-personal` und `atlas.link`; die genaue Quellenfassung bleibt erhalten. Wiederholtes Speichern aktualisiert den gefundenen Eintrag. Eine Beziehung zur gleichen Quellenfassung wird nicht erneut erzeugt.

Dieser bestehende Atlasvertrag kennt ausschließlich `flimmerbucht-r1`. Das Spiel erfindet keinen allgemeinen Raum-, Notiz- oder Rückkehrvertrag. Die neuen Weltbeobachtungen und ihre Revisionen bleiben im Spielstand. Automatische Übertragung, Auswahl historischer Weltzustände und weitere Phänomenräume sind noch nicht umgesetzt.

GitHub überträgt Anwendungscode und Dokumentation, keinen Browser-Spielstand. Unter „Spielstand mitnehmen“ bietet die Ortsleiste einen ausdrücklichen JSON-Export und Dateiimport. Der Export enthält die Spielwelt mit ihren eigenen Notizen und technischen Identitäten; persönliche Atlasnotizen verbleiben im vorhandenen GANZ-SEiN-Speicher. Beim Import werden die Datei und der aktuelle Browserstand geprüft; erst „Ausgewählten Spielstand hier laden“ ersetzt den Spielstand auf diesem Mac. Ein Speicher- oder Konfliktfehler stoppt den Import. Wer den früheren Stand behalten möchte, exportiert ihn vorher.
