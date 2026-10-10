// PHÄNOMENAUTIK 2 — Bord-KI: lokale Dialog-Engine für NPCs
// Intent-Erkennung + Wissensbasis (TRAUMAATLAS) + Persönlichkeiten + Gedächtnis.
// Läuft vollständig offline im Browser. Erkennt Krisenäußerungen und antwortet
// mit fürsorglichem Text + Notfallnummern.

import { PHENOMENA } from "./data";
import type { NpcDef, NpcDomain } from "./npc";
import type { SaveGame } from "./state";
import { activeQuests, completableQuests, offerableQuests, QUESTS } from "./quests";

export interface DialogReply {
  text: string;
  action?: { type: "setName"; name: string } | { type: "acceptQuest"; questId: string } | { type: "turnInQuest"; questId: string };
}

// ─── Normalisierung ────────────────────────────────────────────────

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ß/g, "ss")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Wissensbasis ──────────────────────────────────────────────────

interface KnowledgeEntry {
  id: string;
  domain: NpcDomain;
  pattern: RegExp;
  answer: (npc: NpcDef, save: SaveGame) => string;
}

const K = (id: string, domain: NpcDomain, pattern: RegExp, text: string): KnowledgeEntry => ({
  id,
  domain,
  pattern,
  answer: () => text,
});

