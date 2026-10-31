# QuantiFi 2026 — local research candidate

已实现六方向研究、统一近似回放、独立审查、主agent复现、冻结和集成。**候选为AMETHYST做市＋未对冲VOUCHER_7500相对价值。所有成绩都是近似模型成绩，未运行官方平台。day0此前已污染。**

- [研究报告与图表](reports/RESEARCH_REPORT.md)
- [经本地验收的单文件](submissions/QuantiFi_candidate.py)
- [完整试验索引](reports/experiment_catalog.csv)：含失败、控制、诊断与复现，原日志不删除。
- [逐日逐产品指标](reports/daily_product_metrics.csv)
- [独立审查](audit/final_integration_review.md)
- [冻结配置与版本](artifacts/freeze.json)

基础近似PnL为day -2/-1/0：1930 / 2115 / 1087 Coins；综合压力为181 / 444 / **-629**。不要省略压力亏损、期末持仓或未验证规则。未保证盈利或获奖。

**运行与复现**

从本目录运行；本机交易/回放环境为Python3.13.2，仅用标准库。官方datamodel保存在official/，本地工具自动添加其导入路径。日志目录必须使用新的名字以保留旧结果。

```bash
cd "/Users/charles/Desktop/UofT ECE/project/QuantiFi"
python3 tools/run_all_tests.py --output artifacts/user_tests_001
python3 tools/reproduce_candidates.py A F --output-root artifacts/user_reproduction_001
python3 tools/evaluate_integration.py --output artifacts/user_integration_001
python3 tools/evaluate_integration.py --final --output artifacts/user_frozen_check_001
```

最后一条仅复现已冻结的最终检查：文件、core和数据hash必须与freeze一致。它不会重新选参；day0不能重新变成未见测试集。不要修改freeze来绕过检查。开始新研究时另建版本并承认已见数据。

各方向的完整初轮实验命令（会另存重跑记录，具体行为见该目录REPORT）：

```bash
python3 research/A/run_experiments.py
python3 research/B/run_experiments.py
python3 research/C/run_experiments.py
python3 research/D/run_experiments.py
python3 research/E/run_experiments.py
python3 research/F/run_experiments.py
```

独立账本验证，不调用回放引擎重新计算PnL：

```bash
python3 audit/verify_ledger.py artifacts/integration_development_v2/AF_day_-2_base.json.gz --out artifacts/user_ledger_check_001.json
```

生成报告/图表（只读已有结果，不调参）：

```bash
python3 tools/analyze_frozen_results.py
python3 tools/catalog_experiments.py
python3 tools/write_research_report.py
node tools/figures/render.mjs reports/figures/candidate-equity-input.json reports/figures/candidate-stress-input.json reports/figures/candidate-ablation-input.json reports/figures/candidate-delta-input.json
```

图表脚本使用本机已有Matplotlib3.11.2环境；路径覆盖及离线Recharts说明见[图表工具说明](tools/figures/README.md)。交易文件不依赖这些绘图库。PNG/SVG已实际检查；HTML构建成功但因本机Chrome沙箱限制未做浏览器视觉验收。

**目录与版本**

| 路径 | 内容 |
|---|---|
| official/ | 本次读取的Wiki、Launch文字、原datamodel与3个示例、来源元数据 |
| data/development/ | day -2/-1的只读原CSV |
| data/final/ | day0只读原CSV；此前已污染，本轮冻结后检查 |
| core/ | 唯一统一回放、限仓、现金/持仓核算和数据接口 |
| research/A…F/ | 各自独立代码、登记、测试、候选、所有实验输出及失败分析 |
| audit/ | 未参与策略开发的审查者代码、反例、独立账本、单文件验收 |
| artifacts/root_reproduction_v2/ | root在公共安全修复后亲自复现A/D/F；旧记录也保留 |
| artifacts/integration_development_v2/ | 当前单文件开发/验证、完整情景与消融 |
| artifacts/final_check/ | 冻结后day0的16条完整轨迹，含亏损 |
| artifacts/source_versions/ | 与原SHA一致的安全修复前helper |
| reports/ | 报告、指标CSV、632条保存结果的索引、PNG/SVG/HTML |
| submissions/ | 冻结单文件及已保留的旧构建版本 |

每个.json.gz回放包含逐tick曲线与逐笔成交；summary.json含逐产品和风险指标。现金初始为0不是投入资本，PnL来自cash+持仓×mid；未年化Sharpe。开发/验证两日独立重置，不假装日间连续性已确认。

**提交边界**

`submissions/QuantiFi_candidate.py` 是本地候选，不是已经提交或官方验收的文件。它使用官方 `from datamodel import Order`。若决定提交，需按真实队号命名 `Team##QuantiFi2026.py`，并另备官方要求的abstract；本次没有替你登录、上传、提交或生成带假队号的文件。官方成交时序、费用、订单持续、终值和运行资源限制仍需确认。
