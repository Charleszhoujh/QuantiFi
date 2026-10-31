"""Probe D: what does the portal put in state.own_trades and state.timestamp?
Buys 1 TELLURIUM at the first tick, sells it back at the 5th tick. Prints diagnostics
for the first 8 ticks of each run segment and whenever own_trades is non-empty (capped)."""
import json
from datamodel import Order


class Trader:
    def run(self, state):
        try:
            mem = json.loads(state.traderData) if state.traderData else {}
        except (ValueError, TypeError):
            mem = {}
        n = mem.get('n', 0)
        pr = mem.get('pr', 0)
        orders = {}
        b = state.order_depths.get('TELLURIUM')
        if b is not None:
            if n == 0 and b.sell_orders:
                orders['TELLURIUM'] = [Order('TELLURIUM', int(min(b.sell_orders)), 1)]
            elif n == 4 and b.buy_orders:
                orders['TELLURIUM'] = [Order('TELLURIUM', int(max(b.buy_orders)), -1)]
        ot = state.own_trades or {}
        has = any(len(v) for v in ot.values())
        if n < 8 or (has and pr < 30):
            rows = []
            for sym, lst in ot.items():
                for t in lst:
                    rows.append({'sym': sym, 'p': getattr(t, 'price', None), 'q': getattr(t, 'quantity', None),
                                 'buyer': repr(getattr(t, 'buyer', None)), 'seller': repr(getattr(t, 'seller', None)),
                                 'ts': getattr(t, 'timestamp', None)})
            print('PROBE_D', json.dumps({'ts': state.timestamp, 'n': n, 'td_in_len': len(state.traderData or ''),
                                         'pos': dict(state.position or {}), 'own': rows}))
            if has:
                pr += 1
        mem['n'] = n + 1
        mem['pr'] = pr
        return orders, 0, json.dumps(mem)