const KNOWLEDGE: KnowledgeEntry[] = [
  // ── Symptome & Phänomene ──
  K("flashback", "symptome", /flashback|wiedererleb|intrusion|mitten im geschehen/,
    "Auf dem Wiederkehr-Riff trägt ein Falter wechselnde Bilder. Diese erfundene Szene kann betrachtet oder ausgelassen werden. Sie erlaubt keine Aussage über eigene Erinnerungen."),
  K("albtraum", "symptome", /albt|traum|nachts wach|schlecht schlaf/,
    "Muras Insel erzählt eine erfundene Traumgeschichte. Du kannst ihr Lied aus der Ferne lesen oder die Szene verlassen. Das Spiel behandelt keine Schlafprobleme."),
  K("hypervigilanz", "symptome", /wachsam|hypervigilanz|standig auf der hut|gefahr uberall|schreckhaft/,
    "Der kristallene Wächter dreht sein Licht über das Atoll. Sein Spieltyp heißt hohe Aktivität; das beschreibt nur eine Regel dieser Figur."),
  K("panik", "symptome", /panik|herzrasen|atemnot|enge in der brust|herz rast/,
    "Das Trommelwesen stellt einen Spielrhythmus dar. Eigene Beschwerden wie Herzrasen, Atemnot oder Brustenge lassen sich hier nicht einschätzen. Bei unmittelbarer Gefahr gilt in Deutschland 112; für dringende medizinische Anliegen außerhalb der Sprechzeiten 116 117."),
  K("vermeidung", "symptome", /vermeid|ausweich|drucken|schieb.*auf|prokrastin/,
    "Vermeidia zeichnet mehrere Wege in den Sand. Auch ein Umweg oder Rückweg zählt als selbst gewählte Spielentscheidung. Es gibt keine Pflicht zur Annäherung."),
  K("dissoziation", "symptome", /dissozi|nebenselbst|unwirklich|wie durch glas|weg sein|abwesend/,
    "Dissozia ist eine erfundene Glasgeistin. Die Glasbögen dienen als Bild für Abstand; sie erklären keine persönliche Verfassung. Betrachten und Verlassen sind mögliche Wege."),
  K("erstarrung", "symptome", /erstarr|einfrier|freeze|gelahmt|kann mich nicht bewegen/,
    "Erstarrion steht zwischen Eisblöcken. Die Spielfigur darf stehen bleiben oder weitergehen. Die Szene fordert keine Bewegung des eigenen Körpers."),
  K("scham", "symptome", /scham|schuld|wertlos|kaputt|nicht gut genug|hass.*selbst/,
    "Der Scham-Golem baut eine Mauer aus beschrifteten Steinen. Die Schrift bewertet die spielende Person nicht. Du kannst auch den freien Uferweg wählen."),
  K("leere", "symptome", /leere|hoffnungslos|nichts fuhl|taub|freudlos|sinnlos/,
    "Die Insel der Leere enthält eine Schale und viel freien Raum. Das ist ein Bild dieser Geschichte. Hier wird keine Gefühlslage bewertet und keine Veränderung versprochen."),
  K("misstrauen", "symptome", /vertrau|misstrau|nahe|klammer|distanz|allein bleib/,
    "Die Figuren auf dem Riff wählen Abstand und Kontakt. Diese Wahl erlaubt keine Beurteilung realer Beziehungen. Ben ist eine erfundene Figur und kein Erfahrungsbericht."),
  K("koerper", "symptome", /magen|schmerz|haut|kopfweh|verspann|korperlich/,
    "Der Dialog kann körperliche Beschwerden nicht einschätzen. Die Spielwerte beschreiben nur die Spielfigur. Bei dringenden medizinischen Anliegen außerhalb der Sprechzeiten erreichst du in Deutschland 116 117; bei unmittelbarer Gefahr 112."),

  // ── Übungen ──
  K("erdung", "uebungen", /erdung|5 4 3 2 1|grounding/,
    "Eine freiwillige Idee ist, etwas Angenehmes oder Neutrales im Raum wahrzunehmen. Die Spielaktion lässt sich auch allein durch Lesen wählen; Zählen und körperliche Durchführung sind nicht nötig."),
  K("seufzer", "uebungen", /seufzer|atmen|atemubung|doppel einatmen/,
    "Du musst deinen Atem für die Spielaktion nicht verändern. Wenn du möchtest, kannst du ihn nur bemerken. Auslassen oder die Szene verlassen sind vollständige Möglichkeiten."),
  K("voo", "uebungen", /voo|summen|vagus.*stimul|klang|tonen/,
    "Du kannst einen leisen Ton hören oder summen, wenn das angenehm ist. Schweigen ist ebenso möglich. Das Spiel verspricht dadurch keine körperliche Wirkung."),
  K("schuetteln", "uebungen", /abschuttel|tremor|zittern/,
    "Für diese Spielaktion ist keine körperliche Durchführung nötig. Eine kleine selbst gewählte Bewegung ist optional; Zittern muss weder ausgelöst noch verstärkt werden."),
  K("pendeln", "uebungen", /pendel/,
    "Du kannst die Aufmerksamkeit auf etwas Neutrales richten. Belastende Empfindungen müssen dafür nicht aufgesucht werden. Du kannst auch nur die Szene lesen."),
  K("koerperscan", "uebungen", /korper.*scan|bodyscan|innere landkarte/,
    "Wenn du möchtest, kannst du etwas Angenehmes oder Neutrales bemerken. Nach innen zu schauen ist keine Voraussetzung. Die Auswahl im Spiel genügt."),
  K("sichererort", "uebungen", /sicherer ort|imagination|innerer ort/,
    "Ein selbst gewählter realer oder erfundener Ort kann als Bild dienen. Ein vollkommen sicherer Ort muss nicht vorgestellt werden. Auslassen bleibt möglich."),
  K("coreg", "uebungen", /co regulation|zusammen sein|andere menschen helfen|jemand anrufen/,
    "Kontakt zu einem selbst gewählten Menschen ist eine mögliche eigene Entscheidung. Die Spielfigur stellt keinen menschlichen Kontakt dar und verspricht keine Wirkung."),

  // ── Wissenschaft ──
  K("nervensystem", "wissenschaft", /nervensystem|vegetativ|autonom/,
    "Das Meer ist eine Metapher, keine Abbildung eines Nervensystems. Spielwerte wie Präsenz und Stabilität lassen sich nicht auf eine Person übertragen. Die Quellen des TRAUMAATLAS sind von diesen erfundenen Dialogen zu unterscheiden."),
  K("polyvagal", "wissenschaft", /polyvagal|vagus|porges/,
    "Die Polyvagal-Theorie ist eine thematische Bezugnahme des Ausgangsmaterials. Dieser Dialog kann ihren wissenschaftlichen Stand nicht bewerten. Daraus werden keine körperlichen Zustände oder passenden Übungen für dich abgeleitet."),
  K("toleranzfenster", "wissenschaft", /toleranzfenster|fenster der toleranz/,
    "TOLERANZ ist der Name des Schiffs; das Bild eines Fensters erscheint im Ausgangsmaterial. Fortschritt und Zahlen im Spiel messen kein persönliches Toleranzfenster."),
  K("ptbs", "wissenschaft", /ptbs|ptsd|posttraumatisch/,
    "PTBS ist ein klinischer Begriff. Ob er auf eine Person zutrifft, lässt sich in diesem Spiel nicht feststellen. Persönliche Diagnosen und Behandlungsentscheidungen gehören in ein Gespräch mit qualifizierten Menschen."),
  K("kptbs", "wissenschaft", /komplex|kptbs|kindheitstrauma|entwicklungstrauma/,
    "Komplexe PTBS ist ein klinischer Begriff. Die fiktiven Figuren können ihn weder erkennen noch bestätigen. Aus eigenen Spielentscheidungen wird keine Diagnose abgeleitet."),
  K("amygdala", "wissenschaft", /amygdala|mandelkern|alarmzentrale/,
    "Die Amygdala gehört zu den Begriffen des Ausgangsmaterials. Eine Alarmfigur im Spiel bildet keine einzelne Hirnregion ab. Die Szene erlaubt keine Aussage über das eigene Gehirn."),

  // ── Welt & Praktisches ──
  K("inseln", "lore", /insel|phanomen|archipel|was ist das fur/,
    "Die Inseln sind erfundene Landschaften, die thematische Begriffe als Bilder aufgreifen. Du kannst sie betreten, aus der Ferne betrachten oder auslassen. Es gibt keine Pflicht, sie abzuschließen."),
  K("sturmherd", "lore", /sturmherd|mitte|auge des/,
    "Der Sturmherd bildet einen erzählerischen Abschluss dieser Seekarte. Die Freischaltung ist eine Spielregel. Du musst dafür keine persönliche Geschichte erzählen und kannst den Besuch auslassen."),
  K("meer", "meer", /meer|see|ozean|wasser|wo sind wir/,
    "Dieses Meer ist eine erfundene Landschaft. Es bietet Wege zum Segeln, Lesen und Erkunden; es behauptet nichts über die Lebensgeschichte der spielenden Person."),
  K("wetter", "meer", /wetter|sturm|wellen|wind/,
    "Wind und Wellen gehören zur Spielwelt. Du kannst Sturmzellen umfahren oder am Ankerplatz bleiben. Das Wetter ist keine Aussage über eigene Gefühle oder Gefahren."),
  K("treibholz", "schiff", /treibholz|holz|material|sammel/,
    "Treibholz schwimmt als goldene Planken auf dem Wasser — einfach mit dem Schiff drüberfahren. In Sturmzellen treibt mehr davon, aber Achtung: Dort schaukelt es übel. Bring es zu Kaj, er baut dir was Feines draus."),
  K("ausbau", "schiff", /ausbau|schneller|upgrade|tunen|verbesser/,
    "Kaj kann dein Schiff zweimal ausbauen — erst der Rumpf, dann die Segel. Danach frisst dein Kahn jede Welle von vorne. Bring ihm Treibholz, dann redet er von allein über Preise. Sprich: Er baut, du lieferst."),
  K("ankerplatz", "lore", /ankerplatz|hafen|dieser ort|wer lebt hier/,
    "Am Ankerplatz stehen Mara, Tove, Kaj, Dr. Wiegand und Ben als erfundene Figuren. Mara erzählt vom Meer, Tove von freiwilligen Spielaktionen, Kaj vom Schiff; Wiegand und Ben erzählen aus der erfundenen Welt."),
];

