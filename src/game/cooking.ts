// PHÄNOMENAUTIK 3 — Küche & Ernährung: Datenmodell, echte Nährwerte pro 100 g
// (Quelle je Zutat benannt: USDA FoodData Central / BBL), Rezept-Summation,
// evidenzbasierte, bescheidene Wirkungen. Keine Fantasy-Werte: Wirkungen sind
// modest, benannt und an den Körper gekoppelt (Vision §2 M3-Brief).

// ── Datenmodell ──────────────────────────────────────────────────────────────

export type GlutenStatus = "frei" | "haltig" | "verdaechtig";

export interface IngredientDef {
  id: string;
  name: string;
  kcal: number;
  carbs: number; // g/100g
  sugar: number; // g/100g (davon Zucker)
  protein: number; // g/100g
  fat: number; // g/100g
  omega3: number; // g/100g (ALA/DHA/EPA)
  fiber: number; // g/100g
  micros: Partial<
    Record<
      "B1" | "B6" | "B12" | "folate" | "C" | "D" | "iron" | "magnesium" | "zinc" | "iodine" | "calcium",
      number
    >
  >; // % Tagesbedarf pro 100 g
  gluten: GlutenStatus;
  tags: string[]; // "roh","fisch","nuss","getreide","frucht","pilz","alge","milch","ei","samen","gemuese","kraut","muschel","suess"
  source: string; // Nährwert-Quelle
  portionG: number; // Gramm pro Inventar-Einheit
}

// ── Zutaten (echte Tabellenwerte, gerundet; Quellen benannt) ────────────────

const U = "USDA FDC";
const B = "BBL/Souci-Fachmann-Kraut";

