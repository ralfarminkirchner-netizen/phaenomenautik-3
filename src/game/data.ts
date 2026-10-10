// ═══════════════════════════════════════════════════════════════════
// PHÄNOMENAUTIK — Spieldaten
// Inhaltlich aufgebaut auf dem TRAUMAATLAS (Symptomatlas + Übungsbibliothek)
// Phänomene = Inseln · Übungen = Fähigkeiten · Erregungslage = Elementarsystem
// ═══════════════════════════════════════════════════════════════════

export type Arousal = "hyper" | "hypo" | "both";

export interface ExerciseDef {
  id: string;
  name: string;
  effect: Arousal;          // hyper = beruhigt · hypo = aktiviert · both = gleicht aus
  cost: number;             // Präsenz-Kosten
  power: number;            // Basiswirkung gegen Intensität
  heal: number;             // Stabilitäts-Heilung
  guard?: boolean;          // halbiert nächsten gegnerischen Treffer
  desc: string;
}

export interface PhenomenonAttack {
  name: string;
  min: number;
  max: number;
  line: string;             // Kampftext
}

export interface PhenomenonDef {
  id: string;
  name: string;
  epithet: string;          // Earthbound-mäßiger Beiname
  archipelago: string;
  category: string;         // Atlas-Kategorie
  arousal: Arousal;
  intensity: number;        // HP des Phänomens
  armor: number;            // Schadensreduktion
  xp: number;               // Einsicht
  hue: number;              // Farbwelt (0–360)
  shape: "eye" | "bird" | "golem" | "ghost" | "void" | "fish" | "crystal" | "storm";
  spriteScale: number;
  attacks: PhenomenonAttack[];
  intro: string[];          // Text beim Anlanden
  understand: string[];     // Zeilen beim „Verstehen“ (rotierend)
  winLine: string;          // wenn überwunden
  peaceLine: string;        // wenn verstanden & integriert
  insight: string;          // Journaleintrag (Atlas-Wissen)
  final?: boolean;
}

export interface ItemDef {
  id: string;
  name: string;
  heal: number;
  desc: string;
}

// ─── Übungen (aus der Atlas-Übungsbibliothek) ─────────────────────

export const EXERCISES: ExerciseDef[] = [
  {
    id: "erdung",
    name: "5-4-3-2-1-Erdung",
    effect: "hyper",
    cost: 6,
    power: 14,
    heal: 2,
    desc: "Freiwillige Idee: etwas im Raum wahrnehmen, das angenehm oder neutral ist. Du kannst die Spielaktion wählen, ohne sie körperlich auszuführen.",
  },
  {
    id: "seufzer",
    name: "Physiologischer Seufzer",
    effect: "hyper",
    cost: 5,
    power: 11,
    heal: 4,
    desc: "Freiwillige Idee: den eigenen Atem bemerken, ohne ihn zu verändern. Atemvorgaben sind für diese Spielaktion nicht nötig.",
  },
  {
    id: "voo",
    name: "Der Voo-Klang",
    effect: "hyper",
    cost: 9,
    power: 17,
    heal: 6,
    desc: "Freiwillige Idee: einen leisen Ton hören oder summen, wenn das angenehm ist. Schweigen und Überspringen sind gleichwertige Möglichkeiten.",
  },
  {
    id: "schuetteln",
    name: "Kleine Bewegung",
    effect: "hyper",
    cost: 12,
    power: 24,
    heal: 0,
    desc: "Freiwillige Idee: eine kleine Bewegung wählen, wenn sie angenehm ist. Zittern muss weder ausgelöst noch verstärkt werden.",
  },
  {
    id: "aktivierung",
    name: "Orientierung wählen",
    effect: "hypo",
    cost: 6,
    power: 14,
    heal: 2,
    desc: "Freiwillige Idee: einen Gegenstand im Raum betrachten oder sich etwas bewegen. Es gibt keine Pflicht zu Aktivierung.",
  },
  {
    id: "orientierung",
    name: "Gegenstand benennen",
    effect: "both",
    cost: 5,
    power: 10,
    heal: 0,
    desc: "Freiwillige Idee: einen gut sichtbaren Gegenstand benennen. Du kannst auch nur die fiktive Szene lesen.",
  },
  {
    id: "pendeln",
    name: "Pendeln",
    effect: "both",
    cost: 9,
    power: 16,
    heal: 3,
    desc: "Freiwillige Idee: die Aufmerksamkeit kurz auf etwas Neutrales richten. Belastende Empfindungen müssen dafür nicht aufgesucht werden.",
  },
  {
    id: "koerperscan",
    name: "Kurzer Körperscan",
    effect: "both",
    cost: 8,
    power: 12,
    heal: 5,
    guard: true,
    desc: "Freiwillige Idee: etwas Angenehmes oder Neutrales bemerken. Nach innen zu schauen ist keine Voraussetzung.",
  },
  {
    id: "ort",
    name: "Selbst gewählter Ort",
    effect: "both",
    cost: 14,
    power: 8,
    heal: 18,
    desc: "Ein selbst gewählter, realer oder erfundener Ort kann als Bild dienen. Du musst dir keinen vollkommen sicheren Ort vorstellen.",
  },
  {
    id: "beruehrung",
    name: "Berührung wählen",
    effect: "hyper",
    cost: 7,
    power: 9,
    heal: 10,
    desc: "Freiwillige Idee: eine angenehme Berührung wählen. Berührung und Kontakt mit dem eigenen Körper können ausgelassen werden.",
  },
  {
    id: "coregulation",
    name: "Co-Regulation",
    effect: "both",
    cost: 13,
    power: 20,
    heal: 8,
    desc: "Freiwillige Idee: Kontakt zu einem selbst gewählten Menschen suchen. Die Spielaktion verlangt keinen Kontakt und verspricht keine Wirkung.",
  },
];

