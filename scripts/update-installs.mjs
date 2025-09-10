// scripts/update-installs.mjs
import fs from 'node:fs/promises';

const APP_KEY = process.env.APP_KEY; // tu app key de Marketplace
if (!APP_KEY) { console.error("Missing APP_KEY"); process.exit(1); }

const url = `https://marketplace.atlassian.com/rest/2/addons/${encodeURIComponent(APP_KEY)}/stats`;
const res = await fetch(url, { headers: { Accept: "application/json" } });
if (!res.ok) { console.error("Fetch failed", res.status); process.exit(1); }
const stats = await res.json();

const installs = stats.activeInstalls ?? stats.totalInstalls ?? stats?.statistics?.activeInstalls;
if (typeof installs !== "number") { console.error("No installs field"); process.exit(1); }

const payload = { installs, updated_at: new Date().toISOString(), source: "atlassian-marketplace" };
await fs.writeFile("installs.json", JSON.stringify(payload, null, 2) + "\n");
console.log("Wrote installs.json", payload);
