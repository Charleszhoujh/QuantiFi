LYCHEE-ONLY STRATEGY DESIGN BRIEF (QuantiFi 2026, UTEFA)

GOAL
Design a strategy that trades ONLY LYCHEE (may read any other product as a signal). Maximize out-of-sample PnL on unseen day(s); robustness over fit. Training data: days -2, -1, 0 (10,000 ticks each, timestamps 0..999,900 step 100). Scoring uses OOS PnL averaged over runs, plus breadth/depth/communication.

CONTEST MECHANICS (relevant to LYCHEE)
- Interface: class Trader with run(self, state) called every tick. Return (orders: dict[symbol -> list[Order(symbol, price, qty)]], conversions=0, traderData: str). Buy qty > 0, sell qty < 0.
- state (TradingState) contains order_depths (up to 3 bid/ask levels per product), market_trades/own_trades, position, timestamp, traderData.
- Runs on AWS Lambda: Python globals do NOT reliably persist between ticks. Any history (EMAs, prices, counters) must be serialized into traderData (string, JSON recommended) and parsed next tick. Keep it small.
- Position limit LYCHEE = +/-200 (absolute). If the sum of buy orders (or of sell orders) for a product could breach the limit, ALL orders for that product that tick are cancelled. Size each side against worst case.
- Matching: an order priced at or through the opposite book level fills immediately at book price. Remainder is "left as an outstanding quote" (local replays assume it lives 1 tick). Passive fills: our resting price fills if it is equal to or better than a historical bot trade price at that tick (bot trades happen at the T book, e.g. a bot buying at the ask fills our ask if our ask <= that price). Queue priority vs bots is not modelled; local "strict" stress requires strictly better price.
- Crashes only skip that tick. Book is never empty. No fees officially (we stress with 1 coin/unit).
- PnL = cash + position x final mid at end of day. Each day starts flat with empty traderData.
- Related products: VOUCHER_6800/7000/7200/7300/7400/7500/7600/7750/7900/8100 are LYCHEE call options (8 days to expiry at day -2, no exercise/settlement, limit 50 each). Other products: AMETHYST (fixed fair 10000), TOFFEE_CAKE, JELLY, PAPER_LANTERNS, PEANUT_BUTTER, TELLURIUM, 5 PEARLS, DRAGONFRUIT/GRANADILLA/MANGOSTEEN and FRUIT_BASKET.

LYCHEE MARKET STATS (computed from prices/trades CSVs)
Day -2: mid open 7500.0, close 7390.5 (drift -109.5), range 7378.5-7530.5
Day -1: mid open 7390.0, close 7473.0 (drift +83.0), range 7316.5-7516.5
Day  0: mid open 7473.0, close 7405.5 (drift -67.5), range 7361.5-7497.5
Note: each day opens at the previous day's close (continuous path). Daily drift sign flips; no consistent trend.

Spread (ask1-bid1), all days nearly identical: 4 ticks ~50%, 3 ~25%, 5 ~25% (2 essentially never).
Depth: L1 mean ~25 bid / ~25 ask; L1-L3 total ~60 each side. Level 2 present 91% of ticks, level 3 49%. Symmetric book.
Volatility: per-tick mid change std ~1.35 (all days); 15% of ticks unchanged; 100-tick change std ~11.6-12.4.
Return autocorrelation (1-tick mid changes), lags 1..5:
  Day -2: -0.099, 0.000, -0.002, 0.003, 0.008
  Day -1: -0.087, -0.011, 0.015, -0.004, -0.017
  Day  0: -0.106, -0.012, -0.005, -0.006, -0.020
  -> Only lag-1 is meaningful (about -0.1, consistent with mid bounce / noise around a latent fair value). Essentially a random walk beyond that.
1000-tick block return autocorr: day0 -0.57, day-2 -0.06, day-1 -0.04 (inconsistent; few samples).
Book signals vs next-tick mid change:
  L1 volume imbalance: corr ~0.00 (no signal).
  Microprice - mid: corr ~0.00.
  "Wall mid" (midpoint of deepest visible bid and ask, L3 when present) minus mid: corr +0.067 / +0.091 / +0.075 for next tick (days 0/-2/-1); +0.02-0.03 at 10 ticks. This is the only consistent book signal found; it is small relative to a 3-5 tick spread.
  Mean reversion of (mid - EMA50) on 10-tick forward change: corr -0.01 to -0.03 (weak).
Trades (bot-vs-bot market trades in LYCHEE):
  Day -2: 53 trades, 119 units; Day -1: 63 trades, 168 units; Day 0: 57 trades, 153 units.
  Size 1-4 units (mean ~2.5). ~58-62% at the ask (buyer-initiated), ~38-43% at the bid, 0% inside the spread.
  Buyer/seller fields are blank: NO named participants, so no counterparty-based signal.
  So passive volume is thin: ~150 units/day of bot flow total, roughly 1 trade per 170 ticks. A resting quote one tick inside the spread could only capture fills when a bot trade price crosses it, which never happens inside the spread historically, so passive fills need quotes AT the touch (at best equal to the bot trade price).

