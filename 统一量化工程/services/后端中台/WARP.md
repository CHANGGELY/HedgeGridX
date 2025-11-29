# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

- 简介
  本仓库是一个基于 FastAPI 的加密永续合约回测与可视化项目。后端（FastAPI, 8000 端口）同时托管前端静态页（/ 返回 fastapi_backend/static/index.html），前端通过同源相对路径访问 API，并优先使用 WebSocket 推送回测进度与结果，必要时回退到轮询。回测核心引擎在 backtest_kline_trajectory.py，已内置数据预处理与缓存策略以提升多次迭代效率。

- 常用命令（开发/运行/质量）
  说明：Python 3.11+；建议启用 UTF-8；如需联网依赖或 CDN，使用本机 HTTP 代理 127.0.0.1:10808。
  
  环境与依赖
  - 激活虚拟环境（如存在 .venv）：
    .\.venv\Scripts\Activate.ps1
  - 安装依赖：
    pip install -r requirements.txt
  - 可选（用 pip-tools 生成锁定文件，与 CI 对齐）：
    python -m pip install -U pip setuptools wheel pip-tools
    pip-compile --resolver=backtracking requirements.in -o requirements.txt
    pip-compile --resolver=backtracking requirements-dev.in -o requirements-dev.txt
    pip install -r requirements-dev.txt

  本地启动（同源前后端，端口 8000）
  - 一键启动（Windows）：
    .\start_web_system.bat
  - 手动启动（可设本机代理）：
    $env:HTTP_PROXY = "http://127.0.0.1:10808"
    $env:HTTPS_PROXY = $env:HTTP_PROXY
    python -m uvicorn fastapi_backend.main:app --host 0.0.0.0 --port 8000 --reload
  - 访问：
    http://localhost:8000

  Docker/Compose（容器化验证）
  - 构建镜像（可透传宿主机代理）：
    docker build \
      --build-arg HTTP_PROXY=http://host.docker.internal:10808 \
      --build-arg HTTPS_PROXY=http://host.docker.internal:10808 \
      -t kline-backtest:local .
  - 运行镜像（挂载数据与缓存目录）：
    docker run --rm -p 8000:8000 \
      -e HTTP_PROXY=http://host.docker.internal:10808 \
      -e HTTPS_PROXY=http://host.docker.internal:10808 \
      -e DATA_DIR=/app/K线data -e CACHE_DIR=/app/cache \
      -v %cd%/K线data:/app/K线data \
      -v %cd%/cache:/app/cache \
      kline-backtest:local
  - 使用 Compose：
    docker compose up --build

  质量与检查（与 CI 配置一致）
  - 代码检查与自动修复：
    ruff check --fix .
  - 代码格式（检查/写入）：
    black --check .
    black .
  - 类型检查：
    mypy .
  - 预提交钩子：
    pre-commit install
    pre-commit run -a

- 稳定入口与启动命令（Never break userspace）
  - 后端入口恒定：uvicorn fastapi_backend.main:app --host 0.0.0.0 --port 8000 --reload
  - 包名不变：fastapi_backend；英文导出长期有效；内部允许全面中文化（通过别名兼容）。

- 前端依赖策略（CDN vs 离线）
  - CDN 方式：通过公共内容分发网络（如 jsDelivr）在线加载第三方前端库，优点是更快首屏、更小镜像、更易回滚；需可访问外网。
  - 完全离线：把依赖打包进仓库/镜像，无外网环境也能运行；缺点是镜像变大、升级慢。
  - 建议：默认使用 CDN（配合本地代理 127.0.0.1:10808）；如处于隔离/合规环境，再切换离线方案。

  测试
  - 运行全部测试（pytest.ini 配置见 pyproject.toml）：
    pytest -q
  - 运行单个测试：
    pytest tests/test_health.py::test_health -q

  回测脚本（命令行方式）
  - 使用自定义 ATR 参数运行快速回测：
    python -X utf8 run_backtest_with_custom_atr.py

