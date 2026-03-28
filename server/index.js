/**
 * Financial Mentor — Express Server Entry Point
 * 
 * Hybrid AI System: Logic Engine + LLM Mentor
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes (Microservice-style)
app.use('/api/analyze', require('./routes/analyze'));  // Logic Engine only
app.use('/api/advice', require('./routes/advice'));    // Logic + AI Engine
app.use('/api/chat', require('./routes/chat'));        // Chat with Mentor
app.use('/api/exchange', require('./routes/exchange'));// Gemini Dynamic Exchange
app.use('/api/vehicle-mentor', require('./routes/vehicleMentor')); // Gemini Vehicle Affordability
app.use('/api/goal-planner', require('./routes/goalPlanner')); // AI Goal Planner

// Health check
app.get('/api/health', (req, res) => {
  const hasAI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-api-key-here';
  res.json({
    status: 'ok',
    engines: {
      logic: true,
      ai: hasAI
    },
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  const hasAI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-api-key-here';
  console.log(`\n🚀 Financial Mentor Server running on http://localhost:${PORT}`);
  console.log(`📊 Logic Engine: ✅ Active`);
  console.log(`🤖 AI Engine: ${hasAI ? '✅ Active (OpenAI)' : '⚠️  Fallback mode (no API key)'}`);
  console.log(`\nEndpoints:`);
  console.log(`  POST /api/analyze  → Financial calculations`);
  console.log(`  POST /api/advice   → Full mentorship advice`);
  console.log(`  POST /api/chat     → Chat with mentor`);
  console.log(`  GET  /api/health   → Server status\n`);
});