CROSS-PRODUCT CORRELATION / LEAD-LAG (1-tick mid changes; "lag k" = other product's change k ticks earlier vs LYCHEE now)
Contemporaneous (lag 0), all three days: VOUCHER_6800 0.75, VOUCHER_7000 0.71-0.72, VOUCHER_7200 0.69-0.72, VOUCHER_7300 0.62-0.67, VOUCHER_7400 0.53-0.58 (then 7500 ~0.48, 7600 ~0.40, 7750 ~0.30). Vouchers move together with LYCHEE in the same tick (no lead).
Lagged (k = 1..5), top-5 per day, all |corr| < 0.04:
  Day -2: VOUCHER_6800 lag5 +0.021, TELLURIUM lag2 +0.019, JELLY lag1 -0.019, VOUCHER_7900 lag5 +0.018, WHITE_PEARLS lag5 +0.018
  Day -1: PEANUT_BUTTER lag1 -0.037, VOUCHER_7200 lag1 +0.025, VOUCHER_7000 lag3 +0.024, PEANUT_BUTTER lag5 -0.023, VOUCHER_7500 lag5 -0.023
  Day  0: VOUCHER_7900 lag2 -0.022, VOUCHER_7600 lag2 -0.021, VOUCHER_7500 lag2 -0.021, VOUCHER_7300 lag5 -0.021, DRAGONFRUIT lag2 -0.017
  Sum of all voucher mid changes at t vs LYCHEE change at t+1: corr 0.005 / 0.008 / 0.018.
  Conclusion: no product leads LYCHEE reliably; the lagged top-5 is different every day and its sign flips (noise level ~0.02 for n=10,000). LYCHEE does not lead others either (|corr| <= 0.03).
  Possible non-lag use of vouchers: deep ITM calls (6800/7000) trade almost 1:1 with LYCHEE, so a voucher-implied LYCHEE price (e.g. C(6800)+6800 minus time value, or put-call style inference from the smile) could serve as an alternative fair value estimate when LYCHEE's own mid is noisy. Not yet tested.

WHAT EXISTING CANDIDATES DO WITH LYCHEE
- Codex peak (SHA 1f22bae1, portal ~327k over 3 days): LYCHEE is reference data only for module F (voucher relative value: Black-Scholes total variance implied from LYCHEE spot and the 7400/7600 calls, used to price 7500). hedge=False, hedge_band=None, so LYCHEE PnL = 0 and units traded = 0 in all replay scenarios.
- Claude candidate: LYCHEE is listed among the 12 untraded products ("no registered method passed the gate on both days, or profits came only from that day's one-way drift"). Rejected for LYCHEE: delta hedging the voucher book (cost exceeded benefit) and making markets around a model price (lost on day -1). Its voucher module carries an unhedged net delta of about 2-6 LYCHEE equivalents; LYCHEE delta mark-to-market contributed only 5.2k / 1.3k on days -2 / -1.
- DeepSeek: LYCHEE untraded in the final (PnL 0). Its generic naive maker control made +1,922 local, 55% of that from LYCHEE, but lost -9,171 under adverse (strict + half + cost) fill assumptions, so it was rejected. All imbalance/flow signals had hit rate ~50% and |corr| <= 0.04. A LYCHEE delta hedge for its voucher trade also lost money.
=> Nobody has a working LYCHEE strategy yet. The main risks are passive-fill assumptions and one-day drift luck.

CONSTRAINTS / ASKS FOR YOUR DESIGN
1. Trade only LYCHEE (limit 200). Any other product may be read as a signal.
2. The edge must survive: (a) passive fills only on equal-or-better price vs actual bot trades, possibly at half size; (b) a 1 coin/unit cost stress; (c) a one-tick delay.
3. Avoid edges that come from daily drift direction (drift flips sign day to day).
4. Ideas worth evaluating, from most to least plausible:
   - a fair-value estimate blending wall-mid, a short EMA, and the voucher-implied spot; take liquidity only when the book crosses fair by more than X (lag-1 reversal about -0.1);
   - quoting at the touch with an inventory skew, to capture the ~150 units/day of bot flow (expected size is small);
   - intraday mean reversion on a longer horizon (100-1000 ticks), position-scaled up to 200;
   - a voucher-surface (smile) signal for LYCHEE mispricing.
   Please give expected-edge arithmetic per idea (edge per unit vs half spread of ~2).
5. Output: a concrete algorithm (state kept in traderData, parameters with justification, order sizing vs limit), a list of failure modes, and a validation plan: walk-forward fit on 2 days, test on the 3rd, plus a parameter sensitivity of ±25%.
