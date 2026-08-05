/**
 * Logic Engine — Deterministic Financial Brain
 * 
 * All financial calculations happen here.
 * No AI, no randomness — pure math for reliability.
 */

const GOAL_COSTS = {
  car: 800000,
  bike: 150000,
  house: 5000000,
  emergency_fund: 0, // calculated as 6 months expenses
  education: 1000000,
  wedding: 1500000,
  vacation: 200000,
  retirement: 10000000,
  business: 2000000,
  other: 500000
};

/**
 * Calculate financial score (1–10)
 */
function calculateFinancialScore(income, expenses, savings) {
  let score = 0;

  // Savings ratio (0–4 points)
  const savingsRatio = savings / income;
  if (savingsRatio >= 0.4) score += 4;
  else if (savingsRatio >= 0.3) score += 3.5;
  else if (savingsRatio >= 0.2) score += 3;
  else if (savingsRatio >= 0.1) score += 2;
  else if (savingsRatio > 0) score += 1;

  // Expense discipline (0–3 points)
  const expenseRatio = expenses / income;
  if (expenseRatio <= 0.5) score += 3;
  else if (expenseRatio <= 0.6) score += 2.5;
  else if (expenseRatio <= 0.7) score += 2;
  else if (expenseRatio <= 0.8) score += 1;
  else score += 0.5;

  // Has positive savings (0–2 points)
  if (savings > 0) score += 1;
  if (savings > income * 0.15) score += 1;

  // Bonus for high earners with good habits
  if (income >= 50000 && savingsRatio >= 0.2) score += 1;

  return Math.min(Math.round(score), 10);
}

/**
 * Calculate SIP recommendation (monthly investment)
 */
function calculateSIP(savings) {
  if (savings <= 0) return 0;
  return Math.round(savings * 0.5);
}

/**
 * Calculate goal timeline in months
 */
function calculateGoalTimeline(savings, goal, goalAmount) {
  const targetAmount = goalAmount || GOAL_COSTS[goal] || GOAL_COSTS.other;
  if (savings <= 0) return { months: Infinity, achievable: false, targetAmount };
  
  const months = Math.ceil(targetAmount / savings);
  return {
    months,
    years: parseFloat((months / 12).toFixed(1)),
    achievable: months <= 360,
    targetAmount
  };
}

/**
 * Calculate 3 detailed strategies for achieving the goal:
 * 1. Only Loan (100% Debt Financed)
 * 2. Only SIP (Pure Investment, Zero Debt)
 * 3. Hybrid (Loan + Parallel SIP for Early Prepayment)
 */
function calculateLoanVsSipStrategies(targetAmount, savings, goalCategory = 'house', customConfig = {}) {
  if (!targetAmount || targetAmount <= 0) targetAmount = 5000000;
  if (!savings || savings <= 0) savings = 10000;

  // Use custom inputs if provided, else fallback to defaults
  const tenureYears = Number(customConfig.tenureYears) > 0 
    ? Number(customConfig.tenureYears) 
    : (goalCategory === 'house' ? 20 : (goalCategory === 'car' ? 5 : 7));

  const interestRatePa = Number(customConfig.interestRate) > 0 
    ? Number(customConfig.interestRate) 
    : 8.5;

  const customDown = Number(customConfig.downPayment);
  const loanDownPayment = (customDown && customDown > 0) ? Math.min(targetAmount, customDown) : Math.round(targetAmount * 0.20);
  const loanPrincipal = Math.max(0, targetAmount - loanDownPayment);
  
  const tenureMonths = tenureYears * 12;
  const monthlyRate = (interestRatePa / 12) / 100;

  const loanEmi = loanPrincipal > 0 
    ? Math.round((loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1))
    : 0;

  const totalLoanPaid = (loanEmi * tenureMonths) + loanDownPayment;
  const totalLoanInterest = (loanEmi * tenureMonths) - loanPrincipal;

  // 2. ONLY SIP STRATEGY (12% CAGR expected return)
  const expectedCagr = 0.12;
  const monthlyCagr = expectedCagr / 12;
  const monthlySip = Math.round(savings * 0.6);
  
  let monthsToTargetSip = 360;
  if (monthlySip > 0) {
    const num = (targetAmount * monthlyCagr) / (monthlySip * (1 + monthlyCagr)) + 1;
    if (num > 1) {
      monthsToTargetSip = Math.ceil(Math.log(num) / Math.log(1 + monthlyCagr));
    }
  }
  const totalSipInvested = monthlySip * monthsToTargetSip;
  const sipWealthGained = targetAmount - totalSipInvested;

  // 3. HYBRID STRATEGY
  const hybridDownPayment = Math.min(targetAmount, (customDown && customDown > 0) ? Math.round(customDown * 1.15) : Math.round(targetAmount * 0.30));
  const hybridPrincipal = Math.max(0, targetAmount - hybridDownPayment);
  const hybridTenureMonths = Math.round(tenureMonths * 0.75);
  const hybridEmi = hybridPrincipal > 0 
    ? Math.round((hybridPrincipal * monthlyRate * Math.pow(1 + monthlyRate, hybridTenureMonths)) / (Math.pow(1 + monthlyRate, hybridTenureMonths) - 1))
    : 0;
  const parallelSip = Math.round(savings * 0.30);

  return {
    targetAmount,
    onlyLoan: {
      downPayment: loanDownPayment,
      loanAmount: loanPrincipal,
      tenureYears,
      interestRate: interestRatePa,
      monthlyEmi: loanEmi,
      totalInterestPaid: Math.max(0, totalLoanInterest),
      totalCost: totalLoanPaid,
      affordable: loanEmi <= (savings * 0.5)
    },
    onlySip: {
      monthlySip,
      expectedCagr: 12,
      monthsNeeded: monthsToTargetSip,
      yearsNeeded: parseFloat((monthsToTargetSip / 12).toFixed(1)),
      totalInvested: totalSipInvested,
      wealthGained: Math.max(0, sipWealthGained),
      zeroDebt: true
    },
    hybrid: {
      downPayment: hybridDownPayment,
      loanAmount: hybridPrincipal,
      monthlyEmi: hybridEmi,
      parallelSip,
      payoffEstimateYears: Math.min(tenureYears, Math.max(3, Math.round(tenureYears * 0.5))),
      interestSavedEstimate: Math.round(Math.max(0, totalLoanInterest) * 0.45)
    }
  };
}

