# QuantiFi 2026 — Claude 版研究协议 v1（2026-10-27）

本目录是独立的新版本。所有本地成绩来自 **claude_replay_v1.x 近似回放**（当前 v1.2；变更见 `artifacts/core_changes.md`，新增 `impact` 压力情景），不是官方成绩。未登录、未上传、未提交比赛。

## 1. 规则：已确认 / 由数据验证 / 假设

### 1.1 已确认（来源：官方 Wiki，2026-10-27 重新导出，与 10-25 存档仅标题与 MANGOSTEEN 拼写不同；official/wiki_2026-10-27.txt；Launch 幻灯片文字 official/launch_text.txt；官方 datamodel.py 与 3 个示例）
- `Trader.run(self, state)` 每 tick 调用，返回 `(orders: dict[symbol, list[Order]], conversions=0, traderData: str)`。买量正、卖量负。
- 买单价格 ≥ 某个 bot 卖价即成交；剩余量成为挂单（Wiki 原文 “left as an outstanding quote”；持续多久未说明）。
- 被动成交：若我方价格**等于或优于**某笔历史成交价即可成交，成交价为我方价格（Wiki 买 100 的三个例子）。
- 限仓为绝对值；“若 run() 发出的报价超过限仓，订单会被自动取消”。各产品限仓见 core/common.py（pearls 20、TELLURIUM/水果/篮子 40、LYCHEE 200、每个 voucher 50、其余 50）。
- conversions 不使用，填 0。traderData 必须是字符串；AWS Lambda 不保证普通变量跨 tick 存活。
- 崩溃不会终止回测，只是忽略该 timestamp（Launch 幻灯片）。
- 盘口不会为空（Wiki/Launch）。每天 10,000 tick，时间戳 0…999,900 步长 100。
- voucher 为 LYCHEE 的看涨期权，day -2 时距到期 8 天；**不能行权、无结算**。CSV/运行时名称为 `VOUCHER_<strike>`（Wiki 写作 LYCHEE_VOUCHERS_*）。
- FRUIT_BASKET 由 DRAGONFRUIT、GRANADILLA、MANGOSTEEN 组成；**权重与兑换机制未给出**。
- 评分：Breadth、Depth、Communication（abstract ≤5 页）、OOS PnL（Launch：“PnL average across multiple OOS runs”；Wiki：day 1 为 OOS 评分日）。
- 官方示例 3 注释：“AMETHYST has a constant fair value of 10,000”。

### 1.2 由数据验证（程序检查，day -2 与 day -1）
- 时间戳 T 的每一笔历史成交都发生在 T 时刻盘口已有的价位上（day -2：49.6% 卖一、45.3% 买一、其余为 2/3 档；day -1：53.7% / 43.5% / 2.8%）。与 T±100 盘口的对齐弱得多。⇒ T 的成交是 bot 吃 T 的盘口；价位 ≥ 卖一为买方主动，≤ 买一为卖方主动。
- 盘口每 tick 26 个产品齐全，无交叉盘口；成交价均为整数。
- day 0 仅做哈希核对（与 Documents/Data 原文件一致）。

### 1.3 假设（未确认；以压力情景检验）
| 编号 | 假设（base） | 压力情景 |
|---|---|---|
| S1 | 我方 T 时刻订单先与 T 盘口撮合（按盘口价格，同轮订单共享扣减），剩余量再与 T 时刻历史成交撮合（Prosperity 式时序） | `next_tick`：与 T+100 成交撮合 |
| S2 | 同价成交计入（Wiki 原文），不考虑 bot 队列 | `strict`：须严格更优价 |
| S3 | 每笔历史成交量可全部给我方（同侧多张订单共享） | `half`：每笔量 ×0.5 向下取整 |
| S4 | 按同 tick 盘口判断主动方：卖方主动成交只能成交我方买单 | `price_only`：只看价格 |
| S5 | 无手续费 | `cost`：每单位 1 Coin |
| S6 | 订单只活一个 tick | 未建模更长存续 |
| S7 | 某产品买单合计（或卖单合计）可能超限 ⇒ 该产品本 tick 全部订单取消；买卖不相互抵消 | — |
| S8 | 每天独立：零现金、零仓位、空 traderData | — |
| S9 | PnL = 现金 + 仓位 × 最后 mid；另报按可见深度平仓的退出价值 | — |
| S10 | 自交（同产品买价 ≥ 卖价）本地视为错误并整产品拒单（比官方可能更严） | — |
| — | `take_only`：完全没有被动成交（最保守下限） | |
| — | `adverse`：strict + half + cost | |

