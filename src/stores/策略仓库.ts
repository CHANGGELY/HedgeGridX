import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  StrategyConfig,
} from '../types';

// 策略管理状态接口
interface 策略仓库 {
  strategies: StrategyConfig[];
  currentStrategy: StrategyConfig | null;
  isLoading: boolean;
  error: string | null;

  // 策略操作
  addStrategy: (strategy: StrategyConfig) => void;
  updateStrategy: (id: string, updates: Partial<StrategyConfig>) => void;
  deleteStrategy: (id: string) => void;
  setCurrentStrategy: (strategy: StrategyConfig | null) => void;
  loadStrategies: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useStrategyStore = create<策略仓库>()(devtools(
  (set) => ({
    strategies: [],
    currentStrategy: null,
    isLoading: false,
    error: null,

    addStrategy: (strategy) => {
      set((state) => ({
        strategies: [...state.strategies, strategy]
      }));
    },

    updateStrategy: (id, updates) => {
      set((state) => ({
        strategies: state.strategies.map(s =>
          s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s
        )
      }));
    },

    deleteStrategy: (id) => {
      set((state) => ({
        strategies: state.strategies.filter(s => s.id !== id),
        currentStrategy: state.currentStrategy?.id === id ? null : state.currentStrategy
      }));
    },

    setCurrentStrategy: (strategy) => {
      set({ currentStrategy: strategy });
    },

    loadStrategies: async () => {
      set({ isLoading: true, error: null });
      try {
        // TODO: 实际API调用
        // 模拟数据
        setTimeout(() => {
          set({
            strategies: [],
            isLoading: false
          });
        }, 1000);
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : '加载策略失败',
          isLoading: false
        });
      }
    },

    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error })
  }),
  { name: 'strategy-store' }
));
