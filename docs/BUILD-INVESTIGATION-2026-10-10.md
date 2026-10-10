# PHÄNOMENAUTIK 3: Build- und Serving-Prüfung

Stand: 10. Oktober 2026. Ausgangspunkt ist `main` bei
`a54593eff6495ea06c89022834e6c55390c09717`. Änderungen dieses PR wurden nicht
in Produktion bereitgestellt.

## Ergebnis und Nachweisgrenzen

- Der aktuelle Quellstand baut unter Node 24.19.0. Unter der im Manifest
  ausdrücklich erlaubten Mindestversion **22.12.0** scheitert derselbe Stand
  jedoch an der Tailwind-Konfiguration. Dieser PR korrigiert die nachgewiesene
  Ursache; der vollständige Build läuft anschließend auch unter 22.12.0.
- Frühere Syntax- und TypeScript-Fehler vom 9. Oktober sind bereits durch
  `82f6124` und `f16a827` korrigiert. Sie werden nicht erneut repariert.
- Eine öffentliche Produktionsdomain hat einen erfolgreichen Railway-
  Commitstatus und antwortet mit HTTP 200. Dessen Service-ID unterscheidet
  sich von beiden Service-IDs aus den Fehlmails. Das beweist weder einen
  heutigen Ausfall noch eine Reparatur der beiden damaligen Dienste.
- Die acht Fehlbenachrichtigungen bestätigen fehlgeschlagene Deployments,
  enthalten aber keine Buildfehler. Ohne die zugriffsgeschützten Buildlogs
  ist keine vollständige Ursachenfeststellung für jeden Lauf möglich.
- Die drei `-live`-Fehlereignisse lassen sich über öffentliche GitHub-
  Commitstatuses exakt den Commits `2acdec9`, `6323180` und `82f6124`
  zuordnen. Für denselben Live-Service meldet `f16a827` später am 9.10.
  um 12:26:59 MESZ `success`. Das ist ein historischer Deployment-Nachweis,
  keine Prüfung seiner heutigen Erreichbarkeit.
- Ein separat reproduzierter Serving-Fehler und ein unzuverlässiger
  Smoke-Test werden korrigiert. Beide sind **keine nachgewiesenen Ursachen
  der acht fehlgeschlagenen Builds**.

## Reproduzierte aktuelle Buildursache

`package.json` setzt `"type": "module"` und erlaubt Node `>=22.12.0`.
`tailwind.config.js` verwendet im Ausgangsstand dennoch `module.exports`
und `require("tailwindcss-animate")`.

Saubere Lockfile-Installation mit Node **22.12.0** und npm **10.9.9**:

```sh
npm ci --no-audit --no-fund
npm run build
```

Die Installation gelingt. TypeScript passiert das Gate, der Vite-/PostCSS-
Schritt bricht beim Laden von `tailwind.config.js` ab:

```text
ReferenceError: module is not defined
    at .../tailwind.config.js:2:1
```