- 运行时约定与目录
  - 环境变量可覆盖数据与缓存目录（默认相对路径）：
    DATA_DIR=K线data, CACHE_DIR=cache
  - 进度文件：回测时由后端写入 CACHE_DIR/progress.json，含 progress/message/logs/result，供前端轮询回退模式使用。
  - 大型 HDF5 数据位于 K线data/，默认文件：ETHUSDT_1m_2019-11-01_to_2025-06-15.h5。

- 高层架构与数据流（关键文件与交互）
  1) Web 前端（fastapi_backend/static/index.html）
     - const BACKEND_URL = window.location.origin；避免跨域与端口分裂。
     - 优先 WebSocket /ws/backtest 推送类型：progress|log|result；断线自动重连一次；失败降级为 /progress 轮询。
     - 主要交互：
       • GET /klines?symbol&start_date&end_date&timeframe → K 线数据（优先读周期缓存，缺失时从 HDF5 聚合）。
       • 点击“开始回测”→ 若未加载 K 线则先加载 → 发起 WS 回测；若 WS 不可用则 POST /backtest + GET /progress 轮询。

  2) FastAPI 后端（fastapi_backend/主程序.py，经 fastapi_backend/main.py 暴露 app）
     - 端点（英文 + 中文别名，等价）：
       • GET /,            GET /首页
       • GET /health,      GET /健康
       • GET /klines,      GET /K线
       • POST /backtest,   POST /回测
       • GET /progress,    GET /进度
       • WS  /ws/backtest, WS  /ws/回测
     - 子进程策略：优先 asyncio.create_subprocess_exec；在部分 Windows 事件循环下回退到 Popen + 线程读管道。

  3) 回测执行器（进度回测执行器.py）
     - 读取临时参数文件，更新 BACKTEST_CONFIG/STRATEGY_CONFIG/REBATE_CONFIG，调用 run_fast_perpetual_backtest_with_progress。
     - 最终 JSON 结果写到 stdout；stderr 输出包含形如 PROGRESS:cur/total:xx%:message 的进度行。

  4) 回测引擎（backtest_kline_trajectory.py）
     - 配置：ATR_CONFIG（波动率/阈值/紧急平仓）、STRATEGY_CONFIG（杠杆/价差/下单/风控）、MARKET_CONFIG（手续费/乘数）、REBATE_CONFIG（返佣）、RISK_CONFIG（可选退场）。
     - 默认绘图开关：False（更快、更轻量）。如需绘图，可在 CLI/环境变量中开启：BACKTEST_PLOT=1。
     - 组件：
       • FastPerpetualExchange：仓位/保证金/费用模型；基于 ETH_USDC_TIERS 动态档位杠杆；维持保证金精确计算；任一价格点均检查爆仓。
       • FastPerpetualStrategy：对冲网格；动态下单量=权益/杠杆；ATR ≥ 阈值时生成平衡订单降低净敞口；可选单笔止损。
     - 数据：HDF5 读取 1m K 线 → 时间窗口过滤 → 预处理缓存 cache/preprocessed_data_*.pkl（含全量缓存键 FULL_DATASET 与时间窗缓存键）。
     - 产出：trades（含 timestamp/side/price/fee/leverage）、equity_history；性能指标 total_return/max_drawdown/sharpe_ratio/win_rate 等（进度模式默认不绘图以避免阻塞）。

  5) 测试与 CI
     - 测试：tests/test_health.py 使用 FastAPI TestClient 校验 /health=ok；pytest 行为由 pyproject.toml 中 [tool.pytest.ini_options] 指定。
     - CI（.github/workflows/ci.yml）：Python 3.11；pip-tools 生成锁定文件；依次执行 ruff/black/mypy/pytest；push 时可选 docker build。

- 注意事项
  - 首次运行请确保存在 K线data/ 与 cache/ 目录（start_web_system.bat 会自动创建）。
  - 容器内访问宿主机代理使用 http://host.docker.internal:10808；本机开发使用 http://127.0.0.1:10808。
  - Windows 下的子进程兼容分支已内置，无需额外处理。
