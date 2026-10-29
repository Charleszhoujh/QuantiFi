# Research notes

These notes do not change the strategy files. Trading logic stays in `strategy/`.

## Current candidate (final_v4 + PEANUT_BUTTER)

- [`PB_REPORT_CN.md`](PB_REPORT_CN.md) — PEANUT_BUTTER study. Frozen final_v4 plus self mean-reversion `D500_e20_q50` (cap 50) is the candidate featured in this repository. Local 3-day PnL on train days −2 / −1 / 0 is 393,514 (167,969.5 / 126,796 / 98,748.5), max daily drawdown 18,470, delayed 401,218.5, adverse 400,163.5. That is a local approximation on reused training days, not an official result.
- [`PB_manifest.json`](PB_manifest.json) — candidate manifest from that study. The featured entry is `final_v4__plus_D500_e20_q50`, SHA256 `0e05e31e73df54fa31e4ddffcfe4b7681b389658646c791db6e2a92543ec884c`. Every entry is marked local research, not adopted or submitted. The file is named `PB_manifest.json` so it does not replace the earlier peak manifest below.

The same report also records a TELL-breakout combination at 453,096. That combination was not adopted. The file in `strategy/` is final_v4 plus `D500_e20_q50`.

## Earlier Codex peak freeze

- [`REPORT_CN.md`](REPORT_CN.md) — complementarity study. Local peak mark-to-market on that run is 319,295 on train days −2 / −1 / 0.
- [`NOTES.md`](NOTES.md) — freeze and review notes (2026-10-28, America/Toronto).
- [`manifest.json`](manifest.json) — peak (`A+Si+P+T+J+C`) and robust (`AF+Si7+Pr+T+J`) component configs. Both are marked research only, with no automatic promotion. The robust source file was not part of this drop, so it is not in the repository.
- [`SHA256.txt`](SHA256.txt) — hash of that run’s source, recorded under the original filename `QuantiFi_peak_research.py`: `1f22bae1b8b4df5d22026dab426338755bed5aa87674df302ee48ef8585822fd`.

That earlier file is archived at [`strategy/archive/Codex_Peak_Trader.py`](../strategy/archive/Codex_Peak_Trader.py). Its portal backtest was about 327,250 on the same train days. It is not the current best.
