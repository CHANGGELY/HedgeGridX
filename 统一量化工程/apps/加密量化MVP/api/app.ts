/**
 * This is a API server
 */

import express, { type Request, type Response }  from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import backtestRoutes from './routes/backtest.js';

// for esm mode
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// load env
dotenv.config();


const app: express.Application = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/backtest', backtestRoutes);

/**
 * 健康检查
 */
app.use('/api/health', (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: '服务正常运行'
  });
});

/**
 * 错误处理中间件
 */
app.use((error: Error, _req: Request, res: Response) => {
  console.error('服务器内部错误:', error);
  res.status(500).json({
    success: false,
    error: '服务器内部错误，请稍后重试'
  });
});

/**
 * 404 处理
 */
app.use((req: Request, res: Response) => {
  console.warn(`API 路径未找到: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    error: 'API 路径不存在'
  });
});

export default app;