export const INGREDIENTS: IngredientDef[] = [
  { id: "heidelbeere", name: "Heidelbeeren", kcal: 57, carbs: 14.5, sugar: 10, protein: 0.7, fat: 0.3, omega3: 0.06, fiber: 2.4, micros: { C: 10 }, gluten: "frei", tags: ["frucht", "roh"], source: U, portionG: 60 },
  { id: "champignon", name: "Champignons", kcal: 22, carbs: 3.3, sugar: 2, protein: 3.1, fat: 0.3, omega3: 0, fiber: 1, micros: { B6: 5 }, gluten: "frei", tags: ["pilz", "roh"], source: U, portionG: 80 },
  { id: "steinpilz", name: "Steinpilze", kcal: 30, carbs: 3, sugar: 1, protein: 4, fat: 0.5, omega3: 0, fiber: 2.5, micros: { D: 15, B6: 5 }, gluten: "frei", tags: ["pilz"], source: B, portionG: 80 },
  { id: "nori", name: "Nori-Algen", kcal: 35, carbs: 5.1, sugar: 0.5, protein: 5.8, fat: 0.3, omega3: 0, fiber: 0.3, micros: { iodine: 30, C: 5 }, gluten: "frei", tags: ["alge", "roh"], source: U, portionG: 10 },
  { id: "makrele", name: "Makrele", kcal: 205, carbs: 0, sugar: 0, protein: 19, fat: 13.9, omega3: 2.6, fiber: 0, micros: { B12: 350, D: 50 }, gluten: "frei", tags: ["fisch"], source: U, portionG: 120 },
  { id: "lachs", name: "Lachs", kcal: 208, carbs: 0, sugar: 0, protein: 20, fat: 13, omega3: 2.2, fiber: 0, micros: { B12: 130, D: 66 }, gluten: "frei", tags: ["fisch"], source: U, portionG: 120 },
  { id: "hering", name: "Hering", kcal: 158, carbs: 0, sugar: 0, protein: 18, fat: 9, omega3: 1.7, fiber: 0, micros: { B12: 550, D: 20 }, gluten: "frei", tags: ["fisch"], source: U, portionG: 120 },
  { id: "walnuss", name: "Walnüsse", kcal: 654, carbs: 13.7, sugar: 2.6, protein: 15.2, fat: 65.2, omega3: 9.1, fiber: 6.7, micros: { magnesium: 40, B6: 25, zinc: 10 }, gluten: "frei", tags: ["nuss", "roh"], source: U, portionG: 30 },
  { id: "mandel", name: "Mandeln", kcal: 579, carbs: 21.6, sugar: 4.4, protein: 21.2, fat: 49.9, omega3: 0, fiber: 12.5, micros: { magnesium: 67, calcium: 25, zinc: 10 }, gluten: "frei", tags: ["nuss", "roh"], source: U, portionG: 30 },
  { id: "haselnuss", name: "Haselnüsse", kcal: 628, carbs: 16.7, sugar: 4.3, protein: 15, fat: 60.8, omega3: 0, fiber: 9.7, micros: { folate: 28, magnesium: 40 }, gluten: "frei", tags: ["nuss", "roh"], source: U, portionG: 30 },
  { id: "miesmuschel", name: "Miesmuscheln", kcal: 86, carbs: 3.7, sugar: 0, protein: 11.9, fat: 2.2, omega3: 0.4, fiber: 0, micros: { B12: 500, iron: 25, iodine: 45 }, gluten: "frei", tags: ["muschel"], source: U, portionG: 100 },
  { id: "honig", name: "Honig", kcal: 304, carbs: 82.4, sugar: 82, protein: 0.3, fat: 0, omega3: 0, fiber: 0, micros: {}, gluten: "frei", tags: ["suess"], source: U, portionG: 20 },
  { id: "moewenei", name: "Möwenei", kcal: 143, carbs: 0.7, sugar: 0.4, protein: 12.6, fat: 9.5, omega3: 0.1, fiber: 0, micros: { B12: 45, D: 20, folate: 11, iron: 10 }, gluten: "frei", tags: ["ei"], source: U, portionG: 55 },
  { id: "kartoffel", name: "Kartoffeln", kcal: 77, carbs: 17.5, sugar: 0.8, protein: 2, fat: 0.1, omega3: 0, fiber: 2.2, micros: { C: 20, B6: 15, magnesium: 6 }, gluten: "frei", tags: ["gemuese"], source: U, portionG: 150 },
  { id: "linse", name: "Linsen (gekocht)", kcal: 116, carbs: 20.1, sugar: 1.8, protein: 9, fat: 0.4, omega3: 0, fiber: 7.9, micros: { folate: 45, iron: 18, magnesium: 9, zinc: 12 }, gluten: "frei", tags: ["huelsenfrucht"], source: U, portionG: 150 },
  { id: "reis", name: "Reis (gekocht)", kcal: 130, carbs: 28.2, sugar: 0.1, protein: 2.7, fat: 0.3, omega3: 0, fiber: 0.4, micros: { B1: 10 }, gluten: "frei", tags: ["getreide"], source: U, portionG: 150 },
  { id: "hafer", name: "Haferflocken", kcal: 389, carbs: 66.3, sugar: 1, protein: 16.9, fat: 6.9, omega3: 0, fiber: 10.6, micros: { B1: 60, magnesium: 44, iron: 26, zinc: 25 }, gluten: "verdaechtig", tags: ["getreide"], source: U, portionG: 40 },
  { id: "buchweizen", name: "Buchweizen (gekocht)", kcal: 92, carbs: 19.9, sugar: 0.9, protein: 3.4, fat: 0.6, omega3: 0, fiber: 2.7, micros: { magnesium: 12, B6: 5 }, gluten: "frei", tags: ["getreide"], source: U, portionG: 150 },
  { id: "quinoa", name: "Quinoa (gekocht)", kcal: 120, carbs: 21.3, sugar: 0.9, protein: 4.4, fat: 1.9, omega3: 0.03, fiber: 2.8, micros: { folate: 11, magnesium: 15, iron: 8 }, gluten: "frei", tags: ["getreide"], source: U, portionG: 150 },
  { id: "vollkornbrot", name: "Vollkornbrot", kcal: 247, carbs: 41, sugar: 6, protein: 13, fat: 3.5, omega3: 0.05, fiber: 7, micros: { B1: 30, magnesium: 20, iron: 15, zinc: 12 }, gluten: "haltig", tags: ["getreide"], source: U, portionG: 60 },
  { id: "weizenmehl", name: "Weizenmehl", kcal: 364, carbs: 76, sugar: 0.3, protein: 10.3, fat: 1, omega3: 0, fiber: 2.7, micros: { B1: 25, iron: 15 }, gluten: "haltig", tags: ["getreide"], source: U, portionG: 50 },
  { id: "kaese", name: "Käse (Gouda)", kcal: 356, carbs: 2.2, sugar: 2.2, protein: 25, fat: 27.4, omega3: 0.2, fiber: 0, micros: { B12: 65, calcium: 70, zinc: 25 }, gluten: "frei", tags: ["milch"], source: U, portionG: 40 },
  { id: "milch", name: "Milch", kcal: 61, carbs: 4.8, sugar: 5.1, protein: 3.2, fat: 3.3, omega3: 0, fiber: 0, micros: { B12: 18, calcium: 12, D: 5 }, gluten: "frei", tags: ["milch"], source: U, portionG: 200 },
  { id: "apfel", name: "Apfel", kcal: 52, carbs: 13.8, sugar: 10.4, protein: 0.3, fat: 0.2, omega3: 0, fiber: 2.4, micros: { C: 5 }, gluten: "frei", tags: ["frucht", "roh"], source: U, portionG: 120 },
  { id: "kuerbiskerne", name: "Kürbiskerne", kcal: 559, carbs: 10.7, sugar: 1.4, protein: 30.2, fat: 49, omega3: 0.1, fiber: 6, micros: { magnesium: 140, zinc: 70, iron: 50 }, gluten: "frei", tags: ["samen", "roh"], source: U, portionG: 25 },
  { id: "leinsamen", name: "Leinsamen", kcal: 534, carbs: 28.9, sugar: 1.6, protein: 18.3, fat: 42.2, omega3: 22.8, fiber: 27.3, micros: { B1: 130, magnesium: 98 }, gluten: "frei", tags: ["samen", "roh"], source: U, portionG: 15 },
  { id: "brennnessel", name: "Brennnessel (gekocht)", kcal: 42, carbs: 7, sugar: 0.5, protein: 2.7, fat: 0.4, omega3: 0, fiber: 6, micros: { C: 30, iron: 8, calcium: 40 }, gluten: "frei", tags: ["kraut"], source: B, portionG: 60 },
  { id: "olivenoel", name: "Olivenöl", kcal: 884, carbs: 0, sugar: 0, protein: 0, fat: 100, omega3: 0.8, fiber: 0, micros: {}, gluten: "frei", tags: ["oel"], source: U, portionG: 10 },
];

