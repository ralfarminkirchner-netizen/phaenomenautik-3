const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 810 } });
  page.on("pageerror", (e) => console.log("[pageerror]", String(e).slice(0, 300)));
  await page.goto("http://localhost:3100/", { waitUntil: "load" });
  await page.waitForTimeout(900);
  await page.click("text=Neue Reise");
  await page.waitForTimeout(400);
  for (let i = 0; i < 14; i++) { await page.mouse.click(720, 300); await page.waitForTimeout(90); }
  await page.waitForTimeout(2500);
  const st = await page.evaluate(() => ({
    titleVisible: document.body.textContent.includes("Klicken"),
    loading: document.body.textContent.includes("Die See wird bereitet"),
    canvas: !!document.querySelector("canvas"),
  }));
  console.log(JSON.stringify(st));
  await browser.close();
})();
