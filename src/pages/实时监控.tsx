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
  Area
} from 'recharts';
import {
  Play,
  Square,
  Bell,
  BellOff,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Select } from '../components/用户界面/索引';
import { useLiveMonitorStore } from '../stores';
import { Position, TradingSignal, SignalType } from '../types';

// 模拟实时价格数据
const mockPriceData = [
  { time: '09:30', price: 42500, volume: 1250 },
  { time: '09:35', price: 42650, volume: 1180 },
  { time: '09:40', price: 42580, volume: 1320 },
  { time: '09:45', price: 42720, volume: 1450 },
  { time: '09:50', price: 42680, volume: 1200 },
  { time: '09:55', price: 42800, volume: 1380 },
  { time: '10:00', price: 42750, volume: 1290 }
];

// 模拟持仓数据
const mockPositions: Position[] = [
  {
    id: '1',
    strategy_id: 'bollinger-1',
    symbol: 'BTCUSDT',
    side: 'long',
    size: 0.5,
    entry_price: 42500,
    current_price: 42750,
    unrealized_pnl: 1125,
    timestamp: '2024-01-15T10:30:00Z',
    margin_used: 21150,
    leverage: 2,
    entry_time: '2024-01-15T09:30:00Z',
    status: 'open'
  },
  {
    id: '2',
    strategy_id: 'rsi-1',
    symbol: 'ETHUSDT',
    side: 'short',
    size: 5,
    entry_price: 2580,
    current_price: 2565,
    unrealized_pnl: 150,
    timestamp: '2024-01-15T10:30:00Z',
    margin_used: 12900,
    leverage: 2,
    entry_time: '2024-01-15T09:45:00Z',
    status: 'open'
  }
];

// 模拟交易信号
const mockSignals: TradingSignal[] = [
  {
    id: '1',
    strategy_id: 'bollinger-1',
    symbol: 'BTCUSDT',
    signal: SignalType.LONG,
    signal_type: 'buy',
    strength: 0.85,
    price: 43250.50,
    confidence: 0.85,
    timestamp: '2024-01-15T10:30:00Z',
    status: 'active',
    description: '布林线下轨支撑，建议买入'
  },
  {
    id: '2',
    strategy_id: 'rsi-1',
    symbol: 'ETHUSDT',
    signal: SignalType.SHORT,
    signal_type: 'sell',
    strength: 0.72,
    price: 2580.25,
    confidence: 0.72,
    timestamp: '2024-01-15T10:25:00Z',
    status: 'executed',
    description: 'RSI超买，建议减仓'
  },
  {
    id: '3',
    strategy_id: 'turtle-1',
    symbol: 'ADAUSDT',
    signal: SignalType.HOLD,
    signal_type: 'hold',
    strength: 0.45,
    price: 0.485,
    confidence: 0.45,
    timestamp: '2024-01-15T10:20:00Z',
    status: 'expired',
    description: '趋势不明确，建议观望'
  }
];

