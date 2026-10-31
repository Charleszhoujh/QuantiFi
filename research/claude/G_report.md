> Provenance: written by research agent G as results/REPORT.txt; root copied it here verbatim on 2026-10-28. Numbers are claude_replay_v1.2 approximate replays, not official results. Root reproduction (all 26 products loaded): H1.s10 and H1.s50 base/cost/impact and the sign-flipped controls match the report exactly (artifacts/ns_repro_G_stdout.txt).

方向 G 报告（知情成交流，第二阶段，不做期权定价）—— claude_replay_v1.2 近似回放，非官方成绩
（写成 results/REPORT.txt；主 agent 可转存为 REPORT.md）

摘要
1. 提名（voucher 模块，proposed）：H1.s10 = B 的 H1.h20_t3 原样（逐笔成交测试一致）。base 11279 / 10234，最大回撤 1284 / 660，PnL/DD 8.78 / 15.51；cost 8909 / 7244；impact 11210 / 10170；0 错误。
2. 收益来源：持仓择时 mark +14834 / +14719，主动成交 edge -3555 / -4485（每单位 1.5，半个价差），被动 0。不依赖被动成交：strict/half/next_tick/take_only/price_only 与 base 完全相同。
3. G-H1 容量：size 20/30/50 的 PnL 近似线性（s50 base 52441 / 48706），impact 只少 2-5%；但最大回撤增长略快于 PnL（PnL/DD 比 size 10 低 2-10%），按预登记的容量链条 (b) 全部失败 ⇒ 放大不提名。反号风险随规模线性放大（s50 反号 -88010 / -93037）。
4. G-H2 降回撤退出（flow 退出 th_exit 1.0/0.25、时间止损 150/300 tick）：没有一个在两天都提高 PnL/DD ⇒ 拒绝。flow 退出成交量翻倍，cost 下 fexit1.0 两天为负。
5. G-H3 非 voucher 成交流：预先写定的 day -2 筛选（screen_criteria.json）16 个产品 0 个通过 ⇒ 拒绝。未筛选对照 H3.allC1：base 1779.5 / -18636.5。筛选的两个"差一点"产品（PEANUT_BUTTER、JELLY）day -1 分别 -8322、-6787，说明筛选没有错杀。LYCHEE 自身成交流不可用（corr -0.06）。
6. 不含 voucher 的版本：G 没有可提名的模块。含 voucher 的版本：G 与 B 是同一个模块，不能重复计入。
7. 第 2 轮：未执行（没有能支持新配置的证据，理由见 §8）。

1. 假设（preregistration.json，运行前写定；筛选标准 screen_criteria.json 在筛选脚本之前写定）
H1 容量：只改 target size（10/20/30/50），信号与执行（只在一档、不超过可见一档量主动成交）不变。
   失效：任一天 impact 下 PnL 增幅 < 线性预期的 50%，或 base 回撤增长倍数 > PnL 增长倍数（逐级 10→20→30→50 链式判断）。
H2 降回撤退出：size 10，入场不变；'flow' = 持仓方向的 s < th_exit 时归零；'time' = 距上次同向 |F|≥th 超过 N tick 归零；新信号可重新入场。
   失效：没有变体在两天都有 PnL/DD > 一直持有到反向（H2.hold）。
H3 非 voucher 自身成交流：16 个产品先过 C1..C6 筛选（活跃度≥50 个有成交的 tick；corr(F, Δmid100) ≥ 0.10；10 块中 ≥8 块为正；扣除过去 1/10/100 tick 动量后偏相关 ≥0.07 且 ≥0.5×原相关；穿价进场后 100 tick 按 mid 计价为正；买/卖事件去趋势后方向对称）。
   失效：0 个通过即拒绝；allC1（10 个 C1 活跃产品、不筛选）只作对照记录。
选择规则（PHASE2 §3 + 本方向门槛）：day -1 base > 0；0 错误；两天 base PnL ≥ 2×当天 base 最大回撤；cost 两天 > 0；正向 − 反号 > 0（两天、base 与 impact）；H1 容量链条；H2 PnL/DD 门槛；按 day -2 base 排名。voucher 模块（H1∪H2）和非 voucher 模块（H3）分别提名。

