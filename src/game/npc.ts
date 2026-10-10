// PHÄNOMENAUTIK 2 — NPCs auf dem Ankerplatz

export type NpcDomain =
  | "meer" | "schiff" | "uebungen" | "symptome" | "wissenschaft" | "gefuehle" | "lore";

export interface NpcDef {
  id: string;
  name: string;
  role: string;
  color: number;       // Low-Poly-Figur
  x: number;           // Position auf dem Ankerplatz (lokal)
  z: number;
  domains: NpcDomain[];
  refersTo: Partial<Record<NpcDomain, string>>; // „Das fragst du besser …“
  greeting: string;
  greetingAgain: string;
  chips: string[];     // Schnellthemen
}

export const NPCS: NpcDef[] = [
  {
    id: "mara",
    name: "Mara",
    role: "die Lotsin",
    color: 0xc97b3d,
    x: -18,
    z: -10,
    domains: ["meer", "schiff", "lore"],
    refersTo: { uebungen: "Tove", symptome: "Tove", wissenschaft: "Dr. Wiegand", gefuehle: "Ben" },
    greeting:
      "He da drüben! Neue Segel in meinem Hafen — das kommt selten genug vor. Ich bin Mara, Lotsin des Ankerplatzes. Ich kenne jede Strömung zwischen hier und dem Sturmherd.",
    greetingAgain: "Willkommen am Ankerplatz, {name}. Du bestimmst, wie lange du bleiben möchtest.",
    chips: ["Wie ist das Wetter?", "Was sind das für Inseln?", "Hast du eine Aufgabe für mich?", "Erzähl mir von diesem Meer"],
  },
  {
    id: "tove",
    name: "Tove",
    role: "die Übungssammlerin",
    color: 0x7fbf6a,
    x: 14,
    z: -22,
    domains: ["uebungen", "symptome", "gefuehle"],
    refersTo: { meer: "Mara", schiff: "Kaj", wissenschaft: "Dr. Wiegand" },
    greeting:
      "Ich bin Tove, eine Figur dieser Spielwelt. Ich sammle freiwillige Ideen für Spielaktionen. Du kannst sie lesen, auslassen oder das Gespräch schließen.",
    greetingAgain: "Willkommen zurück, {name}. Möchtest du von den Spielaktionen lesen?",
    chips: ["Wie wird Panik im Spiel dargestellt?", "Erklär mir eine Übung", "Was ist ein Flashback?", "Hast du eine Aufgabe für mich?"],
  },
  {
    id: "kaj",
    name: "Kaj",
    role: "der Schiffbauer",
    color: 0x8a6f4d,
    x: 30,
    z: 8,
    domains: ["schiff", "meer"],
    refersTo: { uebungen: "Tove", symptome: "Tove", wissenschaft: "Dr. Wiegand", lore: "Mara" },
    greeting:
      "Willkommen in meiner Werkstatt. Ich bin Kaj, der Schiffbauer dieser Geschichte. Wenn du möchtest, kannst du Treibholz sammeln und einen Ausbau wählen.",
    greetingAgain: "Willkommen, {name}. Die Werkbank steht bereit, wenn du einen Ausbau wählen möchtest.",
    chips: ["Kannst du mein Schiff ausbauen?", "Wo finde ich Treibholz?", "Hast du eine Aufgabe für mich?"],
  },
  {
    id: "ilse",
    name: "Dr. Ilse Wiegand",
    role: "die Forscherin",
    color: 0x9a7fd4,
    x: -4,
    z: 26,
    domains: ["wissenschaft", "symptome", "lore"],
    refersTo: { uebungen: "Tove", meer: "Mara", schiff: "Kaj", gefuehle: "Ben" },
    greeting:
      "Ich bin Dr. Ilse Wiegand, eine erfundene Forscherin. Ich sortiere die Bilder dieser Seekarte. Die Inseln bilden kein Nervensystem ab und erlauben keine Untersuchung einer Person.",
    greetingAgain: "Willkommen, {name}. Sie können von den erfundenen Landschaften lesen; Persönliches müssen Sie nicht berichten.",
    chips: ["Was ist das Nervensystem?", "Was bedeutet Polyvagal?", "Was ist das Toleranzfenster?", "Hast du eine Aufgabe für mich?"],
  },
  {
    id: "ben",
    name: "Ben",
    role: "die Figur am Feuer",
    color: 0x6a8fc9,
    x: -30,
    z: 14,
    domains: ["gefuehle", "symptome"],
    refersTo: { uebungen: "Tove", wissenschaft: "Dr. Wiegand", meer: "Mara", schiff: "Kaj" },
    greeting:
      "Hallo, ich bin Ben. Als Figur dieser Geschichte sitze ich gern am Feuer und schaue aufs Wasser. Meine Texte sind erfunden; ich spreche nicht für reale Betroffene.",
    greetingAgain: "Willkommen am Feuer, {name}. Du kannst bleiben oder weitergehen, ohne mir etwas erzählen zu müssen.",
    chips: ["Wie geht es dir?", "Was erzählt deine Spielgeschichte?", "Ich bringe dir etwas von Tove", "Hast du eine Aufgabe für mich?"],
  },
  {
    id: "vessa",
    name: "Vessa",
    role: "die reisende Händlerin",
    color: 0xc95a8a,
    x: -6,
    z: 26,
    domains: ["meer"],
    refersTo: { schiff: "Kaj", lore: "Mara" },
    greeting:
      "Willkommen an meinem Stand. Ich bin Vessa, eine erfundene Händlerin. Du kannst Karten, Knoten und Seemannsgarn ansehen oder weitergehen.",
    greetingAgain: "Willkommen zurück. Möchtest du etwas ansehen oder lieber weiterreisen?",
    chips: ["Was verkaufst du?", "Erzähl von deinen Reisen"],
  },
];
