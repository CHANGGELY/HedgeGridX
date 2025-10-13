import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  RefreshCw,
  BarChart3,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Select, Progress } from '../components/用户界面/索引';
import { useBacktestStore, useStrategyStore } from '../stores';
import { BacktestResult } from '../types';

// 模拟回测结果数据
const mockBacktestResult: BacktestResult = {
  strategy_id: '1',
  start_date: '2024-01-01',
  end_date: '2024-06-30',
  initial_capital: 100000,
  final_capital: 115670,
  total_return: 15.67,
  annual_return: 31.34,
  max_drawdown: -8.32,
  sharpe_ratio: 1.85,
  win_rate: 68.5,
  profit_factor: 2.34,
  total_trades: 156,
  winning_trades: 107,
  losing_trades: 49,
  avg_win: 850.5,
  avg_loss: -420.3,
  equity_curve: [
    { timestamp: '2024-01-01', equity: 100000, drawdown: 0 },
    { timestamp: '2024-01-15', equity: 102500, drawdown: -1.2 },
    { timestamp: '2024-02-01', equity: 105000, drawdown: -0.8 },
    { timestamp: '2024-02-15', equity: 103200, drawdown: -2.5 },
    { timestamp: '2024-03-01', equity: 108000, drawdown: -1.1 },
    { timestamp: '2024-03-15', equity: 110500, drawdown: -0.5 },
    { timestamp: '2024-04-01', equity: 112000, drawdown: -3.2 },
    { timestamp: '2024-04-15', equity: 109800, drawdown: -4.8 },
    { timestamp: '2024-05-01', equity: 114500, drawdown: -2.1 },
    { timestamp: '2024-05-15', equity: 116200, drawdown: -1.5 },
    { timestamp: '2024-06-01', equity: 118000, drawdown: -0.8 },
    { timestamp: '2024-06-15', equity: 115670, drawdown: -2.3 },
    { timestamp: '2024-06-30', equity: 115670, drawdown: -2.3 }
  ],
  trades: [
    {
      id: '1',
      entry_time: '2024-01-15 09:30',
      exit_time: '2024-01-16 14:20',
      side: 'long',
      entry_price: 42500,
      exit_price: 43200,
      quantity: 2,
      pnl: 1400,
      commission: 85,
      status: 'closed'
    },
    {
      id: '2',
      entry_time: '2024-01-18 11:15',
      exit_time: '2024-01-19 16:45',
      side: 'short',
      entry_price: 43800,
      exit_price: 43200,
      quantity: 1.5,
      pnl: 900,
      commission: 65.7,
      status: 'closed'
    },
    {
      id: '3',
      entry_time: '2024-01-22 13:20',
      exit_time: '2024-01-23 10:30',
      side: 'long',
      entry_price: 44200,
      exit_price: 43800,
      quantity: 1,
      pnl: -400,
      commission: 44.2,
      status: 'closed'
    }
  ],
  created_at: '2024-06-30T23:59:59Z'
};

const monthlyReturns = [
  { month: '1月', return: 2.5 },
  { month: '2月', return: 5.0 },
  { month: '3月', return: 8.0 },
  { month: '4月', return: 12.0 },
  { month: '5月', return: 14.5 },
  { month: '6月', return: 15.67 }
];

