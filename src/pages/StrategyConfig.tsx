import React, { useState } from 'react';
import { Plus, Save, Play, Copy, Trash2, Settings, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, Badge } from '../components/ui';
import { StrategyType, TimeFrame, StrategyConfig as IStrategyConfig } from '../types';
import { useStrategyStore } from '../stores';
import toast from 'react-hot-toast';

const StrategyConfig: React.FC = () => {
  const { strategies, addStrategy, updateStrategy, deleteStrategy } = useStrategyStore();
  const [selectedStrategy, setSelectedStrategy] = useState<IStrategyConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<IStrategyConfig>>({
    name: '',
    type: StrategyType.BOLLINGER,
    symbol: 'BTC/USDT',
    timeframe: TimeFrame.HOUR_1,
    leverage: 1,
    initial_capital: 100000,
    commission_rate: 0.001,
    slippage: 0.0005,
    min_margin_rate: 0.1,
    contract_value: 1,
    params: {
      bollinger: {
        period: 20,
        std_dev: 2,
        exit_period: 10
      }
    }
  });

  const strategyTypes = [
    { value: StrategyType.BOLLINGER, label: '布林线策略' },
    { value: StrategyType.TURTLE, label: '海龟策略' },
    { value: StrategyType.RSI, label: 'RSI策略' }
  ];

  const timeframes = [
    { value: TimeFrame.MIN_1, label: '1分钟' },
    { value: TimeFrame.MIN_5, label: '5分钟' },
    { value: TimeFrame.MIN_15, label: '15分钟' },
    { value: TimeFrame.MIN_30, label: '30分钟' },
    { value: TimeFrame.HOUR_1, label: '1小时' },
    { value: TimeFrame.HOUR_4, label: '4小时' },
    { value: TimeFrame.DAY_1, label: '1天' }
  ];

  const symbols = [
    { value: 'BTC/USDT', label: 'BTC/USDT' },
    { value: 'ETH/USDT', label: 'ETH/USDT' },
    { value: 'BNB/USDT', label: 'BNB/USDT' },
    { value: 'ADA/USDT', label: 'ADA/USDT' },
    { value: 'SOL/USDT', label: 'SOL/USDT' }
  ];

  const handleInputChange = (field: string, value: string | number | StrategyType | TimeFrame) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleParamChange = (strategyType: StrategyType, param: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      params: {
        ...prev.params,
        [strategyType]: {
          ...prev.params?.[strategyType],
          [param]: value
        }
      }
    }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.type) {
      toast.error('请填写策略名称和类型');
      return;
    }

    const strategy: IStrategyConfig = {
      id: selectedStrategy?.id || Date.now().toString(),
      name: formData.name!,
      type: formData.type!,
      symbol: formData.symbol!,
      timeframe: formData.timeframe!,
      params: formData.params!,
      leverage: formData.leverage!,
      initial_capital: formData.initial_capital!,
      commission_rate: formData.commission_rate!,
      slippage: formData.slippage!,
      min_margin_rate: formData.min_margin_rate!,
      contract_value: formData.contract_value!,
      is_active: false,
      created_at: selectedStrategy?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (selectedStrategy) {
      updateStrategy(selectedStrategy.id, strategy);
      toast.success('策略更新成功');
    } else {
      addStrategy(strategy);
      toast.success('策略创建成功');
    }

    setIsEditing(false);
    setSelectedStrategy(strategy);
  };

  const handleNewStrategy = () => {
    setSelectedStrategy(null);
    setFormData({
      name: '',
      type: StrategyType.BOLLINGER,
      symbol: 'BTC/USDT',
      timeframe: TimeFrame.HOUR_1,
      leverage: 1,
      initial_capital: 100000,
      commission_rate: 0.001,
      slippage: 0.0005,
      min_margin_rate: 0.1,
      contract_value: 1,
      params: {
        bollinger: {
          period: 20,
          std_dev: 2,
          exit_period: 10
        }
      }
    });
    setIsEditing(true);
  };

  const handleEdit = (strategy: IStrategyConfig) => {
    setSelectedStrategy(strategy);
    setFormData(strategy);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个策略吗？')) {
      deleteStrategy(id);
      toast.success('策略删除成功');
      if (selectedStrategy?.id === id) {
        setSelectedStrategy(null);
        setIsEditing(false);
      }
    }
  };

  const handleCopy = (strategy: IStrategyConfig) => {
    const newStrategy = {
      ...strategy,
      id: Date.now().toString(),
      name: `${strategy.name} (副本)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    addStrategy(newStrategy);
    toast.success('策略复制成功');
  };

  const renderStrategyParams = () => {
    if (!formData.type) return null;

    switch (formData.type) {
      case StrategyType.BOLLINGER:
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900 flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              布林线参数
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="周期"
                type="number"
                value={formData.params?.bollinger?.period || 20}
                onChange={(e) => handleParamChange(StrategyType.BOLLINGER, 'period', Number(e.target.value))}
                helperText="计算布林线的周期数"
              />
              <Input
                label="标准差倍数"
                type="number"
                step="0.1"
                value={formData.params?.bollinger?.std_dev || 2}
                onChange={(e) => handleParamChange(StrategyType.BOLLINGER, 'std_dev', Number(e.target.value))}
                helperText="布林线带宽倍数"
              />
              <Input
                label="退出周期"
                type="number"
                value={formData.params?.bollinger?.exit_period || 10}
                onChange={(e) => handleParamChange(StrategyType.BOLLINGER, 'exit_period', Number(e.target.value))}
                helperText="平仓信号周期"
              />
            </div>
          </div>
        );
      
      case StrategyType.TURTLE:
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900 flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              海龟策略参数
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="入场周期"
                type="number"
                value={formData.params?.turtle?.entry_period || 20}
                onChange={(e) => handleParamChange(StrategyType.TURTLE, 'entry_period', Number(e.target.value))}
                helperText="突破入场的周期数"
              />
              <Input
                label="退出周期"
                type="number"
                value={formData.params?.turtle?.exit_period || 10}
                onChange={(e) => handleParamChange(StrategyType.TURTLE, 'exit_period', Number(e.target.value))}
                helperText="突破退出的周期数"
              />
              <Input
                label="ATR周期"
                type="number"
                value={formData.params?.turtle?.atr_period || 14}
                onChange={(e) => handleParamChange(StrategyType.TURTLE, 'atr_period', Number(e.target.value))}
                helperText="ATR计算周期"
              />
            </div>
          </div>
        );
      
      case StrategyType.RSI:
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900 flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              RSI策略参数
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="RSI周期"
                type="number"
                value={formData.params?.rsi?.period || 14}
                onChange={(e) => handleParamChange(StrategyType.RSI, 'period', Number(e.target.value))}
                helperText="RSI计算周期"
              />
              <Input
                label="超卖阈值"
                type="number"
                value={formData.params?.rsi?.oversold || 30}
                onChange={(e) => handleParamChange(StrategyType.RSI, 'oversold', Number(e.target.value))}
                helperText="RSI超卖线"
              />
              <Input
                label="超买阈值"
                type="number"
                value={formData.params?.rsi?.overbought || 70}
                onChange={(e) => handleParamChange(StrategyType.RSI, 'overbought', Number(e.target.value))}
                helperText="RSI超买线"
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">策略配置</h1>
          <p className="text-slate-600 mt-1">创建和管理您的交易策略</p>
        </div>
        <Button onClick={handleNewStrategy}>
          <Plus className="h-4 w-4 mr-2" />
          新建策略
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 策略列表 */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>策略列表</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {strategies.map((strategy) => (
                <div
                  key={strategy.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedStrategy?.id === strategy.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => {
                    setSelectedStrategy(strategy);
                    setFormData(strategy);
                    setIsEditing(false);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-900">{strategy.name}</h4>
                    <Badge 
                      variant={strategy.is_active ? 'success' : 'default'}
                      size="sm"
                    >
                      {strategy.is_active ? '运行中' : '已停止'}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-600 space-y-1">
                    <div>类型: {strategyTypes.find(t => t.value === strategy.type)?.label}</div>
                    <div>交易对: {strategy.symbol}</div>
                    <div>时间周期: {timeframes.find(t => t.value === strategy.timeframe)?.label}</div>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(strategy);
                      }}
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(strategy);
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(strategy.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {strategies.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p>暂无策略</p>
                  <p className="text-sm">点击"新建策略"开始创建</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 策略配置表单 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{isEditing ? '编辑策略' : '策略详情'}</span>
              {selectedStrategy && !isEditing && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(selectedStrategy)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    编辑
                  </Button>
                  <Button size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    启动回测
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(isEditing || selectedStrategy) ? (
              <div className="space-y-6">
                {/* 基本信息 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900 flex items-center">
                    <Info className="h-5 w-5 mr-2" />
                    基本信息
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="策略名称"
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={!isEditing}
                      placeholder="请输入策略名称"
                    />
                    <Select
                      label="策略类型"
                      options={strategyTypes}
                      value={formData.type || ''}
                      onChange={(value) => handleInputChange('type', value)}
                      disabled={!isEditing}
                    />
                    <Select
                      label="交易对"
                      options={symbols}
                      value={formData.symbol || ''}
                      onChange={(value) => handleInputChange('symbol', value)}
                      disabled={!isEditing}
                    />
                    <Select
                      label="时间周期"
                      options={timeframes}
                      value={formData.timeframe || ''}
                      onChange={(value) => handleInputChange('timeframe', value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {/* 交易参数 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900">交易参数</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Input
                      label="初始资金"
                      type="number"
                      value={formData.initial_capital || 0}
                      onChange={(e) => handleInputChange('initial_capital', Number(e.target.value))}
                      disabled={!isEditing}
                    />
                    <Input
                      label="杠杆倍数"
                      type="number"
                      value={formData.leverage || 1}
                      onChange={(e) => handleInputChange('leverage', Number(e.target.value))}
                      disabled={!isEditing}
                    />
                    <Input
                      label="手续费率"
                      type="number"
                      step="0.0001"
                      value={formData.commission_rate || 0}
                      onChange={(e) => handleInputChange('commission_rate', Number(e.target.value))}
                      disabled={!isEditing}
                    />
                    <Input
                      label="滑点"
                      type="number"
                      step="0.0001"
                      value={formData.slippage || 0}
                      onChange={(e) => handleInputChange('slippage', Number(e.target.value))}
                      disabled={!isEditing}
                    />
                    <Input
                      label="最低保证金率"
                      type="number"
                      step="0.01"
                      value={formData.min_margin_rate || 0}
                      onChange={(e) => handleInputChange('min_margin_rate', Number(e.target.value))}
                      disabled={!isEditing}
                    />
                    <Input
                      label="合约面值"
                      type="number"
                      value={formData.contract_value || 1}
                      onChange={(e) => handleInputChange('contract_value', Number(e.target.value))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {/* 策略参数 */}
                {isEditing && renderStrategyParams()}

                {/* 操作按钮 */}
                {isEditing && (
                  <div className="flex space-x-4 pt-4 border-t">
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      保存策略
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        if (selectedStrategy) {
                          setFormData(selectedStrategy);
                        }
                      }}
                    >
                      取消
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <Settings className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-medium mb-2">选择或创建策略</h3>
                <p className="mb-4">从左侧列表选择一个策略进行查看，或创建新的策略配置</p>
                <Button onClick={handleNewStrategy}>
                  <Plus className="h-4 w-4 mr-2" />
                  新建策略
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StrategyConfig;