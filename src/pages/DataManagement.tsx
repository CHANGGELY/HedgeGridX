import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Plus,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  HardDrive,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Progress } from '../components/ui';

// 模拟数据源配置
const mockDataSources = [
  {
    id: '1',
    name: 'Binance API',
    type: 'exchange',
    status: 'connected',
    symbols: ['BTCUSDT', 'ETHUSDT', 'ADAUSDT'],
    last_sync: '2024-01-15T10:30:00Z',
    data_count: 125000
  },
  {
    id: '2',
    name: 'OKX API',
    type: 'exchange',
    status: 'error',
    symbols: ['BTCUSDT', 'ETHUSDT'],
    last_sync: '2024-01-15T09:15:00Z',
    data_count: 89000
  },
  {
    id: '3',
    name: '本地CSV文件',
    type: 'file',
    status: 'connected',
    symbols: ['BTCUSDT'],
    last_sync: '2024-01-15T08:00:00Z',
    data_count: 50000
  }
];

// 模拟数据统计
const dataStats = [
  { period: '1月', records: 45000, size: 12.5 },
  { period: '2月', records: 52000, size: 14.2 },
  { period: '3月', records: 48000, size: 13.1 },
  { period: '4月', records: 55000, size: 15.8 },
  { period: '5月', records: 58000, size: 16.9 },
  { period: '6月', records: 62000, size: 18.2 }
];

const DataManagement: React.FC = () => {
  // const [selectedSource, setSelectedSource] = useState<string>('');
  const [viewMode, setViewMode] = useState<'sources' | 'history' | 'stats'>('sources');
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [dataSources] = useState(mockDataSources);

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

  const handleImportData = () => {
    setIsImporting(true);
    setImportProgress(0);
    
    // 模拟导入进度
    const interval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsImporting(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Database className="h-5 w-5 text-slate-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="success" size="sm">已连接</Badge>;
      case 'error':
        return <Badge variant="danger" size="sm">连接错误</Badge>;
      case 'warning':
        return <Badge variant="warning" size="sm">警告</Badge>;
      default:
        return <Badge variant="default" size="sm">未知</Badge>;
    }
  };

  // const formatFileSize = (sizeInMB: number) => {
  //   if (sizeInMB < 1024) {
  //     return `${sizeInMB.toFixed(1)} MB`;
  //   }
  //   return `${(sizeInMB / 1024).toFixed(1)} GB`;
  // };

  const renderContent = () => {
    switch (viewMode) {
      case 'sources':
        return (
          <div className="space-y-4">
            {dataSources.map((source) => (
              <Card key={source.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(source.status)}
                      <div>
                        <h3 className="text-lg font-medium text-slate-900">{source.name}</h3>
                        <p className="text-sm text-slate-600">
                          {source.type === 'exchange' ? '交易所API' : '本地文件'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(source.status)}
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="text-sm text-slate-600">支持币种</div>
                      <div className="font-medium text-slate-900">
                        {source.symbols.join(', ')}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="text-sm text-slate-600">数据量</div>
                      <div className="font-medium text-slate-900">
                        {source.data_count.toLocaleString()} 条
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="text-sm text-slate-600">最后同步</div>
                      <div className="font-medium text-slate-900">
                        {new Date(source.last_sync).toLocaleString('zh-CN')}
                      </div>
                    </div>
                  </div>
                  
                  {source.status === 'error' && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-800">
                          API连接失败，请检查密钥配置或网络连接
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        );
      
      case 'stats':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>数据量统计</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dataStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="period" 
                      stroke="#64748b"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#64748b"
                      fontSize={12}
                      tickFormatter={(value) => `${value / 1000}K`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#f1f5f9'
                      }}
                      formatter={(value: number) => [`${value.toLocaleString()} 条`, '数据量']}
                    />
                    <Bar 
                      dataKey="records" 
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>存储空间使用</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dataStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="period" 
                      stroke="#64748b"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#64748b"
                      fontSize={12}
                      tickFormatter={(value) => `${value} MB`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#f1f5f9'
                      }}
                      formatter={(value: number) => [`${value} MB`, '存储空间']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="size" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
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
          <h1 className="text-2xl font-bold text-slate-900">数据管理</h1>
          <p className="text-slate-600 mt-1">管理数据源、历史数据和存储空间</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出数据
          </Button>
          <Button variant="outline" onClick={handleImportData}>
            <Upload className="h-4 w-4 mr-2" />
            导入数据
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            添加数据源
          </Button>
        </div>
      </div>

      {/* 导入进度 */}
      {isImporting && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-800 font-medium">正在导入数据...</span>
              <span className="text-blue-700">{importProgress}%</span>
            </div>
            <Progress value={importProgress} />
          </CardContent>
        </Card>
      )}

      {/* 数据概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="数据源"
          value={dataSources.length.toString()}
          change={`${dataSources.filter(s => s.status === 'connected').length} 个已连接`}
          icon={Database}
          trend="neutral"
          description="配置的数据源总数"
          status="success"
        />
        <MetricCard
          title="总数据量"
          value={`${(dataSources.reduce((sum, s) => sum + s.data_count, 0) / 1000).toFixed(0)}K`}
          change="持续增长"
          icon={HardDrive}
          trend="up"
          description="历史数据记录总数"
          status="success"
        />
        <MetricCard
          title="存储空间"
          value="90.3 MB"
          change="本月 +18.2 MB"
          icon={HardDrive}
          trend="up"
          description="数据库占用空间"
          status="warning"
        />
        <MetricCard
          title="连接状态"
          value={`${dataSources.filter(s => s.status === 'connected').length}/${dataSources.length}`}
          change={dataSources.filter(s => s.status === 'error').length > 0 ? '有连接异常' : '全部正常'}
          icon={dataSources.filter(s => s.status === 'error').length > 0 ? WifiOff : Wifi}
          trend="neutral"
          description="数据源连接状态"
          status={dataSources.filter(s => s.status === 'error').length > 0 ? 'danger' : 'success'}
        />
      </div>

      {/* 视图切换 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>数据管理</span>
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'sources' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('sources')}
              >
                数据源
              </Button>
              <Button
                variant={viewMode === 'stats' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('stats')}
              >
                统计分析
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataManagement;