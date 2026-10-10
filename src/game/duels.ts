// PHÄNOMENAUTIK 3 — Rededuelle (M3, „zweite Seele"): NPCs, die den Spieler
// mit erzählten Gesprächsmustern. Kein automatisches Urteil über reale Menschen.
// Die Begegnung und jede Einordnung sind freiwillig. Diese
// Dynamiken spielen NUR im fiktiven Spielrahmen gegen erwachsene Spielfiguren,
// nie gegen die spielende Person. Einordnungen bleiben auf die Szene begrenzt.
// Fachliche und Betroffenen-Prüfung offen.

// ── Taktik-Repertoire (mit Namen aus der Forschungsliteratur) ───────────────

export interface TacticDef {
  id: string;
  name: string;
  feelsLike: string; // Wie sie sich anfühlt (eine Zeile)
  counter: string; // Gegenmittel (eine Zeile)
}

export const TACTICS: TacticDef[] = [
  { id: "love_bombing", name: "Love Bombing", feelsLike: "Sehr überschwängliches Lob geht in dieser Szene einem Angebot voraus. Einzelne freundliche Sätze beweisen kein Muster.", counter: "Die Spielfigur kann sagen: „Ich möchte erst wissen, was angeboten wird.“" },
  { id: "gaslighting", name: "Gaslighting", feelsLike: "Die Figur bestreitet in diesem Beispiel eine zuvor klar erzählte Abmachung. Die Bezeichnung ist keine Diagnose einer Person.", counter: "Die Spielfigur kann die Abmachung wiederholen oder das Gespräch beenden." },
  { id: "guilt_tripping", name: "Guilt-Tripping", feelsLike: "In diesem Beispiel verbindet die Figur eine Bitte mit einer Schuldzuweisung.", counter: "Die Spielfigur kann sagen: „Ich entscheide selbst über dieses Angebot.“" },
  { id: "darvo", name: "DARVO", feelsLike: "Die Beispielsituation enthält Leugnen, einen Angriff und eine Umkehr der Rollen. Der Begriff dient nur der Einordnung der Szene.", counter: "Die Spielfigur kann beim Thema bleiben, eine Pause wählen oder das Gespräch verlassen." },
  { id: "moving_goalposts", name: "Moving Goalposts", feelsLike: "In dieser Szene verändert die Figur eine bereits genannte Bedingung.", counter: "Die Spielfigur kann nach dem vollständigen Angebot fragen oder aussteigen." },
  { id: "projection", name: "Projection", feelsLike: "Die Szene legt eine Ähnlichkeit zwischen Vorwurf und Verhalten einer Figur nahe. Ihre innere Absicht lässt sich daraus nicht sicher bestimmen.", counter: "Die Spielfigur kann eine konkrete Frage stellen oder Abstand wählen." },
  { id: "triangulation", name: "Triangulation", feelsLike: "In diesem Beispiel beruft sich die Figur auf Dritte, um Zustimmung zu erreichen.", counter: "Die Spielfigur kann das eigene Angebot unabhängig von Dritten prüfen." },
  { id: "silent_treatment", name: "Silent Treatment", feelsLike: "Dieses erzählte Beispiel verbindet Schweigen mit einer ausdrücklich angekündigten Forderung. Schweigen allein erklärt keine Absicht.", counter: "Die Spielfigur kann eine Pause wählen; sie muss das Gespräch nicht fortsetzen." },
  { id: "foot_in_door", name: "Foot-in-the-door", feelsLike: "Auf eine kleine Bitte folgt in dieser Szene eine größere. Jede Bitte kann gesondert entschieden werden.", counter: "Die Spielfigur kann sagen: „Über die neue Bitte entscheide ich neu.“" },
  { id: "word_salad", name: "Word Salad", feelsLike: "In diesem Beispiel bleibt die zentrale Frage trotz vieler Worte unbeantwortet. Unklare Sprache allein erlaubt keine Bewertung einer Person.", counter: "Die Spielfigur kann nach dem konkreten Angebot fragen oder das Gespräch schließen." },
];

export function tacticById(id: string): TacticDef | undefined {
  return TACTICS.find((t) => t.id === id);
}

// ── Duell-Struktur ───────────────────────────────────────────────────────────

export type Haltung = "nachgeben" | "nachfragen" | "grenze" | "muster";

export interface DuelBeat {
  npc: string; // Typewriter-Zeile des NPC
  tactic?: string; // welche Taktik feuert hier (undefined = keine)
  quizOptions?: string[]; // Muster-Radar: 3 Optionen, davon quizCorrect richtig
  quizCorrect?: string;
  // Reaktionen des NPC je Haltung (nur Beats, auf die geantwortet wird)
  onNachgeben?: string;
  onNachfragen?: string;
  onGrenze?: string;
  onMusterHit?: string; // wenn die Taktik richtig benannt wird
  onMusterMiss?: string; // falsche Benennung
}

