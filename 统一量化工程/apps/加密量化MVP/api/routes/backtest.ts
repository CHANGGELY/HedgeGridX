import { Router, type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

/**
 * GET /api/backtest/result
 * 返回最近一次回测结果 JSON。
 * 文件路径可通过环境变量 BACKTEST_RESULT_PATH 指定，
 * 默认读取项目根目录下 backtest_result.json。
 */
router.get('/result', async (_req: Request, res: Response) => {
  try {
    const resultPath = process.env.BACKTEST_RESULT_PATH || path.resolve(process.cwd(), 'backtest_result.json');
    if (!fs.existsSync(resultPath)) {
      return res.status(404).json({ success: false, error: '回测结果文件不存在，请先运行回测策略' });
    }
    const json = await fs.promises.readFile(resultPath, 'utf-8');
    return res.status(200).json({ success: true, data: JSON.parse(json) });
  } catch (err) {
    console.error('[回测 API] 读取错误:', err);
    return res.status(500).json({ success: false, error: '读取回测结果失败，请检查文件格式' });
  }
});

export default router;