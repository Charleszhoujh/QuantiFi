# 用户批准的最佳策略＋PINK合并验证

文件：[QuantiFi_peak_plus_pink.py](QuantiFi_peak_plus_pink.py)，82614字节。

SHA256：`4224a112adf8c46c5420aae40793ef722ecb2ebf0e3d00d091cebba9d2f8e5cb`。

状态：**用户批准的合并研究候选，未官方提交、未实盘运行**。2026-10-28用户明确要求合并已测试PINK cap20；未新增调参。原final_v3和PINK原件及其报告保持原样。

合并直接读取两个指定冻结单文件内的源码字符串和配置：原A＋8个内侧strike的Smile＋PAPER＋TOFFEE＋JELLY＋TELL全部不变，再增加`passive_implied_w2`（mode=implied、width=2、skew=2、max_hold=0、cap20）。各策略用独立memory键，一次统一限仓和待单检查；受交易的产品无重叠。新文件使用标准库＋官方`datamodel`，运行时不读取研究文件。内嵌策略源码逐字一致，共享Trader风险门AST一致。[构建证据](verification/build_manifest.json)。

## 重放结果

|情景|day−2|day−1|day0|三日总PnL|最大单日DD|
|---|---|---|---|---|---|
|base|130,934.5|109,931|81,729.5|322,595|19,577.5|
|strict|130,412|109,437|80,568.5|320,417.5|19,658|
|half|129,265|109,582|80,822|319,669|19,807|
|delayed|132,427|113,353|85,032.5|330,812.5|20,124.5|
|adverse|132,036|112,969|84,749.5|329,754.5|20,132|
|no_passive|128,427|109,359|80,411|318,197|19,894|
|delayed_remainder|132,416|113,345|85,030.5|330,791.5|20,124.5|
|delayed_no_passive|132,222.5|112,971|84,887.5|330,081|20,236|

全部费用0。base当前主动单按可见真实深度成交；被动单按下一观察历史成交带推断。strict要求被动改善价格，half使用半历史量，delayed是一观察延迟，adverse是delay＋strict＋half；delayed_remainder还允许主动剩余挂单，delayed_no_passive禁止被动成交。它们是执行情景，不是官方保证；delay并不保证比base更差。

基础三日 **322,595**、最大单日回撤 **19,577.5**，与以前已测试组合一致。原peak基础319295，PINK增加3300；原最大日内DD19868.5变19577.5。没有为了匹配这些数字改结果或参数。全24新候选回放逐tick对照同版组合：12条使用以前保存的组合记录，另12条为此前未保存的情景生成同配置参考；对照的订单、成交、权益、产品账务全部精确相等；36条新回放共360000观察、74657逐档/逐tape成交由原始CSV独立重建通过。[独立核对目录](verification/audit/ledger/)。

基础已实现 **291,298.43**，未实现 **31,296.57**。已实现是平均成本PnL，不是现金余额；最后PNL是现金＋持仓mid估值。

|日|已实现|未实现|末刻剩余深度退出后仍残留|
|---|---|---|---|
|-2|135,807.86|-4,873.36|{"TOFFEE_CAKE": -12, "VOUCHER_7300": 21, "VOUCHER_7500": -13}|
|-1|73,533.88|36,397.12|{"PAPER_LANTERNS": -16, "TELLURIUM": 13, "VOUCHER_7300": -4, "VOUCHER_7400": 37, "VOUCHER_7500": 34}|
|0|81,956.68|-227.18|{"JELLY": -14, "TELLURIUM": 11, "VOUCHER_7000": -34, "VOUCHER_7400": 2, "VOUCHER_7500": -28, "VOUCHER_7600": 22}|

PINK基础末仓−12/+12/+4，在最后剩余可见盘口可假设全部平掉，但并未真实平仓；旧组合的部分期权、TOFFEE、PAPER、TELL、JELLY库存仍无法由最后可见深度一次平尽。假设退出需先取消待单且盘口不变。逐日所有库存、剩余深度价值、运行耗时见[daily.csv](verification/daily.csv)，逐品种归因见[products.csv](verification/products.csv)。官方CPU/内存上限未确认。

## 合约与重复调用

Trader返回`(orders, 0, traderData字符串)`，时序状态只在traderData；重新创建实例与保留实例结果一致。对同一个完整输入重复调用产生同一结果，不代表宿主可把相同输出提交两遍。把前次返回memory带入下一次调用时，统一门预留上一代同向订单；明确target0退出扣除同向待平仓量，部分成交继续处理而不反穿零。普通PINK双边报价允许合法跨零建立反向库存。

保持冻结语义：**没有添加timestamp去重或exactly-once承诺**。任意重复提交、同一timestamp多次推进记忆、跨多代无限留单超出本研究一代生命周期契约。丢失/坏memory保守暂停一代。独立回归检查见[合约审核目录](verification/audit/contract/)。

三日都已多次使用，是本地研究成绩，不是新OOS或官方成绩。50000只是观察关系；PINK基础利润含长持仓，执行时序高度敏感。此次只做合并与验证，没有重新挑选策略、仓位或参数。

## 精确复现

从Codex目录执行，输出目录须为新路径：

```bash
python3 -B research/pearls_execution_20261028/src/run.py --stage file --config research/strategy_complementarity_20261028/candidates/final_v4/verification/merged_configs.json --scenarios base,strict,half,delayed,adverse,no_passive,delayed_remainder,delayed_no_passive --out research/strategy_complementarity_20261028/candidates/final_v4/verification/results/user_merged_001
```

`verification/build_merge.py`仅从两个给定哈希的原件构造，不导入或执行待提取源文件；如需重构应复制到新输出版本，不能覆盖此验证成品。原始保护哈希、最终交付哈希及Library保存结果存于verification/provenance/。
