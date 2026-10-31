// Builds the Team 1 QuantiFi 2026 abstract (final strategy v10) as a .docx.
// Run: node build_abstract.js   ->  ../Team1QuantiFi2026.docx
// Then: soffice --headless --convert-to pdf --outdir .. ../Team1QuantiFi2026.docx
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, Footer,
  AlignmentType, HeadingLevel, WidthType, ShadingType, BorderStyle, LevelFormat,
  PageNumber, VerticalAlign, TableLayoutType,
} = require("docx");

const HERE = __dirname;
const FIGS = path.join(HERE, "..", "figs");
const OUT = path.join(HERE, "..", "Team1QuantiFi2026.docx");

// ---------------------------------------------------------------- typography
const SERIF = "Times New Roman";
const MONO = "Courier New";
const BODY = 20;        // half-points (10 pt)
const SMALL = 17;       // 8.5 pt (tables)
const CAPTION = 17;     // 8.5 pt
const GREY = "52514E";
const TEXT_W = 10080;   // 7.0 in in DXA (Letter, 0.75 in side margins)

// Inline markup: **bold**, *italic*, `mono`, _{sub}, ^{sup}
function runs(text, base = {}) {
  const out = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|_\{[^}]+\}|\^\{[^}]+\})/g;
  let last = 0, m;
  const push = (t, extra = {}) => {
    if (t) out.push(new TextRun({ text: t, font: SERIF, size: BODY, ...base, ...extra }));
  };
  while ((m = re.exec(text)) !== null) {
    push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) push(tok.slice(2, -2), { bold: true });
    else if (tok.startsWith("*")) push(tok.slice(1, -1), { italics: true });
    else if (tok.startsWith("`")) push(tok.slice(1, -1), { font: MONO, size: (base.size || BODY) - 2 });
    else if (tok.startsWith("_{")) push(tok.slice(2, -1), { subScript: true });
    else push(tok.slice(2, -1), { superScript: true });
    last = m.index + tok.length;
  }
  push(text.slice(last));
  return out;
}

const P = (text, opts = {}) => new Paragraph({
  children: runs(text, opts.run || {}),
  alignment: opts.align || AlignmentType.JUSTIFIED,
  spacing: { before: opts.before ?? 0, after: opts.after ?? 75, line: 238 },
  keepNext: opts.keepNext || false,
  indent: opts.indent,
});

const H1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  children: [new TextRun({ text, font: SERIF, size: 25, bold: true })],
  spacing: { before: 140, after: 60 },
  keepNext: true,
  border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "9A9993", space: 2 } },
});

const EQ = (text) => new Paragraph({
  children: runs(text),
  alignment: AlignmentType.CENTER,
  spacing: { before: 40, after: 90, line: 238 },
});

const BULLET = (text) => new Paragraph({
  children: runs(text),
  numbering: { reference: "bullets", level: 0 },
  alignment: AlignmentType.JUSTIFIED,
  spacing: { before: 0, after: 50, line: 238 },
});

const NUMBERED = (text) => new Paragraph({
  children: runs(text),
  numbering: { reference: "findings", level: 0 },
  alignment: AlignmentType.JUSTIFIED,
  spacing: { before: 0, after: 50, line: 238 },
});

function pngSize(file) {
  const b = fs.readFileSync(file);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), data: b };
}

function FIGURE(file, widthIn, caption, after = 110, before = 60) {
  const { w, h, data } = pngSize(path.join(FIGS, file));
  const pxW = Math.round(widthIn * 96);
  const pxH = Math.round(pxW * h / w);
  return [
    new Paragraph({
      children: [new ImageRun({ type: "png", data, transformation: { width: pxW, height: pxH } })],
      alignment: AlignmentType.CENTER,
      spacing: { before, after: 30 },
      keepNext: true,
    }),
    new Paragraph({
      children: runs(caption, { size: CAPTION }),
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 0, after },
      indent: { left: 360, right: 360 },
    }),
  ];
}

const CAP = (text, after = 50) => new Paragraph({
  children: runs(text, { size: CAPTION }),
  alignment: AlignmentType.LEFT,
  spacing: { before: 60, after },
  keepNext: true,
});

const thin = { style: BorderStyle.SINGLE, size: 4, color: "BDBCB6" };
const none = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };

