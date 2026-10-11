// Exercise the actual production entry point, including a request that used
// to terminate the process. Run after npm run build.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import fs from "node:fs/promises";
import http from "node:http";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
let server;
let port;
let cwd;
let output = "";

function request(url) {
  return new Promise((resolve, reject) => {
    const req = http.get({ hostname: "127.0.0.1", port, path: url }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("error", reject);
      res.on("end", () => resolve({
        status: res.statusCode,
        headers: res.headers,
        body: Buffer.concat(chunks),
      }));
    });
    req.on("error", reject);
    req.setTimeout(5000, () => req.destroy(new Error("HTTP request timed out")));
  });
}

before(async () => {
  await fs.access(path.join(root, "dist/index.html"));
  const socket = net.createServer();
  socket.listen(0, "127.0.0.1");
  await once(socket, "listening");
  port = socket.address().port;
  await new Promise((resolve, reject) => socket.close((err) => err ? reject(err) : resolve()));

  // A different working directory verifies that server.mjs finds its own dist/.
  cwd = await fs.mkdtemp(path.join(os.tmpdir(), "phaenomenautik-server-"));
  server = spawn(process.execPath, [path.join(root, "server.mjs")], {
    cwd,
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stderr.on("data", (chunk) => { output += chunk; });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Server did not start: ${output}`)), 10000);
    const cleanup = () => { clearTimeout(timeout); server.off("exit", onExit); server.off("error", onError); };
    const onExit = (code) => { cleanup(); reject(new Error(`Server exited (${code}): ${output}`)); };
    const onError = (err) => { cleanup(); reject(err); };
    server.once("exit", onExit);
    server.once("error", onError);
    server.stdout.on("data", (chunk) => {
      output += chunk;
      if (output.includes(`serving dist/ on :${port}`)) { cleanup(); resolve(); }
    });
  });
});

after(async () => {
  if (server && server.exitCode === null && server.signalCode === null) {
    const exited = once(server, "exit");
    server.kill();
    await exited;
  }
  if (cwd) await fs.rm(cwd, { recursive: true, force: true });
});

test("PORT serves the built entry point and SPA fallback", async () => {
  const index = await fs.readFile(path.join(root, "dist/index.html"));
  for (const url of ["/", "/journal?tab=atlas"]) {
    const res = await request(url);
    assert.equal(res.status, 200);
    assert.match(res.headers["content-type"], /^text\/html/);
    assert.equal(res.headers["cache-control"], "no-cache");
    assert.deepEqual(res.body, index);
  }
});

test("JavaScript, CSS and visual assets keep their bytes and MIME types", async () => {
  const html = await fs.readFile(path.join(root, "dist/index.html"), "utf8");
  const js = html.match(/src="\.\/([^" ]+\.js)"/)[1];
  const css = html.match(/href="\.\/([^" ]+\.css)"/)[1];
  const assets = [
    [js, "text/javascript"],
    [css, "text/css"],
    ["assets/models/pirate/ship_b.glb", "model/gltf-binary"],
    ["assets/models/nature/tree_single_A.gltf", "model/gltf+json"],
    ["assets/models/nature/tree_single_A.bin", "application/octet-stream"],
    ["assets/models/char/barbarian_texture.png", "image/png"],
    ["assets/models/char/Barbarian 2.glb", "model/gltf-binary"],
  ];
  for (const [asset, mime] of assets) {
    const res = await request(`/${encodeURI(asset)}?qa=1`);
    assert.equal(res.status, 200, asset);
    assert.ok(res.headers["content-type"].startsWith(mime), asset);
    assert.deepEqual(res.body, await fs.readFile(path.join(root, "dist", asset)), asset);
  }
});

test("malformed percent escapes return 400 and leave the service running", async () => {
  for (const url of ["/%", "/%ZZ", "/%E0%A4%A"]) {
    const res = await request(url);
    assert.equal(res.status, 400, url);
    assert.equal(res.body.toString(), "bad request");
    assert.equal((await request("/")).status, 200);
    assert.equal(server.exitCode, null, output);
  }
});
