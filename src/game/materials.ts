// PHÄNOMENAUTIK 3 — Material-Ökonomie: Definitionen, Rezepte, Chat-Grammatik.
// Datengetrieben: neue Materialien/Bauprojekte entstehen ohne Codeänderung.

export type MatKategorie =
  | "holz" | "stangen" | "textil" | "seil" | "gefaess" | "metall" | "natur" | "werkzeug" | "magika" | "kuriosa";

export interface MaterialDef {
  id: string;
  name: string;
  kategorie: MatKategorie;
  gewicht: number; // kg, für Traglast-Feeling
  schwimmt?: boolean;
  brennbar?: number; // 0..1
  desc: string;
}

export const MATERIALS: MaterialDef[] = [
  // ── Holz ──
  { id: "stamm", name: "Treibstamm", kategorie: "holz", gewicht: 14, schwimmt: true, brennbar: 0.9, desc: "Glatte Jahre Salzwasser. Schwimmt — die Basis jedes Floßes." },
  { id: "bohle", name: "Bohle", kategorie: "holz", gewicht: 5, schwimmt: true, brennbar: 0.9, desc: "Gerade geschnitten, fast zu schade für den Weg über die Schlucht." },
  { id: "reisig", name: "Reisigbündel", kategorie: "holz", gewicht: 2, brennbar: 1, desc: "Zündet schnell. Jedes Feuer beginnt mit so einem Bündel." },
  { id: "rinde", name: "Rindenstreifen", kategorie: "holz", gewicht: 0.5, brennbar: 0.8, desc: "Biegsam und zäh. Hält mehr zusammen, als man denkt." },
  // ── Stangen ──
  { id: "holzgerte", name: "Holzgerte", kategorie: "stangen", gewicht: 1.2, brennbar: 0.9, desc: "Lang, leicht, gerade. Hebel, Stütze oder Ruder — je nach Tag." },
  { id: "stange", name: "Stange", kategorie: "stangen", gewicht: 3, brennbar: 0.9, desc: "Eine ordentliche Stange. Für Leitern, Masten und fliegende Ideen." },
  { id: "paddel", name: "Paddel", kategorie: "stangen", gewicht: 1.5, brennbar: 0.8, desc: "Halb Werkzeug, halb Einladung." },
  // ── Textilien ──
  { id: "tuch", name: "Leinentuch", kategorie: "textil", gewicht: 0.6, brennbar: 0.7, desc: "Groß genug zum Verbinden, Verhüllen, Segeln." },
  { id: "segeltuch", name: "Segeltuch", kategorie: "textil", gewicht: 2.4, brennbar: 0.5, desc: "Winddicht und stolz. Ein Floß mit Segeltuch ist kein Floß mehr, es ist ein Schiff." },
  { id: "sackleinen", name: "Sackleinen", kategorie: "textil", gewicht: 0.8, brennbar: 0.7, desc: "Grob und unverwüstlich." },
  { id: "wollknäuel", name: "Wollknäuel", kategorie: "textil", gewicht: 0.4, brennbar: 0.6, desc: "Weich. Irgendwo friert eine Ziege ohne Wolle." },
  // ── Seile ──
  { id: "seil", name: "Hanseil", kategorie: "seil", gewicht: 1.8, desc: "Hält Schiffe, Brücken und manchmal Pläne zusammen." },
  { id: "tauwerk", name: "Tauwerk", kategorie: "seil", gewicht: 3.5, desc: "Schweres Tau, für Anker und große Flaschenzüge." },
  { id: "fischernetz", name: "Fischernetz", kategorie: "seil", gewicht: 2.2, desc: "Fängt Fische, Treibgut und gelegentlich Ideen." },
  { id: "kette", name: "Kette", kategorie: "seil", gewicht: 6, desc: "Rostig, aber ehrlich." },
  // ── Gefäße ──
  { id: "eimer", name: "Eimer", kategorie: "gefaess", gewicht: 1.4, desc: "Trägt Wasser, Sand, Hoffnung. An einem Seil sogar aus dem Brunnen." },
  { id: "flasche", name: "Flasche", kategorie: "gefaess", gewicht: 0.4, desc: "Leer. Voller Möglichkeiten." },
  { id: "schale", name: "Holzschale", kategorie: "gefaess", gewicht: 0.3, brennbar: 0.8, desc: "Toves alte Schale, dick von hundert Tees." },
  { id: "blasebalg", name: "Blasebalg", kategorie: "gefaess", gewicht: 1.1, desc: "Macht aus Glut Feuer und aus Mut Flamme." },
  { id: "schlauch", name: "Wasserschlauch", kategorie: "gefaess", gewicht: 0.9, desc: "Ziegenleder. Kleidet Wasser eng an." },
  // ── Metall ──
  { id: "naegel", name: "Nägel (Handvoll)", kategorie: "metall", gewicht: 0.5, desc: "Kajs ganzer Stolz. Ohne sie ist alles nur Stapeln." },
  { id: "haken", name: "Eisenhaken", kategorie: "metall", gewicht: 0.4, desc: "Greift, was Hände nicht erreichen." },
  { id: "ring", name: "Eisenring", kategorie: "metall", gewicht: 0.6, desc: "Für Seile, Flaschenzüge und Dinge, die sich drehen müssen." },
  { id: "schrott", name: "Metallschrott", kategorie: "metall", gewicht: 2.5, desc: "Aus einem Wrack, das keine Namen mehr hatte." },
  // ── Natur ──
  { id: "stein", name: "Fauststein", kategorie: "natur", gewicht: 1.5, desc: "Gut in der Hand, besser als Gegengewicht." },
  { id: "feder", name: "Möwenfeder", kategorie: "natur", gewicht: 0.02, desc: "Schreibt, schmückt, zeigt Wind an." },
  { id: "muschel", name: "Muschel", kategorie: "natur", gewicht: 0.1, desc: "Das Meer, zum Mitnehmen." },
  { id: "harz", name: "Harzklumpen", kategorie: "natur", gewicht: 0.3, brennbar: 1, desc: "Klebt und brennt wie tausend Sonnen (kurz)." },
  { id: "algen", name: "Algenstrang", kategorie: "natur", gewicht: 0.4, desc: "Rutschig. Gelehrt bescheidene Weisheit: Wer zieht, bevor er schaut, fällt." },
  { id: "knochen", name: "Alter Knochen", kategorie: "natur", gewicht: 0.7, desc: "Von wem, fragt besser niemand." },
  // ── Werkzeuge ──
  { id: "feuerstein", name: "Feuerstein", kategorie: "werkzeug", gewicht: 0.3, desc: "Schlägt Funken aus dem Nichts. Symbolisch und praktisch." },
  { id: "schaufel", name: "Schaufel", kategorie: "werkzeug", gewicht: 2, desc: "Für Sand, Erde und vergrabene Dinge." },
  // ── Kuriosa ──
  { id: "regenschirm", name: "Regenschirm", kategorie: "kuriosa", gewicht: 0.9, desc: "Gegen Regen. Für Wind. Erstaunlich aerodynamisch." },
  { id: "laterne", name: "Sturmlaterne", kategorie: "kuriosa", gewicht: 0.8, desc: "Brennt auch, wenn die Welt pfeift." },
  { id: "zeltbahn", name: "Zeltbahn", kategorie: "kuriosa", gewicht: 3, desc: "Ein halbes Zuhause." },
  { id: "ankerstein", name: "Alter Ankerstein", kategorie: "kuriosa", gewicht: 22, desc: "Hält, was wichtig ist. Auch metaphorisch." },
];

