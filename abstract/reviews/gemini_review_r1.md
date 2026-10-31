### (1) Official Verdict: **PASS**

`Team1QuantiFi2026.pdf` **PASSES** as an official competition submission and is already a strong contender for the Top 8 finals. It strictly satisfies all hard deliverables in `rules.txt`: it is exactly 5 pages long (within the 5-page maximum), integrates structured prose with 3 summary tables and 3 performance figures, directly addresses the judging pillars, and maintains 100% numerical fidelity to your ground-truth backtest results (`523,191.5` total PnL across 18 traded products).

However, to maximize your score with industry judges from CPP Investments and National Bank, you must fix several typesetting errors, plot-label mismatches, and structural redundancies before submitting.

---

### (2) Criterion-by-Criterion Evaluation (1–10)

| Criterion | Score | Judge's Assessment |
| --- | --- | --- |
| **Breadth** | **9.0 / 10** | **Strengths:** Active deployment across 18 of the 26 products spanning five distinct quantitative strategy families (market making, cross-strike IV smile relative value, EMA z-score mean reversion, linear/breakout trend following, and blended fixed/adaptive mean reversion). Untraded assets (`LYCHEE` and the non-traded pearls) are smartly utilized as cross-asset pricing inputs rather than ignored.

<br>

<br>**Weakness:** The abstract states *which* 8 products are untraded, but never briefly explains *why* they were excluded (e.g., why wing vouchers `6800`/`8100`, the underlying `LYCHEE`, or `FRUIT_BASKET` components `DRAGONFRUIT`/`GRANADILLA` were left unexecuted).

 |
| **Depth** | **8.0 / 10** | **Strengths:** Strong domain alignment between asset microstructure and model choice—such as Avellaneda-Stoikov inventory skewing on `GOLDEN_PEARLS`, quadratic implied-volatility smile fitting across 8 voucher strikes, frozen-anchor exits on `PEANUT_BUTTER`, and dual-leg regime hedging (`25 + 25` lots) on `TOFFEE_CAKE` and `JELLY`. Engineering safeguards (`traderData` compression to `4.98 KB`, duplicate-callback guard, per-module `try/except` isolation, and in-flight order tracking over `5` ticks) show strong production maturity.

<br>

<br>**Weakness:** Section 2 reads like a parameter lookup list rather than an analytical justification. It lacks core mathematical equations (e.g., the reservation price formula, the quadratic IV fit specification, or the hysteresis gate equation) and does not explain *how* empirical data from days `-2, -1, 0` motivated those specific model families.

 |
| **PnL** | **9.0 / 10** | **Strengths:** Exceptional in-sample performance (`523,191.5` total PnL: `225,130` on Day -2, `188,395` on Day -1, `109,666.5` on Day 0). All 18 traded products are net profitable, and 53 of 54 product-days are positive (only `MANGOSTEEN` on Day -2 lost `-538`).

<br>

<br>**Weakness:** Since official PnL is ranked on average out-of-sample (OOS) runs, judges will scrutinize OOS fragility: 41.6% of total PnL relies on 3 trending products, daily PnL decays by more than 50% from Day -2 to Day 0, and static centres (`10000`, `5000`, `2000`) plus fixed `KILL_DD` thresholds (`20,275.5`, `40,680`, `765`) are calibrated on only 2–3 days. Highlighting Section 3.3's self-awareness is great, but the OOS defense can be framed more proactively.

 |
| **Communication** | **7.5 / 10** | **Strengths:** Crisp, concise writing with zero fluff; transparent breakdown by strategy family (Table 3); honest discussion of concentration, decay, and calibration limits.

<br>

<br>**Weakness:** Dragged down by avoidable execution flaws: broken math symbols in Section 3.1, a stray pipe character in Section 2.5, wrong currency labels (`SeaShells`) on Figures 1 and 2, heavy redundancy between tables and text/figures, and unformatted internal code names (`_GP (mm_as)`, `H3 (pb2)`) in Table 1.

 |

---

### (3) Concrete, Prioritized Changes

#### Priority 0: Critical Fixes (Typos, Math Rendering & Plot Errors)

1. **Fix missing mathematical operators in Section 3.1 (Page 3):**
* *Current:* `intraday PnL = cash from own fills + position  mid` (missing multiplication sign) and `if peak PnL exceeds KILL_DD` (missing minus sign).


* *Fix:* Render explicitly in LaTeX as $\text{PnL}_t = \text{cash}_t + \text{pos}_t \times \text{mid}_t$ and $\text{peak}_t - \text{PnL}_t > \text{KILL\_DD}$.




