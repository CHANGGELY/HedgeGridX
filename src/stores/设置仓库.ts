import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  UserSettings,
} from '../types';

// 用户设置状态接口
interface 设置仓库 {
  settings: UserSettings;

  // 设置操作
  updateSettings: (updates: Partial<UserSettings>) => void;
  resetSettings: () => void;
}

// 默认用户设置
const 默认设置: UserSettings = {
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

export const useSettingsStore = create<设置仓库>()(devtools(
  persist(
    (set) => ({
      settings: 默认设置,

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates }
        }));
      },

      resetSettings: () => {
        set({ settings: 默认设置 });
      }
    }),
    {
      name: 'user-settings',
      partialize: (state) => ({ settings: state.settings })
    }
  ),
  { name: 'settings-store' }
));
