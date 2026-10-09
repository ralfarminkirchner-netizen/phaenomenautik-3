// PHÄNOMENAUTIK — M4 QA: Strand-Begegnung End-to-End
// Teleport zu einem Strandläufer, Prompt prüfen, begegnen, begreifen,
// Register/Fog-Reveal/Persistenz verifizieren. Aufruf:
//   node qa/serve-dist.cjs ist nicht nötig — dieses Skript serviert dist/ selbst.
//   NODE_PATH=../traumaatlas-3/node_modules node qa/encounter.cjs
const path = require("path");
const { chromium } = require("playwright");
const { serveDist } = require("./serve.cjs");

const OUT = path.join(__dirname, "shots");
const PORT = 3199;
const QA_URL = process.env.QA_URL || `http://localhost:${PORT}/`; // gesetzt = gegen Produktion testen

let pass = 0;
let fail = 0;
const ok = (cond, label, extra = "") => {
  if (cond) {
    pass++;
    console.log(`  ✓ ${label}`);
  } else {
    fail++;
    console.log(`  ✗ ${label} ${extra}`);
  }
};

(async () => {
  const srv = process.env.QA_URL ? null : await serveDist(PORT);
  const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  await ctx.addInitScript(() => localStorage.clear());
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text().slice(0, 300));
  });
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 300)));

  try {
    await page.goto(QA_URL, { waitUntil: "load" });
    await page.waitForTimeout(1500);
    await page.click("text=Neue Reise");
    await page.waitForTimeout(600);
    for (let i = 0; i < 14; i++) {
      await page.mouse.click(800, 450);
      await page.waitForTimeout(160);
    }
    await page.waitForSelector("canvas", { timeout: 30000 });
    await page.waitForFunction(() => !!window.__game, { timeout: 30000 });
    await page.waitForTimeout(6000);

    // 1) Strandläufer vorhanden?
    const wisps = await page.evaluate(() => window.__game.wispList);
    ok(wisps.length === 6, `6 Strandläufer aktiv (ist: ${wisps.length})`, JSON.stringify(wisps));
    const target = wisps.find((w) => w.nodeId === "atemdruck") ?? wisps[0];
    console.log(`  · Ziel: ${target.nodeId} @ ${Math.round(target.x)},${Math.round(target.z)}`);

    // 2) Teleport zum Strandläufer (zu Fuß)
    await page.evaluate(({ x, z }) => {
      const g = window.__game;
      const y = g.groundAt(x + 1.5, z);
      g.save.mode = "onfoot";
      g.player.place(x + 1.5, y, z, 0);
      g.player.group.visible = true;
      g.ship.moored = true;
    }, target);
    await page.waitForTimeout(800);

    // 3) Prompt erscheint mit Namen
    const prompt = await page.evaluate(() => window.__game.currentPrompt?.text ?? null);
    ok(!!prompt && prompt.includes("Strand-Begegnung"), `Prompt zeigt Strand-Begegnung (ist: „${prompt}“)`);
    await page.screenshot({ path: path.join(OUT, "encounter-prompt.png") });

    // 4) Begegnung öffnen (Taste E)
    await page.keyboard.press("e");
    await page.waitForTimeout(700);
    const overlayText = await page.evaluate(() => document.body.textContent ?? "");
    const nodeName = await page.evaluate((id) => window.__game.save.graph.met.includes(id), target.nodeId);
    ok(nodeName, "Knoten als „begegnet“ im Spielstand vermerkt");
    ok(overlayText.includes("Strand-Begegnung"), "Overlay zeigt Begegnungs-Header");

    // 5) Durch das Verstehen-Mini schreiten bis zur Friedenszeile
    for (let i = 0; i < 6; i++) {
      const hasRegister = await page.evaluate(() => (document.body.textContent ?? "").includes("Ins Register aufnehmen"));
      if (hasRegister) break;
      await page.keyboard.press("e");
      await page.waitForTimeout(450);
    }
    const finalVisible = await page.evaluate(() => (document.body.textContent ?? "").includes("Ins Register aufnehmen"));
    ok(finalVisible, "Friedenszeile + Register-Button erreicht");
    await page.screenshot({ path: path.join(OUT, "encounter-final.png") });

    // 6) Begreifen abschließen
    await page.click("text=Ins Register aufnehmen");
    await page.waitForTimeout(700);
    const after = await page.evaluate((id) => {
      const g = window.__game;
      return {
        understood: g.save.graph.understood.includes(id),
        wisps: g.wispList.map((w) => w.nodeId),
        xp: g.save.player.xp,
        overlayGone: !(document.body.textContent ?? "").includes("Ins Register aufnehmen"),
      };
    }, target.nodeId);
    ok(after.understood, "Knoten als „begriffen“ im Atlas-Register (save.graph.understood)");
    ok(!after.wisps.includes(target.nodeId), "Strandläufer hat sich aufgelöst");
    ok(after.xp >= 8, `Einsicht vergeben (xp: ${after.xp})`);
    ok(after.overlayGone, "Overlay geschlossen");

    // 7) Persistenz: localStorage enthält den Fortschritt
    const persisted = await page.evaluate((id) => {
      const raw = localStorage.getItem("phaenomenautik3-save-v1");
      if (!raw) return false;
      const s = JSON.parse(raw);
      return Array.isArray(s.graph?.understood) && s.graph.understood.includes(id);
    }, target.nodeId);
    ok(persisted, "Fortschritt persistiert (localStorage, save.graph)");

    // 8) Nebel-Reveal: panik (Nachbar von atemdruck) ist nach dem Begreifen aus dem Nebel
    const fogPanik = await page.evaluate(() => window.__game.fogOf("panik"));
    ok(fogPanik === "befahrbar" || fogPanik === "sichtbar", `Nachbar „panik“ ist aus dem Nebel (fogOf: ${fogPanik})`);

    ok(errors.length === 0, `0 Konsolenfehler (ist: ${errors.length})`, errors.join(" | "));
  } finally {
    await browser.close();
    srv?.close();
  }

  console.log(`\n${pass}/${pass + fail} Checks bestanden`);
  process.exit(fail ? 1 : 0);
})();