// rows: array of arrays of strings (markup allowed). First row = header.
function TABLE(rows, widthsIn, { align = [], bold_last = false } = {}) {
  const widths = widthsIn.map((x) => Math.round(x * 1440));
  const total = widths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: widths,
    layout: TableLayoutType.FIXED,
    alignment: AlignmentType.CENTER,
    rows: rows.map((r, i) => new TableRow({
      tableHeader: i === 0,
      cantSplit: true,
      children: r.map((cell, j) => new TableCell({
        width: { size: widths[j], type: WidthType.DXA },
        shading: i === 0 ? { fill: "EDEDEA", type: ShadingType.CLEAR, color: "auto" }
          : (bold_last && i === rows.length - 1 ? { fill: "F6F6F4", type: ShadingType.CLEAR, color: "auto" } : undefined),
        margins: { top: 25, bottom: 25, left: 70, right: 70 },
        verticalAlign: VerticalAlign.CENTER,
        borders: { top: thin, bottom: thin, left: none, right: none },
        children: [new Paragraph({
          children: runs(cell, {
            size: SMALL,
            bold: i === 0 || (bold_last && i === rows.length - 1) ? true : undefined,
          }),
          alignment: (align[j] === "r") ? AlignmentType.RIGHT : AlignmentType.LEFT,
          spacing: { before: 0, after: 0, line: 228 },
          keepNext: i < rows.length - 1,
        })],
      })),
    })),
  });
}

// ---------------------------------------------------------------- content
const body = [];

// Title block
body.push(new Paragraph({
  children: [new TextRun({ text: "A Modular, Risk-Gated Multi-Strategy System", font: SERIF, size: 34, bold: true })],
  alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 },
}));
body.push(new Paragraph({
  children: [new TextRun({ text: "for Limit-Order-Book Trading", font: SERIF, size: 34, bold: true })],
  alignment: AlignmentType.CENTER, spacing: { before: 0, after: 70 },
}));
body.push(new Paragraph({
  children: [new TextRun({ text: "Team 1  ·  QuantiFi 2026 (UTEFA)  ·  Strategy Abstract", font: SERIF, size: 20 })],
  alignment: AlignmentType.CENTER, spacing: { before: 0, after: 20 },
}));
body.push(new Paragraph({
  children: [new TextRun({ text: "Submitted algorithm: Team1QuantiFi2026.py (final version v10)", font: SERIF, size: 19, italics: true, color: GREY })],
  alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 },
}));

// Abstract box
const ABSTRACT =
  "**Abstract.** We describe the algorithm Team 1 submitted to QuantiFi 2026, a tick-level limit-order-book " +
  "(LOB) trading contest with 26 products, in which teams are ranked on out-of-sample (OOS) PnL together with " +
  "breadth, depth and communication. The algorithm is a portfolio of ten causal modules, each owning a disjoint " +
  "set of products and drawn from one of five strategy families matched to how each product behaved " +
  "historically: (i) market making around fixed or cross-implied " +
  "fair values; (ii) relative value across eight voucher (call-option) strikes using a leave-one-out " +
  "implied-volatility smile; (iii) EMA-anchored z-score mean reversion; (iv) slope- and breakout-based trend " +
  "following; and (v) mean reversion that blends a fixed and an adaptive centre. A root risk layer enforces " +
  "position limits net of in-flight orders and an intraday drawdown kill switch on the three trend products, " +
  "and engineering safeguards handle platform behaviours we measured with probe strategies. On the official " +
  "backtest over days −2, −1 and 0 the algorithm earned **523,191.5 COINS**; all 18 traded products ended " +
  "positive and 53 of 54 product-days were profitable. In local stress replays, removing every passive fill " +
  "lowered PnL by about 1% and a cost of 1 COIN per unit traded lowered it by about 11%, so returns come " +
  "mainly from the signals rather than from fill assumptions.";
const KEYWORDS = "**Keywords:** limit order book · market making · implied-volatility smile · mean reversion · " +
  "trend following · drawdown control";
