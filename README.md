# QuantiFi 2026

Our Team is currently participating in **QuantiFi 2026**, organized by the University of Toronto Engineering Finance Association (UTEFA).

QuantiFi is a limit-order-book / market-making algorithmic trading contest. Teams trade in a tick-level limit order book (LOB) simulation. It is a trading contest, not a stock pitch.

## Links

- Competition: [https://www.utefa.com/quantifi](https://www.utefa.com/quantifi)
- UTEFA: [https://www.utefa.com/](https://www.utefa.com/)

## Team

**Team 1** (official UTEFA assignment).

- leena.li@mail.utoronto.ca
- christina.pu@mail.utoronto.ca
- chloee.gao@mail.utoronto.ca
- Chaz070815@gmail.com

## This repository

This is Team 1’s workspace for the contest. Strategy code, research notes, and draft materials are kept here as the team works on QuantiFi 2026.

Do not commit portal passwords, API keys, or other credentials.

## Current best strategy

**This is not final.** [`strategy/final_v4__plus_D500_e20_q50.py`](strategy/final_v4__plus_D500_e20_q50.py) is the current best research candidate. It is frozen final_v4 plus PEANUT_BUTTER self mean-reversion (`D500_e20_q50`, position cap 50). Do not edit that file.

| | |
|---|---|
| File | [`strategy/final_v4__plus_D500_e20_q50.py`](strategy/final_v4__plus_D500_e20_q50.py) |
| SHA256 | `0e05e31e73df54fa31e4ddffcfe4b7681b389658646c791db6e2a92543ec884c` |
| Local 3-day PnL | 393,514 on train days −2 / −1 / 0 (167,969.5 / 126,796 / 98,748.5) |
| Max daily drawdown | 18,470 |
| Delayed replay | 401,218.5 |
| Adverse replay | 400,163.5 |

These numbers are a local approximation on reused training days. They are not out-of-sample, and they are not an official portal result.

Verify the copy:

```bash
cd strategy && sha256sum -c SHA256.txt
```

When a submission is prepared, that file must be renamed `Team##QuantiFi2026.py`. The team number is still TBD, so the name in this repository stays `final_v4__plus_D500_e20_q50.py`.

The previous candidate is archived at [`strategy/archive/Codex_Peak_Trader.py`](strategy/archive/Codex_Peak_Trader.py) (SHA256 `1f22bae1b8b4df5d22026dab426338755bed5aa87674df302ee48ef8585822fd`). Its portal backtest was about 327,250 on the same train days only, and its local replay was about 319,295. It is not the file to submit.

**LYCHEE is not traded.** The LYCHEE-only study is in [`research/lychee/`](research/lychee/README.md). Notes for this candidate and the earlier freeze are in [`docs/`](docs/README.md). The abstract in [`drafts/abstract/`](drafts/abstract/README.md) is a **DRAFT** and is on hold.