2. 预期收益来源
voucher 吃单者是知情的（B 事件研究：买方主动成交后 100 tick 同一 voucher 上涨 2-4.6，持续到 500 tick）。跟随者持 ±size，靠 mark 赚钱，每次翻转付半个价差。R1/R2：每个 voucher 只用自己的成交与盘口；没有任何期权定价、没有跨执行价、没有用 LYCHEE 价格。与第一阶段 F 有重叠（B 测得同执行价持仓相关 +0.45..+0.63）；G 没有读 F。

3. 失效条件
- OOS 中 voucher 成交流不再知情：每天约 -3.5k..-4.5k（价差成本）加 ±70 单位 voucher 的随机 mark。
- 关系反号：反号对照 -18403 / -19169（size 10），s50 为 -88010 / -93037。
- 7 个 voucher 都受 LYCHEE 驱动，回撤相关。
- 官方 market_trades 若不含上一 tick 他人成交或口径不同，信号改变（B issue 1）。

4. 全部试验（round 1；无 round 2）。格式：base d-2/d-1 | base 最大回撤 | PnL/DD | cost | impact | 成交单位 | 反号对照 base | 错误
H1.s10      11279/10234   | 1284/660   | 8.78/15.51 | 8909/7244     | 11210/10170   | 2370/2990   | -18403/-19169 | 0  提名
H1.s20      22028/20235   | 2645/1329  | 8.33/15.23 | 17288/14255   | 21579/19786   | 4740/5980   | -36291/-38051 | 0  链条(b)失败
H1.s30      32516/29952   | 3977/2009  | 8.18/14.91 | 25406/20982   | 31415/29174   | 7110/8970   | -53857/-56627 | 0  链条失败
H1.s50      52441/48706   | 6648/3392  | 7.89/14.36 | 40591/33756   | 50572/46421   | 11850/14950 | -88010/-93037 | 0  链条失败
H2.hold     11279/10234   | 1284/660   | 8.78/15.51 | 8909/7244     | 11210/10170   | 2370/2990   | (=H1.s10 反号) | 0  基线（参数与 H1.s10 相同）
H2.fexit1.0  6204/4445    | 1026/626   | 6.05/7.10  | -136/-1445    | 6202/4430     | 6340/5890   | -25278/-22093 | 0  拒绝（cost<0）
H2.fexit0.25 8359/6943    | 972/665    | 8.60/10.44 | 3699/1973     | 8367/6933     | 4660/4970   | -22382/-21803 | 0  拒绝
H2.tstop150 10227/8260    | 1020/665   | 10.03/12.42| 7117/4510     | 10177/8235    | 3110/3750   | -19547/-19514 | 0  拒绝（只 day -2 改善）
H2.tstop300 10513/9974    | 1284/605   | 8.19/16.49 | 8063/6804     | 10454/9910    | 2450/3170   | -17909/-19444 | 0  拒绝（只 day -1 改善）
H3.allC1    1779.5/-18636.5 | 12706.5/24399.5 | 0.14/-0.76 | -1140.5/-21334.5 | 1976.5/-18580.5 | 2920/2698 | -17680.5/+3410.5 | 0 记录（不可提名）

H1 容量链条（预登记）：
  10→20：impact 增量 10369/9616（要求 ≥5605/5085，通过）；回撤倍数 2.06/2.01 > PnL 倍数 1.95/1.98（失败）
  20→30：impact 增量 9836/9388（要求 ≥5395/4946，通过）；回撤倍数 1.50/1.51 > PnL 倍数 1.48/1.48（失败）
  30→50：impact 增量 19157/17247（要求 ≥10472/9725，通过）；回撤倍数 1.67/1.69 > PnL 倍数 1.61/1.63（失败）
  机制（实测，base）：每单位 size 的 mark 从 1483/1472（s10）降到 1404/1423（s50），impact 下 1367/1376；主动成交成本恒为 1.5/单位；平均 |仓位|/size 0.992→0.986。即大仓位只在一档成交、翻转需要更多 tick，入场稍晚。容量本身（impact）不是瓶颈，回撤略超线性。
