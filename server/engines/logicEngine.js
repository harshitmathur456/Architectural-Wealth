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
 * Based on savings ratio, expense discipline, and goal feasibility
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
  // Recommend investing 50% of monthly savings
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
    achievable: months <= 360, // Within 30 years
    targetAmount
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
  const { income, expenses, goal, goalAmount } = data;
  
  const savings = income - expenses;
  const score = calculateFinancialScore(income, expenses, savings);
  const sip = calculateSIP(savings);
  const goalTimeline = calculateGoalTimeline(savings, goal, goalAmount);
  const expenseAnalysis = analyzeExpenses(income, expenses);

  return {
    income,
    expenses,
    savings,
    score,
    sip,
    goal,
    goalTimeline,
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

module.exports = { analyze, calculateFinancialScore, calculateSIP, calculateGoalTimeline };
