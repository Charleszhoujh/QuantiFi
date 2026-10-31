"""Probe A (portal shows only PnL): which day(s) does the portal run?
At the first tick buy 1 TELLURIUM at the best ask, then hold; nothing else.
PnL = final TELLURIUM mid - first ask (per day; summed if the portal adds days).
Compare the portal number with the table in Claude/research/Y/expected_pnl.txt."""
import json
from datamodel import Order


class Trader:
    def run(self, state):
        mem = {}
        try:
            mem = json.loads(state.traderData) if state.traderData else {}
        except (ValueError, TypeError):
            mem = {}
        orders = {}
        if not mem.get('done'):
            b = state.order_depths.get('TELLURIUM')
            if b is not None and b.sell_orders:
                orders['TELLURIUM'] = [Order('TELLURIUM', int(min(b.sell_orders)), 1)]
                mem['done'] = 1
        return orders, 0, json.dumps(mem)
