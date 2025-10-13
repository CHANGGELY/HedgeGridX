import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Settings,
  TrendingUp,
  Zap,
  Monitor,
  Database,
  User,
  Menu,
  X,
  Activity
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const navigation: NavItem[] = [
  {
    name: '仪表板',
    href: '/',
    icon: BarChart3,
    description: '策略概览和实时监控'
  },
  {
    name: '策略配置',
    href: '/strategy-config',
    icon: Settings,
    description: '创建和配置交易策略'
  },
  {
    name: '回测结果',
    href: '/backtest-results',
    icon: TrendingUp,
    description: '查看策略回测表现'
  },
  {
    name: '参数优化',
    href: '/optimization',
    icon: Zap,
    description: '优化策略参数'
  },
  {
    name: '实时监控',
    href: '/live-monitor',
    icon: Monitor,
    description: '实时价格和信号监控'
  },
  {
    name: '数据管理',
    href: '/data-management',
    icon: Database,
    description: '管理历史数据'
  },
  {
    name: '用户设置',
    href: '/settings',
    icon: User,
    description: '个人偏好设置'
  }
];

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 移动端侧边栏遮罩 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-blue-900 to-blue-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo区域 */}
          <div className="flex items-center justify-between px-6 py-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500">
                <Activity className="h-6 w-6 text-blue-900" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">量化交易</h1>
                <p className="text-sm text-blue-200">策略回测系统</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-white hover:bg-blue-800"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 px-4 pb-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={cn(
                        'group flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200',
                        active
                          ? 'bg-yellow-500 text-blue-900 shadow-lg'
                          : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon
                        className={cn(
                          'mr-3 h-5 w-5 flex-shrink-0',
                          active ? 'text-blue-900' : 'text-blue-300 group-hover:text-white'
                        )}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div
                          className={cn(
                            'text-xs mt-0.5',
                            active ? 'text-blue-700' : 'text-blue-300 group-hover:text-blue-100'
                          )}
                        >
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* 底部信息 */}
          <div className="border-t border-blue-700 px-6 py-4">
            <div className="text-xs text-blue-300">
              <div className="font-medium text-blue-100">系统状态</div>
              <div className="mt-1 flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span>运行正常</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="lg:pl-72">
        {/* 顶部导航栏 */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {navigation.find(item => isActive(item.href))?.name || '仪表板'}
                </h2>
                <p className="text-sm text-slate-600">
                  {navigation.find(item => isActive(item.href))?.description || '策略概览和实时监控'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-slate-600">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>实时连接</span>
              </div>
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                用户中心
              </Button>
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;