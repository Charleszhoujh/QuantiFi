"""Figures for the Team 1 QuantiFi 2026 abstract (v10).

Data: official portal backtest of v10, per product and day (README.md).
Writes PNGs to ../figs/. Run: python3 make_figs.py
"""
import os

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "figs")

# Categorical palette (validated, light mode), fixed order = family order below.
FAMILY_COLORS = {
    "Trend following": "#2a78d6",
    "Smile relative value": "#eb6834",
    "Blended mean reversion": "#1baf7a",
    "EMA z-score mean reversion": "#eda100",
    "Market making": "#e87ba4",
}
INK, INK2, MUTED, GRID, SURFACE = "#0b0b0b", "#52514e", "#8a8984", "#e6e5e1", "#ffffff"

# Official backtest PnL (COINS) by product: day -2, day -1, day 0.
PNL = {
    "TELLURIUM": (59580, 27275, 8564),
    "FRUIT_BASKET": (21419, 46734, 7703),
    "PEANUT_BUTTER": (31292, 26615, 14671),
    "JELLY": (26562, 19077, 9431),
    "TOFFEE_CAKE": (12501, 18449, 18182),
    "PAPER_LANTERNS": (15223, 17417, 13617),
    "VOUCHER_7400": (9248, 10102, 7922),
    "VOUCHER_7300": (12495, 2824, 7717),
    "VOUCHER_7500": (10406, 7843, 4024),
    "VOUCHER_7600": (9657, 4256, 3438),
    "VOUCHER_7750": (4437, 2758, 2065),
    "VOUCHER_7000": (3534, 130, 5308),
    "VOUCHER_7200": (4129, 1732, 2160),
    "VOUCHER_7900": (2286, 653, 1005),
    "MANGOSTEEN": (-538, 1092, 3127),
    "PINK_PEARLS": (2289, 429, 119),
    "AMETHYST": (527, 608, 477.5),
    "GOLDEN_PEARLS": (83, 401, 136),
}
FAMILY = {
    "TELLURIUM": "Trend following", "FRUIT_BASKET": "Trend following",
    "PAPER_LANTERNS": "Trend following",
    "PEANUT_BUTTER": "EMA z-score mean reversion", "MANGOSTEEN": "EMA z-score mean reversion",
    "JELLY": "Blended mean reversion", "TOFFEE_CAKE": "Blended mean reversion",
    "PINK_PEARLS": "Market making", "AMETHYST": "Market making", "GOLDEN_PEARLS": "Market making",
}
for k in PNL:
    FAMILY.setdefault(k, "Smile relative value")

plt.rcParams.update({
    "font.family": "DejaVu Sans", "font.size": 8.5, "axes.edgecolor": MUTED,
    "axes.labelcolor": INK2, "xtick.color": INK2, "ytick.color": INK2,
    "axes.spines.top": False, "axes.spines.right": False,
})


def family_table():
    rows = {}
    for p, v in PNL.items():
        f = FAMILY[p]
        r = rows.setdefault(f, [0.0, 0.0, 0.0])
        for i in range(3):
            r[i] += v[i]
    return rows


def fig_pnl_by_product():
    """Horizontal bars of total PnL per product, grouped by strategy family."""
    order = list(FAMILY_COLORS)
    items = []  # (label, total, family) with a spacer between families
    for f in order:
        prods = sorted([p for p in PNL if FAMILY[p] == f], key=lambda p: -sum(PNL[p]))
        items.append((None, None, f))
        items += [(p, sum(PNL[p]), f) for p in prods]
    n = len(items)
    fig, ax = plt.subplots(figsize=(6.9, 3.55), dpi=220)
    y = list(range(n))[::-1]
    for yi, (lab, tot, f) in zip(y, items):
        if lab is None:
            share = sum(family_table()[f]) / 523191.5 * 100
            ax.text(0.4, yi, f"{f}  ({share:.1f}% of total)", ha="left", va="center",
                    fontsize=8, fontweight="bold", color=INK)
            continue
        ax.barh(yi, tot / 1000, height=0.72, color=FAMILY_COLORS[f], edgecolor=SURFACE,
                linewidth=0.8)
        ax.text(tot / 1000 + 0.8, yi, f"{tot:,.0f}" if tot == int(tot) else f"{tot:,.1f}",
                va="center", ha="left", fontsize=7, color=INK2)
    ax.set_yticks([yi for yi, it in zip(y, items) if it[0] is not None])
    ax.set_yticklabels([it[0] for it in items if it[0] is not None], fontsize=7.2,
                       fontfamily="DejaVu Sans Mono")
    ax.set_xlabel("Total PnL over days −2, −1, 0 (thousand COINS)")
    ax.set_xlim(0, 108)
    ax.set_ylim(-0.7, n - 0.3)
    ax.xaxis.grid(True, color=GRID, linewidth=0.6)
    ax.set_axisbelow(True)
    ax.tick_params(axis="y", length=0)
    ax.spines["left"].set_visible(False)
    fig.tight_layout(pad=0.4)
    fig.savefig(os.path.join(OUT, "fig_pnl_by_product.png"), facecolor=SURFACE)
    plt.close(fig)


