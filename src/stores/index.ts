import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  StrategyConfig,
  BacktestResult,
  OptimizationResult,
  LiveMonitorData,
  StrategyStatus,
  UserSettings,
  DashboardStats,
  Trade,
  PriceData,
  OptimizationRange
} from '../types';

// 策略管理状态接口
interface StrategyStore {
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

// 回测结果状态接口
interface BacktestStore {
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

// 优化任务状态接口
interface OptimizationStore {
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

// 实时监控状态接口
interface LiveMonitorStore {
  marketData: LiveMonitorData[];
  strategyStatuses: StrategyStatus[];
  isConnected: boolean;
  lastUpdate: string | null;
  
  // 监控操作
  updateMarketData: (data: LiveMonitorData[]) => void;
  updateStrategyStatus: (status: StrategyStatus) => void;
  setConnected: (connected: boolean) => void;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  toggleNotifications: () => void;
}

// 用户设置状态接口
interface SettingsStore {
  settings: UserSettings;
  
  // 设置操作
  updateSettings: (updates: Partial<UserSettings>) => void;
  resetSettings: () => void;
}

// 仪表板状态接口
interface DashboardStore {
  stats: DashboardStats | null;
  recentTrades: Trade[];
  priceData: PriceData[];
  
  // 仪表板操作
  updateStats: (stats: DashboardStats) => void;
  loadDashboardData: () => Promise<void>;
  updatePriceData: (data: PriceData[]) => void;
}

// 默认用户设置
const defaultSettings: UserSettings = {
  theme: 'dark',
  language: 'zh',
  notifications: {
    email: true,
    push: true,
    signal_alerts: true,
    pnl_alerts: true,
    errors: true
  },
  risk_management: {
    max_position_size: 100000,
    max_daily_loss: 5000,
    auto_stop_loss: true
  },
  chartSettings: {
    showGrid: true,
    animations: true
  }
};

// 策略管理Store
export const useStrategyStore = create<StrategyStore>()(devtools(
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
        // const response = await api.getStrategies();
        // set({ strategies: response.data, isLoading: false });
        
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

// 回测结果Store
export const useBacktestStore = create<BacktestStore>()(devtools(
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
        // const response = await api.startBacktest(strategyId);
        
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
        // const response = await api.getBacktestResults();
        // set({ results: response.data });
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

// 优化任务Store
export const useOptimizationStore = create<OptimizationStore>()(devtools(
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
        // const response = await api.startOptimization(strategyId, ranges);
        set({ isRunning: false });
      } catch (error) {
        set({ isRunning: false });
        throw error;
      }
    },
    
    stopOptimization: async (id: string) => {
      // TODO: 实际API调用
      // await api.stopOptimization(id);
      console.log('Stop optimization:', id);
    },
    
    loadOptimizations: async () => {
      try {
        // TODO: 实际API调用
        // const response = await api.getOptimizations();
        // set({ optimizations: response.data });
      } catch (error) {
        console.error('加载优化任务失败:', error);
      }
    },
    
    setProgress: (progress) => set({ progress })
  }),
  { name: 'optimization-store' }
));

// 实时监控Store
export const useLiveMonitorStore = create<LiveMonitorStore>()(devtools(
  (set) => ({
    marketData: [],
    strategyStatuses: [],
    isConnected: false,
    lastUpdate: null,
    
    updateMarketData: (data) => {
      set({ 
        marketData: data,
        lastUpdate: new Date().toISOString()
      });
    },
    
    updateStrategyStatus: (status) => {
      set((state) => ({
        strategyStatuses: state.strategyStatuses.map(s => 
          s.strategy_id === status.strategy_id ? status : s
        ).concat(
          state.strategyStatuses.find(s => s.strategy_id === status.strategy_id) ? [] : [status]
        )
      }));
    },
    
    setConnected: (connected) => {
      set({ isConnected: connected });
    },
    
    startMonitoring: () => {
      set({ isConnected: true });
      // TODO: 建立WebSocket连接
    },
    
    stopMonitoring: () => {
      set({ isConnected: false });
      // TODO: 关闭WebSocket连接
    },
    
    toggleNotifications: () => {
      // TODO: 切换通知状态
      console.log('Toggle notifications');
    }
  }),
  { name: 'live-monitor-store' }
));

// 用户设置Store (持久化)
export const useSettingsStore = create<SettingsStore>()(devtools(
  persist(
    (set) => ({
      settings: defaultSettings,
      
      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates }
        }));
      },
      
      resetSettings: () => {
        set({ settings: defaultSettings });
      }
    }),
    {
      name: 'user-settings',
      partialize: (state) => ({ settings: state.settings })
    }
  ),
  { name: 'settings-store' }
));

// 仪表板Store
export const useDashboardStore = create<DashboardStore>()(devtools(
  (set) => ({
    stats: null,
    recentTrades: [],
    priceData: [],
    
    updateStats: (stats) => {
      set({ stats });
    },
    
    loadDashboardData: async () => {
      try {
        // TODO: 实际API调用
        // const response = await api.getDashboardStats();
        // set({ stats: response.data });
        
        // 模拟数据
        const mockStats: DashboardStats = {
          total_strategies: 5,
          active_strategies: 3,
          total_return: 15.67,
          daily_pnl: 1250.50,
          max_drawdown: -8.32,
          win_rate: 68.5,
          recent_trades: [],
          equity_chart: {
            labels: [],
            datasets: []
          }
        };
        
        set({ stats: mockStats });
      } catch (error) {
        console.error('加载仪表板数据失败:', error);
      }
    },
    
    updatePriceData: (data) => {
      set({ priceData: data });
    }
  }),
  { name: 'dashboard-store' }
));