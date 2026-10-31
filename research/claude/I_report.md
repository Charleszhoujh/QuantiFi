> Provenance: written by research agent I as results/REPORT.txt; root copied it here verbatim on 2026-10-28. Numbers are claude_replay_v1.2 approximate replays, not official results.
>
> Root note (2026-10-28): root reproduced the I nominee with all 26 products loaded (base 29,142 / 24,169, max DD 12,198 / 9,575; artifacts/ns_whatif_plusI_stdout.txt). Root does NOT treat it as an eligible candidate: (1) its product set comes from a VR screen added after the Q statistics were seen; (2) root's own BRIEF.txt told agent I which products were positive on both days in the phase-1 family-wise band scan (PEANUT_BUTTER and BLACK_PEARLS among them), so day -1 is not independent validation for any product choice made here — this leak is root's error; (3) 103-108% of its PnL is one product. As a labeled what-if, adding it to spec_ns_v0B gives 57,567 / 52,954 with portfolio max DD 9,058 / 9,311: PnL/DD falls from 8.0 / 10.0 to 6.4 / 5.7, so it would also fail rule 3 of PHASE2_NOSMILE.md §3.

方向 I：均值回归的广度与回撤控制（claude_replay_v1.2 本地近似回放，不是官方成绩）

摘要（10 行以内）
1. 状态 conditional。唯一过门槛的新模块是 H2_VRscreen_posthoc（D 的 TOFFEE 区间规则，size = 限仓，交易 PEANUT_BUTTER / BLACK_PEARLS / BLUE_PEARLS）：base 29142 / 24169，最大回撤 12198 / 9575（PnL/DD 2.39 / 2.52），cost 26682 / 22269。全部 9 个情景中只有 cost/adverse/impact 与 base 不同。
2. 收益几乎全部来自 PEANUT_BUTTER（29888 / 26160，即模块的 103% / 108%）。BLACK -844 / -2015，BLUE +98 / +24。产品集合来自事后加上的 VR 筛选，所以最高只能算 conditional。
3. 预先写定的 Q 筛选（H2）被否定：选入 8/11 个产品，+10417 / -22066（FRUIT_BASKET -19633 / -38738）。Q 用的重叠窗口斜率在随机游走和趋势路径上同样为负。
4. H1 分级仓位被否定：两条腿上 4 种阶梯在 day -2 的 PnL 和 PnL/DD 都下降（TOFFEE 0.93-1.84 对 2.39；JELLY 1.53-1.75 对 2.33）。原因是利润来自浅幅回归，阶梯恰好在这些行情里仓位不足。
5. H3 风险叠加被否定：去偏方差、波动率缩放、500 tick 时间止损、|z|>=3.5 止损都降低了 day -2 PnL，没有一个在两天都提高 PnL/DD。
6. TOFFEE/JELLY 按规则保留原模块（D_toffee / E_jelly 的复刻，单元测试证明成交记录逐笔相同）。没有第 2 轮（理由见 results/round2_decision.txt）。

一、假设、收益来源、失效条件（preregistration.json，任何引擎运行前写定；prescreen_spec.json 在计算统计量之前写定）
H1 分级仓位（TOFFEE_CAKE + JELLY，同一配置两条腿）
  - 内容：只改仓位函数。z、执行方式、每档的回滞宽度（1.5 z）都不变。4 档阶梯，入场点为 e0+{0,.5,1,1.5}（up）或 e0+{-.5,0,.5,1}（mid）；出场或共用基线出场点（棘轮），或各档同步平移（lin）。基线 H1_bin = 一次满仓的二元区间。
  - 预期来源：mark 减去主动成交成本。
  - 失效条件：利润集中在浅幅行情（阶梯在这些行情里仓位不足）；PnL 降幅大于回撤降幅。
