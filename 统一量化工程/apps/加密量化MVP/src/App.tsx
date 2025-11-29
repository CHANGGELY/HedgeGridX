import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// 路由按需加载（代码分割）
const 布局 = lazy(() => import('./components/布局'));
const 仪表盘 = lazy(() => import('./pages/仪表盘'));
const 策略配置 = lazy(() => import('./pages/策略配置'));
const 回测结果 = lazy(() => import('./pages/回测结果'));
const 参数优化 = lazy(() => import('./pages/参数优化'));
const 实时监控 = lazy(() => import('./pages/实时监控'));
const 数据管理 = lazy(() => import('./pages/数据管理'));
const 用户设置 = lazy(() => import('./pages/用户设置'));

function App() {
  return (
    <Router>
      <div className="App">
        <Suspense fallback={<div className="p-6 text-slate-600">加载中...</div>}>
          <Routes>
            <Route path="/" element={<布局 />}>
              {/* 英文路径（兼容） */}
              <Route index element={<仪表盘 />} />
              <Route path="strategy-config" element={<策略配置 />} />
              <Route path="backtest-results" element={<回测结果 />} />
              <Route path="optimization" element={<参数优化 />} />
              <Route path="live-monitor" element={<实时监控 />} />
              <Route path="data-management" element={<数据管理 />} />
              <Route path="settings" element={<用户设置 />} />

              {/* 中文路径（新增别名） */}
              <Route path="仪表盘" element={<仪表盘 />} />
              <Route path="策略配置" element={<策略配置 />} />
              <Route path="回测结果" element={<回测结果 />} />
              <Route path="参数优化" element={<参数优化 />} />
              <Route path="实时监控" element={<实时监控 />} />
              <Route path="数据管理" element={<数据管理 />} />
              <Route path="用户设置" element={<用户设置 />} />
            </Route>
          </Routes>
        </Suspense>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155'
            }
          }}
        />
      </div>
    </Router>
  );
}

export default App
