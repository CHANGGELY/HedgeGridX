import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import StrategyConfig from './pages/StrategyConfig';
import BacktestResults from './pages/BacktestResults';
import Optimization from './pages/Optimization';
import LiveMonitor from './pages/LiveMonitor';
import DataManagement from './pages/DataManagement';
import Settings from './pages/Settings';

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
