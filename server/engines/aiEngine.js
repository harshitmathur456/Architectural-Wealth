/**
 * AI Engine — LLM Mentor Personality (Groq AI Version)
 * 
 * Powered by Groq AI (Llama 3.3 70B Versatile).
 * Converts numbers into warm, human, actionable advice.
 */

const SYSTEM_PROMPT = `You are a warm, knowledgeable financial mentor for Indian users. Your name is "Sovereign Mentor".
PERSONALITY:
- Friendly, supportive, and encouraging
- Like a wise older sibling who knows finance
- Use simple language, avoid complex jargon
- Occasionally use relatable Indian examples (chai budget, festival expenses, etc.)
RULES:
1. Always suggest savings, investment, and risk control
2. Recommend SIPs in mutual funds for long-term goals
3. Emphasize emergency fund (6 months expenses)
4. Mention tax-saving options when relevant (PPF, ELSS, NPS)
5. Be practical — don't suggest overly restrictive budgets
6. Keep responses concise (3-5 paragraphs max)
7. Use emojis sparingly for warmth
8. Always end with ONE actionable next step

CURRENCY: Always use ₹ (Indian Rupees)`;

/**
 * Call Groq API via fetch
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
      max_tokens: 1024
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
async function judgeVehicleAffordability(income, expenses, vehiclePrice, emi, downPayment) {
  const system = `You are a strict but helpful financial truth-teller focusing on auto loans.`;
  const prompt = `User income: ₹${income}
User expenses: ₹${expenses}
Net Surplus: ₹${income - expenses}
Vehicle Price: ₹${vehiclePrice}
Down Payment: ₹${downPayment}
Calculated EMI: ₹${emi}

Act as an AI mentor. Judge this purchase. Is it manageable? Is the EMI too high for their surplus? Tell them the harsh truth but keep it encouraging. Max 2 paragraphs. Format nicely.`;

  try {
    return await callGroq(system, prompt);
  } catch (error) {
    console.error('Groq Vehicle Mentor Error:', error.message);
    return "Fallback: Could not connect to AI Mentor. Please ensure your EMI is not exceeding 50% of your disposable income.";
  }
}

/**
 * Exchange Rate Fetcher using Groq AI
 */
async function getExchangeRate(country) {
  const system = `You are a financial currency assistant. Provide the estimated or standard current exchange rate of 1 primary unit of ${country}'s currency in Indian Rupees (INR). Reply ONLY with the exact floating point number (e.g. 83.50 or 105.20 or 94.86). Do not include text, currency symbols, or extra characters.`;
  const prompt = `What is the current exchange rate for 1 primary currency unit of ${country} in INR? Provide only the number.`;

  try {
    const rawNum = await callGroq(system, prompt);
    const match = rawNum.match(/[\d.]+/);
    if (!match) return null;
    const parsed = parseFloat(match[0]);
    return isNaN(parsed) ? null : parsed;
  } catch (error) {
    console.error('Groq Exchange Rate Error:', error.message);
    return null;
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
  const { income, expenses, savings, score, sip, goal, goalTimeline, expenseAnalysis } = logicOutput;

  return `Analyze this Indian user's finances and give personalized advice:

FINANCIAL PROFILE:
- Monthly Income: ₹${income.toLocaleString('en-IN')}
- Monthly Expenses: ₹${expenses.toLocaleString('en-IN')}
- Monthly Savings: ₹${savings.toLocaleString('en-IN')}
- Savings Rate: ${expenseAnalysis.savingsPercent}%
- Financial Score: ${score}/10 (${expenseAnalysis.rating})

GOAL: ${goal || 'Not specified'}
${goalTimeline ? `- Target Amount: ₹${goalTimeline.targetAmount.toLocaleString('en-IN')}
- Estimated Timeline: ${goalTimeline.months} months (${goalTimeline.years} years)` : ''}

RECOMMENDED: Minimum ₹${sip.toLocaleString('en-IN')}/month in SIPs.

Give practical, actionable advice for this specific situation. Address their goal directly.`;
}

function getFallbackAdvice(logicOutput) {
  const { savings, sip, expenseAnalysis } = logicOutput;
  return `AI currently offline. Please review your savings rate (${expenseAnalysis.savingsPercent}%). We recommend SIP investments of at least ₹${sip.toLocaleString('en-IN')}.`;
}

function getFallbackChatResponse(message) {
  return "I'm experiencing connectivity issues right now. Let's talk about building an emergency fund of 6 months expenses!";
}

module.exports = { generateAdvice, chat, judgeVehicleAffordability, getExchangeRate, generateGoalAdvice };