H2 统计量预筛（11 个未交易的非期权产品）
  - 内容：Q = (-beta_500) * 1.5 * sd(dev) / 平均价差，只用 day -2 计算，beta 两个半天都须为负，门槛 Q >= 1；之后用固定配置交易（D 的 TOFFEE 区间规则，size = 限仓）。
  - 失效条件：筛选不能预测可交易的回归。
  - 另外登记了一个事后的次级筛选：在 Q 规则之外加 VR_500_50 < 0.9。它是在看到 Q 值之后、任何引擎运行之前加上的，已明确标注。
H3 风险叠加（TOFFEE + JELLY，每次只改一个因素，对照 H1_bin）
  - 内容：debias（EWMA 方差除以启动权重）、volscale（入场时仓位 × min(1, 均值 sigma / 当前 sigma)）、hold500、zstop 3.5。
  - 失效条件：止损恰好在最差的位置退出回归交易；缩放在偏离最大（收益也最大）时减仓。

二、day -2 EDA 要点（results/eda_day-2.txt）
- TOFFEE（D 的 z）：二元规则共 23 段行情，最大 |z| 的四分位数为 1.85 / 1.97 / 2.63。12 段从未到 2.0，这些段每单位毛利 28.9；更深的 11 段只有 16.2。
- JELLY（E 的 z）：7 段行情，浅的 4 段每单位 56.0，深的 3 段 20.3。所以利润来自浅幅、快速的回归（H1 的失效条件成立）。
- D 的 EWMA 方差从 0 起步。到 warmup = 300 时只积累了 19% 的权重，sigma 约被低估为 0.44 倍，z 被放大约 2.3 倍。TOFFEE 当天前两段行情（tick 300-1000）的最大 |z| 为 4.95 / 4.66，产生了当天最大回撤 3775（tick 472-900，仓位 +50）。
- 预筛：Q 选入 8/11；VR < 0.9 再筛后剩 PEANUT_BUTTER（VR 0.64）、BLACK_PEARLS（0.67）、BLUE_PEARLS（0.80）。GOLDEN_PEARLS 的 VR 为 0.10，但它被钉在 8000 附近（sd(dev) 0.36，价差 3），Q = 0.18，被筛掉。

三、全部试验（第 1 轮；base，cost 情景来自 stress_round1_all.jsonl；共 13 组，0 错误）
配置                      d-2 pnl   dd      p/dd  cost    | d-1 pnl   dd      p/dd  cost
H1_bin（基线）            18582     3991    4.66  15632   | 19208     3438    5.59  16458
H1_up4                    11301     3410.5  3.31   9871   | 10938.5   3250    3.37   9643.5
H1_up4lin                  6447     2863.5  2.25   5004   |  7486.5   2777    2.70   6019.5
H1_mid4                   11824.5   3582.5  3.30   9217.5 | 12278     3250    3.78  10019
H1_mid4lin                11243.5   3514    3.20   9014.5 | 11812     3059    3.86   9717
H2_Qscreen（预先写定）    10417    32586    0.32   5037   | -22066   38017   -0.58 -26726
H2_VRscreen_posthoc       29142    12198    2.39  26682   | 24169     9575    2.52  22269
H2_all11_control         -81700    95207   -0.86 -143860  | -76423   89191   -0.86 -113481
H2_all11_flip_control   -121457   147285   -0.82 -183909  | -45811   51864   -0.88 -82927
H3_debias                 16140     3991    4.04  13790   | 17193     3360    5.12  14843
H3_volscale               16799     3957    4.25  14025   | 18155     3320.5  5.47  15543
H3_hold500                14582     4853    3.00  11632   | 17868     3579    4.99  15118
H3_zstop35                12570     5735    2.19   9620   | 19838     3438    5.77  17188