def _box(ax, x, y, w, h, title, body=None, edge=MUTED, fill="#f6f6f4", stripe=None,
         tsize=7.6, bsize=6.7, bold=True):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0,rounding_size=0.012",
                                linewidth=0.8, edgecolor=edge, facecolor=fill))
    if stripe:
        ax.add_patch(FancyBboxPatch((x, y), 0.008, h, boxstyle="square,pad=0",
                                    linewidth=0, facecolor=stripe))
    tx = x + (0.016 if stripe else 0.012)
    if body:
        ax.text(tx, y + h - 0.035, title, fontsize=tsize, fontweight="bold" if bold else None,
                color=INK, va="top", ha="left")
        ax.text(tx, y + h - 0.035 - 0.068, body, fontsize=bsize, color=INK2, va="top", ha="left",
                linespacing=1.3)
    else:
        ax.text(x + w / 2, y + h / 2, title, fontsize=tsize, fontweight="bold" if bold else None,
                color=INK, va="center", ha="center", linespacing=1.3)


def _arrow(ax, x0, y0, x1, y1):
    ax.annotate("", xy=(x1, y1), xytext=(x0, y0),
                arrowprops=dict(arrowstyle="-|>", color=INK2, lw=0.9, shrinkA=0, shrinkB=0,
                                mutation_scale=8))


def fig_architecture():
    fig = plt.figure(figsize=(6.9, 3.05), dpi=220)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")

    # Inputs (full height; fans out to every family)
    _box(ax, 0.005, 0.06, 0.19, 0.90, "Inputs (each tick)",
         "Order books\nOwn and market trades\nPositions\ntraderData (module\nmemory, packed)",
         bsize=6.6)
    ax.text(0.017, 0.47, "Signal-only products", fontsize=7.2, fontweight="bold", color=INK,
            va="top", ha="left")
    ax.text(0.017, 0.40, "LYCHEE: spot S of the\nvoucher smile\n\nBLUE / BLACK / WHITE\nPEARLS: inputs to the\nPINK_PEARLS fair value",
            fontsize=6.6, color=INK2, va="top", ha="left", linespacing=1.3)
    # Strategy families
    fams = [
        ("Market making", "AMETHYST · PINK_PEARLS · GOLDEN_PEARLS"),
        ("Smile relative value", "VOUCHER_7000 … VOUCHER_7900 (8 interior strikes)"),
        ("EMA z-score mean reversion", "PEANUT_BUTTER · MANGOSTEEN"),
        ("Trend following", "PAPER_LANTERNS · TELLURIUM · FRUIT_BASKET"),
        ("Blended mean reversion", "TOFFEE_CAKE · JELLY  (fixed + adaptive legs)"),
    ]
    x0, w, h, gap = 0.24, 0.40, 0.158, 0.031
    top = 0.955
    ax.text(x0, 0.985, "10 modules in 5 families (disjoint products, own memory, exception-isolated)",
            fontsize=6.9, color=INK2, va="center", ha="left", style="italic")
    ys = []
    for i, (f, prods) in enumerate(fams):
        y = top - h - i * (h + gap)
        ys.append(y + h / 2)
        _box(ax, x0, y, w, h, f, prods, stripe=FAMILY_COLORS[f], fill=SURFACE, bsize=6.6)

    # Root risk layer
    rx, rw = 0.69, 0.165
    _box(ax, rx, 0.06, rw, 0.90, "Root risk layer",
         "Position limits net of\nin-flight orders\n\nGOLDEN_PEARLS\nclip ±10 lots\n\n"
         "Intraday drawdown\nkill switch on the\n3 trend products\n\nOwn-fill de-dup\nby timestamp\n\nDuplicate-callback\nguard",
         bsize=6.6,
         fill="#f6f6f4")
    # Outputs
    _box(ax, 0.89, 0.56, 0.105, 0.40, "Orders\n(this tick)", fill="#f6f6f4")
    _box(ax, 0.89, 0.06, 0.105, 0.42, "traderData\n(packed,\n≈ 5 KB)", fill="#f6f6f4")

    # inputs → each family
    for yc in ys:
        _arrow(ax, 0.195, yc, x0 - 0.002, yc)
    # families → risk layer
    for yc in ys:
        _arrow(ax, x0 + w, yc, rx - 0.002, yc)
    # risk → outputs
    _arrow(ax, rx + rw, 0.76, 0.888, 0.76)
    _arrow(ax, rx + rw, 0.27, 0.888, 0.27)
    fig.savefig(os.path.join(OUT, "fig_architecture.png"), facecolor=SURFACE)
    plt.close(fig)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    fig_pnl_by_product()
    fig_architecture()
    ft = family_table()
    tot = [sum(v[i] for v in ft.values()) for i in range(3)]
    print("totals", tot, sum(tot))
    for f in FAMILY_COLORS:
        v = ft[f]
        print(f"{f:28s} {v[0]:>10,.1f} {v[1]:>10,.1f} {v[2]:>10,.1f} {sum(v):>11,.1f} {sum(v)/sum(tot)*100:5.1f}%")