**校准建议（需用户本人操作）**：在官方网站运行 `official/example_trader_1.py`，记录 day -2/-1 的 PnL。本地预测：base 527 / 608；next_tick 370.5 / 392；half 215 / 237；strict 0 / 0。这一个数字可区分 S1/S2/S3。

## 2. 数据划分与污染
- 三天数据在本版本之前**都已被** Codex 与 Deepseek 两个旧项目用于研究、选择和最终检查；主 agent 读过它们的报告摘要（含 day 0 的个别结果）。因此本地**没有真正未见的数据**；真正 OOS 只有官方 day 1。
- 本版本：day -2 = 开发；day -1 = 验证（作为通过/淘汰门槛，不用于排名）；day 0 = 冻结后由主 agent 一次性检查，标记为**已污染的最终检查**。
- 研究 agent 不得读取 `data/final/`、`Documents/Data/*day_0*`、`Codex/`、`Deepseek/` 目录。`core/data.py` 在没有 `artifacts/freeze.json` 时拒绝加载 day 0。
- 冻结后如有任何实质修改，必须注明 day 0 已变为开发数据。

## 3. 研究纪律
- 每方向 ≤3 个可否定假设；第 1 轮每假设 ≤5 组参数；**运行前**写 `preregistration.json`（含理由、失效条件、参数范围、选择规则、停止条件）。
- 先最简单基线，每轮只改一个关键因素，与同条件基线比较。
- 选择规则：按 day -2 base 排名；day -1 base 必须 > 0 才能提名（门槛不是排名）。
- 所有试验（含亏损、异常、淘汰）追加写入 jsonl，不删除、不覆盖。
- 增加第 2 轮预算须写明新证据；第 2 轮仍 ≤5 组/假设。
- 禁止：随机打散 tick；用全天统计量；按 timestamp 硬编码行情；读取未来数据；只报告赢家。
- 信号、归一化、参数估计和对冲比率只能用当时可得数据（state + traderData）。固定常数（如 AMETHYST=10000）须有官方或开发日证据，并写明来源。

## 4. 统一评估
- 唯一引擎：`core/engine.py`（claude_replay_v1），研究者不得修改 core/、data/、official/、tools/。
- 每个提名候选和其基线都要跑 base + strict/half/next_tick/take_only/cost/price_only/adverse，两天。
- 报告：逐日、逐产品 PnL、最大回撤、成交量（主动/被动）、最大与平均仓位、平均有符号仓位（方向暴露）、期末仓位、退出价值、mark PnL（持仓随价格变化）与 edge PnL（成交价相对 mid）、错误数、每 tick 调用耗时 p50/p99/max、traderData 最大字节数。
- 不把 tick 当独立样本；不年化 Sharpe；只有两天开发数据，任何结论都是弱证据。

## 5. 质量门槛（提名前必须满足）
- 0 错误（类型、限仓取消、自交、异常）。
- 仓位仅来自成交（引擎保证）；同一 tick 的买单合计、卖单合计分别不超限。
- traderData 可 JSON 序列化与恢复；冷启动、traderData 损坏、单边或空盘口不崩溃。
- 至少一项测试证明因果性（前缀运行结果不变）。
- 写明收益来源：被动 edge / 主动 edge / 持仓 mark；若主要来自单边持仓或单日，必须标注。