逐腿（产品层面，提名门槛按产品计算；p/dd = 产品 PnL / 产品最大回撤）
TOFFEE_CAKE    d-2 pnl / dd / p/dd           d-1 pnl / dd / p/dd           门槛
  H1_bin       9024 / 3775 / 2.39            11632 / 3250 / 3.58           通过（排名第 1）
  H3_volscale  8617 / 3548.5 / 2.43          10903 / 3250 / 3.35           通过
  H3_debias    7469 / 3375 / 2.21            11963 / 3250 / 3.68           通过
  H3_zstop35   7070 / 3375 / 2.09            12262 / 3000 / 4.09           通过
  H1_mid4      6547 / 3582.5 / 1.83          8211 / 3250 / 2.53            不通过（d-2 < 2×dd）
  H1_up4       6260 / 3410.5 / 1.84          7910.5 / 3250 / 2.43          不通过
  H3_hold500   5787 / 3775 / 1.53            10292 / 3892 / 2.64           不通过
  H1_mid4lin   5707 / 3514 / 1.62            7400 / 3059 / 2.42            不通过
  H1_up4lin    2651 / 2863.5 / 0.93          4786.5 / 2777 / 1.72          不通过
JELLY
  H1_bin       9558 / 4101.5 / 2.33          7576 / 2402 / 3.15            通过（排名第 1）
  H3_hold500   8795 / 4101.5 / 2.14          7576 / 2402 / 3.15            通过
  H3_debias    8671 / 4101.5 / 2.11          5230 / 2402 / 2.18            通过
  H3_volscale  8182 / 4101.5 / 1.99          7252 / 2344 / 3.09            不通过
  H1_mid4lin   5536.5 / 3232 / 1.71          4412 / 2054 / 2.15            不通过
  H3_zstop35   5500 / 7067.5 / 0.78          7576 / 2402 / 3.15            不通过
  H1_mid4      5277.5 / 3232 / 1.63          4067 / 1932 / 2.11            不通过
  H1_up4       5041 / 2875 / 1.75            3028 / 706 / 4.29             不通过
  H1_up4lin    3796 / 2485 / 1.53            2700 / 706 / 3.82             不通过
选择结果（results/selection.json）：
- 两条腿的规则提名都是 H1_bin，即保留原模块，不替换。
- 没有“低回撤替代”：没有一个过门槛的配置在两天的 PnL/DD 都高于 H1_bin。
- H2 模块：H2_Qscreen 不通过（day -1 < 0），H2_VRscreen_posthoc 通过，状态 conditional。
假设结论：
- H1 被否定（两条腿 day -2 的 PnL/DD 都下降）。
- H2（预先写定的 Q 筛选）被否定：被选入的组合在 day -1 亏损。按逐产品平均，被选入的仍比被筛掉的好（day -1 -2758 对 -18119），但没有用处。
- H3 被否定。只有 TOFFEE volscale 在 day -2 PnL/DD 略高（2.43 对 2.39，PnL 更低），day -1 更差。

H2 全部 11 个产品（band = 同一固定配置；flip = 同样时点、方向相反）
产品            Q     VR    选入(Q) 选入(VR) | band d-2  band d-1 | flip d-2  flip d-1
TELLURIUM       4.72  1.32  否     否      | -27430   -16825   |  23121    14432
PEANUT_BUTTER   8.47  0.64  是     是      |  29888    26160   | -39717   -33891
DRAGONFRUIT     9.96  1.09  是     否      |   2920    -1833   |  -5950    -1065
GRANADILLA      4.14  1.01  是     否      |    736    -4058   |  -3472     1419
MANGOSTEEN      2.94  1.05  是     否      |   -926     1309   |  -2258    -4656
FRUIT_BASKET    7.50  0.98  是     否      | -19633   -38738   |  16997    37042
WHITE_PEARLS    6.33  1.02  是     否      |  -1822    -2915   |    733     1997
BLACK_PEARLS    1.95  0.67  是     是      |   -844    -2015   |  -3590     -191
GOLDEN_PEARLS   0.18  0.10  否     否      | -62327   -37235   | -106623  -58235
PINK_PEARLS    -0.38  1.22  否（beta 两半为负，但 Q<1） 否 | -2360  -297 | 1386 -735
BLUE_PEARLS     1.16  0.80  是     是      |     98       24   |  -2084    -1928
- 两天 band 都为正的只有 PEANUT_BUTTER 和 BLUE_PEARLS（后者约等于 0）。
- 两天都是 flip 为正（动量）的有 FRUIT_BASKET 和 TELLURIUM。
- GOLDEN_PEARLS 被钉住，z 区间在它上面每天反复成交 56k / 32k 单位。

