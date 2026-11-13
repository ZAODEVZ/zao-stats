// WaveWarZ numbers from wavewarz.info's public API: the stats endpoint and every battle.
// Writes data/wavewarz/<date>.json: totals, volume, payouts, battles by type, top artists.
import { config, writeJson, today, nowIso } from "./lib.mjs";

const base = config.wavewarz.api;
const get = async (path) => {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const r = await fetch(base + path, { headers: { accept: "application/json", "user-agent": "zao-stats" }, signal: AbortSignal.timeout(30000) });
      if (!r.ok) throw new Error(`${path}: ${r.status}`);
      return await r.json();
    } catch (e) {
      if (attempt === 3) throw e;
      await new Promise((res) => setTimeout(res, 2000 * (attempt + 1)));
    }
  }
};

const stats = await get("/api/public/stats");
const battles = [];
for (let offset = 0; offset < 20000; offset += 200) {
  const j = await get(`/api/public/battles?limit=200&offset=${offset}`);
  const b = j.battles || [];
  battles.push(...b);
  if (b.length < 200) break;
}
console.error(`wavewarz: ${battles.length} battles`);

const decided = battles.filter((b) => b.winnerDecided);
const artists = new Map();
const songs = new Map();
let volumeSol = 0;
const byType = {};
const byMonth = {};
for (const b of battles) {
  byType[b.type || b.battleType || "unknown"] = (byType[b.type || b.battleType || "unknown"] || 0) + 1;
  const m = (b.createdAt || "").slice(0, 7);
  if (m) byMonth[m] = (byMonth[m] || 0) + 1;
  for (const side of ["artist1", "artist2"]) {
    const a = b[side];
    if (!a) continue;
    volumeSol += a.volumeSol || 0;
    const name = (a.name || "").trim() || "?";
    const art = artists.get(name) || { name, battles: 0, wins: 0, volumeSol: 0, songs: new Set() };
    art.battles++;
    if (b.winnerDecided && b.winnerSide === side) art.wins++;
    art.volumeSol += a.volumeSol || 0;
    if (a.musicLink) art.songs.add(a.musicLink);
    artists.set(name, art);
    if (a.musicLink) {
      const s = songs.get(a.musicLink) || { url: a.musicLink, artist: name, battles: 0, wins: 0, volumeSol: 0 };
      s.battles++;
      if (b.winnerDecided && b.winnerSide === side) s.wins++;
      s.volumeSol += a.volumeSol || 0;
      songs.set(a.musicLink, s);
    }
  }
}
const topArtists = [...artists.values()].map((a) => ({ ...a, songs: a.songs.size, winRate: a.battles ? Math.round((100 * a.wins) / a.battles) : 0 }))
  .sort((a, b) => b.wins - a.wins || b.volumeSol - a.volumeSol).slice(0, 25);
const topSongs = [...songs.values()].sort((a, b) => b.volumeSol - a.volumeSol).slice(0, 25);

const snapshot = {
  date: today(), at: nowIso(), source: base,
  stats,
  battles: { total: battles.length, decided: decided.length, byType, byMonth, volumeSolFromBattles: Math.round(volumeSol * 1000) / 1000 },
  artists: artists.size,
  songs: songs.size,
  topArtists,
  topSongs,
};
writeJson(`wavewarz/${snapshot.date}.json`, snapshot);
console.error(`wavewarz: ${artists.size} artists, ${songs.size} songs, ${stats?.volume?.totalSol} SOL volume`);
