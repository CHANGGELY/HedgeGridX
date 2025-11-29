// 通用类型
import type { TradingSignal } from './策略类型';
import type { Trade } from './回测类型';

export interface PriceData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface LiveMonitorData {
  symbol: string;
  current_price: number;
  price_change: number;
  price_change_percent: number;
  volume_24h: number;
  high_24h: number;
  low_24h: number;
  last_update: string;
}

export interface StrategyStatus {
  strategy_id: string;
  is_running: boolean;
  current_position: number;
  unrealized_pnl: number;
  realized_pnl: number;
  last_signal: TradingSignal;
  last_update: string;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  language: 'zh' | 'en';
  timezone?: string;
  autoSave?: boolean;
  autoSync?: boolean;
  defaultTimeframe?: string;
  maxConcurrentBacktests?: number;
  notifications: {
    email: boolean;
    push: boolean;
    signal_alerts: boolean;
    pnl_alerts: boolean;
    errors: boolean;
    signals?: boolean;
    backtest?: boolean;
  };
  risk_management: {
    max_position_size: number;
    max_daily_loss: number;
    auto_stop_loss: boolean;
  };
  chartSettings: {
    showGrid: boolean;
    animations: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: Pagination;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
  fill?: boolean;
}

export interface DashboardStats {
  total_strategies: number;
  active_strategies: number;
  total_return: number;
  daily_pnl: number;
  max_drawdown: number;
  win_rate: number;
  recent_trades: Trade[];
  equity_chart: ChartData;
}
