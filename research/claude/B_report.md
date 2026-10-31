> Provenance: written by research agent B as results/REPORT.txt (its tool harness refused .md writes); root copied it here verbatim on 2026-10-28. Numbers are claude_replay_v1 approximate replays, not official results. Root reproduction: see ../../reports/REPRODUCTION.md.

Direction B REPORT (written as results/REPORT.txt because the harness refused REPORT.md; root may rename)
claude_replay_v1 approximate replay; NOT official results.

SUMMARY
1. L1/3-level book imbalance and microprice-mid do NOT predict future touch prices: |corr|<0.03 on every product except TELLURIUM (~0.1, weak block consistency). On every product, crossing after a top-decile signal averages about -half-spread. Strategy (a), crossing on imbalance, is rejected at the signal stage.
2. Signed print flow in VOUCHER_7300..8100 predicts the same voucher's future bid/ask: day -2 corr 0.19-0.33 at k=100, same sign in 9-10 of 10 day blocks, nearly uncorrelated with past price momentum. No effect in 6800/7000/7200. TELLURIUM flow is a trend proxy (corr with momentum 0.45-0.76, partial corr ~0) and was not pursued.
3. Nominee H1.h20_t3: stop-and-reverse flow follower trading only by crossing, target +-10 on 7 vouchers. Base PnL 11279 (day -2) and 10234 (day -1), 0 errors. Identical under strict/half/next_tick/take_only/price_only. cost and adverse: 8909 / 7244. Sign-flipped control with identical execution: -18403 / -19169.
4. PnL is timing mark (+14834 / +14719) against take edge (-3555 / -4485). Mean signed position stays within +-3.1 of a +-10 position, so this is not a static trend bet. 13 of 14 product-days are positive.
5. Passive MM on these vouchers is heavily adversely selected. Neutral MM base: -16950 / -12593, also negative under strict/half/next_tick. Gating it by flow (H2) or imbalance (H3) cuts the loss but stays negative on both days. H2 and H3 are rejected.
6. Status: proposed. Evidence is 2 days from one generator. Main risks: whether the informed flow persists out of sample, correlated LYCHEE exposure, and the official market_trades semantics.

1. SIGNAL STUDY (day -2 only)
Scripts: signal_study.py -> results/signal_study_day-2.{txt,json}; signal_study_flow.py -> results/signal_study_flow_day-2.{txt,json}.
Scratch EDA on day -2 (not saved as files): momentum vs flow partial correlations, threshold/EWMA feasibility. Its conclusions are recorded in preregistration.json, field signal_study_conclusions_before_running.

Target: change of the touch prices, bid and ask separately. For vouchers 7200+ the spread is always 3, so bid, ask and mid changes are identical and bid-ask bounce cannot arise.
Microprice tested as a fair-value estimate: slope of the future mid change on (micro - mid) is ~0 everywhere except TELLURIUM.
wmid (3-level centre): corr ~0.1 only on AMETHYST and GOLDEN_PEARLS. There the 1-tick reversal (corr 0.5) dominates; that is direction A's territory, and crossing on it still loses.

Flow event study: sign(flow) x de-trended touch change after k ticks; last column is the round trip (cross twice) at k=100.
  voucher     k20   k50   k100  k200  k500   rt@k100
  7300        0.91  2.41  4.38  5.48  7.31   +1.28
  7500        1.43  3.09  4.80  6.97 10.68   +1.58
  7600        1.35  2.93  4.26  5.28  8.85   +1.15
  7900        0.53  1.33  2.12  2.92  4.42   -0.82
  6800        0.32 -0.17 -0.56  1.60  0.98   -6.53
  TELLURIUM   7.8  14.4  18.4  11.2  -19.3  +12.5 (sell-side only; buy events are followed by falls)
The move beats the full 3-tick round trip only at horizons of about 100 ticks or more. That is why H1 holds its position until the opposite signal.
Passive markout, VOUCHER_7600, buyer filled against a sell print: +1.36 after 1 tick, -4.1 after 100 ticks. The prints are informed.

