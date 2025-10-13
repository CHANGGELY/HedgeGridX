import React, { useState } from 'react';
import {
  User,
  Settings as SettingsIcon,
  Bell,
  Shield,
  Palette,
  Download,
  Upload,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';
import { Card, CardContent, Button, Select, Input } from '../components/ui';
import { useSettingsStore } from '../stores';

const Settings: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'system' | 'notifications' | 'security' | 'appearance'>('profile');
  const [showApiKey, setShowApiKey] = useState(false);
  const [formData, setFormData] = useState({
    username: 'trader_001',
    email: 'trader@example.com',
    phone: '+86 138****8888',
    apiKey: '************************************',
    secretKey: '************************************'
  });

  const handleInputChange = (field: string, value: string | number | boolean | object) => {
    if (field in formData) {
      setFormData(prev => ({ ...prev, [field]: value }));
    } else {
      updateSettings({ [field]: value } as Partial<typeof settings>);
    }
  };

  const handleSave = () => {
    // 保存设置逻辑
    console.log('保存设置:', { ...settings, ...formData });
    alert('设置已保存');
  };

  const handleExportSettings = () => {
    const settingsData = JSON.stringify({ ...settings, ...formData }, null, 2);
    const blob = new Blob([settingsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-900">个人资料</h3>
                <p className="text-slate-600">管理您的个人信息和账户设置</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="用户名"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="请输入用户名"
              />
              <Input
                label="邮箱地址"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="请输入邮箱地址"
              />
              <Input
                label="手机号码"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="请输入手机号码"
              />
              <Select
                label="时区"
                options={[
                  { value: 'Asia/Shanghai', label: '北京时间 (UTC+8)' },
                  { value: 'America/New_York', label: '纽约时间 (UTC-5)' },
                  { value: 'Europe/London', label: '伦敦时间 (UTC+0)' },
                  { value: 'Asia/Tokyo', label: '东京时间 (UTC+9)' }
                ]}
                value={settings.timezone}
                onChange={(value) => handleInputChange('timezone', value)}
              />
            </div>
          </div>
        );
      
      case 'system':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">系统配置</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <div className="font-medium text-slate-900">自动保存策略</div>
                    <div className="text-sm text-slate-600">策略配置修改后自动保存</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoSave}
                      onChange={(e) => handleInputChange('autoSave', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <div className="font-medium text-slate-900">数据自动同步</div>
                    <div className="text-sm text-slate-600">定期从数据源同步最新数据</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoSync}
                      onChange={(e) => handleInputChange('autoSync', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="默认回测周期"
                    options={[
                      { value: '1m', label: '1分钟' },
                      { value: '5m', label: '5分钟' },
                      { value: '15m', label: '15分钟' },
                      { value: '1h', label: '1小时' },
                      { value: '4h', label: '4小时' },
                      { value: '1d', label: '1天' }
                    ]}
                    value={settings.defaultTimeframe}
                    onChange={(value) => handleInputChange('defaultTimeframe', value)}
                  />
                  <Input
                    label="最大并发回测数"
                    type="number"
                    value={settings.maxConcurrentBacktests}
                    onChange={(e) => handleInputChange('maxConcurrentBacktests', parseInt(e.target.value))}
                    placeholder="请输入数量"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">通知设置</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <div className="font-medium text-slate-900">交易信号通知</div>
                    <div className="text-sm text-slate-600">策略产生交易信号时发送通知</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.signals}
                      onChange={(e) => handleInputChange('notifications', { ...settings.notifications, signals: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <div className="font-medium text-slate-900">回测完成通知</div>
                    <div className="text-sm text-slate-600">回测任务完成时发送通知</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.backtest}
                      onChange={(e) => handleInputChange('notifications', { ...settings.notifications, backtest: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <div className="font-medium text-slate-900">系统异常通知</div>
                    <div className="text-sm text-slate-600">系统出现异常时发送通知</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.errors}
                      onChange={(e) => handleInputChange('notifications', { ...settings.notifications, errors: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">安全设置</h3>
              <div className="space-y-6">
                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-medium text-slate-900 mb-3">API密钥配置</h4>
                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        label="API Key"
                        type={showApiKey ? 'text' : 'password'}
                        value={formData.apiKey}
                        onChange={(e) => handleInputChange('apiKey', e.target.value)}
                        placeholder="请输入API Key"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <Input
                      label="Secret Key"
                      type="password"
                      value={formData.secretKey}
                      onChange={(e) => handleInputChange('secretKey', e.target.value)}
                      placeholder="请输入Secret Key"
                    />
                  </div>
                </div>
                
                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-medium text-slate-900 mb-3">密码修改</h4>
                  <div className="space-y-4">
                    <Input
                      label="当前密码"
                      type="password"
                      placeholder="请输入当前密码"
                    />
                    <Input
                      label="新密码"
                      type="password"
                      placeholder="请输入新密码"
                    />
                    <Input
                      label="确认新密码"
                      type="password"
                      placeholder="请再次输入新密码"
                    />
                    <Button variant="outline">
                      <Lock className="h-4 w-4 mr-2" />
                      修改密码
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">外观设置</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="主题模式"
                    options={[
                      { value: 'light', label: '浅色模式' },
                      { value: 'dark', label: '深色模式' },
                      { value: 'auto', label: '跟随系统' }
                    ]}
                    value={settings.theme}
                    onChange={(value) => handleInputChange('theme', value)}
                  />
                  <Select
                    label="语言"
                    options={[
                      { value: 'zh-CN', label: '简体中文' },
                      { value: 'en-US', label: 'English' },
                      { value: 'ja-JP', label: '日本語' }
                    ]}
                    value={settings.language}
                    onChange={(value) => handleInputChange('language', value)}
                  />
                </div>
                
                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-medium text-slate-900 mb-3">图表设置</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900">显示网格线</div>
                        <div className="text-sm text-slate-600">在图表中显示网格线</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.chartSettings.showGrid}
                          onChange={(e) => handleInputChange('chartSettings', { ...settings.chartSettings, showGrid: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900">动画效果</div>
                        <div className="text-sm text-slate-600">启用图表动画效果</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.chartSettings.animations}
                          onChange={(e) => handleInputChange('chartSettings', { ...settings.chartSettings, animations: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">设置</h1>
          <p className="text-slate-600 mt-1">管理您的账户和系统偏好设置</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleExportSettings}>
            <Download className="h-4 w-4 mr-2" />
            导出设置
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            导入设置
          </Button>
          <Button variant="outline" onClick={resetSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            重置
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            保存
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 侧边栏导航 */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>个人资料</span>
                </button>
                <button
                  onClick={() => setActiveTab('system')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'system'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <SettingsIcon className="h-4 w-4" />
                  <span>系统配置</span>
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'notifications'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Bell className="h-4 w-4" />
                  <span>通知设置</span>
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'security'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  <span>安全设置</span>
                </button>
                <button
                  onClick={() => setActiveTab('appearance')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'appearance'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Palette className="h-4 w-4" />
                  <span>外观设置</span>
                </button>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* 主内容区域 */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              {renderTabContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;