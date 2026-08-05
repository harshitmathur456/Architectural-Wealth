/**
 * Financial Mentor — Express Server Entry Point
 * 
 * Hybrid AI System: Logic Engine + Groq LLM Mentor + Supabase DB
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
app.use('/api/advice', require('./routes/advice'));    // Logic + Groq AI Engine + Supabase
app.use('/api/chat', require('./routes/chat'));        // Chat with Mentor (Groq AI)
app.use('/api/exchange', require('./routes/exchange'));// Groq Dynamic Exchange
app.use('/api/vehicle-mentor', require('./routes/vehicleMentor')); // Groq Vehicle Affordability
app.use('/api/goal-planner', require('./routes/goalPlanner')); // Groq Goal Planner

// Health check
app.get('/api/health', (req, res) => {
  const hasGroq = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your-groq-api-key-here';
  const hasSupabase = Boolean(process.env.SUPABASE_KEY);
  res.json({
    status: 'ok',
    engines: {
      logic: true,
      groq: hasGroq,
      supabase: hasSupabase
    },
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  const hasGroq = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your-groq-api-key-here';
  const hasSupabase = Boolean(process.env.SUPABASE_KEY);
  console.log(`\n🚀 Sovereign Curator Server running on http://localhost:${PORT}`);
  console.log(`📊 Logic Engine: ✅ Active`);
  console.log(`🤖 AI Engine: ${hasGroq ? '✅ Active (Groq AI)' : '⚠️  Fallback mode'}`);
  console.log(`🗄️ Database: ${hasSupabase ? '✅ Active (Supabase)' : '⚠️  Not configured'}`);
  console.log(`\nEndpoints:`);
  console.log(`  POST /api/analyze  → Financial calculations`);
  console.log(`  POST /api/advice   → Full mentorship advice & Supabase storage`);
  console.log(`  POST /api/chat     → Chat with Groq AI mentor`);
  console.log(`  GET  /api/health   → Server status\n`);
});
