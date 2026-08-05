import { useEffect, useRef } from 'react';

function formatINR(num) {
  if (num === null || num === undefined || isNaN(num)) return '₹0';
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

      {/* 3-WAY FINANCING STRATEGIES COMPARISON (ONLY LOAN, ONLY SIP, HYBRID LOAN+SIP) */}
      {data.strategies && (
        <div className="card animate-in" style={{ marginBottom: 24 }}>
          <div className="card-header" style={{ marginBottom: 16 }}>
            <span className="icon">🏛️</span>
            <h3>Goal Financing Pathways</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, marginLeft: 'auto', background: '#e3f2fd', padding: '4px 10px', borderRadius: 12 }}>
              Powered by Groq AI Engine
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 16, marginBottom: 12 }}>
            {/* 1. ONLY LOAN */}
            <div style={{
              background: 'var(--surface-container-low)',
              border: '1px solid rgba(211,47,47,0.2)',
              borderRadius: 'var(--radius-md)',
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#d32f2f', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    🏦 1. Only Loan
                  </span>
                  <span style={{ fontSize: '0.7rem', background: 'rgba(211,47,47,0.1)', color: '#d32f2f', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                    100% Debt
                  </span>
                </div>

                <div style={{ fontSize: '1.4rem', fontFamily: 'Manrope', fontWeight: 800, color: '#d32f2f', marginBottom: 12 }}>
                  {formatINR(data.strategies.onlyLoan.monthlyEmi)}<span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--outline)' }}> /mo EMI</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.82rem' }}>
                  <MetricRow label="Down Payment (20%)" value={formatINR(data.strategies.onlyLoan.downPayment)} color="var(--on-surface)" />
                  <MetricRow label="Loan Principal" value={formatINR(data.strategies.onlyLoan.loanAmount)} color="var(--on-surface)" />
                  <MetricRow label="Tenure & Rate" value={`${data.strategies.onlyLoan.tenureYears} Yrs @ ${data.strategies.onlyLoan.interestRate}%`} color="var(--outline)" />
                  <MetricRow label="Total Interest Paid" value={formatINR(data.strategies.onlyLoan.totalInterestPaid)} color="#d32f2f" />
                </div>
              </div>

              <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px dashed rgba(211,47,47,0.2)', fontSize: '0.75rem', color: 'var(--outline)' }}>
                ⚡ Immediate access to goal, but high cumulative interest cost over {data.strategies.onlyLoan.tenureYears} years.
              </div>
            </div>

            {/* 2. ONLY SIP */}
            <div style={{
              background: 'var(--surface-container-low)',
              border: '1px solid rgba(56,142,60,0.2)',
              borderRadius: 'var(--radius-md)',
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#2e7d32', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    📈 2. Only SIP
                  </span>
                  <span style={{ fontSize: '0.7rem', background: 'rgba(56,142,60,0.1)', color: '#2e7d32', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                    100% Debt-Free
                  </span>
                </div>

                <div style={{ fontSize: '1.4rem', fontFamily: 'Manrope', fontWeight: 800, color: '#2e7d32', marginBottom: 12 }}>
                  {formatINR(data.strategies.onlySip.monthlySip)}<span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--outline)' }}> /mo SIP</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.82rem' }}>
                  <MetricRow label="Time Horizon" value={`${data.strategies.onlySip.yearsNeeded} Years`} color="#2e7d32" />
                  <MetricRow label="Expected Growth" value="12.0% CAGR" color="var(--on-surface)" />
                  <MetricRow label="Capital Invested" value={formatINR(data.strategies.onlySip.totalInvested)} color="var(--on-surface)" />
                  <MetricRow label="Wealth Created" value={formatINR(data.strategies.onlySip.wealthGained)} color="#2e7d32" />
                </div>
              </div>

              <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px dashed rgba(56,142,60,0.2)', fontSize: '0.75rem', color: 'var(--outline)' }}>
                🛡️ Zero interest or debt burden. Pure compounding wealth accumulation to buy outright in cash.
              </div>
            </div>

            {/* 3. HYBRID LOAN + SIP */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(2,136,209,0.06), rgba(0,108,71,0.06))',
              border: '1.5px solid var(--primary-container)',
              borderRadius: 'var(--radius-md)',
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    ⚖️ 3. Hybrid (Loan + SIP)
                  </span>
                  <span style={{ fontSize: '0.7rem', background: 'var(--primary-container)', color: 'var(--on-primary-container)', padding: '2px 8px', borderRadius: 10, fontWeight: 800 }}>
                    ⭐ Recommended
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', marginBottom: 12 }}>
                  <div>
                    <span style={{ fontSize: '1.15rem', fontFamily: 'Manrope', fontWeight: 800, color: 'var(--primary)' }}>
                      {formatINR(data.strategies.hybrid.monthlyEmi)}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--outline)' }}> EMI</span>
                  </div>
                  <span style={{ fontSize: '0.9rem', color: 'var(--outline)' }}>+</span>
                  <div>
                    <span style={{ fontSize: '1.15rem', fontFamily: 'Manrope', fontWeight: 800, color: '#2e7d32' }}>
                      {formatINR(data.strategies.hybrid.parallelSip)}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--outline)' }}> SIP</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.82rem' }}>
                  <MetricRow label="Down Payment (30%)" value={formatINR(data.strategies.hybrid.downPayment)} color="var(--on-surface)" />
                  <MetricRow label="Est. Loan Prepayment" value={`~${data.strategies.hybrid.payoffEstimateYears} Years`} color="var(--primary)" />
                  <MetricRow label="Estimated Interest Saved" value={`~${formatINR(data.strategies.hybrid.interestSavedEstimate)}`} color="#2e7d32" />
                </div>
              </div>

              <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px dashed var(--primary-container)', fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>
                💡 Balanced path: Get early possession while parallel SIP growth helps prepay your loan years ahead of schedule!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Advice */}
      <div className="card advice-card animate-in">
        <div className="card-header">
          <span className="icon">🧠</span>
          <h3>Private Wealth Mentor (Groq AI Strategic Breakdown)</h3>
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