H2：tstop150 day -2 PnL/DD 10.03 > 8.78，但 day -1 12.42 < 15.51；tstop300 正相反。flow 退出成交量 ×1.7-2.7，把 mark 换成了价差成本。和 B 事件研究一致（信号的价格效应持续到 500 tick，提前退出放弃 mark）。
H3 筛选（results/eda_screen_day-2.txt）：0/16 通过。C1 活跃 10 个；PEANUT_BUTTER 只差 C3（7/10 块）；JELLY 差 C3、C5；TELLURIUM 成交流与动量相关 0.76、偏相关 -0.03；LYCHEE corr -0.06。
H3.allC1 逐产品 base（d-2 / d-1）：PEANUT_BUTTER 5021.5/-8321.5，JELLY 3119.5/-6787，TELLURIUM 1064/-5265，LYCHEE -2156/5474（平均仓位 +24.6/+20.5，趋势暴露），PAPER_LANTERNS -2792/641.5，AMETHYST -882.5/-825，WHITE -1293/-1352.5，PINK -469.5/-737，BLUE -242.5/-528.5，BLACK 410/-935.5。

5. 压力测试（全部 9 个情景，两天；轨迹在 results/records/）
格式：base strict half next_tick take_only cost price_only adverse impact | base 最大回撤 | base 退出价值
H1.s10 d-2:        11279 11279 11279 11279 11279 8909 11279 8909 11210 | 1284 | 11170
H1.s10 d-1:        10234 10234 10234 10234 10234 7244 10234 7244 10170 |  660 | 10125
CONTRA_H1.s10 d-2: -18403 ×5 情景相同, cost -20773, price_only -18403, adverse -20773, impact -18316 | 18503
CONTRA_H1.s10 d-1: -19169 ×5 情景相同, cost -22159, price_only -19169, adverse -22159, impact -19123 | 19189
H3.allC1 d-2:      1779.5 ×5, cost -1140.5, price_only 1779.5, adverse -1140.5, impact 1976.5 | 12706.5
H3.allC1 d-1:      -18636.5 ×5, cost -21334.5, price_only -18636.5, adverse -21334.5, impact -18580.5 | 24399.5
信息用（未提名，未参与选择）：info_H1.s20 d-2/d-1 base 22028/20235，strict..price_only 同 base，cost 17288/14255，adverse 17288/14255，impact 21579/19786，DD 2645/1329
                            info_H1.s50 d-2/d-1 base 52441/48706，strict..price_only 同 base，cost 40591/33756，adverse 40591/33756，impact 50572/46421，DD 6648/3392
cost 情景最大回撤：H1.s10 1403/680。每 tick 调用耗时 p50/p99/max：23/29/170 us（d-2）、23/34/186 us（d-1）。traderData ≤ 493 B（time 退出变体 ≤ 653 B）。

6. 逐产品拆分（提名 H1.s10，base；pnl = mark + take_edge + passive − fees）
产品           d-2: pnl  mark  take  平均仓位  || d-1: pnl  mark  take  平均仓位
VOUCHER_7300   3254 3869 -615 +1.07 || 1295 1760 -465 +1.26
VOUCHER_7400   1714 2089 -375 +1.37 || 3088 3733 -645 +1.27
VOUCHER_7500   1336 1771 -435 +3.11 || 2033 2588 -555 -0.46
VOUCHER_7600   2861 3596 -735 +1.14 || 1445 2090 -645 -2.86
VOUCHER_7750    611 1046 -435 +3.05 || 1765 2440 -675 -0.09
VOUCHER_7900   1082 1607 -525 -2.30 ||  628 1363 -735 -0.57
VOUCHER_8100    421  856 -435 +2.26 ||  -20  745 -765 -0.62
合计           11279 14834 -3555     || 10234 14719 -4485
被动 0、手续费 0；平均 |仓位| 9.6-10，几乎总在 ±10；平均有符号仓位在 ±3.1 以内（非静态趋势仓位）。13/14 个产品-日为正。
impact 下 d-1 VOUCHER_8100 有 3 单位被动成交（被削减的单子挂一 tick），passive -4.5。全部表格：results/summary_tables.txt。

