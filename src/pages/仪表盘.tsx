import React, { useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  AlertTriangle,
  Play,
  Pause,
  Settings,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../components/ui';
import { useDashboardStore, useStrategyStore } from '../stores';

// 模拟数据
const equityData = [
  { date: '2024-01', equity: 100000, benchmark: 100000 },
  { date: '2024-02', equity: 105000, benchmark: 102000 },
  { date: '2024-03', equity: 108000, benchmark: 101500 },
  { date: '2024-04', equity: 112000, benchmark: 103000 },
  { date: '2024-05', equity: 118000, benchmark: 104500 },
  { date: '2024-06', equity: 115000, benchmark: 106000 }
];

const performanceData = [
  { name: '布林线策略', return: 15.2, trades: 45, winRate: 68 },
  { name: '海龟策略', return: 12.8, trades: 32, winRate: 72 },
  { name: 'RSI策略', return: 8.5, trades: 28, winRate: 65 }
];

const strategyDistribution = [
  { name: '活跃策略', value: 3, color: '#10b981' },
  { name: '暂停策略', value: 2, color: '#f59e0b' },
  { name: '已停止', value: 1, color: '#ef4444' }
];

const recentTrades = [
  {
    id: '1',
    strategy: '布林线策略',
    symbol: 'BTC/USDT',
    side: 'long' as const,
    entry_price: 45000,
    exit_price: 46200,
    pnl: 1200,
    time: '2024-01-15 14:30'
  },
  {
    id: '2',
    strategy: '海龟策略',
    symbol: 'ETH/USDT',
    side: 'short' as const,
    entry_price: 2800,
    exit_price: 2750,
    pnl: 850,
    time: '2024-01-15 13:45'
  },
  {
    id: '3',
    strategy: 'RSI策略',
    symbol: 'BTC/USDT',
    side: 'long' as const,
    entry_price: 44800,
    exit_price: 44200,
    pnl: -600,
    time: '2024-01-15 12:20'
  }
];

const Dashboard: React.FC = () => {
  const { loadDashboardData } = useDashboardStore();
  const { loadStrategies } = useStrategyStore();

  useEffect(() => {
    loadDashboardData();
    loadStrategies();
  }, [loadDashboardData, loadStrategies]);

  const StatCard = ({ title, value, change, icon: Icon, trend }: {
    title: string;
    value: string;
    change: string;
    icon: React.ComponentType<{ className?: string }>;
    trend: 'up' | 'down';
  }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {change}
              </span>
            </div>
          </div>
          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="总收益率"
          value="+15.67%"
          change="+2.3%"
          icon={TrendingUp}
          trend="up"
        />
        <StatCard
          title="今日盈亏"
          value="+$1,250"
          change="+0.8%"
          icon={DollarSign}
          trend="up"
        />
        <StatCard
          title="活跃策略"
          value="3"
          change="+1"
          icon={Activity}
          trend="up"
        />
        <StatCard
          title="胜率"
          value="68.5%"
          change="-1.2%"
          icon={BarChart3}
          trend="down"
        />
      </div>

      {/* 主要图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 资金曲线 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>资金曲线</span>
              <div className="flex space-x-2">
                <Badge variant="info" size="sm">实时更新</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={equityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                />
                <Line 
                  type="monotone" 
                  dataKey="equity" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  name="策略收益"
                />
                <Line 
                  type="monotone" 
                  dataKey="benchmark" 
                  stroke="#64748b" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="基准收益"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 策略分布 */}
        <Card>
          <CardHeader>
            <CardTitle>策略状态分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={strategyDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {strategyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {strategyDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 策略表现和最近交易 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 策略表现 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>策略表现</span>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                管理策略
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceData.map((strategy, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-slate-900">{strategy.name}</h4>
                      <Badge 
                        variant={strategy.return > 10 ? 'success' : strategy.return > 5 ? 'warning' : 'default'}
                        size="sm"
                      >
                        +{strategy.return}%
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <span>交易次数: {strategy.trades}</span>
                      <span>胜率: {strategy.winRate}%</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button variant="ghost" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Pause className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 最近交易 */}
        <Card>
          <CardHeader>
            <CardTitle>最近交易</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTrades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-slate-900">{trade.symbol}</span>
                      <Badge 
                        variant={trade.side === 'long' ? 'success' : 'warning'}
                        size="sm"
                      >
                        {trade.side === 'long' ? '做多' : '做空'}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-600">
                      <div>{trade.strategy}</div>
                      <div>{trade.time}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${
                      trade.pnl > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {trade.pnl > 0 ? '+' : ''}${trade.pnl}
                    </div>
                    <div className="text-sm text-slate-500">
                      ${trade.entry_price} → ${trade.exit_price}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 快速操作 */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="h-20 flex-col space-y-2">
              <Play className="h-6 w-6" />
              <span>启动策略</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Settings className="h-6 w-6" />
              <span>策略配置</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <BarChart3 className="h-6 w-6" />
              <span>回测分析</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <AlertTriangle className="h-6 w-6" />
              <span>风险监控</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;