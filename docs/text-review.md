# Offene Textprüfung — 9. Oktober 2026

## Verbindlicher Sprachleitfaden

- Texte laden ein und lassen der Person die Entscheidung. Weitergehen, überspringen, pausieren und verlassen sind gleichwertige Möglichkeiten; kein Schuld-, Scham- oder Zeitdruck.
- Spielwerte und Interaktionen begründen keine Ableitung über den persönlichen Zustand, keine Diagnose und keine sichere Heilungs-, Therapie- oder Wirkungsbehauptung.
- Körper-, Atem-, Feuer- und Bewegungsvorschläge sind freiwillig. Eine Handlung im Spiel erfordert keine körperliche Ausführung; Abstand und Auslassen bleiben möglich.
- Hilfe ist jederzeit frei erreichbar und an keinen Spielfortschritt, Abschluss oder Beweis von Belastung gebunden. Die Oberfläche kann Dringlichkeit nicht beurteilen.
- Erfundenes Geschehen wird als Spielfiktion gekennzeichnet. Atlas-Quellen, wörtliche Quellzitate und vorgeschlagene Modelltexte bleiben unterscheidbar.

Diese Liste führt die ersetzten, entfernten und neuen sichtbaren Modell-/Spieltexte dieser Änderung. Sie ist eine Änderungsübersicht, keine fachliche Freigabe. Jede Textzeile hat den exakten Status **Prüfung offen**. Die Prüfung durch qualifizierte Fachpersonen und Menschen mit eigener Erfahrung ist noch ausstehend.

Originale Atlas-Quellen, Quellenangaben und gekennzeichnete Quellzitate wurden nicht redigiert. Die ersetzten Formulierungen bleiben hier zur Nachvollziehbarkeit erhalten. Fiktive Landschaften, Gesprächsszenen, Übungsvorschläge und Körperkarten-Spielwerte begründen keine Diagnose, Therapie- oder Wirksamkeitsaussage. Keine regulatorische Zulassung oder menschliche Abnahme wird behauptet.

Basis: vor Bearbeitung gesicherte Texte der bestehenden Begegnungen; für Körperkarte und Root-Oberflächen Git HEAD. Neue Schutzoberflächen haben keinen vorherigen Textstand. Zeilen bezeichnen den jeweiligen Alt- oder aktuellen Neutextstand. Veränderte technische Kennungen, CSS, SVG-Geometrie, Imports, reine Codezustände sowie Leer- und Satzzeichensegmente sind keine Textprüfungsgegenstände. Dynamische Textvorlagen werden einschließlich ihrer Platzhalter dokumentiert.

## src/ui/BattleOverlay.tsx

| Stand / Zeile | Wortlaut | Prüfung |
| --- | --- | --- |
| Alt 152 | ${atk.line}${guard ? " (Dein Körperscan federt ab!)" : ""} ${dmg} Schaden. | Prüfung offen |
| Alt 182 | Nicht genug Präsenz … erst durchatmen. | Prüfung offen |
| Alt 202 | Du wendest „${ex.name}“ an. ${dmg} Wirkung gegen ${phen.name}! | Prüfung offen |
| Alt 204 | +${heal} Stabilität. | Prüfung offen |
| Alt 227 | ${item.name}: ${item.desc} +${item.heal} Stabilität. | Prüfung offen |
| Alt 228 | ${item.name}: ${item.desc} +14 Präsenz. | Prüfung offen |
| Alt 244 | ${line} — Verständnis: 100 %. Etwas löst sich … | Prüfung offen |
| Alt 251 | ${line} (Verständnis: ${nu} %) | Prüfung offen |
| Alt 259 | Du trittst zurück. Das Phänomen bleibt — Inseln laufen nicht weg. | Prüfung offen |
| Alt 281 | Intensität | Prüfung offen |
| Alt 288 | Verständnis | Prüfung offen |
| Alt 298 | DU · STUFE | Prüfung offen |
| Alt 301 | STAB | Prüfung offen |
| Alt 304 | PRÄS | Prüfung offen |
| Alt 313 | ▼ weiter | Prüfung offen |
| Alt 316 | Was tust du? (${phen.name} wirkt ${AROUSAL_LABEL[phen.arousal].toLowerCase()}.) | Prüfung offen |
| Alt 317 | Welche Übung? | Prüfung offen |
| Alt 317 | Welche Ressource? | Prüfung offen |
| Alt 328 | Deine Stabilität sinkt gegen null … Das ist kein Ende — nur ein Rückzug. Du wachst am nächsten Feuer wieder auf. Das Phänomen bleibt. Aber du auch. | Prüfung offen |
| Alt 337 | 🫁 Übung | Prüfung offen |
| Alt 340 | 💬 Verstehen | Prüfung offen |
| Alt 343 | 🎒 Ressource | Prüfung offen |
| Alt 346 | 🚶 Zurücktreten | Prüfung offen |
| Alt 369 | PRÄS | Prüfung offen |
| Alt 374 | ← Zurück | Prüfung offen |
| Alt 394 | ← Zurück | Prüfung offen |
| Neu 63 | ${attack.line} Spielwert Stabilität: −${damage}. | Prüfung offen |
| Neu 68 | Für diese Spielaktion reicht der Wert Präsenz gerade nicht. Du kannst eine andere Aktion wählen oder die Begegnung verlassen. | Prüfung offen |
| Neu 78 | Spielaktion „${exercise.name}“: −${damage} Intensität. ${effectivenessLabel(mult) ?? ""} Diese Zahlen beschreiben ausschließlich die Spielregel. | Prüfung offen |
| Neu 84 | „${item.name}“ eingesetzt. ${item.desc} Die Änderung betrifft Spielwerte. | Prüfung offen |
| Neu 91 | ${phen.understand[understandIdx % phen.understand.length]} Erkundung dieser Szene: ${value} %. | Prüfung offen |
| Neu 100 | Diese Spielrunde ist beendet. Du kannst die Begegnung jetzt ohne Verlust verlassen. | Prüfung offen |
| Neu 101 | Welche Spielaktion möchtest du wählen? Körperübungen musst du dafür nicht ausführen. | Prüfung offen |
| Neu 101 | Welche Spielressource möchtest du einsetzen? | Prüfung offen |
| Neu 102 | Wie möchtest du in dieser fiktiven Szene weitergehen? | Prüfung offen |
| Neu 105 | Fiktive Begegnung | Prüfung offen |
| Neu 108 | Verlassen ohne Verlust | Prüfung offen |
| Neu 110 | Fiktive Szene · freiwillig · Spielwerte beschreiben keine persönliche Verfassung | Prüfung offen |
| Neu 111 | Intensität: | Prüfung offen |
| Neu 111 | Erkundung: | Prüfung offen |
| Neu 111 | Spielwerte: Stabilität | Prüfung offen |
| Neu 111 | · Präsenz | Prüfung offen |
| Neu 114 | Weiterlesen | Prüfung offen |
| Neu 116 | Spielaktion wählen | Prüfung offen |
| Neu 117 | Szene betrachten | Prüfung offen |
| Neu 118 | Spielressource | Prüfung offen |
| Neu 121 | · ${exercise.cost} Präsenz | Prüfung offen |
| Neu 122 | Zur Auswahl | Prüfung offen |
| Neu 124 | Gegenreaktion als nächsten Spielzug ausführen | Prüfung offen |
| Neu 124 | Weiter | Prüfung offen |
| Neu 125 | Zur Auswahl | Prüfung offen |
| Neu 126 | Szene abschließen | Prüfung offen |
| Neu 127 | Zur Welt ohne Verlust | Prüfung offen |

## src/ui/DuelOverlay.tsx

| Stand / Zeile | Wortlaut | Prüfung |
| --- | --- | --- |
| Alt 85 | Da ist nichts zu benennen — noch nicht. Hör weiter zu. | Prüfung offen |
| Alt 95 | Oh — deine Taschen sind leerer als dein Blick. Schade. Komm wieder, wenn du dir Freundschaft leisten kannst. | Prüfung offen |
| Alt 101 | Keine Kristalle mehr? Dann eben nur die Karte. Die Hülle hebe ich mir für … zahlungskräftigere Freunde auf. | Prüfung offen |
| Alt 160 | Rededuell · | Prüfung offen |
| Alt 163 | Benannte Muster | Prüfung offen |
| Alt 164 | 🧭 ${named.length} Muster benannt | Prüfung offen |
| Alt 173 | Kein Treffer — aber das Benennen zu versuchen ist schon Übung. | Prüfung offen |
| Alt 198 | Muster-Radar — was passiert hier gerade? | Prüfung offen |
| Alt 219 | Im Journal festhalten | Prüfung offen |
| Alt 229 | waren im Spiel — unerkannt diesmal. Kein Fehler: Das Muster steht jetzt im Journal. Beim nächsten Mal siehst du es früher. | Prüfung offen |
| Alt 235 | Das war | Prüfung offen |
| Alt 235 | . Echte Menschen benutzen das. Du hast es erkannt. | Prüfung offen |
| Alt 237 | Gegenmittel: | Prüfung offen |
| Alt 242 | Diese Dynamiken spielen nur hier, im fiktiven Rahmen, gegen erwachsene Spielfiguren — nie gegen dich als Person. Erkannt zu haben zählt mehr als „richtig" gehandelt zu haben. | Prüfung offen |
| Alt 249 | Zurück zur Welt | Prüfung offen |
| Neu 35 | In diesem Abschnitt ist kein bestimmtes Muster hinterlegt. Du kannst die Szene weiter lesen. | Prüfung offen |
| Neu 55 | Eine mögliche Einordnung dieser erfundenen Szene. | Prüfung offen |
| Neu 58 | Einzelne Sätze reichen nicht aus, um reale Menschen oder Beziehungen zu beurteilen. | Prüfung offen |
| Neu 65 | Fiktive Gesprächsszene | Prüfung offen |
| Neu 67 | Fiktive Szene mit | Prüfung offen |
| Neu 68 | Verlassen ohne Kosten | Prüfung offen |
| Neu 70 | Du wählst eine Antwort für eine erfundene Figur. Es werden keine Kristalle ausgegeben. Du kannst jeden Abschnitt überspringen oder die Szene verlassen. | Prüfung offen |
| Neu 75 | Abschnitt überspringen | Prüfung offen |
| Neu 79 | Ohne Einordnung weiter | Prüfung offen |
| Neu 81 | Nächsten Abschnitt lesen | Prüfung offen |
| Neu 82 | Einordnung ansehen | Prüfung offen |
| Neu 86 | Mögliche Antwort der Spielfigur: | Prüfung offen |
| Neu 87 | Diese Begriffe ordnen Beispiele ein. Sie sind keine Diagnose und erlauben keine automatische Bewertung realer Menschen. Fachliche und Betroffenen-Prüfung offen. | Prüfung offen |
| Neu 88 | Szene abschließen und zur Welt | Prüfung offen |

## src/game/dialogAI.ts