body.push(new Table({
  width: { size: TEXT_W, type: WidthType.DXA },
  columnWidths: [TEXT_W],
  layout: TableLayoutType.FIXED,
  rows: [new TableRow({
    children: [new TableCell({
      width: { size: TEXT_W, type: WidthType.DXA },
      shading: { fill: "F4F4F2", type: ShadingType.CLEAR, color: "auto" },
      margins: { top: 100, bottom: 100, left: 160, right: 160 },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 6, color: "9A9993" },
        bottom: { style: BorderStyle.SINGLE, size: 6, color: "9A9993" },
        left: { style: BorderStyle.SINGLE, size: 6, color: "9A9993" },
        right: { style: BorderStyle.SINGLE, size: 6, color: "9A9993" },
      },
      children: [
        new Paragraph({ children: runs(ABSTRACT), alignment: AlignmentType.JUSTIFIED, spacing: { after: 70, line: 238 } }),
        new Paragraph({ children: runs(KEYWORDS, { size: 19 }), alignment: AlignmentType.LEFT, spacing: { after: 0 } }),
      ],
    })],
  })],
}));

// 1 Introduction
body.push(H1("1   Introduction"));
body.push(P(
  "QuantiFi 2026 simulates a limit order book for 26 products over 10,000 ticks per day. On every tick the " +
  "algorithm receives the order books, recent trades and its own positions, and returns limit orders; any " +
  "state it needs later must be serialised into a string (`traderData`). Teams receive three historical days " +
  "(−2, −1 and 0), and PnL is scored as the average over several unseen out-of-sample runs."));
body.push(P(
  "Because the score is an average over unseen runs, we aimed to maximise *expected OOS PnL* rather than " +
  "backtest PnL. That objective favours many modest, independent edges over one large edge that may not " +
  "persist. Four principles guided the design:", { after: 50 }));
body.push(BULLET("**Model follows product.** Each product was first classified by how its price behaves (anchored, " +
  "priced off related products, mean-reverting or trending) and only then assigned a model."));
body.push(BULLET("**Causal and simple.** Signals use only the current state and stored memory, with few parameters per module."));
body.push(BULLET("**Isolation.** No two modules trade the same product, so each module earns the same PnL inside the " +
  "portfolio as on its own, can be tested or removed independently, and cannot disrupt another module if it fails."));
body.push(BULLET("**Explicit risk bounds.** Hard position caps, limits that count orders still in flight, and a " +
  "drawdown kill switch where directional risk is concentrated."));

// 2 Market environment
body.push(H1("2   Market Environment and Design Evidence"));
body.push(P(
  "**2.1 Product universe.** The 26 products fall into five groups: AMETHYST and five pearl products (PINK, " +
  "GOLDEN, BLUE, BLACK and WHITE_PEARLS); the underlying LYCHEE and ten call-option vouchers VOUCHER_6800–8100 " +
  "(8 days to expiry at day −2, with no exercise or settlement); products whose prices oscillate around a level " +
  "(PEANUT_BUTTER, MANGOSTEEN, TOFFEE_CAKE, JELLY); two persistently trending products (PAPER_LANTERNS, " +
  "TELLURIUM); and FRUIT_BASKET, a basket of DRAGONFRUIT, GRANADILLA and MANGOSTEEN with unpublished weights. " +
  "Figure 1 maps the 18 traded products onto modules."));
body.push(P(
  "**2.2 Three findings that shaped the design.** Development research on days −2 and −1 (with exploratory " +
  "analysis on day −2 only) produced three findings that constrain every module:", { after: 50 }));
body.push(NUMBERED("**The spread trap.** Short-horizon (1–50 tick) round trips that cross the spread lost money on " +
  "every product and every anchor we tested. A tradable signal must predict moves that are large relative to the " +
  "half-spread, so our aggressive modules rely on slow signals (hundreds to thousands of ticks) or on " +
  "cross-sectional mispricing."));
body.push(NUMBERED("**Inventory drift beats spread capture.** Quoting both sides of the 24 products whose prices " +
  "drift earned 29.4k COINS of spread on day −2 but lost 56.4k on inventory marked against drifting " +
  "prices. We therefore make markets only where the fair value is fixed or can be implied from other books."));
body.push(NUMBERED("**Behaviour is product-specific.** One mean-reversion rule applied unchanged to the 16 " +
  "non-option products was profitable on both days for only 5 of them and lost up to 35k COINS on a trending " +
  "product (FRUIT_BASKET). No single rule fits all products, hence one module per product group."));
