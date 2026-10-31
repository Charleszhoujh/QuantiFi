> Provenance: written by research agent C in its final hand-back (its tool harness refused .md writes); root saved it here on 2026-10-28 without changing any number. Numbers are claude_replay_v1 approximate replays, not official results. Root reproduction: see ../../reports/REPRODUCTION.md.

# Direction C: trend and momentum

## Summary (≤10 lines)
1. **H2 (detection, day -2): the pooled test was not supported.** Pooled k-tick autocorrelation is ≈0 at 100–200 ticks and *negative* at 500–2000 ticks (−0.17, z = −2.8 at 500). Only PAPER_LANTERNS (ρ100 = 0.75) and TELLURIUM (VR 1.7–2.0) show persistence at the single-product level.
2. **Day drift does not carry over between days.** Holding each product in its day -2 drift direction made +45,188 on day -2 (hindsight) and −11,460 on day -1. Only 5 of 16 products kept their direction.
3. **Trend following on everything loses:** ema_U made −6,085 / −1,943. It paid 5.4–5.8k in spread per day, and timing was negative on both days.
4. **Preregistered nominee is ema_R2 (PAPER_LANTERNS + TELLURIUM), status conditional.** 9,045 / 643 base and 8,785 / 371 with cost, the same under every fill scenario. Its day -1 profit is a static net-long TELLURIUM exposure (timing −31), and its day -1 drawdown is 2,738.
5. **The only effect that repeats is PAPER_LANTERNS trend timing:** +2,978 / +2,359 base, timing +3,115 / +2,775, positive in every config that trades it.
6. The online causal gate (ema_U_gate) made +3,975 / +2,244 with positive timing on both days. It ranked 5th by the preregistered rule, so it is not nominated (choosing it would be post-hoc).
7. **H3 (passive entry) rejected.** Base PnL is lower on day -2 for all three passive variants, and lower on day -1 for both entry-only variants. Passive results depend on the fill model (strict join-entry 987 / −269; take_only 0).

## Hypotheses, expected edge, failure conditions
Preregistrations: `preregistration_h2_eda.json` (H2 and rule R, written before any statistic), `preregistration.json` (H1, H3, rules R2 and G_online, written after the day -2 EDA and before any strategy run). Round 1 only.

| id | claim | edge source | fails if |
|---|---|---|---|
| H1 | Causal EMA trend (F=50, S=200, enter at \|s\|>1.0 ≈ 2.1× the random-walk sd, exit at 0, size = 25% of limit, crossing at level 1) has edge that is not just day drift | mark PnL from timing; take_edge < 0 | day -1 ≤ 0, or timing ≤ 0, or loss under cost |
| H2 | k-tick returns are positively autocorrelated for k ∈ {100..2000} (day -2) | n/a | pooled ρ_k ≤ 0 or z ≤ 1.64 at all k |
| H3 | Resting passively at entry (join/improve) beats crossing for the same signal | saved spread | passive base ≤ crossing base on either day, or the gain vanishes under strict/half |

Product-selection rules, fixed before any strategy run, none based on PnL:
- **R** (fixed before the EDA): prior-day |Z_drift| ≥ 2 → {PINK_PEARLS}.
- **R2** (post-hoc, same 2.0 threshold): prior-day ρ100·√n ≥ 2 → {PAPER_LANTERNS 7.5, TELLURIUM 2.3}.
- **G_online**: computed inside the strategy from the current day's data only (≥10 blocks of 100 ticks, ρ100·√n ≥ 2 so far), applied identically on every day.
- R and R2 sets come from day -2 and are reused unchanged on day -1. Day -2 is in-sample for selection.

## H2 results (day -2 only; `eda_h2_day-2.py`, `results/eda_h2_day-2_stdout.txt`, `results/eda_h2_vr_z_table.txt`)
| k | pairs | ρ raw | z | ρ demeaned (bias-corr.) | z |
|---|---|---|---|---|---|
| 100 | 1568 | −0.008 | −0.33 | −0.008 | −0.32 |
| 200 | 768 | −0.024 | −0.66 | −0.023 | −0.62 |
| 500 | 288 | −0.167 | −2.83 | −0.162 | −2.76 |
| 1000 | 128 | −0.174 | −1.97 | −0.154 | −1.74 |
| 2000 | 48 | −0.176 | −1.22 | −0.195 | −1.35 |