| Stand / Zeile | Wortlaut | Prüfung |
| --- | --- | --- |
| Alt 49 | Flashbacks sind Erinnerungen, die nicht wie Erinnerungen kommen — sondern wie Nachschub. Der Körper glaubt, es sei JETZT. Was hilft: laut benennen, was heute ist. Ort, Datum, dein Alter. Die 5-4-3-2-1-Erdung im Kampf wirkt deshalb so stark gegen den Falter. | Prüfung offen |
| Alt 51 | Albträume sind Wiedererleben im Schlaf. Es gibt eine erforschte Gegenwehr: Imagination Rehearsal — du schreibst das Traumende tagsüber bewusst um und übst das neue Ende. Das Nervensystem ist lernfähig, auch nachts. | Prüfung offen |
| Alt 53 | Ständige Wachsamkeit ist ein Dauerzustand des Sympathikus — der Körper hält Wache, obwohl der Krieg vorbei ist. Das ist keine Schwäche, es ist ein überlebensnotwendiger Dienst, der nicht abgelöst wurde. Was hilft: dem System tausendmal beweisen, dass jetzt sicher ist. Lang ausatmen. Blick schweifen lassen. | Prüfung offen |
| Alt 55 | Herzrasen und Enge ohne Befund sind vegetative Alarmzeichen — dein innerer Botenjunge, der nie gelernt hat, langsam zu gehen. Schnellste Gegenwehr: der physiologische Seufzer. Doppelt einatmen, laaang ausatmen. Das aktiviert den Vagusnerv binnen Sekunden. | Prüfung offen |
| Alt 57 | Vermeidung funktioniert — kurzfristig. Deshalb ist sie so zäh. Langfristig hält sie das Alarmsystem am Laufen: Was nie berührt wird, bleibt gefährlich. Der Mittelweg ist dosierter Kontakt, keine Heldentaten. Ein Schritt, dann Luft holen, dann der nächste. | Prüfung offen |
| Alt 59 | Dissoziation ist die Notbremse des dorsalen Vagus: Wenn Kämpfen und Fliehen zwecklos waren, schaltet das System ab — wie durch Glas schauen. Das hat dich beschützt, als nichts anderes ging. Zurück kommst du über Aktivierung: Füße aufstampfen, Hände warm reiben, deinen Namen laut sagen. | Prüfung offen |
| Alt 61 | Erstarren ist keine Entscheidung und kein Versagen — es ist die älteste Verteidigung überhaupt. Der Bogen spannt sich ohne Pfeil. Sanftes Durchbewegen hilft: Zehen wackeln, Finger, dann größer. Niemals forcieren. Erstarrung hasst Forderungen, aber sie mag Einladungen. | Prüfung offen |
| Alt 63 | Hör gut zu, das ist wichtig: Tiefe Scham ist ein Kernsymptom komplexer Traumatisierung — keine Tatsache über dich. Das Gefühl 'kaputt zu sein' ist die innere Übernahme dessen, was dir angetan wurde. Es ist veränderbar. Du hast es nicht verdient, und du hast es nie verdient. | Prüfung offen |
| Alt 65 | Innere Leere ist selten das Fehlen von Gefühl — sie ist Gefühl, das Sicherheiten gezogen hat. Gefühle kommen nicht auf Befehl zurück, aber über kleine, dosierte Sinneserfahrungen: Wärme der Tasse in der Hand, ein Lied, ein Atemzug, der bewusst ausklingt. | Prüfung offen |
| Alt 67 | Wenn Nähe verletzt hat, wird sie zur Sehnsucht UND zur Bedrohung zugleich — Klammern und Wegstoßen sind zwei Seiten derselben Münze. Heilung passiert nicht per Beschluss, sondern durch kleine, verlässliche Nähe-Erfahrungen. Ein Mensch, der bleibt. Wieder und wieder. | Prüfung offen |
| Alt 69 | Der Körper trägt die Geschichte mit — Magen, Haut, Kiefer, Schultern. Er reagiert oft früher als der Kopf; das vegetative Nervensystem 'merkt' sich Belastung. Körperorientierte Übungen sprechen genau diese Ebene an. Frag mich ruhig nach konkreten Übungen. | Prüfung offen |
| Alt 73 | Die 5-4-3-2-1-Erdung: Nenne 5 Dinge, die du siehst. 4, die du hörst. 3, die du spürst. 2, die du riechst. 1, das du schmeckst. Danach drei lange Ausatmungen. Das zieht die Aufmerksamkeit aus dem Damals ins Jetzt — wirkt im Kampf stark gegen übererregte Phänomene. | Prüfung offen |
| Alt 75 | Der physiologische Seufzer: Tief durch die Nase einatmen, dann noch einen kleinen Schluck Luft oben drauf — und laaang durch den Mund ausseufzen. Drei bis fünf Mal. Das ist die schnellste bekannte Bremse für den Sympathikus. Mitten im Gespräch machbar, keiner merkt es. | Prüfung offen |
| Alt 77 | Der Voo-Klang: Tief einatmen, dann auf dem Ausatem ein tiefes, sonores 'Vooo' tönen lassen — wie ein Nebelhorn in deinem Bauch. Die Vibration massiert den Vagusnerv. Summen, Singen und bewusstes Gähnen wirken genauso. Vier bis sechs Wiederholungen. | Prüfung offen |
| Alt 79 | Abschütteln ist uralte Säugetier-Weisheit: Nach überlebener Gefahr schüttelt der Körper die Stresschemie ab. Steh mit weichen Knien, lass das Zittern aus den Beinen aufsteigen, 5–10 Minuten. Nicht steigern — zulassen. Bei komplexem Trauma zuerst mit Begleitung üben. | Prüfung offen |
| Alt 81 | Pendeln kommt aus Somatic Experiencing: Spür kurz die belastende Empfindung — nur Sekunden — dann wechsle bewusst zu etwas Angenehmem. Enge, Wärme, Enge, Wärme. So lernt dein Nervensystem: Ich kann mich nähern UND zurückziehen. Das weitet das Toleranzfenster. | Prüfung offen |
| Alt 83 | Der Körperscan baut deine innere Landkarte: Wander mit der Aufmerksamkeit von den Füßen hoch zum Gesicht und frag an jeder Station nur 'Was ist hier?' — Druck, Wärme, Kribbeln, Nichts. Alles ist erlaubt, nichts muss bewertet werden. | Prüfung offen |
| Alt 85 | Der innere sichere Ort: Stell dir einen Ort vor — real oder erfunden — an dem du völlig sicher bist. Mach ihn greifbar: Was siehst, hörst, riechst du? Verankere ihn mit einer Geste, zwei Finger etwa. Dann ist er jederzeit abrufbar. Wichtig: Er muss sich WIRKLICH sicher anfühlen. | Prüfung offen |
| Alt 87 | Co-Regulation ist das stärkste Regulationssystem überhaupt: Ein ruhiges, warmes Gegenüber reguliert dein Nervensystem über Stimme, Mimik und Rhythmus mit — automatisch, stärker als jede Solotechnik. Deshalb heilt, was in Beziehung verletzt wurde, auch vor allem IN Beziehung. | Prüfung offen |
| Alt 91 | Das autonome Nervensystem steuert, was du nicht befehlen kannst: Herzschlag, Atmung, Verdauung, Alarmbereitschaft. Es hat zwei große Regler — den Sympathikus (Gas: Kampf/Flucht) und den Parasympathikus (Bremse: Ruhe/Verdauung). Trauma klemmt das Gaspedal fest oder zieht die Notbremse. | Prüfung offen |
| Alt 93 | Die Polyvagal-Theorie von Stephen Porges beschreibt drei Stufen: ventraler Vagus (sichere Verbundenheit), Sympathikus (Kampf/Flucht), dorsaler Vagus (Erstarrung/Shutdown). Traumafolgen sind Zustände dieses Systems — keine Charakterfehler. Und Zustände sind veränderbar. | Prüfung offen |
| Alt 95 | Das Toleranzfenster ist der Erregungsbereich, in dem du denken UND fühlen kannst. Darüber: Übererregung — Herzrasen, Wut, Panik. Darunter: Untererregung — Taubheit, Leere, Erstarrung. Jede Übung auf diesem Meer tut im Kern dasselbe: Sie weitet dein Fenster. | Prüfung offen |
| Alt 97 | PTBS — die posttraumatische Belastungsstörung — folgt meist einem einmaligen Ereignis: Intrusionen, Vermeidung, anhaltende Bedrohungswahrnehmung. Sie ist gut behandelbar, vor allem mit traumafokussierter KVT und EMDR. Das sind die Leitlinien-Verfahren. | Prüfung offen |
| Alt 99 | Komplexe PTBS entsteht durch wiederholte oder langanhaltende Traumatisierung, oft in der Kindheit und in Abhängigkeitsbeziehungen. Seit 2022 ist sie in der ICD-11 eigenständig anerkannt. Zusätzlich zur PTBS-Trias kommen Affektdysregulation, negatives Selbstbild und Beziehungsstörungen. Hilfe: phasenorientierte Traumatherapie. | Prüfung offen |
| Alt 101 | Die Amygdala ist der Rauchmelder des Gehirns: schnell, grob, lieber einmal zu oft Alarm als einmal zu wenig. Nach Trauma ist sie feuere empfindlich eingestellt. Atmung, Erden und sichere Beziehungen justieren den Melder über Zeit neu — Bottom-up, nicht per Argument. | Prüfung offen |
| Alt 105 | Jede Insel da draußen ist ein Phänomen — etwas, das Menschen nach schweren Zeiten erleben: Wiedererleben, Wachsamkeit, Vermeidung, Erstarrung, Scham. Solange du sie umschiffst, bleiben sie Stürme. Wenn du anlandest und ihnen begegnest, werden sie Landschaft. | Prüfung offen |
| Alt 107 | In der Mitte der Karte dreht sich der Sturmherd — das, was nie erzählt, nie geweint, nie gehört wurde. Er öffnet sich erst, wenn alle zwölf Phänomene überwunden sind. Man sagt: Wer ihm begegnet, kommt mit normalem Wetter zurück. Ehrlichem, menschlichem Wetter. | Prüfung offen |
| Alt 109 | Dieses Meer steht auf keiner Karte der Welt, aber auf jeder Karte der Seele. Es besteht aus allem, was Menschen erlebt und überlebt haben. Deshalb segelt hier jeder irgendwann — die einen freiwillig, die anderen werden geworfen. Du hast ein Schiff. Das ist mehr, als viele haben. | Prüfung offen |
| Alt 111 | Das Wetter hier folgt keinem Kalender — es folgt Erregung. Sturmzellen treiben über die See; drinnen ist es rau, aber es gibt nichts, was du nicht durchqueren oder umfahren könntest. Merks dir: Auch das schwerste Wetter ist WETTER. Es geht vorbei. Wetter geht immer vorbei. | Prüfung offen |
| Alt 117 | Der Ankerplatz ist der einzige Fleck auf diesem Meer, der nie Phänomen war — oder schon so lange befriedet, dass es keiner mehr weiß. Hier landen die an, die zwischen zwei Stürmen Luft holen. Mara lotst, Tove heilt, Kaj baut, die Doktorin forscht. Und Ben … Ben wartet noch auf sein Wetter. | Prüfung offen |
| Alt 128 | ${p.name} — ${p.epithet}. Es haust im Archipel „${p.archipelago}" und ist ${AROUSAL_LABEL[p.arousal].toLowerCase()}. Im Kampf gilt: ${<br>        p.arousal === "hyper"<br>          ? "beruhigende Übungen wie Erdung, Seufzer oder Voo-Klang wirken am stärksten (★)."<br>          : p.arousal === "hypo"<br>            ? "aktivierende Übungen wie das Aktivierungs-SOS wirken am stärksten (★)."<br>            : "ausgleichende Übungen wie Pendeln oder Co-Regulation tragen am sichersten."<br>      } Oder du versuchst, es zu VERSTEHEN — manche Phänomene lassen sich eher umarmen als bezwingen. | Prüfung offen |
| Alt 141 | Hör zu, Kind der See: | Prüfung offen |
| Alt 141 | Ahoi. Das sag ich dir so, wie ich's jeder Crew sage: | Prüfung offen |
| Alt 141 | Na gut, Seemanns-Weisheit gefällig? | Prüfung offen |
| Alt 142 | Komm, atme einmal durch, während ich dir das sage: | Prüfung offen |
| Alt 142 | Mit warmen Händen gesprochen: | Prüfung offen |
| Alt 142 | Ich sag dir, was ich allen hier sage: | Prüfung offen |
| Alt 143 | Pass auf, so einfach ist das: | Prüfung offen |
| Alt 143 | Hört sich kompliziert an, ist es nicht: | Prüfung offen |
| Alt 143 | Ich erklär's dir wie an ner Werkbank: | Prüfung offen |
| Alt 144 | Wissenschaftlich gesprochen — aber ich übersetze: | Prüfung offen |
| Alt 144 | Eine gute Frage. Die Datenlage dazu: | Prüfung offen |
| Alt 144 | Lassen Sie mich das präzisieren: | Prüfung offen |
| Alt 145 | Ich … ich weiß da was aus eigener Erfahrung: | Prüfung offen |
| Alt 145 | Das hat mir Tove mal erklärt, und es stimmt: | Prüfung offen |
| Alt 145 | Ich sag dir, was mir geholfen hat: | Prüfung offen |
| Alt 161 | ${nameMatch[1]}. Ein guter Name für diese See. Ich werde ihn mir merken, ${nameMatch[1]} — versprochen. | Prüfung offen |
| Alt 169 | Halt kurz inne — ich bin froh, dass du das aussprichst, und ich nehme es ernst. Was du gerade trägst, klingt zu schwer für ein Schiff allein. Bitte sprich noch heute mit Menschen, die genau dafür da sind: Telefonseelsorge 0800 111 0 111 oder 0800 111 0 222 (kostenfrei, rund um die Uhr), im akuten Notfall die 112. Du musst das nicht allein tragen. Wirklich nicht. | Prüfung offen |
| Alt 179 | Du hast es geschafft! „${q.title}" ist erledigt. Hier — ${q.reward}. Redlich verdient, ${name}. | Prüfung offen |
| Alt 187 | Tatsächlich, ja. Hört zu: ${q.desc} (Lohn: ${q.reward}) — Ich trage es dir ins Journal ein. Sag Bescheid, wenn es erledigt ist! | Prüfung offen |
| Alt 194 | Du hast schon genug auf dem Zettel, ${name}:\n${lines}\nKomm wieder, wenn davon etwas erledigt ist. | Prüfung offen |
| Alt 203 | Abgemacht! „${offer.title}" steht jetzt in deinem Journal. ${offer.goalDesc(save)} — und komm heil zurück, ${name}. | Prüfung offen |
| Alt 220 | Mir? Der Rücken meckert, der Horizont nicht — also alles im Lot. Wichtiger: Wie geht's DIR, nach all der Seefahrt? | Prüfung offen |
| Alt 221 | Danke der Nachfrage — die wenigsten fragen die Heilerin. Mir geht es gut, wenn es euch gut geht. Und dir selbst? Spür mal kurz in dich hinein, ich warte. | Prüfung offen |
| Alt 222 | Gut! Die Werkbank steht, das Holz trocknet, was will man mehr. Dir fehlt noch ein ordentlicher Ausbau, aber das kriegen wir hin. | Prüfung offen |
| Alt 223 | Fasziniert, wie immer — jede Rückkehr von Ihnen bringt neue Datenpunkte. Aber ich glaube, Sie fragen höflich. Also: gut, danke. | Prüfung offen |
| Alt 224 | Besser, seit du manchmal vorbeischaust. Manche Tage sind lauter als andere, wenn du verstehst. Heute ist … ein leiserer Tag. | Prüfung offen |
| Alt 241 | Das darf sein, ${name}. Alles davon. Leg für einen Moment eine Hand auf deinen Brustkorb — spür die Wärme. Atme in die Hand hinein. Du musst jetzt nichts lösen, nur diesen einen Atemzug. Und wenn es zu schwer wird: Telefonseelsorge, 0800 111 0 111, rund um die Uhr. Auch ich bleibe hier. | Prüfung offen |
| Alt 242 | Ich … kenne das. Wirklich. An solchen Tagen hilft es mir, einfach neben jemandem zu sitzen, ohne dass einer reden muss. Setz dich zu mir ans Feuer, solange du willst. Und Tove hat mir mal gesagt: Gefühle sind Wetter, keine Klimazone. Es stimmt. | Prüfung offen |
| Alt 243 | Dann hast du gute Menschen an Bord, ${name} — uns. Jede Crew der Welt hatte solche Tage. An Land gehen, Tee trinken, schlafen. Morgen sieht dieselbe See schon anders aus. Versprochen. | Prüfung offen |
| Alt 244 | Das ist eine nachvollziehbare Reaktion auf eine anstrengende Reise — kein Defekt. Die Forschung ist da eindeutig: Erst regulieren, dann reflektieren. Tove ist die Expertin dafür. Aber bleiben Sie gern erst mal hier sitzen. | Prüfung offen |
| Alt 245 | Hey. Runter vom Schiff, Hände an die Werkbank, was Anfassen hilft. Du musst nicht stark sein, nur da. Und wenn's dunkler wird, als Werkbänke reichen — Tove ist die Richtige, ehrlich. | Prüfung offen |
| Alt 255 | Das hatten wir schon — aber es verträgt Wiederholung: | Prüfung offen |
| Alt 259 | ${entry.answer(npc, save)}${ref ? &#96;\n\nAber ehrlich gesagt: Dafür ist ${ref} die bessere Anlaufstelle — steht auch hier auf dem Ankerplatz.&#96; : ""} | Prüfung offen |
| Alt 268 | Hmm, das übersteigt meine Seekarten. Frag mich gern nach dem Meer, den Inseln, dem Wetter — oder 'Aufgabe' für Arbeit. | Prüfung offen |
| Alt 268 | Darauf hab ich keine Antwort im Logbuch. Aber wenn du was über Stürme, Strömungen oder die Archipele wissen willst: her damit. | Prüfung offen |
| Alt 269 | Das muss ich mir in Ruhe durch den Kopf gehen lassen. Frag mich gern nach Übungen, nach dem Körper, nach allem, was unter die Haut geht. | Prüfung offen |
| Alt 269 | Da bin ich überfragt — aber wenn dir etwas in Glieder oder Herz fährt, dafür bin ich da. | Prüfung offen |
| Alt 270 | Keine Ahnung, ehrlich. Holz, Wellen, Wind — das sind meine Sprachen. Oder sag 'Aufgabe', dann machen wir was Handfestes. | Prüfung offen |
| Alt 270 | Versteh ich nicht ganz. Reden wir über dein Schiff? Darüber kann ich STUNDEN reden. | Prüfung offen |
| Alt 271 | Interessante Frage — außerhalb meines derzeitigen Korpus. Fragen Sie mich zum Nervensystem, zur Polyvagal-Theorie oder zu den Phänomenen. | Prüfung offen |
| Alt 271 | Dazu habe ich keine belastbaren Daten. Aber über Trauma-Forschung weiß ich Einiges. | Prüfung offen |
| Alt 272 | Sorry, ich … da weiß ich nichts zu. Aber wenn du wissen willst, wie sich das alles ANFÜHLT, oder einfach jemanden am Feuer brauchst — dafür bin ich gut. | Prüfung offen |
| Alt 272 | Hm, das kann ich nicht beantworten. Aber zuhören kann ich. Immer. | Prüfung offen |
| Neu 49 | Auf dem Wiederkehr-Riff trägt ein Falter wechselnde Bilder. Diese erfundene Szene kann betrachtet oder ausgelassen werden. Sie erlaubt keine Aussage über eigene Erinnerungen. | Prüfung offen |
| Neu 51 | Muras Insel erzählt eine erfundene Traumgeschichte. Du kannst ihr Lied aus der Ferne lesen oder die Szene verlassen. Das Spiel behandelt keine Schlafprobleme. | Prüfung offen |
| Neu 53 | Der kristallene Wächter dreht sein Licht über das Atoll. Sein Spieltyp heißt hohe Aktivität; das beschreibt nur eine Regel dieser Figur. | Prüfung offen |
| Neu 55 | Das Trommelwesen stellt einen Spielrhythmus dar. Eigene Beschwerden wie Herzrasen, Atemnot oder Brustenge lassen sich hier nicht einschätzen. Bei unmittelbarer Gefahr gilt in Deutschland 112; für dringende medizinische Anliegen außerhalb der Sprechzeiten 116 117. | Prüfung offen |
| Neu 57 | Vermeidia zeichnet mehrere Wege in den Sand. Auch ein Umweg oder Rückweg zählt als selbst gewählte Spielentscheidung. Es gibt keine Pflicht zur Annäherung. | Prüfung offen |
| Neu 59 | Dissozia ist eine erfundene Glasgeistin. Die Glasbögen dienen als Bild für Abstand; sie erklären keine persönliche Verfassung. Betrachten und Verlassen sind mögliche Wege. | Prüfung offen |
| Neu 61 | Erstarrion steht zwischen Eisblöcken. Die Spielfigur darf stehen bleiben oder weitergehen. Die Szene fordert keine Bewegung des eigenen Körpers. | Prüfung offen |
| Neu 63 | Der Scham-Golem baut eine Mauer aus beschrifteten Steinen. Die Schrift bewertet die spielende Person nicht. Du kannst auch den freien Uferweg wählen. | Prüfung offen |
| Neu 65 | Die Insel der Leere enthält eine Schale und viel freien Raum. Das ist ein Bild dieser Geschichte. Hier wird keine Gefühlslage bewertet und keine Veränderung versprochen. | Prüfung offen |
| Neu 67 | Die Figuren auf dem Riff wählen Abstand und Kontakt. Diese Wahl erlaubt keine Beurteilung realer Beziehungen. Ben ist eine erfundene Figur und kein Erfahrungsbericht. | Prüfung offen |
| Neu 69 | Der Dialog kann körperliche Beschwerden nicht einschätzen. Die Spielwerte beschreiben nur die Spielfigur. Bei dringenden medizinischen Anliegen außerhalb der Sprechzeiten erreichst du in Deutschland 116 117; bei unmittelbarer Gefahr 112. | Prüfung offen |
| Neu 73 | Eine freiwillige Idee ist, etwas Angenehmes oder Neutrales im Raum wahrzunehmen. Die Spielaktion lässt sich auch allein durch Lesen wählen; Zählen und körperliche Durchführung sind nicht nötig. | Prüfung offen |
| Neu 75 | Du musst deinen Atem für die Spielaktion nicht verändern. Wenn du möchtest, kannst du ihn nur bemerken. Auslassen oder die Szene verlassen sind vollständige Möglichkeiten. | Prüfung offen |
| Neu 77 | Du kannst einen leisen Ton hören oder summen, wenn das angenehm ist. Schweigen ist ebenso möglich. Das Spiel verspricht dadurch keine körperliche Wirkung. | Prüfung offen |
| Neu 79 | Für diese Spielaktion ist keine körperliche Durchführung nötig. Eine kleine selbst gewählte Bewegung ist optional; Zittern muss weder ausgelöst noch verstärkt werden. | Prüfung offen |
| Neu 81 | Du kannst die Aufmerksamkeit auf etwas Neutrales richten. Belastende Empfindungen müssen dafür nicht aufgesucht werden. Du kannst auch nur die Szene lesen. | Prüfung offen |
| Neu 83 | Wenn du möchtest, kannst du etwas Angenehmes oder Neutrales bemerken. Nach innen zu schauen ist keine Voraussetzung. Die Auswahl im Spiel genügt. | Prüfung offen |
| Neu 85 | Ein selbst gewählter realer oder erfundener Ort kann als Bild dienen. Ein vollkommen sicherer Ort muss nicht vorgestellt werden. Auslassen bleibt möglich. | Prüfung offen |
| Neu 87 | Kontakt zu einem selbst gewählten Menschen ist eine mögliche eigene Entscheidung. Die Spielfigur stellt keinen menschlichen Kontakt dar und verspricht keine Wirkung. | Prüfung offen |
| Neu 91 | Das Meer ist eine Metapher, keine Abbildung eines Nervensystems. Spielwerte wie Präsenz und Stabilität lassen sich nicht auf eine Person übertragen. Die Quellen des TRAUMAATLAS sind von diesen erfundenen Dialogen zu unterscheiden. | Prüfung offen |
| Neu 93 | Die Polyvagal-Theorie ist eine thematische Bezugnahme des Ausgangsmaterials. Dieser Dialog kann ihren wissenschaftlichen Stand nicht bewerten. Daraus werden keine körperlichen Zustände oder passenden Übungen für dich abgeleitet. | Prüfung offen |
| Neu 95 | TOLERANZ ist der Name des Schiffs; das Bild eines Fensters erscheint im Ausgangsmaterial. Fortschritt und Zahlen im Spiel messen kein persönliches Toleranzfenster. | Prüfung offen |
| Neu 97 | PTBS ist ein klinischer Begriff. Ob er auf eine Person zutrifft, lässt sich in diesem Spiel nicht feststellen. Persönliche Diagnosen und Behandlungsentscheidungen gehören in ein Gespräch mit qualifizierten Menschen. | Prüfung offen |
| Neu 99 | Komplexe PTBS ist ein klinischer Begriff. Die fiktiven Figuren können ihn weder erkennen noch bestätigen. Aus eigenen Spielentscheidungen wird keine Diagnose abgeleitet. | Prüfung offen |
| Neu 101 | Die Amygdala gehört zu den Begriffen des Ausgangsmaterials. Eine Alarmfigur im Spiel bildet keine einzelne Hirnregion ab. Die Szene erlaubt keine Aussage über das eigene Gehirn. | Prüfung offen |
| Neu 105 | Die Inseln sind erfundene Landschaften, die thematische Begriffe als Bilder aufgreifen. Du kannst sie betreten, aus der Ferne betrachten oder auslassen. Es gibt keine Pflicht, sie abzuschließen. | Prüfung offen |
| Neu 107 | Der Sturmherd bildet einen erzählerischen Abschluss dieser Seekarte. Die Freischaltung ist eine Spielregel. Du musst dafür keine persönliche Geschichte erzählen und kannst den Besuch auslassen. | Prüfung offen |
| Neu 109 | Dieses Meer ist eine erfundene Landschaft. Es bietet Wege zum Segeln, Lesen und Erkunden; es behauptet nichts über die Lebensgeschichte der spielenden Person. | Prüfung offen |
| Neu 111 | Wind und Wellen gehören zur Spielwelt. Du kannst Sturmzellen umfahren oder am Ankerplatz bleiben. Das Wetter ist keine Aussage über eigene Gefühle oder Gefahren. | Prüfung offen |
| Neu 117 | Am Ankerplatz stehen Mara, Tove, Kaj, Dr. Wiegand und Ben als erfundene Figuren. Mara erzählt vom Meer, Tove von freiwilligen Spielaktionen, Kaj vom Schiff; Wiegand und Ben erzählen aus der erfundenen Welt. | Prüfung offen |
| Neu 127 | ${p.name} — ${p.epithet}. Eine erfundene Figur im Archipel „${p.archipelago}“. ${p.insight} Du kannst die Szene freiwillig betrachten, wählen oder verlassen. | Prüfung offen |
| Neu 135 | Aus Maras Seekarten: | Prüfung offen |
| Neu 136 | Mara erzählt aus der Spielwelt: | Prüfung offen |
| Neu 139 | Toves freiwillige Idee: | Prüfung offen |
| Neu 140 | Eine Spielnotiz von Tove: | Prüfung offen |
| Neu 143 | Kaj erklärt das Schiff im Spiel: | Prüfung offen |
| Neu 144 | Eine Notiz aus Kajs Werkstatt: | Prüfung offen |
| Neu 147 | Eine Notiz der erfundenen Forscherin: | Prüfung offen |
| Neu 148 | Wiegands Hinweis zur Spielmetapher: | Prüfung offen |
| Neu 151 | Ben erzählt als erfundene Figur: | Prüfung offen |
| Neu 152 | Bens Notiz aus dieser Geschichte: | Prüfung offen |
| Neu 169 | Der gewählte Name ist jetzt ${nameMatch[1]}. Du kannst ihn später ändern. | Prüfung offen |
| Neu 177 | Falls diese Worte deine aktuelle Situation beschreiben: Bei unmittelbarer Gefahr rufe in Deutschland 112. TelefonSeelsorge erreichst du unter 116 123, 0800 111 0 111 oder 0800 111 0 222, kostenfrei und rund um die Uhr. Bei dringenden medizinischen Anliegen außerhalb der Sprechzeiten: 116 117. Dieser vorgefertigte Spieldialog kann deine Lage nicht einschätzen. Du kannst das Spiel unterbrechen und Kontakt zu einem selbst gewählten Menschen suchen. | Prüfung offen |
| Neu 187 | Die Spielaufgabe „${q.title}“ ist abgeschlossen. Spielbelohnung: ${q.reward}. | Prüfung offen |
| Neu 195 | Eine freiwillige Spielaufgabe: ${q.desc} (Spielbelohnung: ${q.reward}). Wenn du sie übernehmen möchtest, antworte „Ich mache es“. | Prüfung offen |
| Neu 201 | Offene freiwillige Spielaufgaben:\n${lines}\nDu bestimmst, ob und wann du sie fortsetzt. | Prüfung offen |
| Neu 210 | Die freiwillige Spielaufgabe „${offer.title}“ steht jetzt im Journal. ${offer.goalDesc(save)} Du bestimmst das Tempo. | Prüfung offen |
| Neu 227 | Mara prüft gerade die Seekarte. Sie erzählt aus der Spielwelt. | Prüfung offen |
| Neu 228 | Tove sammelt freiwillige Ideen für Spielaktionen. Du brauchst ihr nichts Persönliches zu berichten. | Prüfung offen |
| Neu 229 | Kaj wartet an seiner Werkbank. Schiffsausbau ist eine optionale Spielaufgabe. | Prüfung offen |
| Neu 230 | Wiegand sortiert ihre erfundenen Seekarten; persönliche Daten sind dafür nicht erforderlich. | Prüfung offen |
| Neu 231 | Ben sitzt als erfundene Figur am Feuer. Sein Text ist kein Bericht eines realen Betroffenen. | Prüfung offen |
| Neu 248 | Der Spieldialog kann nicht einschätzen, wie es dir geht. Du musst hier nichts lösen oder offenlegen. Du kannst pausieren, das Spiel verlassen oder einen selbst gewählten Menschen kontaktieren. In Deutschland ist TelefonSeelsorge unter 116 123 rund um die Uhr kostenfrei erreichbar; bei unmittelbarer Gefahr gilt 112. | Prüfung offen |
| Neu 249 | Der Spieldialog kann nicht einschätzen, wie es dir geht. Du musst hier nichts lösen oder offenlegen. Du kannst pausieren, das Spiel verlassen oder einen selbst gewählten Menschen kontaktieren. In Deutschland ist TelefonSeelsorge unter 116 123 rund um die Uhr kostenfrei erreichbar; bei unmittelbarer Gefahr gilt 112. | Prüfung offen |
| Neu 250 | Der Spieldialog kann nicht einschätzen, wie es dir geht. Du musst hier nichts lösen oder offenlegen. Du kannst pausieren, das Spiel verlassen oder einen selbst gewählten Menschen kontaktieren. In Deutschland ist TelefonSeelsorge unter 116 123 rund um die Uhr kostenfrei erreichbar; bei unmittelbarer Gefahr gilt 112. | Prüfung offen |
| Neu 251 | Der Spieldialog kann nicht einschätzen, wie es dir geht. Du musst hier nichts lösen oder offenlegen. Du kannst pausieren, das Spiel verlassen oder einen selbst gewählten Menschen kontaktieren. In Deutschland ist TelefonSeelsorge unter 116 123 rund um die Uhr kostenfrei erreichbar; bei unmittelbarer Gefahr gilt 112. | Prüfung offen |
| Neu 252 | Der Spieldialog kann nicht einschätzen, wie es dir geht. Du musst hier nichts lösen oder offenlegen. Du kannst pausieren, das Spiel verlassen oder einen selbst gewählten Menschen kontaktieren. In Deutschland ist TelefonSeelsorge unter 116 123 rund um die Uhr kostenfrei erreichbar; bei unmittelbarer Gefahr gilt 112. | Prüfung offen |
| Neu 262 | Zur Orientierung in der Spielwelt: | Prüfung offen |
| Neu 266 | ${entry.answer(npc, save)}${ref ? &#96;\n\nIn der Spielwelt erzählt auch ${ref} zu diesem Thema. Diese Figur ersetzt keine fachliche Anlaufstelle.&#96; : ""} | Prüfung offen |
| Neu 276 | Für diese Eingabe gibt es hier keine passende vorgefertigte Antwort. Du kannst nach der Spielwelt fragen, eine Antwortoption wählen oder das Gespräch schließen. | Prüfung offen |
| Neu 279 | Für diese Eingabe gibt es hier keine passende vorgefertigte Antwort. Du kannst nach der Spielwelt fragen, eine Antwortoption wählen oder das Gespräch schließen. | Prüfung offen |
| Neu 282 | Für diese Eingabe gibt es hier keine passende vorgefertigte Antwort. Du kannst nach der Spielwelt fragen, eine Antwortoption wählen oder das Gespräch schließen. | Prüfung offen |
| Neu 285 | Für diese Eingabe gibt es hier keine passende vorgefertigte Antwort. Du kannst nach der Spielwelt fragen, eine Antwortoption wählen oder das Gespräch schließen. | Prüfung offen |
| Neu 288 | Für diese Eingabe gibt es hier keine passende vorgefertigte Antwort. Du kannst nach der Spielwelt fragen, eine Antwortoption wählen oder das Gespräch schließen. | Prüfung offen |

## src/game/data.ts

| Stand / Zeile | Wortlaut | Prüfung |
| --- | --- | --- |
| Alt 66 | Fünf Dinge sehen, vier hören … zurück ins Hier und Jetzt. | Prüfung offen |
| Alt 75 | Doppel-einatmen, lang ausatmen. Der Vagusnerv antwortet sofort. | Prüfung offen |
| Alt 84 | Ein tiefer Ton, der Brust und Bauch zum Schwingen bringt. | Prüfung offen |
| Alt 88 | Abschütteln (Tremor) | Prüfung offen |
| Alt 93 | Wie das Reh nach der Flucht: die Stressenergie verlässt den Körper. | Prüfung offen |
| Alt 97 | Aktivierungs-SOS | Prüfung offen |
| Alt 102 | Aufstampfen, Hände reiben, den eigenen Namen rufen. | Prüfung offen |
| Alt 106 | Orientierungsreflex wecken | Prüfung offen |
| Alt 111 | Augen wandern lassen, den Raum benennen: Tür. Fenster. Lampe. | Prüfung offen |
| Alt 120 | Zwischen Enge und Wärme hin- und herschwingen, Sekunde für Sekunde. | Prüfung offen |
| Alt 130 | Die innere Landkarte abfahren — was wahrgenommen wird, verliert Schrecken. | Prüfung offen |
| Alt 134 | Innerer sicherer Ort | Prüfung offen |
| Alt 139 | Ein Ort vollkommener Sicherheit, jederzeit abrufbar. | Prüfung offen |
| Alt 143 | Selbstberuhigende Berührung | Prüfung offen |
| Alt 148 | Eine Hand auf dem Brustkorb. Wärme. Gewicht. Atem. | Prüfung offen |
| Alt 157 | Eine vertraute Stimme holt dich zurück. Das stärkste Regulationssystem. | Prüfung offen |
| Alt 162 | Ein bewusster Schluck. Spüre den Weg im Hals. | Prüfung offen |
| Alt 163 | Darauf steht dein Name, der Ort, das Datum. Es hilft. | Prüfung offen |
| Alt 164 | Stellt 14 Präsenz wieder her. | Prüfung offen |
| Alt 184 | Zeitsprung | Prüfung offen |
| Alt 184 | Der Falter schlägt mit den Flügeln — und es ist wieder damals! | Prüfung offen |
| Alt 185 | Blitzlicht | Prüfung offen |
| Alt 185 | Ein grelles Bild brennt sich in den Moment! | Prüfung offen |
| Alt 186 | Rückfallwind | Prüfung offen |
| Alt 186 | Die Luft riecht plötzlich nach damals! | Prüfung offen |
| Alt 189 | Die Insel flimmert. Die Luft hier ist dicker, als wäre sie zweimal bewohnt. | Prüfung offen |
| Alt 190 | Aus dem Gestrüpp hebt sich ein riesiger Falter, dessen Flügel wie alte Fotos aussehen. | Prüfung offen |
| Alt 191 | DER FLASHBACK-FALTER will dich in ein Gestern ziehen, das nie vergehen wollte! | Prüfung offen |
| Alt 194 | Du bleibst stehen. „Das war damals“, sagst du. „Das ist jetzt.“ Der Falter zögert. | Prüfung offen |
| Alt 195 | Du nennst laut den Ort, das Datum, dein Alter. Die Flügelbilder verblassen ein wenig. | Prüfung offen |
| Alt 196 | Der Falter zeigt dir sein Bild nicht mehr — er zeigt dir, dass er Angst hat, es zu verlieren. | Prüfung offen |
| Alt 197 | Du erkennst: Er will nicht quälen. Er will nur endlich gehört werden. | Prüfung offen |
| Alt 199 | Der Flashback-Falter sinkt zu Boden und wird zu einem stillen Foto in deiner Hand. | Prüfung offen |
| Alt 200 | Der Falter landet auf deiner Schulter. Er wird leicht — ein Erinnern ohne Ertrinken. | Prüfung offen |
| Alt 201 | Flashbacks sind das Wiedererleben des Vergangenen in der Gegenwart — die typische Intrusion der PTBS. Orientierung im Hier und Jetzt (Ort, Datum, Sinne) signalisiert dem Nervensystem: Die Gefahr ist vorbei. | Prüfung offen |
| Alt 217 | Federsturm | Prüfung offen |
| Alt 217 | Schwarze Federn peitschen durch die Luft! | Prüfung offen |
| Alt 218 | Schlafentzug | Prüfung offen |
| Alt 218 | Mura singt ein Lied, das keinen Schlaf kennt! | Prüfung offen |
| Alt 219 | Nachtschrei | Prüfung offen |
| Alt 219 | Ein Schrei wie aus einem Traum, der keiner sein darf! | Prüfung offen |
| Alt 222 | Über dieser Insel ist es immer dämmrig, egal wie hell das Meer ringsum leuchtet. | Prüfung offen |
| Alt 223 | Ein Vogel mit viel zu vielen Augen im Gefieder kreist über dem Strand. | Prüfung offen |
| Alt 224 | MURA, DIE ALBDROSSEL, stürzt herab — sie will, dass du endlich ihre Melodie lernst! | Prüfung offen |
| Alt 227 | Du hörst dem Lied zu, statt es zu übertönen. Es hat eine sehr traurige zweite Stimme. | Prüfung offen |
| Alt 228 | Muras Augen blinzeln nacheinander. Keines davon hat je richtig geschlafen. | Prüfung offen |
| Alt 229 | Du summst eine Gegenmelodie — leiser, wärmer. Der Federrhythmus gerät ins Stocken. | Prüfung offen |
| Alt 230 | Mura wird still. Vielleicht wollte sie nie wecken — nur nicht allein wach sein. | Prüfung offen |
| Alt 232 | Muras Gefieder verliert seine Augen, eines nach dem anderen, wie Lichter beim Einschlafen. | Prüfung offen |
| Alt 233 | Mura setzt sich auf einen Mast und singt fortan nur noch Schlaflieder — für sich selbst. | Prüfung offen |
| Alt 234 | Wiederkehrende Albträume gehören zum Wiedererleben. Imagination Rehearsal (das bewusste Umschreiben des Traumendes) und feste Abendrituale sind erforschte, wirksame Gegenweisen. | Prüfung offen |
| Alt 250 | Argwohn-Blitz | Prüfung offen |
| Alt 250 | Der Wächter scannt dich — und findet überall Gefahr! | Prüfung offen |
| Alt 251 | Schrecksalve | Prüfung offen |
| Alt 251 | Erschrecken als Dauerzustand, komprimiert in einen Schlag! | Prüfung offen |
| Alt 252 | Daueralarm | Prüfung offen |
| Alt 252 | Sirenen, die nur du hören kannst, werden lauter! | Prüfung offen |
| Alt 255 | Jeder Stein auf dieser Insel ist nach außen gedreht, als würde die Insel selbst lauschen. | Prüfung offen |
| Alt 256 | Ein kristallener Wächter dreht sich blitzschnell zu dir um. Zu schnell. Immer zu schnell. | Prüfung offen |
| Alt 257 | DER HYPERVIGILANZ-WÄCHTER hält dich für die Gefahr, auf die er seit Jahren wartet! | Prüfung offen |
| Alt 260 | Du machst keine plötzlichen Bewegungen. Der Wächter bemerkt das sofort — natürlich. | Prüfung offen |
| Alt 261 | Du zeigst ihm den ruhigen Horizont: „Da ist nichts. Schau selbst.“ Er schaut. Zum ersten Mal. | Prüfung offen |
| Alt 262 | Seine Facetten werden weicher. Wachsamkeit war einmal sein Auftrag, nicht seine Natur. | Prüfung offen |
| Alt 263 | Der Wächter senkt den Blick. Er ist so müde. Er durfte nur nie müde sein. | Prüfung offen |
| Alt 265 | Der Wächter erstarrt zu einer ruhigen Säule — endlich nur noch Stein, nicht mehr Alarm. | Prüfung offen |
| Alt 266 | Der Wächter wird zum Leuchtturm: Er wacht weiter, aber nun übers Meer — nicht mehr über dich. | Prüfung offen |
| Alt 267 | Hypervigilanz ist ein Dauerzustand des sympathischen Nervensystems: Der Körper lebt im Kampf-oder-Flucht-Modus, obwohl die Gefahr vorbei ist. Keine Schwäche — eine überlebensnotwendige Reaktion, die nicht abgeschaltet wurde. | Prüfung offen |
| Alt 283 | Galopp | Prüfung offen |
| Alt 283 | Trommeln in der Brust, immer schneller! | Prüfung offen |
| Alt 284 | Engegriff | Prüfung offen |
| Alt 284 | Eine unsichtbare Hand drückt auf die Brust! | Prüfung offen |
| Alt 285 | Flatterpuls | Prüfung offen |
| Alt 285 | Der Rhythmus verliert den Takt! | Prüfung offen |
| Alt 288 | Der Boden dieser Insel vibriert in einem Takt, der kein guter Takt ist. | Prüfung offen |
| Alt 289 | Etwas Rotes, Flatterndes schießt zwischen den Felsen hindurch — viel zu schnell fürs Auge. | Prüfung offen |
| Alt 290 | DAS HERZRASEN stellt sich dir in den Weg und pocht dich an wie eine fremde Tür! | Prüfung offen |
| Alt 293 | Du legst die Hand auf die eigene Brust und zählst mit. Es wird langsamer, weil du mitzählst. | Prüfung offen |
| Alt 294 | Du atmest lang aus — und das Herzrasen atmet zum ersten Mal in seinem Leben mit. | Prüfung offen |
| Alt 295 | Es ist gar nicht böse. Es ist ein Botenjunge, der nie gelernt hat, langsam zu gehen. | Prüfung offen |
| Alt 296 | Das Pochen wird zu einem gleichmäßigen Schritt. Es geht dir jetzt einfach hinterher. | Prüfung offen |
| Alt 298 | Das Herzrasen verliert den Takt, findet deinen — und marschiert friedlich aus der Brust. | Prüfung offen |
| Alt 299 | Es wird dein treues Trommelchen: Es schlägt nur noch Alarm, wenn wirklich einer nötig ist. | Prüfung offen |
| Alt 300 | Herzrasen, Atemnot und Enge ohne organischen Befund sind vegetative Alarmzeichen. Verlängertes Ausatmen aktiviert den Vagusnerv und drosselt den Sympathikus binnen Sekunden bis Minuten. | Prüfung offen |
| Alt 316 | Nebelwand | Prüfung offen |
| Alt 316 | Eine Wand aus „lieber nicht“ zieht hoch! | Prüfung offen |
| Alt 317 | Ablenkung | Prüfung offen |
| Alt 317 | Plötzlich ist alles andere schrecklich wichtig! | Prüfung offen |
| Alt 318 | Ausweichschritt | Prüfung offen |
| Alt 318 | Vermeidia ist nie dort, wo du gerade hinschaust! | Prüfung offen |
| Alt 321 | Die Insel liegt im Nebel — obwohl rundherum keine Wolke am Himmel hängt. | Prüfung offen |
| Alt 322 | Jeder Weg hier biegt kurz vor dem Ziel ab. Alle Wegweiser zeigen auf „später“. | Prüfung offen |
| Alt 323 | VERMEIDIA gleitet aus dem Nebel: „Müssen wir das JETZT besprechen?“, fragt sie eisig! | Prüfung offen |
| Alt 326 | Du gehst einen Schritt auf den Nebel zu, nur einen. Er weicht zurück, aber höflich. | Prüfung offen |
| Alt 327 | Du sagst: „Du hast mich lange beschützt.“ Vermeidia hält inne. Das sagt ihr nie jemand. | Prüfung offen |
| Alt 328 | Ihre Umwege waren früher Abkürzungen zum Überleben. Das würdigst du laut. | Prüfung offen |
| Alt 329 | Vermeidia öffnet einen schmalen, geraden Pfad. „Nur ein Stück“, sagt sie. „Aber ehrlich.“ | Prüfung offen |
| Alt 331 | Der Nebel lichtet sich zu einem klaren, geraden Weg mitten durch die Insel. | Prüfung offen |
| Alt 332 | Vermeidia wird deine Wegweiserin: Sie zeigt dir nun die dosierten Schritte statt der Umwege. | Prüfung offen |
| Alt 333 | Vermeidung ist der Versuch, das Unverarbeitete fernzuhalten — kurzfristig wirksam, langfristig hält sie das Alarmgeschehen am Leben. Dosierter, begleiteter Kontakt statt Konfrontation ist der therapeutische Mittelweg. | Prüfung offen |
| Alt 349 | Teppichkehrer | Prüfung offen |
| Alt 349 | Ein riesiger Besen fegt deine Gedanken vom Tisch! | Prüfung offen |
| Alt 350 | Schubladenknall | Prüfung offen |
| Alt 350 | Etwas Wichtiges wird laut zugeschoben! | Prüfung offen |
| Alt 351 | Bergungsstau | Prüfung offen |
| Alt 351 | Alles Untergeschobene wackelt bedenklich! | Prüfung offen |
| Alt 354 | Diese Insel ist übersät mit Hügeln, die keine Hügel sind. Sie atmen. | Prüfung offen |
| Alt 355 | Ein massiger Geselle mit Besen und Schlüsselbund stapft über die Buckel. | Prüfung offen |
| Alt 356 | DER VERDRÄNGER brummt: „Hier ist NICHTS. War noch nie was. Geh weiter!“ | Prüfung offen |
| Alt 359 | Du setzt dich auf einen der Hügel und sagst: „Ich weiß, was darunter liegt. Es ist okay.“ | Prüfung offen |
| Alt 360 | Der Verdränger sinkt neben dir auf die Knie. Der Besen ist so schwer nach all den Jahren. | Prüfung offen |
| Alt 361 | Du hilfst ihm, eine einzige Schublade zu öffnen — nur eine. Drinnen: ein Kinderfoto. | Prüfung offen |
| Alt 362 | Er weint Staub. Unter dem Teppich war nie Müll. Es waren Schätze, die Angst hatten. | Prüfung offen |
| Alt 364 | Die Hügel der Insel flachen ab und werden zu offenen, lesbaren Feldern. | Prüfung offen |
| Alt 365 | Der Verdränger hängt den Besen an den Nagel und wird Archivar deiner eigenen Geschichte. | Prüfung offen |
| Alt 366 | Verdrängung schafft kurzfristig Erleichterung, bindet aber dauerhaft Kraft. Erinnerungslücken und Gefühlsabstumpfung sind die Kehrseite. Traumatherapie öffnet die „Schubladen“ dosiert und in sicherem Rahmen. | Prüfung offen |
| Alt 382 | Entrückung | Prüfung offen |
| Alt 382 | Die Welt rückt einen Schritt nach links — ohne dich! | Prüfung offen |
| Alt 383 | Glasscheibe | Prüfung offen |
| Alt 383 | Zwischen dir und allem zieht sich eine Scheibe hoch! | Prüfung offen |
| Alt 384 | Neben-sich-Stehen | Prüfung offen |
| Alt 384 | Du siehst dich selbst von außen — ein unguter Blickwinkel! | Prüfung offen |
| Alt 387 | Die Insel sieht aus wie durch eine Fensterscheibe: nah und trotzdem unerreichbar. | Prüfung offen |
| Alt 388 | Eine Gestalt schwebt über dem Boden, halb hier, halb im eigenen Schatten. | Prüfung offen |
| Alt 389 | DISSOZIA flüstert: „Wer nicht ganz da ist, kann nicht ganz getroffen werden …“ | Prüfung offen |
| Alt 392 | Du stampfst mit den Füßen auf. Der Boden ist echt. Dissozia zuckt zusammen — erstaunt. | Prüfung offen |
| Alt 393 | Du reibst die Hände warm und sagst deinen Namen laut. Ihr Glas bekommt einen Kratzer. | Prüfung offen |
| Alt 394 | „Du hast mich durch Unsagbares getragen“, sagst du zu ihr. „Danke. Du darfst ruhen.“ | Prüfung offen |
| Alt 395 | Die Scheibe wird zu einem Fenster, das man öffnen kann. Frische Luft strömt herein. | Prüfung offen |
| Alt 397 | Das Glas der Insel zerfließt zu klarem Wasser und versickert im Sand. | Prüfung offen |
| Alt 398 | Dissozia wird deine Luftschleuse: Sie öffnet sich nur noch, wenn DU es brauchst — nie mehr gegen dich. | Prüfung offen |
| Alt 399 | Dissoziation ist die Notbremse des dorsalen Vagus: Wenn Widerstand zwecklos war, schaltet das Nervensystem ab — Erstarrung, Unwirklichkeit, „weg sein“. Aktivierung (Bewegung, Wärme, Stimme, Co-Regulation) führt sanft zurück. | Prüfung offen |
| Alt 415 | Eishauch | Prüfung offen |
| Alt 415 | Kälte kriecht in die Glieder — Bewegung wird zur Theorie! | Prüfung offen |
| Alt 416 | Lähmung | Prüfung offen |
| Alt 416 | Die Beine vergessen kurz, wie Beine gehen! | Prüfung offen |
| Alt 417 | Stillekrampf | Prüfung offen |
| Alt 417 | Eine Stille, die festhält wie Beton! | Prüfung offen |
| Alt 420 | Auf dieser Insel bewegt sich nichts — selbst das Gras steht still wie gemalt. | Prüfung offen |
| Alt 421 | In der Mitte: eine eisige Figur, angespannt wie ein gespannter Bogen ohne Pfeil. | Prüfung offen |
| Alt 422 | ERSTARRION löst ein Auge aus dem Frost und starrt dich an: „Lauf. Solange du noch … oh.“ | Prüfung offen |
| Alt 425 | Du bleibst in seiner Nähe, ohne etwas zu fordern. Erstarrung hasst Forderungen. | Prüfung offen |
| Alt 426 | Du wackelst mit den Zehen, dann den Fingern. Erstarrion beobachtet es wie ein Wunder. | Prüfung offen |
| Alt 427 | „Erstarren war deine letzte Verteidigung“, sagst du. „Es hat funktioniert. Du hast überlebt.“ | Prüfung offen |
| Alt 428 | Tautropfen fallen. Der Bogen ohne Pfeil entspannt sich zum ersten Mal seit Jahrzehnten. | Prüfung offen |
| Alt 430 | Das Eis der Insel bricht nicht — es taut von innen, leise, wie ein langer Atemzug. | Prüfung offen |
| Alt 431 | Erstarrion wird ein warmer Stein in deiner Tasche: Er mahnt Pausen an, statt sie zu erzwingen. | Prüfung offen |
| Alt 432 | Erstarrung (Freeze) ist eine Schutzreaktion des Nervensystems, keine Entscheidung und kein Versagen. Sanfte Aktivierung — Zehen wackeln, Wärme, Orientierung — durchbewegt den Shutdown in kleinen, sicheren Dosen. | Prüfung offen |
| Alt 448 | Wertlos-Fluch | Prüfung offen |
| Alt 448 | „Du bist kaputt“, hallt es — in DEINER eigenen Stimme! | Prüfung offen |
| Alt 449 | Schuldstein | Prüfung offen |
| Alt 449 | Ein Stein mit deinem Namen drauf trifft dich! | Prüfung offen |
| Alt 450 | Blickdruck | Prüfung offen |
| Alt 450 | Du fühlst dich plötzlich überall zu viel und zu wenig! | Prüfung offen |
| Alt 453 | Die Mauern dieser Insel bestehen aus Sätzen. Alle sind falsch. Alle klingen vertraut. | Prüfung offen |
| Alt 454 | Ein Golem aus grauen Ziegeln wuchtet sich auf, jeder Stein ein Urteil über dich. | Prüfung offen |
| Alt 455 | DER SCHAM-GOLEM donnert: „WER HAT DIR ERLAUBT, HIER ZU SEIN?!“ | Prüfung offen |
| Alt 458 | Du liest einen der Steine laut vor. Es ist die Stimme von jemand anderem. Nie deine gewesen. | Prüfung offen |
| Alt 459 | „Das ist nicht meine Schuld“, sagst du. Ein Stein fällt aus der Mauer. Der Golem taumelt. | Prüfung offen |
| Alt 460 | Du nimmst einen Stein in die Hand und schreibst ihn um: „Es geschah mir. Es bin nicht ich.“ | Prüfung offen |
| Alt 461 | Der Golem steht still. Unter den Ziegeln schlägt etwas Warmes, das nie aufgehört hat zu hoffen. | Prüfung offen |
| Alt 463 | Die Mauer bröckelt zu einer offenen Arena — mit Platz für dich, genau wie du bist. | Prüfung offen |
| Alt 464 | Der Golem baut sich zu einer Bank um. Auf ihr sitzt du fortan, wenn alte Stimmen lügen. | Prüfung offen |
| Alt 465 | Chronische Scham und das Gefühl, „kaputt“ zu sein, sind Kernsymptome komplexer Traumatisierung — keine Tatsachen. Sie sind die innere Übernahme dessen, was einem angetan wurde, und sie sind veränderbar. | Prüfung offen |
| Alt 481 | Hoffnungs-Sog | Prüfung offen |
| Alt 481 | Der Sog flüstert: „Es wird nicht besser. Nie.“ | Prüfung offen |
| Alt 482 | Taubheit | Prüfung offen |
| Alt 482 | Farben verlieren kurz ihre Namen! | Prüfung offen |
| Alt 483 | Sinnfrage | Prüfung offen |
| Alt 483 | „Wofür?“, fragt die Leere — sehr überzeugend! | Prüfung offen |
| Alt 486 | Diese Insel hat eine Mitte, aber die Mitte fehlt. Man spürt es sofort. | Prüfung offen |
| Alt 487 | Dort, wo etwas sein müsste, ist ein sanfter, endloser Nichts-Wirbel. | Prüfung offen |
| Alt 488 | DIE GROSSE LEERE sagt nichts. Das ist das Schlimmste an ihr. Noch. | Prüfung offen |
| Alt 491 | Du setzt dich an den Rand der Leere und sagst: „Ich weiß, was du warst. Du warst Gefühl.“ | Prüfung offen |
| Alt 492 | Die Leere flackert. Ganz klein: ein Funke Müdigkeit. Müdigkeit ist auch ein Gefühl. Ein Anfang. | Prüfung offen |
| Alt 493 | Du erzählst ihr von einem Moment, der einmal gut war. Sie hört zu. Löcher können zuhören. | Prüfung offen |
| Alt 494 | Die Leere wird zu einer Schale. Leer, ja — aber bereit, wieder gefüllt zu werden. | Prüfung offen |
| Alt 496 | Die Leere kollabiert zu einem Samenkorn. Du pflanzt sie ein, wo die Mitte fehlte. | Prüfung offen |
| Alt 497 | Aus der Schale wird ein Brunnen. Tief, dunkel — aber mit Wasser ganz unten. | Prüfung offen |
| Alt 498 | Anhaltende innere Leere und Hoffnungslosigkeit gehören zum negativen Selbst- und Weltbild komplexer Traumafolgen. Gefühle kehren selten auf Befehl zurück — aber über kleine Körper- und Sinneserfahrungen, dosiert und begleitet. | Prüfung offen |
| Alt 514 | Distanzschild | Prüfung offen |
| Alt 514 | Eine unsichtbare Mauer aus „Komm mir nicht zu nah“! | Prüfung offen |
| Alt 515 | Argwohnbiss | Prüfung offen |
| Alt 515 | Misstrania beißt zu — bevor du es tun kannst! | Prüfung offen |
| Alt 516 | Hintergedanken | Prüfung offen |
| Alt 516 | „Was willst du WIRKLICH?“, zischt es aus allen Richtungen! | Prüfung offen |
| Alt 519 | Das Riff ist voller Fallen, Netze und zweiter Böden. Sehr gute Handwerksarbeit, leider. | Prüfung offen |
| Alt 520 | Etwas schießt unter der Wasseroberfläche hin und her — es hält dich für einen Köder. | Prüfung offen |
| Alt 521 | MISTRANIA springt aus dem Wasser: „Nettes Schiff. WARUM sollte ich dir glauben?!“ | Prüfung offen |
| Alt 524 | Du wirfst den Anker sichtbar und machst zwei Schritte zurück. Misstrania prüft den Anker. Zweimal. | Prüfung offen |
| Alt 525 | „Vertrauen war einmal gefährlich für dich“, sagst du. „Das war klug von dir.“ Sie wird still. | Prüfung offen |
| Alt 526 | Du versprichst nichts Großes. Nur: „Ich komme morgen wieder.“ Klein genug, um wahr zu sein. | Prüfung offen |
| Alt 527 | Misstrania nickt einmal, knapp. Das ist bei ihr ein Freundschaftsvertrag mit Siegel. | Prüfung offen |
| Alt 529 | Die Fallen des Riffs klappen zu und werden zu Brücken über das flache Wasser. | Prüfung offen |
| Alt 530 | Misstrania schwimmt fortan als Lotsenfisch neben deinem Schiff — wachsam, aber auf DEINER Seite. | Prüfung offen |
| Alt 531 | Trauma ist ein Beziehungserlebnis — Heilung auch. Wer in Beziehungen verletzt wurde, braucht Erfahrungen von Sicherheit in Beziehung (Co-Regulation), um zu heilen. Bindungsorientierte Verfahren setzen genau hier an. | Prüfung offen |
| Alt 547 | Klammergriff | Prüfung offen |
| Alt 547 | Das Phantom hält dich fest — viel, viel zu fest! | Prüfung offen |
| Alt 548 | Rückzugswelle | Prüfung offen |
| Alt 548 | Es stößt dich weg — und weint dabei! | Prüfung offen |
| Alt 549 | Wechselbad | Prüfung offen |
| Alt 549 | Erst zu nah, dann zu fern — dein Kompass dreht durch! | Prüfung offen |
| Alt 552 | Auf dieser Insel wechseln Ebbe und Flut im Sekundentakt. Niemand weiß, wo man stehen soll. | Prüfung offen |
| Alt 553 | Ein durchscheinendes Wesen winkt dich heran — und verscheucht dich im selben Atemzug. | Prüfung offen |
| Alt 554 | DAS NÄHE-PHANTOM schluchzt: „Bleib!“ und „Verschwinde!“ — gleichzeitig, aus tiefstem Herzen! | Prüfung offen |
| Alt 557 | Du bleibst auf gleichem Abstand stehen. Nicht näher. Nicht weiter. Das Phantom staunt. | Prüfung offen |
| Alt 558 | „Nähe hat dich einmal verletzt — und Ferne auch“, sagst du. Beide Gesichter nicken. | Prüfung offen |
| Alt 559 | Du zeigst ihm, dass ein Abstand bleiben darf, ohne dass jemand geht. Eine neue Erfahrung. | Prüfung offen |
| Alt 560 | Das Phantom atmet aus. Zum ersten Mal hält es einen Mittelweg aus — eine ganze Minute. | Prüfung offen |
| Alt 562 | Ebbe und Flut der Insel finden in einen ruhigen, menschlichen Rhythmus. | Prüfung offen |
| Alt 563 | Das Phantom wird zu einer Laterne am Hafen: nah genug zum Wärmen, fern genug zum Atmen. | Prüfung offen |
| Alt 564 | Der Wechsel aus Klammern und Rückzug ist ein klassisches Muster nach Bindungstraumata: Nähe ist Sehnsucht und Bedrohung zugleich. Sichere Bindung entsteht durch verlässliche, dosierte Nähe-Erfahrungen — nicht durch Entscheidung. | Prüfung offen |
| Alt 581 | Alles auf einmal | Prüfung offen |
| Alt 581 | Alle Wetter gleichzeitig stürzen auf dich ein! | Prüfung offen |
| Alt 582 | Das ungesagte Wort | Prüfung offen |
| Alt 582 | Ein Satz ohne Anfang trifft dich mitten ins Jetzt! | Prüfung offen |
| Alt 583 | Sturmtriade | Prüfung offen |
| Alt 583 | Blitz, Stille und Erinnerung — in genau dieser Reihenfolge! | Prüfung offen |
| Alt 584 | Kartenriss | Prüfung offen |
| Alt 584 | Der Sturm zerreißt deine Karte! Zum Glück kennst du den Weg längst! | Prüfung offen |
| Alt 587 | Das Auge des Sturms. Alle zwölf Inseln sind von hier aus zu sehen — ruhig, bewohnbar, deine. | Prüfung offen |
| Alt 588 | In der Mitte dreht sich ein Wirbel aus allem, was nie gesagt, nie geweint, nie erzählt wurde. | Prüfung offen |
| Alt 589 | DER STURMHERD spricht mit allen Stimmen zugleich: „DU HAST SIE ALLE ÜBERWUNDEN. ABER MICH HAST DU NUR UMSCHIFFT.“ | Prüfung offen |
| Alt 592 | Du erzählst dem Sturm eine einzige wahre Geschichte — deine. Er wird langsamer, um zuzuhören. | Prüfung offen |
| Alt 593 | „Du bist kein Unwetter“, sagst du. „Du bist ein Brief, der nie geöffnet wurde.“ Der Wind stockt. | Prüfung offen |
| Alt 594 | Du nennst die Dinge beim Namen. Jedes benannte Ding verliert ein Stück Wirbel. | Prüfung offen |
| Alt 595 | Der Sturm wird kleiner und kleiner, bis er in deine beiden Hände passt. Er ist warm. | Prüfung offen |
| Alt 597 | Der Sturmherd löst sich auf — nicht in Nichts, sondern in Wetter. Normales, ehrliches Wetter. | Prüfung offen |
| Alt 598 | Der Sturm legt sich als ruhiger Kreis um deine Inseln: ein Horizont, der nun dir gehört. | Prüfung offen |
| Alt 599 | Hinter allen einzelnen Phänomenen liegt oft das Unerzählte: die Geschichte selbst, die nie Zeugen, Worte oder Trauer fand. Sie zu erzählen — in sicherem Rahmen, mit Begleitung — ist der Kern jeder Traumatherapie. | Prüfung offen |
| Alt 615 | Sehr wirksam! | Prüfung offen |
| Alt 616 | Kaum wirksam … | Prüfung offen |
| Alt 621 | Übererregt | Prüfung offen |
| Alt 622 | Untererregt | Prüfung offen |
| Alt 623 | Pendelnd | Prüfung offen |
| Alt 646 | Es gibt ein Meer, das auf keiner Seekarte steht. | Prüfung offen |
| Alt 647 | Es besteht aus allem, was Menschen erlebt und überlebt haben. | Prüfung offen |
| Alt 648 | Auf diesem Meer liegen Inseln — Phänomene, die einen nachts wachhalten, | Prüfung offen |
| Alt 649 | die den Atem stehlen, die einen zu Glas machen. | Prüfung offen |
| Alt 651 | Du bist Phänomenaut*in. Dein Schiff heißt TOLERANZ. | Prüfung offen |
| Alt 652 | Dein Kompass ist dein Nervensystem. Deine Waffen sind Übungen, | Prüfung offen |
| Alt 653 | die älter sind als jede Karte: Atmen. Erden. Zuhören. | Prüfung offen |
| Alt 655 | Steuere die Inseln an. Begegne den Phänomenen. | Prüfung offen |
| Alt 656 | Überwinde sie — oder verstehe sie, was mehr ist. | Prüfung offen |
| Alt 658 | Das Meer wartet. Es war schließlich die ganze Zeit deins. | Prüfung offen |
| Alt 662 | Phänomenautik ist ein Spiel auf Basis des TRAUMAATLAS und ersetzt keine Psychotherapie. Bei akuten Krisen: Telefonseelsorge 0800 111 0 111 / 0800 111 0 222 (kostenfrei, rund um die Uhr) oder 112. | Prüfung offen |
| Neu 66 | Freiwillige Idee: etwas im Raum wahrnehmen, das angenehm oder neutral ist. Du kannst die Spielaktion wählen, ohne sie körperlich auszuführen. | Prüfung offen |
| Neu 75 | Freiwillige Idee: den eigenen Atem bemerken, ohne ihn zu verändern. Atemvorgaben sind für diese Spielaktion nicht nötig. | Prüfung offen |
| Neu 84 | Freiwillige Idee: einen leisen Ton hören oder summen, wenn das angenehm ist. Schweigen und Überspringen sind gleichwertige Möglichkeiten. | Prüfung offen |
| Neu 88 | Kleine Bewegung | Prüfung offen |
| Neu 93 | Freiwillige Idee: eine kleine Bewegung wählen, wenn sie angenehm ist. Zittern muss weder ausgelöst noch verstärkt werden. | Prüfung offen |
| Neu 97 | Orientierung wählen | Prüfung offen |
| Neu 102 | Freiwillige Idee: einen Gegenstand im Raum betrachten oder sich etwas bewegen. Es gibt keine Pflicht zu Aktivierung. | Prüfung offen |
| Neu 106 | Gegenstand benennen | Prüfung offen |
| Neu 111 | Freiwillige Idee: einen gut sichtbaren Gegenstand benennen. Du kannst auch nur die fiktive Szene lesen. | Prüfung offen |
| Neu 120 | Freiwillige Idee: die Aufmerksamkeit kurz auf etwas Neutrales richten. Belastende Empfindungen müssen dafür nicht aufgesucht werden. | Prüfung offen |
| Neu 130 | Freiwillige Idee: etwas Angenehmes oder Neutrales bemerken. Nach innen zu schauen ist keine Voraussetzung. | Prüfung offen |
| Neu 134 | Selbst gewählter Ort | Prüfung offen |
| Neu 139 | Ein selbst gewählter, realer oder erfundener Ort kann als Bild dienen. Du musst dir keinen vollkommen sicheren Ort vorstellen. | Prüfung offen |
| Neu 143 | Berührung wählen | Prüfung offen |
| Neu 148 | Freiwillige Idee: eine angenehme Berührung wählen. Berührung und Kontakt mit dem eigenen Körper können ausgelassen werden. | Prüfung offen |
| Neu 157 | Freiwillige Idee: Kontakt zu einem selbst gewählten Menschen suchen. Die Spielaktion verlangt keinen Kontakt und verspricht keine Wirkung. | Prüfung offen |
| Neu 162 | Eine Ressource für die Spielfigur. Trinken ist für die Spielaktion nicht erforderlich. | Prüfung offen |
| Neu 163 | Eine Karte als Spielressource; sie ersetzt keinen selbst vereinbarten Unterstützungsplan. | Prüfung offen |
| Neu 164 | Erhöht den Spielwert Präsenz um 14. | Prüfung offen |
| Neu 184 | Windbogen | Prüfung offen |
| Neu 184 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 185 | Lichtwechsel | Prüfung offen |
| Neu 185 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 186 | Wellenzug | Prüfung offen |
| Neu 186 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 189 | Auf dem Riff stehen Bilderrahmen im Wind. Ein Falter trägt schimmernde Papierflügel. | Prüfung offen |
| Neu 190 | Die Bilder gehören zur erfundenen Inselgeschichte. Du bestimmst, wie nah die Spielfigur kommt. | Prüfung offen |
| Neu 191 | Ein Rahmen zeigt den heutigen Hafen, ein anderer eine alte Seekarte. | Prüfung offen |
| Neu 194 | Die Bilder gehören zur erfundenen Inselgeschichte. Du bestimmst, wie nah die Spielfigur kommt. | Prüfung offen |
| Neu 195 | Die Spielfigur betrachtet einen Teil der Landschaft. Abstand halten bleibt möglich. | Prüfung offen |
| Neu 196 | Die Szene wartet auf deine Wahl. Ein Abschluss oder Rückzug ist jederzeit möglich. | Prüfung offen |
| Neu 198 | Der Falter legt ein Papierbild auf einen Stein. | Prüfung offen |
| Neu 199 | Der Falter lässt der Spielfigur Platz auf dem Weg. | Prüfung offen |
| Neu 200 | Die Szene verwendet wechselnde Bilder als Metapher für Wiedererleben. Sie erklärt keine Erinnerungen der spielenden Person. | Prüfung offen |
| Neu 216 | Windbogen | Prüfung offen |
| Neu 216 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 217 | Lichtwechsel | Prüfung offen |
| Neu 217 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 218 | Wellenzug | Prüfung offen |
| Neu 218 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 221 | Über der dämmernden Insel kreist Mura, ein Vogel mit gemustertem Gefieder. | Prüfung offen |
| Neu 222 | Sein Lied verändert die Farben des Himmels. | Prüfung offen |
| Neu 223 | Die Spielfigur kann zuhören, Abstand halten oder den Weg zurück wählen. | Prüfung offen |
| Neu 226 | Sein Lied verändert die Farben des Himmels. | Prüfung offen |
| Neu 227 | Die Spielfigur betrachtet einen Teil der Landschaft. Abstand halten bleibt möglich. | Prüfung offen |
| Neu 228 | Die Szene wartet auf deine Wahl. Ein Abschluss oder Rückzug ist jederzeit möglich. | Prüfung offen |
| Neu 230 | Mura zieht weiter; sein Lied bleibt am Horizont. | Prüfung offen |
| Neu 231 | Mura setzt sich auf einen entfernten Mast. | Prüfung offen |
| Neu 232 | Die Trauminsel erzählt eine erfundene Geschichte. Ein anderes Ende lässt sich im Spiel wählen; das ist kein Behandlungsversprechen. | Prüfung offen |
| Neu 248 | Windbogen | Prüfung offen |
| Neu 248 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 249 | Lichtwechsel | Prüfung offen |
| Neu 249 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 250 | Wellenzug | Prüfung offen |
| Neu 250 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 253 | Ein kristallener Wächter steht zwischen den Felsen und dreht sein Licht über die Bucht. | Prüfung offen |
| Neu 254 | Der Weg hat mehrere Abzweigungen. Keine davon ist vorgeschrieben. | Prüfung offen |
| Neu 255 | Die Spielfigur betrachtet das Licht aus selbst gewähltem Abstand. | Prüfung offen |
| Neu 258 | Der Weg hat mehrere Abzweigungen. Keine davon ist vorgeschrieben. | Prüfung offen |
| Neu 259 | Die Spielfigur betrachtet einen Teil der Landschaft. Abstand halten bleibt möglich. | Prüfung offen |
| Neu 260 | Die Szene wartet auf deine Wahl. Ein Abschluss oder Rückzug ist jederzeit möglich. | Prüfung offen |
| Neu 262 | Der Wächter richtet sein Licht auf die äußere Bucht. | Prüfung offen |
| Neu 263 | Neben dem Wächter bleibt ein Weg offen. | Prüfung offen |
| Neu 264 | Der Wächter ist eine Metapher für Wachsamkeit. Seine Spielwerte sagen nichts über Gefahr oder Wachsamkeit im Leben der spielenden Person aus. | Prüfung offen |
| Neu 280 | Windbogen | Prüfung offen |
| Neu 280 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 281 | Lichtwechsel | Prüfung offen |
| Neu 281 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 282 | Wellenzug | Prüfung offen |
| Neu 282 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 285 | Ein rotes Trommelwesen springt über die Steine des Atolls. | Prüfung offen |
| Neu 286 | Sein Rhythmus ist Teil der erfundenen Kulisse. | Prüfung offen |
| Neu 287 | Die Spielfigur kann dem Rhythmus folgen oder ihn aus der Ferne betrachten. | Prüfung offen |
| Neu 290 | Sein Rhythmus ist Teil der erfundenen Kulisse. | Prüfung offen |
| Neu 291 | Die Spielfigur betrachtet einen Teil der Landschaft. Abstand halten bleibt möglich. | Prüfung offen |
| Neu 292 | Die Szene wartet auf deine Wahl. Ein Abschluss oder Rückzug ist jederzeit möglich. | Prüfung offen |
| Neu 294 | Das Trommelwesen hüpft hinter einen Felsen. | Prüfung offen |
| Neu 295 | Zwischen den Schlägen entsteht in der Szene eine Pause. | Prüfung offen |
| Neu 296 | Das Trommelwesen stellt einen Spielrhythmus dar. Herzrasen oder Atemnot lassen sich hier weder beurteilen noch körperlich behandeln. | Prüfung offen |
| Neu 312 | Windbogen | Prüfung offen |
| Neu 312 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 313 | Lichtwechsel | Prüfung offen |
| Neu 313 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 314 | Wellenzug | Prüfung offen |
| Neu 314 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 317 | Nebel liegt über Wegweisern, die in verschiedene Richtungen zeigen. | Prüfung offen |
| Neu 318 | Vermeidia zeichnet einen weiteren Pfad in den Sand. | Prüfung offen |
| Neu 319 | Die Spielfigur darf einen Umweg, einen kurzen Weg oder den Rückweg wählen. | Prüfung offen |
| Neu 322 | Vermeidia zeichnet einen weiteren Pfad in den Sand. | Prüfung offen |
| Neu 323 | Die Spielfigur betrachtet einen Teil der Landschaft. Abstand halten bleibt möglich. | Prüfung offen |
| Neu 324 | Die Szene wartet auf deine Wahl. Ein Abschluss oder Rückzug ist jederzeit möglich. | Prüfung offen |
| Neu 326 | Zwischen zwei Wegweisern wird der Sand sichtbar. | Prüfung offen |
| Neu 327 | Vermeidia hält mehrere Wege offen. | Prüfung offen |
| Neu 328 | Die Insel zeigt Entscheidungen über Nähe und Abstand. Kein gewählter Weg beweist Mut, Versagen oder ein persönliches Vermeidungsmuster. | Prüfung offen |
| Neu 344 | Windbogen | Prüfung offen |
| Neu 344 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 345 | Lichtwechsel | Prüfung offen |
| Neu 345 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 346 | Wellenzug | Prüfung offen |
| Neu 346 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 349 | Zwischen geschlossenen Kisten fegt eine Gestalt goldenen Staub zusammen. | Prüfung offen |
| Neu 350 | Auf den Kisten stehen erfundene Ortsnamen. | Prüfung offen |
| Neu 351 | Keine Kiste muss geöffnet werden; die Szene verlangt keine Suche nach eigenen Erinnerungen. | Prüfung offen |
| Neu 354 | Auf den Kisten stehen erfundene Ortsnamen. | Prüfung offen |
| Neu 355 | Die Spielfigur betrachtet einen Teil der Landschaft. Abstand halten bleibt möglich. | Prüfung offen |
| Neu 356 | Die Szene wartet auf deine Wahl. Ein Abschluss oder Rückzug ist jederzeit möglich. | Prüfung offen |
| Neu 358 | Der Besen lehnt neben einer geschlossenen Kiste. | Prüfung offen |
| Neu 359 | Die Gestalt setzt sich auf die Bank und lässt die Kisten stehen. | Prüfung offen |
| Neu 360 | Die geschlossenen Kisten sind ein erzählerisches Bild. Das Spiel kann keine verborgenen Erinnerungen erschließen oder bestätigen. | Prüfung offen |
| Neu 376 | Windbogen | Prüfung offen |
| Neu 376 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 377 | Lichtwechsel | Prüfung offen |
| Neu 377 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 378 | Wellenzug | Prüfung offen |
| Neu 378 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 381 | Gläserne Bögen stehen über einem hellen Strand. Dahinter bewegt sich Dissozia. | Prüfung offen |
| Neu 382 | Die Glasgeistin bleibt Teil dieser erfundenen Landschaft. | Prüfung offen |
| Neu 383 | Die Spielfigur kann die Bögen betrachten, ohne sie zu durchqueren. | Prüfung offen |
| Neu 386 | Die Glasgeistin bleibt Teil dieser erfundenen Landschaft. | Prüfung offen |
| Neu 387 | Die Spielfigur betrachtet einen Teil der Landschaft. Abstand halten bleibt möglich. | Prüfung offen |
| Neu 388 | Die Szene wartet auf deine Wahl. Ein Abschluss oder Rückzug ist jederzeit möglich. | Prüfung offen |
| Neu 390 | Ein Bogen spiegelt jetzt das Wasser. | Prüfung offen |
| Neu 391 | Dissozia zeigt einen Weg um das Glas herum. | Prüfung offen |
| Neu 392 | Die Glaswelt nutzt Distanz als Metapher. Aus Spielentscheidungen werden keine Aussagen über Dissoziation oder die eigene Verfassung abgeleitet. | Prüfung offen |
| Neu 408 | Windbogen | Prüfung offen |
| Neu 408 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 409 | Lichtwechsel | Prüfung offen |
| Neu 409 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 410 | Wellenzug | Prüfung offen |
| Neu 410 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 413 | Zwischen Eisblöcken steht Erstarrion, eine langsam schimmernde Figur. | Prüfung offen |
| Neu 414 | Am Ufer sind eine Bank und ein offener Rückweg zu sehen. | Prüfung offen |
| Neu 415 | Stillzustehen ist in dieser Szene eine mögliche Wahl. | Prüfung offen |
| Neu 418 | Am Ufer sind eine Bank und ein offener Rückweg zu sehen. | Prüfung offen |
| Neu 419 | Die Spielfigur betrachtet einen Teil der Landschaft. Abstand halten bleibt möglich. | Prüfung offen |
| Neu 420 | Die Szene wartet auf deine Wahl. Ein Abschluss oder Rückzug ist jederzeit möglich. | Prüfung offen |
| Neu 422 | Ein Licht wandert über die Eisfläche. | Prüfung offen |
| Neu 423 | Erstarrion hält Abstand zur Spielfigur. | Prüfung offen |
| Neu 424 | Das Eis ist eine Metapher in einer erfundenen Szene. Bewegung und Stillstand sind hier freiwillige Spielentscheidungen, keine körperliche Aufgabe. | Prüfung offen |
| Neu 440 | Windbogen | Prüfung offen |
| Neu 440 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 441 | Lichtwechsel | Prüfung offen |
| Neu 441 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 442 | Wellenzug | Prüfung offen |
| Neu 442 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 445 | Der Golem baut eine Mauer aus Steinen mit verblassten Schriftzeichen. | Prüfung offen |
| Neu 446 | Die Schrift gehört zur Insel; sie bewertet die spielende Person nicht. | Prüfung offen |
| Neu 447 | Die Spielfigur kann die Mauer ansehen oder den freien Uferweg nehmen. | Prüfung offen |
| Neu 450 | Die Schrift gehört zur Insel; sie bewertet die spielende Person nicht. | Prüfung offen |
| Neu 451 | Die Spielfigur betrachtet einen Teil der Landschaft. Abstand halten bleibt möglich. | Prüfung offen |
| Neu 452 | Die Szene wartet auf deine Wahl. Ein Abschluss oder Rückzug ist jederzeit möglich. | Prüfung offen |
| Neu 454 | Der Golem legt seinen nächsten Stein ab. | Prüfung offen |
| Neu 455 | Neben der Mauer bleibt Platz für einen Weg. | Prüfung offen |
| Neu 456 | Die Szene verwendet eine Mauer als Bild für Scham. Sie behauptet keine Ursache und enthält keine Bewertung des eigenen Werts. | Prüfung offen |
| Neu 472 | Windbogen | Prüfung offen |
| Neu 472 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 473 | Lichtwechsel | Prüfung offen |
| Neu 473 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 474 | Wellenzug | Prüfung offen |
| Neu 474 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 477 | Eine runde Schale liegt in einer stillen Senke. Ihr Rand spiegelt den Himmel. | Prüfung offen |
| Neu 478 | Die Insel enthält viel freien Raum. | Prüfung offen |
| Neu 479 | Die Spielfigur darf bleiben, weitergehen oder die Szene schließen. | Prüfung offen |
| Neu 482 | Die Insel enthält viel freien Raum. | Prüfung offen |
| Neu 483 | Die Spielfigur betrachtet einen Teil der Landschaft. Abstand halten bleibt möglich. | Prüfung offen |
| Neu 484 | Die Szene wartet auf deine Wahl. Ein Abschluss oder Rückzug ist jederzeit möglich. | Prüfung offen |
| Neu 486 | Ein Wolkenschatten zieht über die Schale. | Prüfung offen |
| Neu 487 | Die Schale bleibt stehen; der Weg daneben ist offen. | Prüfung offen |
| Neu 488 | Freier Raum ist hier ein erzählerisches Bild. Die Szene erklärt keine Gefühlslage und verspricht keine Rückkehr bestimmter Gefühle. | Prüfung offen |
| Neu 504 | Windbogen | Prüfung offen |
| Neu 504 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 505 | Lichtwechsel | Prüfung offen |
| Neu 505 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 506 | Wellenzug | Prüfung offen |
| Neu 506 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 509 | Misstrania prüft Seile und Anker am Rand des Riffs. | Prüfung offen |
| Neu 510 | Die Spielfigur steht auf einem eigenen Steg. | Prüfung offen |
| Neu 511 | Abstand und Kontakt lassen sich in dieser Szene selbst wählen. | Prüfung offen |
| Neu 514 | Die Spielfigur steht auf einem eigenen Steg. | Prüfung offen |
| Neu 515 | Die Spielfigur betrachtet einen Teil der Landschaft. Abstand halten bleibt möglich. | Prüfung offen |
| Neu 516 | Die Szene wartet auf deine Wahl. Ein Abschluss oder Rückzug ist jederzeit möglich. | Prüfung offen |
| Neu 518 | Misstrania legt ein Seil zur Seite. | Prüfung offen |
| Neu 519 | Zwischen den Stegen bleibt ein ruhiger Abstand. | Prüfung offen |
| Neu 520 | Die Anker erzählen von Abmachungen in einer fiktiven Welt. Das Spiel beurteilt weder Vertrauen noch reale Beziehungen. | Prüfung offen |
| Neu 536 | Windbogen | Prüfung offen |
| Neu 536 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 537 | Lichtwechsel | Prüfung offen |
| Neu 537 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 538 | Wellenzug | Prüfung offen |
| Neu 538 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 541 | Das Nähe-Phantom erscheint zwischen zwei Stegen, während Wasser dazwischen fließt. | Prüfung offen |
| Neu 542 | Beide Stege besitzen einen Weg zurück zum Ufer. | Prüfung offen |
| Neu 543 | Die Spielfigur entscheidet selbst, welchen Abstand sie behalten möchte. | Prüfung offen |
| Neu 546 | Beide Stege besitzen einen Weg zurück zum Ufer. | Prüfung offen |
| Neu 547 | Die Spielfigur betrachtet einen Teil der Landschaft. Abstand halten bleibt möglich. | Prüfung offen |
| Neu 548 | Die Szene wartet auf deine Wahl. Ein Abschluss oder Rückzug ist jederzeit möglich. | Prüfung offen |
| Neu 550 | Das Phantom bleibt am anderen Steg. | Prüfung offen |
| Neu 551 | Die beiden Stege bleiben verbunden, ohne dass jemand hinübergehen muss. | Prüfung offen |
| Neu 552 | Die Szene zeigt verschiedene Abstände. Sie legt keine Bindungsdiagnose nahe und fordert keine Annäherung. | Prüfung offen |
| Neu 569 | Windbogen | Prüfung offen |
| Neu 569 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 570 | Lichtwechsel | Prüfung offen |
| Neu 570 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 571 | Wellenzug | Prüfung offen |
| Neu 571 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 572 | Wolkenkreis | Prüfung offen |
| Neu 572 | Die Landschaft verändert sich im nächsten freiwilligen Spielzug. | Prüfung offen |
| Neu 575 | In der Mitte des Meeres drehen sich helle und dunkle Wolken über einem Felsen. | Prüfung offen |
| Neu 576 | Der Sturmherd gehört zur Geschichte dieser Spielwelt. | Prüfung offen |
| Neu 577 | Auch hier bleibt der Rückweg eine vollständige Wahl. Es muss nichts Persönliches erzählt werden. | Prüfung offen |
| Neu 580 | Der Sturmherd gehört zur Geschichte dieser Spielwelt. | Prüfung offen |
| Neu 581 | Die Spielfigur betrachtet einen Teil der Landschaft. Abstand halten bleibt möglich. | Prüfung offen |
| Neu 582 | Die Szene wartet auf deine Wahl. Ein Abschluss oder Rückzug ist jederzeit möglich. | Prüfung offen |
| Neu 584 | Die Wolken geben einen Blick auf den Felsen frei. | Prüfung offen |
| Neu 585 | Am Rand des Sturmherds öffnet sich ein ruhiger Seeweg. | Prüfung offen |
| Neu 586 | Der Sturmherd bildet einen erzählerischen Abschluss. Er ist weder die Geschichte der spielenden Person noch ein Modell für Therapie. | Prüfung offen |
| Neu 602 | Höherer Spielwert | Prüfung offen |
| Neu 603 | Niedrigerer Spielwert | Prüfung offen |
| Neu 608 | Hohe Aktivität (Spieltyp) | Prüfung offen |
| Neu 609 | Niedrige Aktivität (Spieltyp) | Prüfung offen |
| Neu 610 | Wechselnde Aktivität (Spieltyp) | Prüfung offen |
| Neu 633 | Ein erfundenes Meer, Inseln und Begegnungen warten auf dieser Seekarte. | Prüfung offen |
| Neu 634 | Du kannst segeln, lesen und Abstand wählen. | Prüfung offen |
| Neu 635 | Die Figuren greifen Begriffe aus dem TRAUMAATLAS als Bilder auf. | Prüfung offen |
| Neu 636 | Diese Bilder erklären keine persönlichen Erfahrungen. | Prüfung offen |
| Neu 638 | Dein Schiff heißt TOLERANZ. Du bestimmst den Weg. | Prüfung offen |
| Neu 639 | Jede Begegnung lässt sich verlassen. | Prüfung offen |
| Neu 640 | Körperübungen und persönliche Offenlegung sind nicht erforderlich. | Prüfung offen |
| Neu 642 | Wähle eine Insel, wenn du möchtest. | Prüfung offen |
| Neu 643 | Es gibt keinen richtigen Zeitpunkt und keine Pflicht zum Abschluss. | Prüfung offen |
| Neu 645 | Der Ankerplatz bleibt erreichbar. | Prüfung offen |
| Neu 649 | Phänomenautik ist eine fiktive Erkundungs- und Reflexionswelt auf Basis des TRAUMAATLAS. Sie stellt keine Diagnose und bietet keine Behandlung. Deutschland: Bei unmittelbarer Gefahr 112. TelefonSeelsorge: 116 123, 0800 111 0 111 oder 0800 111 0 222, kostenfrei und rund um die Uhr. Bei dringenden medizinischen Anliegen außerhalb der Sprechzeiten: 116 117. | Prüfung offen |

## src/game/npc.ts

| Stand / Zeile | Wortlaut | Prüfung |
| --- | --- | --- |
| Alt 32 | Wieder da, {name}? Die See hat dich also noch nicht satt. Gut so. | Prüfung offen |
| Alt 38 | die Heilerin | Prüfung offen |
| Alt 45 | Komm näher, setz dich einen Moment. Ich bin Tove. Ich sammle Übungen, die älter sind als jede Karte — Atem, Erde, Klang. Wenn dir die See mal in die Knochen fährt, komm zu mir. | Prüfung offen |
| Alt 46 | Schön, dass du wieder an Land gehst, {name}. Wie fühlt sich dein Körper heute an? | Prüfung offen |
| Alt 47 | Was mache ich bei Panik? | Prüfung offen |
| Alt 59 | Steht du da rum oder holst du Holz? Haha — Scherz, willkommen. Kaj, Schiffbauer. Dein Kahn ist gut, aber er könnte SCHNELLER sein. Treibholz schwimmt überall da draußen, du musst es nur einsammeln. | Prüfung offen |
| Alt 60 | {name}! Schon wieder Holz im Sinn? Ich mag das an dir. | Prüfung offen |
| Alt 73 | Ah — eine Phänomenautin, ein Phänomenaut! Verzeihen Sie, ich werde selten unterbrochen. Dr. Ilse Wiegand. Ich kartografiere, was dieses Meer wirklich ist: das Nervensystem, ausgebreitet als Archipel. | Prüfung offen |
| Alt 74 | Zurück von der Forschungsreise, {name}? Berichten Sie — jede Beobachtung zählt. | Prüfung offen |
| Alt 80 | der Überlebende | Prüfung offen |
| Alt 87 | Oh — hallo. Ich bin Ben. Ich war mal da draußen, auf See. Dann hat mich … etwas eingeholt. Seitdem sitze ich hier am Feuer und schaue aufs Wasser. Es ist schön hier. Meistens. | Prüfung offen |
| Alt 88 | {name} … schön, dass du wieder da bist. Ehrlich. Es wird leiser hier, wenn jemand da ist. | Prüfung offen |
| Alt 89 | Was ist dir passiert? | Prüfung offen |
| Alt 101 | Ah — die Kapitänin persönlich. Nach unserem kleinen Geschäft handle ich nur noch ehrlich: Karten, Knoten, Seemannsgarn. Was darf es sein? | Prüfung offen |
| Alt 102 | Wieder da? Du siehst mich immer noch durch, oder? Gut so. Was brauchst du? | Prüfung offen |
| Neu 32 | Willkommen am Ankerplatz, {name}. Du bestimmst, wie lange du bleiben möchtest. | Prüfung offen |
| Neu 38 | die Übungssammlerin | Prüfung offen |
| Neu 45 | Ich bin Tove, eine Figur dieser Spielwelt. Ich sammle freiwillige Ideen für Spielaktionen. Du kannst sie lesen, auslassen oder das Gespräch schließen. | Prüfung offen |
| Neu 46 | Willkommen zurück, {name}. Möchtest du von den Spielaktionen lesen? | Prüfung offen |
| Neu 47 | Wie wird Panik im Spiel dargestellt? | Prüfung offen |
| Neu 59 | Willkommen in meiner Werkstatt. Ich bin Kaj, der Schiffbauer dieser Geschichte. Wenn du möchtest, kannst du Treibholz sammeln und einen Ausbau wählen. | Prüfung offen |
| Neu 60 | Willkommen, {name}. Die Werkbank steht bereit, wenn du einen Ausbau wählen möchtest. | Prüfung offen |
| Neu 73 | Ich bin Dr. Ilse Wiegand, eine erfundene Forscherin. Ich sortiere die Bilder dieser Seekarte. Die Inseln bilden kein Nervensystem ab und erlauben keine Untersuchung einer Person. | Prüfung offen |
| Neu 74 | Willkommen, {name}. Sie können von den erfundenen Landschaften lesen; Persönliches müssen Sie nicht berichten. | Prüfung offen |
| Neu 80 | die Figur am Feuer | Prüfung offen |
| Neu 87 | Hallo, ich bin Ben. Als Figur dieser Geschichte sitze ich gern am Feuer und schaue aufs Wasser. Meine Texte sind erfunden; ich spreche nicht für reale Betroffene. | Prüfung offen |
| Neu 88 | Willkommen am Feuer, {name}. Du kannst bleiben oder weitergehen, ohne mir etwas erzählen zu müssen. | Prüfung offen |
| Neu 89 | Was erzählt deine Spielgeschichte? | Prüfung offen |
| Neu 101 | Willkommen an meinem Stand. Ich bin Vessa, eine erfundene Händlerin. Du kannst Karten, Knoten und Seemannsgarn ansehen oder weitergehen. | Prüfung offen |
| Neu 102 | Willkommen zurück. Möchtest du etwas ansehen oder lieber weiterreisen? | Prüfung offen |

## src/game/echoes.ts

| Stand / Zeile | Wortlaut | Prüfung |
| --- | --- | --- |
| Alt 12 | Der Ankerplatz war nie ein Phänomen. Oder er wurde so oft verstanden, dass er es vergaß. | Prüfung offen |
| Alt 13 | Mara lotst die Schiffe. Tove heilt. Kaj baut. Ben wartet. Alle vier kamen an wie du: zitternd. | Prüfung offen |
| Alt 14 | Wer hier anlegt, hat schon überlebt. Das Meer wirft niemanden her, der es nicht durch sich hindurchgelassen hat. | Prüfung offen |
| Alt 16 | Der Falter zeigt dir keine Bilder aus Bosheit. Er zeigt sie, weil niemand je hingesehen hat. | Prüfung offen |
| Alt 17 | Hier ist es immer zweimal bewohnt: einmal vom Heute, einmal vom Damals, das nicht vergehen wollte. | Prüfung offen |
| Alt 18 | Mura singt, damit sie nicht allein wach ist. Ihr Lied kennt keinen Schlaf — und keine Schande. | Prüfung offen |
| Alt 19 | Ein Traum, den man umschreibt, ist kein Traum mehr. Er wird zur Übung. Die Insel verträgt Übungen. | Prüfung offen |
| Alt 21 | Der Wächter hat nie geschlafen, seit … niemand weiß es. Er selbst hat es vergessen. Das ist das Traurigste. | Prüfung offen |
| Alt 22 | Alle Steine hier zeigen nach außen. Selbst die Insel lauscht noch auf den Schritt, der längst verhallt ist. | Prüfung offen |
| Alt 23 | Es ist kein Feind. Es ist ein Botenjunge, der nie gelernt hat, langsam zu gehen. | Prüfung offen |
| Alt 24 | Der Boden pocht in einem Takt, der kein guter Takt ist. Er pocht erst seitdem dich etwas überrannte. | Prüfung offen |
| Alt 26 | Jeder Wegweiser hier zeigt auf »später«. Vermeidia war einmal ein Kompass. Der Norden war zu schwer. | Prüfung offen |
| Alt 27 | Umwege waren früher Abkürzungen zum Überleben. Die Insel erinnert sich daran mit Stolz, nicht mit Scham. | Prüfung offen |
| Alt 28 | Unter den Hügeln liegt kein Müll. Es sind Schätze, die Angst hatten, gesehen zu werden. | Prüfung offen |
| Alt 29 | Der Verdränger kehrt seit Jahrzehnten. Sein Besen ist schwer. Niemand hat je danke gesagt. | Prüfung offen |
| Alt 31 | Das Glas hier war einmal eine Tür, die zugefallen ist. Dissozia hütet sie. Nicht aus Kälte — aus Liebe. | Prüfung offen |
| Alt 32 | Wer nicht ganz da ist, kann nicht ganz getroffen werden. So steht es in jedem Fenster dieser Insel. | Prüfung offen |
| Alt 33 | Erstarrion war ein Schrei, dem die Luft ausging. Das Eis bewahrte ihn. Er wartet auf Tauwetter. | Prüfung offen |
| Alt 34 | Stillstand ist keine Entscheidung. Es ist die älteste Verteidigung überhaupt — und sie hat funktioniert. | Prüfung offen |
| Alt 36 | Die Mauern bestehen aus Sätzen in deiner eigenen Stimme. Aber die Worte waren nie deine. | Prüfung offen |
| Alt 37 | Der Golem fragt: »Wer hat dir erlaubt, hier zu sein?« Die richtige Antwort kostet keine Kraft: »Ich.« | Prüfung offen |
| Alt 38 | Die Mitte der Insel fehlt nicht. Sie ist nur müde. Gefühle, die Sicherheit zogen, kehren leise zurück. | Prüfung offen |
| Alt 39 | Hier war einmal ein Gefühl. Ein großes. Die Schale ist noch warm. | Prüfung offen |
| Alt 41 | Misstrania prüft jeden Anker zweimal. Einmal hat einer gehalten, was er versprach. Seitdem prüft sie weiter. | Prüfung offen |
| Alt 42 | Die Fallen hier sind gute Handwerksarbeit. Wer sie baute, wollte nie böse sein — nur nie wieder überrascht. | Prüfung offen |
| Alt 43 | Komm her. Geh weg. Beides stimmt. Beides ist wahr. Das Phantom hat beides gelernt, gleichzeitig, von derselben Hand. | Prüfung offen |
| Alt 44 | Ebbe und Flut im Sekundentakt: Nähe war Sehnsucht und Bedrohung in einem. Die Insel lernt gerade einen Mittelweg. | Prüfung offen |
| Alt 46 | In der Mitte dreht sich alles Ungesagte. Ein Brief, der nie geöffnet wurde. Er wartet auf zwölf Siegel. | Prüfung offen |
| Alt 47 | Der Sturm ist kein Unwetter. Er ist deine Geschichte ohne Zeugen. Gib ihr Worte, und er wird Wetter. | Prüfung offen |
| Neu 12 | Ein Hafen auf einer erfundenen Seekarte: Hier beginnt ein möglicher Weg, und hier darf er enden. | Prüfung offen |
| Neu 13 | Mara zeichnet Karten, Tove sammelt Ideen, Kaj baut Schiffe und Ben sitzt am Feuer. Alle sind Figuren dieser Geschichte. | Prüfung offen |
| Neu 14 | Ein freier Steg ist für die nächste Pause da. Die See wartet auf keine Leistung. | Prüfung offen |
| Neu 16 | Auf den Papierflügeln des Falters wechseln erfundene Bilder. Keines muss gelesen werden. | Prüfung offen |
| Neu 17 | Zwei Bilderrahmen zeigen verschiedene Zeiten der Inselgeschichte. Der Weg dazwischen bleibt offen. | Prüfung offen |
| Neu 18 | Muras Lied färbt den Abendhimmel. Es gehört zu dieser erfundenen Insel. | Prüfung offen |
| Neu 19 | Die Geschichte kann ein anderes Ende erhalten. Das ist eine Möglichkeit im Spiel. | Prüfung offen |
| Neu 21 | Das Licht des Wächters streift den Horizont. Von der Bank lässt es sich aus der Ferne betrachten. | Prüfung offen |
| Neu 22 | Die Felsen zeigen in viele Richtungen. Der Rückweg ist eine davon. | Prüfung offen |
| Neu 23 | Ein Trommelwesen springt zwischen den Steinen. Sein Takt ist eine Spielkulisse. | Prüfung offen |
| Neu 24 | Auf diesem Atoll verändert sich ein Rhythmus; über einen menschlichen Herzschlag sagt er nichts. | Prüfung offen |
| Neu 26 | Mehrere Wegweiser stehen im Nebel. Die Spielfigur darf jeden Weg auslassen. | Prüfung offen |
| Neu 27 | Ein Umweg gehört ebenso zur Karte wie eine kurze Strecke. | Prüfung offen |
| Neu 28 | Die Kisten tragen erfundene Ortsnamen. Keine muss geöffnet werden. | Prüfung offen |
| Neu 29 | Der Besen steht neben einer Bank. Die Geschichte wartet, wenn du eine Pause wählst. | Prüfung offen |
| Neu 31 | Zwischen den Glasbögen bleibt ein Weg am Ufer frei. | Prüfung offen |
| Neu 32 | Die Glasscheiben spiegeln die Landschaft dieser Insel, keine persönliche Geschichte. | Prüfung offen |
| Neu 33 | Ein Licht wandert über das Eis. Erstarrion bleibt in selbst gewähltem Abstand. | Prüfung offen |
| Neu 34 | Die Spielfigur kann stehen bleiben. Keine Körperbewegung ist für die Szene erforderlich. | Prüfung offen |
| Neu 36 | Die Mauer trägt Schriftzeichen aus der Inselgeschichte. Sie bewertet niemanden vor dem Bildschirm. | Prüfung offen |
| Neu 37 | Neben der Mauer liegt ein freier Weg. Es muss kein Satz richtig beantwortet werden. | Prüfung offen |
| Neu 38 | Die Schale spiegelt den Himmel. Freier Raum ist hier ein Bild der Landschaft. | Prüfung offen |
| Neu 39 | Ein Wolkenschatten zieht durch die Senke. Die Szene verspricht keine Veränderung eigener Gefühle. | Prüfung offen |
| Neu 41 | Misstrania prüft ein Seil auf ihrem Steg. Die Spielfigur steht auf einem anderen. | Prüfung offen |
| Neu 42 | Abstand lässt sich wählen. Das Spiel fordert kein Vertrauen. | Prüfung offen |
| Neu 43 | Zwei Stege liegen am Wasser. Hinüberzugehen bleibt eine Möglichkeit. | Prüfung offen |
| Neu 44 | Beide Stege besitzen einen Rückweg. Annäherung ist keine Pflicht. | Prüfung offen |
| Neu 46 | Über dem Felsen drehen sich Wolken. Der Zugang folgt einer Spielregel. | Prüfung offen |
| Neu 47 | Dieser Sturm gehört zur erfundenen Seekarte. Eine persönliche Geschichte muss nicht erzählt werden. | Prüfung offen |

## src/game/quests.ts

| Stand / Zeile | Wortlaut | Prüfung |
| --- | --- | --- |
| Alt 35 | Tove hat einen Beruhigungstee für Ben aufgebrüht — er sitzt seit Tagen unruhig am Feuer. Bringe ihn ihm. | Prüfung offen |
| Alt 38 | +1 Notfallkarte, Bens Vertrauen | Prüfung offen |
| Alt 75 | Dr. Wiegand braucht Felddaten: Überwinde drei beliebige Phänomene und berichte ihr von den Begegnungen. | Prüfung offen |
| Alt 76 | Überwundene Phänomene: ${s.islands.filter((i) => i.overcome).length} / 3 | Prüfung offen |
| Alt 86 | Bens Herz | Prüfung offen |
| Alt 88 | Ben verrät dir: Das Herzrasen auf dem Alarm-Atoll jagt ihn seit Jahren in den Schlaf. Wenn ES bezwungen wäre … könnte er vielleicht wieder atmen. | Prüfung offen |
| Alt 89 | Überwinde das Herzrasen und kehre zu Ben zurück. | Prüfung offen |
| Alt 101 | Tove zeigt dir ihr Kochfeld: „Glutenfrei heißt getrennt — eigener Löffel, eigenes Brett, eigenes Sieb. Und auf den Packungen suchst du die durchgestrichene Ähre. Kein Hexenwerk, nur Handwerk. Koch mir etwas Glutenfreies, mindestens zwei Zutaten.“ | Prüfung offen |
| Alt 104 | +30 Einsicht, 1× Leinentuch, Toves Kochfeld-Wissen | Prüfung offen |
| Neu 35 | Tove hat einen warmen Tee für Ben vorbereitet. Wenn du möchtest, kannst du ihn ans Feuer bringen. Der Tee ist eine Spielressource. | Prüfung offen |
| Neu 38 | +1 Notfallkarte als Spielressource | Prüfung offen |
| Neu 75 | Dr. Wiegand sammelt Notizen zur erfundenen Seekarte. Du kannst drei Szenen abschließen und ihre Notizen lesen. Die Aufgabe ist freiwillig. | Prüfung offen |
| Neu 76 | Abgeschlossene Spielszenen: ${s.islands.filter((i) => i.overcome).length} / 3 | Prüfung offen |
| Neu 86 | Bens Inselnotiz | Prüfung offen |
| Neu 88 | Ben interessiert sich für das Trommelwesen auf dem Alarm-Atoll. Du kannst die erfundene Szene abschließen und seine Inselnotiz lesen. Dadurch wird keine Person geheilt. | Prüfung offen |
| Neu 89 | Schließe die Szene des Trommelwesens ab und besuche Ben, wenn du möchtest. | Prüfung offen |
| Neu 101 | Tove schlägt ein Spielrezept aus mindestens zwei Zutaten vor, die das Spiel als glutenfrei einordnet. Du kannst es am Kochfeld ausprobieren. Die Zuordnung ersetzt keine Prüfung realer Lebensmittel. | Prüfung offen |
| Neu 104 | +30 Einsicht, 1× Leinentuch, Spielrezept notiert | Prüfung offen |

## src/game/duels.ts

| Stand / Zeile | Wortlaut | Prüfung |
| --- | --- | --- |
| Alt 18 | Überschwängliche Bewunderung, die schneller kommt, als Vertrauen wachsen kann — und immer kurz vor der Bitte. | Prüfung offen |
| Alt 18 | Tempo rausnehmen: „Schön gesagt. Worum geht es dir?“ — echtes Lob braucht keine Gegenleistung. | Prüfung offen |
| Alt 19 | „Das hast du nie gesagt — du verwechselst was.“ Die eigene Erinnerung fühlt sich plötzlich wackelig an. | Prüfung offen |
| Alt 19 | Fakten sichern: Aufschreiben, Dritte einbeziehen. Der eigenen Wahrnehmung vertrauen. | Prüfung offen |
| Alt 20 | Schuldgefühle für eine Grenze, die gesund ist. „Nach allem, was ich für dich getan habe …“ | Prüfung offen |
| Alt 20 | Schuld prüfen: Gehört sie mir? Grenze benennen, ohne dich zu rechtfertigen. | Prüfung offen |
| Alt 21 | Deny – Attack – Reverse Victim & Offender: Erst Leugnen, dann Angriff, dann ist plötzlich DU die Täterin. | Prüfung offen |
| Alt 21 | Nicht auf die Drehung einsteigen: beim Thema bleiben, Muster benennen, pausieren. | Prüfung offen |
| Alt 22 | Du hast getan, was gefragt war — und plötzlich ist es nicht genug. Das Ziel wandert. | Prüfung offen |
| Alt 22 | Die ursprüngliche Abmachung benennen: „Der Preis stand. Ich steige aus“ — Aufschreiben hilft. | Prüfung offen |
| Alt 23 | Er wirft dir genau das vor, was er selbst tut — und du verteidigst dich statt zuzuhören. | Prüfung offen |
| Alt 23 | Nicht in die Verteidigung gehen: „Interessant, dass dir das auffällt.“ — Beobachten statt erklären. | Prüfung offen |
| Alt 24 | Eine dritte Partei wird eingespannt: „Alle anderen haben schon zugestimmt …“ | Prüfung offen |
| Alt 24 | Direkt bleiben: Entscheidungen zwischen zwei Personen, nicht über Stellvertreter. | Prüfung offen |
| Alt 25 | Bestrafung durch Schweigen — du sollst weichgeklopft werden, bis du nachgibst. | Prüfung offen |
| Alt 25 | Nicht betteln: „Ich bin bereit, wenn du reden willst.“ — Schweigen aushalten. | Prüfung offen |
| Alt 26 | Erst ein winziges Ja, dann ein größeres — die Treppe zieht dich höher, als du wolltest. | Prüfung offen |
| Alt 26 | Jede Stufe einzeln entscheiden: Ein früheres Ja verpflichtet zu nichts. | Prüfung offen |
| Alt 27 | Viele Worte, kein Inhalt — du bist müder, aber nicht klüger nach dem Gespräch. | Prüfung offen |
| Alt 27 | Auf eine Frage zurückführen: „Was genau willst du von mir?“ — Nicht jedem Faden folgen. | Prüfung offen |
| Alt 75 | Halt — ja, DU. Warte einen Moment. Weißt du, ich sehe viele durch diesen Hafen kommen, aber an dir ist etwas … anderes. Diese Ruhe in den Schultern. Du bist geboren für das offene Meer, das sieht man dir an. Jemand wie du verdient die besten Karten, die besten Preise — und ausgerechnet ICH habe heute etwas ganz Besonderes dabei. | Prüfung offen |
| Alt 79 | Ich WUSSTE, dass du es spürst. Menschen wie wir zwei erkennen einander sofort. | Prüfung offen |
| Alt 80 | Direkt! Das liebe ich an dir. Keine Angst, ich komme gleich zur Sache — bei Menschen wie dir macht Smalltalk ja keinen Sinn. | Prüfung offen |
| Alt 81 | Oh, eine Mauer! Auch gut. Ich respektiere das — bei jemandem wie dir überrascht mich nichts. | Prüfung offen |
| Alt 82 | … Love Bombing. Hm. Du bist schneller als die anderen. Gut. Dann eben ohne Schminke — ich habe eine Karte, die ihren Preis wert ist. | Prüfung offen |
| Alt 83 | Nett geraten, aber nein. Wo war ich — ah ja, bei jemand Besonderem wie dir. | Prüfung offen |
| Alt 86 | Also: Die Karte der verborgenen Strömung. Sie zeigt einen Weg, den kein Lotsenboot mehr fährt. Unschätzbar, ehrlich. Und weil DU es bist — nur für dich, nur heute: drei Kristalle. Betrachte es als … Zeichen unserer Freundschaft. | Prüfung offen |
| Alt 87 | Ein Geschäft unter Freunden! Ich rühre mich nicht vom Fleck — | Prüfung offen |
| Alt 88 | Eine Strömung, die Stürme schneidet wie ein Messer Segeltuch. Mehr musst du nicht wissen — Vertrauen ist doch da, oder? | Prüfung offen |
| Alt 89 | Oh, nicht SO schnell. Überleg es dir — aber Angebote wie dieses kommen einmal pro Jahr. | Prüfung offen |
| Alt 90 | Du legst es wirklich darauf an, heute. Gut — du weißt, was ich tue. Sag deinen Preis. | Prüfung offen |
| Alt 91 | Fast. Aber lassen wir die Theorie — drei Kristalle, Freundschaftspreis. | Prüfung offen |
| Alt 94 | Wunderbar! Ach — eine Kleinigkeit noch, fast hätte ich's vergessen: Die Karte braucht ihre Schutzhülle aus Seekiefer, sonst frisst die Feuchtigkeit sie in einem Winter. Für zwei weitere Kristalle lege ich sie bei. NUR weil du es bist. Das versteht sich doch von selbst, oder? | Prüfung offen |
| Alt 98 | Du bist die Beste. WIRKLICH. — So, die Hülle … | Prüfung offen |
| Alt 99 | Weil … hör mal, die Hülle ist handgemacht, das ist keine Abzocke, das ist HANDWERK — | Prüfung offen |
| Alt 100 | Pff. Du bist härter, als du aussiehst. Na gut — der Preis stand, du hast recht. Drei Kristalle, Karte UND Hülle. | Prüfung offen |
| Alt 101 | Moving Goalposts. AUA. Ja. Das war es. Die Hülle gehört dazu — immer schon. Drei Kristalle, alles drin. | Prüfung offen |
| Alt 102 | Nein, nein — das ist doch nur … Kundenservice. Zwei Kristalle, komm. | Prüfung offen |
| Alt 105 | Vessa hält inne — und lacht, diesmal ehrlich. „Okay. Du bist gut. Wirklich. Dann machen wir es richtig: Drei Kristalle für die Karte, Hülle inklusive. Ein fairer Preis für eine, die nichts übersieht.“ | Prüfung offen |
| Alt 106 | Vessa reibt sich die Hände. „Ein Vergnügen mit dir! Du wirst es nicht bereuen — versprochen.“ Ihr Lächeln sitzt eine Spur zu fest. | Prüfung offen |
| Alt 107 | Nach dem Handel, im Journal festgehalten: | Prüfung offen |
| Alt 117 | Nachgeben | Prüfung offen |
| Alt 119 | Grenze setzen | Prüfung offen |
| Neu 18 | Sehr überschwängliches Lob geht in dieser Szene einem Angebot voraus. Einzelne freundliche Sätze beweisen kein Muster. | Prüfung offen |
| Neu 18 | Die Spielfigur kann sagen: „Ich möchte erst wissen, was angeboten wird.“ | Prüfung offen |
| Neu 19 | Die Figur bestreitet in diesem Beispiel eine zuvor klar erzählte Abmachung. Die Bezeichnung ist keine Diagnose einer Person. | Prüfung offen |
| Neu 19 | Die Spielfigur kann die Abmachung wiederholen oder das Gespräch beenden. | Prüfung offen |
| Neu 20 | In diesem Beispiel verbindet die Figur eine Bitte mit einer Schuldzuweisung. | Prüfung offen |
| Neu 20 | Die Spielfigur kann sagen: „Ich entscheide selbst über dieses Angebot.“ | Prüfung offen |
| Neu 21 | Die Beispielsituation enthält Leugnen, einen Angriff und eine Umkehr der Rollen. Der Begriff dient nur der Einordnung der Szene. | Prüfung offen |
| Neu 21 | Die Spielfigur kann beim Thema bleiben, eine Pause wählen oder das Gespräch verlassen. | Prüfung offen |
| Neu 22 | In dieser Szene verändert die Figur eine bereits genannte Bedingung. | Prüfung offen |
| Neu 22 | Die Spielfigur kann nach dem vollständigen Angebot fragen oder aussteigen. | Prüfung offen |
| Neu 23 | Die Szene legt eine Ähnlichkeit zwischen Vorwurf und Verhalten einer Figur nahe. Ihre innere Absicht lässt sich daraus nicht sicher bestimmen. | Prüfung offen |
| Neu 23 | Die Spielfigur kann eine konkrete Frage stellen oder Abstand wählen. | Prüfung offen |
| Neu 24 | In diesem Beispiel beruft sich die Figur auf Dritte, um Zustimmung zu erreichen. | Prüfung offen |
| Neu 24 | Die Spielfigur kann das eigene Angebot unabhängig von Dritten prüfen. | Prüfung offen |
| Neu 25 | Dieses erzählte Beispiel verbindet Schweigen mit einer ausdrücklich angekündigten Forderung. Schweigen allein erklärt keine Absicht. | Prüfung offen |
| Neu 25 | Die Spielfigur kann eine Pause wählen; sie muss das Gespräch nicht fortsetzen. | Prüfung offen |
| Neu 26 | Auf eine kleine Bitte folgt in dieser Szene eine größere. Jede Bitte kann gesondert entschieden werden. | Prüfung offen |
| Neu 26 | Die Spielfigur kann sagen: „Über die neue Bitte entscheide ich neu.“ | Prüfung offen |
| Neu 27 | In diesem Beispiel bleibt die zentrale Frage trotz vieler Worte unbeantwortet. Unklare Sprache allein erlaubt keine Bewertung einer Person. | Prüfung offen |
| Neu 27 | Die Spielfigur kann nach dem konkreten Angebot fragen oder das Gespräch schließen. | Prüfung offen |
| Neu 75 | Erfundene Szene: Vessa lobt die Seefahrerfigur überschwänglich, bevor sie eine Karte anbietet. Die Figur am Steg ist nicht die spielende Person. | Prüfung offen |
| Neu 83 | Die Seefahrerfigur hört sich das Angebot an. Vessa legt eine Karte auf den Tisch. | Prüfung offen |
| Neu 84 | Die Seefahrerfigur fragt nach dem Inhalt des Angebots. Vessa zeigt die Karte. | Prüfung offen |
| Neu 85 | Die Seefahrerfigur lehnt das Angebot ab. Der freie Weg vom Steg bleibt offen. | Prüfung offen |
| Neu 86 | Eine mögliche Einordnung: sehr überschwängliches Lob vor einem Angebot. Die Begriffe beziehen sich nur auf diese erzählte Szene. | Prüfung offen |
| Neu 87 | Diese Szene enthält überschwängliches Lob vor einem Angebot. Die Auswahl ist kein Test persönlicher Fähigkeiten. | Prüfung offen |
| Neu 90 | Vessa nennt in der Geschichte drei Kristalle für eine Karte. Dann beruft sie sich darauf, dass andere Figuren schon zugestimmt hätten. In diesem Dialog werden keine Kristalle ausgegeben. | Prüfung offen |
| Neu 98 | Die Seefahrerfigur betrachtet das Angebot. Diese Textauswahl hat keine Kosten. | Prüfung offen |
| Neu 99 | Die Seefahrerfigur fragt, was die Karte enthält, unabhängig von den Entscheidungen anderer. | Prüfung offen |
| Neu 100 | Die Seefahrerfigur lehnt ab. Vessa legt die Karte zurück auf den Tisch. | Prüfung offen |
| Neu 101 | Eine mögliche Einordnung: Bezug auf andere Figuren soll in diesem Beispiel Zustimmung fördern. | Prüfung offen |
| Neu 102 | Die Szene nennt andere Figuren als Grund für Zustimmung. Daraus wird keine Fähigkeit oder Schwäche der spielenden Person abgeleitet. | Prüfung offen |
| Neu 105 | Im nächsten Abschnitt verändert Vessa das Angebot: Zur genannten Karte soll eine Hülle für zwei weitere Kristalle kommen. Der zuvor genannte Preis ist damit unvollständig. | Prüfung offen |
| Neu 113 | Die Seefahrerfigur sieht sich auch die Hülle an. Im Spiel wird nichts bezahlt. | Prüfung offen |
| Neu 114 | Die Seefahrerfigur fragt nach dem vollständigen Preis und allen Bedingungen. | Prüfung offen |
| Neu 115 | Die Seefahrerfigur beendet das Angebot. Der Weg vom Steg bleibt frei. | Prüfung offen |
| Neu 116 | Eine mögliche Einordnung: Eine genannte Bedingung wird nachträglich verändert. | Prüfung offen |
| Neu 117 | Hier wird der Umfang des Angebots nachträglich verändert. Die Antwort lässt sich überspringen oder neu lesen. | Prüfung offen |
| Neu 120 | Die erfundene Gesprächsszene endet hier. Du hast mögliche Begriffe zu einzelnen Abschnitten gewählt. Es wurden keine Kristalle ausgegeben. | Prüfung offen |
| Neu 121 | Die erfundene Gesprächsszene endet hier. Eine Einordnung war freiwillig. Es wurden keine Kristalle ausgegeben. | Prüfung offen |
| Neu 122 | Notizen zur erfundenen Gesprächsszene: | Prüfung offen |
| Neu 132 | Angebot in der Szene ansehen | Prüfung offen |
| Neu 134 | Angebot ablehnen | Prüfung offen |

## src/ui/BodyMap.tsx

| Stand / Zeile | Wortlaut | Prüfung |
| --- | --- | --- |
| Alt 23 | Stärkt: B-Vitamine (Vollkorn, Fisch, Eier), Tyrosin (Käse, Fisch), Omega-3, Wasser. Belastet: Zucker-Crash, Durst. | Prüfung offen |
| Alt 30 | Stärkt: Jod (Algen, Muscheln, Fisch). Ohne Jod läuft der Stoffwechsel auf Notstrom. | Prüfung offen |
| Alt 37 | Stärkt: Eisen (Linsen, Kürbiskerne, Fisch) — Vitamin C hilft bei der Aufnahme. Im Blick behalten bei glutenfreier Kost. | Prüfung offen |
| Alt 44 | Etwa 90 % des Serotonins entstehen hier. Stärkt: Ballaststoffe, Protein, Ruhe beim Essen. Belastet: Hetze, Einseitigkeit. | Prüfung offen |
| Alt 51 | Stärkt: komplexe Kohlenhydrate (Kartoffeln, Vollkorn, Linsen), Magnesium, Protein. Belastet: Einfachzucker — kurzer Schub, dann das Loch. | Prüfung offen |
| Alt 90 | Konzentrations-Wirkung aktiv | Prüfung offen |
| Alt 90 | B-Vitamine zuletzt reichlich | Prüfung offen |
| Alt 94 | Jod zuletzt ausreichend | Prüfung offen |
| Alt 98 | Eisen zuletzt reichlich | Prüfung offen |
| Alt 102 | Verdauung läuft — Sättigung aktiv | Prüfung offen |
| Alt 107 | Energie-Wirkung aktiv | Prüfung offen |
| Alt 107 | Zucker-Crash — das Loch danach | Prüfung offen |
| Alt 202 | Die Karte zeigt, was du zuletzt gegessen hast und was gerade wirkt. Sie ist Wissensvermittlung, keine medizinische Beratung. | Prüfung offen |
| Alt 208 | 🌾 Mangel-Wächter (Glutenfrei-Modus) | Prüfung offen |
| Alt 223 | Bei Zöliakie sind diese vier öfter im Blick zu behalten — nur ein Hinweis, keine Diagnose. | Prüfung offen |
| Neu 24 | Diese Zone leuchtet bei bestimmten Mahlzeitenwerten im Spiel. Sie zeigt keine Konzentration oder Gehirnfunktion einer Person. | Prüfung offen |
| Neu 31 | Diese Zone verwendet den Jodwert der Spielzutaten. Daraus lässt sich keine Aussage über eine Schilddrüse ableiten. | Prüfung offen |
| Neu 38 | Diese Zone verwendet den Eisenwert der Spielzutaten. Blutwerte oder die Versorgung einer Person werden hier nicht erfasst. | Prüfung offen |
| Neu 45 | Diese Zone leuchtet, solange eine Spielmahlzeit aktiv ist. Das Bild beschreibt keine tatsächliche Verdauung. | Prüfung offen |
| Neu 52 | Diese Zone folgt dem zeitlich begrenzten Energiewert einer Spielmahlzeit. Daraus lässt sich keine körperliche Wirkung ableiten. | Prüfung offen |
| Neu 90 | Spielbonus Konzentration aktiv | Prüfung offen |
| Neu 90 | B-Vitamin-Spielwert erreicht | Prüfung offen |
| Neu 94 | Jod-Spielwert erreicht | Prüfung offen |
| Neu 98 | Eisen-Spielwert erreicht | Prüfung offen |
| Neu 102 | Spielmahlzeit aktiv | Prüfung offen |
| Neu 107 | Spielbonus Energie aktiv | Prüfung offen |
| Neu 107 | Spielbonus vorübergehend vermindert | Prüfung offen |
| Neu 194 | Spielabzug | Prüfung offen |
| Neu 194 | Spielwert aktiv | Prüfung offen |
| Neu 194 | ohne Spielbonus | Prüfung offen |
| Neu 203 | Die Karte bildet Mahlzeiten deiner Spielfigur ab. Farben und Werte gehören zu den Spielregeln; sie beschreiben keinen realen Körper und geben keine Ernährungs- oder Gesundheitsauskunft. | Prüfung offen |
| Neu 209 | 🌾 Zutatenwerte im Glutenfrei-Spielmodus | Prüfung offen |
| Neu 224 | Diese Zuordnung gehört zum Kochspiel. Sie prüft keine Mangelzustände und ersetzt keine individuelle Ernährungsberatung. | Prüfung offen |

## src/ui/TitleScreen.tsx

Die erste Tabelle bewahrt die bisherige Prüfreihe vor dieser Gestaltungsrevision. „Neu“ bezeichnet darin den damaligen Bearbeitungsstand; die aktuellen Änderungen mit Aussageart folgen darunter.

| Stand / Zeile | Wortlaut | Prüfung |
| --- | --- | --- |
| Alt 38 | EINE REISE DURCH DEN TRAUMAATLAS | Prüfung offen |
| Alt 40 | PHÄNOMENAUTIK | Prüfung offen |
| Alt 43 | Steuere die Inseln an. Begegne den Phänomenen. Überwinde sie — oder verstehe sie, was mehr ist. | Prüfung offen |
| Alt 51 | Weitersegeln | Prüfung offen |
| Alt 62 | Neue Reise | Prüfung offen |
| Alt 66 | WASD/Segeln · Maus Umschauen · E Interagieren · F3 FPS · M Ton | Prüfung offen |
| Alt 77 | Praktisch glutenfrei kochen lernen — spielerisch, nicht klinisch. Jederzeit im Journal umschaltbar. | Prüfung offen |
| Alt 80 | 🌾 Glutenfrei-Modus | Prüfung offen |
| Alt 98 | Klicken zum Weiterlesen | Prüfung offen |
| Alt 98 | Klicken zum Ablegen | Prüfung offen |
| Neu 10 | Am ruhigen Steg | Prüfung offen |
| Neu 12 | Eine erfundene Inselwelt · freiwillig erkunden | Prüfung offen |
| Neu 13 | Phänomenautik | Prüfung offen |
| Neu 14 | Ein Steg im Abendlicht. | Prüfung offen |
| Neu 14 | Ein Zeichen, das du in Ruhe ansehen kannst. | Prüfung offen |
| Neu 15 | Du bestimmst den Abstand und den nächsten Schritt. Die erste Begegnung ist still, ohne Zeitdruck. Pause, Verlassen und Hilfe bleiben erreichbar. | Prüfung offen |
| Neu 17 | Am ruhigen Steg ankommen | Prüfung offen |
| Neu 18 | Bestehende Reise fortsetzen | Prüfung offen |
| Neu 18 | Die Inselwelt frei erkunden | Prüfung offen |
| Neu 20 | Angriffe sind zunächst ausgeschaltet. Ton lässt sich oben bewusst einschalten. | Prüfung offen |
| Neu 21 | Über diese Reise und die Bedienung | Prüfung offen |
| Neu 23 | Die Spielwerte beschreiben die erfundene Figur. Sie messen deinen Zustand nicht. Für persönliche Beobachtungen kannst du den bestehenden GANZ-SEiN-Speicher öffnen. | Prüfung offen |
| Neu 24 | WASD: bewegen oder segeln · Maus: umsehen · E: interagieren · Escape: Pause. Die erste Begegnung ist auch mit Tastatur und ohne 3D-Welt erreichbar. | Prüfung offen |
| Neu 25 | Glutenfreie Spielrezepte bevorzugen | Prüfung offen |
| Neu 26 | Diese Einstellung betrifft die erfundenen Rezepte, sie gibt keine Ernährungsberatung. | Prüfung offen |
| Neu 28 | Sprache und Begegnung: fachliche Prüfung und Prüfung durch Menschen mit eigener Erfahrung offen. | Prüfung offen |

### Gestaltungsrevision vom 9. Oktober 2026

Quelle: [src/ui/TitleScreen.tsx](/Volumes/ThunderBolt4_2TB/Development/Projects/phaenomenautik-3/src/ui/TitleScreen.tsx). Aufgenommen sind neue oder ersetzte Wortlaute sowie bisher nicht einzeln erfasste sichtbare Beschriftungen. Unveränderte Texte bleiben in der bisherigen Prüfreihe dokumentiert. Zeilenumbrüche innerhalb eines Absatzes werden als Leerzeichen wiedergegeben. „Aussageart“ ist eine redaktionelle Einordnung und keine fachliche Freigabe.

| Stand / Zeile | Wortlaut | Aussageart | Prüfung |
| --- | --- | --- | --- |
| Neu 13 | Eine fiktive Erkundung | Benennung / Spielfiktion | Prüfung offen |
| Neu 15 | Ein Steg im Abendlicht. Du bestimmst den nächsten Schritt. | Spielfiktion / Wahlfreiheit | Prüfung offen |
| Neu 16 | Ankommen, ein Zeichen ansehen, einen Ort wählen. Ohne Zeitlimit. Der Ton bleibt zunächst aus. | Einladung / technische Funktionsaussage | Prüfung offen |
| Neu 22 | Über die Reise und die Bedienung | Information / Bedienung | Prüfung offen |
| Neu 24 | Du kannst jederzeit pausieren, dich zurückziehen oder gehen. Fiktive Herausforderungen mit Angriffen beginnen ausgeschaltet. Spielwerte beschreiben die erfundene Welt; sie sagen nichts über deinen gesundheitlichen Zustand. | Wahlfreiheit / Funktionsaussage / Fiktionsgrenze | Prüfung offen |
| Neu 25 | Der ruhige Steg lässt sich mit der Tastatur bedienen. In der freien Inselwelt: WASD zum Gehen, Maus zum Schauen, E zum Ansprechen, Escape für Pause. | Bedienhinweis / Funktionsaussage | Prüfung offen |
| Neu 27 | Die Rezeptwahl ist eine Spieleinstellung und keine Ernährungsempfehlung. | Zweckbestimmung / keine Gesundheitsauskunft | Prüfung offen |
| Neu 28 | Fachliche Prüfung und Prüfung durch Menschen mit eigener Erfahrung: Prüfung offen. | Offener fachlicher und Erfahrungsprüfstatus | Prüfung offen |
| Neu 31 | Flimmerbucht | Ortsbenennung | Prüfung offen |
| Neu 25 | Der ruhige Steg | Ortsbenennung | Prüfung offen |

Der unverändert eingebundene Hinweis `DISCLAIMER` stammt aus [src/game/data.ts:649](/Volumes/ThunderBolt4_2TB/Development/Projects/phaenomenautik-3/src/game/data.ts:649); sein Wortlaut bleibt in der dortigen Prüfreihe geführt.

## src/ui/GentleEncounter.tsx

Die erste Tabelle bewahrt die bisherige Prüfreihe vor dieser Gestaltungsrevision. „Neu“ bezeichnet darin den damaligen Bearbeitungsstand; die aktuellen Änderungen mit Aussageart folgen darunter.

| Stand / Zeile | Wortlaut | Prüfung |
| --- | --- | --- |
| Neu 8 | Vom Steg aus schauen | Prüfung offen |
| Neu 8 | Du bleibst auf den Planken. Zwei Lichtstreifen liegen im Wasser. Die Boje und der Steg behalten ihre festen Umrisse. | Prüfung offen |
| Neu 9 | Eine Boje als Markierung setzen | Prüfung offen |
| Neu 9 | Du setzt eine kleine helle Boje neben den Steg. Das Flimmern bleibt weiter draußen. Die Markierung zeigt den Rückweg. | Prüfung offen |
| Neu 10 | Mit Abstand vom Ufer schauen | Prüfung offen |
| Neu 10 | Du trittst auf den sandigen Uferweg. Zwischen dir und dem Flimmern liegt der Steg. Hier kannst du bleiben oder gehen. | Prüfung offen |
| Neu 41 | Fiktive Begegnung Flimmerbucht | Prüfung offen |
| Neu 44 | Fiktive Begegnung · ohne Zeitlimit · ohne Ton nutzbar | Prüfung offen |
| Neu 45 | Flimmerbucht | Prüfung offen |
| Neu 46 | Am ruhigen Steg | Prüfung offen |
| Neu 46 | Vor dir liegen Wasser, ein Steg und ein sandiger Uferweg. Weiter draußen zieht ein heller Streifen über die Bucht. Du musst nicht näher hingehen. | Prüfung offen |
| Neu 46 | Der Steg ist dein Ankerort in dieser Geschichte. Du kannst ihn jederzeit verlassen. | Prüfung offen |
| Neu 46 | Die Zeichen ansehen | Prüfung offen |
| Neu 47 | Das Licht hat zwei Ränder | Prüfung offen |
| Neu 47 | Im Wasser liegt ein doppelter Lichtstreifen. Er gehört zum erfundenen Phänomen dieser Bucht. Die Planken und die kleine Laterne bleiben klar zu erkennen. | Prüfung offen |
| Neu 47 | Die Szene deutet keinen Zustand von dir. Du kannst sie einfach als Landschaft betrachten. | Prüfung offen |
| Neu 47 | Eine Handlung wählen | Prüfung offen |
| Neu 48 | Wie möchtest du schauen? | Prüfung offen |
| Neu 48 | Jede Möglichkeit führt weiter. Keine verbraucht Ressourcen. Auch Zurückziehen ist eine vollständige Wahl. | Prüfung offen |
| Neu 49 | Der Rückweg bleibt sichtbar | Prüfung offen |
| Neu 49 | Du bleibst am Steg. Die Laterne markiert den Weg ans Ufer. | Prüfung offen |
| Neu 49 | Du kannst die Begegnung friedlich abschließen oder jetzt zurückziehen. | Prüfung offen |
| Neu 49 | Friedlich abschließen | Prüfung offen |
| Neu 50 | Eine Markierung bleibt | Prüfung offen |
| Neu 50 | Am Steg liegt jetzt eine helle Boje. Beim nächsten Besuch erkennst du diesen Rückweg wieder. Das ist eine Veränderung in der Spielwelt, kein Nachweis psychischer Bewältigung. | Prüfung offen |
| Neu 50 | Im vorhandenen Atlas findest du den Kontext „Dissoziatives Erleben“. Seine Quellen und sein Prüfstatus bleiben dort sichtbar. Die fiktive Bucht stellt keine Diagnose dar. | Prüfung offen |
| Neu 50 | Atlas-Kontext öffnen · Beobachtung optional bewahren | Prüfung offen |
| Neu 50 | GANZ-SEiN auf diesem Mac öffnet sich. Dort kannst du eine eigene Beobachtung ausdrücklich speichern und zu dieser Stelle zurückkehren. | Prüfung offen |
| Neu 50 | Deine Stelle ist im Spielstand bewahrt. | Prüfung offen |
| Neu 50 | Zum Ausgangspunkt zurück | Prüfung offen |
| Neu 51 | Zurückziehen zum Ankerort | Prüfung offen |
| Neu 51 | Atlas ohne Abschluss öffnen | Prüfung offen |
| Neu 52 | Fachliche Prüfung und Erfahrungsrückmeldungen: Prüfung offen. | Prüfung offen |

### Gestaltungsrevision vom 9. Oktober 2026

Quelle: [src/ui/GentleEncounter.tsx](/Volumes/ThunderBolt4_2TB/Development/Projects/phaenomenautik-3/src/ui/GentleEncounter.tsx). Aufgenommen sind neue oder ersetzte Wortlaute sowie bisher nicht einzeln erfasste sichtbare Beschriftungen. Unveränderte Texte bleiben in der bisherigen Prüfreihe dokumentiert. Zeilenumbrüche innerhalb eines Absatzes werden als Leerzeichen wiedergegeben. „Aussageart“ ist eine redaktionelle Einordnung und keine fachliche Freigabe.

| Stand / Zeile | Wortlaut | Aussageart | Prüfung |
| --- | --- | --- | --- |
| Neu 9 | Auf den festen Planken bleiben. | Unterzeile / freiwillige Wahl | Prüfung offen |
| Vorher 9 | Du bleibst auf den Planken. Zwei Lichtstreifen liegen im Wasser. Boje und Steg behalten ihre festen Umrisse. | Fiktives Handlungsergebnis; durch den folgenden Wortlaut ersetzt | Prüfung offen |
| Neu 9 | Du bleibst auf den Planken. Zwei Lichtstreifen liegen im Wasser. Steg und Laterne behalten ihre festen Umrisse. | Fiktives Handlungsergebnis | Prüfung offen |
| Neu 10 | Eine Boje setzen | Freiwillige Wahl | Prüfung offen |
| Neu 10 | Den Rückweg sichtbar markieren. | Unterzeile / freiwillige Wahl | Prüfung offen |
| Neu 10 | Eine helle Boje liegt neben dem Steg. Das Flimmern bleibt weiter draußen. Deine Markierung zeigt den Rückweg. | Fiktives Handlungsergebnis | Prüfung offen |
| Neu 11 | Vom Ufer aus schauen | Freiwillige Wahl | Prüfung offen |
| Neu 11 | Mit Abstand auf dem Sandweg stehen. | Unterzeile / freiwillige Wahl | Prüfung offen |
| Neu 11 | Du stehst auf dem sandigen Uferweg. Zwischen dir und dem Flimmern liegt der Steg. Hier kannst du bleiben oder gehen. | Fiktives Handlungsergebnis / Wahlfreiheit | Prüfung offen |
| Neu 14 | Am ruhigen Steg. | Szenenbenennung | Prüfung offen |
| Neu 14 | Zwei Ränder im Licht. | Szenenbenennung / Spielfiktion | Prüfung offen |
| Neu 14 | Von wo aus schauen? | Einladung zur freiwilligen Wahl | Prüfung offen |
| Neu 14 | Der Weg bleibt offen. | Szenenbenennung / Wahlfreiheit | Prüfung offen |
| Neu 14 | Eine Markierung bleibt. | Szenenbenennung / Spielfiktion | Prüfung offen |
| Neu 34 | Unter den Planken liegt stilles Wasser. Weiter draußen zieht sich ein Lichtstreifen durch die Bucht. | Sichtbares fiktives Geschehen | Prüfung offen |
| Neu 35 | Du kannst schauen, Abstand halten oder jederzeit zurückgehen. | Freiwillige Wahl / Rückweg | Prüfung offen |
| Neu 39 | Der Lichtstreifen erscheint doppelt. Der Steg bleibt fest, die Laterne steht an ihrem Platz. | Sichtbares fiktives Geschehen | Prüfung offen |
| Neu 40 | Das Zeichen gehört zu dieser erfundenen Landschaft. | Fiktionsgrenze | Prüfung offen |
| Neu 44 | Drei Möglichkeiten, ohne Zeitlimit. Keine davon kostet Spielressourcen. | Wahlfreiheit / technische Funktionsaussage | Prüfung offen |
| Neu 48 | Du bleibst am ruhigen Steg. Der Rückweg ist sichtbar. | Fiktives Handlungsergebnis / Ersatztext | Prüfung offen |
| Neu 49 | Du kannst die Begegnung friedlich abschließen oder dich zurückziehen. | Freiwillige Wahl / Rückweg | Prüfung offen |
| Vorher 53 | Die helle Boje markiert diesen Ort. Sie bleibt beim nächsten Besuch im Spiel erhalten. | Spielfiktion / technische Speicherzusage; durch den folgenden Wortlaut ersetzt | Prüfung offen |
| Neu 53 | Die helle Boje markiert diesen Ort. Wenn das Speichern gelingt, bleibt sie für den nächsten Besuch erhalten. | Spielfiktion / bedingte technische Speicherzusage | Prüfung offen |
| Neu 54 | Im Atlas kannst du Kontext lesen und auf Wunsch eine eigene Beobachtung bewahren. | Atlas-Anschluss / freiwillige Beobachtung | Prüfung offen |
| Neu 55 | Im Atlas weiterdenken | Freiwillige Navigation | Prüfung offen |
| Neu 56 | GANZ SEiN auf diesem Mac. Persönliche Notizen sind freiwillig. | Atlas-Anschluss / freiwillige Beobachtung | Prüfung offen |
| Neu 57 | Deine Stelle wurde im Spielstand bewahrt. | Technische Speicherbestätigung | Prüfung offen |
| Neu 61 | Zum Ankerort zurückziehen | Navigation / Rückzug | Prüfung offen |
| Neu 62 | Atlas öffnen | Freiwillige Navigation | Prüfung offen |
| Neu 65 | Über diese Begegnung | Information / Kontext | Prüfung offen |
| Neu 66 | Dies ist eine fiktive Erkundung. Das Flimmern beschreibt keinen Zustand der spielenden Person. Spielwerte und ein Abschluss sagen nichts über Gesundheit oder psychische Bewältigung aus. | Fiktionsgrenze / keine Zustandsableitung | Prüfung offen |
| Neu 67 | Rückzug kostet hier keine Spielressourcen. Hilfe und Pause bleiben jederzeit erreichbar. Es gibt kein Zeitlimit; der vollständige Weg ist ohne Ton nutzbar. | Wahlfreiheit / technische Funktionsaussage | Prüfung offen |
| Neu 68 | Der Atlas bietet Kontext, keine Diagnose. Eigene Beobachtungen werden nur auf deinen ausdrücklichen Wunsch im vorhandenen GANZ-SEiN-Speicher bewahrt. | Zweckbestimmung / freiwillige Speicherung | Prüfung offen |
| Neu 69 | Fachliche Prüfung und Rückmeldungen von Menschen mit eigener Erfahrung: Prüfung offen. | Offener fachlicher und Erfahrungsprüfstatus | Prüfung offen |
| Neu 72 | Der ruhige Steg | Ortsbenennung | Prüfung offen |

Der textliche Einwand zur unbedingten Speicherung der Boje ist im aktuellen Wortlaut korrigiert: Ihr Erhalt beim nächsten Besuch wird ausdrücklich vom Gelingen des Speicherns abhängig gemacht. Das ist eine redaktionelle Korrektur und keine fachliche oder Erfahrungsfreigabe; der Prüfstatus bleibt „Prüfung offen“.

## src/ui/Protection.tsx

Die erste Tabelle bewahrt die bisherige Prüfreihe vor dieser Gestaltungsrevision. „Neu“ bezeichnet darin den damaligen Bearbeitungsstand; die aktuellen Änderungen mit Aussageart folgen darunter.

| Stand / Zeile | Wortlaut | Prüfung |
| --- | --- | --- |
| Neu 33 | Unterbrechen, verlassen und Hilfe | Prüfung offen |
| Neu 34 | Phänomenautik | Prüfung offen |
| Neu 36 | Pause | Prüfung offen |
| Neu 37 | Verlassen | Prüfung offen |
| Neu 38 | Hilfe | Prüfung offen |
| Neu 39 | Ton | Prüfung offen |
| Neu 54 | Hier ist Pause. | Prüfung offen |
| Neu 55 | Die Spielwelt und ihre Zeitmechaniken stehen still. Der Spielton ist unterbrochen. Du entscheidest, ob und wann es weitergeht. | Prüfung offen |
| Neu 57 | Bewusst fortsetzen | Prüfung offen |
| Neu 58 | Begegnung verlassen · ohne Ressourcenverlust | Prüfung offen |
| Neu 59 | Zum ruhigen Steg | Prüfung offen |
| Neu 60 | Hilfe ansehen | Prüfung offen |
| Neu 61 | Spielstand speichern | Prüfung offen |
| Neu 62 | Zum Einstieg zurückkehren | Prüfung offen |
| Neu 64 | Fiktive Spielherausforderungen mit Angriffen einschalten. Anfangs ausgeschaltet; jederzeit wieder ausschaltbar. | Prüfung offen |
| Neu 66 | Hilfe in Deutschland | Prüfung offen |
| Neu 67 | Du kannst Hilfe ohne Anmeldung und ohne Spielfortschritt erreichen. Die Spielwelt bleibt währenddessen in Pause. | Prüfung offen |
| Neu 69 | 112 · akute Lebensgefahr | Prüfung offen |
| Neu 69 | Wenn Lebensgefahr besteht oder schwere bleibende Schäden möglich sind, ruf 112 an. Kostenfrei, rund um die Uhr. | Prüfung offen |
| Neu 69 | Offizielle Informationen | Prüfung offen |
| Neu 70 | 116 123 · TelefonSeelsorge | Prüfung offen |
| Neu 70 | Wenn du in einer Krise bist oder jemanden zum Reden brauchst: auch 0800 1110111 und 0800 1110222. Anonym, kostenfrei, Tag und Nacht. Leitungen können belegt sein. | Prüfung offen |
| Neu 70 | Kontakt und weitere Wege | Prüfung offen |
| Neu 71 | 116117 · dringende ärztliche Hilfe | Prüfung offen |
| Neu 71 | Außerhalb der Sprechzeiten, wenn ärztliche Hilfe nicht bis zur nächsten Sprechstunde warten kann und keine Lebensgefahr besteht. Telefonisch rund um die Uhr; mit deutschem Anschluss kostenfrei. | Prüfung offen |
| Neu 71 | Offizielle Informationen | Prüfung offen |
| Neu 73 | Kontaktdaten geprüft am 9. Oktober 2026. Fachliche Textprüfung und Rückmeldungen von Menschen mit eigener Erfahrung: Prüfung offen. | Prüfung offen |
| Neu 74 | Zur Pause zurück | Prüfung offen |
| Alt Zwischenstand 75 | Speichern und verlassen | Prüfung offen |
| Neu 75 | Zum Einstieg zurückkehren | Prüfung offen |
| Neu 77 | Speicherung und Quellen | Prüfung offen |
| Alt Zwischenstand 77 | Der Spielstand liegt im lokalen Speicher dieses Browsers. Persönliche Beobachtungen speicherst du auf Wunsch im vorhandenen GANZ-SEiN-Speicher auf diesem Mac. Es gibt keine automatische Übertragung deiner Beobachtung aus dem Spiel. | Prüfung offen |
| Neu 77 | Der Spielstand wird im lokalen Speicher dieses Browsers gesichert, sofern das Speichern gelingt. Bei einem Speicherfehler bleibt der aktuelle Stand für diese Sitzung erhalten; Schließen oder Neuladen kann ihn verlieren. Persönliche Beobachtungen speicherst du auf Wunsch im vorhandenen GANZ-SEiN-Speicher auf diesem Mac. Es gibt keine automatische Übertragung deiner Beobachtung aus dem Spiel. | Prüfung offen |
| Neu 77 | Beim Laden der App und beim Öffnen externer Links können die jeweiligen Server Verbindungsdaten erhalten. Ihre Protokolle sind hier nicht überprüft. Lokale Browserspeicherung kann durch Browserbereinigung verloren gehen. | Prüfung offen |
| Neu 77 | Dies ist eine fiktive Erkundung. Spielwerte und Abschlüsse sagen nichts über deinen gesundheitlichen Zustand oder psychische Bewältigung aus. | Prüfung offen |

### Gestaltungsrevision vom 9. Oktober 2026

Quelle: [src/ui/Protection.tsx](/Volumes/ThunderBolt4_2TB/Development/Projects/phaenomenautik-3/src/ui/Protection.tsx). Aufgenommen sind neue oder ersetzte Wortlaute sowie bisher nicht einzeln erfasste sichtbare Beschriftungen. Unveränderte Texte bleiben in der bisherigen Prüfreihe dokumentiert. Zeilenumbrüche innerhalb eines Absatzes werden als Leerzeichen wiedergegeben. „Aussageart“ ist eine redaktionelle Einordnung und keine fachliche Freigabe.

| Stand / Zeile | Wortlaut | Aussageart | Prüfung |
| --- | --- | --- | --- |
| Neu 40 | Ton an / Ton aus | Freiwillige Toneinstellung / dynamische Beschriftung | Prüfung offen |
| Neu 56 | Die Spielwelt steht still, der Spielton ist unterbrochen. Du entscheidest, wann es weitergeht. | Technische Funktionsaussage / Wahlfreiheit | Prüfung offen |
| Neu 59 | Zum Ankerort zurückziehen — ohne Ressourcenverlust | Rückzug / technische Funktionsaussage | Prüfung offen |
| Neu 62 | Spielstand in diesem Browser gespeichert. | Technische Speicherbestätigung | Prüfung offen |

## src/ui/ShoreScene.tsx

### Gestaltungsrevision vom 9. Oktober 2026

Quelle: [src/ui/ShoreScene.tsx](/Volumes/ThunderBolt4_2TB/Development/Projects/phaenomenautik-3/src/ui/ShoreScene.tsx). Aufgenommen sind neue oder ersetzte Wortlaute sowie bisher nicht einzeln erfasste sichtbare Beschriftungen. Unveränderte Texte bleiben in der bisherigen Prüfreihe dokumentiert. Zeilenumbrüche innerhalb eines Absatzes werden als Leerzeichen wiedergegeben. „Aussageart“ ist eine redaktionelle Einordnung und keine fachliche Freigabe.

| Stand / Zeile | Wortlaut | Aussageart | Prüfung |
| --- | --- | --- | --- |
| Neu 7 | Deine Markierung | Benennung einer fiktiven Spielmarkierung | Prüfung offen |

## src/ui/HUD.tsx

| Stand / Zeile | Wortlaut | Prüfung |
| --- | --- | --- |
| Alt 122 | Stabilität | Prüfung offen |
| Alt 123 | Präsenz | Prüfung offen |
| Alt 236 | Zusammenbruch | Prüfung offen |
| Alt 238 | Die Stabilität ist auf null. Das ist kein Ende — nur ein Rückzug. Du wachst am Feuer des Ankerplatzes wieder auf. | Prüfung offen |
| Alt 245 | Aufwachen | Prüfung offen |
| Neu 122 | Figur · Stabilität | Prüfung offen |
| Neu 123 | Figur · Präsenz | Prüfung offen |
| Neu 235 | Die Spielfigur kehrt zurück | Prüfung offen |
| Neu 237 | Ein Spielwert der Figur ist auf null. Du kannst am Ankerplatz weitergehen oder die Reise verlassen. Deine Ressourcen bleiben erhalten. | Prüfung offen |
| Neu 243 | Zum Ankerplatz | Prüfung offen |

## src/ui/SurfaceBoundary.tsx

| Stand / Zeile | Wortlaut | Prüfung |
| --- | --- | --- |
| Neu 10 | Diese Ansicht konnte nicht geöffnet werden | Prüfung offen |
| Neu 10 | Die Reise ist unterbrochen. Über die Leiste oben kannst du Hilfe öffnen oder zum Einstieg zurückkehren. Dein gespeicherter Stand bleibt erhalten. | Prüfung offen |

## src/App.tsx

| Stand / Zeile | Wortlaut | Prüfung |
| --- | --- | --- |
| Alt 59 | Inseln, Wasser und Wetter entstehen | Prüfung offen |
| Neu 70 | Die Spielwelt konnte nicht geöffnet werden. Hilfe und die ruhige Begegnung bleiben verfügbar. Dein bisheriger Spielstand bleibt erhalten. | Prüfung offen |
| Neu 113 | Inseln, Wasser und Wetter entstehen. | Prüfung offen |
| Neu 114 | Die Spielwelt bleibt geschlossen | Prüfung offen |
| Neu 114 | Zum Einstieg | Prüfung offen |

## src/game/state.ts

| Stand / Zeile | Wortlaut | Prüfung |
| --- | --- | --- |
| Neu 95 | Ein vorhandener Spielstand lässt sich gerade nicht lesen. Er wurde nicht ersetzt. Hilfe bleibt erreichbar; der gespeicherte Bestand muss vor einer neuen Sicherung geprüft werden. | Prüfung offen |
| Alt Zwischenstand 250 | Der Spielstand konnte in diesem Browser nicht gespeichert werden. Lass diese Ansicht offen und prüfe den verfügbaren Speicher. | Prüfung offen |
| Neu 250 | Der Spielstand konnte in diesem Browser nicht gespeichert werden. Für diese Sitzung bleibt er erhalten. Beim Schließen oder Neuladen kann der aktuelle Stand verloren gehen. | Prüfung offen |
| Neu 103 · technische Speicher- und Sitzungsgrenze | In einer anderen Ansicht wurde der Spielstand geändert. Dieser Stand wurde nicht überschrieben. Dein aktueller Stand bleibt für diese Sitzung erhalten. Zum Fortsetzen des gespeicherten Stands öffne das Spiel neu; beim Schließen oder Neuladen kann dein Sitzungsstand verloren gehen. | Prüfung offen |

## Technischer Prüfstand

Die Typewriter-, Anzeigezeit- und Bedienungsänderungen benötigen zusätzlich die technische Prüfung der Schutzflags. Eine technische Prüfung ersetzt keine Prüfung der dargestellten Texte oder ihrer möglichen Wirkung auf Menschen. Die bestehenden internen Phänomen- und Quellenkennungen bleiben zur Provenienz erhalten.
