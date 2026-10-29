# Codex latest ~330k freeze ID — 挑刺 notes (America/Toronto)

Date scanned: 2026-10-28 ~17:44 EDT (America/Toronto)

## Verdict
Charles's "~33w / +330k" maps to local **319,295** (peak) in
`research/strategy_complementarity_20261028/REPORT_CN.md` — not a portal number.
**submissions/QuantiFi_candidate.py was NOT replaced** (still old portal ~5753 freeze).

## Freeze candidates (final_v3, Oct 28 09:02:21 Toronto)

| role | file | sha256 | claimed local PnL (3d train −2/−1/0, fee=0) |
|------|------|--------|-----------------------------------------------|
| **peak (33w claim)** | QuantiFi_peak_research.py | `1f22bae1b8b4df5d22026dab426338755bed5aa87674df302ee48ef8585822fd` | **319,295** (MDD 19,868.5) |
| robust alt | QuantiFi_robust_research.py | `baa9ef297abe814331e864391217812982111213a6e52837d21b58a8b26ebe00` | 283,034 (MDD 8,157) |

Mac source:
`/Users/charles/Desktop/UofT ECE/project/QuantiFi/Codex/research/strategy_complementarity_20261028/candidates/final_v3/`

Manifest status (both): **RESEARCH ONLY; no automatic promotion**

## Old freeze (for contrast)
- path: `submissions/QuantiFi_candidate.py`
- sha256: `b4e4027b51a6ee885602949a47c25507776576c53a6e3fe5864d82e0ad5ff869`
- portal historically ~5753; local REPORT table "原冻结 A+F" = 5,132
- modules: A (AMETHYST peg 10000, soft cap20) + F (VOUCHER_7500 neighbor IV, edge6, soft cap10) only

## Engine
- Local complementarity study replay (`research/strategy_complementarity_20261028/src/reproduce.py` / shared portfolio engine)
- Zero fee; one-generation pending lifetime; terminal mid mark-to-market
- Days: train −2/−1/0 only; peak includes **endpoint extension** (事后扩展 strike set)
- ≠ official portal engine

## Material diff vs old A+F
Peak id `A+Si+P+T+J+C`:
1. **A50** af plugin: AMETHYST cap50, **f:false** (old neighbor-F OFF)
2. **S_quad7_interior8_q50** smile: Claude-style LOO quad smile, thr=7, cap50, strikes 7000–7900 (8 interior; wings 6800/8100 fit-only), unhedged
3. **P_line50_gate_q50** paper: scaled hysteresis, window50, entry0.05/exit0.02, fair_gate=True, forecast_horizon=50
4. **T40_q50_original** mr: TOFFEE fair **5000**, entry40, cap50
5. **J80_q50_neighbor** mr: JELLY fair **2000**, entry80, cap50
6. **C_ema_q40_capacity** tell: TELLURIUM EMA250/1500, cap40 (DeepSeek C)

Robust id `AF+Si7+Pr+T+J`: keeps AF (Fexit0 on 7500) + smile without 7500 in traded set + PAPER H60 no fair_gate; **drops TELL**.

## Attack holes (portal upload risk)
1. **319k is local fee=0 train**, not portal; expect gap like Claude local156k≈portal156k was lucky — Codex old local5k≈portal5.7k.
2. **Endpoint extension = post-hoc strike selection** on already-seen days → selection bias / look-ahead-in-choice.
3. **Smile thr7 F-pack dominates** (same family as Claude 156k); Gemini synthetic OOS already showed F→0, leftover ~TOFFEE only.
4. **Hardcoded fairs** TOFFEE=5000 / JELLY=2000 — regime break = instant leg death.
5. **TELL day0 −3,946 / self MDD ~38k** in report — peak keeps it; robust drops it for a reason.
6. Capacity bump to official limits ≠ new alpha; complementarity report admits PnL ≈ sum of modules when products don't overlap.
7. PAPER `fair_gate` uses fitted_now + 50*slope forecast (model forecast, not peeking future tape — but still in-sample slope).
8. File header says LOCAL RESEARCH ONLY; not promoted to submissions/.

## Portal ask
Charles wants portal run. Critic gate: freeze SHA `1f22bae1…` only; ban retune; treat 319k as local ceiling not expectation; prefer also upload robust for stress contrast OR say peak-only. Do NOT claim 33w until portal prints.

