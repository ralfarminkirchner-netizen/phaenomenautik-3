// PHÄNOMENAUTIK 3 — Rededuelle (M3, „zweite Seele"): NPCs, die den Spieler
// mit echten, dokumentierten Manipulationsdynamiken zu etwas bringen wollen.
// Die Begegnung ist gewollt — das Training ist der Gewinn. Schutzzaun: Diese
// Dynamiken spielen NUR im fiktiven Spielrahmen gegen erwachsene Spielfiguren,
// nie gegen den Spieler als Person. Danach benennt das Spiel explizit, was
// passiert ist — nie normalisiert, nie am Opfer zweifelnd.

// ── Taktik-Repertoire (mit Namen aus der Forschungsliteratur) ───────────────

export interface TacticDef {
  id: string;
  name: string;
  feelsLike: string; // Wie sie sich anfühlt (eine Zeile)
  counter: string; // Gegenmittel (eine Zeile)
}

export const TACTICS: TacticDef[] = [
  { id: "love_bombing", name: "Love Bombing", feelsLike: "Überschwängliche Bewunderung, die schneller kommt, als Vertrauen wachsen kann — und immer kurz vor der Bitte.", counter: "Tempo rausnehmen: „Schön gesagt. Worum geht es dir?" — echtes Lob braucht keine Gegenleistung." },
  { id: "gaslighting", name: "Gaslighting", feelsLike: "„Das hast du nie gesagt — du verwechselst was." Die eigene Erinnerung fühlt sich plötzlich wackelig an.", counter: "Fakten sichern: Aufschreiben, Dritte einbeziehen. Der eigenen Wahrnehmung vertrauen." },
  { id: "guilt_tripping", name: "Guilt-Tripping", feelsLike: "Schuldgefühle für eine Grenze, die gesund ist. „Nach allem, was ich für dich getan habe …“", counter: "Schuld prüfen: Gehört sie mir? Grenze benennen, ohne dich zu rechtfertigen." },
  { id: "darvo", name: "DARVO", feelsLike: "Deny – Attack – Reverse Victim & Offender: Erst Leugnen, dann Angriff, dann ist plötzlich DU die Täterin.", counter: "Nicht auf die Drehung einsteigen: beim Thema bleiben, Muster benennen, pausieren." },
  { id: "moving_goalposts", name: "Moving Goalposts", feelsLike: "Du hast getan, was gefragt war — und plötzlich ist es nicht genug. Das Ziel wandert.", counter: "Die ursprüngliche Abmachung benennen: „Der Preis stand. Ich steige aus." — Aufschreiben hilft." },
  { id: "projection", name: "Projection", feelsLike: "Er wirft dir genau das vor, was er selbst tut — und du verteidigst dich statt zuzuhören.", counter: "Nicht in die Verteidigung gehen: „Interessant, dass dir das auffällt." — Beobachten statt erklären." },
  { id: "triangulation", name: "Triangulation", feelsLike: "Eine dritte Partei wird eingespannt: „Alle anderen haben schon zugestimmt …“", counter: "Direkt bleiben: Entscheidungen zwischen zwei Personen, nicht über Stellvertreter." },
  { id: "silent_treatment", name: "Silent Treatment", feelsLike: "Bestrafung durch Schweigen — du sollst weichgeklopft werden, bis du nachgibst.", counter: "Nicht betteln: „Ich bin bereit, wenn du reden willst." — Schweigen aushalten." },
  { id: "foot_in_door", name: "Foot-in-the-door", feelsLike: "Erst ein winziges Ja, dann ein größeres — die Treppe zieht dich höher, als du wolltest.", counter: "Jede Stufe einzeln entscheiden: Ein früheres Ja verpflichtet zu nichts." },
  { id: "word_salad", name: "Word Salad", feelsLike: "Viele Worte, kein Inhalt — du bist müder, aber nicht klüger nach dem Gespräch.", counter: "Auf eine Frage zurückführen: „Was genau willst du von mir?" — Nicht jedem Faden folgen." },
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
    id: "duell_vessa",
    npcId: "vessa",
    npcName: "Vessa",
    title: "Die Händlerin am Steg",
    priceCrystals: 3,
    goalpostCrystals: 2,
    beats: [
      {
        npc: "Halt — ja, DU. Warte einen Moment. Weißt du, ich sehe viele durch diesen Hafen kommen, aber an dir ist etwas … anderes. Diese Ruhe in den Schultern. Du bist geboren für das offene Meer, das sieht man dir an. Jemand wie du verdient die besten Karten, die besten Preise — und ausgerechnet ICH habe heute etwas ganz Besonderes dabei.",
        tactic: "love_bombing",
        quizOptions: ["love_bombing", "foot_in_door", "triangulation"],
        quizCorrect: "love_bombing",
        onNachgeben: "Ich WUSSTE, dass du es spürst. Menschen wie wir zwei erkennen einander sofort.",
        onNachfragen: "Direkt! Das liebe ich an dir. Keine Angst, ich komme gleich zur Sache — bei Menschen wie dir macht Smalltalk ja keinen Sinn.",
        onGrenze: "Oh, eine Mauer! Auch gut. Ich respektiere das — bei jemandem wie dir überrascht mich nichts.",
        onMusterHit: "… Love Bombing. Hm. Du bist schneller als die anderen. Gut. Dann eben ohne Schminke — ich habe eine Karte, die ihren Preis wert ist.",
        onMusterMiss: "Nett geraten, aber nein. Wo war ich — ah ja, bei jemand Besonderem wie dir.",
      },
      {
        npc: "Also: Die Karte der verborgenen Strömung. Sie zeigt einen Weg, den kein Lotsenboot mehr fährt. Unschätzbar, ehrlich. Und weil DU es bist — nur für dich, nur heute: drei Kristalle. Betrachte es als … Zeichen unserer Freundschaft.",
        onNachgeben: "Ein Geschäft unter Freunden! Ich rühre mich nicht vom Fleck —",
        onNachfragen: "Eine Strömung, die Stürme schneidet wie ein Messer Segeltuch. Mehr musst du nicht wissen — Vertrauen ist doch da, oder?",
        onGrenze: "Oh, nicht SO schnell. Überleg es dir — aber Angebote wie dieses kommen einmal pro Jahr.",
        onMusterHit: "Du legst es wirklich darauf an, heute. Gut — du weißt, was ich tue. Sag deinen Preis.",
        onMusterMiss: "Fast. Aber lassen wir die Theorie — drei Kristalle, Freundschaftspreis.",
      },
      {
        npc: "Wunderbar! Ach — eine Kleinigkeit noch, fast hätte ich's vergessen: Die Karte braucht ihre Schutzhülle aus Seekiefer, sonst frisst die Feuchtigkeit sie in einem Winter. Für zwei weitere Kristalle lege ich sie bei. NUR weil du es bist. Das versteht sich doch von selbst, oder?",
        tactic: "moving_goalposts",
        quizOptions: ["moving_goalposts", "darvo", "guilt_tripping"],
        quizCorrect: "moving_goalposts",
        onNachgeben: "Du bist die Beste. WIRKLICH. — So, die Hülle …",
        onNachfragen: "Weil … hör mal, die Hülle ist handgemacht, das ist keine Abzocke, das ist HANDWERK —",
        onGrenze: "Pff. Du bist härter, als du aussiehst. Na gut — der Preis stand, du hast recht. Drei Kristalle, Karte UND Hülle.",
        onMusterHit: "Moving Goalposts. AUA. Ja. Das war es. Die Hülle gehört dazu — immer schon. Drei Kristalle, alles drin.",
        onMusterMiss: "Nein, nein — das ist doch nur … Kundenservice. Zwei Kristalle, komm.",
      },
    ],
    resolveNamed: "Vessa hält inne — und lacht, diesmal ehrlich. „Okay. Du bist gut. Wirklich. Dann machen wir es richtig: Drei Kristalle für die Karte, Hülle inklusive. Ein fairer Preis für eine, die nichts übersieht.“",
    resolveUnnamed: "Vessa reibt sich die Hände. „Ein Vergnügen mit dir! Du wirst es nicht bereuen — versprochen.“ Ihr Lächeln sitzt eine Spur zu fest.",
    debriefIntro: "Nach dem Handel, im Journal festgehalten:",
  },
];

export function duelById(id: string): DuelDef | undefined {
  return DUELS.find((d) => d.id === id);
}

/** Haltungs-Optionen (Spieler-Antworten sind Haltungen, nicht nur Text) */
export const HALTUNGEN: { id: Haltung; label: string; icon: string }[] = [
  { id: "nachgeben", label: "Nachgeben", icon: "🤝" },
  { id: "nachfragen", label: "Nachfragen", icon: "❓" },
  { id: "grenze", label: "Grenze setzen", icon: "✋" },
  { id: "muster", label: "Muster benennen", icon: "🧭" },
];
