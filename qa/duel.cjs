// PHÄNOMENAUTIK 3 — Duell-QA (M3.5): Vessa ansprechen, Taktik benennen,
// Kompass-Eintrag prüfen, Auflösung durchspielen.
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

  // Anlegen, Kristalle geben, zu Vessa teleportieren (Dock: d.x+2, d.z+7)
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
  await page.evaluate(() => {
    const g = window.__game;
    g.save.crystals = 10;
    const d = g.props.dock;
    const y = g.props.groundHeight(d.x + 2, d.z + 7);
    g.player.place(d.x + 3.2, y, d.z + 8.2, -2.6);
  });
  await page.waitForTimeout(800);

  // Vessa ansprechen → Duell öffnet sich
  await page.keyboard.press("e");
  await page.waitForTimeout(1200);
  const duelOpen = await page.evaluate(() => !!window.__store.get().duelId);
  await shot("d1-duell-intro.png");

  // Beat 1: Muster benennen → Quiz → Love Bombing (richtig)
  await page.waitForTimeout(4200); // Typewriter abwarten
  await page.click("text=Muster benennen");
  await page.waitForTimeout(400);
  await shot("d2-duell-quiz.png");
  await page.click("text=🧭 Love Bombing");
  await page.waitForTimeout(2200); // onMusterHit + advance

  // Beat 2: Grenze setzen → weiter
  await page.waitForTimeout(4200);
  await page.click("text=Grenze setzen");
  await page.waitForTimeout(3200);

  // Beat 3 (Goalposts): Muster benennen → Moving Goalposts (richtig)
  await page.waitForTimeout(4200);
  await page.click("text=Muster benennen");
  await page.waitForTimeout(400);
  await page.click("text=🧭 Moving Goalposts");
  await page.waitForTimeout(2600);
  await shot("d3-duell-resolve.png");

  // Auflösung → Journal festhalten → Debrief
  await page.click("text=Im Journal festhalten");
  await page.waitForTimeout(600);
  await shot("d4-duell-debrief.png");

  await page.click("text=Zurück zur Welt");
  await page.waitForTimeout(600);

  const state = await page.evaluate(() => ({
    compass: window.__game.save.compassEntries,
    done: window.__game.save.duelsDone,
    crystals: window.__game.save.crystals,
    xp: window.__game.save.player.xp,
  }));

  const checks = {
    duelOpened: duelOpen === true,
    bothTacticsLearned: state.compass.includes("love_bombing") && state.compass.includes("moving_goalposts"),
    duelDone: state.done.includes("duell_vessa"),
    fairPrice: state.crystals === 7, // 10 − 3 (fairer Preis, nichts vorher bezahlt)
    xpGranted: state.xp >= 55, // 2×15 Kompass + 25 Auflösung
  };
  console.log(JSON.stringify({ consoleErrors: errors, state, checks }, null, 2));
  await browser.close();
  if (Object.values(checks).some((v) => !v) || errors.length) process.exit(1);
})();
