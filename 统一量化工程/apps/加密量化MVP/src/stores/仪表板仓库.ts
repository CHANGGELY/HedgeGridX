import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  DashboardStats,
  Trade,
  PriceData,
} from '../types';

// 仪表板状态接口
interface 仪表板仓库 {
  stats: DashboardStats | null;
  recentTrades: Trade[];
  priceData: PriceData[];

  // 仪表板操作
  updateStats: (stats: DashboardStats) => void;
  loadDashboardData: () => Promise<void>;
  updatePriceData: (data: PriceData[]) => void;
}

export const useDashboardStore = create<仪表板仓库>()(devtools(
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
