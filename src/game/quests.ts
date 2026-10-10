// PHÄNOMENAUTIK 2 — Questsystem

import type { SaveGame } from "./state";

export interface QuestDef {
  id: string;
  title: string;
  giver: string;        // NPC-ID
  desc: string;
  goalDesc: (s: SaveGame) => string;
  isDone: (s: SaveGame) => boolean;
  reward: string;
  applyReward: (s: SaveGame) => void;
  turnIn?: string;      // NPC-ID, bei der abgegeben wird (Standard: giver)
}

export const QUESTS: QuestDef[] = [
  {
    id: "q_erkundung",
    title: "Kartenarbeit",
    giver: "mara",
    desc: "Mara will wissen, ob die alten Strömungen noch stimmen. Besuche drei verschiedene Archipele und kehre zu ihr zurück.",
    goalDesc: (s) => `Archipele besucht: ${s.visitedArchipelagos.length} / 3`,
    isDone: (s) => s.visitedArchipelagos.length >= 3,
    reward: "+40 Einsicht, 2× Warmes Wasser",
    applyReward: (s) => {
      s.player.xp += 40;
      s.player.items.wasser = (s.player.items.wasser ?? 0) + 2;
    },
  },
  {
    id: "q_tee",
    title: "Ein warmer Becher",
    giver: "tove",
    desc: "Tove hat einen warmen Tee für Ben vorbereitet. Wenn du möchtest, kannst du ihn ans Feuer bringen. Der Tee ist eine Spielressource.",
    goalDesc: () => "Bringe Ben den Tee.",
    isDone: () => false, // wird per Dialog abgeschlossen
    reward: "+1 Notfallkarte als Spielressource",
    applyReward: (s) => {
      s.player.items.karte = (s.player.items.karte ?? 0) + 1;
    },
    turnIn: "ben",
  },
  {
    id: "q_holz1",
    title: "Treibholz I: Der Rumpf",
    giver: "kaj",
    desc: "Kaj verstärkt deinen Rumpf — aber er braucht Material. Sammle 5 Treibholz, das auf dem Meer treibt.",
    goalDesc: (s) => `Treibholz: ${s.driftwood} / 5`,
    isDone: (s) => s.driftwood >= 5,
    reward: "Schiffsausbau I (mehr Speed)",
    applyReward: (s) => {
      s.driftwood -= 5;
      s.shipSpeedLevel = Math.max(s.shipSpeedLevel, 1);
    },
  },
  {
    id: "q_holz2",
    title: "Treibholz II: Die Segel",
    giver: "kaj",
    desc: "Für bessere Segel braucht Kaj 8 weiteres Treibholz. Die besten Stücke treiben in der Nähe von Sturmzellen.",
    goalDesc: (s) => `Treibholz: ${s.driftwood} / 8`,
    isDone: (s) => s.driftwood >= 8,
    reward: "Schiffsausbau II (max. Speed), 2× Ankerstein",
    applyReward: (s) => {
      s.driftwood -= 8;
      s.shipSpeedLevel = Math.max(s.shipSpeedLevel, 2);
      s.player.items.anker = (s.player.items.anker ?? 0) + 2;
    },
  },
  {
    id: "q_forschung",
    title: "Feldforschung",
    giver: "ilse",
    desc: "Dr. Wiegand sammelt Notizen zur erfundenen Seekarte. Du kannst drei Szenen abschließen und ihre Notizen lesen. Die Aufgabe ist freiwillig.",
    goalDesc: (s) => `Abgeschlossene Spielszenen: ${s.islands.filter((i) => i.overcome).length} / 3`,
    isDone: (s) => s.islands.filter((i) => i.overcome).length >= 3,
    reward: "+60 Einsicht, 1× Ankerstein",
    applyReward: (s) => {
      s.player.xp += 60;
      s.player.items.anker = (s.player.items.anker ?? 0) + 1;
    },
  },
  {
    id: "q_mutprobe",
    title: "Bens Inselnotiz",
    giver: "ben",
    desc: "Ben interessiert sich für das Trommelwesen auf dem Alarm-Atoll. Du kannst die erfundene Szene abschließen und seine Inselnotiz lesen. Dadurch wird keine Person geheilt.",
    goalDesc: () => "Schließe die Szene des Trommelwesens ab und besuche Ben, wenn du möchtest.",
    isDone: (s) => s.islands.find((i) => i.id === "herzrasen")?.overcome ?? false,
    reward: "+50 Einsicht, 1× Notfallkarte",
    applyReward: (s) => {
      s.player.xp += 50;
      s.player.items.karte = (s.player.items.karte ?? 0) + 1;
    },
  },
  {
    id: "q_getrennt",
    title: "Getrennte Utensilien",
    giver: "tove",
    desc: "Tove schlägt ein Spielrezept aus mindestens zwei Zutaten vor, die das Spiel als glutenfrei einordnet. Du kannst es am Kochfeld ausprobieren. Die Zuordnung ersetzt keine Prüfung realer Lebensmittel.",
    goalDesc: (s) => (s.gfMealCooked ? "Glutenfrei gekocht — zurück zu Tove." : "Koche am Feuer (K) etwas Glutenfreies (≥ 2 Zutaten)."),
    isDone: (s) => s.gfMealCooked === true,
    reward: "+30 Einsicht, 1× Leinentuch, Spielrezept notiert",
    applyReward: (s) => {
      s.player.xp += 30;
      s.materials.tuch = (s.materials.tuch ?? 0) + 1;
    },
  },
];

export function questState(s: SaveGame, id: string): "unknown" | "active" | "done" {
  return s.quests[id] ?? "unknown";
}

export function activeQuests(s: SaveGame): QuestDef[] {
  return QUESTS.filter((q) => questState(s, q.id) === "active");
}

export function completableQuests(s: SaveGame, npcId: string): QuestDef[] {
  return QUESTS.filter(
    (q) => questState(s, q.id) === "active" && q.isDone(s) && (q.turnIn ?? q.giver) === npcId,
  );
}

export function offerableQuests(s: SaveGame, npcId: string): QuestDef[] {
  return QUESTS.filter((q) => questState(s, q.id) === "unknown" && q.giver === npcId).filter((q) => {
    // q_holz2 erst nach q_holz1, q_mutprobe erst nach q_tee (Ben öffnet sich erst)
    if (q.id === "q_holz2") return questState(s, "q_holz1") === "done";
    if (q.id === "q_mutprobe") return questState(s, "q_tee") === "done";
    // Toves Kontaminations-Lektion nur im Glutenfrei-Modus
    if (q.id === "q_getrennt") return s.glutenFree === true;
    return true;
  });
}
