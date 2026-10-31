> Provenance: written by research agent D as results/REPORT.txt (its tool harness refused .md writes); root copied it here verbatim on 2026-10-28. Numbers are claude_replay_v1 approximate replays, not official results. Root reproduction: see ../../reports/REPRODUCTION.md.

# Direction D — mean reversion (claude_replay_v1, local approximation, not official results)
(Written to results/REPORT.txt because the harness refused research/D/REPORT.md.)

SUMMARY (<=10 lines)
1. The trap is real. On day -2, for every product and every causal EMA anchor, entering by taking after |z|>2 and exiting by taking loses money over 1-50 ticks.
2. The exception is TOFFEE_CAKE at slow scales. Its price is stationary on 100-1000 tick scales (std of the k-tick change flattens at about 32; OU time about 185 ticks; slope -0.93 at h500), and the swings exceed its 14-tick spread.
   A take-only z band (anchor EMA hl500, entry |z|>=1.5, exit at the anchor) made 9024 / 11632 (days -2/-1, base). Every execution scenario gives the same number. The momentum flip control lost -20287 / -27522.
3. PAPER_LANTERNS reversion is whole-book noise (sd about 1) inside a 4-tick spread. Band trading lost about -32k per day.
   A fast fair-value filter (hl2) on a touch-join MM made 5033 / 4136, against 4756 / 3114 for the neutral join. It is fully passive and about 90% inventory mark. Strict = 0, and when quoting 1 inside the touch the filter is worse than the neutral baseline under strict.
4. LYCHEE, PINK_PEARLS and vouchers are not adopted (the scope check of the same band lost overall on both days).
5. Nominee (preregistered rule): TOFFEE band (+1000-tick time stop) + PAPER_LANTERNS FV-MM.
   Status: proposed. The TOFFEE leg is robust to fill assumptions; the LANTERNS leg is conditional.

EVIDENCE BEFORE ANY STRATEGY (day -2 EDA; results/eda_*.txt)
- eda_tradable_reversion.py: spreads, ac1 of mid/bid/ask/wall-mid changes, conditional round trips after |z|>x.
  - PAPER_LANTERNS: ac1 is -0.50 for bid and for ask, so this is whole-book movement, not one-sided flicker. Mid reversion after 2-sd events is 1.4-1.8, below the 4-tick spread. The best take-take is -2.16 per unit (h1).
  - TOFFEE_CAKE: take-take after |z|>2 is +28.6 per unit at h500 (hl500 anchor) and +11.4 (hl100). It is negative at h<=50.
  - PINK_PEARLS, LYCHEE, vouchers: take-take is about -spread at h<=50. Some slow-anchor h200-500 cells are positive but inconsistent.
- eda_targeted.py:
  - Only PAPER_LANTERNS has an anchor (EMA hl1-5) that forecasts mid_{t+1..5} better than mid_t (MSE ratio 0.60-0.71). Every other product is >=1.
  - Ask<=fast-anchor events: take-take is always negative.
  - Prints carry little short-horizon adverse selection.
- eda_slope.py: TOFFEE slope at h100 is -0.39 (halves -0.39/-0.42) and at h500 is -0.93 (-0.99/-0.90). LYCHEE and voucher h500 slopes rest on about 20 overlapping episodes.

HYPOTHESES (preregistration.json; preregistration_round2.json)
H1  TOFFEE slow-anchor z band, take in/out.
    Expected source: mark > take cost.
    Failure: mark <= |take edge|, flip not worse, or a trending day.
H2  Same signal, passive in/out.
    Expected source: passive edge + mark.
    Failure: too few fills; collapse under strict/half; not > touch-join.
H3  PAPER_LANTERNS fair-value MM (fast hl2 vs slow hl20) vs band trading.
    Expected source: passive edge filtered by fair value.
    Failure: not > join MM; inventory mark dominates.
Round 2 changed a single factor each, based on round-1 evidence:
- H1: time stop max_hold=1000. TOFFEE round trips average about 190 ticks; non-reverting products held 1000-2161 ticks.
- H3: improve=1. Every H3 config was 0 under strict.

