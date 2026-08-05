/**
 * Supabase Service — Database Integration
 * 
 * Stores user profiles, login emails, salaries, expenses, goals, and AI analysis records.
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://qjmhsdompiwgfhbhzxmj.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_qpAoLyS5TK9Bp1_s3lM_nA_JbcEyyy-';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Save / update user profile in Supabase
 */
async function saveUserProfile(email, income, expenses) {
  if (!email) return null;
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({ email, salary: income, expenses, updated_at: new Date() }, { onConflict: 'email' });
    
    if (error) console.error('Supabase saveUserProfile error:', error.message);
    return data;
  } catch (err) {
    console.error('Supabase connection error:', err.message);
    return null;
  }
}

/**
 * Save financial analysis record to Supabase
 */
async function saveAnalysisRecord({ userEmail, income, expenses, savings, savingsPercent, financialScore, goal, goalAmount, sipRecommendation, aiAdvice }) {
  const email = userEmail || 'user@architecturalwealth.com';
  try {
    // 1. Save or update user profile
    await saveUserProfile(email, income, expenses);

    // 2. Insert analysis record
    const { data, error } = await supabase
      .from('financial_analyses')
      .insert([
        {
          user_email: email,
          income,
          expenses,
          savings,
          savings_percent: savingsPercent,
          financial_score: financialScore,
          goal,
          goal_amount: goalAmount,
          sip_recommendation: sipRecommendation,
          ai_advice: aiAdvice,
          created_at: new Date()
        }
      ]);

    if (error) {
      console.error('Supabase saveAnalysisRecord error:', error.message);
    } else {
      console.log('✅ Analysis record successfully saved to Supabase for:', email);
    }
    return data;
  } catch (err) {
    console.error('Supabase save error:', err.message);
    return null;
  }
}

module.exports = { supabase, saveUserProfile, saveAnalysisRecord };
