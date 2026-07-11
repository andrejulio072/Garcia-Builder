const { EVENT_RULES } = require('./config.cjs');
const { getLeadStatus } = require('./recommendation.cjs');

function getEventRule(eventName) {
  return EVENT_RULES[eventName] || null;
}

function applyEventScore(currentScore, eventName, alreadyApplied = false) {
  const rule = getEventRule(eventName);
  if (!rule) {
    throw new Error(`Unknown starter assessment event: ${eventName}`);
  }
  const score = Number.isFinite(currentScore) ? currentScore : 0;
  const increment = rule.oneTime && alreadyApplied ? 0 : rule.points;
  const nextScore = score + increment;
  return {
    leadScore: nextScore,
    leadStatus: getLeadStatus(nextScore),
    pointsAdded: increment
  };
}

module.exports = {
  EVENT_RULES,
  applyEventScore,
  getEventRule
};
