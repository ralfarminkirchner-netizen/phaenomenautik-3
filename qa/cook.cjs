// PHÄNOMENAUTIK 3 — Koch-QA: ans Feuer, Koch-UI öffnen (K), Zutaten wählen,
// kochen, Wirkung verifizieren (HUD + Spielstand + Präsenz-Regeneration).
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

  // Anlegen + ans Hafen-Feuer stellen, Vorrat für den Test füllen
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
  await page.waitForTimeout(500);
  await page.keyboard.press("e");
  await page.waitForTimeout(1500);

  await page.evaluate(() => {
    const g = window.__game;
    const f = g.props.fireById("feuer_harbor");
    if (!f.lit) {
      g.save.wood += 2;
      f.lit = true;
      if (!g.save.litFires.includes(f.id)) g.save.litFires.push(f.id);
    }
    g.save.food = { hering: 2, kartoffel: 2, honig: 1, heidelbeere: 2, hafer: 1 };
    g.save.player.presence = 5; // Regeneration sichtbar machen
    g.player.place(f.x + 2.0, f.y, f.z + 2.0, Math.PI / 4);
  });
  await page.waitForTimeout(700);

  // Koch-UI öffnen
  await page.keyboard.press("k");
  await page.waitForTimeout(800);
  await shot("k1-cook-ui.png");

  // Fischerfrühstück: Hering + Kartoffel
  await page.click("text=Hering");
  await page.click("text=Kartoffeln");
  await page.waitForTimeout(400);
  await shot("k2-cook-preview.png");

  await page.click("text=Kochen & Essen");
  await page.waitForTimeout(700);
  await shot("k3-cooked.png");

  const after = await page.evaluate(() => {
    const g = window.__game;
    return {
      food: g.save.food,
      meals: g.save.activeMeals.map((m) => ({ name: m.name, kind: m.kind, mag: m.magnitude })),
      recipesFound: g.save.recipesFound,
      presence: Math.round(g.save.player.presence * 10) / 10,
    };
  });

  // Präsenz-Regeneration durch Konzentrations-Wirkung (2 s warten)
  await page.keyboard.press("Escape");
  await page.waitForTimeout(2100);
  const regen = await page.evaluate(() => Math.round(window.__game.save.player.presence * 10) / 10);
  await shot("k4-hud-meals.png");

  const checks = {
    uiOpened: true, // Screenshots k1/k2 belegen das Overlay
    ingredientsConsumed: (after.food.hering ?? 0) === 1 && (after.food.kartoffel ?? 0) === 1,
    mealActive: after.meals.some((m) => m.name === "Fischerfrühstück"),
    recipeLearned: after.recipesFound.includes("fischerfruehstueck"),
    presenceRegen: regen > after.presence + 0.2,
  };
  console.log(JSON.stringify({ consoleErrors: errors, after, regen, checks }, null, 2));
  await browser.close();
  if (Object.values(checks).some((v) => !v) || errors.length) process.exit(1);
})();