const LiveMonitor: React.FC = () => {
  const isConnected = useLiveMonitorStore(s => s.isConnected);
  const startMonitoring = useLiveMonitorStore(s => s.startMonitoring);
  const stopMonitoring = useLiveMonitorStore(s => s.stopMonitoring);
  const toggleNotifications = useLiveMonitorStore(s => s.toggleNotifications);
  
  // const [selectedStrategy, setSelectedStrategy] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'price' | 'pnl' | 'signals'>('price');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5);
  const [positions] = useState<Position[]>(mockPositions);
  const [signals] = useState<TradingSignal[]>(mockSignals);
  const [priceData] = useState(mockPriceData);
  const [notifications] = useState(true);

  // 模拟实时数据更新
  useEffect(() => {
    if (!autoRefresh || !isConnected) return;
    
    const interval = setInterval(() => {
      // 这里可以添加实时数据更新逻辑
      console.log('Refreshing live data...');
    }, refreshInterval * 1000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, isConnected]);

  const MetricCard = ({ title, value, change, icon: Icon, trend, description, status }: {
    title: string;
    value: string;
    change?: string;
    icon: React.ComponentType<{ className?: string }>;
    trend?: 'up' | 'down' | 'neutral';
    description?: string;
    status?: 'success' | 'warning' | 'danger';
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
          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
            status === 'success' ? 'bg-green-100' :
            status === 'warning' ? 'bg-yellow-100' :
            status === 'danger' ? 'bg-red-100' : 'bg-blue-100'
          }`}>
            <Icon className={`h-6 w-6 ${
              status === 'success' ? 'text-green-600' :
              status === 'warning' ? 'text-yellow-600' :
              status === 'danger' ? 'text-red-600' : 'text-blue-600'
            }`} />
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

  const getTotalPnL = () => {
    return positions.reduce((total, pos) => total + (pos.unrealized_pnl || 0), 0);
  };

  const getActiveSignalsCount = () => {
    return signals.filter(s => s.status === 'active').length;
  };

  const renderChart = () => {
    switch (viewMode) {
      case 'price':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="time" 
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                domain={['dataMin - 100', 'dataMax + 100']}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
                formatter={(value: number) => [formatCurrency(value), '价格']}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'pnl': {
        const pnlData = priceData.map((item) => ({
          ...item,
          pnl: (item.price - 42300) * 2.5 // 模拟PnL计算
        }));
        
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={pnlData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="time" 
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
                formatter={(value: number) => [formatCurrency(value), '未实现盈亏']}
              />
              <Area 
                type="monotone" 
                dataKey="pnl" 
                stroke="#10b981" 
                fill="#dcfce7"
                strokeWidth={2}
              />
            </AreaChart>
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
          <h1 className="text-2xl font-bold text-slate-900">实时监控</h1>
          <p className="text-slate-600 mt-1">监控策略运行状态和市场动态</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Select
              options={[
                { value: '5', label: '5秒' },
                { value: '10', label: '10秒' },
                { value: '30', label: '30秒' },
                { value: '60', label: '1分钟' }
              ]}
              value={refreshInterval.toString()}
              onChange={(value) => setRefreshInterval(parseInt(value))}
            />
          </div>
          <Button
            variant="outline"
            onClick={toggleNotifications}
          >
            {notifications ? <Bell className="h-4 w-4 mr-2" /> : <BellOff className="h-4 w-4 mr-2" />}
            通知
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            设置
          </Button>
          {!isConnected ? (
            <Button onClick={startMonitoring}>
              <Play className="h-4 w-4 mr-2" />
              开始监控
            </Button>
          ) : (
            <Button variant="danger" onClick={stopMonitoring}>
              <Square className="h-4 w-4 mr-2" />
              停止监控
            </Button>
          )}
        </div>
      </div>

      {/* 监控状态 */}
      {isConnected && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-800 font-medium">监控运行中</span>
                <Badge variant="success" size="sm">实时</Badge>
              </div>
              <div className="text-sm text-green-700">
                下次刷新: {refreshInterval}秒后
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 关键指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="总持仓盈亏"
          value={formatCurrency(getTotalPnL())}
          change={formatPercent((getTotalPnL() / 50000) * 100)}
          icon={DollarSign}
          trend={getTotalPnL() > 0 ? 'up' : 'down'}
          description="所有持仓未实现盈亏"
          status={getTotalPnL() > 0 ? 'success' : 'danger'}
        />
        <MetricCard
          title="活跃持仓"
          value={positions.filter(p => p.status === 'open').length.toString()}
          change="2个策略"
          icon={Activity}
          trend="neutral"
          description="当前开仓数量"
          status="warning"
        />
        <MetricCard
          title="活跃信号"
          value={getActiveSignalsCount().toString()}
          change="待执行"
          icon={AlertTriangle}
          trend="neutral"
          description="等待执行的交易信号"
          status={getActiveSignalsCount() > 0 ? 'warning' : 'success'}
        />
        <MetricCard
          title="监控状态"
          value={isConnected ? '运行中' : '已停止'}
          change={isConnected ? '正常' : '离线'}
          icon={isConnected ? CheckCircle : XCircle}
          trend="neutral"
          description="系统监控状态"
          status={isConnected ? 'success' : 'danger'}
        />
      </div>

      {/* 图表区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>实时数据</span>
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'price' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('price')}
              >
                价格走势
              </Button>
              <Button
                variant={viewMode === 'pnl' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('pnl')}
              >
                盈亏曲线
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>

      {/* 持仓和信号 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 当前持仓 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>当前持仓</span>
              <Badge variant="info" size="sm">
                {positions.filter(p => p.status === 'open').length} 个持仓
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {positions.filter(p => p.status === 'open').map((position) => (
                <div key={position.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={position.side === 'long' ? 'success' : 'warning'}
                        size="sm"
                      >
                        {position.side === 'long' ? '做多' : '做空'}
                      </Badge>
                      <span className="font-medium">{position.symbol}</span>
                    </div>
                    <div className={`font-medium ${
                      (position.unrealized_pnl || 0) > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(position.unrealized_pnl || 0)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-50 p-2 rounded">
                      <div className="text-slate-600">持仓量</div>
                      <div className="font-medium">{position.size}</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      <div className="text-slate-600">入场价</div>
                      <div className="font-medium">{formatCurrency(position.entry_price)}</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      <div className="text-slate-600">当前价</div>
                      <div className="font-medium">{formatCurrency(position.current_price)}</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      <div className="text-slate-600">杠杆</div>
                      <div className="font-medium">{position.leverage}x</div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>开仓时间: {new Date(position.entry_time).toLocaleString('zh-CN')}</span>
                      <span>占用保证金: {formatCurrency(position.margin_used)}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {positions.filter(p => p.status === 'open').length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>暂无持仓</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 交易信号 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>交易信号</span>
              <Badge variant="info" size="sm">
                最近 {signals.length} 个信号
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {signals.map((signal) => (
                <div key={signal.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={
                          signal.signal_type === 'buy' ? 'success' :
                          signal.signal_type === 'sell' ? 'danger' : 'default'
                        }
                        size="sm"
                      >
                        {signal.signal_type === 'buy' ? '买入' :
                         signal.signal_type === 'sell' ? '卖出' : '持有'}
                      </Badge>
                      <span className="font-medium">{signal.symbol}</span>
                      <Badge 
                        variant={
                          signal.status === 'active' ? 'warning' :
                          signal.status === 'executed' ? 'success' : 'default'
                        }
                        size="sm"
                      >
                        {signal.status === 'active' ? '活跃' :
                         signal.status === 'executed' ? '已执行' : '已过期'}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-600">
                      强度: {(signal.strength * 100).toFixed(0)}%
                    </div>
                  </div>
                  
                  <div className="text-sm text-slate-600 mb-2">
                    {signal.description}
                  </div>
                  
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>价格: {formatCurrency(signal.price)}</span>
                    <span>时间: {new Date(signal.timestamp).toLocaleTimeString('zh-CN')}</span>
                  </div>
                  
                  <div className="mt-2">
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          signal.strength > 0.8 ? 'bg-green-500' :
                          signal.strength > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${signal.strength * 100}%` }}
                      ></div>
                    </div>
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

export default LiveMonitor;