7. 结论与适用边界
- voucher 模块：proposed，H1.s10（与 B 相同）。满足 PHASE2 全部门槛：day -1 > 0、0 错误、PnL ≥ 2×DD（8.78×、15.51×）、cost 两天 > 0、正向 > 反号。
- H1 放大：拒绝（按预登记链条）。证据是"容量够、回撤略超线性"，不是"容量不够"。若 root 想放大，这是选择规则之外的决定，需另行登记；反号/失效时亏损同比放大。
- H2：拒绝。H3：拒绝（筛选阶段），G 没有非 voucher 模块。
- 适用边界：只有两天、同一生成器；day -1 是第一阶段已用过的验证日；impact 情景不模拟 bot 撤单/对我们的反应；收益几乎全是 mark（择时），不是被动 edge。

8. 第 2 轮：未执行。理由：H1 失败在回撤倍数略大于 PnL 倍数；唯一的执行杠杆是穿到二/三档加快翻转，但实测 s50 相对 s10 的 mark 缺口约每单位 size 每天 49-79（s50 时 ≈ 每天 2.5-4k），而按每次翻转约 87 单位超出一档、假设二档比一档差 1、每天约 118-150 次翻转的粗略估算（未运行，仅为估算）额外成本约 10k/天以上，预期更差，不值得占用预算。H2 两种退出在两天的方向相反，没有新证据支持再试其他参数。H3 筛选 0 通过，按规则不再看个别产品。

9. 运行命令（项目根目录）
python3 research/G/eda_describe_day-2.py                  -> results/eda_describe_day-2.{txt,json}
python3 research/G/eda_screen_day-2.py                    -> results/eda_screen_day-2.{txt,json}（标准见 screen_criteria.json）
python3 research/G/test_strategy.py                       -> results/test_stdout.txt（16/16 OK）
python3 research/G/run_experiments.py > research/G/results/run_experiments_stdout.txt 2>&1
   注：第一次运行在全部登记试验与反号对照跑完之后、打印排名时崩溃（H2.hold 没有单独的反号对照，值为 None）。已加别名 H2.hold→CONTRA:H1.s10（两者参数完全相同），然后
python3 research/G/run_experiments.py --select-only          -> results/run_experiments_stdout_selection_rerun.txt（只从日志重算选择，不重新运行）
python3 research/G/run_experiments.py --select-only --post   -> results/run_experiments_stdout_post.txt（提名后 9 情景压力测试 + 轨迹）
python3 research/G/run_stress_info.py > research/G/results/stress_info_stdout.txt 2>&1   （s20/s50 信息用压力测试；首次以相同代码内联运行）
python3 research/G/summarize.py > research/G/results/summary_tables.txt
测试覆盖：冷启动；traderData 损坏（7 种）；单边/缺失/交叉盘口；int 类型；单 tick 限仓（size 50/999、各种仓位）；大 size 只吃一档可见量；flow 退出；时间止损与重新入场；size_frac；R2（其他产品的成交/盘口不影响本 voucher 订单）；反号对称；day -2 前 2000 tick 0 错误（base 与 impact）；前缀因果性；与 B 逐笔一致；每 tick 新实例 = 持久实例；只吃单时 base=strict=half=next_tick=take_only；中途丢失记忆不崩溃。

10. 未执行
第 2 轮；day 0（仅 root）；官网校准；与 F 模块的相关性（按 R1 未读 F）；H1.s30 的 9 情景压力测试（只有 base/cost/impact）；与 S0 组合的集成测试（root 负责）；half_life/th 敏感性（不在本方向，B 已测 4 组）。

11. Issues for root
(1) G 的提名就是 B 的模块，不要在组合里重复计入；它属于"含 voucher"版本，"不含 voucher"版本 G 没有贡献。
(2) 放大是本报告最有信息量的结果：impact 情景下容量几乎不受限，PnL/DD 每加大一级只降 2-10%。PHASE2 组合规则 3（PnL/DD 下降 ≤10%）与本方向的预登记门槛不同，请不要事后据此改 size；如要放大，需新登记并重新审查，且反号亏损同比放大。
(3) impact 情景只在价位离开可见盘口时恢复深度；voucher 价位中位数 1-3 tick 就变，所以 depth memory 很少起作用，也不模拟报价撤退。对大规模吃单，这个情景可能偏乐观。
(4) artifacts/freeze.json 已存在，core.data 在 allow_final=True 时会加载 day 0。G 从未传 allow_final（只用 run_registered/stress/load_day(-2)）。
(5) run_experiments.py 打印阶段的一次崩溃见 §9；全部 jsonl 日志未覆盖、未删除。
