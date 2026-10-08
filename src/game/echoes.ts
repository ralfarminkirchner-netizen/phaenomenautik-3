// PHÄNOMENAUTIK 3 — Lore-Echos: leuchtende Runensteine mit einer Zeile Wahrheit
// oder Kryptischem (Souls-Tonalität, Atlas-verwurzelt, nie belehrend).

export interface LoreLine {
  id: string;
  island: string; // IslandDef.id oder "harbor"
  text: string;
}

export const LORE: LoreLine[] = [
  // ── Ankerplatz ──
  { id: "lore_harbor_1", island: "harbor", text: "Der Ankerplatz war nie ein Phänomen. Oder er wurde so oft verstanden, dass er es vergaß." },
  { id: "lore_harbor_2", island: "harbor", text: "Mara lotst die Schiffe. Tove heilt. Kaj baut. Ben wartet. Alle vier kamen an wie du: zitternd." },
  { id: "lore_harbor_3", island: "harbor", text: "Wer hier anlegt, hat schon überlebt. Das Meer wirft niemanden her, der es nicht durch sich hindurchgelassen hat." },
  // ── Wiederkehr-Riff ──
  { id: "lore_flashback_1", island: "flashback", text: "Der Falter zeigt dir keine Bilder aus Bosheit. Er zeigt sie, weil niemand je hingesehen hat." },
  { id: "lore_flashback_2", island: "flashback", text: "Hier ist es immer zweimal bewohnt: einmal vom Heute, einmal vom Damals, das nicht vergehen wollte." },
  { id: "lore_albtraum_1", island: "albtraum", text: "Mura singt, damit sie nicht allein wach ist. Ihr Lied kennt keinen Schlaf — und keine Schande." },
  { id: "lore_albtraum_2", island: "albtraum", text: "Ein Traum, den man umschreibt, ist kein Traum mehr. Er wird zur Übung. Die Insel verträgt Übungen." },
  // ── Alarm-Atoll ──
  { id: "lore_hypervigilanz_1", island: "hypervigilanz", text: "Der Wächter hat nie geschlafen, seit … niemand weiß es. Er selbst hat es vergessen. Das ist das Traurigste." },
  { id: "lore_hypervigilanz_2", island: "hypervigilanz", text: "Alle Steine hier zeigen nach außen. Selbst die Insel lauscht noch auf den Schritt, der längst verhallt ist." },
  { id: "lore_herzrasen_1", island: "herzrasen", text: "Es ist kein Feind. Es ist ein Botenjunge, der nie gelernt hat, langsam zu gehen." },
  { id: "lore_herzrasen_2", island: "herzrasen", text: "Der Boden pocht in einem Takt, der kein guter Takt ist. Er pocht erst seitdem dich etwas überrannte." },
  // ── Nebelbank ──
  { id: "lore_vermeidung_1", island: "vermeidung", text: "Jeder Wegweiser hier zeigt auf »später«. Vermeidia war einmal ein Kompass. Der Norden war zu schwer." },
  { id: "lore_vermeidung_2", island: "vermeidung", text: "Umwege waren früher Abkürzungen zum Überleben. Die Insel erinnert sich daran mit Stolz, nicht mit Scham." },
  { id: "lore_verdraengung_1", island: "verdraengung", text: "Unter den Hügeln liegt kein Müll. Es sind Schätze, die Angst hatten, gesehen zu werden." },
  { id: "lore_verdraengung_2", island: "verdraengung", text: "Der Verdränger kehrt seit Jahrzehnten. Sein Besen ist schwer. Niemand hat je danke gesagt." },
  // ── Glaswelt ──
  { id: "lore_dissoziation_1", island: "dissoziation", text: "Das Glas hier war einmal eine Tür, die zugefallen ist. Dissozia hütet sie. Nicht aus Kälte — aus Liebe." },
  { id: "lore_dissoziation_2", island: "dissoziation", text: "Wer nicht ganz da ist, kann nicht ganz getroffen werden. So steht es in jedem Fenster dieser Insel." },
  { id: "lore_erstarrung_1", island: "erstarrung", text: "Erstarrion war ein Schrei, dem die Luft ausging. Das Eis bewahrte ihn. Er wartet auf Tauwetter." },
  { id: "lore_erstarrung_2", island: "erstarrung", text: "Stillstand ist keine Entscheidung. Es ist die älteste Verteidigung überhaupt — und sie hat funktioniert." },
  // ── Trauer-Atoll ──
  { id: "lore_scham_1", island: "scham", text: "Die Mauern bestehen aus Sätzen in deiner eigenen Stimme. Aber die Worte waren nie deine." },
  { id: "lore_scham_2", island: "scham", text: "Der Golem fragt: »Wer hat dir erlaubt, hier zu sein?« Die richtige Antwort kostet keine Kraft: »Ich.«" },
  { id: "lore_leere_1", island: "leere", text: "Die Mitte der Insel fehlt nicht. Sie ist nur müde. Gefühle, die Sicherheit zogen, kehren leise zurück." },
  { id: "lore_leere_2", island: "leere", text: "Hier war einmal ein Gefühl. Ein großes. Die Schale ist noch warm." },
  // ── Misstrauens-Riff ──
  { id: "lore_misstrauen_1", island: "misstrauen", text: "Misstrania prüft jeden Anker zweimal. Einmal hat einer gehalten, was er versprach. Seitdem prüft sie weiter." },
  { id: "lore_misstrauen_2", island: "misstrauen", text: "Die Fallen hier sind gute Handwerksarbeit. Wer sie baute, wollte nie böse sein — nur nie wieder überrascht." },
  { id: "lore_naehe_1", island: "naehe", text: "Komm her. Geh weg. Beides stimmt. Beides ist wahr. Das Phantom hat beides gelernt, gleichzeitig, von derselben Hand." },
  { id: "lore_naehe_2", island: "naehe", text: "Ebbe und Flut im Sekundentakt: Nähe war Sehnsucht und Bedrohung in einem. Die Insel lernt gerade einen Mittelweg." },
  // ── Sturmherd ──
  { id: "lore_sturmherd_1", island: "sturmherd", text: "In der Mitte dreht sich alles Ungesagte. Ein Brief, der nie geöffnet wurde. Er wartet auf zwölf Siegel." },
  { id: "lore_sturmherd_2", island: "sturmherd", text: "Der Sturm ist kein Unwetter. Er ist deine Geschichte ohne Zeugen. Gib ihr Worte, und er wird Wetter." },
];