body.push(...FIGURE("fig_architecture.png", 6.0,
  "**Figure 1.** System architecture. On each tick, ten modules in five families propose orders for disjoint " +
  "sets of products; the root risk layer checks and adjusts them before submission, and all module memory is " +
  "packed into `traderData`. Colours identify strategy families and are reused in Figure 3."));
body.push(P(
  "**2.3 Platform behaviour measured with probes.** The rules leave several execution details open, so we " +
  "submitted small probe strategies to the official platform. They showed that (a) unfilled orders live for a " +
  "single tick; (b) `traderData` larger than about 8.5 KB is lost; and (c) the own-trades feed re-sends the latest " +
  "batch of fills on every call until a newer fill arrives. Findings (b) and (c) drive the safeguards in Section 4.3."));
body.push(P(
  "**2.4 Untraded products.** Eight products receive no orders, each for a documented reason. LYCHEE’s best " +
  "short-horizon signal (about 1.1 price points) is smaller than its half-spread (about 2 points), so it serves only " +
  "as the spot input of the voucher model. BLUE, BLACK and WHITE_PEARLS co-move with the other pearls only " +
  "contemporaneously (no lead–lag; none of 13 tested configurations was accepted), so they feed the PINK_PEARLS " +
  "fair value instead. The wing strikes VOUCHER_6800 and VOUCHER_8100 lost money in development, and a " +
  "leave-one-out smile must extrapolate there. Candidates for DRAGONFRUIT and GRANADILLA were fragile or negative."));

// 3 Strategy modules
body.push(H1("3   Strategy Modules"));
body.push(P(
  "Table 1 summarises the modules; the subsections explain each signal. Below, *q* is the position, *mid* the " +
  "mid-price and EMA_{h} an exponential moving average with half-life *h* ticks.", { after: 60 }));
body.push(CAP("**Table 1.** Modules, signals and key parameters (MM = market making, RV = relative value, MR = mean reversion)."));
body.push(TABLE([
  ["Product(s)", "Family", "Signal and execution", "Key parameters"],
  ["AMETHYST", "MM", "Passive quotes at the touch, never through fair 10,000", "cap 50, size 5 per side"],
  ["PINK_PEARLS", "MM", "Passive quotes around 50,000 − Σ other four pearl mids", "width 2, skew 2, cap 20"],
  ["GOLDEN_PEARLS", "MM", "A–S-style quotes around an EMA fair, inventory skew", "EMA_{20}, skew 2, *k*_{σ} 1, size 10, |*q*| ≤ 10"],
  ["8 vouchers (7000–7900)", "Smile RV", "Leave-one-out quadratic smile; take mispriced quotes", "edge 7.0, min. 4 strikes, cap 50 each"],
  ["PEANUT_BUTTER", "EMA MR", "z-score vs EMA anchor; exit at anchor frozen at entry", "EMA_{500}, |*z*| ≥ 2, hold ≤ 1,000, cap 50"],
  ["MANGOSTEEN", "EMA MR", "z-score vs EMA; entry tested on executable price", "EMA_{500}, |*z*| ≥ 2, hold ≤ 1,000, cap 40"],
  ["PAPER_LANTERNS", "Trend", "50-tick OLS slope, hysteresis, forecast gate", "slope 0.05 / 0.02, horizon 50, cap 50"],
  ["TELLURIUM", "Trend", "Breakout of a confirmed swing pivot, trailing stop", "pivot reversal 10, cap 40"],
  ["FRUIT_BASKET", "Trend", "EMA_{50} − EMA_{200} crossover on its own mid", "band ½ spread, warm-up 500, cap 40"],
  ["TOFFEE_CAKE, JELLY", "Blended MR", "Fixed-centre leg + adaptive EMA leg, best level only", "5,000±40 / 2,000±80; EMA_{3000}; 25+25"],
], [1.5, 0.72, 2.8, 1.98]));
body.push(P("", { after: 40 }));

body.push(P(
  "**3.1 Market making (AMETHYST, PINK_PEARLS, GOLDEN_PEARLS).** These products have a fair value that is fixed " +
  "or recoverable from other books, so the edge lies in supplying liquidity rather than predicting direction " +
  "(finding 2). AMETHYST is quoted at the best bid and ask, clipped to 9,999 and 10,001 so that it never trades " +
  "through its fair value of 10,000, the value used in the official example. The five pearl mids sum to " +
  "approximately 50,000, so PINK_PEARLS takes 50,000 minus the other four mids as a fair value that is less noisy " +
  "than its own mid, and quotes ±2 around fair − 2*q*/20. GOLDEN_PEARLS uses an Avellaneda–Stoikov-style maker [1]:", { keepNext: true }));
