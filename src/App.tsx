import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/布局';
import Dashboard from './pages/仪表盘';
import StrategyConfig from './pages/策略配置';
import BacktestResults from './pages/回测结果';
import Optimization from './pages/参数优化';
import LiveMonitor from './pages/实时监控';
import DataManagement from './pages/数据管理';
import Settings from './pages/用户设置';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="strategy-config" element={<StrategyConfig />} />
            <Route path="backtest-results" element={<BacktestResults />} />
            <Route path="optimization" element={<Optimization />} />
            <Route path="live-monitor" element={<LiveMonitor />} />
            <Route path="data-management" element={<DataManagement />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
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
