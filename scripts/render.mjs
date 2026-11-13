// Turn the latest snapshots into README.md and docs/data.json (the site reads that).
import fs from "node:fs";
import path from "node:path";
import { ROOT, DOCS, readJson, listJson, fmt, pct, short } from "./lib.mjs";

const latest = (dir) => { const files = listJson(dir); return files.length ? readJson(`${dir}/${files[files.length - 1]}`) : null; };
const respect = latest("respect");
const ww = latest("wavewarz");
const seed = readJson("respect-seed.json");
const history = {
  respect: listJson("respect").map((f) => { const s = readJson(`respect/${f}`); return { date: s.date, block: s.block, wallets: s.wallets, og: Math.round(s.og.held), zor: Math.round(s.zor.held), total: Math.round(s.totalHeld) }; }),
  wavewarz: listJson("wavewarz").map((f) => { const s = readJson(`wavewarz/${f}`); return { date: s.date, battles: s.battles.total, decided: s.battles.decided, volumeSol: s.stats?.volume?.totalSol ?? null, volumeUsd: s.stats?.volume?.totalUsd ?? null, artistPayoutsSol: s.stats?.artistPayouts?.totalSol ?? null, traderClaimsSol: s.stats?.traderClaims?.totalSol ?? null, artists: s.artists }; }),
};

