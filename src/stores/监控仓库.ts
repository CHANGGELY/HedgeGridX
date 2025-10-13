import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  LiveMonitorData,
  StrategyStatus,
} from '../types';

// 实时监控状态接口
interface 监控仓库 {
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

export const useLiveMonitorStore = create<监控仓库>()(devtools(
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
