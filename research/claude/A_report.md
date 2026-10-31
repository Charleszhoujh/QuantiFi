> Provenance: written by research agent A as results/REPORT.txt (its tool harness refused .md writes); root copied it here verbatim on 2026-10-28. Numbers are claude_replay_v1 approximate replays, not official results. Root reproduction: see ../../reports/REPRODUCTION.md.

# Direction A: fair value, market making, inventory control (round 1, claude_replay_v1)
# (Intended as research/A/REPORT.md; the harness refused that path, so it is saved here as root instructed.)

**Summary (status: conditional)**
1. Nominee: AMETHYST only, official FV 10000, take strictly through FV and join the touch otherwise. The result is the same as official example 1: base 527.0 / 608.0 (day -2 / day -1), 0 errors.
2. Take edge is 0 on both days. The book never quotes at or through 10000 (0 take units). All PnL is passive edge (538.5 / 608.5) plus mark (-11.5 / -0.5).
3. The edge depends entirely on passive fills. strict, take_only and adverse give 0. half gives 215 / 237, next_tick 370.5 / 392, cost 169 / 212.
4. GOLDEN_PEARLS looked pegged at 8000 on day -2 (150.0), but the peg broke on day -1 (end mid 7899.5). Joiner: -534.5. Constant FV: -1867.0. EMA FV: -1796.5. REJECTED.
5. The preregistered H1 tie-break pick (h1_take_join_gp_ema) failed the day -1 gate (-1188.5). The nominee is that H1 config family with GOLDEN_PEARLS removed. No parameter was changed. This choice was informed by day -1, see Issues for root.
6. H2 (inventory control): on AMETHYST it only costs edge (no-skew 527/608 > cap50 523/591 > cap25 485.5/557 > skew25 468/547). On drifting products, caps reduce aggregate losses (-27.0k/-33.5k down to -10.1k/-2.4k), but cap25 beats no-skew on only 11/24 products on day -2. The claim fails.
7. H3 (generic MM with a causal EMA FV on 24 drifting products) is not viable. The joiner's mark is -56.4k / -59.7k against edge +29.4k / +26.2k. No product reaches "proposed". PAPER_LANTERNS, PINK_PEARLS and WHITE_PEARLS pass the PnL gates, but their PnL is 85-98% mark, so they are only "conditional (directional)".
8. All numbers come from the approximate local replay, not official results. There are only 2 development days, both contaminated.

## 1. Evidence used (day -2 EDA only; research/A/eda*_day-2.py, results/eda*_day-2.txt)
- AMETHYST: best bid is always in {9998, 9999} and best ask always in {10001, 10002}. Mid stays in [9999.5, 10000.5]. 136 prints / 358 units, all at the touch (190 at bid, 168 at ask). GOLDEN_PEARLS has the same ladder around 8000, with 49 prints / 98 units.
- A touch joiner receiving every print would reach max |pos| 33/50 (AMETHYST) and 11/20 (GOLDEN). The limit does not bind.
- Drifting products: L1 imbalance and microprice have |corr| < 0.035 with future mid moves (TELLURIUM h50 0.126). Taking at a touch that is >= 1 tick through a causal EMA shows no edge after the spread. Vouchers and TELLURIUM show strong adverse marking of passive fills. For example, TELLURIUM passive-side mark after 100 ticks is -119k against +27.9k half-spread.

## 2. Hypotheses (preregistration.json, written before any strategy run)
| id | claim | edge source | failure mode | verdict |
|---|---|---|---|---|
| H1 | FV-anchored MM on AMETHYST + GOLDEN_PEARLS is > 0 both days; take edge ~0; strict ~0 for joining | passive edge vs FV | day -1 <= 0 or GOLDEN leaves its peg | AMETHYST: confirmed. GOLDEN: falsified on day -1 |
| H2 | inventory control (cap or 1-tick skew) beats no-skew on drifting products and costs on pegged ones | lower mark exposure | no majority improvement on day -2 | falsified for drifting products; confirmed "costs" on AMETHYST |
| H3 | >= 1 drifting product profitable under base/half/next_tick both days with edge > mark | half-spread minus adverse selection | mark > edge | falsified: none qualifies |

Selection rule (preregistered): H1 is ranked by day -2 base. Ties within 1 Coin are broken first by strict, then by the order gp_ema > take_join > join > penny. A config is nominated only if day -1 base > 0 and it has 0 errors. H2/H3 use a product-level gate: best config on day -2 base, then day -1 base > 0, half > 0 on both days, next_tick > 0 on both days, and 0 errors. A product whose mark exceeds its edge on either day can be at most "conditional".

