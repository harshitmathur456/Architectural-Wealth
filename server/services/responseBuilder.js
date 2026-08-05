/**
 * Response Builder — Combines Logic + AI Output
 * 
 * Merges deterministic calculations with AI advice
 * into a structured response for the frontend.
 */

/**
 * Build analysis response (logic only)
 */
function buildAnalysisResponse(logicOutput) {
  return {
    success: true,
    type: 'analysis',
    data: {
      score: logicOutput.score,
      savings: logicOutput.savings,
      income: logicOutput.income,
      expenses: logicOutput.expenses,
      sip: logicOutput.sip,
      goal: logicOutput.goal,
      goalTimeline: logicOutput.goalTimeline,
      strategies: logicOutput.strategies,
      expenseAnalysis: logicOutput.expenseAnalysis,
      monthlyBreakdown: logicOutput.monthlyBreakdown
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Build full advice response (logic + AI)
 */
function buildAdviceResponse(logicOutput, aiAdvice) {
  return {
    success: true,
    type: 'advice',
    data: {
      // Logic Engine output
      score: logicOutput.score,
      savings: logicOutput.savings,
      income: logicOutput.income,
      expenses: logicOutput.expenses,
      sip: logicOutput.sip,
      goal: logicOutput.goal,
      goalTimeline: logicOutput.goalTimeline,
      strategies: logicOutput.strategies,
      expenseAnalysis: logicOutput.expenseAnalysis,
      monthlyBreakdown: logicOutput.monthlyBreakdown,
      // AI Engine output
      aiAdvice,
      suggestions: logicOutput.expenseAnalysis.suggestions
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Build chat response
 */
function buildChatResponse(message, isAI = true) {
  return {
    success: true,
    type: 'chat',
    data: {
      message,
      source: isAI ? 'mentor' : 'fallback'
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Build error response
 */
function buildErrorResponse(error) {
  return {
    success: false,
    type: 'error',
    error: {
      message: error.message || 'Something went wrong',
      code: error.code || 'UNKNOWN_ERROR'
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  buildAnalysisResponse,
  buildAdviceResponse,
  buildChatResponse,
  buildErrorResponse
};