body.push(EQ("*r*_{t} = EMA_{20}(*mid*)_{t} − *s*·*q*_{t} / cap,     *δ*_{t} = max(1, *k*_{σ}·*σ̂*_{t}),     bid = ⌊*r*_{t} − *δ*_{t}⌋,  ask = ⌈*r*_{t} + *δ*_{t}⌉,"));
body.push(P(
  "with *s* = 2, *k*_{σ} = 1, cap = 20 and *σ̂*^{2} an EWMA (half-life 200) of squared one-tick mid changes. " +
  "Quotes are kept passive and the root layer clips the position to ±10 lots. The family earns little (1% of PnL) " +
  "but was positive for every product on every day."));

body.push(P(
  "**3.2 Voucher smile relative value.** Vouchers on the same underlying should be consistent with one smooth " +
  "volatility smile [4]; a strike that deviates from its neighbours is likely mispriced. With a zero rate, the " +
  "Black–Scholes [2] call price depends on volatility and time only through the total volatility *w* = *σ*√*T*:", { keepNext: true }));
body.push(EQ("*C*(*S*, *K*, *w*) = *S*·N(*d*_{1}) − *K*·N(*d*_{1} − *w*),     *d*_{1} = [ln(*S*/*K*) + *w*^{2}/2] / *w*."));
body.push(P(
  "Each tick we invert every strike’s mid for its implied *w*_{k} (safeguarded Newton). For each target strike *k* " +
  "we then fit a least-squares quadratic in moneyness *x* = ln(*K*/*S*) to the *other* strikes only:", { keepNext: true }));
body.push(EQ("*ŵ*_{−k}(*x*) = *a* + *b*·*x* + *c*·*x*^{2},     fair_{k} = *C*(*S*, *K*_{k}, *ŵ*_{−k}(*x*_{k})),"));
body.push(P(
  "and buy when fair_{k} − ask ≥ 7 or sell when bid − fair_{k} ≥ 7, closing once the mid returns to fair_{k}. " +
  "Leaving the target strike out stops a mispriced quote from pulling the fit toward itself, and a strike is " +
  "traded only when at least four other strikes yield a valid implied volatility. Because only *w* enters, no " +
  "expiry assumption is needed. In development tests every threshold from 4 to 10 was profitable on both days, the " +
  "sign-reversed signal lost heavily, and a one-tick execution delay kept about 95% of PnL. Delta-hedging with " +
  "LYCHEE was rejected: the net delta averaged only 2–6 LYCHEE lots, and hedging cost more than it saved."));

body.push(P(
  "**3.3 EMA z-score mean reversion (PEANUT_BUTTER, MANGOSTEEN).** These prices oscillate around a slowly moving " +
  "level. The deviation from a lagged EMA anchor *A* is scaled by an EWMA of squared deviations:", { keepNext: true }));
body.push(EQ("*d*_{t} = *mid*_{t} − *A*_{t−1},     *A* = EMA_{500}(*mid*),     *z*_{t} = *d*_{t} / √EWMA(*d*^{2})_{t−1},     enter against the move when |*z*_{t}| ≥ 2."));
body.push(P(
  "For PEANUT_BUTTER (volatility half-life 1,000 ticks, 300-tick warm-up) the exit target is the anchor *frozen at " +
  "entry*, so a drifting EMA cannot move the take-profit level away from an open trade, and a 1,000-tick maximum " +
  "holding time caps exposure if reversion fails. MANGOSTEEN enters only when the executable price (ask for a buy, " +
  "bid for a sell) lies beyond *A* ± 2 standard deviations, and exits when the mid crosses back over *A* or after " +
  "1,000 ticks."));

body.push(P(
  "**3.4 Trend following (PAPER_LANTERNS, TELLURIUM, FRUIT_BASKET).** These products show persistent intraday " +
  "drifts that a mean-reversion rule would fight (finding 3), the setting in which time-series momentum works [3]. " +
  "Each product uses the trend detector that suits its price path:", { after: 50 }));
