import { useEffect, useState, useCallback } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DetailView from './pages/DetailView';
import ProspectsView from './pages/ProspectsView';
import { fetchSummaries, startScan, fetchScanStatus, exportCsvUrl } from './api';
import type { ComSummary } from './types';

export default function App() {
  const [summaries, setSummaries] = useState<ComSummary[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const location = useLocation();

  const loadSummaries = useCallback(async () => {
    const data = await fetchSummaries();
    setSummaries(data);
  }, []);

  useEffect(() => {
    loadSummaries();
  }, [loadSummaries]);

  useEffect(() => {
    if (!scanning) return;
    const interval = setInterval(async () => {
      const status = await fetchScanStatus();
      if (!status.globalScanRunning) {
        setScanning(false);
        setScanMessage('');
        loadSummaries();
      } else {
        const active = Object.entries(status.statuses).find(
          ([, v]) => typeof v === 'object' && v !== null && (v as { status: string }).status === 'scanning'
        );
        if (active) {
          const prog = active[1] as { message?: string; completed: number; total: number };
          setScanMessage(prog.message || `Scanning ${active[0]} (${prog.completed}/${prog.total})`);
        }
      }
      loadSummaries();
    }, 3000);
    return () => clearInterval(interval);
  }, [scanning, loadSummaries]);

  const handleScan = async () => {
    setScanning(true);
    setScanMessage('Starting scan…');
    try {
      await startScan();
    } catch {
      setScanning(false);
      setScanMessage('');
    }
  };

  const isDashboard = location.pathname === '/';
  const isProspects = location.pathname === '/prospects';

  return (
    <div className="app-layout">
      <header className="app-header">
        <div>
          <h1>COM Buyer Prospector</h1>
          <p className="subtitle">Find alternate-TLD owners who may want to upgrade to your .com</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <nav className="nav-tabs">
            <Link to="/">
              <button className={`nav-tab ${isDashboard ? 'active' : ''}`}>Dashboard</button>
            </Link>
            <Link to="/prospects">
              <button className={`nav-tab ${isProspects ? 'active' : ''}`}>Best .com Buyers</button>
            </Link>
          </nav>
          <a href={exportCsvUrl()} className="btn-secondary btn-sm" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            Export CSV
          </a>
          <button className="btn-primary" onClick={handleScan} disabled={scanning}>
            {scanning ? 'Scanning…' : 'Run Scan'}
          </button>
        </div>
      </header>

      {scanning && (
        <div className="scan-banner">
          <div className="spinner" />
          <span>{scanMessage || 'Scan in progress — checking RDAP, DNS, and websites across all TLDs…'}</span>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Dashboard summaries={summaries} />} />
        <Route path="/domain/:targetCom" element={<DetailView />} />
        <Route path="/prospects" element={<ProspectsView />} />
      </Routes>
    </div>
  );
}
