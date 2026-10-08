const { chromium } = require("playwright");
const { serveDist } = require("./serve.cjs");
(async () => {
  const srv = await serveDist(3310);
  const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 810 } });
  await page.goto("http://127.0.0.1:3310/", { waitUntil: "load" });
  await page.waitForTimeout(800);
  await page.click("text=Neue Reise");
  await page.waitForTimeout(300);
  for (let i = 0; i < 14; i++) { await page.mouse.click(720, 300); await page.waitForTimeout(80); }
  for (let i = 0; i < 40; i++) { if (await page.evaluate(() => !!window.__game)) break; await page.waitForTimeout(500); }
  await page.waitForTimeout(6000);

  const measure = () => page.evaluate(() => new Promise((res) => {
    let n = 0; const t0 = performance.now();
    const loop = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(loop); else res(n / 2); };
    requestAnimationFrame(loop);
  }));

  const results = {};
  results.baseline = await measure();
  // Bloom aus (direkter Render)
  await page.evaluate(() => { window.__game.qualityLevel = 3; });
  results.noBloom = await measure();
  await page.evaluate(() => { window.__game.qualityLevel = 0; });
  // Schatten aus
  await page.evaluate(() => { window.__game.renderer.shadowMap.enabled = false; });
  results.noShadows = await measure();
  await page.evaluate(() => { window.__game.renderer.shadowMap.enabled = true; });
  // Wasser lo
  await page.evaluate(() => { window.__game.water.setHighQuality(false); });
  results.waterLo = await measure();
  await page.evaluate(() => { window.__game.water.setHighQuality(true); });
  // Terrain aus
  await page.evaluate(() => { window.__game.scene.getObjectByName("terrain").visible = false; });
  results.noTerrain = await measure();
  await page.evaluate(() => { window.__game.scene.getObjectByName("terrain").visible = true; });
  // Alles aus (nur Wasser+Sky)
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
  srv.close();
  process.exit(0);
})();
