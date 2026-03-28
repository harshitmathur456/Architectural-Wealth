const express = require('express');
const router = express.Router();
const aiEngine = require('../engines/aiEngine');

router.post('/', async (req, res) => {
  try {
    const { income, expenses, price, emi, downPayment } = req.body;
    
    if (!income || !expenses || !price || typeof emi === 'undefined') {
      return res.status(400).json({ success: false, error: 'Missing financial parameters' });
    }

    const advice = await aiEngine.judgeVehicleAffordability(
      Number(income), 
      Number(expenses), 
      Number(price), 
      Number(emi), 
      Number(downPayment)
    );

    res.json({
      success: true,
      data: { advice }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
