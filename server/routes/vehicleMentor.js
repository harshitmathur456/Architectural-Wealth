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
      Number(downPayment),
      {
        vehicleType: req.body.vehicleType || 'Car',
        brand: req.body.brand || '',
        model: req.body.model || '',
        location: req.body.location || 'Jodhpur'
      }
    );

    res.json({
      success: true,
      data: { advice }
    });
  } catch (error) {
    console.error('Vehicle Mentor Route Warning:', error.message);
    const inc = Number(req.body.income || 100000);
    const exp = Number(req.body.expenses || 50000);
    const emi = Number(req.body.emi || 0);
    const surplus = inc - exp;
    const isAffordable = emi <= (surplus * 0.5);

    const vehicleName = `${req.body.brand || ''} ${req.body.model || 'Vehicle'}`.trim();

    const fallbackMsg = isAffordable
      ? `Assessment for ${vehicleName} (Jodhpur On-Road Price): With a net monthly surplus of ₹${surplus.toLocaleString('en-IN')}, your estimated auto loan EMI of ₹${emi.toLocaleString('en-IN')}/month is within healthy budget limits. Maintain 3-6 months EMI reserve in your savings.`
      : `High Risk Assessment for ${vehicleName}: Your estimated monthly loan EMI of ₹${emi.toLocaleString('en-IN')}/month exceeds 50% of your disposable income (₹${surplus.toLocaleString('en-IN')}). Consider an increased down payment or choosing a lower variant.`;

    res.json({
      success: true,
      data: { advice: fallbackMsg }
    });
  }
});

module.exports = router;
