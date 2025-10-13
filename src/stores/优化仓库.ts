import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  OptimizationResult,
  OptimizationRange,
} from '../types';

// 优化任务状态接口
interface 优化仓库 {
  optimizations: OptimizationResult[];
  currentOptimization: OptimizationResult | null;
  isRunning: boolean;
  progress: number;

  // 优化操作
  addOptimization: (optimization: OptimizationResult) => void;
  updateOptimization: (id: string, updates: Partial<OptimizationResult>) => void;
  setCurrentOptimization: (optimization: OptimizationResult | null) => void;
  startOptimization: (strategyId: string, ranges: OptimizationRange[]) => Promise<void>;
  stopOptimization: (id: string) => Promise<void>;
  loadOptimizations: () => Promise<void>;
  setProgress: (progress: number) => void;
}

export const useOptimizationStore = create<优化仓库>()(devtools(
  (set) => ({
    optimizations: [],
    currentOptimization: null,
    isRunning: false,
    progress: 0,

    addOptimization: (optimization) => {
      set((state) => ({
        optimizations: [optimization, ...state.optimizations]
      }));
    },

    updateOptimization: (id, updates) => {
      set((state) => ({
        optimizations: state.optimizations.map(opt =>
          opt.id === id ? { ...opt, ...updates } : opt
        )
      }));
    },

    setCurrentOptimization: (optimization) => {
      set({ currentOptimization: optimization });
    },

    startOptimization: async () => {
      set({ isRunning: true });
      try {
        // TODO: 实际API调用
        set({ isRunning: false });
      } catch (error) {
        set({ isRunning: false });
        throw error;
      }
    },

    stopOptimization: async (id: string) => {
      // TODO: 实际API调用
      console.log('Stop optimization:', id);
    },

    loadOptimizations: async () => {
      try {
        // TODO: 实际API调用
      } catch (error) {
        console.error('加载优化任务失败:', error);
      }
    },

    setProgress: (progress) => set({ progress })
  }),
  { name: 'optimization-store' }
));
