"""Probe B (portal shows only PnL): do unfilled orders persist? offset 100.
At the first tick ONLY, place buy 1 TELLURIUM at (best bid - 100) and sell 1 at
(best ask + 100). Never re-sent. If orders live one tick, PnL = 0. If they persist,
whichever price the market reaches later fills, and the PnL equals the value in
Claude/research/Y/expected_pnl.txt for that day and offset."""
import json
from datamodel import Order

OFF = 100


class Trader:
    def run(self, state):
        try:
            mem = json.loads(state.traderData) if state.traderData else {}
        except (ValueError, TypeError):
            mem = {}
        orders = {}
        if not mem.get('done'):
            b = state.order_depths.get('TELLURIUM')
            if b is not None and b.buy_orders and b.sell_orders:
                orders['TELLURIUM'] = [Order('TELLURIUM', int(max(b.buy_orders)) - OFF, 1),
                                       Order('TELLURIUM', int(min(b.sell_orders)) + OFF, -1)]
                mem['done'] = 1
        return orders, 0, json.dumps(mem)
