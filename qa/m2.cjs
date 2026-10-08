// PHÄNOMENAUTIK 3 — M2-Gate: Chat-Bau, Floß bauen & paddeln, Loot, Truhe.
const path = require("path");
const { chromium } = require("playwright");
const { serveDist } = require("./serve.cjs");
const OUT = path.join(__dirname, "shots");
const R = { consoleErrors: [] };

(async () => {
  const PORT = process.env.QA_URL ? 3410 : 3310;
  const srv = process.env.QA_URL ? null : await serveDist(PORT);
  const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 810 } });
  page.on("console", (m) => { if (m.type() === "error") R.consoleErrors.push(m.text().slice(0, 200)); });
  page.on("pageerror", (e) => R.consoleErrors.push(String(e).slice(0, 200)));
  const shot = (n) => page.screenshot({ path: path.join(OUT, n) });

  try {
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "load" });
    await page.waitForTimeout(900);
    await page.click("text=Neue Reise");
    await page.waitForTimeout(400);
    for (let i = 0; i < 14; i++) { await page.mouse.click(720, 300); await page.waitForTimeout(90); }
    for (let i = 0; i < 60; i++) {
      if (await page.evaluate(() => !!window.__game)) break;
      await page.waitForTimeout(500);
    }
    await page.waitForTimeout(7000);

    // An Land, Material geben, Chat öffnen
    await page.evaluate(() => {
      const g = window.__game;
      g.save.mode = "onfoot";
      g.ship.moored = true;
      const d = g.props.dock;
      const y = g.groundAt(d.x, d.z - 4);
      g.player.place(d.x, y, d.z - 4, Math.PI);
      g.player.group.visible = true;
      g.save.materials = { stamm: 5, seil: 3, bohle: 4, eimer: 1 };
    });
    await page.waitForTimeout(700);

    // Loot in der Nähe sichtbar?
    R.lootNear = await page.evaluate(() => {
      const g = window.__game;
      const p = g.player.pos;
      const it = g.loot.nearest(p.x, p.z, 60);
      return it ? { mat: it.matId, dist: Math.round(Math.hypot(it.x - p.x, it.z - p.z)) } : null;
    });

    // ── Chat-Bau: floß ──
    await page.keyboard.press("t");
    await page.waitForTimeout(800);
    await shot("m2-01-chat-open.png");
    await page.evaluate(() => {
      const inp = document.querySelector("input");
      inp?.focus();
    });
    await page.keyboard.type("baue floß", { delay: 10 });
    await page.keyboard.press("Enter");
    await page.waitForTimeout(900);
    R.chatClosed = await page.evaluate(() => !window.__store.get().chatOpen);
    // Geist zum Wasser tragen: Richtung Steg/Meer laufen
    await page.evaluate(() => {
      const g = window.__game;
      const d = g.props.dock;
      // südlich Richtung Wasser schauen
      const y = g.groundAt(d.x, d.z + 8);
      g.player.place(d.x, y, d.z + 8, 0); // facing 0 = Richtung -z? Steg zeigt nach Süden (+z)
      g.player.facing = 0;
      g.player.camYaw = Math.PI;
    });
    await page.waitForTimeout(600);
    await shot("m2-02-ghost.png");
    R.ghostActive = await page.evaluate(() => window.__game.isBuilding);
    await page.keyboard.press("e");
    await page.waitForTimeout(700);
    R.built = await page.evaluate(() => window.__game.save.structures.map((s) => s.type));
    await shot("m2-03-built-raft.png");

    // ── Floß besteigen & paddeln ──
    const raftPos = await page.evaluate(() => {
      const g = window.__game;
      const r = g.save.structures.find((s) => s.type === "floss");
      if (r) {
        const y = g.groundAt(r.x, r.z);
        g.player.place(r.x, y + 0.5, r.z, 0);
      }
      return r ? { x: r.x, z: r.z } : null;
    });
    await page.waitForTimeout(500);
    await shot("m2-04-on-raft.png");
    // paddeln: W halten (Blickrichtung ist paddelrichtung camYaw+PI)
    await page.evaluate(() => { window.__game.player.camYaw = Math.PI; }); // paddelt nach Süden (offene See)
    await page.keyboard.down("w");
    await page.waitForTimeout(3500);
    await page.keyboard.up("w");
    const raftPos2 = await page.evaluate(() => {
      const r = window.__game.save.structures.find((s) => s.type === "floss");
      return r ? { x: r.x, z: r.z } : null;
    });
    await shot("m2-05-paddling.png");
    R.raftMoved = raftPos && raftPos2 ? Math.round(Math.hypot(raftPos2.x - raftPos.x, raftPos2.z - raftPos.z) * 10) / 10 : -1;

    // ── Chat: fehlendes Material → hilfreiche Antwort ──
    await page.keyboard.press("t");
    await page.waitForTimeout(600);
    await page.evaluate(() => document.querySelector("input")?.focus());
    await page.keyboard.type("baue brücke", { delay: 10 });
    await page.keyboard.press("Enter");
    await page.waitForTimeout(800);
    R.bridgeReply = await page.evaluate(() => {
      const el = document.body.textContent;
      return el.includes("Bohlenbrücke") || el.includes("fehlt") ? el.slice(el.lastIndexOf("Für") > -1 ? el.lastIndexOf("Für") : el.length - 220, el.length).slice(0, 220) : null;
    });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);

    // ── Journal: Materialien ──
    await page.keyboard.press("j");
    await page.waitForTimeout(800);
    await shot("m2-06-journal-materials.png");
    R.journalShowsMats = await page.evaluate(() => document.body.textContent.includes("Treibstamm"));
    await page.keyboard.press("Escape");

    // ── Scholle + Truhe (Teleport zur Prüfung) ──
    await page.evaluate(() => {
      const g = window.__game;
      const y = g.groundAt(2206, 3558);
      g.player.place(2208.5, y, 3559.5, Math.PI / 4);
      g.player.camYaw = Math.PI * 1.5;
    });
    await page.waitForTimeout(600);
    await shot("m2-07-scholle-chest.png");
    await page.keyboard.press("e");
    await page.waitForTimeout(600);
    R.treasure = await page.evaluate(() => ({
      crystals: window.__game.save.crystals,
      segeltuch: window.__game.save.materials.segeltuch,
      eimer: window.__game.save.materials.eimer,
    }));
    await shot("m2-08-treasure.png");

    R.fps = await page.evaluate(() => new Promise((res) => {
      let n = 0;
      const t0 = performance.now();
      const loop = () => { n++; if (performance.now() - t0 < 2500) requestAnimationFrame(loop); else res(Math.round(n / 2.5)); };
      requestAnimationFrame(loop);
    }));
  } catch (e) {
    R.fatal = String(e).slice(0, 300);
  }
  console.log(JSON.stringify(R, null, 2));
  await browser.close();
  srv?.close();
  process.exit(0);
})();
