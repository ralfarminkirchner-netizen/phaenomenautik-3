// PHÄNOMENAUTIK — M4.2 QA: Masken-Begegnung End-to-End (Live)
// Teleport zu einer Maske des Tages, Prompt, Begreifen, Register,
// Persistenz, Journal-Register. Aufruf gegen Produktion:
//   NODE_PATH=../traumaatlas-3/node_modules QA_URL=https://phaenomenautik-3-production.up.railway.app node qa/variants-live.cjs
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

    // 1) Masken des Tages aktiv?
    const variants = await page.evaluate(() => window.__game.variantList);
    const gameDate = await page.evaluate(() => window.__game.currentGameDate);
    ok(variants.length >= 5 && variants.length <= 12, `5–12 Masken aktiv (ist: ${variants.length})`, JSON.stringify(variants));
    ok(/^\d{4}-\d{2}-\d{2}$/.test(gameDate), `Tages-Rotation läuft (Datum: ${gameDate})`);
    ok(variants.every((x) => typeof x.drifted === "boolean"), "Drift-Flag je Maske vorhanden");
    const drifted = variants.filter((x) => x.drifted).length;
    console.log(`  · ${variants.length} Masken, davon ${drifted} driftend · Datum ${gameDate}`);
    const target = variants[0];
    console.log(`  · Ziel: ${target.maskName} (${target.variantId}) auf ${target.islandId} @ ${Math.round(target.x)},${Math.round(target.z)}`);

    // 2) Teleport zur Maske (zu Fuß)
    await page.evaluate(({ x, z }) => {
      const g = window.__game;
      const y = g.groundAt(x + 1.5, z);
      g.save.mode = "onfoot";
      g.player.place(x + 1.5, y, z, 0);
      g.player.group.visible = true;
      g.ship.moored = true;
    }, target);
    await page.waitForTimeout(800);

    // 3) Prompt zeigt die Maske
    const prompt = await page.evaluate(() => window.__game.currentPrompt?.text ?? null);
    ok(!!prompt && prompt.includes("Maske:"), `Prompt zeigt Maske (ist: „${prompt}“)`);
    await page.screenshot({ path: path.join(OUT, "variant-prompt.png") });

    // 4) Begegnen (E) — Overlay mit wahrer Zeile
    await page.keyboard.press("e");
    await page.waitForTimeout(700);
    const overlay1 = await page.evaluate(() => document.body.textContent ?? "");
    ok(overlay1.includes(target.maskName), "Overlay nennt den Masken-Namen");
    ok(overlay1.includes("Begreifen"), "Begreifen-Schritt sichtbar");
    const metState = await page.evaluate((id) => window.__game.save.variantsMet.includes(id), target.variantId);
    ok(metState, "Maske als „gefunden“ im Spielstand vermerkt");

    // 5) Begreifen (E) — Kern fällt, Register-Button
    await page.keyboard.press("e");
    await page.waitForTimeout(600);
    const overlay2 = await page.evaluate(() => document.body.textContent ?? "");
    ok(overlay2.includes("in einer anderen Maske"), "Kern-Enthüllung sichtbar („… in einer anderen Maske“)");
    await page.screenshot({ path: path.join(OUT, "variant-begreifen.png") });

    // 6) Ins Register aufnehmen
    await page.click("text=Ins Register aufnehmen");
    await page.waitForTimeout(700);
    const after = await page.evaluate((id) => {
      const g = window.__game;
      return {
        understood: g.save.variantsUnderstood.includes(id),
        gone: !g.variantList.some((x) => x.variantId === id),
        xp: g.save.player.xp,
        overlayGone: !(document.body.textContent ?? "").includes("Ins Register aufnehmen"),
      };
    }, target.variantId);
    ok(after.understood, "Maske als „begriffen“ im Register (save.variantsUnderstood)");
    ok(after.gone, "Maske hat sich aus der Welt aufgelöst");
    ok(after.xp >= 4, `Einsicht vergeben (xp: ${after.xp})`);
    ok(after.overlayGone, "Overlay geschlossen");

    // 7) Persistenz
    const persisted = await page.evaluate((id) => {
      const raw = localStorage.getItem("phaenomenautik3-save-v1");
      if (!raw) return false;
      const s = JSON.parse(raw);
      return Array.isArray(s.variantsUnderstood) && s.variantsUnderstood.includes(id);
    }, target.variantId);
    ok(persisted, "Fortschritt persistiert (localStorage, variantsUnderstood)");

    // 8) Journal: Atlas-Register zeigt die begriffene Maske
    await page.keyboard.press("j");
    await page.waitForTimeout(500);
    await page.click("text=📓 Register");
    await page.waitForTimeout(500);
    const journal = await page.evaluate(() => document.body.textContent ?? "");
    ok(journal.includes("Atlas-Register"), "Journal zeigt das Atlas-Register");
    ok(journal.includes(target.maskName), "Begriffene Maske mit Name im Register");
    ok(journal.includes("in einer anderen Maske"), "Begreifen-Zeile im Register-Eintrag");
    ok(journal.includes("begriffen"), "Status „begriffen“ im Register");
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