Der Fix verwendet `import animate from "tailwindcss-animate"` und
`export default`. Theme, Contentregeln, Darkmode und Plugin bleiben gleich.
Die offiziellen [Tailwind-v3-Konfigurationshinweise](https://v3.tailwindcss.com/docs/configuration)
beschreiben die ESM-Konfiguration.

Eine unabhängige Verarbeitung von `src/index.css` mit alter und neuer
Konfiguration liefert identisches CSS. Auch die kompletten Vite-Ausgaben
behalten dieselben Bundle-Namen und Bytes:

| Ausgabe | SHA-256 |
| --- | --- |
| `assets/index-xwwq0sHi.js` | `3203657101389b5c5571c03a3f95482e3bc4e15f3dd70b0d5ae48b76516700e1` |
| `assets/index-DWXmqNAN.css` | `4f0edef05247262426eca247a334206ac869b45c5dae9a7d335f53cd7dca061d` |

Es wurde keine Node-Version eines Railway-Laufs aus dem Mailzeitpunkt
abgeleitet. Die lokale Reproduktion beweist einen Fehler des erlaubten
Buildbereichs; erst Logs können ihn einem bestimmten Deployment zuordnen.

## Historische Quellenfehler und schon vorhandene Reparaturen

Alle Zeiten in dieser Tabelle: Europe/Berlin, MESZ.

| Commit | Datum/Uhrzeit | Nachgewiesener Quellenstand |
| --- | --- | --- |
| `dee8c7a` | 08.10. 23:06 | Frühere Reparatur von Flags/Imports; kein Nachweis für spätere Builds. |
| `2acdec9` | 09.10. 07:57 | Neue ungültige String-Literale in `src/game/duels.ts`; `tsc -b` scheitert u.a. mit TS1127/TS1002. |
| `6323180` | 09.10. 11:31 | Wechsel NIXPACKS → RAILPACK, `npm ci` → `npm install`, Node-Engine ergänzt. EBUSY bislang nur in Commitbeschreibung, nicht aus zugänglichen Logs bewiesen. |
| `82f6124` | 09.10. 12:19 | Strings korrigiert; drei TypeScript-Fehler bleiben. |
| `f16a827` | 09.10. 12:24 | TS2367 in `structures.ts`, TS6133/TS2367 in `DuelOverlay.ts` korrigiert; historisches TypeScript-Gate grün. |
| `db5ca16` | 09.10. 18:53 | Lockdatei erneuert; Manifest-Spezifikationen einschließlich Root-Engine konsistent. |

Die historischen TypeScript-Reproduktionen nutzten temporäre
Quellsnapshots und TypeScript 5.9.3, wie im damaligen Lockfile. Andere
Dependencies stammen aus der aktuellen Installation. Das belegt die
Quellenfehler, keine vollständige Reproduktion alter Railway-Container.

## Installation, Runtime und Ressourcen

Die eingecheckte `railway.json` verwendet RAILPACK, den Buildbefehl
`npm install --no-audit --no-fund && npm run build` und den Startbefehl
`node server.mjs`. Diese Railway-Konfiguration bleibt unverändert.

Railpack kann Laufzeit- und Buildvorgaben über Servicevariablen erhalten.
Insbesondere hat `RAILPACK_NODE_VERSION` Vorrang vor `engines.node`;
siehe [Railpack Node.js](https://railpack.com/languages/node/).
Die Repo-Konfiguration allein beweist deshalb keine identischen
Buildbedingungen der beiden Dienste.

Der unveränderte Produktionsbefehl wurde lokal unter Node 24.19.0/npm 11.9.0
ausgeführt. Die Installation gelingt und TypeScript/Vite bauen in insgesamt
rund 7,8 Sekunden. Gemessener maximaler RSS eines Kindprozesses
(`getrusage(RUSAGE_CHILDREN).ru_maxrss`): 688.512 KiB (ca. 672 MiB),
kein aufsummierter gleichzeitiger Speicherbedarf. Das ist eine Messung
dieser Linux-x64-Umgebung, kein Beleg für
ein Railway-Speicherlimit oder einen OOM-Abbruch.

Die zusätzliche saubere `npm ci`-Installation prüft die eingecheckte
Lockdatei außerhalb von Railpack-Cache-Mounts. Sie soll den bereits
eingeführten Railway-Installweg nicht rückgängig machen.

Unter Node 22.12.0 warnt eine transitive ESLint-Dependency
(`eslint-visitor-keys@5.0.1`) über ihre Engine-Anforderung ab 22.13.0.
Die Installation ohne `engine-strict` und der Produktionsbuild gelingen
nach dem Tailwind-Fix. Eine abweichende Railway-Engine-Strict-Vorgabe ist
ohne Zugriff auf die tatsächlichen Buildbedingungen offen. Die
Vite-Warnung über ein großes JS-Bundle ist ebenfalls kein Buildabbruch.

## Produktionsstart und HTTP-Regression

`server.mjs` liefert `dist/` relativ zur eigenen Datei aus, bindet
`0.0.0.0` und verwendet `PORT`. Der Test startet den echten Entry-Point
aus einem anderen Arbeitsverzeichnis auf einem dynamischen Port.

Vor dem Fix führt die HTTP-Anfrage `/%` zu `URIError: URI malformed`,
Prozess-Exit 1 und anschließend `ECONNREFUSED`. Der neue Decoder-Guard
liefert HTTP 400; weitere normale Anfragen bleiben erfolgreich.

`node --test qa/server.test.mjs` prüft:

- Einstieg und SPA-Fallback einschließlich Querystring;
- JavaScript, CSS, GLB, GLTF, BIN, PNG und einen Dateinamen mit Leerzeichen:
  Antwortbytes und MIME-Typen;
- drei ungültige Percent-Codierungen und normale Antworten unmittelbar danach.

## Regression und Erhalt des Spiels

| Umgebung / Prüfung | Ergebnis |
| --- | --- |
| Node 22.12.0 / npm 10.9.9: Clean Install, TypeScript + Vite nach Fix | Erfolgreich |
| Node 22.23.3: TypeScript + Vite nach Fix | Erfolgreich |
| Node 24.19.0: TypeScript + Vite nach Fix | Erfolgreich |
| HTTP-Servertests auf allen drei Node-Versionen | Jeweils 3/3 erfolgreich |
| Bestehende `qa/graph.cjs` auf allen drei Node-Versionen | Jeweils 18/18 erfolgreich |
| Smoke-Test-Exitcodes mit Browser-Stubs | 7/7: Erfolg, fehlender Titel/Spielstart, Console-/Pagefehler, Navigation-/Launchfehler korrekt ausgewertet |
| Alle Dateien unter `public/` gegen `dist/` | 93 Dateien, 44.242.040 Bytes, bytegleich |
| Modellpfade in `src/three/assets.ts` und externe GLTF-Referenzen | Alle referenzierten Dateien vorhanden |

Die Stub-Prüfung ist keine echte Browser- oder Produktionsfunktionsprüfung.
Im lokalen Runtime fehlt ein Chromium-Binary; dessen Download liefert eine
unbrauchbare Datei. Eine lokale Browser-E2E-Prüfung ist deshalb hier nicht
nachgewiesen. Die Spielquellen und visuellen Assets wurden nicht geändert.

Der GitHub-Workflow prüft PRs und `main` unter exakt 22.12.0 sowie aktuellen
Node-22-/24-Versionen. Er installiert aus dem Lockfile, baut, prüft den
Graphen und den Produktionsserver. Er enthält keine Deployment-Aktion.

Der erste [GitHub-CI-Lauf](https://github.com/ralfarminkirchner-netizen/phaenomenautik-3/actions/runs/38041843115)
für den Korrekturcommit `b4527c9` ist in allen drei Matrix-Jobs erfolgreich:
Clean Install, Produktionsbuild, Graph-QA und HTTP-Servertests jeweils grün.

Der reparierte `qa/smoke-railway.cjs` akzeptiert `QA_URL` zur Auswahl eines
bereits bereitgestellten Diensts. Fehlender Titel, fehlendes `window.__game`,
Browserfehler und Ausnahmen führen nun zu Exitcode 1. Das beseitigt den
vorherigen pauschalen `process.exit(0)`.

## Tatsächlich überprüfte Produktion

Für `a54593e` meldet der [GitHub-Commitstatus](https://api.github.com/repos/ralfarminkirchner-netizen/phaenomenautik-3/commits/a54593eff6495ea06c89022834e6c55390c09717/status)
den Railway-Kontext `phaenomenautik-3 - phaenomenautik-3` als `success`,
erstellt am 10.10.2026 um 00:47:50 MESZ. Der verlinkte Deployment-Identifikator
ist `7fe2f140-eee9-4482-b2e3-4a741db8d962`.

**Dieser Status betrifft Service-ID
`14f74467-6cb8-4583-9505-8331fe579cac`. Die Fehlmails nennen andere
Service-IDs: `3522770b-3f7b-43bc-a81e-95c9ef15461f` für
`phaenomenautik-3` und `56703f80-195f-46e7-a64b-7a1437e1b373` für
`phaenomenautik-3-live`.** Der ähnliche Name darf diesen Unterschied nicht
verdecken. Ob ein Dienst ersetzt, gelöscht oder anders verbunden wurde,
ist ohne Dashboard nicht festgestellt.

Am 10.10.2026 gegen 11:24 MESZ antwortet
<https://phaenomenautik-3-production.up.railway.app/> mit HTTP 200.
JS, CSS, Schiff-GLB, Baum-GLTF/-BIN und Charakter-PNG werden mit HTTP 200
und passenden MIME-Typen ausgeliefert. Ihre Bytes stimmen mit dem lokalen
Build des Ausgangscommits überein. Das bestätigt die Auslieferung dieses
Stands, keinen vollständigen Spieldurchlauf und keine Bereitstellung dieses PR.

Eine separate Prüfung derselben öffentlichen URL im Cloud-Browser erreicht
den Titelscreen, `Neue Reise` und die vollständige klickbare Einführung.
Danach bleibt die sichtbare Seite bei „Die See wird bereitet …“. Es wird
keine Fehlerseite angezeigt, aber eine 3D-Welt konnte in diesem Test nicht
bestätigt werden. Segeln, Interaktionen, Journal und weitere Spielabläufe
sind damit nicht verifiziert. Die Ursache des Ladezustands ist ohne
weitere Browser-/WebGL-Diagnostik offen; er darf weder als erfolgreicher
Spielstart noch als bewiesene Buildursache dargestellt werden.

## Noch benötigte Railway-Evidenz

Alle acht Fehlbenachrichtigungen wurden gelesen. Sie betreffen das Projekt
`df4c04b3-0727-40f5-88a9-ecec24921d66` und das Production-Environment
`3143e3e3-46c2-491a-b43e-0ba062cd008a`. Zeiten sind Mailzeitpunkte in MESZ,
keine bewiesenen Build-Startzeitpunkte.

| 09.10.2026 MESZ | Dienst | Fehlgeschlagenes Deployment | Git-Commit laut GitHub-Status |
| --- | --- | --- | --- |
| 08:27:50 | `phaenomenautik-3` | `c1ee52df-6061-4754-8fde-8c0a6f12b361` | Offen |
| 09:27:37 | `phaenomenautik-3` | `b5d1c6ed-19d0-4e96-8046-8fd3900bab84` | Offen |
| 09:55:38 | `phaenomenautik-3` | `4f568603-0a98-4913-b3fd-8dbe3701c647` | Offen |
| 10:23:35 | `phaenomenautik-3` | `b82a7697-c97e-424e-b25a-dd4dd2ae4178` | Offen |
| 11:05:18 | `phaenomenautik-3-live` | `e9eea9f9-603e-470d-894f-081d05c1eeec` | `2acdec9` |
| 11:32:39 | `phaenomenautik-3-live` | `bc0a2b71-634b-442f-bcfd-6c0e0e671ce8` | `6323180` |
| 12:20:37 | `phaenomenautik-3-live` | `63716702-d92e-4d16-950f-4d42f2e1723b` | `82f6124` |
| 12:53:01 | `phaenomenautik-3` | `23b60099-de84-4662-b669-54dced1d8aec` | Offen |

Die [Statuses von `2acdec9`](https://api.github.com/repos/ralfarminkirchner-netizen/phaenomenautik-3/commits/2acdec938d9c20edc9a2361cd940a92181e1687b/statuses),
[`6323180`](https://api.github.com/repos/ralfarminkirchner-netizen/phaenomenautik-3/commits/63231804c5f52a11649c8ab698172784d1b0d898/statuses)
und [`82f6124`](https://api.github.com/repos/ralfarminkirchner-netizen/phaenomenautik-3/commits/82f6124572a88783e8dec49174ecc63dfa4d4c40/statuses)
nennen dieselben Deployment-IDs wie die drei Live-Mails und jeweils
`failure`. Die Quellenstände enthalten die oben reproduzierten Syntax-
bzw. TypeScript-Blocker; welcher Fehler im Railway-Lauf zuerst auftrat,
beweisen erst die Buildlogs.

Der [Status von `f16a827`](https://api.github.com/repos/ralfarminkirchner-netizen/phaenomenautik-3/commits/f16a827c5c139dc8a9f585fb86d392bc7b449361/statuses)
meldet für den ursprünglichen Live-Service
`56703f80-195f-46e7-a64b-7a1437e1b373` am 09.10. um 12:26:59 MESZ
`success`, Deployment `21aeaec1-463f-4ec0-a611-14760193f368`.
Eine Live-Domain enthält dieser Status nicht. Für die ursprüngliche
Haupt-Service-ID `3522770b-3f7b-43bc-a81e-95c9ef15461f` wurde in den
Commitstatuses dieser Repository-Historie vom 8.–10. Oktober kein Treffer
gefunden; ihre fünf Deployment-Commits bleiben offen.

Die Mails enthalten keine Compiler-, Installations- oder Ressourcenfehler.
Der exakte jüngste Dashboardlink zeigte Login und eine 404-Seite; die
geführte Anmeldung wurde abgebrochen. Somit wurden keine tatsächlichen
Buildlogs, aktiven Deployments oder Dienstkonfigurationen dieser beiden
Service-IDs gelesen. Ihr aktueller Zustand und ihre autoritativen Domains
sind offen. Private Mail-IDs und Mailinhalte werden nicht in diesem
öffentlichen Repository abgelegt.

Commitstatus und HTTP-Prüfung ersetzen keine zugriffsgeschützten Logs
und Serviceeinstellungen. Drei Deployment-Commits sind damit zugeordnet,
fünf bleiben offen. Es ist nicht bewiesen, dass beide ursprünglichen
Dienste denselben Commit oder dieselben Buildbedingungen verwendeten.

Für beide Dienste sind insbesondere zu vergleichen:

- tatsächlicher Git-Commit, Branch und Root Directory;
- tatsächlicher Builder und dessen Version;
- resolved Node/npm-Version, Install-/Build-/Startbefehle;
- Buildvariablen mit Einfluss auf Installation und Compiler, ohne Geheimniswerte;
- Cachebedingungen, Buildlimits, Exitstatus und erste ursächliche Fehlermeldung;
- aktuelles aktives Deployment und autoritative Produktionsdomain;
- Start-/Runtime-Logs und kontrollierter Spielstart auf dem aktiven Stand.

Es wurden keine Railway-Einstellungen geändert, keine Builds oder
Redeployments angestoßen und keine PR-Änderungen zusammengeführt.
