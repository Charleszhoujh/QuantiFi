# MANGOSTEEN 合并版本验证

按2026-10-30用户“可以，使用加上吧”的授权，导出 **530611研究基准＋MANGOSTEEN MR500_z2** 的完整单文件新版本。保留原九个模块，新增一个M模块，共10模块、17个唯一可交易产品owner；没有加入D/G趋势、做市或买强卖弱配对，也没有重新调参。所有旧版本，包括final_v4，均保留。

- [下载新版Python](https://chatgpt.com/api/library/files/libfile_89f066a2c2e0819194dcaf2474931f6d/download)
- [本地完整单文件](candidate/QuantiFi_530611_plus_MR500_z2_v1.py)
- SHA256：`b573eb35406bd3aae42516db5e4509d8634b7e3086d4a2d09d4fd1698a5a3719`
- 大小142,196字节；比赛提供`datamodel`后可导入`Trader`并调用`run(state)`，不依赖本项目其他策略文件。新文件的交易状态全部通过traderData JSON持久化。

## 实际新文件回放

以下数值来自这次新文件9场实际回放，不是沿用预期值。三个日期已经反复用于研究，每天独立从空仓与零现金变化开始，不是新OOS，也不是官方成绩。

|情景|day−2|day−1|day0|合计PnL|最大单日回撤|已实现|未实现|
|---|---|---|---|---|---|---|---|
|base|226,716.5|187,835|119,740.5|534,292|32,818|517,437.43|16,854.57|
|delayed|229,024|194,000.5|115,671.5|538,696|35,700.5|522,550.04|16,145.96|
|adverse|228,463|193,697.5|115,431.5|537,592|35,733.5|521,477.85|16,114.15|

基础PnL从530,611增加3,681至534,292；最大单日回撤从34,802减少1,984至32,818。M的基础日贡献为−538 / +1,092 / +3,127，178笔成交、1,520手，三个日末均空仓，全部新增PnL已实现。day0占新增净利润约85%，不据此承诺未来稳健。

完整组合基础共有7,167笔成交、68,026手，已实现517,437.43、未实现16,854.57。原组合残仓仍不能按最后显示深度完全平掉；只将能够平的部分按真实档位计价、其余继续mid标记，终值为531,747.5，仍不是全部可提现现金。逐日/逐产品数据及末仓、部分平仓信息见[日表](results/summary_v1/daily.csv)、[产品表](results/summary_v1/products.csv)。

所有情景显式费用0。base按当前实际买卖价和共享深度成交，被动单按下一观察历史tape近似匹配；delayed延迟一观察激活，adverse=delayed＋严格被动价格＋被动tape量减半。half部分不削减主动盘口深度，不能称主动流动性减半仍盈利。真实队列、官方订单寿命/终值制度未完全确定；没有mid虚构成交、原子成交或末尾无深度强平。

## 来源与各腿配置

研究基准精确来源：`research/basket_231_20261029/candidates/research_v1/tell_pb2__plus_own_basket_trend.py`，SHA256 `073c3694040066d0dd16bb0587aa6ecfbcd96679fdde34baf3a6df08dbaa0b4a`。其FROZEN_CONFIG九个模块与最近530611回放逐字段一致，没有换成其他基准。final_v4的SHA256仍为`4224a112adf8c46c5420aae40793ef722ecb2ebf0e3d00d091cebba9d2f8e5cb`。

新增M原单文件SHA256 `f743c9ce867e715515214cfbbe79b6faf19cca03fb667cb9c2b88a48d1db0d3c`。使用已冻结的过去EMA半衰期500、z=2、cap40行为；EW500残差尺度、500观察热身、回到因果均值/1000观察退出及归零锁定不变。实际部分退出可使持仓超过信号时限，没有假设立即全平。

|模块|交易限仓|原样保留参数|
|---|---|---|
|A50|AMETHYST:50|{"a_cap":50,"f_cap":50,"a_clip":5,"f_clip":2,"f_edge":6,"f_exit":0,"f":false}|
|S_quad7_interior8_q50|VOUCHER_7000:50, VOUCHER_7200:50, VOUCHER_7300:50, VOUCHER_7400:50, VOUCHER_7500:50, VOUCHER_7600:50, VOUCHER_7750:50, VOUCHER_7900:50|{"mode":"take","strikes":[7000,7200,7300,7400,7500,7600,7750,7900],"smile":"quad","thr":7.0,"exit_band":0.0,"cap":50,"hedge_band":null,"r_per_day":0.0,"tte_days":8.0,"min_fit":4}|
|P_line50_gate_q50|PAPER_LANTERNS:50|{"mode":"scaled_hysteresis","cap":50,"window":50,"entry":0.05,"exit":0.02,"order_gap":4,"clip":50,"fair_gate":true,"forecast_horizon":50,"entry_depth":false}|
|T40_q50_original|TOFFEE_CAKE:50|{"product":"TOFFEE_CAKE","fair":5000,"entry":40,"exit":0,"position_cap":50,"execution":"original"}|
|J80_q50_neighbor|JELLY:50|{"product":"JELLY","fair":2000,"entry":80,"exit":0,"position_cap":50,"execution":"original"}|
|passive_implied_w2|PINK_PEARLS:20|{"mode":"implied","width":2,"skew":2,"max_hold":0,"position_cap":20}|
|TELLURIUM_swingbreak_plain_d10_q40|TELLURIUM:40|{"signal":"wave","product":"TELLURIUM","cap":40,"threshold":10,"mode":"swingbreak","fib":false}|
|H3_frozen_anchor_exit|PEANUT_BUTTER:50|{"anchor_hl":500,"sd_hl":1000,"warmup":300,"entry":2.0,"max_hold":1000,"cap":50,"frozen_exit":true}|
|H2_own_basket_trend|FRUIT_BASKET:40|{"mode":"trend","own":true,"cap":40}|
|MANGOSTEEN__MR500_z2|MANGOSTEEN:40|{"method":"mr","half_life":500,"z":2,"product":"MANGOSTEEN","cap":40}|

篮子模块的行情输入包含D/G/M，PINK模块读取五种珍珠；这只是观察列表。交易owner按risk_caps及实际订单判定。篮子只交易FRUIT_BASKET，M由新增模块单独持有；D/G没有订单。完整精确配置见[config.json](config.json)，来源与合并检查见[merge_plan](provenance/merge_plan.json)。

## 核验

root逐字段对比新单文件9场回放与旧已测`baseline_plus_MANGOSTEEN`配置，覆盖90,000观察、订单、实际成交、逐产品库存/权益、信号、pending及所有账户风险字段；只有身份和运行耗时元数据不参与相等比较。另与原530611核对：剔除M后全部旧订单/成交、产品路径和各产品PnL保持相同，组合权益增量逐tick等于M腿，未遗漏或重复交易腿。限仓及pending违规均0。19,659个已有文件的内容哈希无变化。

[root验证结果](verification/summary.json) · [独立审核](audit/REPORT_CN.md) · [完整交付清单](DELIVERY_MANIFEST.json)。独立审核完成30,000次隔离API观察、13,054,132项原CSV检查及720,081项旧基准不变检查，均通过；覆盖嵌入源代码、导入安全、冷JSON状态重建、重复回调和原始CSV成交账本。不存在Portal提交或真实交易。

## 复现

从QuantiFi/Codex运行，必须选择新的输出目录：

```bash
python3 -B research/mangosteen_merge_20261030/src/reproduce.py \
  --out research/mangosteen_merge_20261030/results/user_replay_001
```

固定执行新版三日base/delayed/adverse，并逐字段比较冻结配置回放。不会调整参数、替换任何旧策略或重复上传文件。新版本是本次用户批准的合并副本，官方提交状态仍为未提交。