export function ingById(id: string): IngredientDef | undefined {
  return INGREDIENTS.find((i) => i.id === id);
}

// ── Rezepte (werden im Spiel gefunden/gelernt) ───────────────────────────────

export interface RecipeDef {
  id: string;
  name: string;
  ingredients: string[]; // exakte Zutaten-Menge (Reihenfolge egal)
  text: string; // eine Zeile Küchen-Lore
}

export const RECIPES: RecipeDef[] = [
  { id: "beeren_muesli", name: "Beeren-Müsli", ingredients: ["hafer", "heidelbeere", "honig"], text: "Schnelle Kraft — aber der Zucker holt dich später ein." },
  { id: "fischerfruehstueck", name: "Fischerfrühstück", ingredients: ["hering", "kartoffel"], text: "Hält lang satt und den Kopf klar. D wie Denken." },
  { id: "nuss_kraft", name: "Nuss-Kraft", ingredients: ["walnuss", "mandel", "honig"], text: "Toves Liebling für lange Tage am Webrahmen." },
  { id: "meeres_suppe", name: "Meeres-Suppe", ingredients: ["nori", "miesmuschel", "lachs"], text: "Jod, B12, Omega-3 — die Schilddrüse dankt." },
  { id: "kaese_kartoffel", name: "Käse-Kartoffel", ingredients: ["kartoffel", "kaese", "brennnessel"], text: "Bens Seelentröster. Tyrosin für den Antrieb." },
  { id: "linsen_eintopf", name: "Linsen-Eintopf", ingredients: ["linse", "kartoffel", "brennnessel"], text: "Folat, Eisen, Tryptophan — ruhige Kraft aus dem Topf." },
  { id: "power_brot", name: "Kraftbrot", ingredients: ["vollkornbrot", "kaese"], text: "Vollkorn hält den Blutzucker ruhig. Enthält Gluten." },
  { id: "pilz_pfanne", name: "Pilz-Pfanne", ingredients: ["steinpilz", "champignon", "olivenoel"], text: "Vitamin D vom Waldboden, in Olivenöl geschwenkt." },
  { id: "samensalz", name: "Samen-Salz", ingredients: ["kuerbiskerne", "leinsamen"], text: "Magnesium und Zink zum Streuen — Stressresistenz pur." },
  { id: "quinoa_bowl", name: "Quinoa-Schale", ingredients: ["quinoa", "moewenei", "brennnessel"], text: "Vollwertig, glutenfrei, bescheiden gut." },
  { id: "reis_fisch", name: "Reis mit Fisch", ingredients: ["reis", "makrele", "nori"], text: "Die Lotsen-Mahlzeit vor der Ausfahrt." },
  { id: "apfel_nuss", name: "Apfel-Nuss-Mix", ingredients: ["apfel", "haselnuss"], text: "Für unterwegs. Frucht hält wach, die Nuss hält satt." },
];

