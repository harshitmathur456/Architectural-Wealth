export default function Sidebar({ activePage, onNavigate, aiStatus }) {
  const navItems = [
    { id: 'input', icon: '✏️', label: 'Input' },
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'chat', icon: '💬', label: 'Mentor' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>Sovereign Curator</h1>
        <p>Financial Mentor System</p>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <div
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="engine-status">
          <div className="status-item">
            <span className="status-dot active" />
            <span>Logic Engine — Active</span>
          </div>
          <div className="status-item">
            <span className={`status-dot ${aiStatus ? 'active' : 'inactive'}`} />
            <span>AI Engine — {aiStatus ? 'Connected' : 'Fallback'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
