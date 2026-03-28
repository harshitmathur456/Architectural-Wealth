const express = require('express');
const router = express.Router();
const aiEngine = require('../engines/aiEngine');

router.post('/', async (req, res) => {
  try {
    const { country } = req.body;
    if (!country) return res.status(400).json({ success: false, error: 'Country required' });

    const rate = await aiEngine.getExchangeRate(country);
    
    // Fallback if Gemini failed
    if (rate === null) {
      return res.status(500).json({ success: false, error: 'Could not fetch live exchange rate' });
    }

    res.json({
      success: true,
      data: { country, rate }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
