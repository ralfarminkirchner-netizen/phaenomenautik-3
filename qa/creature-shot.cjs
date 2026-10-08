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
  await page.waitForTimeout(6000);
  // Wächter tagsüber
  await page.evaluate(() => {
    const g = window.__game;
    g.save.mode = "onfoot";
    g.ship.moored = true;
    const c = g.creatures.get("flashback");
    const cp = c.group.position;
    const y = g.props.groundHeight(cp.x, cp.z + 16);
    g.player.place(cp.x, y, cp.z + 16, Math.PI);
    g.player.group.visible = true;
    g.player.camYaw = 0;
    g.player.camPitch = 0.28;
  });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "qa/shots/creature-day.png" });
  // Nacht
  await page.evaluate(() => { window.__game.save.timeOfDay = 22.3; });
  await page.waitForTimeout(900);
  await page.screenshot({ path: "qa/shots/creature-night.png" });
  // Begegnungs-Kamera
  await page.evaluate(() => { window.__game.save.timeOfDay = 17.5; window.__game.startEncounter("flashback"); });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "qa/shots/creature-battleframe.png" });
  await browser.close();
  srv.close();
  process.exit(0);
})();
