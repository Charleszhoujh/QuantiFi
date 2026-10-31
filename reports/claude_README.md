# QuantiFi 2026 — Claude 版本

**冻结候选**：[`submission/QuantiFi_Claude_candidate.py`](submission/QuantiFi_Claude_candidate.py)（单文件，只依赖官方 `datamodel` 与标准库）。完整报告：[`reports/RESEARCH_REPORT.md`](reports/RESEARCH_REPORT.md)。

**所有成绩都是本地近似回放（claude_replay_v1.2），不是官方成绩。** 未登录、未上传、未提交比赛。三天数据此前都被 Codex / Deepseek 项目用过；day 0 是冻结后的一次性检查，已标记为已污染。

| 近似回放 PnL（Coins） | day −2 | day −1 | day 0（已污染） |
|---|---:|---:|---:|
| base | 70,801 | 51,409 | 33,626.5 |
| strict / take_only | 70,274 | 50,801 | 33,149 |
| cost（每单位 1 Coin） | 46,261 | 33,279 | 17,041.5 |
| adverse | 46,092 | 33,067 | 16,887 |

5 个模块：AMETHYST 公平价做市、TOFFEE_CAKE 与 JELLY 慢速均值回归、PAPER_LANTERNS 趋势时机、10 个 LYCHEE 期权的跨执行价微笑相对价值。未交易的 12 个产品都有记录在案的理由。没有初始资本定义，所以不给收益率。

## v10 可读版（2026-10-31，建议提交）

**文件**：[`submission/v10/FROZEN/QuantiFi_Claude_v10_FROZEN.py`](submission/v10/FROZEN/QuantiFi_Claude_v10_FROZEN.py)，冻结记录见 [`artifacts/freeze_v10.json`](artifacts/freeze_v10.json)。

**与 v9 的区别**：只改可读性，不改行为。
- 所有用 `exec` 运行的嵌入源码，都还原成普通 Python（每个模块一个构建函数）；
- 去掉了没有用到的模块和死代码；
- 文件开头加了给评委看的导读。

三天每一笔订单和成交都与 v9 相同（portal 上 v9 已验证为 523,191.5）。生成脚本：`submission/v10/build_readable.py`。

## v9 冻结候选（2026-10-31，当前最佳，portal 已验证：523,191.5，与本地逐日一致）

**文件**：[`submission/v9/FROZEN/QuantiFi_Claude_v9_FROZEN.py`](submission/v9/FROZEN/QuantiFi_Claude_v9_FROZEN.py)，冻结记录见 [`artifacts/freeze_v9.json`](artifacts/freeze_v9.json)。

**与 v8 的区别**：portal 会把最近一批 `own_trades` 在之后每次回调里重复下发，直到出现新成交为止。v8 的熔断会把这些重复成交反复计入，导致误触发（按 portal 方式重放，三天合计 332,924，与 portal 上约 333k 一致）。v9 按成交时间戳去重。正常撮合下与 v8 的每一笔成交都相同；在 portal 式重复下发下三天合计 523,192（[research/AB](research/AB/)）。

**已确认的 portal 语义**：
- 数据就是 day −2 / −1 / 0，显示三天合计；
- 没成交的订单只活一拍；
- traderData 上限约 8.5 KB，超过后状态被清空；
- `own_trades` 会被重复下发，直到出现新成交。

## v8 冻结候选（2026-10-31）

**文件**：[`submission/v8/FROZEN/QuantiFi_Claude_v8_FROZEN.py`](submission/v8/FROZEN/QuantiFi_Claude_v8_FROZEN.py)，冻结记录见 [`artifacts/freeze_v8.json`](artifacts/freeze_v8.json)。

**与 v7 的区别**：traderData 无损压缩（[research/AA](research/AA/)）。用户发现 portal 的 traderData 上限约为 8.5 KB，超过后状态等于被清空；v7 的峰值是 10.2 KB。v8 峰值为 4.96 KB，三天的每一笔订单和成交都与 v7 相同。

## v7 冻结候选（2026-10-31）

**文件**：[`submission/v7/FROZEN/QuantiFi_Claude_v7_FROZEN.py`](submission/v7/FROZEN/QuantiFi_Claude_v7_FROZEN.py)，冻结记录见 [`artifacts/freeze_v7.json`](artifacts/freeze_v7.json)。

