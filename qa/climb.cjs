// PHÄNOMENAUTIK 3 — Kletter-QA: Wand ansteuern, greifen, hoch/seitlich klettern,
// manteln. Inkl. Input-Richtungs-Wahrheitstest (M2.1-Lektion): A muss die
// Lateralkoordinate verkleinern, D vergrößern.
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
  const state = () =>
    page.evaluate(() => {
      const g = window.__game;
      const w = g.climbWalls[0];
      const nx = Math.sin(w.yaw), nz = Math.cos(w.yaw);
      const rx = -Math.cos(w.yaw), rz = Math.sin(w.yaw);
      const dx = g.player.pos.x - w.x, dz = g.player.pos.z - w.z;
      return {
        climbing: !!g.player.climbing,
        grounded: g.player.grounded,
        y: g.player.pos.y,
        baseY: w.baseY,
        height: w.height,
        lateral: dx * rx + dz * rz,
        stamina: g.save.player.stamina,
        maxStamina: g.save.player.maxStamina,
      };
    });

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

  // Anlegen wie im Standardlauf, dann zur Hafen-Kletterwand teleportieren
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
  await page.waitForTimeout(500);
  await page.keyboard.press("e");
  await page.waitForTimeout(1500);

  await page.evaluate(() => {
    const g = window.__game;
    const w = g.climbWalls[0];
    const nx = Math.sin(w.yaw), nz = Math.cos(w.yaw);
    g.player.place(w.x + nx * 6, w.baseY, w.z + nz * 6, w.yaw + Math.PI);
    g.player.camYaw = w.yaw; // Kamera hinter dem Spieler, Blick zur Wand
  });
  await page.waitForTimeout(900);
  await shot("c1-wall-approach.png");

  // Zur Wand laufen und greifen
  await page.keyboard.down("w");
  await page.waitForTimeout(1400);
  const grabbed = await state();
  await shot("c2-grabbed.png");

  // Hochklettern
  await page.waitForTimeout(2200);
  const up = await state();
  await shot("c3-climbing-up.png");

  // Richtungs-Test: A (input.x=-1) muss lateral verkleinern
  const before = up.lateral;
  await page.keyboard.up("w");
  await page.keyboard.down("a");
  await page.waitForTimeout(1100);
  const left = await state();
  await page.keyboard.up("a");
  await shot("c4-climb-left.png");

  // Weiter hoch bis zum Manteln (Ausdauer für den Mechanik-Test auffüllen —
  // dass leere Ausdauer zum Loslassen zwingt, ist oben bereits bewiesen)
  await page.evaluate(() => {
    window.__game.save.player.stamina = window.__game.save.player.maxStamina;
  });
  await page.keyboard.down("w");
  let top = await state();
  for (let i = 0; i < 14 && top.climbing; i++) {
    await page.waitForTimeout(400);
    top = await state();
  }
  await page.keyboard.up("w");
  await page.waitForTimeout(700);
  top = await state();
  await shot("c5-mantled-top.png");

  const checks = {
    grabbed: grabbed.climbing === true,
    climbedUp: up.y > grabbed.y + 1.5 || (up.climbing && up.y > up.baseY + 2),
    leftIsLeft: left.lateral < before - 0.3,
    staminaDrained: up.stamina < up.maxStamina,
    mantled: top.grounded === true && top.y > top.baseY + top.height * 0.6,
  };
  console.log(JSON.stringify({ consoleErrors: errors, grabbed, up, left, top, checks }, null, 2));
  await browser.close();
  if (Object.values(checks).some((v) => !v) || errors.length) process.exit(1);
})();
