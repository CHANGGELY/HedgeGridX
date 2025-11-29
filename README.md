<!-- 这个仓库是“统一量化工程”的对外总览文档，包含中文与英文说明，帮助你快速理解并上手开发。-->
<p align="center">
  <img src="assets/logo.svg" alt="HedgeGridX Logo" width="220" />
</p>

<p align="center">
  <a href="https://github.com/CHANGGELY/HedgeGridX/stargazers"><img src="https://img.shields.io/github/stars/CHANGGELY/HedgeGridX?style=social" alt="Stars"></a>
  <a href="https://github.com/CHANGGELY/HedgeGridX"><img src="https://img.shields.io/badge/双语-中文%2FEnglish-blue" alt="Bilingual"></a>
  <a href="#"><img src="https://img.shields.io/badge/架构-React%20%2B%20FastAPI%20%2B%20Python-black" alt="Stack"></a>
</p>

## 简介（中文）
- HedgeGridX 是一个“对冲网格量化工程”的统一单仓库，强调：
  - 双向持仓的网格与对冲策略
  - 中文化的代码命名与文件结构，便于学习与维护
  - 前端（React+Vite）与后端中台（FastAPI）清晰分层
  - 真实数据与任务编排（REST/WS、进度与结果缓存）

### 目录结构
- `统一量化工程/apps/加密量化MVP` 前端应用（React+Vite）
- `统一量化工程/services/后端中台` FastAPI 编排与数据服务
- `统一量化工程/packages/共享协议` 前后端共享类型与 JSON Schema
- `统一量化工程/packages/策略库/网格对冲` 网格/对冲策略与资金曲线模块
- `统一量化工程/docs` 说明与架构文档
- `统一量化工程/scripts` 开发与部署脚本

### 快速开始
- 前端：
  - `cd 统一量化工程/apps/加密量化MVP`
  - `npm install`
  - `npm run dev`
- 后端中台：
  - `cd 统一量化工程/services/后端中台`
  - `python -X utf8 -m uvicorn fastapi_backend.主程序:app --reload`

### 目标
- 打造中文学习友好的工业级量化工程；以模块化方式沉淀策略与回测管线；提供一致的接口契约与优雅的 UI 体验。

---

## Overview (English)
- HedgeGridX is a unified monorepo for “hedged grid quant engineering”, featuring:
  - Bidirectional positions with grid hedging strategies
  - Chinese-first naming and structured modules for learning and maintenance
  - Clear separation between React+Vite frontend and FastAPI backend gateway
  - Real data pipelines and job orchestration (REST/WS with progress/result caching)

### Structure
- `统一量化工程/apps/加密量化MVP` Frontend (React+Vite)
- `统一量化工程/services/后端中台` Backend gateway (FastAPI)
- `统一量化工程/packages/共享协议` Shared TS types and JSON Schema
- `统一量化工程/packages/策略库/网格对冲` Strategy library (grid/hedge, equity curve)
- `统一量化工程/docs` Documentation
- `统一量化工程/scripts` Scripts

### Quickstart
- Frontend:
  - `cd 统一量化工程/apps/加密量化MVP`
  - `npm install`
  - `npm run dev`
- Backend:
  - `cd 统一量化工程/services/后端中台`
  - `python -X utf8 -m uvicorn fastapi_backend.主程序:app --reload`

### Vision
- A production-grade, learning-friendly quant engineering platform with consistent contracts and premium UI/UX.

