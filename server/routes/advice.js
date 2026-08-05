/**
 * Route: /api/advice
 * Purpose: Run Logic Engine + Groq AI Engine for full mentorship advice & save to Supabase
 */

const express = require('express');
const router = express.Router();
const logicEngine = require('../engines/logicEngine');
const aiEngine = require('../engines/aiEngine');
const { buildAdviceResponse, buildErrorResponse } = require('../services/responseBuilder');
const contextManager = require('../services/contextManager');
const supabaseService = require('../services/supabaseService');

router.post('/', async (req, res) => {
  try {
    const { email, income, expenses, goal, goalAmount, userId } = req.body;

    // Validate input
    if (!income || !expenses) {
      return res.status(400).json(buildErrorResponse({
        message: 'Income and expenses are required',
        code: 'MISSING_INPUT'
      }));
    }

    // Step 1: Logic Engine
    const logicOutput = logicEngine.analyze({
      income: Number(income),
      expenses: Number(expenses),
      goal: goal || 'other',
      goalAmount: goalAmount ? Number(goalAmount) : undefined
    });

    // Save to context
    const uid = userId || 'default';
    contextManager.saveAnalysis(uid, logicOutput);
    const userContext = contextManager.getUserContext(uid);

    // Step 2: Groq AI Engine
    const aiAdvice = await aiEngine.generateAdvice(logicOutput, userContext);

    // Step 3: Save to Supabase (Async)
    const userEmail = email || 'user@architecturalwealth.com';
    supabaseService.saveAnalysisRecord({
      userEmail,
      income: Number(income),
      expenses: Number(expenses),
      savings: logicOutput.savings,
      savingsPercent: logicOutput.expenseAnalysis.savingsPercent,
      financialScore: logicOutput.score,
      goal: goal || 'other',
      goalAmount: logicOutput.goalTimeline ? logicOutput.goalTimeline.targetAmount : undefined,
      sipRecommendation: logicOutput.sip,
      aiAdvice
    }).catch(err => console.error('Background Supabase save error:', err.message));

    // Step 4: Response Builder
    res.json(buildAdviceResponse(logicOutput, aiAdvice));
  } catch (error) {
    console.error('Advice Error:', error);
    res.status(500).json(buildErrorResponse(error));
  }
});

module.exports = router;
