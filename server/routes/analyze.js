/**
 * Route: /api/analyze
 * Purpose: Run Logic Engine calculations (no AI)
 */

const express = require('express');
const router = express.Router();
const logicEngine = require('../engines/logicEngine');
const { buildAnalysisResponse, buildErrorResponse } = require('../services/responseBuilder');
const contextManager = require('../services/contextManager');

router.post('/', (req, res) => {
  try {
    const { income, expenses, goal, goalAmount, userId } = req.body;

    // Validate input
    if (!income || !expenses) {
      return res.status(400).json(buildErrorResponse({
        message: 'Income and expenses are required',
        code: 'MISSING_INPUT'
      }));
    }

    if (income <= 0 || expenses < 0) {
      return res.status(400).json(buildErrorResponse({
        message: 'Income must be positive, expenses cannot be negative',
        code: 'INVALID_INPUT'
      }));
    }

    // Run logic engine
    const logicOutput = logicEngine.analyze({
      income: Number(income),
      expenses: Number(expenses),
      goal: goal || 'other',
      goalAmount: goalAmount ? Number(goalAmount) : undefined
    });

    // Save to context if userId provided
    const uid = userId || 'default';
    contextManager.saveAnalysis(uid, logicOutput);

    res.json(buildAnalysisResponse(logicOutput));
  } catch (error) {
    console.error('Analyze Error:', error);
    res.status(500).json(buildErrorResponse(error));
  }
});

module.exports = router;