const lines = [];
const p = (s = "") => lines.push(s);
p("# ZAO stats");
p();
p(`Numbers The ZAO can point at, read from the source every night: who holds ZAO Respect on Optimism (the two contracts), and what WaveWarZ has done (wavewarz.info's public API). Updated ${respect?.at ?? ww?.at ?? ""}. Site: https://zaodevz.github.io/zao-stats/ . Data: \`data/\` (one JSON per day per source).`);
p();
if (respect) {
  const top = respect.holders.slice(0, 25);
  const top10 = respect.holders.slice(0, 10).reduce((n, h) => n + h.total, 0);
  p("## ZAO Respect holders");
  p();
  p(`Optimism block ${fmt(respect.block)}, ${respect.at}.`);
  p();
  p("| | OG Respect (ERC-20) | ZOR Respect (ERC-1155) | Both |");
  p("|---|--:|--:|--:|");
  p(`| Held by wallets in this list | ${fmt(respect.og.held)} | ${fmt(respect.zor.held)} | ${fmt(respect.totalHeld)} |`);
  p(`| Contract total | ${fmt(respect.og.totalSupply)} (totalSupply) | ${fmt(respect.zor.totalRespect)} (totalRespect) | |`);
  p(`| Wallets holding | ${fmt(respect.og.holders)} | ${fmt(respect.zor.holders)} | ${fmt(respect.wallets)} wallets, ${respect.both} hold both |`);
  p();
  p(`Top 10 wallets hold ${pct(top10, respect.totalHeld)} of all Respect held. ${respect.contracts} wallet${respect.contracts === 1 ? " is" : "s are"} a smart contract. Since Zaal's 31 Oct 2026 snapshot (block ${fmt(seed.block)}): ${respect.sinceSeed.transfers} transfers, ${respect.sinceSeed.newWallets} new wallet${respect.sinceSeed.newWallets === 1 ? "" : "s"}, ${respect.sinceSeed.walletsChanged} balance${respect.sinceSeed.walletsChanged === 1 ? "" : "s"} changed.`);
  p();
  p("| # | Wallet | OG | ZOR | Total | Share |");
  p("|--:|---|--:|--:|--:|--:|");
  top.forEach((h, i) => p(`| ${i + 1} | \`${h.wallet}\`${h.contract ? " (contract)" : ""} | ${fmt(h.og)} | ${fmt(h.zor)} | ${fmt(h.total)} | ${pct(h.total, respect.totalHeld)} |`));
  p();
  p(`All ${respect.wallets} wallets: \`data/respect/${respect.date}.json\` or the site.`);
  p();
  p("**What this list is and is not** (Zaal's notes from the 31 Oct snapshot, still true until the proposals named execute):");
  p();
  p("- It counts wallets. A person with two wallets appears twice; some wallets have no name attached.");
  p("- 27 community members have no wallet on file, so they are not here.");
  p("- 864 Respect from the latest meetings is in proposals still waiting to execute and is not counted.");
  p("- 1,614 Respect from older proposals that failed when executed is not counted (1,010 of it is in a re-mint batch not yet run; the other 604 is undecided). 1,010 Respect from proposals that expired is not counted.");
  p("- Still open: a batch burn of 848 Respect at block 142,844,934 was meant to be re-minted at double; not established yet.");
  p();
  p("**Check it yourself.** OG: `0x34cE89baA7E4a4B00E17F7E4C0cb97105C216957`, `balanceOf(wallet)` and `totalSupply()` (18 decimals). ZOR: `0x9885CCeEf7E8371Bf8d6f2413723D25917E7445c`, `balanceOf(wallet, 0)` and `totalRespect()`. Use the contract reads; Blockscout's holder table ran behind the contract (18,626 against 19,764 on 31 Oct).");
  p();
}
if (ww) {
  const s = ww.stats || {};
  p("## WaveWarZ");
  p();
  p(`wavewarz.info public API, ${ww.at}.`);
  p();
  p("| | |");
  p("|---|--:|");
  p(`| Battles | ${fmt(ww.battles.total)} (${fmt(ww.battles.decided)} decided) |`);
  if (s.battles) p(`| By kind | ${fmt(s.battles.mainEvents)} main events, ${fmt(s.battles.mainBattles)} main battles, ${fmt(s.battles.quickBattles)} quick, ${fmt(s.battles.communityBattles)} community |`);
  if (s.volume) p(`| Trading volume | ${s.volume.totalSol.toLocaleString("en-US", { maximumFractionDigits: 1 })} SOL (about $${fmt(s.volume.totalUsd)}), last 7 days ${s.volume.last7dSol.toLocaleString("en-US", { maximumFractionDigits: 2 })} SOL |`);
  if (s.artistPayouts) p(`| Paid to artists | ${s.artistPayouts.totalSol.toLocaleString("en-US", { maximumFractionDigits: 2 })} SOL (about $${fmt(s.artistPayouts.totalUsd)}), automatic, 1% of volume plus settlement bonus |`);
  if (s.traderClaims) p(`| Trader withdrawals | ${s.traderClaims.totalSol.toLocaleString("en-US", { maximumFractionDigits: 1 })} SOL (about $${fmt(s.traderClaims.totalUsd)}) over ${fmt(s.traderClaims.withdrawalCount)} claims |`);
  p(`| Artists and songs | ${fmt(ww.artists)} artist names, ${fmt(ww.songs)} songs |`);
  if (s.solPriceUsd) p(`| SOL price used | $${s.solPriceUsd} |`);
  p();
  p("| # | Artist | Battles | Wins | Win rate | Vol SOL | Songs |");
  p("|--:|---|--:|--:|--:|--:|--:|");
  ww.topArtists.slice(0, 15).forEach((a, i) => p(`| ${i + 1} | ${a.name.replace(/\|/g, "/")} | ${a.battles} | ${a.wins} | ${a.winRate}% | ${a.volumeSol.toFixed(2)} | ${a.songs} |`));
  p();
  const months = Object.entries(ww.battles.byMonth).sort().slice(-12);
  if (months.length) {
    p("Battles a month: " + months.map(([m, n]) => `${m} ${n}`).join(", ") + ".");
    p();
  }
}
p("## How it updates");
p();
p("A GitHub Action runs `node scripts/update.mjs` every night (03:40 UTC) and commits what changed. `scripts/respect.mjs` scans Optimism transfer logs since the last run for new wallets (public RPC, 10k blocks a call) and then reads every wallet's balance live from the two contracts; `scripts/wavewarz.mjs` reads the stats endpoint and every battle; `scripts/render.mjs` writes this README and `docs/data.json` for the site. No dependencies, Node 20+. Run it yourself: `npm run update`. Set `OPTIMISM_RPC` to use your own RPC.");
p();
p("Seed: Zaal's holders page of 12 Nov 2026 (172 wallets at block 158,930,150). Licence CC0.");
fs.writeFileSync(path.join(ROOT, "README.md"), lines.join("\n") + "\n");

fs.mkdirSync(DOCS, { recursive: true });
fs.writeFileSync(path.join(DOCS, "data.json"), JSON.stringify({ generated: new Date().toISOString(), respect, wavewarz: ww, history }, null, 0));
console.error(`render: README (${lines.length} lines), docs/data.json, ${respect ? respect.wallets + " wallets" : "no respect"}, ${ww ? ww.battles.total + " battles" : "no wavewarz"}`);
void short;
