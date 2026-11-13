// Shared helpers: config, data files, a JSON-RPC client for Optimism with batching and retries.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const DATA = path.join(ROOT, "data");
export const DOCS = path.join(ROOT, "docs");
export const config = JSON.parse(fs.readFileSync(path.join(ROOT, "config.json"), "utf8"));

export const today = () => new Date().toISOString().slice(0, 10);
export const nowIso = () => new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

export function readJson(file, fallback) {
  const p = path.join(DATA, file);
  if (!fs.existsSync(p)) return fallback;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}
export function writeJson(file, value) {
  const p = path.join(DATA, file);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(value, null, 1) + "\n");
}
export const listJson = (dir) => {
  const p = path.join(DATA, dir);
  return fs.existsSync(p) ? fs.readdirSync(p).filter((f) => f.endsWith(".json")).sort() : [];
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Public Optimism RPCs, by what they are good for (config.rpcs): "logs" endpoints take 10k-block
// eth_getLogs ranges, "calls" endpoints take batches of 10 eth_call. OPTIMISM_RPC in the env
// replaces both pools with one endpoint of your own. On a rate limit the next endpoint in the
// pool is tried.
const pools = process.env.OPTIMISM_RPC ? { logs: [process.env.OPTIMISM_RPC], calls: [process.env.OPTIMISM_RPC] } : config.rpcs;
const cursor = { logs: 0, calls: 0 };
const endpoint = (kind) => pools[kind][cursor[kind] % pools[kind].length];
const rotate = (kind) => { cursor[kind]++; console.error(`  rpc: switching to ${endpoint(kind)}`); };

// One or many JSON-RPC calls. `calls` is [{method, params}]; returns results in order. Retries
// on network errors and on the free RPC's rate limiting (moving to the next endpoint); throws
// on a real error.
export async function rpc(calls, kind = "calls") {
  const many = Array.isArray(calls);
  const body = (many ? calls : [calls]).map((c, i) => ({ jsonrpc: "2.0", id: i + 1, method: c.method, params: c.params ?? [] }));
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const r = await fetch(endpoint(kind), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(many ? body : body[0]), signal: AbortSignal.timeout(30000) });
      if (r.status === 429 || r.status >= 500) throw new Error(`rpc ${r.status}`);
      const j = await r.json();
      // a batch can come back as one error object (rate limit, batch too large): retry it
      if (many && !Array.isArray(j)) {
        const msg = j?.error?.message || JSON.stringify(j).slice(0, 200);
        throw Object.assign(new Error(`batch answered with ${msg}`), { fatal: /batches over/i.test(msg) });
      }
      const arr = (many ? j : [j]).slice().sort((a, b) => a.id - b.id);
      const bad = arr.find((x) => x.error);
      if (bad) {
        if (/rate|limit|too many|per second|capacity|exceeded/i.test(bad.error.message) && !/10,000|range|batches over/i.test(bad.error.message)) throw new Error(bad.error.message);
        throw Object.assign(new Error(bad.error.message), { fatal: true });
      }
      const out = arr.map((x) => x.result);
      return many ? out : out[0];
    } catch (e) {
      if (e.fatal || attempt === 5) throw e;
      rotate(kind);
      await sleep(1000 * (attempt + 1));
    }
  }
}

// The public RPC caps requests a second; a short pause between batches keeps a run under it.
export const pace = (ms = Number(process.env.RPC_PACE_MS) || 350) => sleep(ms);

export const hexToBig = (h) => (h && h !== "0x" ? BigInt(h) : 0n);
export const hexToNum = (h) => Number(hexToBig(h));
export const toHex = (n) => "0x" + BigInt(n).toString(16);
export const pad32 = (hexNoPrefix) => hexNoPrefix.replace(/^0x/, "").toLowerCase().padStart(64, "0");
export const topicToAddress = (t) => "0x" + t.slice(26).toLowerCase();

// Whole-number Respect from an 18-decimal balance (OG) or a plain integer (ZOR).
export const fromWei = (big, decimals) => Number(big / 10n ** BigInt(decimals)) + Number(big % 10n ** BigInt(decimals)) / 10 ** decimals;

export const fmt = (n) => (n == null ? "" : Math.round(n).toLocaleString("en-US"));
export const pct = (a, b) => (b ? `${(100 * a / b).toFixed(1)}%` : "");
export const short = (a) => `${a.slice(0, 6)}...${a.slice(-4)}`;
