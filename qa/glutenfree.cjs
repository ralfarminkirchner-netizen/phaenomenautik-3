// PHÄNOMENAUTIK 3 — Glutenfrei-QA: GF-Modus, Tagging, Substitution, Tove-Quest-Flag
const path = require("path");
const { chromium } = require("playwright");

const OUT = path.join(__dirname, "shots");
const URL = process.env.QA_URL || "http://localhost:3100/";

(async () => {
  const browser = await chromium.launch({
    args: ["--enable-gpu", "--ignore-gpu-blocklist"],
  });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text().slice(0, 300));
  });
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 300)));
  const shot = (name) => page.screenshot({ path: path.join(OUT, name) });

  await page.goto(URL, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  await page.click("text=Neue Reise");
  await page.waitForTimeout(600);
  for (let i = 0; i < 14; i++) {
    await page.mouse.click(800, 450);
    await page.waitForTimeout(160);
  }
  await page.waitForSelector("canvas", { timeout: 30000 });
  await page.waitForTimeout(9000);

  // Anlegen, GF-Modus an, Vorrat füllen, ans Feuer
  await page.evaluate(() => {
    const g = window.__game;
    let zDock = 3560;
    for (let z = 3560; z > 3420; z -= 1) {
      const h = g.props.groundHeight(2100, z);
      if (h > -4 && h < -2.3) { zDock = z; break; }
    }
    g.ship.setPose(2100, zDock, Math.PI);
    g.ship.speed = 0;
  });
  await page.waitForTimeout(400);
  await page.keyboard.press("e");
  await page.waitForTimeout(1400);
  await page.evaluate(() => {
    const g = window.__game;
    const f = g.props.fireById("feuer_harbor");
    if (!f.lit) {
      g.save.wood += 2;
      f.lit = true;
      if (!g.save.litFires.includes(f.id)) g.save.litFires.push(f.id);
    }
    g.save.glutenFree = true;
    g.save.food = { vollkornbrot: 1, kaese: 1, kartoffel: 1, apfel: 1 };
    g.player.place(f.x + 2.0, f.y, f.z + 2.0, Math.PI / 4);
  });
  await page.waitForTimeout(600);

  await page.keyboard.press("k");
  await page.waitForTimeout(700);
  await shot("g1-gf-badges.png");

  // Brot + Käse in den Topf → Substitutions-Panel muss erscheinen
  await page.click("text=Vollkornbrot");
  await page.click("text=Käse (Gouda)");
  let subVisible = false;
  try {
    await page.waitForSelector("text=Glutenfrei tauschen", { timeout: 4000 });
    subVisible = true;
  } catch {
    subVisible = false;
  }
  await shot("g2-gf-substitution.png");

  // Kartoffelbrot tauschen
  await page.click("text=Kartoffelbrot");
  await page.waitForTimeout(400);
  const afterSwap = await page.evaluate(() => document.body.innerText.includes("enthält Gluten"));
  await shot("g3-gf-swapped.png");

  // Kochen → glutenfreies Gericht, Quest-Flag
  await page.click("text=Kochen & Essen");
  await page.waitForTimeout(600);
  const state = await page.evaluate(() => ({
    gfMealCooked: window.__game.save.gfMealCooked === true,
    food: window.__game.save.food,
    meals: window.__game.save.activeMeals.length,
  }));

  const checks = {
    subPanelShown: subVisible === true,
    swapWorked: afterSwap === false, // nach dem Tausch kein „enthält Gluten"-Badge mehr
    gfMealFlag: state.gfMealCooked === true,
    breadConsumed: (state.food.vollkornbrot ?? 0) === 0,
    mealActive: state.meals > 0,
  };
  console.log(JSON.stringify({ consoleErrors: errors, state, checks }, null, 2));
  await browser.close();
  if (Object.values(checks).some((v) => !v) || errors.length) process.exit(1);
})();
