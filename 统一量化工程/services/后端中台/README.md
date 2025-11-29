# 网格与回测可视化项目 — 框架选型与环境

本项目已为后续集成币圈择时量化回测框架做好环境准备，并给出框架选型结论与下一步计划。

## 框架选型结论

- 首选：Freqtrade（端到端，含回测/超参优化/多交易所/期货）。
  - 文档：https://www.freqtrade.io/
- 备选：Jesse（语法简洁、支持现货/期货/DEX、内置优化与图表）。
  - 文档：https://docs.jesse.trade/
- 研究加速：VectorBT（向量化与Numba加速，适合大规模参数搜索）。
  - 文档：https://vectorbt.dev/
- 高性能/工程化：Nautilus Trader（事件驱动、生产级、Rust内核+Python）。
  - 文档：https://nautilustrader.io/docs/

说明：Backtrader与backtesting.py更轻量，但在加密期货与长期维护方面不占优，建议作为补充学习材料而非主选。

## 当前环境

- 已创建 Python 虚拟环境：`.venv/`
- 基础工具已升级：`pip`、`setuptools`、`wheel`

### 激活方式（PowerShell）

```powershell
.\.venv\Scripts\Activate.ps1
```

若需退出：`deactivate`

## 前后端一体化与回测交互

- 同源策略：前端 `BACKEND_URL = window.location.origin`，接口均由 FastAPI (默认端口 `8000`) 提供，避免跨域与端口混乱。
- 回测推送：优先使用 WebSocket `/ws/backtest` 实时推送 `progress/log/result/error`，在 WS 不可用时自动回退为旧版轮询 `/progress`。
- 稳健性：WebSocket 通道支持一次自动重连；前端日志面板识别级别并与进度条联动；全局错误与资源加载错误将写入日志面板，便于定位问题。
- 预览与启动：Windows 下直接运行 `start_web_system.bat`，浏览器打开 `http://localhost:8000/`；开发验证可临时启用其他端口。

### Windows 兼容与错误处理改进（已验证）

- 事件循环兼容：在 Windows 上事件循环不支持异步子进程时，后端会自动切换为“同步回退模式”。同步执行期间实时写入进度文件，仍通过 WebSocket 推送 `progress/log/result`，确保前端体验一致。
- 错误信息不再为空：后端统一确保异常信息非空；当 `str(e)` 为空时，自动使用 `repr(e)` 作为兜底，提升可观测性。
- 结果解析更稳健：后端增加“混杂日志中的 JSON 提取”策略，依次尝试：直接解析、首尾大括号截取、配对提取最后完整对象。避免日志与结果交错时解析失败。
- 前端容错：WebSocket 错误分支会输出原始消息并自动回落到“进度结果模式”，保证回测完成后结果始终能显示。
- 验证结论：UI 实测“ETHUSDT 1m 2025-05-15→2025-06-15”回测可在兼容模式下稳定完成并展示结果（总回报率约 `-0.60%`，总交易数 `1476`）。

### 运行与回测验证

- 启动服务：`python -X utf8 -m uvicorn fastapi_backend.主程序:应用 --host 0.0.0.0 --port 8000 --reload`
- 打开页面：`http://localhost:8000/`，点击“开始回测”按钮，观察进度与日志；完成后查看资金曲线与回测结果面板。
- API 端点：
  - WebSocket：`/ws/backtest`
  - 轮询进度：`/progress`
  - HTTP 回测（备用）：`POST /backtest`

### 故障排查建议

- 端口无法访问：重启后端服务（如前述 `uvicorn` 命令），确认控制台出现“Application startup complete”。
- 前端无进度：检查浏览器控制台是否存在错误日志；若 WS 不可用，系统将自动回落至轮询模式。
- 数据加载失败：确认 `K线data/ETHUSDT_1m_2019-11-01_to_2025-06-15.h5` 等数据文件存在；如范围不匹配，调整日期到覆盖区间。

## 下一步计划

1. 将本地 K 线数据转换为目标框架的数据格式（不使用任何模拟数据）。
2. 将已有 ATR 相关策略逻辑迁移为框架的 `Strategy` 类。
3. 运行回测与超参数优化（如 Freqtrade Hyperopt / Jesse 优化器）。
4. 输出可视化与关键绩效指标（收益、回撤、SQN、破产概率等）。
5. 补充单元测试（AAA 模式，核心逻辑覆盖率 > 80%）。

## 执行约定

- 默认使用命令：`python -X utf8`（保证编码一致）。
- 所有删除操作将采用软删除并经确认后执行。
- 不引入不必要的依赖，保持代码简洁与可维护。