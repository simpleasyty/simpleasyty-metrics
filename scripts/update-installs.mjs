// scripts/update-installs.mjs
import fs from "node:fs/promises";

const APP_KEY = process.env.APP_KEY; // ej. "com.simpleasyty.simple-table"
if (!APP_KEY) {
  console.error("Missing APP_KEY env");
  process.exit(1);
}

// Endpoint público con resumen de distribución
const url = `https://marketplace.atlassian.com/rest/2/addons/${encodeURIComponent(APP_KEY)}/distribution`;

const res = await fetch(url, { headers: { Accept: "application/json" } });
if (!res.ok) {
  console.error(`Fetch failed ${res.status}: ${await res.text()}`);
  process.exit(1);
}
const stats = await res.json();

// Fallbacks por si cambia el shape
const installs =
  stats.totalInstalls ??
  stats.activeInstalls ??
  stats?.statistics?.activeInstalls ??
  stats?.statistics?.totalInstalls ??
  null;

if (typeof installs !== "number") {
  console.error("Could not find installs in response:", Object.keys(stats));
  process.exit(1);
}

const payload = {
  installs,
  updated_at: new Date().toISOString(),
  source: "atlassian-marketplace",
};

// Escribe en la RAÍZ del repo (Pages sirve desde root)
await fs.writeFile("installs.json", JSON.stringify(payload, null, 2) + "\n", "utf8");
console.log("Wrote installs.json:", payload);
