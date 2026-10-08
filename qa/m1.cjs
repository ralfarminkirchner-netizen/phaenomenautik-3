// PHÄNOMENAUTIK 3 — M1-Gate (robust, immer mit Ergebnis-Print)
const path = require("path");
const { chromium } = require("playwright");
const OUT = path.join(__dirname, "shots");
const R = { consoleErrors: [] };

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 810 } });
  page.on("console", (m) => { if (m.type() === "error") R.consoleErrors.push(m.text().slice(0, 200)); });
  page.on("pageerror", (e) => R.consoleErrors.push(String(e).slice(0, 200)));
  const shot = (n) => page.screenshot({ path: path.join(OUT, n) });
  const T0 = Date.now();

  // rAF-unabhängige Klick-/Eingabe-Helfer (SwiftShader-verträglich)
  const clickText = (text) => page.evaluate((t) => {
    const els = [...document.querySelectorAll("button, [role=button], span, div")];
    const el = els.find((e) => e.textContent.trim() === t || (e.firstChild && e.firstChild.textContent === t));
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }, text).then((pos) => pos && page.mouse.click(pos.x, pos.y));
  const fillInput = (text) => page.evaluate(() => {
    const inp = document.querySelector("input");
    if (!inp) return false;
    inp.focus();
    return true;
  }).then(async (ok) => {
    if (!ok) return false;
    await page.keyboard.type(text, { delay: 5 });
    return true;
  });

  try {
    await page.goto("http://localhost:3100/", { waitUntil: "load" });
    await page.waitForTimeout(900);
    await page.click("text=Neue Reise");
    await page.waitForTimeout(400);
    for (let i = 0; i < 14; i++) { await page.mouse.click(720, 300); await page.waitForTimeout(90); }
    for (let i = 0; i < 60; i++) {
      const has = await page.evaluate(() => !!document.querySelector("canvas"));
      if (has) break;
      await page.waitForTimeout(500);
    }
    await page.waitForTimeout(8000);

    // An Land (Hafen), nahe Mara
    await page.evaluate(() => {
      const g = window.__game;
      g.save.mode = "onfoot";
      g.ship.moored = true;
      const d = g.props.dock;
      const y = g.props.groundHeight(d.x + 3, d.z - 8);
      g.player.place(d.x + 3, y, d.z - 8, Math.PI / 2);
      g.player.group.visible = true;
      g.player.camYaw = Math.PI * 1.5;
    });
    await page.waitForTimeout(900);
    await shot("m1-01-npc-mara.png");

    await page.keyboard.press("e");
    for (let i = 0; i < 12; i++) {
      const has = await page.evaluate(() => !!document.querySelector("input"));
      if (has) break;
      await page.waitForTimeout(400);
    }
    await page.waitForTimeout(1400);
    await shot("m1-02-dialog-open.png");
    await fillInput("Was sind das für Inseln?");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(2400);
    await shot("m1-03-dialog-answer.png");
    await clickText("Hast du eine Aufgabe für mich?");
    await page.waitForTimeout(2400);
    await shot("m1-04-dialog-quest.png");
    await fillInput("Ich will nicht mehr leben");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(2600);
    R.crisisOk = await page.evaluate(() => document.body.textContent.includes("0800 111 0 111"));
    await shot("m1-05-dialog-crisis.png");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);

    await page.keyboard.press("j");
    await page.waitForTimeout(800);
    await shot("m1-06-journal.png");
    R.journalHasQuest = await page.evaluate(() => document.body.textContent.includes("Kartenarbeit"));
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    // Lore-Stein
    await page.evaluate(() => {
      const g = window.__game;
      const st = g.loreStones.stones.find((s) => s.line.island === "harbor" && !s.found);
      const y = g.props.groundHeight(st.x + 1.8, st.z);
      g.player.place(st.x + 1.8, y, st.z, Math.PI / 2);
      g.player.camYaw = Math.PI * 1.5;
    });
    await page.waitForTimeout(700);
    await shot("m1-07-lorestone.png");
    await page.keyboard.press("e");
    await page.waitForTimeout(800);
    await shot("m1-08-lorestone-open.png");
    R.loreRead = await page.evaluate(() => window.__game.save.echoesFound.length > 0);
    await clickText("In sich ruhen lassen");
    await page.waitForTimeout(300);

    // ── Begegnung: Flashback ──
    await page.evaluate(() => {
      const g = window.__game;
      const c = g.creatures.get("flashback");
      const cp = c.group.position;
      const y = g.props.groundHeight(cp.x, cp.z + 10);
      g.player.place(cp.x, y, cp.z + 10, Math.PI);
      g.player.camYaw = 0;
      g.player.camPitch = 0.12;
    });
    await page.waitForTimeout(1300);
    await shot("m1-09-creature.png");
    await page.keyboard.press("e");
    await page.waitForTimeout(1400);
    await shot("m1-10-battle-intro.png");
    for (let i = 0; i < 4; i++) { await page.mouse.click(720, 660); await page.waitForTimeout(1200); }
    await shot("m1-11-battle-menu.png");

    // Verstehen-Runden
    for (let round = 0; round < 12; round++) {
      const done = await page.evaluate(() => window.__game.save.islands.find((i) => i.id === "flashback")?.overcome ?? false);
      if (done) break;
      await clickText("💬 Verstehen");
      if (round === 1) { await page.waitForTimeout(1600); await shot("m1-12-battle-mid.png"); }
      await page.waitForTimeout(2400);
    }
    await page.waitForTimeout(2800);
    await shot("m1-13-battle-peace.png");
    R.battle = await page.evaluate(() => {
      const s = window.__game.save;
      const isl = s.islands.find((i) => i.id === "flashback");
      return { overcome: isl?.overcome, understood: isl?.understood, xp: s.player.xp, crystals: s.crystals };
    });
    // Sicherheitsnetz: Begegnung schließen falls offen
    await page.evaluate(() => { window.__store.set({ battlePhen: null }); });
    await page.waitForTimeout(400);

    // ── Echo: sterben, respawnen, aufsammeln ──
    await page.evaluate(() => {
      const g = window.__game;
      g.save.crystals = 6;
      const e = g.enemies.find((en) => !en.dead);
      const y = g.props.groundHeight(e.x + 1.2, e.z);
      g.player.place(e.x + 1.2, y, e.z, Math.PI / 2);
      g.save.player.stability = 5;
    });
    let died = false;
    for (let i = 0; i < 20 && !died; i++) {
      await page.waitForTimeout(600);
      died = await page.evaluate(() => window.__store.get().dead);
    }
    R.died = died;
    if (died) {
      await shot("m1-14-dead.png");
      R.echoDropped = await page.evaluate(() => window.__game.save.echoDrop);
      await clickText("Aufwachen");
      await page.waitForTimeout(1000);
      await shot("m1-15-respawn-fire.png");
      await page.evaluate(() => {
        const g = window.__game;
        const ed = g.save.echoDrop;
        if (ed) {
          const y = g.props.groundHeight(ed.x + 1, ed.z);
          g.player.place(ed.x + 1, y, ed.z, 0);
        }
      });
      await page.waitForTimeout(500);
      await shot("m1-16-echo-orb.png");
      await page.keyboard.press("e");
      await page.waitForTimeout(500);
      R.crystalsAfterPickup = await page.evaluate(() => window.__game.save.crystals);
    }

    R.fps = await page.evaluate(() => new Promise((res) => {
      let n = 0;
      const t0 = performance.now();
      const loop = () => { n++; if (performance.now() - t0 < 2500) requestAnimationFrame(loop); else res(Math.round(n / 2.5)); };
      requestAnimationFrame(loop);
    }));
  } catch (e) {
    R.fatal = String(e).slice(0, 300);
  }
  R.seconds = Math.round((Date.now() - T0) / 1000);
  console.log(JSON.stringify(R, null, 2));
  await browser.close();
})();