ALL TRIALS (base, product PnL; each cell is d-2/d-1; mark | take edge | passive edge | mean pos | longest hold | round trips)
h1_flip_control (ctrl)     -20287/-27522  mark -13125/-18397  take -7163/-9126   pass 0        pos -0.7/-3.8   hold 515/832    RT 10/13
h1_hl500_z2                  5905/9551    mark 13187/18589    take -7282/-9038   pass 0        pos 0.7/3.8     hold 514/832    RT 10/13
h1_hl500_z1.5 (sel.)         9024/11632   mark 24061/28943    take -15037/-17311 pass 0        pos -1.9/1.9    hold 554/832    RT 22/24
h1_hl100_z2                 -6131/-676    mark 10811/21835    take -16942/-22511 pass 0        pos 0.5/0.7     hold 304/231    RT 24/33
h1_scope_check (ctrl)      -11561/-1190   LYCHEE -14077/-1530, PINK -262/-336, V7500 400/-1483, V7600 1456/945, V7750 922/1214
h2_join_neutral (base)       1062/2122    mark -75/919        take 0             pass 1137/1203 pos -6.8/-12.6  hold 5893/9158  RT 4/3
h2_pband_join                 771/1342    mark 528/1001       take 0             pass 243/341   pos 3.6/-2.0    hold 4275/2756  RT 2/2
h2_pband_improve1             736/1293    mark 528/1001       take 0             pass 208/292   pos 3.6/-2.0    hold 4275/2756  RT 2/2
h2_pband_join_z1             2147/2309    mark 1720/1781      take 0             pass 428/528   pos 4.3/-3.8    hold 4275/2756  RT 2/5
h2_hybrid_take_in_pass_out   2054/2333    mark 2394/2604      take -765/-859     pass 425/588   pos -43.4/42.9  hold 9700/9700  RT 0/0
h3_join_neutral (base)       4756/3114    mark 4223/2593      take 0             pass 533/521   pos 11.5/-12.0  hold 4014/7543  RT 10/7
h3_band_take_hl5           -32073/-33522  mark 24807/25735    take -56880/-59257 pass 0        pos 0.2/0.0     hold 18/27      RT 424/438
h3_fv_hl2 (sel.)             5033/4136    mark 4565/3636      take 0             pass 469/500   pos 16.8/-15.2  hold 5116/7554  RT 7/5
h3_fv_hl20_slow              3055/3827    mark 2685/3438      take 0             pass 371/389   pos 16.8/-22.5  hold 9844/8162  RT 1/3
h3_fv_hl2_skew               2772/629     mark 2316/149       take 0             pass 456/481   pos 9.2/-3.6    hold 4482/3317  RT 12/12
r2 h1r2_hl500_z1.5_hold1000  9024/11632   identical to h1_hl500_z1.5 (the stop never triggered)            RT 22/24
r2 scope z1.5 no stop (ctrl) -6245/-2239  holds 876-2266
r2 scope z1.5 hold1000 (ctrl)-3798/-5957  holds <=1009
r2 h3r2_join_improve1_neutr  4492/2859    mark 4223/2592      take 0             pass 269/266   pos 11.5/-12.0
r2 h3r2_fv_hl2_improve1      4887/3997    mark 4564/3636      take 0             pass 322/361   pos 16.8/-15.2
All configs had 0 errors on both days.

STRESS (product PnL d-2/d-1)              base         strict       half         next_tick    take_only    cost         adverse
h1_hl500_z1.5 = nominee TOFFEE leg         9024/11632   9024/11632   9024/11632   9024/11632   9024/11632   6774/9182    6774/9182
h1_flip_control                          -20287/-27522  same         same         same         same        -21337/-28822 -21337/-28822
h2_join_neutral                            1062/2122    0/0          300/911      -186/1256    0/0          905/1954     0/0
h2_pband_join_z1                           2147/2308    0/0          851/1026     692/1498     0/0          2086/2232    0/0
h2_pband_improve1                           736/1292    736/1292     333/598      418/770      0/0          701/1244     318/574
h3_join_neutral                            4756/3114    0/0          1721/2063    2924/1883    0/0          4492/2858    0/0
h3_fv_hl2 = nominee LANTERNS leg           5033/4136    0/0          1875/2450    3808/2371    0/0          4809/3892    0/0
h3r2_join_improve1_neutral                 4492/2858    4492/2858    1616/1963    3733/2958    0/0          4228/2604    1511/1863
h3r2_fv_hl2_improve1                       4887/3996    2507/1318    1816/2398    5031/3435    0/0          4663/3754    699/1038
NOMINEE TOTAL                             14057/15768   9024/11632   10899/14082  12832/14003  9024/11632   11583/13075  6774/9182
Other nominee figures:
- Exit value (visible depth): 13423/15590.
- Max drawdown: 3825/3217.
- Call time p99 was 17-177 us. Single-call max spikes reached 21.7 ms in some runs, most likely OS or GC noise.
- traderData was at most 108 bytes.

