const CONSENT_COPY_VERSION = 'starter-assessment-2026-07-14';
const PRIVACY_POLICY_VERSION = 'privacy-2026-07-11';
const LANGUAGES = ['en', 'pt', 'es'];

const QUESTIONS = [
  {
    id: 'primary_goal',
    text: 'What would you most like to achieve right now?',
    options: [
      'Lose body fat',
      'Build muscle',
      'Improve body composition',
      'Become fitter and more energetic',
      'Rebuild consistency',
      'Not sure yet'
    ]
  },
  {
    id: 'training_environment',
    text: 'Where are you most likely to train?',
    options: [
      'Commercial gym',
      'Home with some equipment',
      'Home with little or no equipment',
      'A mixture of gym and home',
      'I am not currently training'
    ]
  },
  {
    id: 'training_days',
    text: 'How many days per week could you realistically train?',
    options: ['2 days', '3 days', '4 days', '5 or more days', 'I am unsure']
  },
  {
    id: 'main_barrier',
    text: 'What is currently making progress most difficult?',
    options: [
      'Nutrition and food choices',
      'Lack of consistency',
      'Limited time',
      'I do not know what programme to follow',
      'Motivation and accountability',
      'I have stopped seeing progress',
      'I am overwhelmed by conflicting information'
    ]
  },
  {
    id: 'nutrition_support',
    text: 'What kind of nutrition guidance would help you most?',
    options: [
      'Simple meal structure',
      'Calories and macro targets',
      'High-protein food ideas',
      'Portion guidance without tracking everything',
      'Meal preparation and planning',
      'Help controlling cravings and overeating',
      'I am unsure'
    ]
  },
  {
    id: 'starting_timeline',
    text: 'When would you ideally like to begin?',
    options: [
      'As soon as possible',
      'Within the next two weeks',
      'Within the next month',
      'I am researching my options',
      'I only want the free resources for now'
    ]
  },
  {
    id: 'support_preference',
    text: 'Which type of support are you looking for?',
    options: [
      'A free guide to help me begin',
      'A workout and nutrition template',
      'A structured programme I can follow',
      'A fully tailored coaching plan',
      'I would like to speak with Andre first'
    ]
  }
];

const QUESTION_IDS = QUESTIONS.map((question) => question.id);
const OPTION_SETS = Object.fromEntries(QUESTIONS.map((question) => [question.id, new Set(question.options)]));

const WORKOUT_TEMPLATE_BY_CONTEXT = {
  'Commercial gym|2 days': 'Two-Day Full-Body Starter',
  'Commercial gym|3 days': 'Three-Day Full-Body Strength and Fat-Loss Template',
  'Commercial gym|4 days': 'Four-Day Upper/Lower Template',
  'Commercial gym|5 or more days': 'Five-Day Structured Gym Template',
  'Home with some equipment|*': 'Home Dumbbell Training Template',
  'Home with little or no equipment|*': 'Bodyweight Consistency Starter',
  'A mixture of gym and home|*': 'Hybrid Training Starter',
  'I am not currently training|*': 'Two-Day Rebuild Programme',
  '*|I am unsure': 'Two-Day Rebuild Programme'
};

const NUTRITION_TEMPLATE_BY_SUPPORT = {
  'Simple meal structure': 'High-Protein Plate Builder',
  'Calories and macro targets': 'Starter Calorie and Macro Framework',
  'High-protein food ideas': 'High-Protein Food Library',
  'Portion guidance without tracking everything': 'No-Tracking Portion Guide',
  'Meal preparation and planning': 'Three-Day Meal-Preparation Template',
  'Help controlling cravings and overeating': 'Hunger and Cravings Management Guide',
  'I am unsure': 'Nutrition Foundations Guide'
};

const SCORING_RULES = [
  {
    field: 'support_preference',
    value: 'A fully tailored coaching plan',
    points: 4,
    reason: 'fully_tailored_support'
  },
  {
    field: 'support_preference',
    value: 'I would like to speak with Andre first',
    points: 4,
    reason: 'speak_with_andre'
  },
  {
    field: 'support_preference',
    value: 'A structured programme I can follow',
    points: 2,
    reason: 'structured_programme_interest'
  },
  {
    field: 'starting_timeline',
    value: 'As soon as possible',
    points: 3,
    reason: 'start_asap'
  },
  {
    field: 'starting_timeline',
    value: 'Within the next two weeks',
    points: 2,
    reason: 'start_two_weeks'
  },
  {
    field: 'starting_timeline',
    value: 'Within the next month',
    points: 1,
    reason: 'start_next_month'
  },
  {
    field: 'main_barrier',
    value: 'Motivation and accountability',
    points: 1,
    reason: 'accountability_barrier'
  },
  {
    field: 'main_barrier',
    value: 'I do not know what programme to follow',
    points: 1,
    reason: 'programme_uncertainty'
  },
  {
    field: 'main_barrier',
    value: 'I have stopped seeing progress',
    points: 1,
    reason: 'plateau'
  }
];

const WHATSAPP_CONTACT_POINTS = 2;

const EVENT_RULES = {
  guide_downloaded: { points: 0, oneTime: true },
  workout_template_viewed: { points: 0, oneTime: true },
  nutrition_template_viewed: { points: 0, oneTime: true },
  whatsapp_clicked: { points: 4, oneTime: true },
  consultation_clicked: { points: 3, oneTime: true },
  result_viewed: { points: 0, oneTime: true }
};

const LEAD_STATUS_BOUNDARIES = [
  { status: 'cold', min: 0, max: 3 },
  { status: 'interested', min: 4, max: 7 },
  { status: 'warm', min: 8, max: Number.POSITIVE_INFINITY }
];

module.exports = {
  CONSENT_COPY_VERSION,
  PRIVACY_POLICY_VERSION,
  LANGUAGES,
  QUESTIONS,
  QUESTION_IDS,
  OPTION_SETS,
  WORKOUT_TEMPLATE_BY_CONTEXT,
  NUTRITION_TEMPLATE_BY_SUPPORT,
  SCORING_RULES,
  WHATSAPP_CONTACT_POINTS,
  EVENT_RULES,
  LEAD_STATUS_BOUNDARIES
};