// ── Gericht berechnen (reine Funktion — testbar) ─────────────────────────────

export type MicroKey = "B1" | "B6" | "B12" | "folate" | "C" | "D" | "iron" | "magnesium" | "zinc" | "iodine" | "calcium";

export interface MealEffect {
  kind: "energie" | "konzentration" | "regulation";
  label: string; // Alltagssprache, eine Zeile
  magnitude: number; // z. B. 0.25 = +25 % Regeneration
  durationSec: number;
  crashAfterSec?: number; // Zucker: Boost endet, Crash beginnt
  crashMagnitude?: number; // negativ wirksam (z. B. -0.25)
}

export interface DishResult {
  name: string;
  matchedRecipeId: string | null;
  grams: number;
  kcal: number;
  carbs: number;
  sugar: number;
  protein: number;
  fat: number;
  omega3: number;
  fiber: number;
  micros: Partial<Record<MicroKey, number>>; // % Tagesbedarf gesamt
  gluten: GlutenStatus;
  effects: MealEffect[];
  notes: string[]; // Effekt-Begründungen in Alltagssprache
}

const TRYPTOPHAN_TAGS = ["nuss", "samen", "huelsenfrucht", "ei", "milch"];
const TYROSIN_TAGS = ["milch", "fisch"];

export function computeDish(ingredientIds: string[]): DishResult | null {
  const ings = ingredientIds.map(ingById);
  if (ings.some((i) => !i) || ings.length === 0 || ings.length > 5) return null;
  const list = ings as IngredientDef[];

  // Nährwerte aufsummieren (portionsgewichtet)
  let grams = 0, kcal = 0, carbs = 0, sugar = 0, protein = 0, fat = 0, omega3 = 0, fiber = 0;
  const micros: Partial<Record<MicroKey, number>> = {};
  const tags = new Set<string>();
  let gluten: GlutenStatus = "frei";
  for (const ing of list) {
    const f = ing.portionG / 100;
    grams += ing.portionG;
    kcal += ing.kcal * f;
    carbs += ing.carbs * f;
    sugar += ing.sugar * f;
    protein += ing.protein * f;
    fat += ing.fat * f;
    omega3 += ing.omega3 * f;
    fiber += ing.fiber * f;
    for (const [k, v] of Object.entries(ing.micros)) {
      const key = k as MicroKey;
      micros[key] = (micros[key] ?? 0) + v * f;
    }
    for (const t of ing.tags) tags.add(t);
    if (ing.gluten === "haltig") gluten = "haltig";
    else if (ing.gluten === "verdaechtig" && gluten === "frei") gluten = "verdaechtig";
  }

  // Rezept-Match: exakte Zutatenmenge
  const key = [...ingredientIds].sort().join("+");
  const recipe = RECIPES.find((r) => [...r.ingredients].sort().join("+") === key) ?? null;

  // Sättigung: Protein + Ballaststoffe verlängern jede Wirkung
  const satiety = protein + fiber;
  const durationMul = satiety >= 14 ? 1.6 : satiety >= 8 ? 1.3 : 1;

  const effects: MealEffect[] = [];
  const notes: string[] = [];

  // Energie: Einfachzucker → Spike + Crash (die Blutzucker-Achterbahn)
  if (sugar >= 15) {
    effects.push({
      kind: "energie",
      label: "Zuckerschub — schnelle Kraft, dann das Loch",
      magnitude: 0.35,
      durationSec: 90,
      crashAfterSec: 90,
      crashMagnitude: -0.3,
    });
    notes.push(`${Math.round(sugar)} g Zucker: kurzer Schub, nach 90 s ein 60-s-Energieminus.`);
  }
  // Energie: komplexe Kohlenhydrate → lange, ruhige Kraft
  const complexCarbs = carbs - sugar;
  if (complexCarbs >= 12) {
    effects.push({
      kind: "energie",
      label: "Lange Sättigung — ruhiger Blutzucker",
      magnitude: 0.18,
      durationSec: Math.round(240 * durationMul),
    });
    notes.push(`Komplexe Kohlenhydrate (${Math.round(complexCarbs)} g): Ausdauer regeneriert länger.`);
  }

  // Konzentration: B-Vitamine, Tyrosin, Omega-3 → Präsenz-Regeneration
  const bScore = ((micros.B1 ?? 0) + (micros.B6 ?? 0) + (micros.B12 ?? 0)) / 3;
  const tyrosin = list.some((i) => i.tags.some((t) => TYROSIN_TAGS.includes(t)));
  if (bScore >= 12 || tyrosin || omega3 >= 1) {
    const mag = Math.min(0.35, 0.12 + bScore / 200 + (omega3 >= 1 ? 0.06 : 0) + (tyrosin ? 0.05 : 0));
    effects.push({
      kind: "konzentration",
      label: "Klarer Kopf — Präsenz regeneriert schneller",
      magnitude: Math.round(mag * 100) / 100,
      durationSec: Math.round(210 * durationMul),
    });
    const why = [bScore >= 12 ? "B-Vitamine" : null, tyrosin ? "Tyrosin" : null, omega3 >= 1 ? "Omega-3 (D wie Denken)" : null]
      .filter(Boolean)
      .join(", ");
    notes.push(`${why}: Präsenz +${Math.round(mag * 100)} % Regeneration.`);
  }

  // Regulation: Tryptophan, Magnesium, Omega-3 → Stabilität
  const tryptophan = list.some((i) => i.tags.some((t) => TRYPTOPHAN_TAGS.includes(t)));
  const magnesium = micros.magnesium ?? 0;
  if (tryptophan || magnesium >= 20 || omega3 >= 1.5) {
    const mag = Math.min(0.3, 0.1 + magnesium / 400 + (omega3 >= 1.5 ? 0.07 : 0));
    effects.push({
      kind: "regulation",
      label: "Ruhiger Boden — Stabilität regeneriert",
      magnitude: Math.round(mag * 100) / 100,
      durationSec: Math.round(240 * durationMul),
    });
    const why = [tryptophan ? "Tryptophan (Serotonin-Vorstufe)" : null, magnesium >= 20 ? "Magnesium" : null, omega3 >= 1.5 ? "Omega-3" : null]
      .filter(Boolean)
      .join(", ");
    notes.push(`${why}: Stabilität +${Math.round(mag * 100)} % Regeneration.`);
  }

  if (satiety >= 8) {
    notes.push(`Protein + Ballaststoffe (${Math.round(satiety)} g): Wirkung hält ${durationMul >= 1.5 ? "deutlich" : "etwas"} länger.`);
  }

  return {
    name: recipe ? recipe.name : "Improvisierte Mahlzeit",
    matchedRecipeId: recipe ? recipe.id : null,
    grams: Math.round(grams),
    kcal: Math.round(kcal),
    carbs: Math.round(carbs * 10) / 10,
    sugar: Math.round(sugar * 10) / 10,
    protein: Math.round(protein * 10) / 10,
    fat: Math.round(fat * 10) / 10,
    omega3: Math.round(omega3 * 100) / 100,
    fiber: Math.round(fiber * 10) / 10,
    micros,
    gluten,
    effects,
    notes,
  };
}

