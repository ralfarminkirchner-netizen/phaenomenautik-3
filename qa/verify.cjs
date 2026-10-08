const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
  await page.goto("http://localhost:3100/", { waitUntil: "load" });
  await page.waitForTimeout(1000);
  await page.click("text=Neue Reise");
  await page.waitForTimeout(400);
  for (let i = 0; i < 14; i++) { await page.mouse.click(640, 300); await page.waitForTimeout(120); }
  await page.waitForSelector("canvas", { timeout: 30000 });
  await page.waitForTimeout(5000);

  // Anlegen
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
  await page.waitForTimeout(800);

  // Werkbank-Upgrade
  const up = await page.evaluate(() => {
    const g = window.__game;
    g.save.wood = 9;
    const wb = g.props.workbench;
    g.player.place(wb.x + 2, wb.y, wb.z + 2, Math.PI / 2);
    return { wb, wood: g.save.wood };
  });
  await page.waitForTimeout(500);
  const promptBefore = await page.evaluate(() => window.__game.currentPrompt?.text ?? null);
  await page.keyboard.press("e");
  await page.waitForTimeout(600);
  const afterUpgrade = await page.evaluate(() => ({ lvl: window.__game.save.weaponLevel, wood: window.__game.save.wood }));

  // Wieder einsteigen
  await page.evaluate(() => {
    const g = window.__game;
    g.player.place(g.ship.x + 4, 0.5, g.ship.z, 0);
  });
  await page.waitForTimeout(500);
  const boardPrompt = await page.evaluate(() => window.__game.currentPrompt?.text ?? null);
  await page.keyboard.press("e");
  await page.waitForTimeout(800);
  const modeAfterBoard = await page.evaluate(() => window.__game.save.mode);

  // Kampf: Gegner töten → Kristall
  const kill = await page.evaluate(async () => {
    const g = window.__game;
    g.save.mode = "onfoot";
    const e = g.enemies.find((en) => !en.dead);
    const y = g.props.groundHeight(e.x + 2, e.z);
    g.player.place(e.x + 2, y, e.z, Math.PI / 2);
    for (let i = 0; i < 5; i++) {
      e.hit(20, g.particles);
      if (e.dead) break;
    }
    return { dead: e.dead, hp: e.hp };
  });
  console.log(JSON.stringify({ errors, up, promptBefore, afterUpgrade, boardPrompt, modeAfterBoard, kill }, null, 2));
  await browser.close();
})();
