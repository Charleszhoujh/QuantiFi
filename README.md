# QuantiFi 2026

Our Team is currently participating in **QuantiFi 2026**, organized by the University of Toronto Engineering Finance Association (UTEFA).

QuantiFi is a limit-order-book / market-making algorithmic trading contest. Teams trade in a tick-level limit order book (LOB) simulation. It is a trading contest, not a stock pitch.

## Links

- Competition: [https://www.utefa.com/quantifi](https://www.utefa.com/quantifi)
- UTEFA: [https://www.utefa.com/](https://www.utefa.com/)

## Team

**Team 1** (official UTEFA assignment).

- leena.li@mail.utoronto.ca
- christina.pu@mail.utoronto.ca
- chloee.gao@mail.utoronto.ca
- Chaz070815@gmail.com

## This repository

This is Team 1’s workspace for the contest. The final submitted strategy is [`strategies/claude/07_claude_v10_FROZEN_final.py`](strategies/claude/07_claude_v10_FROZEN_final.py).

Do not commit portal passwords, API keys, or other credentials.

## Repository layout

Every archived file is listed in [`MANIFEST.md`](MANIFEST.md) with its repo path, original path, sha256, and why it is kept.

- [`strategies/`](strategies/) — frozen strategy milestones. Claude versions, including freeze manifests, are in [`strategies/claude/`](strategies/claude/). Codex candidates are in [`strategies/codex/`](strategies/codex/). The final submitted strategy is [`strategies/claude/07_claude_v10_FROZEN_final.py`](strategies/claude/07_claude_v10_FROZEN_final.py).
- [`reports/`](reports/) — Codex and Claude research reports, workspace overviews, the rules review, and the Codex report PDFs.
- [`research/`](research/) — research notes behind those milestones, split into [`research/codex/`](research/codex/) and [`research/claude/`](research/claude/).
- [`probes/`](probes/) — portal probe scripts.
- [`abstract/`](abstract/) — the Team 1 abstract ([`abstract/Team1QuantiFi2026.pdf`](abstract/Team1QuantiFi2026.pdf)), figures in [`abstract/figs/`](abstract/figs/), and review notes in [`abstract/reviews/`](abstract/reviews/).

## Final submitted strategy

**v10** ([`strategies/claude/07_claude_v10_FROZEN_final.py`](strategies/claude/07_claude_v10_FROZEN_final.py)) is the team’s final submitted QuantiFi 2026 strategy.

Official portal backtest result: **523,191.5 COINS** total, identical to the previous v9 run.

| Day | PnL (COINS) |
| --- | ---: |
| −2 | 225,130 |
| −1 | 188,395 |
| 0 | 109,666.5 |
| **Total** | **523,191.5** |

These results are in-sample on the 3 provided days (day −2, day −1, and day 0).

## Strategy modules

| Product(s) | Module | Method | Key params |
| --- | --- | --- | --- |
| AMETHYST | A50 (af) | Fixed-fair market maker around 10000 | cap 50, clip 5 |
| LYCHEE + VOUCHER_7000…7900 (8 strikes) | smile RV (S_quad7) | Fit quadratic IV smile across strikes; take vouchers mispriced vs fit; LYCHEE/6800/8100 not traded | thr 7.0, tte 8d, min_fit 4, cap 50 each |
| PAPER_LANTERNS | P_line50_gate | Rolling-line (window 50) forecast, scaled hysteresis entry/exit with fair gate | entry .05 / exit .02, horizon 50, cap 50 |
| PINK_PEARLS | passive_implied_w2 | Passive quotes around fair implied from other pearls | width 2, skew 2, cap 20 |
| GOLDEN_PEARLS | _GP mm_as | Avellaneda-Stoikov style maker, const fair, inventory skew | skew 2, k_sigma 1, min_hw 1, size 10, GP_CAP 10 |
| TELLURIUM | swingbreak (causal_wave) | Swing-high/low breakout trend | threshold 10, cap 40 |
| PEANUT_BUTTER | H3 pb2 | EMA-anchor z-score mean reversion, frozen-anchor exit | anchor_hl 500, sd_hl 1000, warmup 300, z 2, max_hold 1000, cap 50 |
| FRUIT_BASKET (+DRAGONFRUIT/GRANADILLA as signal) | H2 own-basket trend | Trend on basket's own price | cap 40 |
| MANGOSTEEN | MR500_z2 | EMA(hl 500) mean reversion, z 2 | cap 40 |
| TOFFEE_CAKE, JELLY | TJ blend_25_25 | Per product 25 lots fixed-centre MR (5000/±40; 2000/±80) + 25 lots EMA(hl 3000) anchor z≥2; execute at best level (l1), reservation | cap 25+25 |

Kill switch on TELLURIUM, FRUIT_BASKET, and PAPER_LANTERNS. It tracks intraday PnL as cash from own fills plus position times mid. If peak minus that PnL exceeds KILL_DD (20,275.5 / 40,680 / 765, which is 1.5× the max intraday drawdown on days −2 and −1), the product is flattened by crossing the touch and stopped for the day. In-flight orders are remembered for INFLIGHT_TICKS=5. Flatten size is the absolute position minus same-side working orders, so the flatten does not cross through zero.

## Per-product PnL

Portal PnL by product (COINS) for the same backtest. These results are in-sample on the 3 provided days.

| Product | Day −2 | Day −1 | Day 0 | Total |
| --- | ---: | ---: | ---: | ---: |
| TELLURIUM | 59,580 | 27,275 | 8,564 | 95,419 |
| FRUIT_BASKET | 21,419 | 46,734 | 7,703 | 75,856 |
| PEANUT_BUTTER | 31,292 | 26,615 | 14,671 | 72,578 |
| JELLY | 26,562 | 19,077 | 9,431 | 55,070 |
| TOFFEE_CAKE | 12,501 | 18,449 | 18,182 | 49,132 |
| PAPER_LANTERNS | 15,223 | 17,417 | 13,617 | 46,257 |
| VOUCHER_7400 | 9,248 | 10,102 | 7,922 | 27,272 |
| VOUCHER_7300 | 12,495 | 2,824 | 7,717 | 23,036 |
| VOUCHER_7500 | 10,406 | 7,843 | 4,024 | 22,273 |
| VOUCHER_7600 | 9,657 | 4,256 | 3,438 | 17,351 |
| VOUCHER_7750 | 4,437 | 2,758 | 2,065 | 9,260 |
| VOUCHER_7000 | 3,534 | 130 | 5,308 | 8,972 |
| VOUCHER_7200 | 4,129 | 1,732 | 2,160 | 8,021 |
| VOUCHER_7900 | 2,286 | 653 | 1,005 | 3,944 |
| MANGOSTEEN | −538 | 1,092 | 3,127 | 3,681 |
| PINK_PEARLS | 2,289 | 429 | 119 | 2,837 |
| AMETHYST | 527 | 608 | 477.5 | 1,612.5 |
| GOLDEN_PEARLS | 83 | 401 | 136 | 620 |
| LYCHEE | 0 | 0 | 0 | 0 |
| GRANADILLA | 0 | 0 | 0 | 0 |
| DRAGONFRUIT | 0 | 0 | 0 | 0 |
| BLUE_PEARLS | 0 | 0 | 0 | 0 |
| BLACK_PEARLS | 0 | 0 | 0 | 0 |
| VOUCHER_6800 | 0 | 0 | 0 | 0 |
| VOUCHER_8100 | 0 | 0 | 0 | 0 |
| WHITE_PEARLS | 0 | 0 | 0 | 0 |
| **TOTAL** | **225,130** | **188,395** | **109,666.5** | **523,191.5** |

Non-traded (0): LYCHEE, GRANADILLA, DRAGONFRUIT, BLUE_PEARLS, BLACK_PEARLS, WHITE_PEARLS, VOUCHER_6800, VOUCHER_8100. 18 products traded.