/**
 * Generate expense breakdown & insights
 */
function analyzeExpenses(income, expenses) {
  const savings = income - expenses;
  const savingsPercent = ((savings / income) * 100).toFixed(1);
  const expensePercent = ((expenses / income) * 100).toFixed(1);

  let rating = 'poor';
  if (savingsPercent >= 30) rating = 'excellent';
  else if (savingsPercent >= 20) rating = 'good';
  else if (savingsPercent >= 10) rating = 'average';
  else if (savingsPercent > 0) rating = 'below_average';

  return {
    savingsPercent: parseFloat(savingsPercent),
    expensePercent: parseFloat(expensePercent),
    rating,
    suggestions: generateSuggestions(rating, savings, income)
  };
}

/**
 * Rule-based suggestions
 */
function generateSuggestions(rating, savings, income) {
  const suggestions = [];

  if (rating === 'poor' || rating === 'below_average') {
    suggestions.push('🚨 Your expenses are too high. Aim to reduce them by 10-15%.');
    suggestions.push('📋 Track every expense for 30 days to find leaks.');
    suggestions.push('🍳 Cut dining out and subscriptions as a first step.');
  }

  if (rating === 'average') {
    suggestions.push('👍 Decent savings! Try to push to 20% savings rate.');
    suggestions.push('💡 Automate your savings on salary day.');
    suggestions.push('📊 Consider a SIP in index funds for long-term growth.');
  }

  if (rating === 'good') {
    suggestions.push('🎯 Great financial discipline! Consider diversifying investments.');
    suggestions.push('🏥 Ensure you have health insurance and an emergency fund.');
    suggestions.push('📈 Explore equity mutual funds for wealth building.');
  }

  if (rating === 'excellent') {
    suggestions.push('🏆 Outstanding! You are in the top tier of financial health.');
    suggestions.push('💎 Consider tax-saving instruments (ELSS, PPF, NPS).');
    suggestions.push('🏠 You can plan for bigger goals like property or retirement.');
  }

  return suggestions;
}

/**
 * Main analysis function — entry point
 */
function analyze(data) {
  const { income, expenses, goal, goalAmount, customConfig } = data;
  
  const savings = income - expenses;
  const score = calculateFinancialScore(income, expenses, savings);
  const sip = calculateSIP(savings);
  const goalTimeline = calculateGoalTimeline(savings, goal, goalAmount);
  const expenseAnalysis = analyzeExpenses(income, expenses);
  const strategies = calculateLoanVsSipStrategies(goalTimeline.targetAmount, savings, goal, customConfig);

  return {
    income,
    expenses,
    savings,
    score,
    sip,
    goal,
    goalTimeline,
    strategies,
    expenseAnalysis,
    monthlyBreakdown: {
      income,
      expenses,
      savings,
      recommendedSIP: sip,
      remainingAfterSIP: savings - sip
    }
  };
}

module.exports = { analyze, calculateFinancialScore, calculateSIP, calculateGoalTimeline, calculateLoanVsSipStrategies };
