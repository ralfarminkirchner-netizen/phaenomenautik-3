// Check an already deployed service; QA_URL selects the service under inspection.
// Title, game startup and browser errors all determine the exit status.
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const URL = process.env.QA_URL || "https://phaenomenautik-3-production.up.railway.app/";
const OUT = path.join(__dirname, "shots");

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    const errors = [];
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
    await page.goto(URL, { waitUntil: "load", timeout: 60000 });
    await page.waitForTimeout(2500);
    const title = await page.evaluate(() => document.body.textContent.includes("PHÄNOMENAUTIK"));
    await page.screenshot({ path: path.join(OUT, "railway-title.png") });
    await page.click("text=Neue Reise");
    await page.waitForTimeout(400);
    for (let i = 0; i < 14; i++) { await page.mouse.click(640, 300); await page.waitForTimeout(90); }
    let booted = false;
    for (let i = 0; i < 90; i++) { if (await page.evaluate(() => !!window.__game)) { booted = true; break; } await page.waitForTimeout(500); }
    await page.waitForTimeout(6000);
    await page.screenshot({ path: path.join(OUT, "railway-game.png") });
    console.log(JSON.stringify({ title, booted, errors: errors.slice(0, 5) }));
    if (!title || !booted || errors.length) process.exitCode = 1;
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
