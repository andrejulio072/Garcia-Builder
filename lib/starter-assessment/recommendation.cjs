const {
  WORKOUT_TEMPLATE_BY_CONTEXT,
  NUTRITION_TEMPLATE_BY_SUPPORT,
  SCORING_RULES,
  WHATSAPP_CONTACT_POINTS,
  LEAD_STATUS_BOUNDARIES
} = require('./config.cjs');
const { getPrimaryGuide, getResourceByTitle, getDisplayResource } = require('./resources.cjs');

function getLeadStatus(score) {
  const normalized = Number.isFinite(score) ? score : 0;
  const match = LEAD_STATUS_BOUNDARIES.find((boundary) => normalized >= boundary.min && normalized <= boundary.max);
  return match ? match.status : 'cold';
}

function getWorkoutTemplate(answers) {
  const exact = `${answers.training_environment}|${answers.training_days}`;
  const environmentWildcard = `${answers.training_environment}|*`;
  const dayWildcard = `*|${answers.training_days}`;
  return WORKOUT_TEMPLATE_BY_CONTEXT[exact] ||
    WORKOUT_TEMPLATE_BY_CONTEXT[environmentWildcard] ||
    WORKOUT_TEMPLATE_BY_CONTEXT[dayWildcard] ||
    'Two-Day Rebuild Programme';
}

function getNutritionTemplate(answers) {
  return NUTRITION_TEMPLATE_BY_SUPPORT[answers.nutrition_support] || 'Nutrition Foundations Guide';
}

function scoreLead(answers, contact = {}) {
  const scoreReasons = [];
  let leadScore = 0;

  for (const rule of SCORING_RULES) {
    if (answers[rule.field] === rule.value) {
      leadScore += rule.points;
      scoreReasons.push({ reason: rule.reason, points: rule.points });
    }
  }

  if (contact.whatsapp) {
    leadScore += WHATSAPP_CONTACT_POINTS;
    scoreReasons.push({ reason: 'whatsapp_contact_permission', points: WHATSAPP_CONTACT_POINTS });
  }

  return {
    leadScore,
    leadStatus: getLeadStatus(leadScore),
    scoreReasons
  };
}

function getPrimaryPath(answers) {
  if (answers.support_preference === 'A fully tailored coaching plan' || answers.support_preference === 'I would like to speak with Andre first') {
    return 'coaching-consultation';
  }
  if (answers.support_preference === 'A structured programme I can follow') {
    return 'structured-programme';
  }
  if (answers.primary_goal === 'Build muscle') {
    return 'muscle-building-foundations';
  }
  if (answers.primary_goal === 'Rebuild consistency') {
    return 'consistency-rebuild';
  }
  return 'fat-loss-body-composition';
}

function getResultTitle(answers) {
  const path = getPrimaryPath(answers);
  const titles = {
    'coaching-consultation': 'Structured Coaching Support',
    'structured-programme': 'Structured Training and Nutrition Plan',
    'muscle-building-foundations': 'Muscle-Building Foundation Plan',
    'consistency-rebuild': 'Consistency Rebuild Plan',
    'fat-loss-body-composition': 'Fat-Loss and Body-Composition Starter Plan'
  };
  return titles[path];
}

function buildSummary(answers) {
  const goalPhrases = {
    'Lose body fat': 'reducing body fat',
    'Build muscle': 'building muscle',
    'Improve body composition': 'improving body composition',
    'Become fitter and more energetic': 'improving fitness and energy',
    'Rebuild consistency': 'rebuilding consistency',
    'Not sure yet': 'finding a clear starting point'
  };
  const goal = goalPhrases[answers.primary_goal] || 'moving toward your goal';
  const days = answers.training_days === 'I am unsure' ? 'a realistic weekly routine' : `training ${answers.training_days.toLowerCase()} per week`;
  const barrier = answers.main_barrier ? answers.main_barrier.toLowerCase() : 'your current challenge';

  return `Based on your goal of ${goal}, ${days} and working through ${barrier}, your strongest starting point is a repeatable training structure combined with manageable nutrition habits.`;
}

function getSupportCTA(leadStatus) {
  if (leadStatus === 'warm') return 'Discuss a Tailored Plan with Andre';
  if (leadStatus === 'interested') return 'View My Recommended Templates';
  return 'Download My 28-Day Kickstart';
}

function buildRecommendation(answers, contact = {}) {
  const workoutTemplate = getWorkoutTemplate(answers);
  const nutritionTemplate = getNutritionTemplate(answers);
  const primaryResource = getPrimaryGuide();
  const scoring = scoreLead(answers, contact);

  return {
    primaryPath: getPrimaryPath(answers),
    resultTitle: getResultTitle(answers),
    summary: buildSummary(answers),
    workoutTemplate,
    nutritionTemplate,
    primaryResource: primaryResource.title,
    supportCTA: getSupportCTA(scoring.leadStatus),
    leadScore: scoring.leadScore,
    leadStatus: scoring.leadStatus,
    scoreReasons: scoring.scoreReasons
  };
}

function toVisitorRecommendation(recommendation) {
  const primary = getDisplayResource(recommendation.primaryResource);
  const workout = getDisplayResource(recommendation.workoutTemplate);
  const nutrition = getDisplayResource(recommendation.nutritionTemplate);

  return {
    primaryPath: recommendation.primaryPath,
    resultTitle: recommendation.resultTitle,
    summary: recommendation.summary,
    supportCTA: recommendation.supportCTA,
    resources: [
      {
        role: 'primary',
        requestedTitle: primary.requestedTitle,
        fallbackUsed: primary.fallbackUsed,
        details: primary.details || [],
        ...primary.resource
      },
      {
        role: 'workout',
        requestedTitle: workout.requestedTitle,
        fallbackUsed: workout.fallbackUsed,
        unavailableTitle: workout.fallbackUsed ? recommendation.workoutTemplate : null,
        details: workout.details || [],
        ...workout.resource
      },
      {
        role: 'nutrition',
        requestedTitle: nutrition.requestedTitle,
        fallbackUsed: nutrition.fallbackUsed,
        unavailableTitle: nutrition.fallbackUsed ? recommendation.nutritionTemplate : null,
        details: nutrition.details || [],
        ...nutrition.resource
      }
    ]
  };
}

module.exports = {
  buildRecommendation,
  buildSummary,
  getLeadStatus,
  getNutritionTemplate,
  getResourceByTitle,
  getSupportCTA,
  getWorkoutTemplate,
  scoreLead,
  toVisitorRecommendation
};
