const { chromium } = require("playwright");
const { serveDist } = require("./serve.cjs");
(async () => {
  const srv = await serveDist(3310);
  const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 810 } });
  await page.goto("http://127.0.0.1:3310/", { waitUntil: "load" });
  await page.waitForTimeout(800);
  const gl = await page.evaluate(() => {
    const c = document.createElement("canvas");
    const g = c.getContext("webgl2");
    return g ? g.getParameter(g.getExtension("WEBGL_debug_renderer_info")?.UNMASKED_RENDERER_WEBGL ?? g.RENDERER) : "kein WebGL";
  });
  console.log("Renderer:", gl);
  await page.click("text=Neue Reise");
  await page.waitForTimeout(300);
  for (let i = 0; i < 14; i++) { await page.mouse.click(720, 300); await page.waitForTimeout(80); }
  for (let i = 0; i < 40; i++) { if (await page.evaluate(() => !!window.__game)) break; await page.waitForTimeout(500); }
  await page.waitForTimeout(5000);
  const fps = await page.evaluate(() => new Promise((res) => {
    let n = 0; const t0 = performance.now();
    const loop = () => { n++; if (performance.now() - t0 < 3000) requestAnimationFrame(loop); else res(Math.round(n / 3)); };
    requestAnimationFrame(loop);
  }));
  console.log("FPS (Metal):", fps);
  await browser.close();
  srv.close();
  process.exit(0);
})();
