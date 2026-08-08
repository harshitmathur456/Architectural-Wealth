import { useState, useRef } from 'react';
import FutureGoalPlanner from './FutureGoalPlanner';
import { formatWithCommas, parseRawNumber } from '../utils/formatters';
import { JODHPUR_CAR_CATALOG, JODHPUR_BIKE_CATALOG } from '../data/vehicleData';
import { DESTINATION_TRAVEL_DATA } from '../data/travelData';
import { runClientSideAnalysis } from '../utils/clientLogicEngine';
import { parsePdfStatementInBrowser } from '../utils/pdfParser';

const API = import.meta.env.VITE_API_URL || '/api';

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

  // PDF Statement Ingestion State
  const fileInputRef = useRef(null);
  const [statementFile, setStatementFile] = useState(null);
  const [parsingStatement, setParsingStatement] = useState(false);
  const [statementSuccess, setStatementSuccess] = useState('');
  const [statementError, setStatementError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Real Estate State
  const [realEstateConfig, setRealEstateConfig] = useState({
    propertyType: 'flat',
    price: '',
    downPayment: '',
    interestRate: 8.5,
    loanTenure: 20
  });

  // Vehicle State (CarWale Jodhpur Catalog Integration)
  const [vehicleConfig, setVehicleConfig] = useState({
    type: 'car', // 'car' | 'bike'
    brand: 'Maruti Suzuki',
    model: 'Brezza',
    priceRangeLakhs: 9.4,
    downPayment: ''
  });
  const [vehicleMentorAdvice, setVehicleMentorAdvice] = useState('');
  const [fetchingMentor, setFetchingMentor] = useState(false);

  // Travel State (Flight Ticket Inflation & Budget Intelligence for Origin: New Delhi)
  const [travelConfig, setTravelConfig] = useState({
    countryKey: 'UK',
    seasonKey: 'shoulder', // 'peak' | 'shoulder' | 'offPeak'
    numDays: 7,
    country: 'UK'
  });
  const [exchangeData, setExchangeData] = useState({ rate: null, loading: false, error: '' });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getTravelBudgetDetails = () => {
    const dest = DESTINATION_TRAVEL_DATA[travelConfig.countryKey] || DESTINATION_TRAVEL_DATA['UK'];
    const season = dest.seasons[travelConfig.seasonKey] || dest.seasons.shoulder;
    
    // Flight fare from Delhi with seasonal inflation multiplier
    const flightFare = Math.round(dest.baseFlightDelhiINR * season.flightMultiplier);
    
    // Daily stay & food calculation with seasonal hotel multiplier
    const days = Number(travelConfig.numDays || dest.recommendedDays || 5);
    const totalStay = Math.round(dest.baseDailyStayINR * days * season.hotelMultiplier);
    
    // Total budget = Flight fare + Stay & local expenses
    const totalBudget = flightFare + totalStay;
    
    // Inflation percentage relative to base flight
    const flightInflationPct = Math.round((season.flightMultiplier - 1) * 100);
    
    return {
      dest,
      season,
      days,
      flightFare,
      totalStay,
      totalBudget,
      flightInflationPct
    };
  };

  const processStatementFile = async (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setStatementError('Please select a valid PDF file (.pdf).');
      return;
    }

    setParsingStatement(true);
    setStatementError('');
    setStatementSuccess('');

    try {
      const data = new FormData();
      data.append('file', file);

      const res = await fetch(`${API}/parse-statement`, {
        method: 'POST',
        body: data
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          const extractedInc = result.data.income ? formatWithCommas(String(result.data.income)) : '';
          const extractedExp = result.data.expenses ? formatWithCommas(String(result.data.expenses)) : '';

          setFormData(prev => ({
            ...prev,
            income: extractedInc || prev.income,
            expenses: extractedExp || prev.expenses
          }));

          setStatementFile({
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB'
          });

          setStatementSuccess(result.data.summary || `Extracted Salary (₹${extractedInc}) and Expenses (₹${extractedExp}) from PDF!`);
          return;
        }
      }

      // Browser client PDF parsing fallback
      const parsedData = await parsePdfStatementInBrowser(file);
      const incStr = formatWithCommas(String(parsedData.income));
      const expStr = formatWithCommas(String(parsedData.expenses));

      setFormData(prev => ({
        ...prev,
        income: incStr,
        expenses: expStr
      }));

      setStatementFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB'
      });

      setStatementSuccess(parsedData.summary || `Extracted Salary (₹${incStr}) and Monthly Expenses (₹${expStr}) from ${file.name}!`);
    } catch (err) {
      console.warn('Backend parse error, executing browser PDF parser fallback:', err);
      try {
        const parsedData = await parsePdfStatementInBrowser(file);
        const incStr = formatWithCommas(String(parsedData.income));
        const expStr = formatWithCommas(String(parsedData.expenses));

        setFormData(prev => ({
          ...prev,
          income: incStr,
          expenses: expStr
        }));

        setStatementFile({
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB'
        });

        setStatementSuccess(parsedData.summary || `Extracted Salary (₹${incStr}) and Monthly Expenses (₹${expStr}) from ${file.name}!`);
      } catch {
        setStatementError('Could not process PDF statement. Please ensure it is a valid bank statement PDF.');
      }
    } finally {
      setParsingStatement(false);
    }
  };

  const handleDownloadSamplePDF = () => {
    const link = document.createElement('a');
    link.href = '/Sample_Bank_Statement.pdf';
    link.download = 'Sample_Bank_Statement.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStatementFileChange = (e) => {
    const selected = e.target.files && e.target.files[0];
    if (selected) {
      processStatementFile(selected);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processStatementFile(e.dataTransfer.files[0]);
    }
  };

  const handleClearStatement = () => {
    setStatementFile(null);
    setStatementSuccess('');
    setStatementError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


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

  // Vehicle Catalog Selection Handlers (CarWale Jodhpur Catalog & Versions)
  const handleVehicleTypeChange = (newType) => {
    const defaultBrand = newType === 'car' ? 'Maruti Suzuki' : 'Royal Enfield';
    const catalog = newType === 'car' ? JODHPUR_CAR_CATALOG : JODHPUR_BIKE_CATALOG;
    const defaultModelObj = catalog[defaultBrand]?.[0] || { name: 'Model', priceLakhs: 5.0, variants: [] };
    const defaultVariantObj = defaultModelObj.variants?.[0];

    setVehicleConfig({
      type: newType,
      brand: defaultBrand,
      model: defaultModelObj.name,
      variant: defaultVariantObj ? defaultVariantObj.name : 'Standard Variant',
      priceRangeLakhs: defaultVariantObj ? defaultVariantObj.priceLakhs : defaultModelObj.priceLakhs,
      downPayment: ''
    });
  };

  const handleVehicleBrandChange = (brandName) => {
    const catalog = vehicleConfig.type === 'car' ? JODHPUR_CAR_CATALOG : JODHPUR_BIKE_CATALOG;
    const models = catalog[brandName] || [];
    const defaultModelObj = models[0] || { name: 'Custom Model', priceLakhs: 5.0, variants: [] };
    const defaultVariantObj = defaultModelObj.variants?.[0];

    setVehicleConfig(prev => ({
      ...prev,
      brand: brandName,
      model: defaultModelObj.name,
      variant: defaultVariantObj ? defaultVariantObj.name : 'Standard Variant',
      priceRangeLakhs: defaultVariantObj ? defaultVariantObj.priceLakhs : defaultModelObj.priceLakhs
    }));
  };

  const handleVehicleModelChange = (modelName) => {
    if (modelName === 'custom') {
      setVehicleConfig(prev => ({
        ...prev,
        model: 'custom',
        variant: 'Custom Variant'
      }));
      return;
    }
    const catalog = vehicleConfig.type === 'car' ? JODHPUR_CAR_CATALOG : JODHPUR_BIKE_CATALOG;
    const models = catalog[vehicleConfig.brand] || [];
    const selectedModel = models.find(m => m.name === modelName);
    if (selectedModel) {
      const defaultVariantObj = selectedModel.variants?.[0];
      setVehicleConfig(prev => ({
        ...prev,
        model: modelName,
        variant: defaultVariantObj ? defaultVariantObj.name : 'Standard Variant',
        priceRangeLakhs: defaultVariantObj ? defaultVariantObj.priceLakhs : selectedModel.priceLakhs
      }));
    }
  };

  const handleVehicleVariantChange = (variantName) => {
    const catalog = vehicleConfig.type === 'car' ? JODHPUR_CAR_CATALOG : JODHPUR_BIKE_CATALOG;
    const models = catalog[vehicleConfig.brand] || [];
    const selectedModel = models.find(m => m.name === vehicleConfig.model);
    if (selectedModel && selectedModel.variants) {
      const selectedVariant = selectedModel.variants.find(v => v.name === variantName);
      if (selectedVariant) {
        setVehicleConfig(prev => ({
          ...prev,
          variant: variantName,
          priceRangeLakhs: selectedVariant.priceLakhs
        }));
      }
    }
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
      setVehicleMentorAdvice('Please fill your Monthly Salary and Expenditure above first.');
      return;
    }
    setFetchingMentor(true);
    setVehicleMentorAdvice('');
    const { emi } = getVehicleAffordability();
    const vehiclePrice = Math.round(vehicleConfig.priceRangeLakhs * 100000);
    const dp = parseRawNumber(vehicleConfig.downPayment);
    const surplus = inc - exp;
    const vehicleName = `${vehicleConfig.brand} ${vehicleConfig.model} ${vehicleConfig.variant ? '(' + vehicleConfig.variant + ')' : ''}`;
    const isAffordable = surplus > 0 && emi <= (surplus * 0.5);

    try {
      const res = await fetch(`${API}/vehicle-mentor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          income: inc,
          expenses: exp,
          vehicleType: vehicleConfig.type === 'car' ? 'Car' : 'Bike/Two-Wheeler',
          brand: vehicleConfig.brand,
          model: vehicleConfig.model === 'custom' ? 'Custom Model' : vehicleConfig.model,
          variant: vehicleConfig.variant,
          location: 'Jodhpur',
          price: vehiclePrice,
          downPayment: dp,
          emi
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.advice) {
          setVehicleMentorAdvice(data.data.advice);
          return;
        }
      }

      // Fallback calculation response if response is not ok or missing advice
      const fallbackAdvice = isAffordable
        ? `Assessment for ${vehicleName} in Jodhpur:\nWith your net monthly surplus of ₹${formatWithCommas(String(surplus))}, the estimated auto loan EMI of ₹${formatWithCommas(String(emi))}/month (On-Road Price: ₹${formatWithCommas(String(vehiclePrice))}) is well within safe financial limits (under 50% surplus). Keep 3-6 months EMI reserved for Jodhpur insurance & service.`
        : `High Risk Warning for ${vehicleName}:\nYour calculated EMI of ₹${formatWithCommas(String(emi))}/month takes up more than 50% of your monthly surplus (₹${formatWithCommas(String(surplus))}). We recommend increasing your down payment (currently ₹${dp ? formatWithCommas(String(dp)) : '0'}) to keep debt safe.`;

      setVehicleMentorAdvice(fallbackAdvice);
    } catch {
      const fallbackAdvice = isAffordable
        ? `Assessment for ${vehicleName} in Jodhpur:\nWith a net monthly surplus of ₹${formatWithCommas(String(surplus))}, your estimated loan EMI of ₹${formatWithCommas(String(emi))}/month is within healthy limits. Keep 3 months of EMI set aside in liquid SIPs for insurance renewals.`
        : `High Risk Assessment for ${vehicleName}:\nThe estimated EMI of ₹${formatWithCommas(String(emi))}/month takes up more than 50% of your monthly surplus (₹${formatWithCommas(String(surplus))}). We strongly recommend a higher down payment before purchasing.`;

      setVehicleMentorAdvice(fallbackAdvice);
    } finally {
      setFetchingMentor(false);
    }
  };

  const handleCheckExchange = async () => {
    if (!travelConfig.country) return;
    setExchangeData({ rate: null, loading: true, error: '' });
    
    const FALLBACK_RATES = {
      'uk': 106.50,
      'united kingdom': 106.50,
      'gbp': 106.50,
      'england': 106.50,
      'us': 83.80,
      'usa': 83.80,
      'united states': 83.80,
      'usd': 83.80,
      'europe': 91.20,
      'euro': 91.20,
      'germany': 91.20,
      'france': 91.20,
      'uae': 22.80,
      'dubai': 22.80,
      'singapore': 62.50,
      'australia': 55.40,
      'canada': 61.30,
      'japan': 0.56,
      'thailand': 2.45,
      'switzerland': 96.80,
      'indonesia': 0.0054,
      'bali': 0.0054,
      'malaysia': 18.90
    };

    const getFallbackRate = (c) => {
      const key = (c || '').toLowerCase().trim();
      for (const [k, rate] of Object.entries(FALLBACK_RATES)) {
        if (key.includes(k) || k.includes(key)) return rate;
      }
      return 83.80;
    };

    try {
      const res = await fetch(`${API}/exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: travelConfig.country })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.rate) {
          setExchangeData({ rate: data.data.rate, loading: false, error: '' });
          return;
        }
      }
      const fallbackRate = getFallbackRate(travelConfig.country);
      setExchangeData({ rate: fallbackRate, loading: false, error: '' });
    } catch {
      const fallbackRate = getFallbackRate(travelConfig.country);
      setExchangeData({ rate: fallbackRate, loading: false, error: '' });
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
    } else if (formData.goal === 'vacation') {
      const { totalBudget } = getTravelBudgetDetails();
      calculatedGoalAmount = totalBudget;
    } else if (formData.goalAmount) {
      calculatedGoalAmount = parseRawNumber(formData.goalAmount);
    }

    const customConfig = {
      interestRate: formData.goal === 'house' ? Number(realEstateConfig.interestRate || 8.5) : 8.5,
      tenureYears: formData.goal === 'house' ? Number(realEstateConfig.loanTenure || 20) : 20,
      downPayment: formData.goal === 'house' ? parseRawNumber(realEstateConfig.downPayment) : parseRawNumber(vehicleConfig.downPayment)
    };

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
          customConfig,
          userId: 'default',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          onAnalysisComplete(data.data);
          return;
        }
      }

      // If server returns non-ok or error format, execute deterministic client analysis
      const fallbackAnalysis = runClientSideAnalysis({
        income: inc,
        expenses: exp,
        goal: formData.goal,
        goalAmount: calculatedGoalAmount,
        customConfig
      });
      onAnalysisComplete(fallbackAnalysis);
    } catch {
      // Execute seamless deterministic client analysis on network/server offline
      const fallbackAnalysis = runClientSideAnalysis({
        income: inc,
        expenses: exp,
        goal: formData.goal,
        goalAmount: calculatedGoalAmount,
        customConfig
      });
      onAnalysisComplete(fallbackAnalysis);
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
                <div className="goal-config-panel animate-in" style={{ marginTop: 24, padding: 18, background: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h4 style={{ fontFamily: 'Manrope', fontSize: '0.9rem', color: 'var(--primary)', margin: 0 }}>
                      Vehicle Affordability Engine
                    </h4>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      background: 'rgba(77, 137, 255, 0.12)', 
                      color: 'var(--primary)', 
                      padding: '3px 8px', 
                      borderRadius: 12,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      📍 Jodhpur, RJ (CarWale Prices)
                    </span>
                  </div>
                  
                  {/* Category Toggle: Car vs Bike */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    <button
                      type="button"
                      onClick={() => handleVehicleTypeChange('car')}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 8,
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        border: vehicleConfig.type === 'car' ? '2px solid var(--primary)' : '1px solid var(--outline-variant)',
                        background: vehicleConfig.type === 'car' ? 'var(--surface-container)' : '#fff',
                        color: vehicleConfig.type === 'car' ? 'var(--primary)' : 'var(--on-surface-variant)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      🚗 Car (CarWale Catalog)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVehicleTypeChange('bike')}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 8,
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        border: vehicleConfig.type === 'bike' ? '2px solid var(--primary)' : '1px solid var(--outline-variant)',
                        background: vehicleConfig.type === 'bike' ? 'var(--surface-container)' : '#fff',
                        color: vehicleConfig.type === 'bike' ? 'var(--primary)' : 'var(--on-surface-variant)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      🏍️ Bike / Scooter
                    </button>
                  </div>

                  {/* Dropdowns Grid: Brand, Model & Version/Variant */}
                  {(() => {
                    const catalog = vehicleConfig.type === 'car' ? JODHPUR_CAR_CATALOG : JODHPUR_BIKE_CATALOG;
                    const brands = Object.keys(catalog);
                    const models = catalog[vehicleConfig.brand] || [];
                    const selectedModelObj = models.find(m => m.name === vehicleConfig.model);
                    const variants = selectedModelObj ? (selectedModelObj.variants || []) : [];

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--outline)', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                              {vehicleConfig.type === 'car' ? 'Car Company / Brand' : 'Bike Company / Brand'}
                            </label>
                            <select 
                              className="form-input" 
                              style={{ fontSize: '0.85rem', padding: '8px 6px', width: '100%' }}
                              value={vehicleConfig.brand}
                              onChange={(e) => handleVehicleBrandChange(e.target.value)}
                            >
                              {brands.map(b => (
                                <option key={b} value={b}>{b}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--outline)', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                              Select Model
                            </label>
                            <select 
                              className="form-input" 
                              style={{ fontSize: '0.85rem', padding: '8px 6px', width: '100%' }}
                              value={vehicleConfig.model}
                              onChange={(e) => handleVehicleModelChange(e.target.value)}
                            >
                              {models.map(m => (
                                <option key={m.name} value={m.name}>
                                  {m.name} (from ₹{m.priceLakhs}L)
                                </option>
                              ))}
                              <option value="custom">Custom / Other Model</option>
                            </select>
                          </div>
                        </div>

                        {/* Available Versions / Trims Dropdown */}
                        {vehicleConfig.model !== 'custom' && variants.length > 0 && (
                          <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--outline)', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                              Available Version / Variant (CarWale Catalog)
                            </label>
                            <select
                              className="form-input"
                              style={{ fontSize: '0.85rem', padding: '8px 6px', width: '100%', borderColor: 'var(--primary)' }}
                              value={vehicleConfig.variant}
                              onChange={(e) => handleVehicleVariantChange(e.target.value)}
                            >
                              {variants.map(v => (
                                <option key={v.name} value={v.name}>
                                  {v.name} — ₹{v.priceLakhs} Lakhs (On-Road Jodhpur)
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Selected Version Jodhpur On-Road Price Badge */}
                  <div style={{ 
                    padding: '12px 14px', 
                    borderRadius: 8, 
                    background: 'var(--surface-container)', 
                    border: '1px solid var(--outline-variant)',
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--on-surface)', fontWeight: 700 }}>
                        {vehicleConfig.model === 'custom' 
                          ? 'Custom Vehicle Price' 
                          : `${vehicleConfig.brand} ${vehicleConfig.model} ${vehicleConfig.variant ? '• ' + vehicleConfig.variant : ''}`}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 600, marginTop: 2 }}>
                        📍 On-Road Price in Jodhpur (Ex-Showroom + RTO + Insurance)
                      </div>
                    </div>
                    <div style={{ fontSize: '1.3rem', fontFamily: 'Manrope', fontWeight: 800, color: 'var(--primary)' }}>
                      ₹{formatWithCommas(String(Math.round(vehicleConfig.priceRangeLakhs * 100000)))}
                    </div>
                  </div>

                  {/* Manual Slider to adjust target budget */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label style={{ fontSize: '0.7rem', color: 'var(--outline)', fontWeight: 600 }}>Adjust Target Budget (Lakhs)</label>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Manrope' }}>₹{vehicleConfig.priceRangeLakhs}L</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="75" 
                      step="0.1"
                      style={{ width: '100%', accentColor: 'var(--primary)' }}
                      value={vehicleConfig.priceRangeLakhs}
                      onChange={(e) => setVehicleConfig(p => ({ ...p, priceRangeLakhs: parseFloat(e.target.value) || 0.5 }))}
                    />
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
                      ₹{getVehicleAffordability().emi.toLocaleString('en-IN')}
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
                    {fetchingMentor ? 'Consulting Groq AI...' : `✨ Ask AI Assessment for ${vehicleConfig.brand} ${vehicleConfig.model}`}
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
                <div className="goal-config-panel animate-in" style={{ marginTop: 24, padding: 18, background: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)' }}>
                  {/* Header & Origin Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <h4 style={{ fontFamily: 'Manrope', fontSize: '0.9rem', color: 'var(--primary)', margin: 0 }}>
                      Travel Budget & Flight Ticket Intelligence
                    </h4>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      background: 'rgba(77, 137, 255, 0.12)', 
                      color: 'var(--primary)', 
                      padding: '3px 8px', 
                      borderRadius: 12,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      ✈️ Origin: New Delhi (DEL)
                    </span>
                  </div>

                  {/* Destination & Duration Selectors */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 16 }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--outline)', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                        Destination Country / Region
                      </label>
                      <select
                        className="form-input"
                        style={{ fontSize: '0.85rem', padding: '8px 6px', width: '100%' }}
                        value={travelConfig.countryKey}
                        onChange={(e) => {
                          const k = e.target.value;
                          setTravelConfig(p => ({ ...p, countryKey: k, country: k }));
                        }}
                      >
                        {Object.keys(DESTINATION_TRAVEL_DATA).map(key => (
                          <option key={key} value={key}>
                            {DESTINATION_TRAVEL_DATA[key].countryName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--outline)', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                        Trip Duration (Days)
                      </label>
                      <input
                        className="form-input"
                        type="number"
                        min="1"
                        max="60"
                        style={{ fontSize: '0.85rem', padding: '8px 6px', width: '100%' }}
                        value={travelConfig.numDays}
                        onChange={(e) => setTravelConfig(p => ({ ...p, numDays: Math.max(1, parseInt(e.target.value) || 1) }))}
                      />
                    </div>
                  </div>

                  {/* Seasonal Inflation & Fare Timing Selector */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: '0.7rem', color: 'var(--outline)', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                      Travel Timing & Flight Fare Inflation
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => setTravelConfig(p => ({ ...p, seasonKey: 'peak' }))}
                        style={{
                          padding: '8px 4px',
                          borderRadius: 8,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          border: travelConfig.seasonKey === 'peak' ? '2px solid #ef4444' : '1px solid var(--outline-variant)',
                          background: travelConfig.seasonKey === 'peak' ? 'rgba(239, 68, 68, 0.12)' : '#fff',
                          color: travelConfig.seasonKey === 'peak' ? '#ef4444' : 'var(--on-surface-variant)',
                          cursor: 'pointer'
                        }}
                      >
                        👑 Peak Season
                      </button>
                      <button
                        type="button"
                        onClick={() => setTravelConfig(p => ({ ...p, seasonKey: 'shoulder' }))}
                        style={{
                          padding: '8px 4px',
                          borderRadius: 8,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          border: travelConfig.seasonKey === 'shoulder' ? '2px solid var(--primary)' : '1px solid var(--outline-variant)',
                          background: travelConfig.seasonKey === 'shoulder' ? 'rgba(77, 137, 255, 0.12)' : '#fff',
                          color: travelConfig.seasonKey === 'shoulder' ? 'var(--primary)' : 'var(--on-surface-variant)',
                          cursor: 'pointer'
                        }}
                      >
                        ⚖️ Shoulder Season
                      </button>
                      <button
                        type="button"
                        onClick={() => setTravelConfig(p => ({ ...p, seasonKey: 'offPeak' }))}
                        style={{
                          padding: '8px 4px',
                          borderRadius: 8,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          border: travelConfig.seasonKey === 'offPeak' ? '2px solid #22c55e' : '1px solid var(--outline-variant)',
                          background: travelConfig.seasonKey === 'offPeak' ? 'rgba(34, 197, 94, 0.12)' : '#fff',
                          color: travelConfig.seasonKey === 'offPeak' ? '#15803d' : 'var(--on-surface-variant)',
                          cursor: 'pointer'
                        }}
                      >
                        🏷️ Best Value Season
                      </button>
                    </div>
                  </div>

                  {/* Calculated Flight Ticket & Total Budget Cards */}
                  {(() => {
                    const { dest, season, days, flightFare, totalStay, totalBudget, flightInflationPct } = getTravelBudgetDetails();

                    return (
                      <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                          {/* Flight Card */}
                          <div style={{ padding: '10px 12px', background: '#fff', borderRadius: 8, border: '1px solid var(--outline-variant)' }}>
                            <div style={{ fontSize: '0.68rem', color: 'var(--outline)', fontWeight: 600 }}>
                              Est. Flight Ticket (DEL ↔ {travelConfig.countryKey})
                            </div>
                            <div style={{ fontSize: '1.15rem', fontFamily: 'Manrope', fontWeight: 800, color: 'var(--on-surface)', marginTop: 2 }}>
                              ₹{formatWithCommas(String(flightFare))}
                            </div>
                            <div style={{
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              marginTop: 4,
                              color: flightInflationPct > 0 ? '#ef4444' : flightInflationPct < 0 ? '#15803d' : 'var(--primary)'
                            }}>
                              {flightInflationPct > 0 ? `▲ +${flightInflationPct}% Flight Inflation` : flightInflationPct < 0 ? `▼ ${flightInflationPct}% Flight Fare Discount` : '● Standard Base Fare'}
                            </div>
                          </div>

                          {/* Hotel Stay Card */}
                          <div style={{ padding: '10px 12px', background: '#fff', borderRadius: 8, border: '1px solid var(--outline-variant)' }}>
                            <div style={{ fontSize: '0.68rem', color: 'var(--outline)', fontWeight: 600 }}>
                              Hotel & Expenses ({days} Days)
                            </div>
                            <div style={{ fontSize: '1.15rem', fontFamily: 'Manrope', fontWeight: 800, color: 'var(--on-surface)', marginTop: 2 }}>
                              ₹{formatWithCommas(String(totalStay))}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--outline)', marginTop: 4 }}>
                              ~₹{formatWithCommas(String(Math.round(totalStay / days)))}/day
                            </div>
                          </div>
                        </div>

                        {/* Total Recommended Travel Budget */}
                        <div style={{
                          padding: '12px 14px',
                          borderRadius: 8,
                          background: 'var(--surface-container)',
                          border: '1px solid var(--outline-variant)',
                          marginBottom: 16,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface)' }}>
                              Total Travel & Flight Budget
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 600, marginTop: 2 }}>
                              Flight + Accommodation + Local Expenses
                            </div>
                          </div>
                          <div style={{ fontSize: '1.3rem', fontFamily: 'Manrope', fontWeight: 800, color: 'var(--primary)' }}>
                            ₹{formatWithCommas(String(totalBudget))}
                          </div>
                        </div>

                        {/* Best Time & Cheapest Month Insights */}
                        <div style={{
                          padding: '12px 14px',
                          borderRadius: 8,
                          background: 'rgba(77, 137, 255, 0.06)',
                          borderLeft: '4px solid var(--primary)',
                          marginBottom: 14
                        }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}>
                            🌟 Travel Timing & Best Month Insights
                          </div>
                          <div style={{ fontSize: '0.73rem', color: 'var(--on-surface)', lineHeight: 1.5, marginBottom: 4 }}>
                            <strong>Best Time to Visit:</strong> {dest.bestMonthsToTravel}
                          </div>
                          <div style={{ fontSize: '0.73rem', color: '#15803d', fontWeight: 600, lineHeight: 1.5, marginBottom: 4 }}>
                            <strong>Cheapest Flight Ticket Months from Delhi:</strong> {dest.cheapestMonthsToTravel}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--outline)', lineHeight: 1.4 }}>
                            <em>{season.label}:</em> {season.note}
                          </div>
                        </div>

                        {/* Currency Rate Widget */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: '#fff',
                          borderRadius: 6,
                          border: '1px solid var(--surface-container)'
                        }}>
                          <div style={{ fontSize: '0.73rem', fontWeight: 600, color: 'var(--on-surface)' }}>
                            Currency: 1 {dest.currency}
                          </div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>
                            = ₹{dest.exchangeRateINR.toFixed(2)} INR
                          </div>
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
          <div 
            className="card" 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ 
              background: isDragging ? 'rgba(77, 137, 255, 0.08)' : 'var(--surface-container-low)', 
              padding: '22px 20px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textAlign: 'center', 
              border: isDragging ? '2px dashed var(--primary)' : '2px dashed var(--outline-variant)',
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {/* Hidden PDF File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              accept=".pdf,application/pdf" 
              onChange={handleStatementFileChange} 
              style={{ display: 'none' }} 
            />

            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: parsingStatement ? 'rgba(77, 137, 255, 0.15)' : 'var(--surface-container)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
              color: 'var(--primary)'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                {parsingStatement ? 'sync' : 'upload_file'}
              </span>
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
              Upload your bank statements in PDF format to automatically extract and categorize your salary and expenditure data via AI.
            </p>

            {/* Display Selected PDF file badge */}
            {statementFile && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--surface-container)',
                padding: '6px 12px',
                borderRadius: 16,
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--on-surface)',
                marginBottom: 14,
                width: '100%',
                justifyContent: 'space-between',
                border: '1px solid var(--outline-variant)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                  <span style={{ fontSize: '1rem' }}>📄</span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>
                    {statementFile.name}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--outline)' }}>({statementFile.size})</span>
                </div>
                <button
                  type="button"
                  onClick={handleClearStatement}
                  title="Remove File"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--outline)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    padding: '2px 4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  ✕
                </button>
              </div>
            )}

            {/* Success Message */}
            {statementSuccess && (
              <div style={{
                background: 'rgba(74, 222, 128, 0.12)',
                border: '1px solid rgba(74, 222, 128, 0.3)',
                color: '#4ade80',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: '0.75rem',
                marginBottom: 14,
                textAlign: 'left',
                width: '100%'
              }}>
                ✓ {statementSuccess}
              </div>
            )}

            {/* Error Message */}
            {statementError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: '0.75rem',
                marginBottom: 14,
                textAlign: 'left',
                width: '100%'
              }}>
                ⚠️ {statementError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                disabled={parsingStatement}
                style={{ 
                  flex: 1,
                  background: parsingStatement ? 'var(--surface-container)' : 'var(--primary)', 
                  color: parsingStatement ? 'var(--outline)' : '#ffffff',
                  border: 'none', 
                  padding: '9px 14px', 
                  borderRadius: 20, 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  cursor: parsingStatement ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                {parsingStatement ? (
                  <>
                    <span className="material-symbols-outlined spin" style={{ fontSize: '14px' }}>sync</span>
                    Analyzing...
                  </>
                ) : statementFile ? (
                  'Upload Another PDF'
                ) : (
                  'Browse Statements'
                )}
              </button>

              <button 
                type="button" 
                onClick={handleDownloadSamplePDF}
                title="Download sample PDF bank statement with salary & expenses to test"
                style={{ 
                  background: '#fff', 
                  border: '1px solid var(--primary)', 
                  padding: '9px 12px', 
                  borderRadius: 20, 
                  fontSize: '0.72rem', 
                  fontWeight: 700, 
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4
                }}
              >
                <span>📥</span> Sample PDF
              </button>
            </div>
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
