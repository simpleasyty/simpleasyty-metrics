// scripts/update-installs.mjs
import fs from "node:fs/promises";

const APP_KEY = process.env.APP_KEY;
if (!APP_KEY) { console.error("Missing APP_KEY"); process.exit(1); }

const url = `https://marketplace.atlassian.com/rest/2/addons/${encodeURIComponent(APP_KEY)}/distribution`;
const res = await fetch(url, { headers: { Accept: "application/json" } });
if (!res.ok) { console.error(`Fetch failed ${res.status}`); process.exit(1); }
const stats = await res.json();

const installs = stats.totalInstalls ?? stats.activeInstalls ?? stats?.statistics?.activeInstalls ?? null;
if (typeof installs !== "number") { console.error("No installs field"); process.exit(1); }

// Lee el anterior para comparar
let prevInstalls = null;
try {
  const prev = JSON.parse(await fs.readFile("installs.json", "utf8"));
  prevInstalls = prev.installs;
} catch {}

if (prevInstalls === installs) {
  console.log("No change in installs, skipping write.");
  process.exit(0); // no hay cambios → el paso de commit no hará nada
}

const payload = {
  installs,
  updated_at: new Date().toISOString(),
  source: "atlassian-marketplace"
};
await fs.writeFile("installs.json", JSON.stringify(payload, null, 2) + "\n", "utf8");
console.log("Wrote installs.json", payload);
