const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  page.on("pageerror", (e) => console.log("PAGEERROR", String(e).slice(0, 300)));
  await page.goto("http://localhost:3100/", { waitUntil: "load" });
  await page.waitForTimeout(800);
  await page.click("text=Neue Reise");
  await page.waitForTimeout(300);
  for (let i = 0; i < 14; i++) { await page.mouse.click(400, 300); await page.waitForTimeout(100); }
  await page.waitForSelector("canvas", { timeout: 30000 });
  await page.waitForTimeout(7000);
  const info = await page.evaluate(() => {
    const g = window.__game;
    const out = { slots: [], axe: null, rigChildren: [] };
    g.player.group.traverse((o) => {
      if (o.name && (o.name.includes("hand") || o.name.includes("slot"))) {
        out.slots.push({ name: o.name, children: o.children.length, type: o.type });
      }
      if (o.name && o.name.toLowerCase().includes("axe")) {
        const p = o.getWorldPosition(new (Object.getPrototypeOf(o.position).constructor)());
        out.axe = { name: o.name, visible: o.visible, worldPos: [p.x.toFixed(1), p.y.toFixed(1), p.z.toFixed(1)], scale: o.scale.x };
      }
    });
    out.rigChildren = g.player.group.children[0].children.map((c) => `${c.name}:${c.type}:${c.visible}`);
    return out;
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
