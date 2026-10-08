// PHÄNOMENAUTIK 3 — QA-Lauf: Screenshots, Konsolenfehler, FPS (Playwright)
const path = require("path");
const { chromium } = require("playwright");

const OUT = path.join(__dirname, "shots");
const URL = process.env.QA_URL || "http://localhost:3100/";

(async () => {
  const browser = await chromium.launch({
    args: ["--enable-gpu", "--ignore-gpu-blocklist"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text().slice(0, 300));
  });
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 300)));

  const shot = (name) => page.screenshot({ path: path.join(OUT, name) });
  const fps = () =>
    page.evaluate(
      () =>
        new Promise((res) => {
          let n = 0;
          const t0 = performance.now();
          const loop = () => {
            n++;
            if (performance.now() - t0 < 3000) requestAnimationFrame(loop);
            else res(Math.round((n / 3000) * 1000));
          };
          requestAnimationFrame(loop);
        }),
    );

  await page.goto(URL, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  await shot("01-title.png");

  // Neue Reise → Intro durchklicken
  await page.click("text=Neue Reise");
  await page.waitForTimeout(600);
  for (let i = 0; i < 14; i++) {
    await page.mouse.click(640, 300);
    await page.waitForTimeout(160);
  }
  await page.waitForSelector("canvas", { timeout: 30000 });
  await page.waitForTimeout(9000); // Terrain-Bake + Assets + erste Frames
  await shot("02-sailing-start.png");

  // Segeln
  await page.keyboard.down("w");
  await page.waitForTimeout(3500);
  await page.keyboard.up("w");
  await shot("03-sailing.png");
  const fpsSail = await fps();

  // Anlegen an der Hafen-Südküste: per Bodenabtastung eine Untiefe suchen
  await page.evaluate(() => {
    const g = window.__game;
    let zDock = 3560;
    for (let z = 3560; z > 3420; z -= 1) {
      const h = g.props.groundHeight(2100, z);
      if (h > -4 && h < -2.3) {
        zDock = z;
        break;
      }
    }
    g.ship.setPose(2100, zDock, Math.PI);
    g.ship.speed = 0;
  });
  await page.waitForTimeout(500);
  await page.keyboard.press("e");
  await page.waitForTimeout(1800);
  await shot("04-onfoot-beach.png");

  // Laufen (landeinwärts)
  await page.keyboard.down("w");
  await page.waitForTimeout(2600);
  await page.keyboard.up("w");
  await shot("05-onfoot-walk.png");

  // Baum fällen
  await page.evaluate(() => {
    const g = window.__game;
    const p = g.player.pos;
    const tr = g.props.nearestTree(p.x, p.z, 400);
    if (tr) {
      g.player.place(tr.x + 1.9, tr.y, tr.z, Math.PI / 2);
    }
  });
  await page.waitForTimeout(500);
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press("e");
    await page.waitForTimeout(550);
  }
  await page.waitForTimeout(1400);
  await shot("06-tree-felled.png");

  // Feuer anzünden am Hafen
  await page.evaluate(() => {
    const g = window.__game;
    const f = g.props.fireById("feuer_harbor");
    g.player.place(f.x + 2.2, f.y, f.z + 2.2, (Math.PI * 3) / 4);
  });
  await page.waitForTimeout(500);
  await page.keyboard.press("e");
  await page.waitForTimeout(2500);
  await shot("07-fire.png");

  // Sprung
  await page.keyboard.press(" ");
  await page.waitForTimeout(320);
  await shot("08-jump.png");

  // Dämmerung & Nacht
  await page.evaluate(() => {
    window.__game.save.timeOfDay = 19.3;
  });
  await page.waitForTimeout(900);
  await shot("09-dusk.png");
  await page.evaluate(() => {
    window.__game.save.timeOfDay = 22.6;
  });
  await page.waitForTimeout(900);
  await shot("10-night.png");

  // Schatten-Gegner + Kampf
  await page.evaluate(() => {
    const g = window.__game;
    g.save.timeOfDay = 10.5;
    const e = g.enemies.find((en) => !en.dead);
    const y = g.props.groundHeight(e.x + 3.5, e.z + 3.5);
    g.player.place(e.x + 3.5, y, e.z + 3.5, (-3 * Math.PI) / 4);
  });
  await page.waitForTimeout(1600);
  await shot("11-shadow-enemy.png");
  await page.evaluate(() => window.__game.tryAttack());
  await page.waitForTimeout(450);
  await shot("12-attack.png");
  const fpsFoot = await fps();

  // Sturm-Test
  await page.evaluate(() => {
    const g = window.__game;
    g.save.timeOfDay = 15;
    g.storm = 0.85;
  });
  await page.waitForTimeout(1200);
  await shot("13-storm.png");

  console.log(
    JSON.stringify(
      {
        consoleErrors: errors,
        fpsSail,
        fpsFoot,
        mode: await page.evaluate(() => window.__game.save.mode),
        wood: await page.evaluate(() => window.__game.save.wood),
      },
      null,
      2,
    ),
  );
  await browser.close();
})();
