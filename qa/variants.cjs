// PHÄNOMENAUTIK — M4.2 Varianten-QA: Masken-Daten + Rotation + Drift
// Läuft ohne Browser: bündelt variants.ts mit esbuild und prüft.
// Aufruf: node qa/variants.cjs (aus dem Repo-Root)

const esbuild = require("esbuild");
const path = require("path");
const fs = require("fs");

const root = path.join(__dirname, "..");
const out = path.join(__dirname, ".variants-out.cjs");

esbuild.buildSync({
  entryPoints: [path.join(root, "src/game/variants.ts")],
  bundle: true,
  format: "cjs",
  platform: "node",
  outfile: out,
  logLevel: "silent",
});

const v = require(out);
fs.unlinkSync(out);

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

const CORE_NODES = ["herzrasen", "hypervigilanz", "dissoziation", "erstarrung"];
const CORE_KEYWORD = { herzrasen: "Herzrasen", hypervigilanz: "Hypervigilanz", dissoziation: "Dissoziation", erstarrung: "Erstarrung" };

console.log("— Masken-Daten (redaktioneller Qualitätsmaßstab) —");
ok(v.VARIANTS.length === 12, `12 Masken als Qualitätsmaßstab (ist: ${v.VARIANTS.length})`);
ok(new Set(v.VARIANTS.map((x) => x.id)).size === 12, "Keine doppelten Masken-Ids");
for (const nodeId of CORE_NODES) {
  const masks = v.variantsOf(nodeId);
  ok(masks.length === 3, `${nodeId}: 3 Masken (ist: ${masks.length})`);
}
const badText = v.VARIANTS.filter(
  (x) =>
    !x.maskName || !x.epithet ||
    !(x.hue >= 0 && x.hue < 360) ||
    !(x.sizeScale >= 0.7 && x.sizeScale <= 1.5) ||
    !x.line || !x.begreifen
);
ok(badText.length === 0, "Jede Maske: Name, Beiname, hue 0–360, sizeScale 0.7–1.5, wahre Zeile, Begreifen-Zeile", badText.map((x) => x.id).join(", "));
const badCore = v.VARIANTS.filter(
  (x) => !x.begreifen.includes(CORE_KEYWORD[x.nodeId] ?? "%%") || !x.begreifen.includes("in einer anderen Maske")
);
ok(badCore.length === 0, "Jede Begreifen-Zeile nennt den Kern „… in einer anderen Maske“", badCore.map((x) => x.id).join(", "));
const asciiQuotes = v.VARIANTS.filter((x) => /"|"|'/.test(x.line + x.begreifen + x.maskName));
ok(asciiQuotes.length === 0, "Keine ASCII-Anführungszeichen in Masken-Texten");

console.log("— Tages-Rotation (deterministisch, kein FOMO) —");
const fresh = { understood: [], met: [], traveled: [] };
const empty = { variantsUnderstood: [], variantsMet: [] };
const dA = "2026-10-11";
const s1 = v.todaysVariants(dA, fresh, empty);
const s1b = v.todaysVariants(dA, fresh, empty);
ok(JSON.stringify(s1.map((s) => [s.variant.id, s.islandId, Math.round(s.x), Math.round(s.z)])) ===
   JSON.stringify(s1b.map((s) => [s.variant.id, s.islandId, Math.round(s.x), Math.round(s.z)])),
   "Gleiches Datum → gleiche Spawns (deterministisch)");
ok(s1.length >= 7 && s1.length <= 12, `7–12 Masken pro Tag (ist: ${s1.length})`);
ok(s1.every((s) => s.y > 0.5 && s.y < 6), "Alle Spawns auf dem Strand (über Wasserlinie, unter Plateau)");
ok(s1.every((s) => CORE_NODES.includes(s.variant.nodeId)), "Jede Maske gehört zu einem der 4 Kern-Knoten");

let varied = false;
for (let i = 1; i <= 10; i++) {
  const d = `2026-10-${String(i).padStart(2, "0")}`;
  const si = v.todaysVariants(d, fresh, empty);
  if (JSON.stringify(si.map((s) => s.variant.id).sort()) !== JSON.stringify(s1.map((s) => s.variant.id).sort())) varied = true;
}
ok(varied, "Rotation verändert sich über 10 Tage");

// Kein FOMO: über 30 Tage ist jede Maske regelmäßig da, nichts verfällt
const days30 = [];
for (let i = 0; i < 30; i++) days30.push(`2026-01-${String(i + 1).padStart(2, "0")}`);
const presence = new Map(v.VARIANTS.map((x) => [x.id, 0]));
const homeDays = new Map(v.VARIANTS.map((x) => [x.id, 0]));
for (const d of days30) {
  for (const s of v.todaysVariants(d, fresh, empty)) {
    presence.set(s.variant.id, presence.get(s.variant.id) + 1);
    if (!s.drifted) homeDays.set(s.variant.id, homeDays.get(s.variant.id) + 1);
  }
}
const minPresence = Math.min(...presence.values());
ok(minPresence >= 15, `Kein FOMO: jede Maske ≥ 15 von 30 Tagen anwesend (Minimum: ${minPresence})`);
ok(Math.min(...homeDays.values()) >= 5, "Jede Maske regelmäßig zu Hause (Spawns nie dauerhaft exotisch)");

console.log("— Drift entlang der Kanten —");
let driftSeen = 0;
const badHost = [];
for (const d of days30) {
  for (const s of v.todaysVariants(d, fresh, empty)) {
    if (s.drifted) {
      driftSeen++;
      const nbs = [...(v.neighborIndex?.get(s.variant.nodeId) ?? [])];
      if (s.hostNodeId !== s.variant.nodeId && !nbs.includes(s.hostNodeId)) badHost.push(`${s.variant.id}@${d}`);
    }
    if (!v.NODE_BY_ID.get(s.hostNodeId)?.legacy) badHost.push(`${s.variant.id}@${d}:nicht-legacy`);
  }
}
ok(driftSeen > 0, `Drift geschieht (beobachtet: ${driftSeen} Fälle in 30 Tagen)`);
ok(badHost.length === 0, "Drift-Ziele sind gültige Legacy-Nachbarn", badHost.join(", "));

console.log("— Register (Pokédex) —");
const st1 = v.variantState(v.VARIANTS[0], fresh, empty);
ok(st1 === "unerkannt", "Frische Maske: unerkannt");
const st2 = v.variantState(v.VARIANTS[0], fresh, { variantsUnderstood: [], variantsMet: [v.VARIANTS[0].id] });
ok(st2 === "gefunden", "Begegnete Maske: gefunden");
const st3 = v.variantState(v.VARIANTS[0], fresh, { variantsUnderstood: [v.VARIANTS[0].id], variantsMet: [] });
ok(st3 === "begriffen", "Begreifen: begriffen");
const st4 = v.variantState(v.VARIANTS[0], { ...fresh, understood: [v.VARIANTS[0].nodeId] }, empty);
ok(st4 === "begriffen", "Kern begriffen → alle seine Masken automatisch begriffen (Erkenntnis-Regel)");
const auto = v.autoUnderstoodByNode("herzrasen", empty);
ok(auto.length === 3, "autoUnderstoodByNode liefert alle Masken des Knotens");
const stats = v.variantClusterStats(fresh, empty);
ok(stats.reduce((a, s) => a + s.total, 0) === 12, `Cluster-Statistik deckt alle Masken ab (${stats.map((s) => `${s.clusterId}:${s.total}`).join(", ")})`);
ok(stats.every((s) => s.understood === 0 && s.met === 0), "Frischer Stand: keine begriffenen/gefundenen Masken");
const statsAfter = v.variantClusterStats({ ...fresh, understood: ["herzrasen"] }, { variantsUnderstood: ["kolibri"], variantsMet: [] });
ok(statsAfter.find((s) => s.clusterId === "alarm")?.understood === 3, "Nach Kern-Begreifen: 3 Masken begriffen (alarm)");

// Begriffene Masken tauchen nicht wieder auf; begriffene Knoten ebenso nicht
const afterOne = { variantsUnderstood: [v.VARIANTS[0].id], variantsMet: [] };
ok(!v.todaysVariants(dA, fresh, afterOne).some((s) => s.variant.id === v.VARIANTS[0].id), "Begriffene Maske erscheint nicht wieder");
ok(!v.todaysVariants(dA, { ...fresh, understood: ["herzrasen"] }, empty).some((s) => s.variant.nodeId === "herzrasen"),
   "Masken begriffener Knoten erscheinen nicht wieder");

console.log(`\n${pass}/${pass + fail} Checks bestanden`);
process.exit(fail ? 1 : 0);
