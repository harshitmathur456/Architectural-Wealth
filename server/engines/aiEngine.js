/**
 * AI Engine — Groq AI Integration (llama-3.3-70b-versatile)
 * 
 * Powered strictly by Groq API.
 */

const SYSTEM_PROMPT = `You are Sovereign Curator — an elite, highly sophisticated Private Wealth Manager and Financial Architect.
Your role is to analyze the user's financial profile, income, expenses, and wealth goals, and provide precision advice on capital allocation, SIP investment strategies, loan structuring, and risk management.

Tone: Professional, direct, encouraging, precise.
Rules:
1. Always base advice on the user's exact financial numbers provided in context.
2. Recommend realistic SIP allocations and debt-management tactics.
3. Be clear on risk vs reward.
4. Keep answers clean, well-formatted with markdown subheadings, bullet points, and exact numbers in ₹ (INR).`;

/**
 * Call Groq API endpoint
 */
async function callGroq(systemPrompt, userPromptOrMessage, conversationHistory = [], userContext = {}) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your-groq-api-key-here') {
    throw new Error("Missing Groq API Key");
  }

  let contextPrompt = '';
  if (userContext && userContext.income) {
    const target = userContext.targetAmount || userContext.goalAmount || (userContext.goalTimeline ? userContext.goalTimeline.targetAmount : null);
    
    contextPrompt = `IMPORTANT USER FINANCIAL CONTEXT (CRITICAL: ALWAYS USE THESE EXACT USER NUMBERS FOR CALCULATIONS AND CHAT ASSUMPTIONS):
- Monthly Salary/Income: ₹${userContext.income.toLocaleString('en-IN')}
- Monthly Expenses: ₹${userContext.expenses.toLocaleString('en-IN')}
- Net Monthly Savings: ₹${userContext.savings.toLocaleString('en-IN')}
- Financial Score: ${userContext.score}/10
- Goal Category: ${userContext.goal || 'house'}
${target ? `- EXACT TARGET HOUSE / GOAL PRICE: ₹${target.toLocaleString('en-IN')} (Do NOT assume ₹50,00,000! User's configured goal price is ₹${target.toLocaleString('en-IN')})` : ''}
- Recommended SIP: ₹${(userContext.sip || 0).toLocaleString('en-IN')}/month`;
  }

  const messages = [
    { role: 'system', content: systemPrompt + (contextPrompt ? `\n\n${contextPrompt}` : '') }
  ];

  if (Array.isArray(conversationHistory)) {
    for (const msg of conversationHistory.slice(-6)) {
      messages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      });
    }
  }

  messages.push({ role: 'user', content: userPromptOrMessage });

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 1200
    })
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message || JSON.stringify(data.error));
  }

  return data.choices[0].message.content;
}

/**
 * Generate financial advice using Groq AI
 */
async function generateAdvice(logicOutput, userContext = {}) {
  const userPrompt = buildAdvicePrompt(logicOutput, userContext);
  try {
    return await callGroq(SYSTEM_PROMPT, userPrompt, [], userContext);
  } catch (error) {
    console.error('Groq AI Engine Error:', error.message);
    return getFallbackAdvice(logicOutput);
  }
}

/**
 * Chat with the mentor using Groq AI
 */
async function chat(message, conversationHistory = [], userContext = {}) {
  try {
    return await callGroq(SYSTEM_PROMPT, message, conversationHistory, userContext);
  } catch (error) {
    console.error('Groq AI Chat Error:', error.message);
    return getFallbackChatResponse(message);
  }
}

/**
 * Vehicle Mentor powered by Groq AI
 */
async function judgeVehicleAffordability(income, expenses, vehiclePrice, emi, downPayment, vehicleDetails = {}) {
  const { vehicleType = 'Car', brand = '', model = '', location = 'Jodhpur' } = vehicleDetails;
  const vehicleName = brand && model ? `${brand} ${model}` : (vehicleType || 'Vehicle');
  const system = `You are a strict but helpful financial advisor specializing in auto loans and vehicle purchases in India.`;
  const prompt = `User Income: ₹${income.toLocaleString('en-IN')}/month
User Expenses: ₹${expenses.toLocaleString('en-IN')}/month
Net Monthly Surplus: ₹${(income - expenses).toLocaleString('en-IN')}
Selected Vehicle: ${vehicleName} (${vehicleType})
Target Location: ${location}, Rajasthan (On-Road Price)
Total Vehicle Price: ₹${vehiclePrice.toLocaleString('en-IN')}
Down Payment Available: ₹${downPayment ? downPayment.toLocaleString('en-IN') : 0}
Calculated Monthly Loan EMI: ₹${emi.toLocaleString('en-IN')}

Act as an AI vehicle purchase mentor. Evaluate this purchase specifically for buying a ${vehicleName} in ${location}. Is it financially wise? Is the EMI manageable against their surplus? Mention local fuel/maintenance considerations for ${vehicleName}. Max 2 paragraphs. Format cleanly.`;

  try {
    return await callGroq(system, prompt);
  } catch (error) {
    console.error('Groq Vehicle Mentor Error:', error.message);
    return `Fallback Advice for ${vehicleName} in ${location}: Ensure your estimated loan EMI (₹${emi.toLocaleString('en-IN')}) does not exceed 50% of your disposable surplus (₹${(income - expenses).toLocaleString('en-IN')}).`;
  }
}

const POPULAR_CURRENCIES = {
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
  'spain': 91.20,
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
  'vietnam': 0.0034,
  'malaysia': 18.90
};

function getFallbackExchangeRate(country) {
  if (!country) return 83.80;
  const key = country.trim().toLowerCase();
  for (const [k, rate] of Object.entries(POPULAR_CURRENCIES)) {
    if (key.includes(k) || k.includes(key)) {
      return rate;
    }
  }
  return 83.80;
}

/**
 * Exchange Rate Fetcher using Groq AI with robust regional fallback
 */
async function getExchangeRate(country) {
  const system = `You are a financial currency assistant. Provide the estimated or standard current exchange rate of 1 primary unit of ${country}'s currency in Indian Rupees (INR). Reply ONLY with the exact floating point number (e.g. 83.50 or 105.20 or 94.86). Do not include text, currency symbols, or extra characters.`;
  const prompt = `What is the current exchange rate for 1 primary currency unit of ${country} in INR? Provide only the number.`;

  try {
    const rawNum = await callGroq(system, prompt);
    const match = rawNum.match(/[\d.]+/);
    if (!match) return getFallbackExchangeRate(country);
    const parsed = parseFloat(match[0]);
    return isNaN(parsed) ? getFallbackExchangeRate(country) : parsed;
  } catch (error) {
    console.warn('Groq Exchange Rate Warning, using fallback:', error.message);
    return getFallbackExchangeRate(country);
  }
}

/**
 * Future Goal Planner Mentor using Groq AI
 */
async function generateGoalAdvice(goalCategory, plannerData) {
  const system = `You are a strategic financial planner. The user wants to buy/achieve a ${goalCategory}.

Data provided:
${JSON.stringify(plannerData, null, 2)}

Provide a concise, encouraging verdict.
1. Should they wait for the "best month" or buy now? Explain why based on the discount/trend.
2. Address the required monthly savings. Is it realistic?
3. Keep it under 3 paragraphs. Use bullet points if helpful.`;

  const prompt = `Give me your strategic recommendation for my ${goalCategory} goal.`;

  try {
    return await callGroq(system, prompt);
  } catch (error) {
    console.error('Groq Goal Advice Error:', error.message);
    return "Fallback: Could not connect to AI Mentor. Please review the calculated savings plan manually.";
  }
}

/**
 * Build prompt for advice generation
 */
function buildAdvicePrompt(logicOutput, userContext) {
  const { income, expenses, savings, score, sip, goal, goalTimeline, expenseAnalysis, strategies } = logicOutput;

  let strategiesText = '';
  if (strategies) {
    strategiesText = `
FINANCING STRATEGIES COMPARISON (3 PATHWAYS):
1. ONLY LOAN (100% Debt Financed):
   - Down Payment: ₹${strategies.onlyLoan.downPayment.toLocaleString('en-IN')}
   - Loan Amount: ₹${strategies.onlyLoan.loanAmount.toLocaleString('en-IN')}
   - Monthly EMI: ₹${strategies.onlyLoan.monthlyEmi.toLocaleString('en-IN')}/month (${strategies.onlyLoan.tenureYears} yrs @ ${strategies.onlyLoan.interestRate}%)
   - Total Interest Cost: ₹${strategies.onlyLoan.totalInterestPaid.toLocaleString('en-IN')}

2. ONLY SIP (100% DEBT-FREE):
   - Monthly SIP: ₹${strategies.onlySip.monthlySip.toLocaleString('en-IN')}/month (12% CAGR)
   - Horizon Needed: ${strategies.onlySip.yearsNeeded} years (${strategies.onlySip.monthsNeeded} months)
   - Total Wealth Created / Interest Avoided: ₹${strategies.onlySip.wealthGained.toLocaleString('en-IN')}

3. HYBRID (LOAN + PARALLEL SIP):
   - Down Payment: ₹${strategies.hybrid.downPayment.toLocaleString('en-IN')}
   - Reduced EMI: ₹${strategies.hybrid.monthlyEmi.toLocaleString('en-IN')}/month
   - Parallel SIP: ₹${strategies.hybrid.parallelSip.toLocaleString('en-IN')}/month
   - Estimated Loan Prepayment: ~${strategies.hybrid.payoffEstimateYears} years (Saves ~₹${strategies.hybrid.interestSavedEstimate.toLocaleString('en-IN')} in interest)
`;
  }

  return `Analyze this user's finances and provide a comprehensive comparison between these 3 financing options:

FINANCIAL PROFILE:
- Monthly Income: ₹${income.toLocaleString('en-IN')}
- Monthly Expenses: ₹${expenses.toLocaleString('en-IN')}
- Monthly Savings / Surplus: ₹${savings.toLocaleString('en-IN')}
- Savings Rate: ${expenseAnalysis.savingsPercent}%
- Financial Health Score: ${score}/10 (${expenseAnalysis.rating})

GOAL: ${goal || 'House'}
${goalTimeline ? `- Target Goal Amount: ₹${goalTimeline.targetAmount.toLocaleString('en-IN')}
- Estimated Horizon: ${goalTimeline.months} months (${goalTimeline.years} years)` : ''}

${strategiesText}

Provide a structured, professional strategic verdict explaining:
1. **Loan vs SIP Analysis**: Compare taking a pure Loan vs pure SIP vs Hybrid.
2. **Which Strategy Fits Best**: Recommend the ideal path for their salary (₹${income.toLocaleString('en-IN')}) and surplus.
3. **Actionable Execution Plan**: Clear next steps. Format with bold headers and bullet points.`;
}

function getFallbackAdvice(logicOutput) {
  const { savings, sip, expenseAnalysis } = logicOutput;
  return `AI currently offline. Please review your savings rate (${expenseAnalysis.savingsPercent}%). We recommend SIP investments of at least ₹${sip.toLocaleString('en-IN')}.`;
}

function getFallbackChatResponse(message) {
  return "I'm experiencing connectivity issues right now. Let's talk about building an emergency fund of 6 months expenses!";
}

module.exports = { generateAdvice, chat, judgeVehicleAffordability, getExchangeRate, generateGoalAdvice };