- Since-open signal (S4): corr 0.07, sign agreement 0.47 — no predictive power.
- Drift z-scores (S5): TELLURIUM's −23% is Z = −1.85, FRUIT_BASKET 1.94 — ordinary random-walk moves given each product's 100-tick volatility. Only PINK_PEARLS reaches |Z| ≥ 2.
- Product-level variance ratios: TELLURIUM VR(100..500, 1-tick base) 1.72–2.04, z* 6.5–9.2. BLUE_PEARLS VR(100) = 1.73, z* 6.3, continuation 3.2 < 6.1 spread. PAPER_LANTERNS VR 3.6–5.8 on a 100-tick base, z* ≈ 8 (smooth fair value under ±1-tick flicker, lag-1 ACF −0.50). AMETHYST and GOLDEN_PEARLS pinned (VR ≈ 0). TOFFEE_CAKE and JELLY mean-revert.
- Process notes: v1 of the EDA script omitted √T in the Lo–MacKinlay z*; its output is kept as `*_v1_zstar_bug.*` and was fixed before any decision. σ100 in the signal was changed from raw RMS to demeaned std before any strategy run (raw RMS caps s at 0.75 on a noiseless trend); both versions are in `results/eda_signal_scale_day-2_stdout*.txt`.

## All registered trials (base; `results/experiments_round1_base.jsonl`)
| hyp | config | products | day -2 | day -1 | err |
|---|---|---|---|---|---|
| H1 | ctrl_hold_d2sign_U (control) | U, day -2 drift sign | 45,188 | −11,460 | 0 |
| H1 | ema_U | U (16) | −6,085 | −1,943 | 0 |
| H1 | ema_U_gate | U + G_online | 3,975 | 2,244 | 0 |
| H1 | ema_R | PINK_PEARLS | 240 | −55 | 0 |
| H1 | **ema_R2** | PAPER_LANTERNS, TELLURIUM | **9,045** | **643** | 0 |
| H3 | r2_entry_join | R2, join entry / cross exit | 7,747 | 122 | 0 |
| H3 | r2_entry_improve | R2, +1 tick entry / cross exit | 7,624 | 6 | 0 |
| H3 | r2_all_join | R2, join entry and exit | 6,149 | 1,806 | 0 |

No-trade baseline = 0 on both days. Ranking by day -2 base gives ema_R2 first; it passes the day -1 gate.

## Stress (`results/stress.jsonl`)
| config | day | base | strict | half | next_tick | take_only | cost | price_only | adverse |
|---|---|---|---|---|---|---|---|---|---|
| control | −2 | 45188 | 45188 | 45188 | 45188 | 45188 | 45003 | 45188 | 45003 |
| control | −1 | −11460 | −11460 | −11460 | −11460 | −11460 | −11645 | −11460 | −11645 |
| ema_U | −2 | −6085 | −6085 | −6085 | −6085 | −6085 | −8039 | −6085 | −8039 |
| ema_U | −1 | −1943 | −1943 | −1943 | −1943 | −1943 | −3877 | −1943 | −3877 |
| ema_U_gate | −2 | 3975 | 3975 | 3975 | 3975 | 3975 | 3675 | 3975 | 3675 |
| ema_U_gate | −1 | 2244 | 2244 | 2244 | 2244 | 2244 | 2078 | 2244 | 2078 |
| ema_R | −2 | 240 | 240 | 240 | 240 | 240 | 170 | 240 | 170 |
| ema_R | −1 | −55 | −55 | −55 | −55 | −55 | −95 | −55 | −95 |
| **ema_R2** | −2 | 9045 | 9045 | 9045 | 9045 | 9045 | 8785 | 9045 | 8785 |
| **ema_R2** | −1 | 643 | 643 | 643 | 643 | 643 | 371 | 643 | 371 |
| r2_entry_join | −2 | 7747 | 987 | 6391 | 6444 | 0 | 7501 | 7747 | 297 |
| r2_entry_join | −1 | 122 | −269 | −670 | −576 | 0 | −98 | 122 | −96 |
| r2_entry_improve | −2 | 7624 | 7624 | 6286 | 7345 | 0 | 7378 | 7624 | 6076 |
| r2_entry_improve | −1 | 6 | 6 | −760 | −606 | 0 | −214 | 6 | −934 |
| r2_all_join | −2 | 6149 | 4381 | 3069 | 1502 | 0 | 5917 | 6149 | 1121 |
| r2_all_join | −1 | 1806 | 4094 | 3965 | 83 | 0 | 1589 | 1806 | 1269 |

