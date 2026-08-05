import { useState } from 'react';
import { formatWithCommas, parseRawNumber } from '../utils/formatters';

const API = import.meta.env.VITE_API_URL || '/api';

const CATEGORIES = [
  { id: 'smartphone', label: 'Smartphone', icon: '📱' },
  { id: 'electronics', label: 'Home Appliances', icon: '📺' },
  { id: 'cars', label: 'Cars', icon: '🚘' },
  { id: 'travel', label: 'Travel & Flights', icon: '✈️' },
  { id: 'further_studies', label: 'Further Studies', icon: '🎓' },
  { id: 'real_estate', label: 'Real Estate', icon: '🏘️' },
  { id: 'custom', label: 'Custom Goal', icon: '✨' },
];

export default function FutureGoalPlanner({ onClose }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFormattedFieldChange = (field, value) => {
    const formatted = formatWithCommas(value);
    setFormData(prev => ({ ...prev, [field]: formatted }));
  };

  const handleFormSubmit = async () => {
    // Only support the advanced ones for now
    if (['real_estate', 'custom'].includes(activeCategory)) {
        setResult({ insight: 'Standard goals use the default tracking view from the main dashboard.' });
        return;
    }

    setLoading(true);
    setResult(null);
    try {
      const payloadClean = { ...formData };
      if (payloadClean.budget) {
        payloadClean.budget = parseRawNumber(payloadClean.budget);
      }

      const res = await fetch(`${API}/goal-planner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: activeCategory,
          payload: payloadClean
        })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
      } else {
        setResult({ error: 'Failed to generate plan.' });
      }
    } catch {
      setResult({ error: 'Connection to AI Planner lost.' });
    } finally {
      setLoading(false);
    }
  };

  const renderConfigFields = () => {
    if (!activeCategory) return null;

    if (activeCategory === 'smartphone' || activeCategory === 'electronics') {
      return (
        <div className="planner-grid animate-in">
          <div className="form-group">
            <label>Brand Preference</label>
            <input className="form-input" placeholder="e.g. Apple, Sony, Dyson" onChange={e => handleFieldChange('brand', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Budget Range (₹)</label>
            <input type="text" inputMode="numeric" className="form-input" placeholder="e.g. 1,20,000" value={formData.budget || ''} onChange={e => handleFormattedFieldChange('budget', e.target.value)} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ margin: 0, fontWeight: 600 }}>Purchase Urgency (Months away)</label>
              <span style={{ 
                fontSize: '0.85rem', 
                fontWeight: 800, 
                color: 'var(--primary)', 
                fontFamily: 'Manrope', 
                background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                padding: '4px 12px', 
                borderRadius: '16px',
                border: '1px solid #90caf9',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                📅 {formData.urgencyMonths || 1} {Number(formData.urgencyMonths || 1) === 1 ? 'Month' : 'Months'} Selected
              </span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="12" 
              step="1" 
              value={formData.urgencyMonths || 1}
              style={{ width: '100%', accentColor: 'var(--primary)' }} 
              onChange={e => handleFieldChange('urgencyMonths', e.target.value)} 
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: 6, color: 'var(--outline)' }}>
              <span>Within 1 Month</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)', background: '#eef6ff', padding: '2px 8px', borderRadius: 8 }}>
                Current: {formData.urgencyMonths || 1} {Number(formData.urgencyMonths || 1) === 1 ? 'Month' : 'Months'}
              </span>
              <span>Flexible (12 Months)</span>
            </div>
          </div>
        </div>
      );
    }

    if (activeCategory === 'cars') {
      return (
        <div className="planner-grid animate-in">
          <div className="form-group">
            <label>Make / Model</label>
            <input className="form-input" placeholder="e.g. Mahindra XUV700" onChange={e => handleFieldChange('brand', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Expected Price (₹)</label>
            <input type="text" inputMode="numeric" className="form-input" placeholder="e.g. 24,00,000" value={formData.budget || ''} onChange={e => handleFormattedFieldChange('budget', e.target.value)} />
          </div>
        </div>
      );
    }

    if (activeCategory === 'travel') {
      return (
        <div className="planner-grid animate-in">
          <div className="form-group">
            <label>Origin & Destination</label>
            <input className="form-input" placeholder="e.g. Delhi to Tokyo" onChange={e => handleFieldChange('route', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Budget / Expected Price (₹)</label>
            <input type="text" inputMode="numeric" className="form-input" placeholder="e.g. 80,000" value={formData.budget || ''} onChange={e => handleFormattedFieldChange('budget', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Expected Travel Date</label>
            <input type="date" className="form-input" onChange={e => handleFieldChange('travelDate', e.target.value)} />
          </div>
          <div className="form-group flex-centered" style={{ justifyContent: 'flex-start', gap: 12 }}>
            <input type="checkbox" id="flexDate" onChange={e => handleFieldChange('flexibleDate', e.target.checked)} />
            <label htmlFor="flexDate" style={{ margin: 0, fontSize: '0.85rem' }}>My dates are flexible</label>
          </div>
        </div>
      );
    }

    if (activeCategory === 'further_studies') {
      return (
        <div className="planner-grid animate-in">
          <div className="form-group">
            <label>Program Tuition (₹)</label>
            <input type="text" inputMode="numeric" className="form-input" placeholder="e.g. 15,00,000" value={formData.budget || ''} onChange={e => handleFormattedFieldChange('budget', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Months until Enrollment</label>
            <input type="number" className="form-input" placeholder="e.g. 24" onChange={e => handleFieldChange('urgencyMonths', e.target.value)} />
          </div>
          <div className="form-group flex-centered" style={{ justifyContent: 'flex-start', gap: 12 }}>
            <input type="checkbox" id="scholarship" onChange={e => handleFieldChange('scholarship', e.target.checked)} />
            <label htmlFor="scholarship" style={{ margin: 0, fontSize: '0.85rem' }}>Eligibility for Scholarships</label>
          </div>
        </div>
      );
    }

    return <p style={{ fontSize: '0.9rem', color: 'var(--outline)' }}>Configuration not available for this custom goal.</p>;
  };

  return (
    <div className="planner-overlay animate-fade">
      <div className="planner-modal">
        <header className="planner-header">
          <div>
            <h2 style={{ fontFamily: 'Manrope', margin: 0 }}>Advanced Setup</h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--outline)' }}>
              Simulate seasonal discounts, market trends, and AI timelines.
            </p>
          </div>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </header>

        <div className="planner-content">
          <div className="category-scroll">
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                className={`category-pill ${activeCategory === c.id ? 'active' : ''}`}
                onClick={() => { setActiveCategory(c.id); setFormData({}); setResult(null); }}
              >
                <span>{c.icon}</span> {c.label}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 24 }}>
            {renderConfigFields()}
          </div>

          {activeCategory && (
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: 24, padding: '14px' }}
              onClick={handleFormSubmit}
              disabled={loading}
            >
              {loading ? 'Crunching Predictive Data...' : '✨ Generate AI Planner Strategy'}
            </button>
          )}

          {result && !result.error && (
            <div className="planner-results animate-in">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div className="metric-box">
                  <span className="metric-label">Best Timing</span>
                  <span className="metric-value" style={{ color: 'var(--primary)' }}>{result.bestMonth || 'Now'}</span>
                </div>
                {result.expectedSavings > 0 ? (
                  <div className="metric-box success-metric">
                    <span className="metric-label">Seasonal Savings</span>
                    <span className="metric-value">₹{result.expectedSavings.toLocaleString()}</span>
                  </div>
                ) : (
                  <div className="metric-box warning-metric">
                    <span className="metric-label">Market Status</span>
                    <span className="metric-value">Standard / Peak Rate</span>
                  </div>
                )}
                {result.monthlySavingsRequired > 0 && (
                  <div className="metric-box" style={{ gridColumn: '1 / -1' }}>
                    <span className="metric-label">Required Monthly Allocation</span>
                    <span className="metric-value">₹{result.monthlySavingsRequired.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {result.insight && (
                <div className="insight-banner">
                  <span className="material-symbols-outlined">lightbulb</span>
                  <p>{result.insight}</p>
                </div>
              )}

              {result.simulatedFlightPrice && (
                 <div className="insight-banner" style={{ background: '#f8fbff', marginTop: 12 }}>
                   <strong>Simulated Flight Price:</strong> ₹{result.simulatedFlightPrice.toLocaleString()}
                 </div>
              )}

              {result.aiExplanation && (
                <div className="ai-wrap" style={{ marginTop: 20 }}>
                  <h4 style={{ fontSize: '0.85rem', marginBottom: 8, color: 'var(--on-surface-variant)' }}>Sovereign Mentor Verdict</h4>
                  <div style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--on-surface)' }}>
                    {result.aiExplanation.split('\n').map((para, i) => (
                      <p key={i} style={{ marginBottom: 8 }}>{para}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {result?.error && (
            <div className="planner-results animate-in" style={{ borderColor: 'var(--error)' }}>
                <p style={{ color: 'var(--error)' }}>{result.error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
