import React, { useState } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import {
  Play,
  Pause,
  Square,
  Settings,
  Download,
  Filter,
  TrendingUp,
  Target,
  Clock,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Select, Input, Progress } from '../components/用户界面/索引';
import { useOptimizationStore, useStrategyStore } from '../stores';
import { OptimizationResult, ParameterRange, ParameterCombination, StrategyType, TimeFrame } from '../types';

// 模拟优化结果数据
const mockOptimizationResults: OptimizationResult[] = [
  {
    id: '1',
    strategy_id: '1',
    strategy_type: StrategyType.BOLLINGER,
  symbol: 'BTCUSDT',
  timeframe: TimeFrame.HOUR_1,
  param_combinations: [],
  best_params: {
    bollinger: {
      period: 20,
      std_dev: 2.0
    }
  },
    parameter_ranges: {
      bollinger_period: { min: 10, max: 30, step: 5 },
      bollinger_std: { min: 1.5, max: 2.5, step: 0.25 }
    },
    best_combination: {
      bollinger_period: 20,
      bollinger_std: 2.0
    },
    best_result: {
      total_return: 18.5,
      sharpe_ratio: 2.1,
      max_drawdown: -6.8,
      win_rate: 72.3
    },
    total_combinations: 25,
    completed_combinations: 25,
    progress: 100,
    status: 'completed',
    start_time: '2024-01-15T10:00:00Z',
    end_time: '2024-01-15T12:30:00Z',
    created_at: '2024-01-15T10:00:00Z'
  }
];

// 模拟参数组合结果
const mockParameterResults: ParameterCombination[] = [
  { bollinger_period: 10, bollinger_std: 1.5, total_return: 12.3, sharpe_ratio: 1.4, max_drawdown: -8.2, win_rate: 65.2 },
  { bollinger_period: 15, bollinger_std: 1.75, total_return: 15.8, sharpe_ratio: 1.8, max_drawdown: -7.1, win_rate: 68.9 },
  { bollinger_period: 20, bollinger_std: 2.0, total_return: 18.5, sharpe_ratio: 2.1, max_drawdown: -6.8, win_rate: 72.3 },
  { bollinger_period: 25, bollinger_std: 2.25, total_return: 16.2, sharpe_ratio: 1.9, max_drawdown: -7.5, win_rate: 69.8 },
  { bollinger_period: 30, bollinger_std: 2.5, total_return: 14.1, sharpe_ratio: 1.6, max_drawdown: -9.1, win_rate: 63.4 }
];