body.push(BULLET("**PAPER_LANTERNS:** slope *β*_{t} of an OLS line through the last 50 mids. A position opens at full " +
  "size when |*β*_{t}| > 0.05 price units per tick and is held until *β*_{t}·side ≤ 0.02; the gap between the two " +
  "bands (hysteresis) prevents flipping around a single threshold. A forecast gate takes a price level only if the " +
  "fitted value plus 50 ticks of slope beats that level by more than half the current spread."));
body.push(BULLET("**TELLURIUM:** a causal directional-change detector confirms a swing high or low once price " +
  "reverses by 10 from the extreme; confirmed pivots are never revised, so no future data is used. When the latest " +
  "confirmed pivot is a swing low, a long opens as soon as the mid breaks above the preceding swing high (mirror " +
  "image for shorts). The stop starts at that swing low and trails each newly confirmed low, and each setup is " +
  "traded only once."));
body.push(BULLET("**FRUIT_BASKET:** *d*_{t} = EMA_{50}(*mid*) − EMA_{200}(*mid*), both from prior ticks. After a " +
  "500-tick warm-up the target is +40 lots when *d*_{t} exceeds half the bid–ask spread and −40 lots when it is " +
  "below minus half the spread; the position is flattened once *d*_{t} changes sign against it."));

body.push(P(
  "**3.5 Blended mean reversion (TOFFEE_CAKE, JELLY).** Both products reverted around stable centres on the " +
  "development days, and a placebo test confirmed the TOFFEE_CAKE edge: none of 100 random-entry placebos matched " +
  "it, and the opposite (momentum) rule lost money. Because a fixed centre is risky if the level shifts out of " +
  "sample, each 50-lot limit is split into two 25-lot legs: a fixed-centre leg trading the band 5,000 ± 40 " +
  "(TOFFEE_CAKE) or 2,000 ± 80 (JELLY), and an adaptive leg trading |*z*| ≥ 2 around EMA_{3000} (*z* as in " +
  "Section 3.3). Each leg exits at its own anchor; the leg targets are summed into one order per product, sent only " +
  "at the best bid or ask and net of working orders. If the level drifts, the adaptive leg keeps trading while " +
  "exposure to a broken fixed centre is capped at half the limit."));

// 4 Risk management
body.push(H1("4   Risk Management and Engineering"));
body.push(P(
  "**4.1 Position and order control.** Every module has a hard cap (10–50 lots), and before any order is sent " +
  "the root layer reserves capacity for orders that may still be working, so position limits hold even if every " +
  "outstanding order fills."));
body.push(P(
  "**4.2 Intraday drawdown kill switch.** Trend following carries the largest directional risk and 41.6% of PnL, " +
  "so its three products are guarded. For each product *p* the switch tracks the product’s own intraday PnL, " +
  "built from our fills and marked at the mid, together with its running peak:", { keepNext: true }));
body.push(EQ("PnL_{t} = cash_{t} + *q*_{t}·*mid*_{t},     peak_{t} = max_{s ≤ t} PnL_{s},     stop *p* for the day if peak_{t} − PnL_{t} > KILL_DD_{p}."));
body.push(P(
  "KILL_DD_{p} is 1.5× the largest intraday drawdown of *p* on days −2 and −1: 20,275.5, 40,680 and 765 COINS for " +
  "TELLURIUM, FRUIT_BASKET and PAPER_LANTERNS. When triggered, the product is flattened by crossing the touch and " +
  "receives no further orders that day. Orders sent in the last five ticks are remembered and reduced by reported " +
  "fills, and the flatten size is", { keepNext: true }));
body.push(EQ("*q*_{flatten} = |*q*_{t}| − (same-side orders that may still be working),"));
body.push(P(
  "so a flatten can never push the position through zero. The switch did not fire on any of the three historical " +
  "days; it is insurance against an OOS regime worse than any we observed."));
body.push(P("**4.3 Engineering safeguards.**", { after: 40 }));
body.push(BULLET("**Own-fill de-duplication.** Because the platform re-sends the latest fills (Section 2.3), a fill " +
  "is booked only if its timestamp is newer than the last one booked. This fix came from a real failure: v8 earned " +
  "523,191.5 COINS locally but about 333k on the platform, because re-sent fills were counted repeatedly in the kill " +
  "switch’s PnL and triggered it falsely. A probe isolated the cause, and the fix (v9, kept in v10) restored the " +
  "platform result to exactly 523,191.5 COINS."));