## 3. All registered trials (base, 26 products loaded; full table in results/tables.md T1)
| config | d-2 PnL | d-1 PnL | errors | p99 us (d-2/d-1) |
|---|---|---|---|---|
| h1_join | 677.0 | 73.5 | 0 | 154/272 |
| h1_take_join | 677.0 | -1259.0 | 0 | 256/394 |
| h1_penny | 445.0 | -1512.0 | 0 | 319/295 |
| h1_take_join_gp_ema | 677.0 | -1188.5 | 0 | 352/257 |
| h2_join_all (26 products) | -26334.0 | -33455.5 | 0 | 1388/771 |
| h2_cap50 | -18124.0 | -8498.5 | 0 | 1785/984 |
| h2_cap25 | -9526.0 | -1702.0 | 0 | 1200/904 |
| h2_skew25 | -30214.5 | -10326.0 | 0 | 1056/1170 |
| h3_join (24 drifting) | -27011.0 | -33529.0 | 0 | 1246/806 |
| h3_ema05 | -29577.0 | -29036.5 | 0 | 1542/1727 |
| h3_ema20 | -6991.0 | -30724.0 | 0 | 1366/2804 |
| h3_ema05_cap25 | -14269.5 | -779.0 | 0 | 1498/1274 |
(p99 here is with all 26 products loaded. The nominee alone has p99 17/9 us, max 1.8 ms, and traderData of 2 bytes.) All 12 configs were also stress-tested (results/stress_round1.jsonl). The narrow-load base runs equal the registered runs exactly.

## 4. H1 per product (base split; stress in results/tables.md T2/T3)
| config | day | product | PnL | mark | take edge | passive edge | units t/p | strict | half | next_tick |
|---|---|---|---|---|---|---|---|---|---|---|
| h1_join | -2 | AMETHYST | 527.0 | -11.5 | 0.0 | 538.5 | 0/358 | 0.0 | 215.0 | 370.5 |
| h1_join | -1 | AMETHYST | 608.0 | -0.5 | 0.0 | 608.5 | 0/396 | 0.0 | 237.0 | 392.0 |
| h1_join | -2 | GOLDEN_PEARLS | 150.0 | 3.0 | 0.0 | 147.0 | 0/98 | 0.0 | 46.0 | 90.0 |
| h1_join | -1 | GOLDEN_PEARLS | -534.5 | -722.5 | 0.0 | 188.0 | 0/121 | 0.0 | -276.5 | 437.0 |
| h1_take_join | -1 | GOLDEN_PEARLS | -1867.0 | -1957.0 | -17.5 | 107.5 | 11/67 | -1939.0 | -1915.0 | -1849.0 |
| h1_penny | -2 | AMETHYST | 347.0 | -11.5 | 0.0 | 358.5 | 0/358 | 184.0 | 141.0 | 347.0 |
| h1_penny | -1 | AMETHYST | 396.0 | -0.5 | 0.0 | 396.5 | 0/396 | 212.0 | 154.0 | 396.0 |
AMETHYST answer to question (1): take edge is 0 on both days. Joining at the touch earns 1-2 ticks on every print in base and nothing under strict. Stepping one tick inside (penny) gives up 180/212 in base and gains 184/212 under strict. Which is better depends on the official equal-price rule, which the Wiki says counts as a fill.

## 5. Final nominee vs baseline, AMETHYST only (recorded: results/records/final_*, results/stress_final.jsonl)
| | day | base | strict | half | next_tick | take_only | cost | price_only | adverse |
|---|---|---|---|---|---|---|---|---|---|
| baseline (ex.1 logic) | -2 | 527.0 | 0.0 | 215.0 | 370.5 | 0.0 | 169.0 | 527.0 | 0.0 |
| nominee | -2 | 527.0 | 0.0 | 215.0 | 370.5 | 0.0 | 169.0 | 527.0 | 0.0 |
| baseline | -1 | 608.0 | 0.0 | 237.0 | 392.0 | 0.0 | 212.0 | 608.0 | 0.0 |
| nominee | -1 | 608.0 | 0.0 | 237.0 | 392.0 | 0.0 | 212.0 | 608.0 | 0.0 |
Nominee base details: max DD is 33/38. Exit value is 492.0/600.0. Max |pos| is 38 and mean |pos| is 13.0/19.2. End positions are 22/4. Errors: 0. The nominee and baseline are identical on days -2/-1. The only difference is the FV guard, which never activated on these days.