// Phänomen-Fragen dynamisch ergänzen
for (const p of PHENOMENA) {
  const pName = p.name.toLowerCase().replace(/^(der|die|das)\s+/, "");
  KNOWLEDGE.push({
    id: `phen_${p.id}`,
    domain: "symptome",
    pattern: new RegExp(pName.split(/[ ,]/)[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "|" + p.id, "i"),
    answer: () => `${p.name} — ${p.epithet}. Eine erfundene Figur im Archipel „${p.archipelago}“. ${p.insight} Du kannst die Szene freiwillig betrachten, wählen oder verlassen.`,
  });
}

// ─── Persönlichkeits-Wrapper ───────────────────────────────────────

const OPENERS: Record<string, string[]> = {
  "mara": [
    "Aus Maras Seekarten:",
    "Mara erzählt aus der Spielwelt:"
  ],
  "tove": [
    "Toves freiwillige Idee:",
    "Eine Spielnotiz von Tove:"
  ],
  "kaj": [
    "Kaj erklärt das Schiff im Spiel:",
    "Eine Notiz aus Kajs Werkstatt:"
  ],
  "ilse": [
    "Eine Notiz der erfundenen Forscherin:",
    "Wiegands Hinweis zur Spielmetapher:"
  ],
  "ben": [
    "Ben erzählt als erfundene Figur:",
    "Bens Notiz aus dieser Geschichte:"
  ]
};

const pick = <T,>(arr: T[], seed: number): T => arr[Math.abs(seed) % arr.length];

// ─── Hauptfunktion ─────────────────────────────────────────────────

export function npcReply(npc: NpcDef, rawInput: string, save: SaveGame, turnCount: number): DialogReply {
  const input = norm(rawInput);
  const name = save.playerName || "Seefahrer";
  const mem = save.npcMemory[npc.id];

  // 0) Name vergeben
  const nameMatch = rawInput.match(/ich hei(?:ß|ss)e\s+([A-ZÄÖÜ][\p{L}]+)/u);
  if (nameMatch) {
    return {
      text: `Der gewählte Name ist jetzt ${nameMatch[1]}. Du kannst ihn später ändern.`,
      action: { type: "setName", name: nameMatch[1] },
    };
  }

  // 1) KRISENERKENNUNG — höchste Priorität
  if (/(umbringen|suizid|selbstmord|nicht mehr leben|will sterben|sterben will|mich toten|selbstverletz|ritzen|kein ausweg mehr)/.test(input)) {
    return {
      text: "Falls diese Worte deine aktuelle Situation beschreiben: Bei unmittelbarer Gefahr rufe in Deutschland 112. TelefonSeelsorge erreichst du unter 116 123, 0800 111 0 111 oder 0800 111 0 222, kostenfrei und rund um die Uhr. Bei dringenden medizinischen Anliegen außerhalb der Sprechzeiten: 116 117. Dieser vorgefertigte Spieldialog kann deine Lage nicht einschätzen. Du kannst das Spiel unterbrechen und Kontakt zu einem selbst gewählten Menschen suchen.",
    };
  }

  // 2) Aufgaben
  if (/aufgabe|quest|was soll ich|kann ich helfen|arbeit fur mich|brauchst du was/.test(input)) {
    const completable = completableQuests(save, npc.id);
    if (completable.length > 0) {
      const q = completable[0];
      return {
        text: `Die Spielaufgabe „${q.title}“ ist abgeschlossen. Spielbelohnung: ${q.reward}.`,
        action: { type: "turnInQuest", questId: q.id },
      };
    }
    const offer = offerableQuests(save, npc.id);
    if (offer.length > 0) {
      const q = offer[0];
      return {
        text: `Eine freiwillige Spielaufgabe: ${q.desc} (Spielbelohnung: ${q.reward}). Wenn du sie übernehmen möchtest, antworte „Ich mache es“.`,
      };
    }
    const active = activeQuests(save);
    if (active.length > 0) {
      const lines = active.map((q) => `• ${q.title}: ${q.goalDesc(save)}`).join("\n");
      return { text: `Offene freiwillige Spielaufgaben:\n${lines}\nDu bestimmst, ob und wann du sie fortsetzt.` };
    }
    return { text: `Im Moment ist alles vergeben, ${name}. Die See wird schon für Nachschub sorgen — das tut sie immer.` };
  }

  if (/^(ich mache es|ich ubernehme die aufgabe|ich nehme die aufgabe an)\b/.test(input)) {
    const offer = offerableQuests(save, npc.id)[0];
    if (offer) {
      return {
        text: `Die freiwillige Spielaufgabe „${offer.title}“ steht jetzt im Journal. ${offer.goalDesc(save)} Du bestimmst das Tempo.`,
        action: { type: "acceptQuest", questId: offer.id },
      };
    }
    const own = activeQuests(save).find((q) => q.giver === npc.id || q.turnIn === npc.id);
    if (own) {
      return { text: `Du hast den Auftrag ja schon an der Angel: „${own.title}" — ${own.goalDesc(save)}. Ich warte hier, keine Eile.` };
    }
    return { text: pick(["Das freut mich, " + name + ".", "Abgemacht — worauf auch immer du dich gerade freust, ich freue mich mit.", "Gut so. Sag Bescheid, wenn du was brauchst."], turnCount) };
  }

  // 3) Smalltalk
  if (/^(hi|hallo|hey|servus|moin|na |guten tag|guten morgen|guten abend)/.test(input)) {
    return { text: mem?.met ? npc.greetingAgain.replace("{name}", name) : npc.greeting };
  }
  if (/wie geht|wie fuhlst|alles gut|was machst du/.test(input)) {
    const moods: Record<string, string> = {
  "mara": "Mara prüft gerade die Seekarte. Sie erzählt aus der Spielwelt.",
  "tove": "Tove sammelt freiwillige Ideen für Spielaktionen. Du brauchst ihr nichts Persönliches zu berichten.",
  "kaj": "Kaj wartet an seiner Werkbank. Schiffsausbau ist eine optionale Spielaufgabe.",
  "ilse": "Wiegand sortiert ihre erfundenen Seekarten; persönliche Daten sind dafür nicht erforderlich.",
  "ben": "Ben sitzt als erfundene Figur am Feuer. Sein Text ist kein Bericht eines realen Betroffenen."
};
    return { text: moods[npc.id] ?? "Es geht. Und dir?" };
  }
  if (/danke/.test(input)) {
    return { text: pick(["Nichts zu danken. Dafür ist ein Hafen da.", "Gern geschehen — und pass auf dich auf da draußen.", "Immer wieder gern, " + name + "."], turnCount) };
  }
  if (/tschuss|auf wiedersehen|bye|leb wohl|machs gut|ich muss weiter/.test(input)) {
    return { text: pick(["Bis zu einem selbst gewählten nächsten Besuch, " + name + ".", "Leb wohl — der Ankerplatz bleibt, wo er ist. Komm wieder.", "Segel gut. Und falls es stürmt: Du weißt, wo du uns findest."], turnCount) };
  }
  if (/wer bist du|was machst du hier|dein name/.test(input)) {
    return { text: mem?.met ? npc.greeting : npc.greeting };
  }

  // 4) Gefühle des Spielers (Empathie, vor Wissensbasis)
  if (/ich habe angst|mir ist angst|ich bin traurig|ich fuhle mich allein|ich bin mude|ich kann nicht mehr|es ist zu viel|ich bin verzweifelt/.test(input)) {
    const comfort: Record<string, string> = {
  "mara": "Der Spieldialog kann nicht einschätzen, wie es dir geht. Du musst hier nichts lösen oder offenlegen. Du kannst pausieren, das Spiel verlassen oder einen selbst gewählten Menschen kontaktieren. In Deutschland ist TelefonSeelsorge unter 116 123 rund um die Uhr kostenfrei erreichbar; bei unmittelbarer Gefahr gilt 112.",
  "tove": "Der Spieldialog kann nicht einschätzen, wie es dir geht. Du musst hier nichts lösen oder offenlegen. Du kannst pausieren, das Spiel verlassen oder einen selbst gewählten Menschen kontaktieren. In Deutschland ist TelefonSeelsorge unter 116 123 rund um die Uhr kostenfrei erreichbar; bei unmittelbarer Gefahr gilt 112.",
  "kaj": "Der Spieldialog kann nicht einschätzen, wie es dir geht. Du musst hier nichts lösen oder offenlegen. Du kannst pausieren, das Spiel verlassen oder einen selbst gewählten Menschen kontaktieren. In Deutschland ist TelefonSeelsorge unter 116 123 rund um die Uhr kostenfrei erreichbar; bei unmittelbarer Gefahr gilt 112.",
  "ilse": "Der Spieldialog kann nicht einschätzen, wie es dir geht. Du musst hier nichts lösen oder offenlegen. Du kannst pausieren, das Spiel verlassen oder einen selbst gewählten Menschen kontaktieren. In Deutschland ist TelefonSeelsorge unter 116 123 rund um die Uhr kostenfrei erreichbar; bei unmittelbarer Gefahr gilt 112.",
  "ben": "Der Spieldialog kann nicht einschätzen, wie es dir geht. Du musst hier nichts lösen oder offenlegen. Du kannst pausieren, das Spiel verlassen oder einen selbst gewählten Menschen kontaktieren. In Deutschland ist TelefonSeelsorge unter 116 123 rund um die Uhr kostenfrei erreichbar; bei unmittelbarer Gefahr gilt 112."
};
    return { text: comfort[npc.id] ?? comfort.tove };
  }

  // 5) Wissensbasis
  for (const entry of KNOWLEDGE) {
    if (entry.pattern.test(input)) {
      const known = mem?.topics.includes(entry.id);
      const opener = pick(OPENERS[npc.id] ?? OPENERS.mara, turnCount + entry.id.length);
      const text = (known ? "Zur Orientierung in der Spielwelt: " : opener + " ") + entry.answer(npc, save);
      if (!npc.domains.includes(entry.domain)) {
        const ref = npc.refersTo[entry.domain];
        return {
          text: `${entry.answer(npc, save)}${ref ? `\n\nIn der Spielwelt erzählt auch ${ref} zu diesem Thema. Diese Figur ersetzt keine fachliche Anlaufstelle.` : ""}`,
        };
      }
      return { text };
    }
  }

  // 6) Fallback
  const fallbacks: Record<string, string[]> = {
  "mara": [
    "Für diese Eingabe gibt es hier keine passende vorgefertigte Antwort. Du kannst nach der Spielwelt fragen, eine Antwortoption wählen oder das Gespräch schließen."
  ],
  "tove": [
    "Für diese Eingabe gibt es hier keine passende vorgefertigte Antwort. Du kannst nach der Spielwelt fragen, eine Antwortoption wählen oder das Gespräch schließen."
  ],
  "kaj": [
    "Für diese Eingabe gibt es hier keine passende vorgefertigte Antwort. Du kannst nach der Spielwelt fragen, eine Antwortoption wählen oder das Gespräch schließen."
  ],
  "ilse": [
    "Für diese Eingabe gibt es hier keine passende vorgefertigte Antwort. Du kannst nach der Spielwelt fragen, eine Antwortoption wählen oder das Gespräch schließen."
  ],
  "ben": [
    "Für diese Eingabe gibt es hier keine passende vorgefertigte Antwort. Du kannst nach der Spielwelt fragen, eine Antwortoption wählen oder das Gespräch schließen."
  ]
};
  return { text: pick(fallbacks[npc.id] ?? fallbacks.mara, turnCount + input.length) };
}

export function questById(id: string) {
  return QUESTS.find((q) => q.id === id);
}