四、压力测试（results/stress_final.jsonl，含轨迹 records/；PnL / 最大回撤）
                      base          strict        half          next_tick     take_only     cost          price_only    adverse       impact
提名 d-2              29142/12198   29142/12198   29142/12198   29142/12198   29142/12198   26682/12378   29142/12198   26682/12378   28971/12183
提名 d-1              24169/9575    24169/9575    24169/9575    24169/9575    24169/9575    22269/9600    24169/9575    22269/9600    23937/9575
基线 H1_bin d-2       18582/3991    18582/3991    18582/3991    18582/3991    18582/3991    15632/4141    18582/3991    15632/4141    18734/3987
基线 H1_bin d-1       19208/3438    19208/3438    19208/3438    19208/3438    19208/3438    16458/3688    19208/3438    16458/3688    19102/3474
参照 JELLY 25 手 d-2  4617/1998     （所有成交情景相同）                                     4267/2033                   4267/2033     4709/1983
参照 JELLY 25 手 d-1  3952/1119     （同上）                                                 3802/1169                   3802/1169     3955/1119
提名的其他数字：
- 退出价值 29059 / 24169。
- 每 tick 调用耗时 p50 / p99 为 21 / 28 us。max 为 667 us；day -1 有一次 13373 us，可能是系统噪声。
- traderData 最多 223 B，0 错误。

五、提名者逐产品拆分（base；PnL = mark + take_edge，passive 0）
PEANUT_BUTTER
- d-2：29888 = 34809 - 4921。最大回撤 11204，均仓 -12.37，平均 |仓位| 25.0，完成 16 次来回，最长持有 982。
- d-1：26160 = 30065 - 3905。最大回撤 9575，均仓 -5.51，完成 13 次来回，最长持有 835。
- day -2 PB 从 3106 涨到 3403.5，而模块平均是净空头，所以收益不是方向性押注。
- 按 1000 tick 分块：两天都是 8/10 块为正；最好的两块占 60% / 62%。day -2 的 6000-7000 块亏 7151。
BLACK_PEARLS
- d-2：-844 = 1322 - 2166。
- d-1：-2015 = -915.5 - 1099.5。
- 时间止损触发（最长持有 1000/1001）。
BLUE_PEARLS
- d-2：98 = 1062.5 - 964.5。
- d-1：24 = 980.5 - 956.5。
- cost 情景下为负：-222 / -296。
基线 H1_bin
- TOFFEE：9024 = 24061 - 15037（d-2）；11632 = 28942.5 - 17310.5（d-1）。期末 ±50，退出价值 8476 / 11505。
- JELLY：9558 = 13497.5 - 3939.5；7576 = 9238.5 - 1662.5。

六、结论与适用边界
- TOFFEE / JELLY：保留原模块。二元区间已经是这里最好的仓位函数。
  - 回撤主要来自少数深幅行情：阶梯在这些行情里同样会加到满仓，而在利润所在的浅幅行情里仓位不足。
  - 要降回撤，唯一检验过的办法是按比例缩小仓位（JELLY 25 手：PnL/DD 2.31 / 3.53，与 50 手的 2.33 / 3.15 差不多），这改变的是规模，不是比率。
  - D 的 TOFFEE z 在开盘段被放大（方差启动偏差）。去偏后 day -2 回撤从 3775 降到 3375，但 day -2 PnL 也从 9024 降到 7469（day -1 从 11632 升到 11963）。原模块的部分利润依赖这个偏差，样本外是否存在不确定。
