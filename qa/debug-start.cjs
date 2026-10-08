const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on("console", (m) => console.log("[console:" + m.type() + "]", m.text().slice(0, 300)));
  page.on("pageerror", (e) => console.log("[pageerror]", String(e).slice(0, 500)));
  page.on("requestfailed", (r) => console.log("[reqfail]", r.url().slice(-80), r.failure()?.errorText));
  await page.goto("http://localhost:3100/", { waitUntil: "load" });
  await page.waitForTimeout(800);
  await page.click("text=Neue Reise");
  await page.waitForTimeout(300);
  for (let i = 0; i < 14; i++) { await page.mouse.click(640, 300); await page.waitForTimeout(80); }
  await page.waitForTimeout(12000);
  const state = await page.evaluate(() => ({
    hasGame: !!window.__game,
    bodySnippet: document.body.textContent.slice(0, 120),
  }));
  console.log(JSON.stringify(state));
  await browser.close();
})();
