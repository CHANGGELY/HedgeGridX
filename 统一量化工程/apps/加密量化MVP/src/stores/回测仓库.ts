import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  BacktestResult,
} from '../types';

// 回测结果状态接口
interface 回测仓库 {
  results: BacktestResult[];
  currentResult: BacktestResult | null;
  isRunning: boolean;
  progress: number;

  // 回测操作
  addResult: (result: BacktestResult) => void;
  setCurrentResult: (result: BacktestResult | null) => void;
  startBacktest: (strategyId: string) => Promise<void>;
  setRunning: (running: boolean) => void;
  setProgress: (progress: number) => void;
  loadResults: () => Promise<void>;
  fetchResult: () => Promise<void>;
}

export const useBacktestStore = create<回测仓库>()(devtools(
  (set) => ({
    results: [],
    currentResult: null,
    isRunning: false,
    progress: 0,

    addResult: (result) => {
      set((state) => ({
        results: [result, ...state.results]
      }));
    },

    setCurrentResult: (result) => {
      set({ currentResult: result });
    },

    startBacktest: async () => {
      set({ isRunning: true, progress: 0 });
      try {
        // TODO: 实际API调用
        // 模拟回测进度
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          set({ progress: i });
        }
        set({ isRunning: false, progress: 100 });
      } catch (error) {
        set({ isRunning: false, progress: 0 });
        throw error;
      }
    },

    setRunning: (running) => set({ isRunning: running }),
    setProgress: (progress) => set({ progress }),

    loadResults: async () => {
      try {
        // TODO: 实际API调用
      } catch (error) {
        console.error('加载回测结果失败:', error);
      }
    },

    // 获取最新回测结果
    fetchResult: async () => {
      try {
        const res = await fetch('/api/backtest/result');
        const json = await res.json();
        if (json.success) {
          set({ currentResult: json.data });
        }
      } catch (error) {
        console.error('[BacktestStore] fetchResult error:', error);
      }
    }
  }),
  { name: 'backtest-store' }
));