- 广度：用统计量预筛没有找到可靠的产品集合。
  - 预先写定的 Q 失败。VR 的事后筛选“成功”，但成功完全来自 PEANUT_BUTTER；同样被 VR 选入的 BLACK 两天都亏。
  - 所以可以说：PEANUT_BUTTER 在两天、两种统计量、反向对照下都表现为稳定的回归。不能说：这个筛选方法有效。
- 适用边界：
  - 只有两天证据，day -1 是重复使用的验证日。
  - 只做主动成交，不依赖被动成交模型。
  - PB 每天在 L1 主动成交 1300-1600 单位，价差约 6。
  - 前提是 PB 在 200-1000 tick 尺度上继续回归。

七、给 root 的问题（Issues for root）
1. 一品一模块：PEANUT_BUTTER 也出现在 E 被拒的 JELLY-PB 配对里，G 的成交流筛查也可能覆盖它，需要分配。
2. 是否从 H2 模块中去掉 BLACK_PEARLS / BLUE_PEARLS？
   - 按 PnL 去掉就是按 PnL 选产品，我没有做，留给 root 决定。
   - 只保留 PB 的产品层面数字：29888 / 26160，回撤 11204 / 9575，cost 28288 / 24860。
3. 组合规则 3 的风险：
   - 提名者 PnL/DD 2.39 / 2.52，低于 TOFFEE+JELLY 原模块对（4.66 / 5.59）。直接按 50 手加入，组合 PnL/DD 可能下降超过 10%。
   - PB 的缩小版本（例如 25 手）未执行。
4. 观察（来自对照组，不是登记的策略）：FRUIT_BASKET 与 TELLURIUM 两天都是 flip 盈利（动量）。若要利用，需要另外登记，不能直接采用。
5. 被钉住的产品（GOLDEN_PEARLS）会让任何 z 标准化规则反复成交（每天 -62k / -37k）。通用回归模块应加 sigma/价差下限。
6. 引擎上没有发现问题。工具没有拒绝写 .txt 文件，报告按要求写在 results/REPORT.txt。

八、运行命令（工作目录 /Users/charles/Desktop/UofT ECE/project/QuantiFi/Claude）
python3 research/I/eda_day-2.py > research/I/results/eda_day-2.txt        （只用 day -2；生成 prescreen_day-2.json）
python3 research/I/run_experiments.py round1   （results/round1_stdout.txt, experiments_round1_base.jsonl, stress_round1_all.jsonl, diagnostics_round1.jsonl）
python3 research/I/run_experiments.py select   （results/selection.json, select_stdout.txt）
python3 research/I/run_experiments.py final    （results/stress_final.jsonl, records/*.json.gz, records_round_trips.json, final_stdout.txt）
python3 research/I/summarize.py > research/I/results/summary.txt
python3 research/I/test_strategy.py            （21 个测试全部通过；results/test_stdout.txt）
默认 Trader() 复现提名者 29142 / 24169（results/default_config_check.txt）。
哈希：
- 第 1 轮运行时 strategy.py 的 sha256 前 16 位为 39cd5154a3b3b50e。
- 之后只把 DEFAULTS 改为提名配置，当前为 682aad190b020035。登记的运行都显式传入 legs，结果不受影响，已复核。
- preregistration.json 的 sha256 前 16 位为 f929dff3f4e5f962。

九、未执行
- 第 2 轮：未执行（停止条件，见 results/round2_decision.txt）。
- day 0：未执行（root 专用）。
- 官方网站校准：未执行。
- 与其他模块的组合：未执行。
- PB 缩小仓位版本：未执行。
- 只含 PB 的单产品配置：未执行（会构成按 PnL 选择，见第七节第 2 条）。
- day -2/-1 之外的稳健性检验：未执行（没有数据）。
