// PHÄNOMENAUTIK — M5 Grafiksprung: Sicht-Beweis Dämmerung (GTAO+Grade+Feuer),
// Nacht (Mond, Sterne, kühles Grading), Tag auf offener See (Wolkenschatten).
// QA_URL=… für Produktion, sonst dist/ lokal.
const path = require("path");
const { chromium } = require("playwright");
const { serveDist } = require("./serve.cjs");

const OUT = path.join(__dirname, "shots");
const PORT = 3197;
const QA_URL = process.env.QA_URL || `http://localhost:${PORT}/`;

(async () => {
  const srv = process.env.QA_URL ? null : await serveDist(PORT);
  const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  await ctx.addInitScript(() => localStorage.clear());
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));

  try {
    await page.goto(QA_URL, { waitUntil: "load" });
    await page.waitForTimeout(1500);
    await page.click("text=Neue Reise");
    await page.waitForTimeout(600);
    for (let i = 0; i < 14; i++) { await page.mouse.click(800, 450); await page.waitForTimeout(160); }
    await page.waitForFunction(() => !!window.__game, { timeout: 60000 });
    await page.waitForTimeout(5000);

    // ── Dämmerung am Hafen, zu Fuß, Feuer an (Sonnentiefe ≈ 0,13 = Goldstunde) ──
    await page.evaluate(() => {
      const g = window.__game;
      g.save.timeOfDay = 19.45;
      g.props.setFireLit("feuer_harbor", true);
      if (!g.save.litFires.includes("feuer_harbor")) g.save.litFires.push("feuer_harbor");
      // vor das Feuer stellen, Blick Richtung Werkbank/Bäume
      const f = g.props.fireById("feuer_harbor");
      g.save.mode = "onfoot";
      g.player.group.visible = true;
      g.ship.moored = true;
      const y = g.groundAt(f.x + 5, f.z + 5);
      g.player.place(f.x + 5, y, f.z + 5, Math.PI * 0.75);
      g.player.camYaw = Math.PI * 0.78;
      g.player.camPitch = 0.18;
      g.player.camDist = 8;
    });
    await page.waitForTimeout(3500);
    await page.screenshot({ path: path.join(OUT, "m5-dusk-harbor.png") });

    // ── Nacht: Mond + Sterne ──
    await page.evaluate(() => {
      const g = window.__game;
      g.save.timeOfDay = 22.6;
      g.player.camPitch = 0.05; // mehr Himmel
    });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT, "m5-night-sky.png") });

    // ── Tag: offene See, Wolkenschatten prüfen ──
    await page.evaluate(() => {
      const g = window.__game;
      g.save.timeOfDay = 11.5;
      g.save.mode = "sailing";
      g.player.group.visible = false;
      g.ship.moored = false;
      g.ship.setPose(2100, 2900, 2.4);
      g.sailYaw = 2.9;
      g.sailPitch = 0.42;
      g.sailDist = 22;
    });
    await page.waitForTimeout(4000);
    await page.screenshot({ path: path.join(OUT, "m5-day-sea.png") });

    // FPS-A/B: GTAO an (Stufe 0) vs. aus (Stufe 2), gleiche Szene
    const fpsSample = () =>
      page.evaluate(
        () =>
          new Promise((res) => {
            let n = 0;
            const t0 = performance.now();
            const loop = () => { n++; if (performance.now() - t0 < 2500) requestAnimationFrame(loop); else res(Math.round((n / 2500) * 1000)); };
            requestAnimationFrame(loop);
          }),
      );
    await page.evaluate(() => { const g = window.__game; g.qualityLevel = 0; g.applyQuality(); g.fpsEma = 60; });
    await page.waitForTimeout(800);
    const fpsA = await fpsSample();
    await page.evaluate(() => { const g = window.__game; g.qualityLevel = 2; g.applyQuality(); });
    await page.waitForTimeout(800);
    const fpsB = await fpsSample();
    console.log(JSON.stringify({ fpsA, fpsB, errors: errors.slice(0, 5) }));
  } finally {
    await browser.close();
    if (srv) srv.close();
    process.exit(0);
  }
})();
