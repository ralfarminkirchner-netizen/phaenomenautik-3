const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on("pageerror", (e) => console.log("[pageerror]", String(e).slice(0, 400)));
  await page.goto("http://localhost:3100/", { waitUntil: "load" });
  await page.waitForTimeout(800);
  await page.click("text=Neue Reise");
  await page.waitForTimeout(300);
  for (let i = 0; i < 14; i++) { await page.mouse.click(640, 300); await page.waitForTimeout(80); }
  await page.waitForTimeout(6000);
  const probe1 = await page.evaluate(() => ({
    fpsHud: window.__store?.get().fps,
    stab: window.__store?.get().stability,
    mode: window.__store?.get().mode,
    hudTimer: window.__game?.hudTimer,
    elapsed: window.__game?.elapsed,
  }));
  await page.waitForTimeout(2000);
  const probe2 = await page.evaluate(() => ({
    fpsHud: window.__store?.get().fps,
    stab: window.__store?.get().stability,
    elapsed: window.__game?.elapsed,
    canvas: !!document.querySelector("canvas"),
    canvasSize: (() => { const c = document.querySelector("canvas"); return c ? [c.width, c.height, c.clientWidth, c.clientHeight] : null; })(),
  }));
  console.log(JSON.stringify({ probe1, probe2 }, null, 2));
  await browser.close();
})();