export const ITEMS: ItemDef[] = [
  { id: "wasser", name: "Warmes Wasser", heal: 16, desc: "Eine Ressource für die Spielfigur. Trinken ist für die Spielaktion nicht erforderlich." },
  { id: "karte", name: "Notfallkarte", heal: 32, desc: "Eine Karte als Spielressource; sie ersetzt keinen selbst vereinbarten Unterstützungsplan." },
  { id: "anker", name: "Ankerstein", heal: 0, desc: "Erhöht den Spielwert Präsenz um 14." },
];

// ─── Phänomene = Inseln ────────────────────────────────────────────

export const PHENOMENA: PhenomenonDef[] = [
  {
    id: "flashback",
    name: "Der Flashback-Falter",
    epithet: "Hüter des gestrigen Jetzt",
    archipelago: "Das Wiederkehr-Riff",
    category: "Wiedererleben (Intrusionen)",
    arousal: "hyper",
    intensity: 46,
    armor: 0,
    xp: 22,
    hue: 300,
    shape: "eye",
    spriteScale: 1.0,
    attacks: [
      { name: "Windbogen", min: 5, max: 9, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
      { name: "Lichtwechsel", min: 4, max: 8, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
      { name: "Wellenzug", min: 3, max: 7, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
    ],
    intro: [
      "Auf dem Riff stehen Bilderrahmen im Wind. Ein Falter trägt schimmernde Papierflügel.",
      "Die Bilder gehören zur erfundenen Inselgeschichte. Du bestimmst, wie nah die Spielfigur kommt.",
      "Ein Rahmen zeigt den heutigen Hafen, ein anderer eine alte Seekarte.",
    ],
    understand: [
      "Die Bilder gehören zur erfundenen Inselgeschichte. Du bestimmst, wie nah die Spielfigur kommt.",
      "Die Spielfigur betrachtet einen Teil der Landschaft. Abstand halten bleibt möglich.",
      "Die Szene wartet auf deine Wahl. Ein Abschluss oder Rückzug ist jederzeit möglich.",
    ],
    winLine: "Der Falter legt ein Papierbild auf einen Stein.",
    peaceLine: "Der Falter lässt der Spielfigur Platz auf dem Weg.",
    insight: "Die Szene verwendet wechselnde Bilder als Metapher für Wiedererleben. Sie erklärt keine Erinnerungen der spielenden Person.",
  },
  {
    id: "albtraum",
    name: "Mura, die Albdrossel",
    epithet: "Sängerin der schlaflosen Stunden",
    archipelago: "Das Wiederkehr-Riff",
    category: "Wiedererleben (Intrusionen)",
    arousal: "hyper",
    intensity: 52,
    armor: 1,
    xp: 26,
    hue: 265,
    shape: "bird",
    spriteScale: 1.05,
    attacks: [
      { name: "Windbogen", min: 5, max: 9, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
      { name: "Lichtwechsel", min: 4, max: 10, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
      { name: "Wellenzug", min: 6, max: 8, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
    ],
    intro: [
      "Über der dämmernden Insel kreist Mura, ein Vogel mit gemustertem Gefieder.",
      "Sein Lied verändert die Farben des Himmels.",
      "Die Spielfigur kann zuhören, Abstand halten oder den Weg zurück wählen.",
    ],
    understand: [
      "Sein Lied verändert die Farben des Himmels.",
      "Die Spielfigur betrachtet einen Teil der Landschaft. Abstand halten bleibt möglich.",
      "Die Szene wartet auf deine Wahl. Ein Abschluss oder Rückzug ist jederzeit möglich.",
    ],
    winLine: "Mura zieht weiter; sein Lied bleibt am Horizont.",
    peaceLine: "Mura setzt sich auf einen entfernten Mast.",
    insight: "Die Trauminsel erzählt eine erfundene Geschichte. Ein anderes Ende lässt sich im Spiel wählen; das ist kein Behandlungsversprechen.",
  },
  {
    id: "hypervigilanz",
    name: "Der Hypervigilanz-Wächter",
    epithet: "Der niemals blinkt",
    archipelago: "Der Alarm-Atoll",
    category: "Anhaltende Erregung",
    arousal: "hyper",
    intensity: 58,
    armor: 1,
    xp: 30,
    hue: 15,
    shape: "crystal",
    spriteScale: 1.1,
    attacks: [
      { name: "Windbogen", min: 6, max: 10, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
      { name: "Lichtwechsel", min: 5, max: 9, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
      { name: "Wellenzug", min: 4, max: 8, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
    ],
    intro: [
      "Ein kristallener Wächter steht zwischen den Felsen und dreht sein Licht über die Bucht.",
      "Der Weg hat mehrere Abzweigungen. Keine davon ist vorgeschrieben.",
      "Die Spielfigur betrachtet das Licht aus selbst gewähltem Abstand.",
    ],
    understand: [
      "Der Weg hat mehrere Abzweigungen. Keine davon ist vorgeschrieben.",
      "Die Spielfigur betrachtet einen Teil der Landschaft. Abstand halten bleibt möglich.",
      "Die Szene wartet auf deine Wahl. Ein Abschluss oder Rückzug ist jederzeit möglich.",
    ],
    winLine: "Der Wächter richtet sein Licht auf die äußere Bucht.",
    peaceLine: "Neben dem Wächter bleibt ein Weg offen.",
    insight: "Der Wächter ist eine Metapher für Wachsamkeit. Seine Spielwerte sagen nichts über Gefahr oder Wachsamkeit im Leben der spielenden Person aus.",
  },
  {
    id: "herzrasen",
    name: "Das Herzrasen",
    epithet: "Galopp ohne Pferd",
    archipelago: "Der Alarm-Atoll",
    category: "Anhaltende Erregung",
    arousal: "hyper",
    intensity: 50,
    armor: 0,
    xp: 26,
    hue: 350,
    shape: "eye",
    spriteScale: 0.9,
    attacks: [
      { name: "Windbogen", min: 5, max: 9, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
      { name: "Lichtwechsel", min: 6, max: 10, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
      { name: "Wellenzug", min: 4, max: 8, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
    ],
    intro: [
      "Ein rotes Trommelwesen springt über die Steine des Atolls.",
      "Sein Rhythmus ist Teil der erfundenen Kulisse.",
      "Die Spielfigur kann dem Rhythmus folgen oder ihn aus der Ferne betrachten.",
    ],
    understand: [
      "Sein Rhythmus ist Teil der erfundenen Kulisse.",
      "Die Spielfigur betrachtet einen Teil der Landschaft. Abstand halten bleibt möglich.",
      "Die Szene wartet auf deine Wahl. Ein Abschluss oder Rückzug ist jederzeit möglich.",
    ],
    winLine: "Das Trommelwesen hüpft hinter einen Felsen.",
    peaceLine: "Zwischen den Schlägen entsteht in der Szene eine Pause.",
    insight: "Das Trommelwesen stellt einen Spielrhythmus dar. Herzrasen oder Atemnot lassen sich hier weder beurteilen noch körperlich behandeln.",
  },
  {
    id: "vermeidung",
    name: "Vermeidia, die Ausweicherin",
    epithet: "Herrin der Umwege",
    archipelago: "Die Nebelbank",
    category: "Vermeidung & Rückzug",
    arousal: "hypo",
    intensity: 55,
    armor: 2,
    xp: 30,
    hue: 190,
    shape: "ghost",
    spriteScale: 1.0,
    attacks: [
      { name: "Windbogen", min: 4, max: 8, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
      { name: "Lichtwechsel", min: 5, max: 9, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
      { name: "Wellenzug", min: 3, max: 7, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
    ],
    intro: [
      "Nebel liegt über Wegweisern, die in verschiedene Richtungen zeigen.",
      "Vermeidia zeichnet einen weiteren Pfad in den Sand.",
      "Die Spielfigur darf einen Umweg, einen kurzen Weg oder den Rückweg wählen.",
    ],
    understand: [
      "Vermeidia zeichnet einen weiteren Pfad in den Sand.",
      "Die Spielfigur betrachtet einen Teil der Landschaft. Abstand halten bleibt möglich.",
      "Die Szene wartet auf deine Wahl. Ein Abschluss oder Rückzug ist jederzeit möglich.",
    ],
    winLine: "Zwischen zwei Wegweisern wird der Sand sichtbar.",
    peaceLine: "Vermeidia hält mehrere Wege offen.",
    insight: "Die Insel zeigt Entscheidungen über Nähe und Abstand. Kein gewählter Weg beweist Mut, Versagen oder ein persönliches Vermeidungsmuster.",
  },
  {
    id: "verdraengung",
    name: "Der Verdränger",
    epithet: "Kehrt alles unter den Teppich",
    archipelago: "Die Nebelbank",
    category: "Vermeidung & Rückzug",
    arousal: "hypo",
    intensity: 60,
    armor: 2,
    xp: 32,
    hue: 210,
    shape: "golem",
    spriteScale: 1.05,
    attacks: [
      { name: "Windbogen", min: 5, max: 10, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
      { name: "Lichtwechsel", min: 6, max: 9, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
      { name: "Wellenzug", min: 4, max: 8, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
    ],
    intro: [
      "Zwischen geschlossenen Kisten fegt eine Gestalt goldenen Staub zusammen.",
      "Auf den Kisten stehen erfundene Ortsnamen.",
      "Keine Kiste muss geöffnet werden; die Szene verlangt keine Suche nach eigenen Erinnerungen.",
    ],
    understand: [
      "Auf den Kisten stehen erfundene Ortsnamen.",
      "Die Spielfigur betrachtet einen Teil der Landschaft. Abstand halten bleibt möglich.",
      "Die Szene wartet auf deine Wahl. Ein Abschluss oder Rückzug ist jederzeit möglich.",
    ],
    winLine: "Der Besen lehnt neben einer geschlossenen Kiste.",
    peaceLine: "Die Gestalt setzt sich auf die Bank und lässt die Kisten stehen.",
    insight: "Die geschlossenen Kisten sind ein erzählerisches Bild. Das Spiel kann keine verborgenen Erinnerungen erschließen oder bestätigen.",
  },
  {
    id: "dissoziation",
    name: "Dissozia, die Glasgeistin",
    epithet: "Sie ist hier und nicht hier",
    archipelago: "Die Glaswelt",
    category: "Dissoziation & Erstarrung",
    arousal: "hypo",
    intensity: 62,
    armor: 1,
    xp: 34,
    hue: 170,
    shape: "ghost",
    spriteScale: 1.1,
    attacks: [
      { name: "Windbogen", min: 5, max: 9, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
      { name: "Lichtwechsel", min: 6, max: 10, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
      { name: "Wellenzug", min: 4, max: 8, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
    ],
    intro: [
      "Gläserne Bögen stehen über einem hellen Strand. Dahinter bewegt sich Dissozia.",
      "Die Glasgeistin bleibt Teil dieser erfundenen Landschaft.",
      "Die Spielfigur kann die Bögen betrachten, ohne sie zu durchqueren.",
    ],
    understand: [
      "Die Glasgeistin bleibt Teil dieser erfundenen Landschaft.",
      "Die Spielfigur betrachtet einen Teil der Landschaft. Abstand halten bleibt möglich.",
      "Die Szene wartet auf deine Wahl. Ein Abschluss oder Rückzug ist jederzeit möglich.",
    ],
    winLine: "Ein Bogen spiegelt jetzt das Wasser.",
    peaceLine: "Dissozia zeigt einen Weg um das Glas herum.",
    insight: "Die Glaswelt nutzt Distanz als Metapher. Aus Spielentscheidungen werden keine Aussagen über Dissoziation oder die eigene Verfassung abgeleitet.",
  },
  {
    id: "erstarrung",
    name: "Erstarrion",
    epithet: "Der eingefrorene Schrei",
    archipelago: "Die Glaswelt",
    category: "Dissoziation & Erstarrung",
    arousal: "hypo",
    intensity: 66,
    armor: 3,
    xp: 38,
    hue: 200,
    shape: "crystal",
    spriteScale: 1.15,
    attacks: [
      { name: "Windbogen", min: 6, max: 10, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
      { name: "Lichtwechsel", min: 5, max: 9, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
      { name: "Wellenzug", min: 7, max: 11, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
    ],
    intro: [
      "Zwischen Eisblöcken steht Erstarrion, eine langsam schimmernde Figur.",
      "Am Ufer sind eine Bank und ein offener Rückweg zu sehen.",
      "Stillzustehen ist in dieser Szene eine mögliche Wahl.",
    ],
    understand: [
      "Am Ufer sind eine Bank und ein offener Rückweg zu sehen.",
      "Die Spielfigur betrachtet einen Teil der Landschaft. Abstand halten bleibt möglich.",
      "Die Szene wartet auf deine Wahl. Ein Abschluss oder Rückzug ist jederzeit möglich.",
    ],
    winLine: "Ein Licht wandert über die Eisfläche.",
    peaceLine: "Erstarrion hält Abstand zur Spielfigur.",
    insight: "Das Eis ist eine Metapher in einer erfundenen Szene. Bewegung und Stillstand sind hier freiwillige Spielentscheidungen, keine körperliche Aufgabe.",
  },
  {
    id: "scham",
    name: "Der Scham-Golem",
    epithet: "Gemauert aus fremden Urteilen",
    archipelago: "Das Trauer-Atoll",
    category: "Gefühle & Selbstbild",
    arousal: "both",
    intensity: 72,
    armor: 2,
    xp: 42,
    hue: 0,
    shape: "golem",
    spriteScale: 1.2,
    attacks: [
      { name: "Windbogen", min: 7, max: 11, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
      { name: "Lichtwechsel", min: 6, max: 10, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
      { name: "Wellenzug", min: 5, max: 9, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
    ],
    intro: [
      "Der Golem baut eine Mauer aus Steinen mit verblassten Schriftzeichen.",
      "Die Schrift gehört zur Insel; sie bewertet die spielende Person nicht.",
      "Die Spielfigur kann die Mauer ansehen oder den freien Uferweg nehmen.",
    ],
    understand: [
      "Die Schrift gehört zur Insel; sie bewertet die spielende Person nicht.",
      "Die Spielfigur betrachtet einen Teil der Landschaft. Abstand halten bleibt möglich.",
      "Die Szene wartet auf deine Wahl. Ein Abschluss oder Rückzug ist jederzeit möglich.",
    ],
    winLine: "Der Golem legt seinen nächsten Stein ab.",
    peaceLine: "Neben der Mauer bleibt Platz für einen Weg.",
    insight: "Die Szene verwendet eine Mauer als Bild für Scham. Sie behauptet keine Ursache und enthält keine Bewertung des eigenen Werts.",
  },
  {
    id: "leere",
    name: "Die große Leere",
    epithet: "Ein Loch, das vorher ein Gefühl war",
    archipelago: "Das Trauer-Atoll",
    category: "Gefühle & Selbstbild",
    arousal: "hypo",
    intensity: 68,
    armor: 1,
    xp: 40,
    hue: 230,
    shape: "void",
    spriteScale: 1.25,
    attacks: [
      { name: "Windbogen", min: 6, max: 10, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
      { name: "Lichtwechsel", min: 5, max: 9, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
      { name: "Wellenzug", min: 7, max: 11, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
    ],
    intro: [
      "Eine runde Schale liegt in einer stillen Senke. Ihr Rand spiegelt den Himmel.",
      "Die Insel enthält viel freien Raum.",
      "Die Spielfigur darf bleiben, weitergehen oder die Szene schließen.",
    ],
    understand: [
      "Die Insel enthält viel freien Raum.",
      "Die Spielfigur betrachtet einen Teil der Landschaft. Abstand halten bleibt möglich.",
      "Die Szene wartet auf deine Wahl. Ein Abschluss oder Rückzug ist jederzeit möglich.",
    ],
    winLine: "Ein Wolkenschatten zieht über die Schale.",
    peaceLine: "Die Schale bleibt stehen; der Weg daneben ist offen.",
    insight: "Freier Raum ist hier ein erzählerisches Bild. Die Szene erklärt keine Gefühlslage und verspricht keine Rückkehr bestimmter Gefühle.",
  },
  {
    id: "misstrauen",
    name: "Misstrania",
    epithet: "Prüft jeden Anker doppelt",
    archipelago: "Das Misstrauens-Riff",
    category: "Beziehungen",
    arousal: "both",
    intensity: 70,
    armor: 2,
    xp: 42,
    hue: 120,
    shape: "fish",
    spriteScale: 1.1,
    attacks: [
      { name: "Windbogen", min: 6, max: 10, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
      { name: "Lichtwechsel", min: 7, max: 11, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
      { name: "Wellenzug", min: 5, max: 9, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
    ],
    intro: [
      "Misstrania prüft Seile und Anker am Rand des Riffs.",
      "Die Spielfigur steht auf einem eigenen Steg.",
      "Abstand und Kontakt lassen sich in dieser Szene selbst wählen.",
    ],
    understand: [
      "Die Spielfigur steht auf einem eigenen Steg.",
      "Die Spielfigur betrachtet einen Teil der Landschaft. Abstand halten bleibt möglich.",
      "Die Szene wartet auf deine Wahl. Ein Abschluss oder Rückzug ist jederzeit möglich.",
    ],
    winLine: "Misstrania legt ein Seil zur Seite.",
    peaceLine: "Zwischen den Stegen bleibt ein ruhiger Abstand.",
    insight: "Die Anker erzählen von Abmachungen in einer fiktiven Welt. Das Spiel beurteilt weder Vertrauen noch reale Beziehungen.",
  },
  {
    id: "naehe",
    name: "Das Nähe-Phantom",
    epithet: "Kommt her! Geh weg! Komm her!",
    archipelago: "Das Misstrauens-Riff",
    category: "Beziehungen",
    arousal: "both",
    intensity: 74,
    armor: 1,
    xp: 46,
    hue: 45,
    shape: "ghost",
    spriteScale: 1.05,
    attacks: [
      { name: "Windbogen", min: 6, max: 10, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
      { name: "Lichtwechsel", min: 7, max: 11, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
      { name: "Wellenzug", min: 5, max: 10, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
    ],
    intro: [
      "Das Nähe-Phantom erscheint zwischen zwei Stegen, während Wasser dazwischen fließt.",
      "Beide Stege besitzen einen Weg zurück zum Ufer.",
      "Die Spielfigur entscheidet selbst, welchen Abstand sie behalten möchte.",
    ],
    understand: [
      "Beide Stege besitzen einen Weg zurück zum Ufer.",
      "Die Spielfigur betrachtet einen Teil der Landschaft. Abstand halten bleibt möglich.",
      "Die Szene wartet auf deine Wahl. Ein Abschluss oder Rückzug ist jederzeit möglich.",
    ],
    winLine: "Das Phantom bleibt am anderen Steg.",
    peaceLine: "Die beiden Stege bleiben verbunden, ohne dass jemand hinübergehen muss.",
    insight: "Die Szene zeigt verschiedene Abstände. Sie legt keine Bindungsdiagnose nahe und fordert keine Annäherung.",
  },
  // ── Finale ──
  {
    id: "sturmherd",
    name: "Der Sturmherd",
    epithet: "Das Unerzählte in der Mitte aller Karten",
    archipelago: "Das Auge des Atlanten",
    category: "Das Ganze",
    arousal: "both",
    intensity: 130,
    armor: 2,
    xp: 150,
    hue: 280,
    shape: "storm",
    spriteScale: 1.4,
    attacks: [
      { name: "Windbogen", min: 9, max: 14, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
      { name: "Lichtwechsel", min: 8, max: 13, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
      { name: "Wellenzug", min: 7, max: 12, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
      { name: "Wolkenkreis", min: 8, max: 12, line: "Die Landschaft verändert sich im nächsten freiwilligen Spielzug." },
    ],
    intro: [
      "In der Mitte des Meeres drehen sich helle und dunkle Wolken über einem Felsen.",
      "Der Sturmherd gehört zur Geschichte dieser Spielwelt.",
      "Auch hier bleibt der Rückweg eine vollständige Wahl. Es muss nichts Persönliches erzählt werden.",
    ],
    understand: [
      "Der Sturmherd gehört zur Geschichte dieser Spielwelt.",
      "Die Spielfigur betrachtet einen Teil der Landschaft. Abstand halten bleibt möglich.",
      "Die Szene wartet auf deine Wahl. Ein Abschluss oder Rückzug ist jederzeit möglich.",
    ],
    winLine: "Die Wolken geben einen Blick auf den Felsen frei.",
    peaceLine: "Am Rand des Sturmherds öffnet sich ein ruhiger Seeweg.",
    insight: "Der Sturmherd bildet einen erzählerischen Abschluss. Er ist weder die Geschichte der spielenden Person noch ein Modell für Therapie.",
    final: true,
  },
];

// ─── Hilfslogik ────────────────────────────────────────────────────

// Wirkungsmatrix: Übungseffekt vs. Erregungslage des Phänomens
export function effectiveness(effect: Arousal, target: Arousal): number {
  if (effect === "both") return 1.15;
  if (target === "both") return 1.0;
  if (effect === target) return 1.6;
  return 0.5;
}

export function effectivenessLabel(mult: number): string | null {
  if (mult >= 1.5) return "Höherer Spielwert";
  if (mult <= 0.6) return "Niedrigerer Spielwert";
  return null;
}

export const AROUSAL_LABEL: Record<Arousal, string> = {
  hyper: "Hohe Aktivität (Spieltyp)",
  hypo: "Niedrige Aktivität (Spieltyp)",
  both: "Wechselnde Aktivität (Spieltyp)",
};

// Levelkurve: Einsicht → Level
export function levelForXp(xp: number): number {
  // Level n braucht kumulativ n*(n+1)*25 Einsicht
  let lvl = 1;
  while ((lvl + 1) * (lvl + 2) * 25 <= xp) lvl++;
  return Math.min(lvl, 12);
}

export function maxStability(level: number): number {
  return 42 + (level - 1) * 9;
}
export function maxPresence(level: number): number {
  return 24 + (level - 1) * 6;
}
// Ausdauer (M3: Sprint & Klettern) — regeneriert sich, Essen verbessert sie
export function maxStamina(level: number): number {
  return 20 + (level - 1) * 3;
}

export const INTRO_TEXT = [
  "Ein erfundenes Meer, Inseln und Begegnungen warten auf dieser Seekarte.",
  "Du kannst segeln, lesen und Abstand wählen.",
  "Die Figuren greifen Begriffe aus dem TRAUMAATLAS als Bilder auf.",
  "Diese Bilder erklären keine persönlichen Erfahrungen.",
  "",
  "Dein Schiff heißt TOLERANZ. Du bestimmst den Weg.",
  "Jede Begegnung lässt sich verlassen.",
  "Körperübungen und persönliche Offenlegung sind nicht erforderlich.",
  "",
  "Wähle eine Insel, wenn du möchtest.",
  "Es gibt keinen richtigen Zeitpunkt und keine Pflicht zum Abschluss.",
  "",
  "Der Ankerplatz bleibt erreichbar.",
];

export const DISCLAIMER =
  "Phänomenautik ist eine fiktive Erkundungs- und Reflexionswelt auf Basis des TRAUMAATLAS. Sie stellt keine Diagnose und bietet keine Behandlung. Deutschland: Bei unmittelbarer Gefahr 112. TelefonSeelsorge: 116 123, 0800 111 0 111 oder 0800 111 0 222, kostenfrei und rund um die Uhr. Bei dringenden medizinischen Anliegen außerhalb der Sprechzeiten: 116 117.";
