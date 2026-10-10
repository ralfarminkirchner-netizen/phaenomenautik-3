# Phänomenautik 3: Speicher, Verbindungen und Zweck

Stand: 9. Oktober 2026. Arbeitsfassung für die lokale Begegnung „Flimmerbucht – am ruhigen Steg“. Fachliche Prüfung, Rückmeldungen von Menschen mit eigener Erfahrung und rechtliche Qualifikation sind offen. Diese Notiz ist keine Freigabe.

## Tatsächlich untersuchter Datenweg

Der Spielcode enthält derzeit keine Analyse-, Werbe-, Telemetrie-, externen Modell- oder Kontoverbindung. Dialogantworten werden aus lokalen Regeln und Texten gebildet. HTML und CSS laden keine externen Schriftarten. Dies ist ein Quellcodebefund, kein Nachweis unsichtbarer Nutzung oder ein Audit der Hostinganbieter.

| Vorgang | Daten und Ziel | Grenze |
| --- | --- | --- |
| Spiel öffnen | HTML, JavaScript, CSS und lokale Medien vom jeweiligen Spielserver | Server, Netzwerk und Hostinganbieter können den Aufruf sehen. |
| Spielstand speichern | Spielfortschritt und Optionen als JSON in `localStorage` desselben Browserprofils; zusätzlich eine Ernährungsoption | Nicht verschlüsselt; für Personen oder Software mit Zugriff auf das Browserprofil zugänglich. Browserdatenlöschen entfernt den Stand. Kein Kontoabgleich. |
| Atlas bewusst öffnen | Feste lokale GANZ-SEiN-Adresse; im Link nur die bekannte fiktive Begegnung und der Bereich „Verstehen“ | Kein persönlicher Text im Link. Dies ist eine Verbindung zu einem bereits vorhandenen lokalen Dienst. |
| Eigene Beobachtung im Atlas speichern | Explizite Eingabe über bestehende `concern.create/update`-Befehle in den verschlüsselten GANZ-SEiN-Bestand auf diesem Mac | Kein neuer Spiel-, Cloud- oder Modell-Speicher. Gleiche Begegnungsfassung öffnet und aktualisiert denselben Eintrag. |
| Atlas-Kontext zusätzlich verknüpfen | Nur nach eigener Checkboxwahl: bestehende Zustimmung und `atlas.link`, mit genauer vorhandener Quellenfassung im privaten Relationseintrag | Fiktion, Quellenkontakt und persönliche Aussage bleiben getrennt. Kein öffentlicher Atlasdatensatz oder Schluss auf den Menschen entsteht. |
| Externe Quelle oder Hilfekontakt öffnen | Eigener Browseraufruf des ausgewählten Anbieters bzw. Telefon-/Nachrichtendienstes | Dessen Datenschutz und Protokollierung gelten; die App sendet dabei keine persönliche Beobachtung mit. |

Nachweise: `src/game/state.ts` (`loadSave`, `persistSave`, `clearSave`, Ernährungsoption), `src/game/dialogAI.ts`, `index.html`, `src/index.css`, `vite.config.ts`, `server.mjs`, `railway.json` sowie im bestehenden Atlas `src/ganzsein/EncounterAtlasBridge.jsx`, `server/ganzsein.mjs` und `server/ganzsein-store.mjs`.

Der Spiel-Produktionsserver liefert Dateien und einen SPA-Fallback, bindet an `0.0.0.0` und enthält im untersuchten Code keine Anfrageprotokollierung. `railway.json` beschreibt einen möglichen Railway-Betrieb. Es wurden keine reale Veröffentlichung, Anbieterlogs, Aufbewahrungsfristen, Proxykonfiguration oder vertraglichen Datenschutzbedingungen geprüft. Deshalb ist „Nutzung bleibt unsichtbar“ unzutreffend. Der bestehende GANZ-SEiN-Dienst auf dem Mac bindet an Loopback und prüft Host und Origin; die Brücke bleibt in seiner eigenen Oberfläche, statt diese Schutzgrenzen aufzuweiten.