**与 v6 的区别**：TOFFEE / JELLY 的入场和退出都只吃第一档，下单量不超过第一档的可见量，并保留一拍挂单预留；信号不变（[research/Z](research/Z/)，[Z2](research/Z2/)）。

**本地近似回放**：三天分别为 225,130 / 188,395 / 109,666（day 0 已污染）。
- 比 v6 多 +2,488 / +1,332 / +2,245；其他 16 个产品逐位相同。
- 6 种压力口径下，每一天都不差于 v6。
- 已知代价：TOFFEE 偶尔会有最多 45 手、最长 7 拍的建仓欠缺。

## v5 冻结候选（2026-10-30）

**文件**：[`submission/v5/FROZEN/QuantiFi_Claude_v5_FROZEN.py`](submission/v5/FROZEN/QuantiFi_Claude_v5_FROZEN.py)，冻结记录见 [`artifacts/freeze_v5.json`](artifacts/freeze_v5.json)；诊断版见 [`submission/v5/debug/`](submission/v5/debug/)。

**与 v4 的区别**：熔断平仓时，把所有可能还在途的同方向订单都计入，无论是原策略发的还是熔断自己发的；平仓永远不越过零（[research/V](research/V/REPORT.md)）。熔断不触发时与 v4 逐位相同。

## v4 冻结候选（2026-10-30）

**文件**：[`submission/v4/FROZEN/QuantiFi_Claude_v4_FROZEN.py`](submission/v4/FROZEN/QuantiFi_Claude_v4_FROZEN.py)，冻结记录见 [`artifacts/freeze_v4.json`](artifacts/freeze_v4.json)。

**与 v3 的区别**：只修了熔断执行层的两个问题（[research/V](research/V/REPORT.md)）。
- 外层加了防重复回调保护；
- 熔断平仓时扣除在途的平仓量。

熔断不触发时，v4 与 v3 逐位相同。

**portal 诊断版**：[`submission/v4/debug/QuantiFi_Claude_v4_DEBUG.py`](submission/v4/debug/QuantiFi_Claude_v4_DEBUG.py)。交易逻辑相同，会打印带 `[QF-DEBUG]` 的诊断行。

## v3 冻结候选（2026-10-30）

**文件**：[`submission/v3/FROZEN/QuantiFi_Claude_v3_FROZEN.py`](submission/v3/FROZEN/QuantiFi_Claude_v3_FROZEN.py)，冻结记录见 [`artifacts/freeze_v3.json`](artifacts/freeze_v3.json)。

**组成**：v2 冻结版，加上 GOLDEN_PEARLS 小仓位 A-S 做市（最多 10 手，[research/T](research/T/REPORT.md)）。共交易 18 个产品。

**本地近似回放结果**：

| 口径 | day −2 | day −1 | day 0（已污染） |
|---|---:|---:|---:|
| base | 222,642 | 187,063 | 107,422 |
| cost（每单位 1 Coin） | 195,699 | 166,797 | — |
| 全部订单延迟一拍 | 224,235 | 189,424.5 | — |

**本轮被否定的方向**：PB 尾部保护 [S](research/S/REPORT.md)、熔断阈值与分级保护 [R](research/R/REPORT.md)（结论是保留 k1.5）、VOUCHER 6800 / 8100 [T](research/T/REPORT.md)。

v2 冻结文件保留，可以随时回退。

## v2 冻结候选（2026-10-30）

**文件**：[`submission/v2/FROZEN/QuantiFi_Claude_v2_FROZEN.py`](submission/v2/FROZEN/QuantiFi_Claude_v2_FROZEN.py)，sha256 `d14b2ba2…`。冻结记录见 [`artifacts/freeze_v2.json`](artifacts/freeze_v2.json)。第一阶段的 `artifacts/freeze.json` 未改动。

**组成**：
- 底子是 Codex 534k 组合；
- TOFFEE / JELLY 换成混合锚回归（[research/N](research/N/REPORT.md)）；
- TELLURIUM、篮子、LANTERNS 加日内熔断，阈值为 1.5 倍最大开发日回撤（[research/O](research/O/REPORT.md)、[research/R](research/R/REPORT.md)）。

**本地近似回放结果**：

