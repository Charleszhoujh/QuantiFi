# 研究 agent 共同任务说明（主 agent 撰写，2026-10-27）

你是 QuantiFi 2026（UTEFA 算法交易比赛，IMC Prosperity 式接口）某一研究方向的独立研究员。目标是找到**有合理依据、可复现、符合规则**的候选，或给出有证据的“不采用”结论。不保证盈利；**不要为了漂亮回测无限调参**。

开始前必读：`../PROTOCOL.md`、`../RESEARCH_API.md`（目录 `/Users/charles/Desktop/UofT ECE/project/QuantiFi/Claude`）。

## 关键事实（主 agent 已验证）
- 26 个产品，每天 10,000 tick。历史成交稀疏：多数产品每天几十到一百多笔（AMETHYST 约 136 笔 / 358 单位），TELLURIUM 约 1,176 笔，每个 voucher 约 500–660 笔。被动成交量上限 ≈ 当天历史成交量。
- T 时刻的历史成交 100% 位于 T 时刻盘口价位（约 95% 在一档）⇒ T 的成交是 bot 吃 T 的盘口。base 模型据此在同一 tick 撮合被动单。
- base 模型下，挂在买一/卖一（同价）即可拿到全部同侧成交量（Wiki 原文允许同价成交）。这很可能偏乐观：`strict` 情景下同样策略为 0。所以**任何主要依赖被动成交的收益都必须报告 strict/half/next_tick/take_only 结果**，并说明 fill_dependence。
- 官方示例 1（挂买一卖一，满仓）基线：day -2 527、day -1 608（base）。
- 各日独立重置；期末按 mid 计价，同时报告退出价值。
- 期权：VOUCHER_<K>，K ∈ {6800,7000,7200,7300,7400,7500,7600,7750,7900,8100}，标的 LYCHEE，day -2 时距到期 8 天，无行权/结算。篮子：FRUIT_BASKET 由 DRAGONFRUIT/GRANADILLA/MANGOSTEEN 组成，权重未公布。

## 纪律（违反即视为结果无效）
1. 只写 `research/<你的字母>/`；不改 core/data/official/tools/tests 和别的方向。公共问题写进 REPORT.md 的 “Issues for root”。
2. 不读 `data/final/`、`../Documents/Data/*day_0*`、`../Codex/`、`../Deepseek/`。EDA 只用 day -2。
3. 每方向 ≤3 个可否定假设；第 1 轮每假设 ≤5 组参数；先写 preregistration.json 再运行。第 2 轮须写明新证据，仍 ≤5 组/假设；最多 2 轮。
4. 每轮只改一个关键因素；与同条件基线比较；保留全部试验（亏损、异常、淘汰）。
5. 只用当时可得数据（state + traderData）；禁止全天统计量、timestamp 硬编码、未来数据、随机打散。固定常数要写证据来源（官方文件或 day -2 EDA）。
6. strategy.py 只能 import datamodel 与标准库。
7. 选择规则：按 day -2 base 排名；day -1 base > 0 且 0 错误才可提名。
8. 不登录、不上网下载数据、不安装依赖、不调用付费 API。
9. 没跑过的测试写“未执行”，不估计、不编造数字。

## 提交物
见 RESEARCH_API.md “提交物”。另外在 `REPORT.md` 顶部给 10 行以内结论摘要。

## 最终回复（给主 agent，≤350 字）
状态（proposed/conditional/reject）、提名配置、两天 base 与 strict/half/next_tick/take_only/cost/adverse PnL 表、收益拆分（passive/take edge vs mark）、主要风险、给 root 的问题、所有文件路径。