(next_tick values were produced before root's 2026-10-28 next_tick leak fix; see reports/REPRODUCTION.md.)

ema_R2 base: max drawdown 1,587 / 2,738; exit value 9,045 / 625; units 260 / 272; call p99 302 / 462 µs; traderData 185 B; 0 errors.

## Per-product decomposition, base (`results/summary_round1.json`)
pnl = mark + take_edge + passive_edge − fees; mark = static + timing, static = mean signed position × day mid change; maxhold = longest same-sign hold (ticks).

| config | day | product | pnl | mark | static | timing | take_e | pass_e | mean pos | mean\|pos\| | maxhold |
|---|---|---|---|---|---|---|---|---|---|---|---|
| ema_R2 | −2 | PAPER_LANTERNS | 2978 | 3219 | 104 | 3115 | −241 | 0 | −2.78 | 7.51 | 3267 |
| ema_R2 | −2 | TELLURIUM | 6067 | 6809 | 2708 | 4101 | −742 | 0 | −2.33 | 3.00 | 1024 |
| ema_R2 | −1 | PAPER_LANTERNS | 2359 | 2621 | −154 | 2775 | −262 | 0 | +2.66 | 5.79 | 1695 |
| ema_R2 | −1 | TELLURIUM | −1716 | −995 | 1812 | −2806 | −722 | 0 | +2.03 | 2.03 | 563 |
| ema_U_gate | −2 | PAPER_LANTERNS | 2760 | 3000 | 80 | 2920 | −240 | 0 | −2.13 | 6.86 | 2726 |
| ema_U_gate | −2 | TELLURIUM | 1725 | 2482 | 1760 | 722 | −757 | 0 | −1.51 | 2.19 | 435 |
| ema_U_gate | −2 | DRAGONFRUIT | −510 | −431 | 75 | −505 | −80 | 0 | +0.34 | 0.34 | 203 |
| ema_U_gate | −1 | PAPER_LANTERNS | 2252 | 2464 | −37 | 2501 | −212 | 0 | +0.63 | 3.76 | 1304 |
| ema_U_gate | −1 | JELLY | 12 | 288 | 76 | 212 | −276 | 0 | +0.63 | 0.90 | 638 |
| ema_U_gate | −1 | GOLDEN_PEARLS | −20 | −3 | 37 | −40 | −18 | 0 | −0.37 | 0.37 | 734 |
| ema_R | −2 / −1 | PINK_PEARLS | 240 / −55 | 370 / 20 | 199 / 57 | 171 / −37 | −130 / −75 | 0 | −1.15 / +0.71 | | 1143 / 990 |
| ema_U | −2 total | 14 products | −6085 | −333 | 4195 | −4528 | −5752 | 0 | | | |
| ema_U | −1 total | 15 products | −1943 | 3477 | 4004 | −527 | −5420 | 0 | | | |
| r2_entry_join | −1 | TELLURIUM | −1397 | −1489 | 1686 | −3175 | −313 | 405 | +1.89 | | 521 |
| r2_all_join | −2 / −1 | TELLURIUM | 4088 / 843 | 3289 / 136 | 5641 / 4743 | −2352 / −4607 | 0 | 800 / 707 | −4.85 / +5.31 | | 2564 / 1676 |

- Full per-product tables for every config are in `results/run_experiments_stdout.txt` §4.
- Day -1 control by product: the day -2 direction made money on day -1 only for BLUE_PEARLS, DRAGONFRUIT, FRUIT_BASKET, PAPER_LANTERNS and PEANUT_BUTTER; TELLURIUM alone lost −8,985.
- H3: passive entry earns positive passive_edge (+598 / +504 for join) but loses more in timing, because a resting order fills when price moves against the signal.

## Conclusions and scope
- **H1: partly supported, for PAPER_LANTERNS only.** Trend following without selection loses; selection by prior-day drift (R) does nothing; R2 works in-sample and on day -1 only through a static TELLURIUM bet. The PAPER_LANTERNS leg has positive timing on both days in all three configs that trade it (consistent with a smooth fair value plus flicker).
- **H2: rejected as stated** (pooled); product-specific persistence only.
- **H3: rejected.**
- **Status: conditional.** Only the PAPER_LANTERNS component has two-day evidence. A PAPER_LANTERNS-only module (or ema_U_gate) would need its own registration and root's day-0 check; not run.

## Issues for root
1. "Rank by day -2 base" rewards configs whose products were chosen on day -2 (R2) over causal selection (G_online), which had the better day -1 result.
2. Crossing-only strategies look identical under every scenario except cost; the stress suite says nothing about their main risk (direction/timing). The static/timing decomposition is more informative.
3. Call p99 exceeded 2 ms for 16-product configs (ema_U 3.7 ms, ema_U_gate 2.8 ms), probably from parallel load; nominee ≤ 0.46 ms.
4. PAPER_LANTERNS' 1-tick mid flicker (lag-1 ACF −0.5) on a smooth path may matter to market making.

## Commands
```
cd "/Users/charles/Desktop/UofT ECE/project/QuantiFi/Claude"
python3 research/C/eda_h2_day-2.py > research/C/results/eda_h2_day-2_stdout.txt
python3 research/C/eda_short_horizon_day-2.py > research/C/results/eda_short_horizon_day-2_stdout.txt
python3 research/C/eda_signal_scale_day-2.py > research/C/results/eda_signal_scale_day-2_stdout.txt
python3 -m unittest research/C/test_strategy.py -v > research/C/results/test_stdout.txt 2>&1   # 14 tests OK
python3 research/C/run_experiments.py > research/C/results/run_experiments_stdout.txt 2>&1
```

## Not executed
Day 0 and official-site calibration (root-only); round 2; a PAPER_LANTERNS-only config; any EDA on day -1; orders resting longer than one tick (S6, not modelled).
