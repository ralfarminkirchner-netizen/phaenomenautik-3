// PHÄNOMENAUTIK 3 — MacGyver-QA (M3.4): Gleitschirm fertigen + gleiten,
// Ventilator-Schub, Aufzug-Fahrt. Alles über echte Spielpfade/Hooks.
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

  // Anlegen
  await page.evaluate(() => {
    const g = window.__game;
    let zDock = 3560;
    for (let z = 3560; z > 3420; z -= 1) {
      const h = g.props.groundHeight(2100, z);
      if (h > -4 && h < -2.3) { zDock = z; break; }
    }
    g.ship.setPose(2100, zDock, Math.PI);
    g.ship.speed = 0;
  });
  await page.waitForTimeout(400);
  await page.keyboard.press("e");
  await page.waitForTimeout(1400);

  // ── 1. Gleitschirm fertigen (craftOnly: sofort, kein Geist) ──
  const crafted = await page.evaluate(() => {
    const g = window.__game;
    g.save.materials = { ...g.save.materials, tuch: 4, stange: 6, windkern: 2, seil: 4, stein: 3, erdkern: 1 };
    g.beginBuild("gleitschirm");
    return g.save.equipment.includes("gleitschirm") && g.save.materials.windkern === 1 && g.save.materials.tuch === 2;
  });

  // ── 2. Gleiten vom Felsturm-Plateau ──
  await page.evaluate(() => {
    const g = window.__game;
    const w = g.climbWalls[0];
    g.player.place(w.x - Math.sin(w.yaw) * 2.0, w.baseY + w.height + 0.2, w.z - Math.cos(w.yaw) * 2.0, w.yaw);
    g.player.camYaw = w.yaw + Math.PI; // Blick nach draußen (von der Wand weg)
  });
  await page.waitForTimeout(400);
  await page.keyboard.press(" "); // abspringen
  await page.waitForTimeout(600); // fallen lassen, dann halten = gleiten (kein Doppelsprung)
  await page.keyboard.down(" ");
  await page.waitForTimeout(1500);
  const glide = await page.evaluate(() => {
    const g = window.__game;
    return {
      gliding: g.player.gliding,
      velY: Math.round(g.player.vel.y * 100) / 100,
      speed: Math.round(Math.hypot(g.player.vel.x, g.player.vel.z) * 100) / 100,
    };
  });
  await shot("m1-glide.png");
  await page.keyboard.up(" ");
  await page.waitForTimeout(1500);

  // ── 3. Ventilator: platziert, schiebt den Spieler im Kegel ──
  const fan = await page.evaluate(() => {
    const g = window.__game;
    const p = g.player.pos;
    const yaw = Math.atan2(p.x - 2100, p.z - 3300); // zeigt vom Hafenzentrum weg
    const rec = g.structures.add({ id: "qa_fan", type: "ventilator", x: p.x - Math.sin(yaw) * 4, z: p.z - Math.cos(yaw) * 4, yaw });
    return { x: rec.def.x, z: rec.def.z, yaw };
  });
  const pushBefore = await page.evaluate(() => ({ x: window.__game.player.pos.x, z: window.__game.player.pos.z }));
  await page.waitForTimeout(1800);
  const pushAfter = await page.evaluate(() => ({ x: window.__game.player.pos.x, z: window.__game.player.pos.z }));
  const pushDist = Math.hypot(pushAfter.x - pushBefore.x, pushAfter.z - pushBefore.z);
  const pushAlign =
    ((pushAfter.x - pushBefore.x) * Math.sin(fan.yaw) + (pushAfter.z - pushBefore.z) * Math.cos(fan.yaw)) / Math.max(pushDist, 0.001);
  await shot("m2-ventilator.png");

  // ── 4. Aufzug: stellen, draufstehen, fahren ──
  await page.evaluate(() => {
    const g = window.__game;
    const p = g.player.pos;
    const g2 = g.props.groundHeight(p.x + 6, p.z);
    g.structures.add({ id: "qa_lift", type: "aufzug", x: p.x + 6, z: p.z, yaw: 0, topY: g2 + 8 });
    g.player.place(p.x + 6, g2 + 0.3, p.z, 0);
  });
  await page.waitForTimeout(700);
  const rideBefore = await page.evaluate(() => Math.round(window.__game.player.pos.y * 100) / 100);
  await page.keyboard.press("e"); // Aufzug: hochfahren
  await page.waitForTimeout(4300);
  const rideAfter = await page.evaluate(() => ({
    y: Math.round(window.__game.player.pos.y * 100) / 100,
    grounded: window.__game.player.grounded,
  }));
  await shot("m3-aufzug.png");

  const checks = {
    crafted,
    gliding: glide.gliding === true && glide.velY >= -1.7 && glide.speed > 3.5,
    fanPushes: pushDist > 1.5 && pushAlign > 0.7,
    liftRides: rideAfter.y > rideBefore + 5 && rideAfter.grounded,
  };
  console.log(JSON.stringify({ consoleErrors: errors, glide, pushDist: Math.round(pushDist * 100) / 100, pushAlign: Math.round(pushAlign * 100) / 100, rideBefore, rideAfter, checks }, null, 2));
  await browser.close();
  if (Object.values(checks).some((v) => !v) || errors.length) process.exit(1);
})();
