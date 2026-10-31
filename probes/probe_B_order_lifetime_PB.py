"""Probe B (portal shows only PnL): do unfilled orders persist? offset 1, PEANUT_BUTTER (touch moves within 1-3 ticks).
At the first tick ONLY, place buy 1 PEANUT_BUTTER at (best bid - 1) and sell 1 at
(best ask + 1). Never re-sent. If orders live one tick, PnL = 0. If they persist,
whichever price the market reaches later fills, and the PnL equals the value in
Claude/research/Y/expected_pnl.txt for that day and offset."""
import json
from datamodel import Order

OFF = 1


class Trader:
    def run(self, state):
        try:
            mem = json.loads(state.traderData) if state.traderData else {}
        except (ValueError, TypeError):
            mem = {}
        orders = {}
        if not mem.get('done'):
            b = state.order_depths.get('PEANUT_BUTTER')
            if b is not None and b.buy_orders and b.sell_orders:
                orders['PEANUT_BUTTER'] = [Order('PEANUT_BUTTER', int(max(b.buy_orders)) - OFF, 1),
                                       Order('PEANUT_BUTTER', int(min(b.sell_orders)) + OFF, -1)]
                mem['done'] = 1
        return orders, 0, json.dumps(mem)
