const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const aiEngine = require('../engines/aiEngine');

// Load generic trends
const trendsPath = path.join(__dirname, '../data/seasonalTrends.json');
let seasonalTrends = {};
try {
  seasonalTrends = JSON.parse(fs.readFileSync(trendsPath, 'utf8'));
} catch (err) {
  console.error("Failed to load seasonalTrends.json", err);
}

router.post('/', async (req, res) => {
  try {
    const { category, payload } = req.body;
    let result = { bestMonth: null, expectedSavings: 0, monthlySavingsRequired: 0, insight: null };
    const date = new Date();
    const currentMonthNum = date.getMonth(); // 0-11
    
    if (category === 'smartphone' || category === 'electronics' || category === 'cars') {
      const budget = Number(payload.budget) || 0;
      const urgency = Number(payload.urgencyMonths) || 12; // Planning horizon
      
      const trends = seasonalTrends[category] || [];
      if (trends.length > 0) {
        // Find maximum discount within the user's urgency window (from next month to urgency)
        let maxDiscount = -1;
        let bestMonthRow = null;
        let monthsToWait = 0;

        for (let i = 1; i <= urgency; i++) {
          const index = (currentMonthNum + i) % 12;
          const monthData = trends[index];
          if (monthData.discountMultiplier > maxDiscount) {
            maxDiscount = monthData.discountMultiplier;
            bestMonthRow = monthData;
            monthsToWait = i;
          }
        }

        if (bestMonthRow) {
          result.bestMonth = bestMonthRow.month;
          result.expectedSavings = budget * bestMonthRow.discountMultiplier;
          result.insight = `Highest historical discount (${(bestMonthRow.discountMultiplier * 100).toFixed(0)}%) during ${bestMonthRow.event}`;
          
          if (monthsToWait > 0) {
             result.monthlySavingsRequired = Math.ceil((budget - result.expectedSavings) / monthsToWait);
          } else {
             result.monthlySavingsRequired = budget - result.expectedSavings; 
          }
        }
      }
    } else if (category === 'travel') {
      const budget = Number(payload.budget) || 50000;
      const travelDate = new Date(payload.travelDate || Date.now());
      const travelMonthStr = travelDate.toLocaleString('default', { month: 'long' }).toLowerCase();
      
      const flightData = seasonalTrends.flights || {};
      const isPeak = flightData.peak_months?.includes(travelMonthStr);
      const isCheap = flightData.cheap_months?.includes(travelMonthStr);
      
      let modifier = 1.0;
      if (isPeak) modifier = flightData.generic_multiplier_peak || 1.4;
      if (isCheap) modifier = flightData.generic_multiplier_cheap || 0.75;
      
      const simulatedPrice = budget * modifier;
      
      result.bestMonth = flightData.cheap_months?.[0] || 'September';
      if (isPeak && payload.flexibleDate) {
         result.expectedSavings = simulatedPrice - (budget * flightData.generic_multiplier_cheap);
         result.insight = `Traveling in ${travelMonthStr} is PEAK season. Shifting to ${result.bestMonth} saves ~${((1 - (flightData.generic_multiplier_cheap/modifier)) * 100).toFixed(0)}%`;
      } else {
         result.insight = isCheap ? `Excellent timing. ${travelMonthStr} is typically off-peak.` : `Standard pricing expected for ${travelMonthStr}.`;
         result.expectedSavings = 0;
      }
      
      result.simulatedFlightPrice = simulatedPrice;
      const monthsAway = Math.max(1, (travelDate.getFullYear() - date.getFullYear()) * 12 + travelDate.getMonth() - date.getMonth());
      result.monthlySavingsRequired = Math.ceil(simulatedPrice / monthsAway);
    } else if (category === 'further_studies') {
      const tuition = Number(payload.budget) || 0;
      const scholarshipActive = payload.scholarship; // boolean
      
      result.bestMonth = 'August (Enrollment)';
      result.expectedSavings = scholarshipActive ? tuition * 0.3 : 0; // Simulate avergae 30% scholarship
      result.insight = scholarshipActive ? 'Assuming a 30% standard scholarship offset based on your profile.' : 'Full tuition. Explore scholarship options to reduce burden.';
      
      const monthsAway = Number(payload.urgencyMonths) || 12;
      result.monthlySavingsRequired = Math.ceil((tuition - result.expectedSavings) / Math.max(1, monthsAway));
    }

    // Pass data to Gemini for natural language explanation
    const aiExplanation = await aiEngine.generateGoalAdvice(category, result);
    result.aiExplanation = aiExplanation;

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
