import { useEffect, useRef } from 'react';

function formatINR(num) {
  return '₹' + Number(num).toLocaleString('en-IN');
}

export default function Dashboard({ data, onGoToChat }) {
  const ringRef = useRef(null);

  useEffect(() => {
    if (ringRef.current) {
      const circumference = 2 * Math.PI * 70;
      const offset = circumference - (data.score / 10) * circumference;
      setTimeout(() => {
        ringRef.current.style.strokeDashoffset = offset;
      }, 300);
    }
  }, [data.score]);

  const ratingLabels = {
    excellent: 'Aggressive',
    good: 'Stable',
    average: 'Moderate',
    below_average: 'Conservative',
    poor: 'Critical'
  };

  return (
    <div>
      <div className="page-header">
        <h2>Sovereign Index</h2>
        <p>Your comprehensive financial health analysis and strategic execution plan</p>
      </div>

      {/* Score + Stats Row */}
      <div className="dashboard-grid">
        {/* Score Ring — Hero Card */}
        <div className="stat-card score-ring-container animate-in">
          <div className="score-ring">
            <svg viewBox="0 0 160 160">
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8af5be" />
                  <stop offset="50%" stopColor="#71dba6" />
                  <stop offset="100%" stopColor="#006c47" />
                </linearGradient>
              </defs>
              <circle className="score-ring-bg" cx="80" cy="80" r="70" />
              <circle
                ref={ringRef}
                className="score-ring-fill"
                cx="80"
                cy="80"
                r="70"
              />
            </svg>
            <div className="score-ring-value">
              <span className="score-number">{data.score}</span>
              <span className="score-max">/ 10</span>
            </div>
          </div>
          <span className="score-label">Sovereign Index</span>
        </div>

        {/* Monthly Savings */}
        <div className="card stat-card animate-in">
          <div style={{ marginBottom: 12 }}>
            <span className="stat-label">Excess Liquidity</span>
          </div>
          <div className={`stat-value ${data.savings > 0 ? 'green' : 'yellow'}`}>
            {formatINR(data.savings)}
          </div>
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <MetricRow label="Auto-Savings" value={`${data.expenseAnalysis.savingsPercent}%`} color="var(--secondary)" />
            <MetricRow label="Risk Profile" value={ratingLabels[data.expenseAnalysis.rating] || 'Unknown'} color="var(--primary-container)" />
          </div>
        </div>

        {/* Recommended SIP */}
        <div className="card stat-card animate-in">
          <div style={{ marginBottom: 12 }}>
            <span className="stat-label">Execution Strategy</span>
          </div>
          <div className="stat-value accent">{formatINR(data.sip)}</div>
          <div className="stat-label" style={{ marginTop: 4 }}>Recommended SIP</div>
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <MetricRow label="Remaining Buffer" value={formatINR(data.monthlyBreakdown.remainingAfterSIP)} color="var(--outline)" />
            <MetricRow label="Growth Mode" value={data.score >= 7 ? 'Aggressive' : 'Balanced'} color="var(--secondary)" />
          </div>
        </div>
      </div>

      {/* Goal Timeline */}
      {data.goalTimeline && (
        <div className="card timeline-card animate-in" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <span className="icon">🎯</span>
            <h3>Strategic Goal — {data.goal?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
              {formatINR(data.goalTimeline.targetAmount)}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--outline)' }}>
              {data.goalTimeline.achievable ? '✅ Achievable' : '⚠️ Challenging'}
            </span>
          </div>
          <div className="timeline-bar">
            <div
              className="timeline-fill"
              style={{ width: `${Math.min((1 / Math.max(data.goalTimeline.years, 1)) * 100, 100)}%` }}
            />
          </div>
          <div className="timeline-info">
            <span>{data.goalTimeline.months} months ({data.goalTimeline.years} years)</span>
            <span>At current savings rate</span>
          </div>
        </div>
      )}

      {/* Monthly Breakdown + Suggestions */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 24 }}>
        <div className="card animate-in">
          <div className="card-header">
            <span className="icon">📊</span>
            <h3>Capital Flow</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <BreakdownRow label="Gross Income" value={formatINR(data.income)} color="var(--secondary)" />
            <BreakdownRow label="Obligations" value={formatINR(data.expenses)} color="var(--error)" />
            <div style={{ height: 1, background: 'var(--surface-container)' }} />
            <BreakdownRow label="Net Surplus" value={formatINR(data.savings)} color="var(--primary)" bold />
            <BreakdownRow label="SIP Allocation" value={formatINR(data.sip)} color="var(--primary-container)" />
            <BreakdownRow label="Lifestyle Buffer" value={formatINR(data.monthlyBreakdown.remainingAfterSIP)} color="var(--outline)" />
          </div>
        </div>

        {/* Smart Suggestions */}
        <div className="card animate-in">
          <div className="card-header">
            <span className="icon">💡</span>
            <h3>Strategic Insights</h3>
          </div>
          <div className="suggestions-list">
            {data.suggestions?.map((s, i) => (
              <div key={i} className="suggestion-item">{s}</div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Advice */}
      <div className="card advice-card animate-in">
        <div className="card-header">
          <span className="icon">🧠</span>
          <h3>Private Wealth Mentor</h3>
        </div>
        <div style={{
          padding: '20px 24px',
          background: 'var(--surface-container-low)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 20,
          borderLeft: '3px solid var(--secondary)'
        }}>
          <div
            className="ai-advice-content"
            dangerouslySetInnerHTML={{ __html: formatAdvice(data.aiAdvice) }}
          />
        </div>
        <button className="btn btn-primary" onClick={onGoToChat}>
          Continue with Mentor →
        </button>
      </div>
    </div>
  );
}

function MetricRow({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.72rem', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: '0.82rem', fontWeight: 700, color, fontFamily: 'Manrope, sans-serif' }}>{value}</span>
    </div>
  );
}

function BreakdownRow({ label, value, color, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.88rem', color: 'var(--on-surface-variant)' }}>{label}</span>
      <span style={{ fontSize: '0.95rem', fontWeight: bold ? 800 : 700, color, fontFamily: 'Manrope, sans-serif' }}>{value}</span>
    </div>
  );
}

function formatAdvice(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
    .replace(/- /g, '• ');
}