export interface DuelDef {
  id: string;
  npcId: string;
  npcName: string;
  title: string; // Journal-Name des Duells
  priceCrystals: number; // was der NPC will (Stufe 1)
  goalpostCrystals: number; // was nachträglich draufgeschlagen wird
  beats: DuelBeat[];
  // Auflösungstexte
  resolveNamed: string; // ≥1 Taktik benannt: NPC entgleist, fairer Handel
  resolveUnnamed: string; // keine benannt: teurer Handel, aber kein Verlust an Würde
  debriefIntro: string; // Rahmung nach §5.2.3
}

export const DUELS: DuelDef[] = [
  {
    "id": "duell_vessa",
    "npcId": "vessa",
    "npcName": "Vessa",
    "title": "Die Händlerin am Steg",
    "priceCrystals": 3,
    "goalpostCrystals": 2,
    "beats": [
      {
        "npc": "Erfundene Szene: Vessa lobt die Seefahrerfigur überschwänglich, bevor sie eine Karte anbietet. Die Figur am Steg ist nicht die spielende Person.",
        "tactic": "love_bombing",
        "quizOptions": [
          "love_bombing",
          "foot_in_door",
          "triangulation"
        ],
        "quizCorrect": "love_bombing",
        "onNachgeben": "Die Seefahrerfigur hört sich das Angebot an. Vessa legt eine Karte auf den Tisch.",
        "onNachfragen": "Die Seefahrerfigur fragt nach dem Inhalt des Angebots. Vessa zeigt die Karte.",
        "onGrenze": "Die Seefahrerfigur lehnt das Angebot ab. Der freie Weg vom Steg bleibt offen.",
        "onMusterHit": "Eine mögliche Einordnung: sehr überschwängliches Lob vor einem Angebot. Die Begriffe beziehen sich nur auf diese erzählte Szene.",
        "onMusterMiss": "Diese Szene enthält überschwängliches Lob vor einem Angebot. Die Auswahl ist kein Test persönlicher Fähigkeiten."
      },
      {
        "npc": "Vessa nennt in der Geschichte drei Kristalle für eine Karte. Dann beruft sie sich darauf, dass andere Figuren schon zugestimmt hätten. In diesem Dialog werden keine Kristalle ausgegeben.",
        "tactic": "triangulation",
        "quizOptions": [
          "guilt_tripping",
          "triangulation",
          "gaslighting"
        ],
        "quizCorrect": "triangulation",
        "onNachgeben": "Die Seefahrerfigur betrachtet das Angebot. Diese Textauswahl hat keine Kosten.",
        "onNachfragen": "Die Seefahrerfigur fragt, was die Karte enthält, unabhängig von den Entscheidungen anderer.",
        "onGrenze": "Die Seefahrerfigur lehnt ab. Vessa legt die Karte zurück auf den Tisch.",
        "onMusterHit": "Eine mögliche Einordnung: Bezug auf andere Figuren soll in diesem Beispiel Zustimmung fördern.",
        "onMusterMiss": "Die Szene nennt andere Figuren als Grund für Zustimmung. Daraus wird keine Fähigkeit oder Schwäche der spielenden Person abgeleitet."
      },
      {
        "npc": "Im nächsten Abschnitt verändert Vessa das Angebot: Zur genannten Karte soll eine Hülle für zwei weitere Kristalle kommen. Der zuvor genannte Preis ist damit unvollständig.",
        "tactic": "moving_goalposts",
        "quizOptions": [
          "projection",
          "moving_goalposts",
          "silent_treatment"
        ],
        "quizCorrect": "moving_goalposts",
        "onNachgeben": "Die Seefahrerfigur sieht sich auch die Hülle an. Im Spiel wird nichts bezahlt.",
        "onNachfragen": "Die Seefahrerfigur fragt nach dem vollständigen Preis und allen Bedingungen.",
        "onGrenze": "Die Seefahrerfigur beendet das Angebot. Der Weg vom Steg bleibt frei.",
        "onMusterHit": "Eine mögliche Einordnung: Eine genannte Bedingung wird nachträglich verändert.",
        "onMusterMiss": "Hier wird der Umfang des Angebots nachträglich verändert. Die Antwort lässt sich überspringen oder neu lesen."
      }
    ],
    "resolveNamed": "Die erfundene Gesprächsszene endet hier. Du hast mögliche Begriffe zu einzelnen Abschnitten gewählt. Es wurden keine Kristalle ausgegeben.",
    "resolveUnnamed": "Die erfundene Gesprächsszene endet hier. Eine Einordnung war freiwillig. Es wurden keine Kristalle ausgegeben.",
    "debriefIntro": "Notizen zur erfundenen Gesprächsszene:"
  }
];

export function duelById(id: string): DuelDef | undefined {
  return DUELS.find((d) => d.id === id);
}

/** Haltungs-Optionen (Spieler-Antworten sind Haltungen, nicht nur Text) */
export const HALTUNGEN: { id: Haltung; label: string; icon: string }[] = [
  { id: "nachgeben", label: "Angebot in der Szene ansehen", icon: "🤝" },
  { id: "nachfragen", label: "Nachfragen", icon: "❓" },
  { id: "grenze", label: "Angebot ablehnen", icon: "✋" },
  { id: "muster", label: "Muster benennen", icon: "🧭" },
];