2. **Remove the stray pipe typo in Section 2.5 (Page 3):**
* *Current:* `Adaptive leg: trades | $|z|\ge2$ around a slow EMA anchor`.


* *Fix:* Remove the stray `|` so it reads `trades $|z| \ge 2$ around a slow EMA anchor`.




3. **Fix the currency label in Figures 1 and 2 (Page 4):**
* *Current:* Figure 1's y-axis reads `Cumulative PnL (k SeaShells)` and Figure 2's x-axis reads `PnL (SeaShells)`. In `rules.txt`, the competition currency in `trades.csv` is `"COINS"` (not IMC Prosperity's "SeaShells").


* *Fix:* Update `abstract/pnl.py` so the axis labels read `Cumulative PnL (k COINS)` (or simply `Cumulative PnL (k)`) and `PnL (COINS)`.




4. **Clarify the x-axis unit in Figure 3 (Page 5):**
* *Current:* The x-axis is labeled `day index (M ticks)` from `0` to `3`. Per `rules.txt`, `timestamp` runs from `0 to 999,900 in steps of 100` (meaning 10,000 ticks or $10^6$ timestamp units per day).


* *Fix:* Relabel the x-axis to `Trading Day (Day -2, Day -1, Day 0)` with vertical dashed day separators matching Figure 1.




5. **Standardize team numbering (`Team 1` vs. `Team01`):**
* *Check:* Your PDF header and filename use `Team 1` / `Team1QuantiFi2026.pdf`, whereas `rules.txt` specifies `Team##QuantiFi2026.pdf` and `brief.md` notes confirming `1` vs `01`. Verify the exact two-digit format required by the Google Form so your script and PDF match.





#### Priority 1: Structure, Redundancy & Space Optimization

1. **Eliminate the duplication between Table 1 and Sections 2.1–2.5 (Pages 2–3):**
* *Issue:* Table 1 lists every module's method and parameters (`cap 50, clip 5`, `width 2, skew 2, cap 20`, `hl 500, z 2, cap 40`, etc.), and Sections 2.1–2.5 simply repeat those exact same numbers in bullet points.


* *Fix:* Keep all parameter numbers in Table 1. Rewrite Sections 2.1–2.5 to explain **economic rationale and microstructure mechanics**—*why* each product exhibits that behavior, *how* the signal is constructed mathematically, and *why* passive making vs. aggressive taking was chosen.




2. **Eliminate the duplication between Table 2 and Figure 2 (Page 4):**
* *Issue:* Page 4 stacks an 18-row daily PnL table (Table 2) directly above a 18-bar horizontal stacked chart (Figure 2) displaying the exact same numbers.


* *Fix:* Keep Table 2 (as it provides exact figures including smaller market-making gains like `620` on `GOLDEN_PEARLS` and `-538` on `MANGOSTEEN` Day -2 that are invisible on a `0–100,000` bar scale), or replace Figure 2 with a chart showing **PnL share and daily consistency by Strategy Family** (visualizing Table 3 across Days -2, -1, and 0).




3. **Clean up raw code identifiers in Table 1 (Page 2):**
* *Issue:* Column 2 (`Module`) exposes raw script shorthand like `A50 (af)`, `_GP (mm_as)`, `H3 (pb2)`, and `H2` without context.


* *Fix:* Rename the column `Script Module ID` and format entries cleanly in monospace font (e.g., `mm_as`, `S_quad7`, `P_line50_gate`, `blend_25_25`) so judges grading your Python file alongside the abstract can immediately map sections of `Team1QuantiFi2026.py` to Table 1.





#### Priority 2: Logical Flow, Tone & Analytical Depth

1. **Reframe the opening of Section 1 (Page 1):**
* *Issue:* Sentence 2 states: *"The rules do not mention drawdown or Sharpe ratio. We therefore aimed for broad, well-motivated coverage..."*. To an institutional Portfolio Manager judge, saying "the rules don't mention drawdown or Sharpe" sounds like an excuse to ignore risk—which contradicts the fact that you engineered a dedicated drawdown kill switch in Section 3.1!


* *Fix:* Frame this around **OOS expectancy**: *"Because teams are ranked by average PnL across multiple out-of-sample runs, our architecture maximizes expected total return across uncorrelated alpha streams while enforcing strict intraday drawdown guards to prevent single-regime tail losses from eroding OOS averages."*




2. **Add compact mathematical formulations in Section 2 (Pages 2–3):**
* Judges evaluate **Depth** from the script and abstract. Adding 3–4 concise inline formulas will elevate the technical rigor using facts already in `brief.md`:


* **EMA z-score (`PEANUT_BUTTER`, `MANGOSTEEN`, `TOFFEE_CAKE`, `JELLY`):** Explicitly write how the EMA anchor ($\text{hl} = 500$ or $3000$) and EMA standard deviation ($\text{hl} = 1000$) define $z_t$, and contrast `PEANUT_BUTTER`'s frozen-anchor exit ($\text{anchor}_{t_{\text{entry}}}$) with standard mean reversion.


* **Voucher Smile RV (`S_quad7`):** Write the quadratic implied volatility specification across the $\ge 4$ active strikes ($T = 8\text{ days}$) and the mispricing execution condition $\vert{}\Delta P_i\vert{} > 7.0$.


* **Kill-Switch Flatten Sizing:** Write $\text{qty}_{\text{flatten}} = \vert{}\text{pos}_t\vert{} - \text{working\_same\_side}_t$ over the `INFLIGHT_TICKS = 5` window to highlight how you prevent position overshoot across zero.






3. **Briefly justify the 8 untraded products in Section 1 (Page 1):**
* Explicitly state that `LYCHEE`, `DRAGONFRUIT`, `GRANADILLA`, and `BLUE/BLACK/WHITE_PEARLS` are used as fair-value/signal inputs (noting `DRAGONFRUIT` and `GRANADILLA` alongside `FRUIT_BASKET`, `LYCHEE` for the voucher smile, and the pearls for `PINK_PEARLS`), while deep-wing vouchers `VOUCHER_6800` and `VOUCHER_8100` are excluded to avoid quadratic smile boundary distortion.





#### Priority 3: Visual Polish (Figures & Layout)

1. **Upgrade the Title Header & Abstract Block (Page 1):**
* *Issue:* The top of Page 1 stacks four left-aligned lines (`Team 1 / QuantiFi 2026 / Abstract / A multi-module limit-order-book trading system`) followed by an unnumbered summary paragraph before `1. Introduction`.


* *Fix:* Use a centered academic title block: **Strategy Name: A Multi-Module Limit-Order-Book Trading System** with subtitle **Team 1 — QuantiFi 2026 Abstract**, followed by a bolded **Executive Summary** box.




2. **Annotate Figure 3 with Kill-Switch Context (Page 5):**
* *Issue:* Figure 3 is titled `Kill-switch-guarded products: cumulative PnL`, but only plots raw cumulative PnL lines without showing the `KILL_DD` thresholds (`20,275.5` for `TELLURIUM`, `40,680` for `FRUIT_BASKET`, `765` for `PAPER_LANTERNS`) or the maximum historical intraday drawdowns (`1.5x` basis).


* *Fix:* Add a subtitle or legend annotation stating each subplot's `KILL_DD` threshold (`20.3k`, `40.7k`, `0.77k`) so the reader immediately sees the buffer between historical drawdowns on Days -2/-1 and the kill-switch trigger.




3. **Format axis labels in Figure 2 (if retained):**
* Replace underscore product names (`FRUIT_BASKET`) with clean labels (`FRUIT BASKET`), capitalize `Product` on the y-axis, and format x-axis ticks as `0, 20k, 40k, 60k, 80k, 100k`.





---

### (4) Proposed Strategy Names

Replace the generic subtitle (`"A multi-module limit-order-book trading system"`) with one of these concise, institutional-grade names:

1. **Prism LOB** — *Multi-Family Alpha & Drawdown-Guarded Execution for Limit Order Books* (Evokes splitting the 26-product universe into 5 distinct strategy families).


2. **Aegis-18** — *A Fault-Isolated, Multi-Strategy Limit-Order-Book Trading System* (Highlights the 18 active products, per-module exception isolation, and intraday drawdown kill-switch protection).


3. **PentArch** — *Five-Family Modular Market Making, Relative Value, and Directional Execution* (Directly references the five-pillar strategy architecture in Table 1 and Table 3).


4. **Vector-18** — *Cross-Asset Relative Value and Regime-Blended Order Book Execution* (Clean, quantitative, and emphasizes cross-strike/cross-pearl signal routing across 18 traded books).


5. **Quorum LOB** — *Ensemble Microstructure Alpha with Bounded Intraday Drawdown* (Conveys independent module consensus and strict risk governance).