Der vorhandene Kimi-Inspector setzt laut installiertem Paketcode `code-path`-Attribute in JSX. Diese geben relative Quelldateipfade preis, senden aber selbst keine Daten. Die aktuelle `vite.config.ts` aktiviert den Inspector ausdrücklich nur bei `command === 'serve'`, also für den Entwicklungsserver. Ein öffentlicher Build braucht zusätzlich die Prüfung seines tatsächlichen Artefakts auf solche Attribute; die Paketdokumentation allein reicht als Nachweis nicht aus.

Der lokale Rückweg führt fest zu `http://127.0.0.1:4178/`. Spielstände gehören zum jeweiligen Browser-Origin: `localhost:4178`, `127.0.0.1:4178` und eine veröffentlichte Adresse haben getrennte Speicher. Der geprüfte Rundweg muss daher am genannten Loopback-Origin beginnen. Eine spätere Veröffentlichung braucht eine ausdrücklich festgelegte Rückroute; der jetzige Link ist keine automatische Migration oder Verbindung zwischen Browserständen.

Geeigneter kurzer Oberflächentext: „Der Spielstand bleibt unverschlüsselt in diesem Browser. Eine eigene Beobachtung kannst du freiwillig im vorhandenen geschützten GANZ-SEiN-Bereich auf diesem Mac speichern. Beim Öffnen einer Website oder Quelle können deren Anbieter den Aufruf protokollieren.“

## Beabsichtigter Zweck und medizinische Grenze

Beabsichtigt ist ein freiwilliger Zugang zu fiktiven Spielbegegnungen, allgemeiner Information und selbst formulierter Reflexion. Die milde Musterbegegnung enthält keine Zeitvorgabe. Pause, Rückzug, Hilfe und bewusste Wiederaufnahme unterstützen die Kontrolle der spielenden Person. Sie liefern keine medizinische Wirkung oder Bewertung. Das Spiel und die Brücke stellen keine Diagnose, leiten keinen psychischen Zustand ab, messen keine Symptome und geben keine individuelle Behandlungsentscheidung oder Wirksamkeitszusage ab. Quellengebundene Atlasvorschläge sind keine bestätigten Definitionen; persönliche Resonanz bestätigt weder eine Diagnose noch die Quellenzuordnung.

Diese Zweckgrenze muss in Funktionen, Hilfetexten, Veröffentlichungsbeschreibung und weiteren Aussagen übereinstimmen. Historische Bezeichnungen und weitere bestehende Spielbereiche brauchen dieselbe Prüfung; die milde Begegnung erlaubt keine Aussage über deren Sicherheit oder fachliche Angemessenheit.

Die aktuelle [MDCG 2019-11 Rev.1, Juni 2025](https://health.ec.europa.eu/document/download/b45335c5-1679-4c71-a91c-fc7a4d37f12b_en?filename=md_mdcg_2019_11_guidance_qualification_classification_software_en.pdf) unterscheidet Qualifikation und anschließende Klassifikation anhand des vorgesehenen Zwecks; Standort oder Plattform entscheiden dies nicht. Zu diesem Zweck gehören auch Herstellerangaben, Gebrauchsinformation und Werbeaussagen. Medizinische Funktionen oder entsprechende Versprechen erfordern eine erneute Prüfung. Ein Disclaimer „keine Therapie“ löst widersprüchliche Funktionen nicht auf. Die Leitlinie ist nicht rechtsverbindlich und erteilt keine Produktzulassung (Titelblatt, Abschnitte 2 und 3).

Offen vor einer fachlichen oder öffentlichen Annahme: benannter Produktverantwortlicher und verlässlicher Kontakt, Prüfung der gesamten Funktions- und Aussageoberfläche, fachliche Durchsicht der Begegnung/Quellenzuordnung, Rückmeldungen von Menschen mit eigener Erfahrung, reale Hosting- und Netzprüfung sowie gegebenenfalls rechtliche Bewertung. Ein technischer Build oder erfolgreicher Speichertest ersetzt diese Entscheidungen nicht.