body.push(BULLET("**Duplicate-callback guard.** A repeated call with an already-processed timestamp returns no " +
  "orders and leaves memory unchanged."));
body.push(BULLET("**Compact state.** Module memory is packed losslessly (a key dictionary and compact JSON) to a peak " +
  "of about 5 KB, below the measured limit of about 8.5 KB."));
body.push(BULLET("**Isolation and dependencies.** Each sub-system runs inside its own exception guard, so a failure " +
  "skips only that part for one tick; the file imports only `datamodel` and the Python standard library."));

// 5 Results
body.push(H1("5   Results"));
body.push(P(
  "**5.1 Official backtest.** On the official platform backtest, v10 earned 225,130 COINS on day −2, 188,395 on " +
  "day −1 and 109,666.5 on day 0, a total of **523,191.5 COINS** (Figure 2). Table 2 splits the result by strategy " +
  "family and Figure 3 by product."));
body.push(...FIGURE("fig1_cumulative_pnl.png", 4.0,
  "**Figure 2.** Cumulative PnL of the full algorithm over the three official backtest days (thousand COINS; " +
  "dashed lines mark day boundaries).", 80));
body.push(CAP("**Table 2.** Official backtest PnL (COINS) by strategy family and day."));
body.push(TABLE([
  ["Family", "Products", "Day −2", "Day −1", "Day 0", "Total", "Share"],
  ["Trend following", "3", "96,222", "91,426", "29,884", "217,532", "41.6%"],
  ["Smile relative value", "8", "56,192", "30,298", "33,639", "120,129", "23.0%"],
  ["Blended mean reversion", "2", "39,063", "37,526", "27,613", "104,202", "19.9%"],
  ["EMA z-score mean reversion", "2", "30,754", "27,707", "17,798", "76,259", "14.6%"],
  ["Market making", "3", "2,899", "1,438", "732.5", "5,069.5", "1.0%"],
  ["Total", "18", "225,130", "188,395", "109,666.5", "523,191.5", "100%"],
], [2.0, 0.7, 0.85, 0.85, 0.85, 0.95, 0.65], { align: ["l", "r", "r", "r", "r", "r", "r"], bold_last: true }));
body.push(P(
  "Three patterns stand out. **Breadth:** all 18 traded products are profitable in total, and 53 of 54 " +
  "product-days are positive (the only loss is MANGOSTEEN on day −2, −538 COINS). **Concentration:** trend " +
  "following supplies 41.6% of PnL, which is why the kill switch guards exactly those three products. " +
  "**Decay:** daily PnL falls from day −2 to day 0, mainly in the trend family (96,222 to 29,884 COINS), while " +
  "the smile family recovers on day 0 and the other families decline more gently.", { before: 90 }));
body.push(P(
  "**5.2 Robustness to execution assumptions.** Local fills are simulated, so we re-ran days −2 and −1 under " +
  "alternative execution models (Table 3). PnL barely moves under stricter passive-fill rules, half liquidity or a " +
  "one-tick delay, and falls only 1.0% when every passive fill is removed. A cost of 1 COIN per unit traded has the " +
  "largest effect (−11.4%), consistent with signals that exceed the spread by a wide margin.", { after: 60 }));
body.push(CAP("**Table 3.** Local replay PnL (COINS) under execution stress, days −2 and −1. The base model reproduces the official result."));
body.push(TABLE([
  ["Execution scenario", "Day −2", "Day −1", "Total", "vs base"],
  ["Base (same-tick matching; equals official result)", "225,130", "188,395", "413,525", "—"],
  ["Strict: passive fills need a strictly better price", "224,547.5", "187,487", "412,034.5", "−0.4%"],
  ["Half: half of each historical trade’s volume", "223,443.5", "187,537", "410,980.5", "−0.6%"],
  ["Next tick: passive orders match next tick’s trades", "225,444", "188,130", "413,574", "+0.0%"],
  ["Take-only: no passive fills at all", "222,231", "186,957", "409,188", "−1.0%"],
  ["Cost: 1 COIN per unit traded", "198,187", "168,129", "366,316", "−11.4%"],
], [3.3, 0.85, 0.85, 0.9, 0.7], { align: ["l", "r", "r", "r", "r"] }));
body.push(...FIGURE("fig_pnl_by_product.png", 5.0,
  "**Figure 3.** Total official backtest PnL by product, grouped by strategy family (COINS). All 18 traded " +
  "products are positive; the eight untraded products contribute zero.", 90, 140));

