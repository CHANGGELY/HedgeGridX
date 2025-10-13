# 加密量化交易策略回测系统

## 项目简介

这是一个专业级的加密货币量化交易策略回测与分析平台，采用现代化的技术栈构建，为量化交易者提供全面的策略开发、回测、优化和监控功能。

## 技术栈

### 前端

- **React 18** - 现代化UI框架
- **TypeScript** - 类型安全的JavaScript
- **Vite** - 快速构建工具
- **TailwindCSS** - 实用优先的CSS框架
- **Recharts** - 专业图表库
- **Zustand** - 轻量级状态管理
- **React Router** - 路由管理
- **Framer Motion** - 动画库
- **Lucide React** - 图标库

### 后端

- **Node.js** - 运行时环境
- **Express.js** - Web框架
- **TypeScript** - 类型安全
- **CORS** - 跨域支持

### 开发工具

- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Nodemon** - 开发热重载
- **Concurrently** - 并发运行脚本

## 功能特性

### 策略管理

- 🎯 多种内置策略（布林线、海龟、RSI等）
- 📊 策略参数可视化配置
- 🔄 策略组合与优化
- 📈 实时策略监控

### 回测分析

- 📉 历史数据回测
- 💰 资金曲线计算
- 📊 风险指标分析
- 🎨 交互式图表展示

### 数据管理

- 📦 多交易所数据支持
- 🔄 实时数据更新
- 💾 数据缓存优化
- 📋 数据导入导出

### 用户界面

- 🎨 现代化响应式设计
- 📱 移动端适配
- 🌙 深色模式支持
- ⚡ 高性能渲染

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0
- Python 3.11.9（用于策略计算）

### 安装依赖

```bash
npm install
```

### 环境配置

```bash
# 复制环境变量模板
cp .env.example .env

# 根据需要修改 .env 文件中的配置
```

### 启动开发服务器

```bash
# 同时启动前端和后端开发服务器
npm run dev

# 或分别启动
npm run client:dev  # 前端开发服务器 (http://localhost:5173)
npm run server:dev  # 后端开发服务器 (http://localhost:3001)
```

### 代码质量

```bash
# 代码检查
npm run lint

# 自动修复代码问题
npm run lint:fix

# 代码格式化
npm run format

# 检查代码格式
npm run format:check

# TypeScript 类型检查
npm run check
```

### 构建部署

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 项目结构

```
├── src/                    # 前端源码
│   ├── components/         # 可复用组件
│   ├── pages/             # 页面组件
│   ├── hooks/             # 自定义Hook
│   ├── lib/               # 工具库
│   └── assets/            # 静态资源
├── api/                   # 后端API
│   ├── routes/            # 路由定义
│   └── server.ts          # 服务器入口
├── 择时策略回测/           # Python策略模块
│   ├── Signals.py         # 策略信号
│   ├── Position.py        # 持仓管理
│   ├── Evaluate.py        # 评估指标
│   └── config.py          # 配置文件
└── public/                # 公共资源
```

## 开发指南

### 代码规范

- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 和 Prettier 配置
- 组件采用函数式编程风格
- 使用 Tailwind CSS 进行样式开发

### 提交规范

- feat: 新功能
- fix: 修复问题
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建工具或辅助工具的变动

## 许可证

MIT License

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request
