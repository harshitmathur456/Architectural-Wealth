/**
 * Context Manager — Smart Personalization
 * 
 * Stores user profiles and conversation history in memory.
 * Injects context into AI prompts for personalized responses.
 */

// In-memory store
const userProfiles = new Map();
const conversationHistories = new Map();

/**
 * Save or update user profile
 */
function saveProfile(userId, profileData) {
  const existing = userProfiles.get(userId) || {};
  const updated = {
    ...existing,
    ...profileData,
    lastUpdated: new Date().toISOString()
  };
  userProfiles.set(userId, updated);
  return updated;
}

/**
 * Get user profile
 */
function getProfile(userId) {
  return userProfiles.get(userId) || null;
}

/**
 * Save analysis result to profile
 */
function saveAnalysis(userId, analysisResult) {
  const profile = getProfile(userId) || {};
  profile.latestAnalysis = analysisResult;
  profile.analysisHistory = profile.analysisHistory || [];
  profile.analysisHistory.push({
    timestamp: new Date().toISOString(),
    score: analysisResult.score,
    savings: analysisResult.savings,
    income: analysisResult.income,
    goal: analysisResult.goal,
    targetAmount: analysisResult.goalTimeline ? analysisResult.goalTimeline.targetAmount : undefined
  });
  // Keep only last 10 analyses
  if (profile.analysisHistory.length > 10) {
    profile.analysisHistory = profile.analysisHistory.slice(-10);
  }
  saveProfile(userId, profile);
  return profile;
}

/**
 * Add message to conversation history
 */
function addMessage(userId, role, content) {
  if (!conversationHistories.has(userId)) {
    conversationHistories.set(userId, []);
  }
  const history = conversationHistories.get(userId);
  history.push({ role, content });
  // Keep last 20 messages
  if (history.length > 20) {
    conversationHistories.set(userId, history.slice(-20));
  }
}

/**
 * Get conversation history
 */
function getHistory(userId) {
  return conversationHistories.get(userId) || [];
}

/**
 * Clear conversation history
 */
function clearHistory(userId) {
  conversationHistories.set(userId, []);
}

/**
 * Get user context for AI prompts
 */
function getUserContext(userId) {
  const profile = getProfile(userId);
  if (!profile || !profile.latestAnalysis) return {};

  const { latestAnalysis } = profile;
  const targetAmount = latestAnalysis.goalTimeline ? latestAnalysis.goalTimeline.targetAmount : latestAnalysis.targetAmount;

  return {
    income: latestAnalysis.income,
    expenses: latestAnalysis.expenses,
    savings: latestAnalysis.savings,
    score: latestAnalysis.score,
    goal: latestAnalysis.goal,
    targetAmount: targetAmount,
    goalTimeline: latestAnalysis.goalTimeline,
    sip: latestAnalysis.sip
  };
}

module.exports = {
  saveProfile,
  getProfile,
  saveAnalysis,
  addMessage,
  getHistory,
  clearHistory,
  getUserContext
};
