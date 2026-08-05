import { useState } from 'react';
import FutureGoalPlanner from './FutureGoalPlanner';
import { formatWithCommas, parseRawNumber } from '../utils/formatters';

const API = 'http://localhost:5000/api';

const GOALS = [
  { value: 'house', label: 'Real Estate', icon: '🏠' },
  { value: 'car', label: 'Vehicle', icon: '🚗' },
  { value: 'vacation', label: 'Travel', icon: '✈️' },
  { value: 'education', label: 'Further Studies', icon: '🎓' },
  { value: 'other', label: 'Custom', icon: '➕' },
];

export default function InputForm({ userEmail, onAnalysisComplete }) {
  const [showPlanner, setShowPlanner] = useState(false);
  const [formData, setFormData] = useState({
    income: '',
    expenses: '',
    goal: 'house',
    goalAmount: '',
  });

  // Real Estate State
  const [realEstateConfig, setRealEstateConfig] = useState({
    propertyType: 'flat',
    price: '',
    downPayment: '',
    interestRate: 8.5,
    loanTenure: 20
  });

  // Vehicle State
  const [vehicleConfig, setVehicleConfig] = useState({
    priceRangeLakhs: 5,
    downPayment: ''
  });
  const [vehicleMentorAdvice, setVehicleMentorAdvice] = useState('');
  const [fetchingMentor, setFetchingMentor] = useState(false);

  // Travel State
  const [travelConfig, setTravelConfig] = useState({
    country: ''
  });
  const [exchangeData, setExchangeData] = useState({ rate: null, loading: false, error: '' });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFormattedChange = (e) => {
    const { name, value } = e.target;
    const formatted = formatWithCommas(value);
    setFormData(prev => ({ ...prev, [name]: formatted }));
    setError('');
  };

  const handleRealEstatePriceChange = (e) => {
    const formatted = formatWithCommas(e.target.value);
    setRealEstateConfig(prev => ({ ...prev, price: formatted }));
  };

  const handleRealEstateDownPaymentChange = (e) => {
    const formatted = formatWithCommas(e.target.value);
    setRealEstateConfig(prev => ({ ...prev, downPayment: formatted }));
  };

  const handleVehicleDownPaymentChange = (e) => {
    const formatted = formatWithCommas(e.target.value);
    setVehicleConfig(prev => ({ ...prev, downPayment: formatted }));
  };

  // Helper calculations for Real Estate
  const getAffordability = () => {
    const inc = parseRawNumber(formData.income);
    const exp = parseRawNumber(formData.expenses);
    const prc = parseRawNumber(realEstateConfig.price);
    const dp = parseRawNumber(realEstateConfig.downPayment);
    if (!prc || !inc || !exp) return null;
    
    // Monthly disposable income
    const surplus = inc - exp;
    if (surplus <= 0) return { emi: 0, affordable: false, message: 'No surplus capital available.' };

    const P = prc;
    const down = (dp && dp > 0) ? dp : P * 0.20;
    const L = Math.max(0, P - down);
    const r = (Number(realEstateConfig.interestRate || 8.5) / 12) / 100;
    const n = Number(realEstateConfig.loanTenure || 20) * 12;

    const emi = L > 0 ? Math.round((L * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)) : 0;
    
    // Rule of thumb: EMI should not exceed 50% of surplus
    const affordable = emi <= (surplus * 0.5);
    
    return { 
      emi, 
      down,
      loanAmount: L,
      affordable, 
      message: affordable 
        ? `Within affordable limits (₹${formatWithCommas(String(Math.round(down)))} Down Payment)` 
        : 'High risk (Exceeds 50% of surplus)' 
    };
  };

  // Helper calculations for Vehicle
  const getVehicleAffordability = () => {
    const dp = parseRawNumber(vehicleConfig.downPayment);
    const P = (vehicleConfig.priceRangeLakhs * 100000) - dp;
    if (P <= 0) return { emi: 0 };
    const r = (8.5 / 12) / 100; // Standard 8.5% auto loan
    const n = 5 * 12; // 5 year typical tenure
    const emi = Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    return { emi };
  };

  const handleAskVehicleMentor = async () => {
    const inc = parseRawNumber(formData.income);
    const exp = parseRawNumber(formData.expenses);
    if (!inc || !exp) {
      setVehicleMentorAdvice('Please fill salary and expenditure first.');
      return;
    }
    setFetchingMentor(true);
    setVehicleMentorAdvice('');
    try {
      const { emi } = getVehicleAffordability();
      const res = await fetch(`${API}/vehicle-mentor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          income: inc,
          expenses: exp,
          price: vehicleConfig.priceRangeLakhs * 100000,
          downPayment: parseRawNumber(vehicleConfig.downPayment),
          emi
        })
      });
      const data = await res.json();
      setVehicleMentorAdvice(data.data?.advice || 'Server returned empty response.');
    } catch {
      setVehicleMentorAdvice('Could not connect to AI Mentor.');
    } finally {
      setFetchingMentor(false);
    }
  };

  const handleCheckExchange = async () => {
    if (!travelConfig.country) return;
    setExchangeData({ rate: null, loading: true, error: '' });
    try {
      const res = await fetch(`${API}/exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: travelConfig.country })
      });
      const data = await res.json();
      if (data.success && data.data.rate) {
         setExchangeData({ rate: data.data.rate, loading: false, error: '' });
      } else {
         setExchangeData({ rate: null, loading: false, error: 'Live rates unavailable for this region.' });
      }
    } catch {
      setExchangeData({ rate: null, loading: false, error: 'Connection error communicating with Groq Exchange.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const inc = parseRawNumber(formData.income);
    const exp = parseRawNumber(formData.expenses);

    if (!inc || !exp) {
      setError('Please provide your income and expenses to proceed.');
      return;
    }
    if (inc <= 0) {
      setError('Income must be greater than zero.');
      return;
    }
    setLoading(true);
    setError('');

    // Compute exact goal amount based on selected goal
    let calculatedGoalAmount;
    if (formData.goal === 'house' && realEstateConfig.price) {
      calculatedGoalAmount = parseRawNumber(realEstateConfig.price);
    } else if (formData.goal === 'car' && vehicleConfig.priceRangeLakhs) {
      calculatedGoalAmount = vehicleConfig.priceRangeLakhs * 100000;
    } else if (formData.goalAmount) {
      calculatedGoalAmount = parseRawNumber(formData.goalAmount);
    }

    try {
      const res = await fetch(`${API}/advice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail || 'user@architecturalwealth.com',
          income: inc,
          expenses: exp,
          goal: formData.goal,
          goalAmount: calculatedGoalAmount,
          customConfig: {
            interestRate: formData.goal === 'house' ? Number(realEstateConfig.interestRate || 8.5) : 8.5,
            tenureYears: formData.goal === 'house' ? Number(realEstateConfig.loanTenure || 20) : 20,
            downPayment: formData.goal === 'house' ? parseRawNumber(realEstateConfig.downPayment) : parseRawNumber(vehicleConfig.downPayment)
          },
          userId: 'default',
        }),
      });
      const data = await res.json();
      if (data.success) onAnalysisComplete(data.data);
      else setError(data.error?.message || 'Analysis failed.');
    } catch {
      setError('Server unavailable. Ensure backend runs on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {showPlanner && <FutureGoalPlanner onClose={() => setShowPlanner(false)} />}
      
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Define Your Wealth Path</h2>
          <p>
            Provide your current financial landscape. Our Sovereign Curator engine will
            analyze your metrics to build a bespoke strategy for your capital.
          </p>
        </div>
        <button 
          className="btn-planner" 
          onClick={() => setShowPlanner(true)}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#80d8ff' }}>calendar_month</span>
          <span style={{ color: '#ffffff', fontWeight: 700 }}>Open Goal Planner</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '36px', alignItems: 'start' }}>
        {/* Left Column — Form */}
        <form onSubmit={handleSubmit} className="animate-in">
          <div className="card" style={{ marginBottom: 24 }}>
            {/* Income */}
            <div className="form-group">
              <label className="form-label" htmlFor="income">Monthly Salary</label>
              <div className="input-prefix">
                <span className="prefix">₹</span>
                <input
                  id="income"
                  type="text"
                  inputMode="numeric"
                  name="income"
                  className="form-input"
                  placeholder="e.g. 1,00,000"
                  value={formData.income}
                  onChange={handleFormattedChange}
                  style={{ paddingLeft: 36, width: '100%' }}
                />
              </div>
              <span className="form-hint">Include all net salary, dividends, and rental income.</span>
            </div>

            {/* Expenses */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="expenses">Monthly Expenditure</label>
              <div className="input-prefix">
                <span className="prefix">₹</span>
                <input
                  id="expenses"
                  type="text"
                  inputMode="numeric"
                  name="expenses"
                  className="form-input"
                  placeholder="e.g. 20,00,000"
                  value={formData.expenses}
                  onChange={handleFormattedChange}
                  style={{ paddingLeft: 36, width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Goal Selection */}
          <div className="card" style={{ marginBottom: 24, paddingBottom: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Future Goals</label>
              <div className="goal-grid">
                {GOALS.map(g => (
                  <div
                    key={g.value}
                    className={`goal-card ${formData.goal === g.value ? 'selected' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, goal: g.value }))}
                  >
                    <span className="goal-icon">{g.icon}</span>
                    <span>{g.label}</span>
                  </div>
                ))}
              </div>

              {/* Goal-specific Calculators */}
              {formData.goal === 'house' && (
                <div className="goal-config-panel animate-in" style={{ marginTop: 24, padding: 16, background: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ fontFamily: 'Manrope', fontSize: '0.85rem', marginBottom: 12, color: 'var(--primary)' }}>Real Estate Calculator</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--outline)', fontWeight: 600 }}>Property Type</label>
                      <select 
                        className="form-input" 
                        style={{ fontSize: '0.9rem', padding: '8px 4px', width: '100%' }}
                        value={realEstateConfig.propertyType}
                        onChange={(e) => setRealEstateConfig(p => ({ ...p, propertyType: e.target.value }))}
                      >
                        <option value="flat">Flat / Apartment</option>
                        <option value="plot">Plot / Land</option>
                        <option value="house">Independent House</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--outline)', fontWeight: 600 }}>Price (₹)</label>
                      <input 
                        className="form-input" 
                        type="text"
                        inputMode="numeric" 
                        placeholder="e.g. 80,00,000" 
                        style={{ fontSize: '0.9rem', padding: '8px 4px', width: '100%' }}
                        value={realEstateConfig.price}
                        onChange={handleRealEstatePriceChange}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--outline)', fontWeight: 600 }}>Down Payment (₹)</label>
                      <input 
                        className="form-input" 
                        type="text"
                        inputMode="numeric" 
                        placeholder="e.g. 15,00,000" 
                        style={{ fontSize: '0.9rem', padding: '8px 4px', width: '100%' }}
                        value={realEstateConfig.downPayment}
                        onChange={handleRealEstateDownPaymentChange}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--outline)', fontWeight: 600 }}>Interest Rate (%)</label>
                      <input 
                        className="form-input" 
                        type="number" 
                        step="0.1"
                        style={{ fontSize: '0.9rem', padding: '8px 4px', width: '100%' }}
                        value={realEstateConfig.interestRate}
                        onChange={(e) => setRealEstateConfig(p => ({ ...p, interestRate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--outline)', fontWeight: 600 }}>Tenure (Years)</label>
                      <input 
                        className="form-input" 
                        type="number" 
                        style={{ fontSize: '0.9rem', padding: '8px 4px', width: '100%' }}
                        value={realEstateConfig.loanTenure}
                        onChange={(e) => setRealEstateConfig(p => ({ ...p, loanTenure: e.target.value }))}
                      />
                    </div>
                  </div>

                  {(() => {
                    const afford = getAffordability();
                    if (!afford) return <p style={{ fontSize: '0.75rem', color: 'var(--outline)' }}>Enter income, expenses, and property price to see EMI calculation.</p>;
                    return (
                      <div style={{ padding: 12, borderRadius: 6, background: afford.affordable ? 'rgba(0,108,71,0.1)' : 'rgba(186,26,26,0.1)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>
                          Estimated Monthly EMI ({afford.down > 0 ? `₹${formatWithCommas(String(Math.round(afford.loanAmount)))} Loan` : '80% Loan'})
                        </div>
                        <div style={{ fontSize: '1.4rem', fontFamily: 'Manrope', fontWeight: 800, color: afford.affordable ? 'var(--secondary)' : 'var(--error)' }}>
                          ₹{afford.emi.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: afford.affordable ? 'var(--secondary)' : 'var(--error)' }}>
                          {afford.affordable ? '✓ ' : '⚠ '}{afford.message}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {formData.goal === 'car' && (
                <div className="goal-config-panel animate-in" style={{ marginTop: 24, padding: 16, background: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ fontFamily: 'Manrope', fontSize: '0.85rem', marginBottom: 12, color: 'var(--primary)' }}>Vehicle Affordability Engine</h4>
                  
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label style={{ fontSize: '0.7rem', color: 'var(--outline)', fontWeight: 600 }}>Target Price Range (Lakhs)</label>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Manrope' }}>₹{vehicleConfig.priceRangeLakhs}L</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="50" 
                      step="1"
                      style={{ width: '100%', accentColor: 'var(--primary)' }}
                      value={vehicleConfig.priceRangeLakhs}
                      onChange={(e) => setVehicleConfig(p => ({ ...p, priceRangeLakhs: e.target.value }))}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--outline-variant)', marginTop: 4 }}>
                      <span>₹1L</span>
                      <span>₹50L</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: '0.7rem', color: 'var(--outline)', fontWeight: 600 }}>Down Payment Available (₹)</label>
                    <input 
                      className="form-input" 
                      type="text" 
                      inputMode="numeric"
                      placeholder="e.g. 2,00,000" 
                      style={{ fontSize: '0.9rem', padding: '8px 4px', width: '100%' }}
                      value={vehicleConfig.downPayment}
                      onChange={handleVehicleDownPaymentChange}
                    />
                  </div>

                  <div style={{ padding: 12, borderRadius: 6, background: '#fff', border: '1px solid var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>
                      Est. Auto Loan EMI (5 Yrs @ 8.5%)
                    </div>
                    <div style={{ fontSize: '1.2rem', fontFamily: 'Manrope', fontWeight: 800, color: 'var(--primary)' }}>
                      ₹{getVehicleAffordability().emi.toLocaleString()}
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={handleAskVehicleMentor}
                    disabled={fetchingMentor}
                    style={{ 
                      width: '100%',
                      background: 'var(--primary)', 
                      color: 'var(--on-primary)', 
                      padding: '10px', 
                      borderRadius: 'var(--radius-sm)', 
                      fontSize: '0.8rem', 
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}
                  >
                    {fetchingMentor ? 'Consulting Groq AI...' : '✨ Ask AI Mentor Assessment'}
                  </button>

                  {vehicleMentorAdvice && (
                    <div className="animate-in" style={{ marginTop: 16, padding: 14, background: 'rgba(0,108,71,0.06)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--secondary)' }}>
                      <p style={{ fontSize: '0.8rem', lineHeight: 1.5, color: 'var(--on-surface)', margin: 0 }}>
                        {vehicleMentorAdvice}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {formData.goal === 'vacation' && (
                <div className="goal-config-panel animate-in" style={{ marginTop: 24, padding: 16, background: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ fontFamily: 'Manrope', fontSize: '0.85rem', marginBottom: 12, color: 'var(--primary)' }}>Travel Currency Exchange</h4>
                  
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: '0.7rem', color: 'var(--outline)', fontWeight: 600 }}>Destination Country</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input 
                        className="form-input" 
                        type="text" 
                        placeholder="e.g. USA, UK, Europe, Japan" 
                        style={{ fontSize: '0.9rem', padding: '8px 4px', flex: 1 }}
                        value={travelConfig.country}
                        onChange={(e) => setTravelConfig(p => ({ ...p, country: e.target.value }))}
                      />
                      <button 
                        type="button" 
                        onClick={handleCheckExchange}
                        disabled={exchangeData.loading}
                        className="btn" 
                        style={{ padding: '0 16px', fontSize: '0.75rem' }}
                      >
                        {exchangeData.loading ? '...' : 'Check Live'}
                      </button>
                    </div>
                  </div>

                  {(() => {
                    if (exchangeData.error) return <p style={{ fontSize: '0.75rem', color: 'var(--error)' }}>{exchangeData.error}</p>;
                    if (!exchangeData.rate) return <p style={{ fontSize: '0.75rem', color: 'var(--outline)' }}>Type a country and check live rate via Groq AI.</p>;
                    
                    return (
                      <div className="animate-in" style={{ padding: 12, borderRadius: 6, background: '#fff', border: '1px solid var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--on-surface)' }}>
                          1 {travelConfig.country.toUpperCase()} Unit
                        </div>
                        <div style={{ fontSize: '1.2rem', fontFamily: 'Manrope', fontWeight: 800, color: 'var(--primary)' }}>
                          = ₹{exchangeData.rate.toFixed(2)}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

            </div>
          </div>

          {error && (
            <p style={{ color: 'var(--error)', fontSize: '0.85rem', marginBottom: 16 }}>⚠ {error}</p>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? (
              <>
                <span className="loading-spinner" />
                Analyzing Portfolio...
              </>
            ) : (
              'Run Sovereign Analysis'
            )}
          </button>
        </form>

        {/* Right Column — Info Cards */}
        <div className="animate-in" style={{ animationDelay: '0.12s' }}>
          {/* Elite Analysis Engine */}
          <div className="card card-hero" style={{ marginBottom: 16, padding: '28px 24px' }}>
            <div style={{ fontSize: '1.6rem', marginBottom: 14 }}>✨</div>
            <h3 style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '1.05rem',
              fontWeight: 800,
              color: '#fff',
              marginBottom: 12,
              letterSpacing: '-0.02em'
            }}>
              Elite Analysis Engine
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'rgba(171, 199, 255, 0.65)', lineHeight: 1.65, marginBottom: 18 }}>
              Our proprietary Sovereign Mentor model uses global fiscal benchmarks to evaluate your saving ratio and project attainment timelines.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <FeatureBadge text="Risk Profile Mapping" />
              <FeatureBadge text="Compound Interest Projection" />
            </div>
          </div>

          {/* Statement Upload UI */}
          <div className="card" style={{ background: 'var(--surface-container-low)', padding: '22px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', border: '2px dashed var(--outline-variant)' }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'var(--surface-container)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
              color: 'var(--primary)'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>upload_file</span>
            </div>
            <h3 style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '0.95rem',
              fontWeight: 800,
              color: 'var(--on-surface)',
              marginBottom: 8
            }}>
              Automated Ingestion
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--outline)', lineHeight: 1.6, marginBottom: 16 }}>
              Upload your bank statements to automatically extract and categorize your salary and expenditure data via AI.
            </p>
            <button type="button" style={{ 
              background: '#fff', 
              border: '1px solid var(--surface-variant)', 
              padding: '8px 16px', 
              borderRadius: 20, 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              color: 'var(--primary)',
              cursor: 'pointer'
            }}>
              Browse Statements
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureBadge({ text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ color: 'var(--secondary-container)', fontSize: '0.85rem' }}>✓</span>
      <span style={{ fontSize: '0.8rem', color: 'rgba(171,199,255,0.8)', fontWeight: 500 }}>{text}</span>
    </div>
  );
}
