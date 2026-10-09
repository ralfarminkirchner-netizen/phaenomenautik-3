// PHÄNOMENAUTIK — M4 Graph-QA: Datenintegrität + Nebel-of-War-Logik
// Läuft ohne Browser: bündelt die TS-Datenmodule mit esbuild und prüft.
// Aufruf: node qa/graph.cjs (aus dem Repo-Root)

const esbuild = require("esbuild");
const path = require("path");
const fs = require("fs");

const root = path.join(__dirname, "..");
const out = path.join(__dirname, ".graph-out.cjs");

esbuild.buildSync({
  entryPoints: [path.join(root, "src/game/phenomenaGraph.ts")],
  bundle: true,
  format: "cjs",
  platform: "node",
  outfile: out,
  logLevel: "silent",
});

const g = require(out);
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

console.log("— Graph-Integrität —");
ok(g.GRAPH_NODES.length >= 120, `Knotenzahl ≥ 120 (ist: ${g.GRAPH_NODES.length})`);
const ids = new Set(g.GRAPH_NODES.map((n) => n.id));
ok(ids.size === g.GRAPH_NODES.length, "Keine doppelten Knoten-Ids");

let dangling = [];
let totalEdges = 0;
for (const n of g.GRAPH_NODES) {
  for (const e of n.edges) {
    totalEdges++;
    if (!g.NODE_BY_ID.has(e.to)) dangling.push(`${n.id} -> ${e.to}`);
  }
}
ok(dangling.length === 0, "Alle Kanten haben gültige Ziele", dangling.join(", "));
console.log(`  · Kanten gesamt: ${totalEdges}`);

// Zusammenhang: BFS von sturmherd über ungerichtete Kanten
const seen = new Set(["sturmherd"]);
const queue = ["sturmherd"];
while (queue.length) {
  const cur = queue.pop();
  for (const nb of g.neighborsOf(cur)) {
    if (!seen.has(nb)) {
      seen.add(nb);
      queue.push(nb);
    }
  }
}
const orphans = g.GRAPH_NODES.filter((n) => !seen.has(n.id)).map((n) => n.id);
ok(orphans.length === 0, "Alle Knoten vom Zentrum aus erreichbar (keine Orphans)", orphans.join(", "));

// Jeder Knoten braucht die wahre Zeile + Mindesttexte
const emptyText = g.GRAPH_NODES.filter(
  (n) => !n.text.intro || n.text.verstehen.length === 0 || !n.text.frieden || !n.text.insight
).map((n) => n.id);
ok(emptyText.length === 0, "Jeder Knoten hat intro/verstehen/frieden/insight", emptyText.join(", "));

// Cluster-Abdeckung
const perCluster = {};
for (const n of g.GRAPH_NODES) perCluster[n.cluster] = (perCluster[n.cluster] ?? 0) + 1;
const clusterOk = g.CLUSTERS.every((c) => (perCluster[c.id] ?? 0) >= (c.id === "auge" ? 1 : 5));
ok(clusterOk, `Jeder Kontinent hat ≥ 5 Knoten, das Auge ist das Zentrum (${JSON.stringify(perCluster)})`);

console.log("— Nebel-of-War —");
const fresh = g.emptyGraphProgress();
const freshVisible = g.visibleNodes(fresh);
ok(
  freshVisible.length === 13 && freshVisible.every((n) => n.legacy),
  `Frisches Spiel: genau die 13 Hauptstädte sichtbar (ist: ${freshVisible.length})`
);
ok(g.fogStateOf("panik", fresh) === "verborgen", "panik ist im Nebel verborgen");
ok(g.fogStateOf("hypervigilanz", fresh) === "sichtbar", "hypervigilanz (Hauptstadt) ist sichtbar");

const afterHerz = { ...fresh, understood: ["herzrasen"] };
ok(g.fogStateOf("panik", afterHerz) === "befahrbar", "Nach Begreifen von herzrasen: panik befahrbar");
const revealed = g.revealedByUnderstanding("herzrasen", fresh);
ok(revealed.includes("panik") && revealed.includes("atemdruck"), `Neue Sichtbarkeiten via herzrasen (${revealed.join(", ")})`);

const stats = g.clusterStats(afterHerz);
const totalStat = stats.reduce((a, s) => a + s.total, 0);
ok(totalStat === g.GRAPH_NODES.length, `Cluster-Statistik deckt alle Knoten ab (${totalStat})`);
ok(g.edgeLit("herzrasen", "panik", afterHerz) === false, "Kante unbegriffener Enden dunkel");
ok(
  g.edgeLit("herzrasen", "hypervigilanz", { ...fresh, understood: ["herzrasen", "hypervigilanz"] }),
  "Kante begriffener Enden leuchtet"
);

console.log("— Migration (alter M3-Spielstand) —");
const migrated = g.graphProgressFromIslands([
  { id: "herzrasen", overcome: true, understood: true },
  { id: "scham", overcome: true, understood: false },
  { id: "gibts-nicht", overcome: true, understood: true },
]);
ok(migrated.understood.includes("herzrasen") && migrated.understood.includes("scham"), "Überwundene/verstandene Inseln wandern ins Netz");
ok(!migrated.understood.includes("gibts-nicht"), "Unbekannte Ids werden verworfen");
ok(g.fogStateOf("leere", migrated) !== "verborgen", "Nachbarn migrierter Knoten tauchen aus dem Nebel auf");

console.log("— Tages-Rotation (Varianten-Vorbereitung) —");
const d1 = g.dailySeed("2026-10-09");
const d1b = g.dailySeed("2026-10-09");
const d2 = g.dailySeed("2026-10-10");
ok(d1 === d1b && d1 !== d2, "dailySeed ist deterministisch und tagesabhängig");

console.log(`\n${pass}/${pass + fail} Checks bestanden`);
process.exit(fail ? 1 : 0);
