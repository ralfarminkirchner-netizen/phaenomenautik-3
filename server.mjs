// PHÄNOMENAUTIK 3 — Produktions-Server (zero-dependency, node builtins)
// Dient dist/ statisch aus, SPA-Fallback auf index.html, Port aus env.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "dist");
const port = Number(process.env.PORT || 3000);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
  ".bin": "application/octet-stream",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

http
  .createServer((req, res) => {
    let p;
    try {
      p = decodeURIComponent((req.url || "/").split("?")[0]);
    } catch {
      // A malformed request must not stop the production server.
      res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("bad request");
    }
    if (p === "/") p = "/index.html";
    let file = path.normalize(path.join(root, p));
    if (!file.startsWith(root)) {
      res.writeHead(403);
      return res.end();
    }
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      file = path.join(root, "index.html"); // SPA-Fallback
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404);
        return res.end("not found");
      }
      res.writeHead(200, {
        "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream",
        "Cache-Control": file.includes("/assets/") ? "public, max-age=31536000, immutable" : "no-cache",
      });
      res.end(data);
    });
  })
  .listen(port, "0.0.0.0", () => {
    console.log(`phaenomenautik-3 serving dist/ on :${port}`);
  });