| 口径 | day −2 | day −1 | day 0（已污染） |
|---|---:|---:|---:|
| base | 222,559 | 186,662 | 107,285.5 |
| cost（每单位 1 Coin） | 195,681 | 166,470 | — |
| 全部订单延迟一拍 | 224,152 | 191,250.5 | — |

- 熔断在真实三天上从未触发。
- Codex 合成 v2 的 60 天：平均 −5,132 / 天，最差 −135,696。这份数据已用于开发，不算盲测。

**相关研究**：Codex 组合审查 [research/M](research/M/REPORT.md)；被否定的方向 [K 珍珠](research/K/REPORT.md)、[L 被动报价](research/L/REPORT.md)、[P 中位数回归](research/P/REPORT.md)、[Q 行情切换](research/Q/REPORT.md)。

**提交前**：按队号改名为 `Team##QuantiFi2026.py`。本项目没有登录、上传或提交任何内容。

## 运行与复现（在本目录执行；Python 3.13，交易代码仅用标准库；画图需 matplotlib）

```bash
cd "/Users/charles/Desktop/UofT ECE/project/QuantiFi/Claude"
python3 tools/run_all_tests.py --output artifacts/user_tests_001
python3 tools/run_baselines.py
python3 tools/reproduce_candidates.py --out artifacts/user_repro_001
python3 tools/run_impact.py
python3 integration/evaluate.py integration/spec_v2.json --out artifacts/user_integration_001
SPEC=integration/spec_v2.json python3 submission/test_submission.py
python3 tools/final_check.py --out artifacts/user_final_check_001
python3 tools/verify_ledger.py artifacts/final_check/submission_day0_base.json.gz
python3 tools/static_check.py submission/QuantiFi_Claude_candidate.py
python3 tools/export_tables.py --integration artifacts/integration_v2_dispatcher --final artifacts/final_check
python3 tools/make_figures.py --integration artifacts/integration_v2_dispatcher --final artifacts/final_check
python3 tools/build_submission.py integration/spec_v2.json artifacts/user_rebuild.py
```

- 输出目录必须是新的，旧结果不会被覆盖。
- `final_check.py` 会先核对 `artifacts/freeze.json` 里的单文件、spec、core 和数据哈希，不一致就拒绝运行。它只复现已冻结的检查，day 0 不会因此变回未见数据。
- 用同一个 spec 重新构建，应得到与冻结文件相同的 SHA-256。
- 各方向的完整实验：`python3 research/<X>/run_experiments.py`，具体子命令见各自的 REPORT.md。

## 目录
| 路径 | 内容 |
|---|---|
| `PROTOCOL.md`, `RESEARCH_API.md` | 规则（已确认/数据验证/假设）、数据边界、研究纪律、接口 |
| `official/` | 2026-10-27 重新导出的 Wiki、Launch 文字、官方 datamodel 与示例 |
| `data/` | 只读 CSV（development = day −2/−1，final = day 0），`manifest.json` 记哈希 |
| `core/` | 统一引擎、数据加载、登记运行器；变更记录 `artifacts/core_changes.md` |
| `research/A…F/` | 各方向代码、登记、测试、全部实验日志、candidate.json、REPORT.md |
| `audit/` | 独立审查：`foundation/`（引擎）、`strategies_code/`（代码/泄漏）、`strategies_robustness/`（稳健性） |
| `integration/` | 组合器、共享调度器、spec_v1/v2 及备选、冲突与全产品诊断分析 |
| `submission/` | 冻结单文件与验收测试 |
| `artifacts/` | 复现、集成、冻结记录、day 0 检查、全部测试日志 |
| `reports/` | 研究报告、复现记录、逐日逐产品指标、实验索引、图表 |

## 提交前需要你决定或操作
1. 在官网运行 `official/example_trader_1.py`，用 day −2/−1 的 PnL 校准被动成交规则（本地预测：base 527/608，next_tick 370.5/392，strict 0/0）。
2. 是否去掉翼部执行价 VOUCHER_6800：day 0 亏 −11,581。这个判断来自 day 0，一旦修改，day 0 就变成开发数据。
3. 按真实队号重命名为 `Team##QuantiFi2026.py`，另外准备 5 页以内的 abstract。本项目没有替你填写或提交任何内容。
