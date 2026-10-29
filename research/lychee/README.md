# LYCHEE study (VF-QMM)

**Decision: LYCHEE is not traded.** The local backtest showed no robust edge, so this candidate stays out of the traded book.

Files in this folder:

- [`gemini_brief.md`](gemini_brief.md) — design brief (market stats and constraints)
- [`LYCHEE_VFQMM_gemini.py`](LYCHEE_VFQMM_gemini.py) — LYCHEE-only candidate. Its header marks it unvalidated.
- [`results.csv`](results.csv) — local replay on train days −2, −1, and 0

Days −2 / −1 / 0 are the training sample. This table is not an out-of-sample result.

## Local backtest (train days −2 / −1 / 0)

PnL is in Coins, taken from `results.csv`. Every setting loses money over the three days.

| setting | day −2 | day −1 | day 0 | 3-day total |
|---|---:|---:|---:|---:|
| A | −627.0 | −14.0 | 356.5 | **−284.5** |
| B | −1,110.5 | 363.0 | 51.0 | **−696.5** |
| C | −989.0 | 138.0 | 149.0 | **−702.0** |
| D | −1,477.0 | −2,536.0 | −4,626.5 | **−8,639.5** |

Settings A–C are positive only on day 0, and those gains do not cover day −2. Setting D loses on every day. Per-day max drawdown, the spread-versus-drift split, fees, and ending position are in `results.csv`.

Nothing here is promoted. Do not submit `LYCHEE_VFQMM_gemini.py`.
