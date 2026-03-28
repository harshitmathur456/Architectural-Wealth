import { useState, useEffect } from 'react';
import './index.css';
import InputForm from './components/InputForm';
import Dashboard from './components/Dashboard';
import ChatUI from './components/ChatUI';
import Login from './components/Login';

const API = 'http://localhost:5000/api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [page, setPage] = useState('input');
  const [analysisData, setAnalysisData] = useState(null);
  const [aiStatus, setAiStatus] = useState(false);

  useEffect(() => {
    fetch(`${API}/health`)
      .then(res => res.json())
      .then(data => { if (data.engines) setAiStatus(data.engines.ai); })
      .catch(() => {});
  }, []);

  const handleAnalysisComplete = (data) => {
    setAnalysisData(data);
    setPage('dashboard');
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <>
      {/* Top Navbar */}
      <header className="top-navbar">
        <div className="navbar-brand">
          <div className="navbar-logo">💎</div>
          <span className="navbar-title">Sovereign Curator</span>
        </div>
        <div className="navbar-actions">
          <button className="navbar-icon-btn" title="Notifications">🔔</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {page === 'input' && (
          <InputForm onAnalysisComplete={handleAnalysisComplete} />
        )}
        {page === 'dashboard' && analysisData ? (
          <Dashboard data={analysisData} onGoToChat={() => setPage('chat')} />
        ) : page === 'dashboard' && !analysisData ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No Analysis Yet</h3>
            <p>Go to Input to run your first analysis</p>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setPage('input')}>
              Run Analysis
            </button>
          </div>
        ) : null}
        {page === 'chat' && <ChatUI />}
      </main>

      {/* Bottom Tab Bar */}
      <nav className="bottom-bar">
        <button
          className={`tab-item ${page === 'input' ? 'active' : ''}`}
          onClick={() => setPage('input')}
        >
          <span className="tab-icon">✏️</span>
          <span>Input</span>
        </button>
        <button
          className={`tab-item ${page === 'dashboard' ? 'active' : ''}`}
          onClick={() => setPage('dashboard')}
        >
          <span className="tab-icon">📊</span>
          <span>Dashboard</span>
        </button>
        <button
          className={`tab-item ${page === 'chat' ? 'active' : ''}`}
          onClick={() => setPage('chat')}
        >
          <span className="tab-icon">💬</span>
          <span>Mentor</span>
        </button>
      </nav>
    </>
  );
}
