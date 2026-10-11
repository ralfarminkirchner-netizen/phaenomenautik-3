// PHÄNOMENAUTIK — M4.2 QA: Masken-Begegnung End-to-End (Live, Vollkatalog)
// Strand-Maske (zu Fuß) + Meer-Maske (vom Schiff), Begreifen, Register,
// Persistenz, Journal. Aufruf gegen Produktion:
//   NODE_PATH=<traumaatlas-3>/node_modules QA_URL=https://phaenomenautik-3-production.up.railway.app node qa/variants-live.cjs
// Ohne QA_URL serviert das Skript lokal dist/.
const path = require("path");
const { chromium } = require("playwright");
const { serveDist } = require("./serve.cjs");

const OUT = path.join(__dirname, "shots");
const PORT = 3197;
const QA_URL = process.env.QA_URL || `http://localhost:${PORT}/`;

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

    // 1) Volle Tagesliste + Render-Nähe
    const masks = await page.evaluate(() => window.__game.todaysMasks);
    const gameDate = await page.evaluate(() => window.__game.currentGameDate);
    ok(masks.length >= 150 && masks.length <= 320, `150–320 Masken im Umlauf (ist: ${masks.length})`);
    ok(/^\d{4}-\d{2}-\d{2}$/.test(gameDate), `Tages-Rotation läuft (Datum: ${gameDate})`);
    const beach = masks.filter((x) => !x.water);
    const water = masks.filter((x) => x.water);
    ok(beach.length > 0 && water.length > 0, `Strand- und Meer-Masken im Umlauf (Strand: ${beach.length}, Meer: ${water.length})`);
    const drifted = masks.filter((x) => x.drifted).length;
    console.log(`  · ${masks.length} Masken · ${drifted} driftend · Datum ${gameDate}`);

    // ── Fluss A: Strand-Maske, zu Fuß ──
    const target = beach[0];
    console.log(`  · Ziel A (Strand): ${target.maskName} auf ${target.islandId} @ ${Math.round(target.x)},${Math.round(target.z)}`);
    await page.evaluate(({ x, z }) => {
      const g = window.__game;
      const y = g.groundAt(x + 1.5, z);
      g.save.mode = "onfoot";
      g.player.place(x + 1.5, y, z, 0);
      g.player.group.visible = true;
      g.ship.moored = true;
    }, target);
    await page.waitForTimeout(1000);

    const promptA = await page.evaluate(() => window.__game.currentPrompt?.text ?? null);
    ok(!!promptA && promptA.includes("Maske:"), `A: Prompt zeigt Maske (ist: „${promptA}“)`);
    await page.screenshot({ path: path.join(OUT, "variant-prompt.png") });

    await page.keyboard.press("e");
    await page.waitForTimeout(700);
    const overlayA = await page.evaluate((name) => document.body.textContent?.includes(name), target.maskName);
    ok(overlayA, "A: Overlay nennt den Masken-Namen");
    const metA = await page.evaluate((id) => window.__game.save.variantsMet.includes(id), target.variantId);
    ok(metA, "A: Maske als „gefunden“ im Spielstand vermerkt");

    await page.keyboard.press("e");
    await page.waitForTimeout(600);
    const revealA = await page.evaluate(() => document.body.textContent ?? "");
    ok(revealA.includes("in einer anderen Maske"), "A: Kern-Enthüllung sichtbar („… in einer anderen Maske“)");
    await page.screenshot({ path: path.join(OUT, "variant-begreifen.png") });

    await page.click("text=Ins Register aufnehmen");
    await page.waitForTimeout(800);
    const afterA = await page.evaluate((id) => {
      const g = window.__game;
      return {
        understood: g.save.variantsUnderstood.includes(id),
        gone: !g.todaysMasks.some((x) => x.variantId === id),
        xp: g.save.player.xp,
        overlayGone: !(document.body.textContent ?? "").includes("Ins Register aufnehmen"),
      };
    }, target.variantId);
    ok(afterA.understood, "A: Maske als „begriffen“ im Register");
    ok(afterA.gone, "A: Maske aus dem Tagesumlauf verschwunden");
    ok(afterA.xp >= 4, `A: Einsicht vergeben (xp: ${afterA.xp})`);
    ok(afterA.overlayGone, "A: Overlay geschlossen");

    const persisted = await page.evaluate((id) => {
      const raw = localStorage.getItem("phaenomenautik3-save-v1");
      if (!raw) return false;
      const s = JSON.parse(raw);
      return Array.isArray(s.variantsUnderstood) && s.variantsUnderstood.includes(id);
    }, target.variantId);
    ok(persisted, "A: Fortschritt persistiert (localStorage)");

    // ── Fluss B: Meer-Maske, vom Schiff ──
    const targetB = water[0];
    console.log(`  · Ziel B (Meer): ${targetB.maskName} @ ${Math.round(targetB.x)},${Math.round(targetB.z)}`);
    await page.evaluate(({ x, z }) => {
      const g = window.__game;
      g.save.mode = "sailing";
      g.ship.x = x + 8;
      g.ship.z = z + 8;
      g.ship.speed = 0;
      g.player.group.visible = false;
    }, targetB);
    await page.waitForTimeout(3000); // Nähe-Sync (2 s) + Prompt-Takt
    const promptB = await page.evaluate(() => window.__game.currentPrompt?.text ?? null);
    ok(!!promptB && promptB.includes("Maske"), `B: Schiffs-Prompt zeigt treibende Maske (ist: „${promptB}“)`);
    await page.screenshot({ path: path.join(OUT, "variant-ship.png") });

    await page.keyboard.press("e");
    await page.waitForTimeout(700);
    const overlayB = await page.evaluate((name) => document.body.textContent?.includes(name), targetB.maskName);
    ok(overlayB, "B: Begegnung vom Schiff aus geöffnet");
    await page.keyboard.press("e");
    await page.waitForTimeout(600);
    await page.click("text=Ins Register aufnehmen");
    await page.waitForTimeout(800);
    const afterB = await page.evaluate((id) => window.__game.save.variantsUnderstood.includes(id), targetB.variantId);
    ok(afterB, "B: Meer-Maske begriffen und registriert");

    // ── Journal ──
    await page.keyboard.press("j");
    await page.waitForTimeout(500);
    await page.click("text=📓 Register");
    await page.waitForTimeout(500);
    const journal = await page.evaluate(() => document.body.textContent ?? "");
    ok(journal.includes("Atlas-Register"), "Journal zeigt das Atlas-Register");
    ok(journal.includes(target.maskName), "Begriffene Strand-Maske im Register");
    ok(journal.includes(targetB.maskName), "Begriffene Meer-Maske im Register");
    ok(journal.includes("in einer anderen Maske"), "Begreifen-Zeile im Register-Eintrag");
    await page.screenshot({ path: path.join(OUT, "variant-register.png") });
    await page.keyboard.press("Escape");

    ok(errors.length === 0, `0 Konsolenfehler (ist: ${errors.length})`, errors.join(" | "));
  } finally {
    await browser.close();
    srv?.close();
  }

  console.log(`\n${pass}/${pass + fail} Checks bestanden`);
  process.exit(fail ? 1 : 0);
})();
