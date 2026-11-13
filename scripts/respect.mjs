// Who holds ZAO Respect on Optimism, read from the two contracts.
//   OG Respect: ERC-20 (18 decimals), balanceOf(wallet), totalSupply().
//   ZOR Respect: ERC-1155, balanceOf(wallet, 0), totalRespect().
// Wallets come from Zaal's 31 Oct 2026 snapshot (data/respect-seed.json, 172 wallets at block
// 158930150) plus every address that received a transfer since (eth_getLogs, 10k blocks a call,
// incremental from data/respect-state.json). Balances are then read live for every wallet, so the
// numbers are the contracts', not a log replay. Writes data/respect/<date>.json.
import { config, rpc, pace, readJson, writeJson, hexToBig, hexToNum, toHex, pad32, topicToAddress, fromWei, today, nowIso } from "./lib.mjs";

const { og, zor } = config.respect;
const SEL = config.selectors;
const seed = readJson("respect-seed.json");
const state = readJson("respect-state.json", { lastBlock: seed.block, wallets: seed.holders.map((h) => h.wallet), contracts: seed.holders.filter((h) => h.contract).map((h) => h.wallet), transfersSinceSeed: 0 });

const latestHex = await rpc({ method: "eth_blockNumber" }, "logs");
const latest = hexToNum(latestHex);
const wallets = new Set(state.wallets.map((w) => w.toLowerCase()));
const contracts = new Set(state.contracts.map((w) => w.toLowerCase()));

// 1. discover: every receiver in a transfer since the last run
let transfers = 0;
const STEP = config.logStep || 10000;
const ranges = [];
for (let from = state.lastBlock + 1; from <= latest; from += STEP) ranges.push([from, Math.min(from + STEP - 1, latest)]);
console.error(`respect: block ${latest}, scanning ${ranges.length} ranges since ${state.lastBlock}`);
// one range a call (two calls, one per contract): every endpoint in the logs pool takes that
for (let i = 0; i < ranges.length; i++) {
  const [a, b] = ranges[i];
  const results = await rpc([
    { method: "eth_getLogs", params: [{ address: og.address, fromBlock: toHex(a), toBlock: toHex(b), topics: [SEL.transfer] }] },
    { method: "eth_getLogs", params: [{ address: zor.address, fromBlock: toHex(a), toBlock: toHex(b), topics: [[SEL.transferSingle, SEL.transferBatch]] }] },
  ], "logs");
  for (const logs of results) {
    for (const log of logs) {
      transfers++;
      // ERC-20 Transfer: topics[2] = to. ERC-1155 TransferSingle/Batch: topics[3] = to.
      const to = log.topics.length === 3 ? topicToAddress(log.topics[2]) : topicToAddress(log.topics[3]);
      if (to && to !== "0x0000000000000000000000000000000000000000") wallets.add(to);
    }
  }
  if (i % 10 === 9) console.error(`  ranges ${i + 1}/${ranges.length}, transfers so far ${transfers}`);
  await pace();
}

// 2. balances for every wallet, live, in batches
const list = [...wallets].sort();
const holders = [];
// the public Optimism RPC takes at most 10 calls a batch: 5 wallets x 2 contracts
const BATCH = Number(process.env.RPC_BATCH_WALLETS) || 5;
for (let i = 0; i < list.length; i += BATCH) {
  const slice = list.slice(i, i + BATCH);
  const calls = slice.flatMap((w) => [
    { method: "eth_call", params: [{ to: og.address, data: SEL.balanceOf + pad32(w) }, latestHex] },
    { method: "eth_call", params: [{ to: zor.address, data: SEL.balanceOf1155 + pad32(w) + pad32("0") }, latestHex] },
  ]);
  const res = await rpc(calls);
  slice.forEach((w, k) => {
    const ogBal = fromWei(hexToBig(res[2 * k]), og.decimals);
    const zorBal = fromWei(hexToBig(res[2 * k + 1]), zor.decimals);
    holders.push({ wallet: w, og: ogBal, zor: zorBal, total: ogBal + zorBal });
  });
  if ((i / BATCH) % 10 === 9) console.error(`  balances ${Math.min(i + BATCH, list.length)}/${list.length}`);
  await pace();
}
// new wallets: is it a contract?
const fresh = list.filter((w) => !state.wallets.includes(w));
for (let i = 0; i < fresh.length; i += BATCH * 2) {
  const slice = fresh.slice(i, i + BATCH * 2);
  const codes = await rpc(slice.map((w) => ({ method: "eth_getCode", params: [w, "latest"] })));
  slice.forEach((w, k) => { if (codes[k] && codes[k] !== "0x") contracts.add(w); });
}
for (const h of holders) h.contract = contracts.has(h.wallet);

// 3. totals from the contracts
const [ogSupply, zorTotal] = await rpc([
  { method: "eth_call", params: [{ to: og.address, data: SEL.totalSupply }, latestHex] },
  { method: "eth_call", params: [{ to: zor.address, data: SEL.totalRespect }, latestHex] },
]);

const held = holders.filter((h) => h.total > 0).sort((a, b) => b.total - a.total || a.wallet.localeCompare(b.wallet));
const sum = (xs, k) => xs.reduce((n, x) => n + x[k], 0);
const seedByWallet = new Map(seed.holders.map((h) => [h.wallet, h]));
const changed = held.filter((h) => { const s = seedByWallet.get(h.wallet); return !s || s.og !== Math.round(h.og) || s.zor !== Math.round(h.zor); });

const snapshot = {
  date: today(), at: nowIso(), chain: "optimism", block: latest,
  og: { address: og.address, totalSupply: fromWei(hexToBig(ogSupply), og.decimals), held: sum(held, "og"), holders: held.filter((h) => h.og > 0).length },
  zor: { address: zor.address, totalRespect: fromWei(hexToBig(zorTotal), zor.decimals), held: sum(held, "zor"), holders: held.filter((h) => h.zor > 0).length },
  wallets: held.length, both: held.filter((h) => h.og > 0 && h.zor > 0).length, contracts: held.filter((h) => h.contract).length,
  totalHeld: sum(held, "total"),
  sinceSeed: { seedBlock: seed.block, transfers: state.transfersSinceSeed + transfers, newWallets: fresh.length, walletsChanged: changed.length, dropped: seed.holders.length - held.filter((h) => seedByWallet.has(h.wallet)).length },
  holders: held,
};
writeJson(`respect/${snapshot.date}.json`, snapshot);
writeJson("respect-state.json", { lastBlock: latest, wallets: list, contracts: [...contracts], transfersSinceSeed: state.transfersSinceSeed + transfers, updated: nowIso() });
console.error(`respect: ${held.length} wallets hold ${Math.round(snapshot.totalHeld)} (OG ${Math.round(snapshot.og.held)} of ${Math.round(snapshot.og.totalSupply)}, ZOR ${Math.round(snapshot.zor.held)} of ${Math.round(snapshot.zor.totalRespect)}); ${transfers} transfers this run, ${fresh.length} new wallets`);