2. HYPOTHESES (preregistration.json, written before any strategy run)
H1: Stop-and-reverse flow follower. EWMA of signed flow (half-life h); target +-10 when |F|>=th, otherwise keep the previous target. Orders cross at the touch, never above L1 volume.
    Edge source: timing mark PnL, paying the half-spread.
    Fails if: day -1 <= 0, or follow - contra <= 0 on either day.
H2: Flow-gated MM vs an identical neutral MM (penny or join, size 5, cap 20).
    Fails if: gated - neutral <= 0 on any day or scenario, or absolute day -1 PnL <= 0.
H3: Imbalance-gated MM vs the same neutral MM. Falsification test; no edge expected.
Selection rule: rank by day -2 base PnL. Nominate only if day -1 base > 0, 0 errors, and the increment over the matched control is > 0 on both days (for H2/H3 also under strict/half/next_tick).

3. ALL TRIALS (round 1 only; no round 2)
Format: base d-2 / d-1 | strict | half | next_tick | take_only (d-2/d-1) | units d-2/d-1 | err
H1 h20_t3 NOMINEE        11279/10234 | 11279/10234 | 11279/10234 | 11279/10234 | 11279/10234 | 2370/2990 | 0
H1 h50_t5_all10          10741/5879  | same as base in all four scenarios                  | 2600/3320 | 0
H1 h50_t5                 9730/7265  | same                                                | 1770/2290 | 0
H1 h100_t8                7384/3934  | same                                                | 1430/1470 | 0
H1 h50_t5_CONTRA ctrl   -14994/-14116 | same                                               | 1770/2290 | 0
H1 h20_t3_CONTRA post-selection control (base only) -18403/-19169 | 2370/2990 | 0
H2 penny_neutral ctrl   -16950/-12593 | -16950/-12593 | -5510/-8106 | -16680/-12506 | 0/0 | 3663/3788 | 0
H2 penny_flow_h50_t5     -3852/-6732  | -3852/-6732  | 363/-2174   | -3264/-5448   | 0/0 | 2229/2427 | 0
H2 penny_flow_h20_t3     -4502/-7820  | -4502/-7820  | 56/-2252    | -5212/-6230   | 0/0 | 2385/2447 | 0
H2 join_neutral ctrl    -13286/-8805  | 0/0          | -3640/-6238 | -10119/-8221  | 0/0 | 3663/3788 | 0
H2 join_flow_h50_t5      -1624/-4304  | 0/0          | 1167/-1320  | 499/-2089     | 0/0 | 2229/2427 | 0
H3 penny_imb_0.33       -14918/-11085 | -14918/-11085 | -4566/-7408 | -14451/-11858 | 0/0 | 3401/3500 | 0
H3 penny_imb_0.6        -16934/-12560 | -16934/-12560 | -5510/-8107 | -16460/-12454 | 0/0 | 3663/3784 | 0
H3 join_imb_0.33        -11516/-7585  | 0/0          | -2876/-5696 | -8102/-8139   | 0/0 | 3401/3500 | 0

Increment over the matched control (d-2 / d-1):
  H1 h50_t5: +24724 / +21381
  H1 h20_t3: +29682 / +29403
  H2 penny_flow_h50_t5: +13097 / +5862 (positive under strict/half/next_tick)
  H3 penny_imb_0.33: +2032 / +1508 (positive under strict/half/next_tick)
  H3 penny_imb_0.6: +16 / +33
These H2/H3 increments mostly reflect trading less against a losing baseline. Loss per unit traded (d-2 / d-1):
  neutral MM         -4.63 / -3.32
  flow-gated MM      -1.73 / -2.77
  imbalance 0.33 MM  -4.39 / -3.17  (essentially unchanged: no signal content)
All gated MMs lose on both days, so H2 and H3 are rejected.

Product selection: the 7-voucher set chosen by the day -2 rule beats all 10 vouchers on day -1 (7265 vs 5879). The 3 excluded vouchers lost 1386 on day -1.

