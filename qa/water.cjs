// PHÄNOMENAUTIK 3 — Wasser-QA: offene See, 4 Licht-/Wetter-Zustände, FPS, Konsole
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
  await page.click("text=Neue Reise");
  await page.waitForTimeout(600);
  for (let i = 0; i < 14; i++) {
    await page.mouse.click(800, 450);
    await page.waitForTimeout(160);
  }
  await page.waitForSelector("canvas", { timeout: 30000 });
  await page.waitForTimeout(9000);

  // Auf offene See teleportieren (tiefes Wasser suchen), Richtung Inselblick
  await page.evaluate(() => {
    const g = window.__game;
    let zSea = 2600;
    for (let z = 3300; z > 1800; z -= 4) {
      if (g.props.groundHeight(2100, z) < -8) {
        zSea = z;
        break;
      }
    }
    g.ship.setPose(2100, zSea, 0); // Blick nach Norden aufs offene Meer
    g.ship.speed = 0;
  });
  await page.waitForTimeout(800);

  // Segeln für Fahrt-Wake + Kamera in Fahrt-Position
  await page.keyboard.down("w");
  await page.waitForTimeout(2500);
  await page.keyboard.up("w");

  const scenes = [
    ["w1-day", 10.5, 0.0],
    ["w2-dusk", 19.3, 0.0],
    ["w3-night", 22.6, 0.0],
    ["w4-storm-day", 13.0, 0.9],
    ["w5-storm-dusk", 19.6, 0.75],
  ];
  for (const [name, tod, storm] of scenes) {
    await page.evaluate(
      ([t, s]) => {
        window.__game.save.timeOfDay = t;
        window.__game.storm = s;
      },
      [tod, storm],
    );
    await page.waitForTimeout(1400);
    await shot(`${name}.png`);
  }
  await page.evaluate(() => {
    window.__game.storm = 0;
    window.__game.save.timeOfDay = 10.5;
  });
  const fpsSail = await fps();

  console.log(JSON.stringify({ consoleErrors: errors, fpsSail }, null, 2));
  await browser.close();
})();