// ── Glutenfrei-Modus (M3, Bildungs-Feature) ──────────────────────────────────

/** Echte, übliche Tauschwege: glutenhaltige Zutat → glutenfreie Alternative */
export const SUBSTITUTIONS: Record<string, { id: string; as: string }[]> = {
  weizenmehl: [
    { id: "reis", as: "Reismehl" },
    { id: "mandel", as: "Mandelmehl" },
    { id: "buchweizen", as: "Buchweizenmehl" },
  ],
  vollkornbrot: [
    { id: "kartoffel", as: "Kartoffelbrot" },
    { id: "reis", as: "Reisbrot" },
  ],
  hafer: [
    { id: "buchweizen", as: "Buchweizen-Flocken" },
    { id: "reis", as: "Reisflocken" },
    { id: "quinoa", as: "Quinoa-Flocken" },
  ],
};

/** Sichere Vorratskammer (Lernziel): alles natürlich glutenfrei */
export const GF_PANTRY = [
  "reis", "buchweizen", "quinoa", "hafer", // (Hafer nur zertifiziert — im Spiel markiert)
  "kartoffel", "linse", "walnuss", "mandel", "haselnuss", "kuerbiskerne", "leinsamen",
  "apfel", "heidelbeere", "brennnessel", "champignon", "steinpilz",
  "hering", "lachs", "makrele", "miesmuschel", "moewenei",
  "milch", "kaese", "honig", "olivenoel", "nori",
];