export function matById(id: string): MaterialDef | undefined {
  return MATERIALS.find((m) => m.id === id);
}

// ── Bauprojekte ────────────────────────────────────────────────────

export interface BuildableDef {
  id: string;
  name: string;
  keywords: string[]; // für Chat-Grammatik
  materials: Record<string, number>;
  desc: string;
  hint: string; // Platzierungsregel als Klartext
}

export const BUILDABLES: BuildableDef[] = [
  {
    id: "floss",
    name: "Floß",
    keywords: ["floß", "floss", "boot", "fähre", "faehre"],
    materials: { stamm: 4, seil: 2 },
    desc: "Vier Treibstämme, zwei Seile, ein offenes Meer. Paddeln mit W.",
    hint: "Am Ufer ins Wasser setzen — das Floß schwimmt, du stehst drauf.",
  },
  {
    id: "leiter",
    name: "Strickleiter",
    keywords: ["leiter", "strickleiter", "stiege"],
    materials: { stange: 3, seil: 1 },
    desc: "Drei Stangen, ein Seil, und plötzlich ist oben auch unten erreichbar.",
    hint: "An eine Böschung oder einen Hang lehnen — danach einfach hinauflaufen.",
  },
  {
    id: "bruecke",
    name: "Bohlenbrücke",
    keywords: ["brücke", "bruecke", "steg", "überbrückung", "ueberbrueckung"],
    materials: { bohle: 4, seil: 2 },
    desc: "Vier Bohlen über einen Graben. Hält — Kaj hat es durchgerechnet.",
    hint: "Über eine Lücke oder seichtes Wasser spannen (max. 14 m).",
  },
];

export function buildableByKeyword(word: string): BuildableDef | undefined {
  const w = word.toLowerCase();
  return BUILDABLES.find((b) => b.keywords.some((k) => w.includes(k)));
}

/** Fehlende Materialien für ein Bauprojekt (für hilfreiche Chat-Antworten) */
export function missingMaterials(b: BuildableDef, have: Record<string, number>): { id: string; need: number }[] {
  const out: { id: string; need: number }[] = [];
  for (const [id, n] of Object.entries(b.materials)) {
    const missing = n - (have[id] ?? 0);
    if (missing > 0) out.push({ id, need: missing });
  }
  return out;
}

export function matName(id: string): string {
  return matById(id)?.name ?? id;
}

export function matCostText(b: BuildableDef): string {
  return Object.entries(b.materials)
    .map(([id, n]) => `${n}× ${matName(id)}`)
    .join(" + ");
}

/** Chat-Grammatik: „baue floß", „bau mir eine brücke", „floß bauen" … */
export function parseBuildCommand(raw: string): { kind: "build"; def: BuildableDef } | { kind: "help" } | { kind: "unknown" } {
  const t = raw.toLowerCase().trim();
  if (/^(hilfe|help|\?|was kann ich|was geht)/.test(t)) return { kind: "help" };
  const hasBau = /bau|bauen|baue|bastel|mach|errichte|konstruier/.test(t);
  for (const word of t.split(/\s+/)) {
    const def = buildableByKeyword(word);
    if (def) return { kind: "build", def };
  }
  if (hasBau) return { kind: "unknown" };
  return { kind: "unknown" };
}