NOMINEE PER-PRODUCT SPLIT (base, d-2/d-1)
TOFFEE_CAKE:
- PnL 9024/11632 = mark 24061/28942 + take edge -15037/-17310 (crossing cost about 6.7 per unit).
- Mean signed position -1.9/+1.9; longest hold 554/832 ticks.
- 22/24 round trips of about 190 ticks each; end position -50/+50.
PAPER_LANTERNS:
- PnL 5033/4136 = mark 4564/3636 + passive edge 468/500.
- Mean signed position +16.8/-15.2; holds 5116/7554 ticks. The PnL is inventory carry, not captured reversion.

CONCLUSIONS
- H1 adopted (TOFFEE_CAKE).
  - Mark beats the take cost by about 1.6x.
  - The sign test holds: band +9024/+11632 against flip -20287/-27522.
  - It needs no passive fills. The cost scenario still gives 6774/9182.
  - hl100 fails (too many round trips, so cost exceeds mark): the effect lives on the 200-1000 tick scale.
  - Valid only while TOFFEE stays mean-reverting. Two days is weak evidence.
  - The time stop never triggered in-sample. On non-reverting products its effect was mixed (better on d-2, worse on d-1). It caps holding time, not losses.
- H2 not adopted.
  - Fill-starved: 35-77 units per day.
  - Only z1 and hybrid beat the touch-join neutral baseline, and both are far below H1.
  - The hybrid gets stuck at +-43 average inventory.
- H3 weakly supported, conditional.
  - The fast fair value beats the neutral join in base (+277/+1022), half and next_tick.
  - It does not beat it under strict when quoting inside the touch (2507/1318 against 4492/2858).
  - The slow fair value (hl20) is worse than join on d-2.
  - Band trading is catastrophic (-32k).
  - The PnL is mostly inventory mark.
- Scope: the band is not generic. LYCHEE and PINK_PEARLS lose; vouchers are mixed.

ISSUES FOR ROOT
1. The TOFFEE band takes 2250-2450 units per day at L1, so it is sensitive to official matching and depth. Calibrating against the official site would be worth it.
2. The LANTERNS leg overlaps with any generic PAPER_LANTERNS MM. The TOFFEE leg conflicts with any TOFFEE module, because both control the position. Assign one module per product.
3. Holding +-50 TOFFEE at day end costs about 550/130 of exit value against mark.
4. Direction E's JELLY slow z reversion matches the TOFFEE mechanism. The same test is recommended: mark vs take cost, plus a flip control.
5. The harness refused research/D/REPORT.md; this file is the report.

COMMANDS
python3 research/D/eda_tradable_reversion.py; python3 research/D/eda_targeted.py; python3 research/D/eda_slope.py
python3 research/D/test_strategy.py            (16 tests OK; results/test_stdout.txt)
python3 research/D/run_experiments.py round1   (results/round1_stdout.txt)
python3 research/D/run_experiments.py round2   (results/round2_stdout.txt)
python3 research/D/run_experiments.py select   (results/selection.json, select_stdout.txt)
python3 research/D/run_experiments.py final    (results/stress_final.jsonl, records/*.json.gz, final_stdout.txt)
Default Trader() reproduces the nominee: 14057.0/15767.5, 0 errors (results/default_config_check.txt).

NOT EXECUTED
- Day 0: not accessible (root only).
- Official-site calibration: not executed.
- Integration with other modules: not executed.
- TOFFEE robustness beyond days -2/-1: not executed (no data).