export const GF_DISCLAIMER =
  "Der Ernährungs-Modus ist Wissensvermittlung, keine medizinische Beratung. Bei Verdacht auf Zöliakie oder Glutenunverträglichkeit: ärztliche Abklärung.";

/** Mangel-Wächter (nur Info): bei Zöliakie häufige Mangellage + Spiel-Quellen */
export const GF_WATCH: { micro: MicroKey; label: string; sources: string }[] = [
  { micro: "iron", label: "Eisen", sources: "Linsen, Kürbiskerne, Fisch" },
  { micro: "B12", label: "B12", sources: "Fisch, Möweneier, Käse" },
  { micro: "folate", label: "Folat", sources: "Linsen, Haselnüsse, Brennnessel" },
  { micro: "zinc", label: "Zink", sources: "Kürbiskerne, Käse, Hafer (zertifiziert)" },
];

// ── Aktive Mahlzeiten im Spielstand ──────────────────────────────────────────

export interface ActiveMeal {
  name: string;
  kind: "energie" | "konzentration" | "regulation";
  magnitude: number;
  expiresAt: number; // Date.now()-Zeitstempel
  crashAt?: number; // wenn gesetzt: ab hier Crash-Magnitude
  crashMagnitude?: number;
  crashExpiresAt?: number;
}

export function mealsToActive(dish: DishResult, now: number): ActiveMeal[] {
  return dish.effects.map((e) => ({
    name: dish.name,
    kind: e.kind,
    magnitude: e.magnitude,
    expiresAt: now + e.durationSec * 1000,
    crashAt: e.crashAfterSec !== undefined ? now + e.crashAfterSec * 1000 : undefined,
    crashMagnitude: e.crashMagnitude,
    crashExpiresAt: e.crashAfterSec !== undefined ? now + (e.crashAfterSec + 60) * 1000 : undefined,
  }));
}

/** Summe der aktiven Wirkungen pro Art (Regenerations-Multiplikator − 1) */
export function mealBonus(meals: ActiveMeal[], kind: MealEffect["kind"], now: number): number {
  let bonus = 0;
  for (const m of meals) {
    if (m.kind !== kind) continue;
    if (now < m.expiresAt) bonus += m.magnitude;
    else if (m.crashAt !== undefined && m.crashExpiresAt !== undefined && now >= m.crashAt && now < m.crashExpiresAt) {
      bonus += m.crashMagnitude ?? 0;
    }
  }
  return bonus;
}

/** Abgelaufene Mahlzeiten (inkl. Crash-Fenster) entfernen */
export function pruneMeals(meals: ActiveMeal[], now: number): ActiveMeal[] {
  return meals.filter((m) => now < m.expiresAt || (m.crashExpiresAt !== undefined && now < m.crashExpiresAt));
}
