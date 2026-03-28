/**
 * Route: /api/chat
 * Purpose: Chat with AI Mentor (with context awareness)
 */

const express = require('express');
const router = express.Router();
const aiEngine = require('../engines/aiEngine');
const { buildChatResponse, buildErrorResponse } = require('../services/responseBuilder');
const contextManager = require('../services/contextManager');

router.post('/', async (req, res) => {
  try {
    const { message, userId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json(buildErrorResponse({
        message: 'Message is required',
        code: 'MISSING_MESSAGE'
      }));
    }

    const uid = userId || 'default';

    // Get user context and conversation history
    const userContext = contextManager.getUserContext(uid);
    const history = contextManager.getHistory(uid);

    // Save user message to history
    contextManager.addMessage(uid, 'user', message);

    // Get AI response
    const aiResponse = await aiEngine.chat(message, history, userContext);

    // Save AI response to history
    contextManager.addMessage(uid, 'assistant', aiResponse);

    res.json(buildChatResponse(aiResponse));
  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json(buildErrorResponse(error));
  }
});

// Clear chat history
router.delete('/history', (req, res) => {
  const { userId } = req.body;
  const uid = userId || 'default';
  contextManager.clearHistory(uid);
  res.json({ success: true, message: 'Chat history cleared' });
});

module.exports = router;