// 6 Limitations
body.push(H1("6   Limitations, Out-of-Sample Risk and Future Work"));
body.push(P(
  "All parameters were chosen on the three available days, so every number above is in-sample and we have no OOS " +
  "PnL to report. We relied instead on design choices that should carry over: causal, mostly scale-free signals " +
  "(z-scores, smile residuals, slopes); five families rather than one; fixed levels paired with adaptive ones; and " +
  "smaller exposure where evidence was thin (fixed-centre legs halved to 25 lots, GOLDEN_PEARLS clipped to ±10). " +
  "The main remaining exposures are the fixed thresholds and centres (KILL_DD; AMETHYST 10,000; TOFFEE_CAKE 5,000; " +
  "JELLY 2,000), which may act too early or too late if volatility or price levels change, and the trend family’s " +
  "reliance on persistent intraday drifts."));
body.push(P(
  "**Future work.** (1) Scale KILL_DD and the fixed bands with rolling volatility so that thresholds adapt to new " +
  "regimes; (2) delta-hedge voucher inventory with LYCHEE when the net delta is large, and revisit the wing strikes " +
  "with a constrained smile; (3) test basket-versus-component and cross-pearl relative-value trades on the " +
  "untraded products."));

// 7 Conclusion
body.push(H1("7   Conclusion"));
body.push(P(
  "Our algorithm combines ten product-specific modules from five strategy families with causal risk controls and " +
  "platform-verified engineering. It earned 523,191.5 COINS on the official backtest with every traded product " +
  "profitable, and its returns hold up under every fill assumption we could test."));

// References
body.push(new Paragraph({
  children: [new TextRun({ text: "References", font: SERIF, size: 20, bold: true })],
  spacing: { before: 120, after: 40 },
  keepNext: true,
}));
const REFS = [
  "[1] M. Avellaneda and S. Stoikov, “High-frequency trading in a limit order book,” *Quantitative Finance*, 8(3):217–224, 2008.",
  "[2] F. Black and M. Scholes, “The pricing of options and corporate liabilities,” *Journal of Political Economy*, 81(3):637–654, 1973.",
  "[3] T. J. Moskowitz, Y. H. Ooi and L. H. Pedersen, “Time series momentum,” *Journal of Financial Economics*, 104(2):228–250, 2012.",
  "[4] J. Gatheral, *The Volatility Surface: A Practitioner’s Guide*, Wiley, 2006.",
];
for (const r of REFS) {
  body.push(new Paragraph({
    children: runs(r, { size: CAPTION }),
    spacing: { before: 0, after: 20 },
    indent: { left: 300, hanging: 300 },
  }));
}

// ---------------------------------------------------------------- document
const doc = new Document({
  creator: "Team 1",
  title: "Team 1 QuantiFi 2026 Abstract",
  description: "Abstract for the Team 1 QuantiFi 2026 submission (strategy v10)",
  styles: {
    default: { document: { run: { font: SERIF, size: BODY } } },
    paragraphStyles: [
      {
        id: "FooterText", name: "Footer Text", basedOn: "Normal", quickFormat: true,
        run: { font: SERIF, size: 17, color: GREY },
      },
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: SERIF, size: 25, bold: true, color: "000000" },
        paragraph: { spacing: { before: 140, after: 60 }, outlineLevel: 0 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 340, hanging: 200 } } },
        }],
      },
      {
        reference: "findings",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 340, hanging: 240 } } },
        }],
      },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1000, bottom: 1000, left: 1080, right: 1080, footer: 500 },
      },
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          style: "FooterText",
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Team 1 · QuantiFi 2026 Abstract · Page ", font: SERIF, size: 17, color: GREY }),
            new TextRun({ children: [PageNumber.CURRENT], font: SERIF, size: 17, color: GREY }),
            new TextRun({ text: " of ", font: SERIF, size: 17, color: GREY }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], font: SERIF, size: 17, color: GREY }),
          ],
        })],
      }),
    },
    children: body,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf);
  console.log("wrote", OUT);
});
