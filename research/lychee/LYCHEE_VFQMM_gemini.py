# LYCHEE-only strategy VF-QMM, designed by Gemini (Argon High), 2026-10-29. Unvalidated.
import json
from typing import Dict, List, Tuple, Any
from datamodel import OrderDepth, TradingState, Order


class Trader:
    SYMBOL = "LYCHEE"
    HARD_LIMIT = 200
    SOFT_MAX_POS = 32
    SNIPE_MAX_POS = 50
    VOUCHER_CONFIG: Dict[str, Tuple[float, float]] = {
        "VOUCHER_6800": (0.99, 0.34),
        "VOUCHER_7000": (0.96, 0.28),
        "VOUCHER_7200": (0.88, 0.23),
        "VOUCHER_7300": (0.78, 0.15),
    }
    W_WALL = 0.45
    W_REV = 0.25
    W_VOUCH = 0.30
    MAX_FV_OFFSET = 3.2
    ALPHA_FAST = 0.35
    ALPHA_BASIS = 0.03
    INV_SKEW_GAMMA = 0.05
    FLOW_ASYM_BIAS = 0.10
    EDGE_TOUCH = 2.05
    EDGE_STRICT_STEP = 1.82
    EDGE_TAKE_SNIPE = 1.25
    STEP_IN_QTY = 8
    TOUCH_BASE_QTY = 18
    SNIPE_MAX_QTY = 10
    EOD_TIMESTAMP = 970000

    def _extract_book_metrics(self, od):
        buy_prices = sorted(od.buy_orders.keys(), reverse=True)
        sell_prices = sorted(od.sell_orders.keys())
        best_bid = buy_prices[0]
        best_ask = sell_prices[0]
        best_bid_vol = od.buy_orders[best_bid]
        best_ask_vol = -od.sell_orders[best_ask]
        deep_bid = buy_prices[-1]
        for p in reversed(buy_prices):
            if od.buy_orders[p] >= 2:
                deep_bid = p
                break
        deep_ask = sell_prices[-1]
        for p in reversed(sell_prices):
            if -od.sell_orders[p] >= 2:
                deep_ask = p
                break
        mid = 0.5 * (best_bid + best_ask)
        wall_mid = 0.5 * (deep_bid + deep_ask)
        return best_bid, best_ask, best_bid_vol, best_ask_vol, mid, wall_mid

    def _compute_voucher_signal(self, order_depths, anchor_price, basis_ema):
        weighted_dev = 0.0
        total_weight = 0.0
        for v_sym, (delta, weight) in self.VOUCHER_CONFIG.items():
            od = order_depths.get(v_sym)
            if not od or not od.buy_orders or not od.sell_orders:
                continue
            v_bid = max(od.buy_orders.keys())
            v_ask = min(od.sell_orders.keys())
            if v_ask - v_bid > 8:
                continue
            v_deep_bid = min(od.buy_orders.keys())
            v_deep_ask = max(od.sell_orders.keys())
            v_mid = 0.5 * (0.5 * (v_bid + v_ask) + 0.5 * (v_deep_bid + v_deep_ask))
            inst_basis = v_mid - delta * anchor_price
            if v_sym not in basis_ema:
                basis_ema[v_sym] = round(inst_basis, 3)
                continue
            prev_basis = basis_ema[v_sym]
            implied_spot_dev = (inst_basis - prev_basis) / delta
            basis_ema[v_sym] = round((1.0 - self.ALPHA_BASIS) * prev_basis + self.ALPHA_BASIS * inst_basis, 3)
            clipped_dev = max(-3.5, min(3.5, implied_spot_dev))
            weighted_dev += weight * clipped_dev
            total_weight += weight
        if total_weight <= 0.0:
            return 0.0
        return weighted_dev / total_weight

    def run(self, state: TradingState):
        orders: Dict[str, List[Order]] = {}
        conversions = 0
        try:
            td: Dict[str, Any] = json.loads(state.traderData) if state.traderData else {}
        except Exception:
            td = {}
        od = state.order_depths.get(self.SYMBOL)
        if not od or not od.buy_orders or not od.sell_orders:
            return orders, conversions, json.dumps(td, separators=(",", ":"))
        best_bid, best_ask, bid_vol, ask_vol, mid, wall_mid = self._extract_book_metrics(od)
        spread = best_ask - best_bid
        pos = state.position.get(self.SYMBOL, 0)
        clean_anchor = 0.60 * wall_mid + 0.40 * mid
        prev_ema_fast = float(td.get("ef", clean_anchor))
        new_ema_fast = (1.0 - self.ALPHA_FAST) * prev_ema_fast + self.ALPHA_FAST * clean_anchor
        basis_ema: Dict[str, float] = td.get("vb", {})
        voucher_dev = self._compute_voucher_signal(state.order_depths, wall_mid, basis_ema)
        wall_signal = wall_mid - mid
        rev_signal = prev_ema_fast - mid
        raw_offset = self.W_WALL * wall_signal + self.W_REV * rev_signal + self.W_VOUCH * voucher_dev
        fv_offset = max(-self.MAX_FV_OFFSET, min(self.MAX_FV_OFFSET, raw_offset))
        fair_value = mid + fv_offset
        gamma = self.INV_SKEW_GAMMA * 1.6 if state.timestamp >= self.EOD_TIMESTAMP else self.INV_SKEW_GAMMA
        reservation_price = fair_value - gamma * pos + self.FLOW_ASYM_BIAS
        rem_buy_limit = self.HARD_LIMIT - pos
        rem_sell_limit = self.HARD_LIMIT + pos
        lo: List[Order] = []

        if reservation_price - best_ask >= self.EDGE_TAKE_SNIPE and pos < self.SNIPE_MAX_POS and rem_buy_limit > 0:
            q = min(ask_vol, self.SNIPE_MAX_QTY, self.SNIPE_MAX_POS - pos, rem_buy_limit)
            if q > 0:
                lo.append(Order(self.SYMBOL, best_ask, q))
                rem_buy_limit -= q
        if best_bid - reservation_price >= self.EDGE_TAKE_SNIPE and pos > -self.SNIPE_MAX_POS and rem_sell_limit > 0:
            q = min(bid_vol, self.SNIPE_MAX_QTY, self.SNIPE_MAX_POS + pos, rem_sell_limit)
            if q > 0:
                lo.append(Order(self.SYMBOL, best_bid, -q))
                rem_sell_limit -= q

        max_passive_buy = max(0, self.SOFT_MAX_POS - pos)
        max_passive_sell = max(0, self.SOFT_MAX_POS + pos)

        bid_budget = min(rem_buy_limit, max_passive_buy)
        if bid_budget > 0:
            sb = best_bid + 1
            if spread >= 4 and sb < best_ask and (reservation_price - sb) >= self.EDGE_STRICT_STEP:
                q = min(self.STEP_IN_QTY, bid_budget)
                lo.append(Order(self.SYMBOL, sb, q))
                bid_budget -= q
                rem_buy_limit -= q
            if bid_budget > 0 and (reservation_price - best_bid) >= self.EDGE_TOUCH:
                q = min(self.TOUCH_BASE_QTY, bid_budget)
                lo.append(Order(self.SYMBOL, best_bid, q))
                rem_buy_limit -= q

        ask_budget = min(rem_sell_limit, max_passive_sell)
        if ask_budget > 0:
            sa = best_ask - 1
            if spread >= 4 and sa > best_bid and (sa - reservation_price) >= self.EDGE_STRICT_STEP:
                q = min(self.STEP_IN_QTY, ask_budget)
                lo.append(Order(self.SYMBOL, sa, -q))
                ask_budget -= q
                rem_sell_limit -= q
            if ask_budget > 0 and (best_ask - reservation_price) >= self.EDGE_TOUCH:
                q = min(self.TOUCH_BASE_QTY, ask_budget)
                lo.append(Order(self.SYMBOL, best_ask, -q))
                rem_sell_limit -= q

        orders[self.SYMBOL] = lo
        new_td = {"ef": round(new_ema_fast, 3), "vb": basis_ema}
        return orders, conversions, json.dumps(new_td, separators=(",", ":"))
