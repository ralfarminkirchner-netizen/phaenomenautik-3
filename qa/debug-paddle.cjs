const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu"] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on("pageerror", (e) => console.log("[pageerror]", String(e).slice(0, 300)));
  await page.goto("http://127.0.0.1:3410/", { waitUntil: "load" });
  await page.waitForTimeout(800);
  await page.click("text=Neue Reise");
  await page.waitForTimeout(300);
  for (let i = 0; i < 14; i++) { await page.mouse.click(640, 300); await page.waitForTimeout(80); }
  for (let i = 0; i < 60; i++) { if (await page.evaluate(() => !!window.__game)) break; await page.waitForTimeout(500); }
  await page.waitForTimeout(6000);
  // Floß direkt ins Wasser bauen (simuliert)
  await page.evaluate(() => {
    const g = window.__game;
    g.save.mode = "onfoot";
    g.ship.moored = true;
    const d = g.props.dock;
    const y = g.groundAt(d.x, d.z + 18);
    g.player.place(d.x, y, d.z + 18, 0);
    g.player.group.visible = true;
    g.player.camYaw = Math.PI;
    // Floß direkt setzen (ohne Bau-UI)
    const def = { id: "b_floss_test", type: "floss", x: d.x, z: d.z + 22, yaw: 0 };
    g.structures.add(def);
    g.save.structures = g.structures.toSave();
    const r = g.structures.items[0];
    g.player.place(def.x, r.deckY + 0.5, def.z, 0);
  });
  await page.waitForTimeout(800);
  const before = await page.evaluate(() => {
    const g = window.__game;
    return {
      player: [g.player.pos.x.toFixed(1), g.player.pos.y.toFixed(1), g.player.pos.z.toFixed(1)],
      raft: g.structures.raftUnder(g.player.pos.x, g.player.pos.z) ? true : false,
      depth: g.props.groundHeight(g.player.pos.x, g.player.pos.z),
    };
  });
  await page.keyboard.down("w");
  await page.waitForTimeout(3000);
  const mid = await page.evaluate(() => {
    const g = window.__game;
    return {
      player: [g.player.pos.x.toFixed(1), g.player.pos.z.toFixed(1)],
      keys: [...g.keys],
      lock: g.uiLock,
      raftPos: g.structures.items[0] ? [g.structures.items[0].def.x.toFixed(1), g.structures.items[0].def.z.toFixed(1)] : null,
    };
  });
  await page.keyboard.up("w");
  console.log(JSON.stringify({ before, mid }, null, 2));
  await browser.close();
  process.exit(0);
})();
