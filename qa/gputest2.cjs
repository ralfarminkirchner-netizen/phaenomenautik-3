const { chromium } = require("playwright");
const { serveDist } = require("./serve.cjs");
(async () => {
  const srv = await serveDist(3310);
  const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 810 } });
  page.on("pageerror", (e) => console.log("[pageerror]", String(e).slice(0, 200)));
  await page.goto("http://127.0.0.1:3310/", { waitUntil: "load" });
  await page.waitForTimeout(800);
  await page.click("text=Neue Reise");
  await page.waitForTimeout(300);
  for (let i = 0; i < 14; i++) { await page.mouse.click(720, 300); await page.waitForTimeout(80); }
  for (let i = 0; i < 40; i++) { if (await page.evaluate(() => !!window.__game)) break; await page.waitForTimeout(500); }
  await page.waitForTimeout(12000); // Auto-Quality eingeschwungen
  const st = await page.evaluate(() => ({
    emaFps: window.__store.get().fps,
    qualityLevel: window.__game.qualityLevel,
    dpr: window.devicePixelRatio,
  }));
  console.log(JSON.stringify(st));
  await page.screenshot({ path: "qa/shots/gpu-check.png" });
  await browser.close();
  srv.close();
  process.exit(0);
})();