4. STRESS (all 8 scenarios, both days; trajectories in results/records/)
Format: base, strict, half, next_tick, take_only, cost, price_only, adverse | exit value (base) | max DD
H1.h20_t3 d-2:        11279 11279 11279 11279 11279 8909 11279 8909 | 11170 | 1284
H1.h20_t3 d-1:        10234 10234 10234 10234 10234 7244 10234 7244 | 10125 | 660
H2.penny_neutral d-2: -16950 -16950 -5510 -16680 0 -20612 -16950 -7378 | -17133 | 18828
H2.penny_neutral d-1: -12593 -12593 -8106 -12506 0 -16381 -12593 -9974 | -12792 | 12790
H2.join_neutral d-2:  -13286 0 -3640 -10119 0 -16950 -13286 0 | -13470 | 15726
H2.join_neutral d-1:  -8805 0 -6238 -8221 0 -12593 -8805 0 | -9004 | 9100
Nominee call time p50/p99/max: 37/334/7984 us (d-2) and 39/505/4051 us (d-1). traderData <= 493 B.

5. PER-PRODUCT SPLIT, nominee, base
Format: d-2 pnl, mark, take edge, mean pos || d-1 pnl, mark, take edge, mean pos
7300: 3254 3869 -615 +1.1 || 1295 1760 -465 +1.3
7400: 1714 2089 -375 +1.4 || 3088 3733 -645 +1.3
7500: 1336 1771 -435 +3.1 || 2033 2588 -555 -0.5
7600: 2861 3596 -735 +1.1 || 1445 2090 -645 -2.9
7750:  611 1046 -435 +3.0 || 1765 2440 -675 -0.1
7900: 1082 1607 -525 -2.3 ||  628 1363 -735 -0.6
8100:  421  856 -435 +2.3 ||  -20  745 -765 -0.6
TOTAL: 11279 14834 -3555 || 10234 14719 -4485
Passive edge 0, fees 0. Mean |position| ~9.9: the module is almost always at +-10. Vouchers fell on day -2, yet the mean signed position was slightly long in 6 of 7, so the profit is not from the trend.
Full tables: results/summary_tables.txt.

6. CONCLUSIONS
H1: PROPOSED. Trader({'mode':'flow_take','half_life':20,'th':3.0,'size':10}); default products are the 7-voucher FLOW_SET.
  Robust across days, products, fill scenarios (it never rests orders) and the sign-flipped control.
  Limits: 2 days from one generator; the mechanism (informed voucher takers) is inferred, not documented.
  Size 10 was not optimised. Capacity and size scaling: NOT TESTED.
  All 4 H1 variants were positive on both days (3934 to 10234 on day -1), so the parameters are not knife-edge.
H2: REJECTED. H3: REJECTED (as the falsification predicted). Imbalance and microprice signals: REJECTED. TELLURIUM flow: not pursued (trend proxy).

7. COMMANDS
python3 research/B/signal_study.py
python3 research/B/signal_study_flow.py
python3 research/B/test_strategy.py        (15/15 OK, results/test_stdout.txt)
python3 research/B/run_experiments.py > research/B/results/run_experiments_stdout.txt 2>&1
python3 research/B/summarize.py > research/B/results/summary_tables.txt
Post-selection contra control: core.experiment.stress(scenarios=['base']) -> results/postselection_control_stdout.txt and stress.jsonl
Tests cover: cold start; corrupt traderData; one-sided, missing or crossed book; int types; limits and 0 errors on a day -2 prefix; prefix causality (curve and fills); fresh vs persistent instance; mid-day memory loss; classification against the previous tick's book; decay over skipped ticks; own trades excluded from flow; takes at the touch within L1; target held between signals; MM gates and caps; in-engine signal equals the EDA signal.
NOT RUN: round 2 (size 5/20, extra signal delay of 1/5 ticks, contra stress beyond base); day 0 (root only); official-site calibration.

8. ISSUES FOR ROOT
(1) market_trades semantics. The module needs other participants' prints from the previous tick, classified against the book stored from that tick. If the official engine removes prints that filled against our (or an integrated module's) passive orders, or delivers a different time window, the signal changes. The local engine always passes the full tape.
(2) Voucher passive quoting is toxic in this replay: the neutral MM loses in every fill scenario that has fills. Any options/MM direction quoting vouchers 7300+ should check this. It would also compete with H1 for position limits.
(3) Correlated exposure: +-10 in 7 LYCHEE-driven vouchers. Portfolio-level limits are root's call.
(4) stress() with record_dir records all scenarios. For a take-only module, 6 of the files are identical; redundant but harmless (3.8 MB total).
