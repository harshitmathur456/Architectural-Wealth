import { useState, useEffect } from 'react';
import './index.css';
import InputForm from './components/InputForm';
import Dashboard from './components/Dashboard';
import ChatUI from './components/ChatUI';
import Login from './components/Login';

const API = import.meta.env.VITE_API_URL || '/api';

export default function App() {
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('userEmail')));
  const [page, setPage] = useState('input');
  const [analysisData, setAnalysisData] = useState(null);
  const [aiStatus, setAiStatus] = useState(false);

  useEffect(() => {
    fetch(`${API}/health`)
      .then(res => res.json())
      .then(data => { if (data.engines) setAiStatus(data.engines.groq); })
      .catch(() => {});
  }, []);

  const handleLogin = (email) => {
    const loggedInEmail = email || 'user@architecturalwealth.com';
    setUserEmail(loggedInEmail);
    localStorage.setItem('userEmail', loggedInEmail);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    setUserEmail('');
    setIsAuthenticated(false);
    setAnalysisData(null);
    setPage('input');
  };

  const handleAnalysisComplete = (data) => {
    setAnalysisData(data);
    setPage('dashboard');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
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
          <div className="user-badge" style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', background: 'var(--surface-container-high)', padding: '4px 12px', borderRadius: 20, fontWeight: 600 }}>
            👤 {userEmail}
          </div>
          <button 
            className="btn-logout" 
            onClick={handleLogout}
            title="Logout and return to Login"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {page === 'input' && (
          <InputForm userEmail={userEmail} onAnalysisComplete={handleAnalysisComplete} />
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
