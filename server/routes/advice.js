/**
 * Route: /api/advice
 * Purpose: Run Logic Engine + AI Engine for full mentorship advice
 */

const express = require('express');
const router = express.Router();
const logicEngine = require('../engines/logicEngine');
const aiEngine = require('../engines/aiEngine');
const { buildAdviceResponse, buildErrorResponse } = require('../services/responseBuilder');
const contextManager = require('../services/contextManager');

router.post('/', async (req, res) => {
  try {
    const { income, expenses, goal, goalAmount, userId } = req.body;

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

    // Step 2: AI Engine
    const aiAdvice = await aiEngine.generateAdvice(logicOutput, userContext);

    // Step 3: Response Builder
    res.json(buildAdviceResponse(logicOutput, aiAdvice));
  } catch (error) {
    console.error('Advice Error:', error);
    res.status(500).json(buildErrorResponse(error));
  }
});

module.exports = router;
