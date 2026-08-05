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
      const urgency = Math.min(12, Math.max(1, Number(payload.urgencyMonths) || 12));
      
      const trends = seasonalTrends[category] || [];
      if (trends.length > 0) {
        let bestCandidate = null;
        let bestScore = -999;

        // Evaluate candidate months starting from current month up to urgency window
        for (let i = 0; i < urgency; i++) {
          const index = (currentMonthNum + i) % 12;
          const monthData = trends[index];
          const discount = monthData.discountMultiplier;

          // Score formula balancing discount percentage and urgency proximity
          const score = (discount * 100) - (i * 0.8);

          if (score > bestScore) {
            bestScore = score;
            bestCandidate = { ...monthData, monthsToWait: i };
          }
        }

        if (bestCandidate) {
          result.bestMonth = bestCandidate.month;
          result.expectedSavings = Math.round(budget * bestCandidate.discountMultiplier);
          result.insight = `Highest savings (${(bestCandidate.discountMultiplier * 100).toFixed(0)}% off) during ${bestCandidate.event}`;
          
          if (bestCandidate.monthsToWait > 0) {
             result.monthlySavingsRequired = Math.ceil((budget - result.expectedSavings) / bestCandidate.monthsToWait);
          } else {
             result.monthlySavingsRequired = Math.max(0, budget - result.expectedSavings); 
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
         result.expectedSavings = Math.round(simulatedPrice - (budget * flightData.generic_multiplier_cheap));
         result.insight = `Traveling in ${travelMonthStr} is PEAK season. Shifting to ${result.bestMonth} saves ~${((1 - (flightData.generic_multiplier_cheap/modifier)) * 100).toFixed(0)}%`;
      } else {
         result.insight = isCheap ? `Excellent timing. ${travelMonthStr} is typically off-peak.` : `Standard pricing expected for ${travelMonthStr}.`;
         result.expectedSavings = 0;
      }
      
      result.simulatedFlightPrice = Math.round(simulatedPrice);
      const monthsAway = Math.max(1, (travelDate.getFullYear() - date.getFullYear()) * 12 + travelDate.getMonth() - date.getMonth());
      result.monthlySavingsRequired = Math.ceil(simulatedPrice / monthsAway);
    } else if (category === 'further_studies') {
      const tuition = Number(payload.budget) || 0;
      const scholarshipActive = payload.scholarship;
      
      result.bestMonth = 'August (Enrollment)';
      result.expectedSavings = Math.round(scholarshipActive ? tuition * 0.3 : 0);
      result.insight = scholarshipActive ? 'Assuming a 30% standard scholarship offset based on your profile.' : 'Full tuition. Explore scholarship options to reduce burden.';
      
      const monthsAway = Number(payload.urgencyMonths) || 12;
      result.monthlySavingsRequired = Math.ceil((tuition - result.expectedSavings) / Math.max(1, monthsAway));
    }

    // Pass data to Groq AI for strategic advice explanation
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
