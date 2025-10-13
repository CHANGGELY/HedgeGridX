// 参数优化相关类型
import type { StrategyType, TimeFrame, StrategyParams } from './策略类型';
import type { BacktestResult } from './回测类型';
export interface OptimizationRange {
  param_name: string;
  min_value: number;
  max_value: number;
  step: number;
}

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

export interface ParamCombination {
  params: StrategyParams;
  result: BacktestResult;
  rank: number;
}

export interface ParameterRange {
  min: number;
  max: number;
  step: number;
}

export interface ParameterCombination {
  bollinger_period: number;
  bollinger_std: number;
  total_return: number;
  sharpe_ratio: number;
  max_drawdown: number;
  win_rate: number;
}