const BacktestResults: React.FC = () => {
  const { currentResult, isRunning, progress, fetchResult } = useBacktestStore();
  const { strategies } = useStrategyStore();
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [viewMode, setViewMode] = useState<'equity' | 'drawdown' | 'monthly'>('equity');
  const [result, setResult] = useState<BacktestResult>(mockBacktestResult);

  useEffect(() => {
    if (!currentResult) {
      fetchResult();
    } else {
      setResult(currentResult);
    }
  }, [currentResult, fetchResult]);

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
                {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600 mr-1" />}
                {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600 mr-1" />}
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getChartData = () => {
    switch (viewMode) {
      case 'equity':
        return result.equity_curve.map(point => ({
          ...point,
          date: new Date(point.timestamp).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
        }));
      case 'drawdown':
        return result.equity_curve.map(point => ({
          ...point,
          date: new Date(point.timestamp).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
          drawdown: Math.abs(point.drawdown)
        }));
      case 'monthly':
        return monthlyReturns;
      default:
        return [];
    }
  };

  const renderChart = () => {
    const data = getChartData();
    
    switch (viewMode) {
      case 'equity':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
                formatter={(value: number) => [formatCurrency(value), '资金']}
              />
              <Line 
                type="monotone" 
                dataKey="equity" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'drawdown':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
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
                formatter={(value: number) => [`${value.toFixed(2)}%`, '回撤']}
              />
              <Area 
                type="monotone" 
                dataKey="drawdown" 
                stroke="#ef4444" 
                fill="#fecaca"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'monthly':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="month" 
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
                formatter={(value: number) => [`${value}%`, '收益率']}
              />
              <Bar 
                dataKey="return" 
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题和控制 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">回测结果</h1>
          <p className="text-slate-600 mt-1">分析策略的历史表现和风险指标</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select
            options={[
              { value: '', label: '选择策略' },
              ...strategies.map(s => ({ value: s.id, label: s.name }))
            ]}
            value={selectedStrategy}
            onChange={setSelectedStrategy}
            placeholder="选择策略"
          />
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            筛选
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
          <Button>
            <RefreshCw className="h-4 w-4 mr-2" />
            重新回测
          </Button>
        </div>
      </div>

      {/* 回测进度 */}
      {isRunning && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-900">回测进行中...</h3>
              <Badge variant="info">运行中</Badge>
            </div>
            <Progress value={progress} showLabel label="回测进度" />
          </CardContent>
        </Card>
      )}

      {/* 关键指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="总收益率"
          value={formatPercent(result.total_return)}
          change="vs 基准 +8.2%"
          icon={TrendingUp}
          trend="up"
          description="策略期间总收益"
        />
        <MetricCard
          title="年化收益率"
          value={formatPercent(result.annual_return)}
          change="vs 基准 +15.8%"
          icon={BarChart3}
          trend="up"
          description="年化收益率"
        />
        <MetricCard
          title="最大回撤"
          value={formatPercent(result.max_drawdown)}
          change="风险可控"
          icon={TrendingDown}
          trend="down"
          description="历史最大回撤"
        />
        <MetricCard
          title="夏普比率"
          value={result.sharpe_ratio.toFixed(2)}
          change="优秀"
          icon={Activity}
          trend="up"
          description="风险调整后收益"
        />
      </div>

      {/* 图表区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>策略表现分析</span>
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'equity' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('equity')}
              >
                资金曲线
              </Button>
              <Button
                variant={viewMode === 'drawdown' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('drawdown')}
              >
                回撤分析
              </Button>
              <Button
                variant={viewMode === 'monthly' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('monthly')}
              >
                月度收益
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>

      {/* 详细统计和交易记录 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 详细统计 */}
        <Card>
          <CardHeader>
            <CardTitle>详细统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-sm text-slate-600">回测期间</div>
                  <div className="font-medium text-slate-900">
                    {new Date(result.start_date).toLocaleDateString('zh-CN')} - {new Date(result.end_date).toLocaleDateString('zh-CN')}
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-sm text-slate-600">初始资金</div>
                  <div className="font-medium text-slate-900">{formatCurrency(result.initial_capital)}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-sm text-slate-600">最终资金</div>
                  <div className="font-medium text-slate-900">{formatCurrency(result.final_capital)}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-sm text-slate-600">总交易次数</div>
                  <div className="font-medium text-slate-900">{result.total_trades}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-sm text-slate-600">胜率</div>
                  <div className="font-medium text-green-600">{result.win_rate.toFixed(1)}%</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-sm text-slate-600">盈亏比</div>
                  <div className="font-medium text-slate-900">{result.profit_factor.toFixed(2)}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-sm text-slate-600">平均盈利</div>
                  <div className="font-medium text-green-600">{formatCurrency(result.avg_win)}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-sm text-slate-600">平均亏损</div>
                  <div className="font-medium text-red-600">{formatCurrency(result.avg_loss)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 交易记录 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>交易记录</span>
              <Badge variant="info" size="sm">
                显示最近 {result.trades.length} 笔
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {result.trades.map((trade) => (
                <div key={trade.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={trade.side === 'long' ? 'success' : 'warning'}
                        size="sm"
                      >
                        {trade.side === 'long' ? '做多' : '做空'}
                      </Badge>
                      <span className="text-sm text-slate-600">#{trade.id}</span>
                    </div>
                    <div className={`font-medium ${
                      trade.pnl && trade.pnl > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {trade.pnl && trade.pnl > 0 ? '+' : ''}{formatCurrency(trade.pnl || 0)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                    <div>入场: {formatCurrency(trade.entry_price)}</div>
                    <div>出场: {formatCurrency(trade.exit_price || 0)}</div>
                    <div>数量: {trade.quantity}</div>
                    <div>手续费: {formatCurrency(trade.commission)}</div>
                    <div className="col-span-2">时间: {trade.entry_time} - {trade.exit_time}</div>
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

export default BacktestResults;