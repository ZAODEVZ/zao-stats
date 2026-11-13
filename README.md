# ZAO stats

Numbers The ZAO can point at, read from the source every night: who holds ZAO Respect on Optimism (the two contracts), and what WaveWarZ has done (wavewarz.info's public API). Updated 2026-11-13T04:50:27Z. Site: https://zaodevz.github.io/zao-stats/ . Data: `data/` (one JSON per day per source).

## ZAO Respect holders

Optimism block 159,473,317, 2026-11-13T04:50:27Z.

| | OG Respect (ERC-20) | ZOR Respect (ERC-1155) | Both |
|---|--:|--:|--:|
| Held by wallets in this list | 38,484 | 20,408 | 58,892 |
| Contract total | 38,484 (totalSupply) | 20,408 (totalRespect) | |
| Wallets holding | 122 | 72 | 173 wallets, 21 hold both |

Top 10 wallets hold 45.2% of all Respect held. 2 wallets are a smart contract. Since Zaal's 31 Oct 2026 snapshot (block 158,930,150): 12 transfers, 0 new wallets, 11 balances changed.

| # | Wallet | OG | ZOR | Total | Share |
|--:|---|--:|--:|--:|--:|
| 1 | `0x7234c36a71ec237c2ae7698e8916e0735001e9af` | 3,094 | 952 | 4,046 | 6.9% |
| 2 | `0x29f5dee65e1fb856b816eab4f0b702c10e5eaa34` | 2,512 | 1,176 | 3,688 | 6.3% |
| 3 | `0x8d43a3fc2fed663bf6b82ea4792c0e5239d5ee66` | 1,914 | 1,732 | 3,646 | 6.2% |
| 4 | `0x7990d756acf4e12afc41f995130a33925fb868ee` | 3,079 | 0 | 3,079 | 5.2% |
| 5 | `0xfab9a3d37999e12252b47468d2ffd4be15936012` | 2,310 | 356 | 2,666 | 4.5% |
| 6 | `0x65284960d4eadaf45e923430a59b7d3bf34db641` | 2,278 | 312 | 2,590 | 4.4% |
| 7 | `0x64a15b1d2de581097cb48e5d82619203e24bb3e1` | 1,265 | 730 | 1,995 | 3.4% |
| 8 | `0x2d9cbc4ecfbd1b8f66aa798fd51585ae058daa8b` | 825 | 882 | 1,707 | 2.9% |
| 9 | `0x744cdf12d5d289db118ed9293c10cfa952169071` | 1,499 | 110 | 1,609 | 2.7% |
| 10 | `0xb7f4b9caba6bb0aeaa2b5d8df23e2b59c192bdbb` | 611 | 982 | 1,593 | 2.7% |
| 11 | `0x29185eb8cfd22aa719529217bfbade61677e0ad2` | 600 | 978 | 1,578 | 2.7% |
| 12 | `0xa70fe49c71529808eb881455073beded47f7016c` | 1,379 | 0 | 1,379 | 2.3% |
| 13 | `0xc96ab83c1b1605c9cf5ecc661a415e41423185d8` | 468 | 854 | 1,322 | 2.2% |
| 14 | `0x82cb2305388c853ecfe9ea83a1604acf58466659` | 647 | 642 | 1,289 | 2.2% |
| 15 | `0xbc66077e3a212c5f255cfc986e7c0508cfeabfd1` | 1,147 | 0 | 1,147 | 1.9% |
| 16 | `0xfda73b8459f66b6758d1809372df921365053af1` | 1,122 | 16 | 1,138 | 1.9% |
| 17 | `0xf6519fef3eacfdb7843beea94a887255794438f0` | 910 | 150 | 1,060 | 1.8% |
| 18 | `0x9e4281619db487c2f577e67a7174ff8f5c5e4706` | 1,000 | 0 | 1,000 | 1.7% |
| 19 | `0x1af4c2950c5c892d1f4aacd60e8f656a14555e5a` | 878 | 0 | 878 | 1.5% |
| 20 | `0xf73485a61856ab07ad57152151db3ab99df9a8ea` | 0 | 806 | 806 | 1.4% |
| 21 | `0x07686bedb0102e47d33cec73307d2cc391aff396` | 0 | 794 | 794 | 1.3% |
| 22 | `0xfcf77ac2cef5eb373d8eb9163f518126cce44f47` | 785 | 0 | 785 | 1.3% |
| 23 | `0x03726e10565402a1137960ba06681754be7fe05f` | 355 | 404 | 759 | 1.3% |
| 24 | `0x849e1c0b2460979d2f7c77b87b90c65c70406421` | 0 | 670 | 670 | 1.1% |
| 25 | `0x547f8b793362df477a23af6ee05f8e4e291a2ee4` | 299 | 288 | 587 | 1.0% |

All 173 wallets: `data/respect/2026-11-13.json` or the site.

**What this list is and is not** (Zaal's notes from the 31 Oct snapshot, still true until the proposals named execute):

- It counts wallets. A person with two wallets appears twice; some wallets have no name attached.
- 27 community members have no wallet on file, so they are not here.
- 864 Respect from the latest meetings is in proposals still waiting to execute and is not counted.
- 1,614 Respect from older proposals that failed when executed is not counted (1,010 of it is in a re-mint batch not yet run; the other 604 is undecided). 1,010 Respect from proposals that expired is not counted.
- Still open: a batch burn of 848 Respect at block 142,844,934 was meant to be re-minted at double; not established yet.

**Check it yourself.** OG: `0x34cE89baA7E4a4B00E17F7E4C0cb97105C216957`, `balanceOf(wallet)` and `totalSupply()` (18 decimals). ZOR: `0x9885CCeEf7E8371Bf8d6f2413723D25917E7445c`, `balanceOf(wallet, 0)` and `totalRespect()`. Use the contract reads; Blockscout's holder table ran behind the contract (18,626 against 19,764 on 31 Oct).

## WaveWarZ

wavewarz.info public API, 2026-11-13T04:50:38Z.

| | |
|---|--:|
| Battles | 1,706 (1,501 decided) |
| By kind | 65 main events, 197 main battles, 1,471 quick, 38 community |
| Trading volume | 1,010 SOL (about $79,019), last 7 days 4.23 SOL |
| Paid to artists | 15.93 SOL (about $1,247), automatic, 1% of volume plus settlement bonus |
| Trader withdrawals | 524.9 SOL (about $41,070) over 3,627 claims |
| Artists and songs | 1,179 artist names, 1,180 songs |
| SOL price used | $78.24 |

| # | Artist | Battles | Wins | Win rate | Vol SOL | Songs |
|--:|---|--:|--:|--:|--:|--:|
| 1 | Fuck yo feelingZ | 28 | 19 | 68% | 10.15 | 1 |
| 2 | WaveWarZ, the electric vibez | 49 | 18 | 37% | 6.11 | 1 |
| 3 | No Regrets @Hurric4n3Ike x @dopestilo | 20 | 14 | 70% | 1.29 | 1 |
| 4 | IndieZ | 18 | 13 | 72% | 4.77 | 2 |
| 5 | HEART OPEN | 28 | 13 | 46% | 3.95 | 1 |
| 6 | NSG Steppin x Kata7yst x LUI | 20 | 11 | 55% | 0.94 | 1 |
| 7 | Cannon Jones feat Hurric4n3Ike X Makako flow-Fight Flow | 22 | 10 | 45% | 4.83 | 1 |
| 8 | Dale Vuelta 360 | 18 | 10 | 56% | 4.45 | 1 |
| 9 | Paradise | 23 | 10 | 43% | 2.85 | 1 |
| 10 | Young Buck | 25 | 10 | 40% | 1.90 | 1 |
| 11 | Limit Breaker Ft Cannon Jones | 19 | 9 | 47% | 6.11 | 1 |
| 12 | AI LUI - A Christmas Love Song | 10 | 9 | 90% | 0.84 | 1 |
| 13 | BestWavez x Hurric4n3Ike (Prod. x Hurric4n3Ike) 432 hz | 15 | 9 | 60% | 0.43 | 1 |
| 14 | LUI | 13 | 8 | 62% | 88.79 | 2 |
| 15 | Geek Myth | 10 | 8 | 80% | 39.21 | 2 |

Battles a month: 2025-12 68, 2026-01 146, 2026-02 179, 2026-03 198, 2026-04 184, 2026-05 135, 2026-06 137, 2026-07 165, 2026-08 154, 2026-09 114, 2026-10 90, 2026-11 27.

## How it updates

A GitHub Action runs `node scripts/update.mjs` every night (03:40 UTC) and commits what changed. `scripts/respect.mjs` scans Optimism transfer logs since the last run for new wallets (public RPC, 10k blocks a call) and then reads every wallet's balance live from the two contracts; `scripts/wavewarz.mjs` reads the stats endpoint and every battle; `scripts/render.mjs` writes this README and `docs/data.json` for the site. No dependencies, Node 20+. Run it yourself: `npm run update`. Set `OPTIMISM_RPC` to use your own RPC.

Seed: Zaal's holders page of 12 Nov 2026 (172 wallets at block 158,930,150). Licence CC0.
