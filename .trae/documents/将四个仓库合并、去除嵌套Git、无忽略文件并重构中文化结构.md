## 目标与约束
- 合并为单一 Git 仓库（保留各自历史）。
- 移除所有嵌套 Git（子模块、子仓库），让 IDE 只识别根仓库。
- 不忽略任何文件（不使用 .gitignore），保证跨设备无缝开发。
- 按中文命名与清晰分层重构目录结构。

## 当前状态回顾
- 已把“加密量化MVP”和“网格和回测可视化”用 subtree 导入到 `统一量化工程/apps/加密量化MVP` 与 `统一量化工程/services/后端中台`，历史保留。
- `统一量化工程/services/后端中台/工具/interactive-feedback-mcp` 显示为 160000 gitlink（子模块形态）。
- IDE仍显示两个仓库（截图中的“动态对冲返佣网格/monorepo-snapshot”和“币圈/main”），说明存在嵌套 .git 或子模块。

## 合并方案（一步到位）
1) 将剩余项目以 subtree 导入，统一到单仓库：
- 动态对冲返佣网格（如需内容）→ `统一量化工程/services/交易引擎`
- 对冲网格MVP（已在根目录）→ 迁移到 `统一量化工程/packages/策略库` 并保留原文件。

2) 彻底移除嵌套 Git 与子模块：
- 删除所有子模块引用：`git submodule deinit -f path` → `git rm -f path` → 删除残留的 `.gitmodules`；
- 将 `interactive-feedback-mcp` 扁平化为普通目录（保留文件而非子模块指针）。
- 在所有子项目树下删除潜在的 `.git/` 目录，确保只有根 `.git/` 存在。

3) 不使用 .gitignore：
- 删除根 `.gitignore` 与子项目的 `.gitignore`，保留 `.gitattributes`（如需 LFS 或换行符设置）。
- 说明：不忽略会把 `node_modules`、数据文件等全部纳入版本管理，仓库体积会显著增大，但满足“任意设备直接拉取即可开发”的目标。

4) 大文件与 LFS 处理（两条可选）
- 方案A（完全不依赖 LFS）：
  - 取消 LFS 跟踪：`git lfs untrack "*.pkl" "*.h5"`；`git add --renormalize .`；提交。
  - 警告：远端仓库会非常大，首次克隆耗时长。
- 方案B（保留 LFS，但不忽略任何文件）：
  - 安装并启用 LFS：`git lfs install`；`git lfs track "*.pkl" "*.h5"`；提交 `.gitattributes`。
  - 跨设备开发需安装 LFS 后 `git clone` 自动拉取二进制文件。

5) 推送远端（保留历史）
- 创建远端仓库（GitHub/Gitee）；`git remote add origin <repo-url>`；`git push -u origin main`。
- 如有旧仓库需要保留备份，可同步推送分支到各自原远端（可选）。

## 目录重构（中文分层）
- `统一量化工程/apps/加密量化MVP`（前端应用）
- `统一量化工程/services/后端中台`（FastAPI 编排与数据服务）
- `统一量化工程/packages/共享协议`（前后端共享类型/Schema）
- `统一量化工程/packages/策略库`（网格/对冲策略与资金曲线，原对冲网格MVP）
- `统一量化工程/scripts`（跨项目脚本：数据预处理、迁移、发布）
- `统一量化工程/docs`（说明与架构文档）
- `统一量化工程/data`（K线与缓存数据，若不使用 LFS 则直接纳入版本）

## 中文命名与统一规范
- 文件/函数/变量尽量中文命名：如 `计算资金曲线.ts`、`回测执行器.py`、`策略参数.ts`。
- 每个文件首行中文注释，说明用途与模块定位。
- TypeScript 保证零报错；统一导出入口：`索引.ts`、`index.ts`。
- 接口契约对齐 `packages/共享协议` 与 `接口规范/回测结果.schema.json`。

## 验证清单
- `git status` 仅显示一个仓库；无 `.gitmodules`；子树文件为普通文件，不是 160000 gitlink。
- 任意新设备：`git clone` 后能直接运行前后端；若采用 LFS，需 `git lfs install`。

## 将执行的具体命令（确认后立即执行）
- 子模块与嵌套仓库清理：
  - `git submodule status` → 针对每个子模块执行 `git submodule deinit -f <path>`；`git rm -f <path>`；删除 `.gitmodules`。
  - 扫描并删除所有子项目 `.git/` 目录（仅保留根 `.git/`）。
- 删除所有 `.gitignore` 文件：`git rm -f --cached **/.gitignore` 与物理删除；提交说明。
- LFS处理（按你选择 A/B 执行相应命令）。
- 迁移 `对冲网格MVP` 到 `packages/策略库` 并统一导出入口；修正 import 路径。
- 创建远端并推送：`git remote add origin <url>`；`git push -u origin main`。

## 交付
- 单仓库 main 分支、无忽略文件、无子模块；
- 前后端与策略库目录清晰、中文命名统一；
- 远端可克隆即开发。

请确认是否按上面方案执行；另外，请选择大文件策略：A（完全不依赖 LFS）或 B（保留 LFS）。