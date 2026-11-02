# QuantiFi 2026 — Team 1

Team 1's submission to **QuantiFi 2026**, the limit-order-book market-making contest run by the University of Toronto Engineering Finance Association ([UTEFA](https://www.utefa.com/quantifi)). Teams trade a tick-level order-book simulation of 26 products.

**Status:** submitted Sunday, November 1, 2026 (Toronto time). Finalists are expected to be announced in early November.

## Team

- Leena Li
- Charles Zhou
- Su Pu
- Chloe Gao

## What we submitted

| Item | File |
| --- | --- |
| Trading algorithm | [`Team1QuantiFi2026.py`](Team1QuantiFi2026.py) |
| 5-page abstract (Letter, PDF) | [`abstract/Team1QuantiFi2026.pdf`](abstract/Team1QuantiFi2026.pdf) (HTML source: [`abstract/final.html`](abstract/final.html)) |

A note on naming: we uploaded the code as `Team1QuantiFi2026.py`. The abstract header calls it `Team01QuantiFi2026.py`; both names refer to this same file.

The submitted code is **v10**, a readability rewrite of **v9**. On all three provided days v10 sends the same orders and gets the same fills as v9, and both score 523,191.5 on the official portal. [`Team1QuantiFi2026.py`](Team1QuantiFi2026.py) is a byte-for-byte copy of the v10 file. Earlier frozen copies of v9 and v10 are kept under [`strategies/`](strategies/).

## Result

Official portal backtest: **523,191.5 Coins**.

| Day | PnL (Coins) |
| --- | ---: |
| −2 | 225,130 |
| −1 | 188,395 |
| 0 | 109,666.5 |
| **Total** | **523,191.5** |

These are in-sample results on the three provided days. The contest's hidden evaluation days may differ.

## Strategy overview

The algorithm is a portfolio of independent modules. Each product is owned by exactly one module, and a shared risk layer enforces position limits and accounts for orders already in flight. 18 products are traded and 8 are deliberately left alone.

- **Market making:** quotes around a known or implied fair value: AMETHYST (fixed fair value 10,000), PINK_PEARLS (fair value implied from the other pearls), and GOLDEN_PEARLS (constant-fair maker with inventory skew).
- **Voucher pricing with a volatility smile:** for each voucher strike (7000–7900), fit a quadratic implied-volatility smile to the *other* strikes, price the strike with Black–Scholes, and trade when the market deviates from the fit by more than a threshold. The underlying, LYCHEE, and the edge strikes 6800/8100 are not traded.
- **Mean reversion:** z-score against slow exponential anchors for PEANUT_BUTTER and MANGOSTEEN. TOFFEE_CAKE and JELLY each blend a fixed-centre leg with an EMA-anchor leg.
- **Trend following:** a rolling-regression slope with a fair-value gate (PAPER_LANTERNS), confirmed swing-pivot breakouts (TELLURIUM), and the basket's own trend (FRUIT_BASKET).
- **Drawdown guard (kill switch):** on the three trend products, intraday PnL is tracked from our own fills plus position marked to mid. If the drop from the day's peak exceeds 1.5× the worst intraday drawdown seen on days −2 and −1, the position is flattened and the product stops trading for the day.
- **Local backtester aligned with the portal:** we calibrated a local simulator until it reproduced the portal's PnL exactly. That let us test changes quickly and trust the numbers in the abstract.

The abstract covers the method, parameters, and per-product results in detail.

### Per-product PnL (portal, Coins)

| Product | Day −2 | Day −1 | Day 0 | Total |
| --- | ---: | ---: | ---: | ---: |
| TELLURIUM | 59,580 | 27,275 | 8,564 | 95,419 |
| FRUIT_BASKET | 21,419 | 46,734 | 7,703 | 75,856 |
| PEANUT_BUTTER | 31,292 | 26,615 | 14,671 | 72,578 |
| JELLY | 26,562 | 19,077 | 9,431 | 55,070 |
| TOFFEE_CAKE | 12,501 | 18,449 | 18,182 | 49,132 |
| PAPER_LANTERNS | 15,223 | 17,417 | 13,617 | 46,257 |
| VOUCHER_7000–7900 (8 strikes) | 56,192 | 30,298 | 33,639 | 120,129 |
| MANGOSTEEN | −538 | 1,092 | 3,127 | 3,681 |
| PINK_PEARLS | 2,289 | 429 | 119 | 2,837 |
| AMETHYST | 527 | 608 | 477.5 | 1,612.5 |
| GOLDEN_PEARLS | 83 | 401 | 136 | 620 |
| **Total** | **225,130** | **188,395** | **109,666.5** | **523,191.5** |

Not traded: LYCHEE, GRANADILLA, DRAGONFRUIT (used only as signals), BLUE/BLACK/WHITE_PEARLS, VOUCHER_6800, VOUCHER_8100.

## Repository layout

- [`Team1QuantiFi2026.py`](Team1QuantiFi2026.py): the submitted algorithm.
- [`abstract/`](abstract/): the submitted abstract PDF, its HTML source, and its figures.
- [`strategies/`](strategies/): frozen milestones from the research process, with freeze manifests.
- [`research/`](research/), [`reports/`](reports/): research notes and reports behind those milestones.
- [`probes/`](probes/): small scripts used to learn how the portal behaves.
- [`MANIFEST.md`](MANIFEST.md): index of archived files.

Do not commit portal passwords, API keys, or other credentials.

## Lessons

- **Make the backtest match the venue first.** Matching the portal exactly paid for itself many times over. Every number we reported can be traced to a portal log.
- **Cut what you can't defend.** Dropping products and strikes that did not survive testing helped more than adding parameters.
- **Keep one canonical file.** Too many near-identical versions and filenames cost us time at the end. Freeze one artifact with one name early.
- **Write alongside the research.** We froze the strategy late, so the abstract went through many compression rounds right up to the deadline.
- **Out-of-sample evidence was thin.** Some modules did not pass leave-one-day-out validation. With only three days of data, part of the PnL is likely luck, and we treat it as a risk.
