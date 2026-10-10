// PHÄNOMENAUTIK 3 — Lore-Echos: leuchtende Runensteine mit fiktiven Landschaftsnotizen
// und freiwilligen Wegen (Souls-Tonalität, Atlas-verwurzelt, nie belehrend).

export interface LoreLine {
  id: string;
  island: string; // IslandDef.id oder "harbor"
  text: string;
}

export const LORE: LoreLine[] = [
  // ── Ankerplatz ──
  { id: "lore_harbor_1", island: "harbor", text: "Ein Hafen auf einer erfundenen Seekarte: Hier beginnt ein möglicher Weg, und hier darf er enden." },
  { id: "lore_harbor_2", island: "harbor", text: "Mara zeichnet Karten, Tove sammelt Ideen, Kaj baut Schiffe und Ben sitzt am Feuer. Alle sind Figuren dieser Geschichte." },
  { id: "lore_harbor_3", island: "harbor", text: "Ein freier Steg ist für die nächste Pause da. Die See wartet auf keine Leistung." },
  // ── Wiederkehr-Riff ──
  { id: "lore_flashback_1", island: "flashback", text: "Auf den Papierflügeln des Falters wechseln erfundene Bilder. Keines muss gelesen werden." },
  { id: "lore_flashback_2", island: "flashback", text: "Zwei Bilderrahmen zeigen verschiedene Zeiten der Inselgeschichte. Der Weg dazwischen bleibt offen." },
  { id: "lore_albtraum_1", island: "albtraum", text: "Muras Lied färbt den Abendhimmel. Es gehört zu dieser erfundenen Insel." },
  { id: "lore_albtraum_2", island: "albtraum", text: "Die Geschichte kann ein anderes Ende erhalten. Das ist eine Möglichkeit im Spiel." },
  // ── Alarm-Atoll ──
  { id: "lore_hypervigilanz_1", island: "hypervigilanz", text: "Das Licht des Wächters streift den Horizont. Von der Bank lässt es sich aus der Ferne betrachten." },
  { id: "lore_hypervigilanz_2", island: "hypervigilanz", text: "Die Felsen zeigen in viele Richtungen. Der Rückweg ist eine davon." },
  { id: "lore_herzrasen_1", island: "herzrasen", text: "Ein Trommelwesen springt zwischen den Steinen. Sein Takt ist eine Spielkulisse." },
  { id: "lore_herzrasen_2", island: "herzrasen", text: "Auf diesem Atoll verändert sich ein Rhythmus; über einen menschlichen Herzschlag sagt er nichts." },
  // ── Nebelbank ──
  { id: "lore_vermeidung_1", island: "vermeidung", text: "Mehrere Wegweiser stehen im Nebel. Die Spielfigur darf jeden Weg auslassen." },
  { id: "lore_vermeidung_2", island: "vermeidung", text: "Ein Umweg gehört ebenso zur Karte wie eine kurze Strecke." },
  { id: "lore_verdraengung_1", island: "verdraengung", text: "Die Kisten tragen erfundene Ortsnamen. Keine muss geöffnet werden." },
  { id: "lore_verdraengung_2", island: "verdraengung", text: "Der Besen steht neben einer Bank. Die Geschichte wartet, wenn du eine Pause wählst." },
  // ── Glaswelt ──
  { id: "lore_dissoziation_1", island: "dissoziation", text: "Zwischen den Glasbögen bleibt ein Weg am Ufer frei." },
  { id: "lore_dissoziation_2", island: "dissoziation", text: "Die Glasscheiben spiegeln die Landschaft dieser Insel, keine persönliche Geschichte." },
  { id: "lore_erstarrung_1", island: "erstarrung", text: "Ein Licht wandert über das Eis. Erstarrion bleibt in selbst gewähltem Abstand." },
  { id: "lore_erstarrung_2", island: "erstarrung", text: "Die Spielfigur kann stehen bleiben. Keine Körperbewegung ist für die Szene erforderlich." },
  // ── Trauer-Atoll ──
  { id: "lore_scham_1", island: "scham", text: "Die Mauer trägt Schriftzeichen aus der Inselgeschichte. Sie bewertet niemanden vor dem Bildschirm." },
  { id: "lore_scham_2", island: "scham", text: "Neben der Mauer liegt ein freier Weg. Es muss kein Satz richtig beantwortet werden." },
  { id: "lore_leere_1", island: "leere", text: "Die Schale spiegelt den Himmel. Freier Raum ist hier ein Bild der Landschaft." },
  { id: "lore_leere_2", island: "leere", text: "Ein Wolkenschatten zieht durch die Senke. Die Szene verspricht keine Veränderung eigener Gefühle." },
  // ── Misstrauens-Riff ──
  { id: "lore_misstrauen_1", island: "misstrauen", text: "Misstrania prüft ein Seil auf ihrem Steg. Die Spielfigur steht auf einem anderen." },
  { id: "lore_misstrauen_2", island: "misstrauen", text: "Abstand lässt sich wählen. Das Spiel fordert kein Vertrauen." },
  { id: "lore_naehe_1", island: "naehe", text: "Zwei Stege liegen am Wasser. Hinüberzugehen bleibt eine Möglichkeit." },
  { id: "lore_naehe_2", island: "naehe", text: "Beide Stege besitzen einen Rückweg. Annäherung ist keine Pflicht." },
  // ── Sturmherd ──
  { id: "lore_sturmherd_1", island: "sturmherd", text: "Über dem Felsen drehen sich Wolken. Der Zugang folgt einer Spielregel." },
  { id: "lore_sturmherd_2", island: "sturmherd", text: "Dieser Sturm gehört zur erfundenen Seekarte. Eine persönliche Geschichte muss nicht erzählt werden." },
];
