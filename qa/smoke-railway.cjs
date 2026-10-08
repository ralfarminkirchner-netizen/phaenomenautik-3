const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
  await page.goto("https://phaenomenautik-3-production.up.railway.app/", { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(2500);
  const title = await page.evaluate(() => document.body.textContent.includes("PHÄNOMENAUTIK"));
  await page.screenshot({ path: "qa/shots/railway-title.png" });
  await page.click("text=Neue Reise");
  await page.waitForTimeout(400);
  for (let i = 0; i < 14; i++) { await page.mouse.click(640, 300); await page.waitForTimeout(90); }
  let booted = false;
  for (let i = 0; i < 90; i++) { if (await page.evaluate(() => !!window.__game)) { booted = true; break; } await page.waitForTimeout(500); }
  await page.waitForTimeout(6000);
  await page.screenshot({ path: "qa/shots/railway-game.png" });
  console.log(JSON.stringify({ title, booted, errors: errors.slice(0, 5) }));
  await browser.close();
  process.exit(0);
})();