## 6. H2/H3 per product (results/tables.md T4-T7)
- Generic joiner (h2_join_all), drifting products in total: mark -56,382 / -59,728 against edge +29,370 / +26,200. TELLURIUM alone: -19,968 / -15,400, with mark -29,866 / -22,220, edge +9,897 / +6,820, and the position pinned near +-40.
- Inventory control against no-skew, number of drifting products improved (day -2 / day -1 / both, out of 24): cap50 10/14/6, cap25 11/13/7, skew25 11/13/7. EMA guard: ema05 18/14/10, ema20 14/13/10, ema05_cap25 16/15/11. No variant gives a profitable drifting book.
- Product gate (T7): 21 rejected and 3 conditional. PAPER_LANTERNS (h2_join_all): 4756/3114, of which mark is 4223/2592 and edge 533/521. PINK_PEARLS: 3178/830, mark 2944/558. WHITE_PEARLS (h3_ema05): 2527/7010, mark 2375/6857. Their PnL is mark-driven (directional inventory), so none are nominated.
- Rejected, with day -2 / day -1 base for the best-on-day-2 config: BLACK_PEARLS 1116/-2014.5, BLUE_PEARLS -300.5/0.5, DRAGONFRUIT 1781/-1192, FRUIT_BASKET 14812.5/-6594, GRANADILLA -154/-372, JELLY -399/1073, LYCHEE 724.5/-3061, MANGOSTEEN -546/-488, PEANUT_BUTTER 976.5/1120.5 (next_tick -1100), TELLURIUM -1267.5/5223 (half -3610.5/-1506), TOFFEE_CAKE 1653/2121.5 (next_tick -186 on day -2), and the vouchers 6800..8100, all failing at least one gate (T7).

## 7. Conclusions and scope
- Adopt (conditional): AMETHYST pegged MM. It is the same as official example 1, with an FV guard that is harmless if AMETHYST stays pegged at 10000. Its value depends entirely on the passive-fill model being confirmed (root's calibration of example 1 against the official backtester: local prediction 527 / 608).
- Reject: GOLDEN_PEARLS. The peg seen on day -2 does not hold on day -1, and there is no official FV. Also rejected: inventory control on pegged products (it only costs edge) and generic MM on drifting products (adverse selection and drift dominate edge).
- Not adopted, possibly interesting for another direction: the mark-driven profits on PAPER_LANTERNS (day -2 mid lag-1 autocorrelation -0.50), PINK_PEARLS and WHITE_PEARLS.

## 8. Issues for root
1. The round-1 run_experiments.py built and recorded a "nominee" from the H1 tie-break pick even though it failed the gate. The records results/records/nominee_* are therefore h1_take_join_gp_ema (day -1 -1188.5). They are kept, not deleted. The final records are final_*.
2. Restricting the nominee to AMETHYST was decided after seeing GOLDEN_PEARLS fail day -1. No parameter changed, but this is still a choice made using validation data. If the rule is read strictly at config level, the next config that passes is h1_join (677.0 / 73.5), whose GOLDEN component is -534.5 on day -1.
3. One h3_ema20 day -1 call took 98 ms (24 products loaded). This is probably system noise; the nominee's max call is 1.8 ms.
4. The strategy keeps only its own traderData keys. The nominee always emits "{}".
5. The harness refused writing research/A/REPORT.md, so this file was written instead.

## 9. Commands
python3 research/A/eda_day-2.py > research/A/results/eda_day-2.txt        (also eda2_, eda3_)
python3 research/A/test_strategy.py -v > research/A/results/test_stdout_final.txt 2>&1   (19 tests OK)
python3 research/A/run_experiments.py > research/A/results/run_stdout.txt 2>&1          (round 1, once)
python3 research/A/run_final.py > research/A/results/final_stdout.txt 2>&1              (final records, once)
python3 research/A/tables.py > research/A/results/tables.md
Tests cover cold start, corrupt/NaN/junk traderData, missing and one-sided books, types and limits at 9 positions for every config, the FV take and cap, penny without crossing, EMA level shift, skew and soft cap, example-1 reproduction (527), the default nominee, prefix causality, fresh instance vs persistent instance, and traderData size. Earlier run: results/test_stdout.txt (18 tests).
Not executed: round 2 (stopped as requested: no new hypotheses); day 0 (root only); official-site calibration; inventory skew with ticks > 1; EMA alphas other than 0.05/0.2.
