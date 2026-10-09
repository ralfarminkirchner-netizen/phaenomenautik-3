// PHÄNOMENAUTIK 3 — Journal-QA: Körperkarte nach Mahlzeit + Rezepte-Tab
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

  // Direkt: Mahlzeit kochen (per Hook), damit Zonen leuchten
  await page.evaluate(() => {
    const g = window.__game;
    g.save.food = { hering: 1, kartoffel: 1, nori: 1, miesmuschel: 1, lachs: 1 };
    g.cookDish(["hering", "kartoffel"]);
    g.cookDish(["nori", "miesmuschel", "lachs"]);
  });
  await page.waitForTimeout(500);

  await page.keyboard.press("j");
  await page.waitForTimeout(700);
  await shot("j1-journal-atlas.png");

  await page.click("text=🧍 Körper");
  await page.waitForTimeout(600);
  // Hover über die Gehirn-Karte für Tooltip
  await page.mouse.move(700, 320);
  await page.waitForTimeout(400);
  await shot("j2-journal-koerper.png");

  await page.click("text=🍲 Rezepte");
  await page.waitForTimeout(500);
  await shot("j3-journal-rezepte.png");

  const state = await page.evaluate(() => ({
    recipes: window.__game.save.recipesFound,
    micros: window.__game.save.recentMicros.length,
  }));
  const checks = {
    twoRecipes: state.recipes.length === 2,
    microsTracked: state.micros === 2,
  };
  console.log(JSON.stringify({ consoleErrors: errors, state, checks }, null, 2));
  await browser.close();
  if (Object.values(checks).some((v) => !v) || errors.length) process.exit(1);
})();