const Optimization: React.FC = () => {
  const { 
    isRunning, 
    progress,
    startOptimization,
    stopOptimization
  } = useOptimizationStore();
  const { strategies } = useStrategyStore();
  
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [optimizationMode, setOptimizationMode] = useState<'grid' | 'genetic' | 'bayesian'>('grid');
  const [parameterRanges, setParameterRanges] = useState<Record<string, ParameterRange>>({});
  const [viewMode, setViewMode] = useState<'scatter' | 'heatmap' | 'convergence'>('scatter');
  const [results] = useState<ParameterCombination[]>(mockParameterResults);
  const [optimization] = useState<OptimizationResult | null>(mockOptimizationResults[0]);



  const MetricCard = ({ title, value, change, icon: Icon, trend, description }: {
    title: string;
    value: string;
    change?: string;
    icon: React.ComponentType<{ className?: string }>;
    trend?: 'up' | 'down' | 'neutral';
    description?: string;
  }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
            {change && (
              <div className="flex items-center mt-2">
                <span className={`text-sm font-medium ${
                  trend === 'up' ? 'text-green-600' : 
                  trend === 'down' ? 'text-red-600' : 'text-slate-600'
                }`}>
                  {change}
                </span>
              </div>
            )}
            {description && (
              <p className="text-xs text-slate-500 mt-1">{description}</p>
            )}
          </div>
          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const handleParameterChange = (param: string, field: 'min' | 'max' | 'step', value: string) => {
    setParameterRanges(prev => ({
      ...prev,
      [param]: {
        ...prev[param],
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const handleStartOptimization = () => {
    if (!selectedStrategy) {
      alert('请先选择策略');
      return;
    }
    startOptimization(selectedStrategy, [
      { param_name: 'bollinger_period', min_value: parameterRanges.bollinger_period?.min || 10, max_value: parameterRanges.bollinger_period?.max || 30, step: parameterRanges.bollinger_period?.step || 5 },
      { param_name: 'bollinger_std', min_value: parameterRanges.bollinger_std?.min || 1.5, max_value: parameterRanges.bollinger_std?.max || 2.5, step: parameterRanges.bollinger_std?.step || 0.25 }
    ]);
  };

  const renderChart = () => {
    switch (viewMode) {
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={results}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="total_return" 
                name="总收益率"
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis 
                dataKey="sharpe_ratio" 
                name="夏普比率"
                stroke="#64748b"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
                formatter={(value: number, name: string) => [
                  name === '总收益率' ? `${value}%` : value.toFixed(2),
                  name
                ]}
              />
              <Scatter 
                fill="#3b82f6" 
                fillOpacity={0.7}
                stroke="#1e40af"
                strokeWidth={1}
              />
            </ScatterChart>
          </ResponsiveContainer>
        );
      
      case 'convergence': {
        const convergenceData = results.map((result, index) => ({
          iteration: index + 1,
          best_return: Math.max(...results.slice(0, index + 1).map(r => r.total_return))
        }));
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={convergenceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="iteration" 
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
                formatter={(value: number) => [`${value}%`, '最佳收益率']}
              />
              <Line 
                type="monotone" 
                dataKey="best_return" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      }
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题和控制 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">参数优化</h1>
          <p className="text-slate-600 mt-1">通过系统化搜索找到最优参数组合</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            筛选
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出结果
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            高级设置
          </Button>
        </div>
      </div>

      {/* 优化配置 */}
      <Card>
        <CardHeader>
          <CardTitle>优化配置</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 策略选择 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-900">策略设置</h3>
              <Select
                label="选择策略"
                options={[
                  { value: '', label: '请选择策略' },
                  ...strategies.map(s => ({ value: s.id, label: s.name }))
                ]}
                value={selectedStrategy}
                onChange={setSelectedStrategy}
                placeholder="选择要优化的策略"
              />
              <Select
                label="优化算法"
                options={[
                  { value: 'grid', label: '网格搜索' },
                  { value: 'genetic', label: '遗传算法' },
                  { value: 'bayesian', label: '贝叶斯优化' }
                ]}
                value={optimizationMode}
                onChange={(value) => setOptimizationMode(value as 'grid' | 'genetic' | 'bayesian')}
              />
            </div>

            {/* 参数范围设置 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-900">参数范围</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">布林线周期</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="最小值"
                      type="number"
                      value={parameterRanges.bollinger_period?.min || ''}
                      onChange={(e) => handleParameterChange('bollinger_period', 'min', e.target.value)}
                    />
                    <Input
                      placeholder="最大值"
                      type="number"
                      value={parameterRanges.bollinger_period?.max || ''}
                      onChange={(e) => handleParameterChange('bollinger_period', 'max', e.target.value)}
                    />
                    <Input
                      placeholder="步长"
                      type="number"
                      value={parameterRanges.bollinger_period?.step || ''}
                      onChange={(e) => handleParameterChange('bollinger_period', 'step', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">标准差倍数</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="最小值"
                      type="number"
                      step="0.1"
                      value={parameterRanges.bollinger_std?.min || ''}
                      onChange={(e) => handleParameterChange('bollinger_std', 'min', e.target.value)}
                    />
                    <Input
                      placeholder="最大值"
                      type="number"
                      step="0.1"
                      value={parameterRanges.bollinger_std?.max || ''}
                      onChange={(e) => handleParameterChange('bollinger_std', 'max', e.target.value)}
                    />
                    <Input
                      placeholder="步长"
                      type="number"
                      step="0.1"
                      value={parameterRanges.bollinger_std?.step || ''}
                      onChange={(e) => handleParameterChange('bollinger_std', 'step', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 优化控制 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-900">优化控制</h3>
              <div className="space-y-3">
                {!isRunning ? (
                  <Button 
                    onClick={handleStartOptimization}
                    className="w-full"
                    disabled={!selectedStrategy}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    开始优化
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      onClick={() => stopOptimization('current')}
                      className="w-full"
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      暂停优化
                    </Button>
                    <Button 
                      variant="danger" 
                      onClick={() => stopOptimization('current')}
                      className="w-full"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      停止优化
                    </Button>
                  </div>
                )}
                
                {isRunning && (
                  <div className="space-y-2">
                    <Progress value={progress} showLabel label="优化进度" />
                    <div className="text-sm text-slate-600 text-center">
                      已完成 {Math.floor(progress * 25 / 100)} / 25 个参数组合
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 优化结果概览 */}
      {optimization && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="最佳收益率"
            value={`${optimization.best_result.total_return}%`}
            change="最优组合"
            icon={TrendingUp}
            trend="up"
            description="参数优化最佳结果"
          />
          <MetricCard
            title="最佳夏普比率"
            value={optimization.best_result.sharpe_ratio.toFixed(2)}
            change="风险调整收益"
            icon={Target}
            trend="up"
            description="最优风险收益比"
          />
          <MetricCard
            title="优化进度"
            value={`${optimization.completed_combinations}/${optimization.total_combinations}`}
            change={optimization.status === 'completed' ? '已完成' : '进行中'}
            icon={Activity}
            trend="neutral"
            description="参数组合测试进度"
          />
          <MetricCard
            title="用时"
            value={optimization.end_time ? 
              `${Math.round((new Date(optimization.end_time).getTime() - new Date(optimization.start_time).getTime()) / 60000)} 分钟` :
              '进行中'
            }
            change="优化效率"
            icon={Clock}
            trend="neutral"
            description="总优化时间"
          />
        </div>
      )}

      {/* 结果可视化 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>优化结果分析</span>
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'scatter' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('scatter')}
              >
                散点图
              </Button>
              <Button
                variant={viewMode === 'convergence' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('convergence')}
              >
                收敛图
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>

      {/* 参数组合详情 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最佳参数组合 */}
        <Card>
          <CardHeader>
            <CardTitle>最佳参数组合</CardTitle>
          </CardHeader>
          <CardContent>
            {optimization && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-green-900">推荐参数</h4>
                    <Badge variant="success">最优</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(optimization.best_combination || {}).map(([key, value]) => (
                      <div key={key} className="bg-white p-3 rounded border">
                        <div className="text-sm text-slate-600">
                          {key === 'bollinger_period' ? '布林线周期' : '标准差倍数'}
                        </div>
                        <div className="font-medium text-slate-900">{String(value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded">
                    <div className="text-sm text-slate-600">总收益率</div>
                    <div className="font-medium text-green-600">
                      {optimization.best_result.total_return}%
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded">
                    <div className="text-sm text-slate-600">夏普比率</div>
                    <div className="font-medium text-slate-900">
                      {optimization.best_result.sharpe_ratio.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded">
                    <div className="text-sm text-slate-600">最大回撤</div>
                    <div className="font-medium text-red-600">
                      {optimization.best_result.max_drawdown}%
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded">
                    <div className="text-sm text-slate-600">胜率</div>
                    <div className="font-medium text-slate-900">
                      {optimization.best_result.win_rate}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 参数组合排行 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>参数组合排行</span>
              <Badge variant="info" size="sm">
                按收益率排序
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results
                .sort((a, b) => b.total_return - a.total_return)
                .slice(0, 10)
                .map((result, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={index === 0 ? 'success' : index < 3 ? 'warning' : 'default'}
                        size="sm"
                      >
                        #{index + 1}
                      </Badge>
                      <span className="text-sm font-medium">
                        周期: {result.bollinger_period}, 标准差: {result.bollinger_std}
                      </span>
                    </div>
                    <div className="font-medium text-green-600">
                      {result.total_return}%
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-600">
                    <div>夏普: {result.sharpe_ratio.toFixed(2)}</div>
                    <div>回撤: {result.max_drawdown}%</div>
                    <div>胜率: {result.win_rate}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Optimization;