// 策略类型枚举
export enum StrategyType {
  BOLLINGER = 'bollinger',
  TURTLE = 'turtle',
  RSI = 'rsi'
}

// 信号类型枚举
export enum SignalType {
  LONG = 'long',
  SHORT = 'short',
  CLOSE_LONG = 'close_long',
  CLOSE_SHORT = 'close_short',
  HOLD = 'hold'
}

// 时间周期枚举
export enum TimeFrame {
  MIN_1 = '1m',
  MIN_5 = '5m',
  MIN_15 = '15m',
  MIN_30 = '30m',
  HOUR_1 = '1h',
  HOUR_4 = '4h',
  DAY_1 = '1d'
}

// 策略参数接口
export interface StrategyParams {
  // 布林线策略参数
  bollinger?: {
    period: number;
    std_dev: number;
    exit_period?: number;
  };
  // 海龟策略参数
  turtle?: {
    entry_period: number;
    exit_period: number;
    atr_period: number;
  };
  // RSI策略参数
  rsi?: {
    period: number;
    oversold: number;
    overbought: number;
  };
}

// 策略配置接口
export interface StrategyConfig {
  id: string;
  name: string;
  type: StrategyType;
  symbol: string;
  timeframe: TimeFrame;
  params: StrategyParams;
  leverage: number;
  initial_capital: number;
  commission_rate: number;
  slippage: number;
  min_margin_rate: number;
  contract_value: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 价格数据接口
export interface PriceData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// 交易信号接口
export interface TradingSignal {
  id: string;
  strategy_id: string;
  symbol: string;
  timestamp: string;
  signal: SignalType;
  signal_type: 'buy' | 'sell' | 'hold';
  price: number;
  position_size?: number;
  confidence: number;
  description: string;
  strength: number;
  status: 'active' | 'executed' | 'expired';
}

// 持仓信息接口
export interface Position {
  id: string;
  strategy_id: string;
  symbol: string;
  side: 'long' | 'short';
  size: number;
  entry_price: number;
  current_price: number;
  unrealized_pnl: number;
  timestamp: string;
  margin_used: number;
  status: 'open' | 'closed';
  leverage: number;
  entry_time: string;
}

// 回测结果接口
export interface BacktestResult {
  strategy_id: string;
  start_date: string;
  end_date: string;
  initial_capital: number;
  final_capital: number;
  total_return: number;
  annual_return: number;
  max_drawdown: number;
  sharpe_ratio: number;
  win_rate: number;
  profit_factor: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  avg_win: number;
  avg_loss: number;
  equity_curve: EquityPoint[];
  trades: Trade[];
  created_at: string;
}

// 资金曲线点接口
export interface EquityPoint {
  timestamp: string;
  equity: number;
  drawdown: number;
}

// 交易记录接口
export interface Trade {
  id: string;
  entry_time: string;
  exit_time?: string;
  side: 'long' | 'short';
  entry_price: number;
  exit_price?: number;
  quantity: number;
  pnl?: number;
  commission: number;
  status: 'open' | 'closed';
}

// 优化参数范围接口
export interface OptimizationRange {
  param_name: string;
  min_value: number;
  max_value: number;
  step: number;
}

// 优化结果接口
export interface OptimizationResult {
  id: string;
  strategy_id: string;
  strategy_type: StrategyType;
  symbol: string;
  timeframe: TimeFrame;
  param_combinations: ParamCombination[];
  best_params: StrategyParams;
  best_result: {
    total_return: number;
    sharpe_ratio: number;
    max_drawdown: number;
    win_rate: number;
  };
  best_combination?: Record<string, number>;
  parameter_ranges?: Record<string, ParameterRange>;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  created_at: string;
  completed_at?: string;
  start_time?: string;
  end_time?: string;
  completed_combinations?: number;
  total_combinations?: number;
}

// 参数组合接口
export interface ParamCombination {
  params: StrategyParams;
  result: BacktestResult;
  rank: number;
}

// 参数范围接口
export interface ParameterRange {
  min: number;
  max: number;
  step: number;
}

// 参数组合结果接口
export interface ParameterCombination {
  bollinger_period: number;
  bollinger_std: number;
  total_return: number;
  sharpe_ratio: number;
  max_drawdown: number;
  win_rate: number;
}

// 实时监控数据接口
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

// 策略状态接口
export interface StrategyStatus {
  strategy_id: string;
  is_running: boolean;
  current_position: number;
  unrealized_pnl: number;
  realized_pnl: number;
  last_signal: TradingSignal;
  last_update: string;
}

// 用户设置接口
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

// API响应接口
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 分页接口
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// 分页响应接口
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: Pagination;
}

// 图表数据接口
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

// 仪表板统计接口
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