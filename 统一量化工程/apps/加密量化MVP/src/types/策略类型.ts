// 策略类型与配置
export enum StrategyType {
  BOLLINGER = 'bollinger',
  TURTLE = 'turtle',
  RSI = 'rsi'
}

export enum SignalType {
  LONG = 'long',
  SHORT = 'short',
  CLOSE_LONG = 'close_long',
  CLOSE_SHORT = 'close_short',
  HOLD = 'hold'
}

export enum TimeFrame {
  MIN_1 = '1m',
  MIN_5 = '5m',
  MIN_15 = '15m',
  MIN_30 = '30m',
  HOUR_1 = '1h',
  HOUR_4 = '4h',
  DAY_1 = '1d'
}

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
