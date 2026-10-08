// Charakter-Nahaufnahmen: Idle, Lauf, Angriff, Skelett
const path = require("path");
const { chromium } = require("playwright");
const OUT = path.join(__dirname, "shots");
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
  await page.waitForTimeout(9000);

  // An Land bringen + Kamera nah am Charakter
  await page.evaluate(() => {
    const g = window.__game;
    g.save.mode = "onfoot";
    g.ship.moored = true;
    const f = g.props.fireById("feuer_harbor");
    const y = g.props.groundHeight(f.x + 6, f.z + 8);
    g.player.place(f.x + 6, y, f.z + 8, Math.PI);
    g.player.group.visible = true;
    g.player.camDist = 4.2;
    g.player.camPitch = 0.12;
    g.player.camYaw = Math.PI * 0.75; // von vorn-seitlich
  });
  await page.waitForTimeout(1800);
  await page.screenshot({ path: path.join(OUT, "c1-idle.png") });
  await page.keyboard.down("w");
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(OUT, "c2-walk.png") });
  await page.waitForTimeout(600);
  await page.keyboard.up("w");
  await page.evaluate(() => window.__game.tryAttack());
  await page.waitForTimeout(280);
  await page.screenshot({ path: path.join(OUT, "c3-attack.png") });
  // Skelett-Gegner
  await page.evaluate(() => {
    const g = window.__game;
    const e = g.enemies.find((en) => !en.dead);
    const y = g.props.groundHeight(e.x + 5, e.z + 5);
    g.player.place(e.x + 5, y, e.z + 5, (-3 * Math.PI) / 4);
    g.player.camYaw = (-3 * Math.PI) / 4 + Math.PI;
  });
  await page.waitForTimeout(2200);
  await page.screenshot({ path: path.join(OUT, "c4-skeleton.png") });
  console.log(JSON.stringify({ errors }, null, 2));
  await browser.close();
})();
