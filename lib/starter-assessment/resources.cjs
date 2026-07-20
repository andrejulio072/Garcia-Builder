const RESOURCE_CATALOGUE = [
  {
    slug: '28-day-fat-loss-kickstart',
    title: '28-Day Fat Loss Kickstart',
    description: 'A practical guide with training, nutrition and consistency foundations you can start with today.',
    type: 'guide',
    url: '/assets/28-days-fat-loss-quickstart.pdf',
    downloadFilename: '28-Day-Fat-Loss-Kickstart-Garcia-Builder.pdf',
    available: true
  },
  {
    slug: 'two-day-full-body-starter',
    title: 'Two-Day Full-Body Starter',
    description: 'A simple full-body structure for rebuilding consistency without overcomplicating training.',
    type: 'workout',
    url: '/workouts.html#workout-library',
    actionLabel: 'Open Two-Day Starter Workouts',
    downloadFilename: null,
    available: true
  },
  {
    slug: 'three-day-full-body-strength-fat-loss',
    title: 'Three-Day Full-Body Strength and Fat-Loss Template',
    description: 'A balanced three-day gym setup for strength, muscle retention and fat-loss support.',
    type: 'workout',
    url: '/workouts.html#workout-library',
    actionLabel: 'Open Three-Day Workout Templates',
    downloadFilename: null,
    available: true
  },
  {
    slug: 'four-day-upper-lower',
    title: 'Four-Day Upper/Lower Template',
    description: 'A structured upper/lower split for progressing key lifts across the week.',
    type: 'workout',
    url: '/workouts.html#workout-library',
    actionLabel: 'Open Upper/Lower Templates',
    downloadFilename: null,
    available: true
  },
  {
    slug: 'five-day-structured-gym',
    title: 'Five-Day Structured Gym Template',
    description: 'A higher-frequency gym structure for people ready to train most weekdays.',
    type: 'workout',
    url: '/workouts.html#workout-library',
    actionLabel: 'Open Gym Workout Templates',
    downloadFilename: null,
    available: true
  },
  {
    slug: 'home-dumbbell-training',
    title: 'Home Dumbbell Training Template',
    description: 'A home-friendly plan built around simple equipment and repeatable sessions.',
    type: 'workout',
    url: '/workouts.html#workout-library',
    actionLabel: 'Open Home Workout Templates',
    downloadFilename: null,
    available: true
  },
  {
    slug: 'bodyweight-consistency-starter',
    title: 'Bodyweight Consistency Starter',
    description: 'A low-equipment starting point for building the habit of training.',
    type: 'workout',
    url: '/workouts.html#workout-library',
    actionLabel: 'Open Consistency Workout Templates',
    downloadFilename: null,
    available: true
  },
  {
    slug: 'hybrid-training-starter',
    title: 'Hybrid Training Starter',
    description: 'A flexible split for combining gym and home sessions.',
    type: 'workout',
    url: '/workouts.html#workout-library',
    actionLabel: 'Open Hybrid Workout Templates',
    downloadFilename: null,
    available: true
  },
  {
    slug: 'two-day-rebuild-programme',
    title: 'Two-Day Rebuild Programme',
    description: 'A manageable restart plan when consistency matters more than complexity.',
    type: 'workout',
    url: '/workouts.html#workout-library',
    actionLabel: 'Open Rebuild Workout Templates',
    downloadFilename: null,
    available: true
  },
  {
    slug: 'high-protein-plate-builder',
    title: 'High-Protein Plate Builder',
    description: 'A simple structure for building filling meals around protein, plants and smart portions.',
    type: 'nutrition',
    url: '/nutrition-calculator.html',
    actionLabel: 'Calculate My Protein and Macros',
    downloadFilename: null,
    available: true
  },
  {
    slug: 'starter-calorie-macro-framework',
    title: 'Starter Calorie and Macro Framework',
    description: 'A starting framework for understanding calories, protein and progress tracking.',
    type: 'nutrition',
    url: '/nutrition-calculator.html',
    actionLabel: 'Calculate My Macro Targets',
    downloadFilename: null,
    available: true
  },
  {
    slug: 'high-protein-food-library',
    title: 'High-Protein Food Library',
    description: 'A curated list of protein options for easier meals and snacks.',
    type: 'nutrition',
    url: '/nutrition-calculator.html',
    actionLabel: 'Calculate My Protein Target',
    downloadFilename: null,
    available: true
  },
  {
    slug: 'no-tracking-portion-guide',
    title: 'No-Tracking Portion Guide',
    description: 'A portion-based approach for people who do not want to track every meal.',
    type: 'nutrition',
    url: '/nutrition-calculator.html',
    actionLabel: 'Calculate My Portion Targets',
    downloadFilename: null,
    available: true
  },
  {
    slug: 'three-day-meal-preparation',
    title: 'Three-Day Meal-Preparation Template',
    description: 'A simple approach for preparing meals without making the week rigid.',
    type: 'nutrition',
    url: '/nutrition-calculator.html',
    actionLabel: 'Calculate My Meal Targets',
    downloadFilename: null,
    available: true
  },
  {
    slug: 'hunger-cravings-management',
    title: 'Hunger and Cravings Management Guide',
    description: 'Practical steps for managing hunger, snacking and overeating patterns.',
    type: 'nutrition',
    url: '/nutrition-calculator.html',
    actionLabel: 'Calculate My Nutrition Targets',
    downloadFilename: null,
    available: true
  },
  {
    slug: 'nutrition-foundations',
    title: 'Nutrition Foundations Guide',
    description: 'The core nutrition habits that support fat loss, energy and body composition.',
    type: 'nutrition',
    url: '/nutrition-calculator.html',
    actionLabel: 'Open Nutrition Calculator',
    downloadFilename: null,
    available: true
  }
];

const RESOURCE_BY_TITLE = Object.fromEntries(RESOURCE_CATALOGUE.map((resource) => [resource.title, resource]));
const RESOURCE_BY_SLUG = Object.fromEntries(RESOURCE_CATALOGUE.map((resource) => [resource.slug, resource]));

const RESOURCE_DETAILS_BY_TITLE = {
  'Two-Day Full-Body Starter': [
    'Train two non-consecutive days per week.',
    'Use full-body sessions built around squat or leg press, hinge, push, pull, core and loaded carry work.',
    'Start with 2-3 working sets per movement and keep 1-3 reps in reserve.'
  ],
  'Three-Day Full-Body Strength and Fat-Loss Template': [
    'Train three days per week with at least one rest day between harder sessions.',
    'Use one squat or leg press pattern, one hinge, one press, one row or pulldown, and one core movement each session.',
    'Progress by adding reps first, then load when all sets feel controlled.'
  ],
  'Four-Day Upper/Lower Template': [
    'Train four days per week using an upper/lower split: Upper A, Lower A, Upper B, Lower B.',
    'Upper days should include a press, a row, a pulldown, shoulders and arms.',
    'Lower days should include a squat or leg press, hinge, single-leg work, calves and core.',
    'Keep most sets in the 6-12 rep range and stop 1-3 reps before failure.'
  ],
  'Five-Day Structured Gym Template': [
    'Use five focused sessions across the week: upper, lower, push, pull and legs or conditioning.',
    'Keep the first two sessions strength-focused and the later sessions more moderate-volume.',
    'Avoid adding extra exercises until recovery, sleep and nutrition are consistent.'
  ],
  'Home Dumbbell Training Template': [
    'Use dumbbell squats, Romanian deadlifts, presses, rows, lunges and core work.',
    'Train 3-4 days per week and use slower tempo when load is limited.',
    'Progress by adding reps, pauses and range of motion before buying more equipment.'
  ],
  'Bodyweight Consistency Starter': [
    'Start with short sessions built around squats, push-ups, hinges, rows or towel rows, lunges and planks.',
    'Use 20-30 minute sessions and repeat them consistently before increasing complexity.',
    'Make each movement easier or harder so the final reps are challenging but clean.'
  ],
  'Hybrid Training Starter': [
    'Use gym sessions for heavier lower-body and pulling work, then home sessions for accessories and conditioning.',
    'Keep a fixed weekly structure so the mix of locations does not break consistency.',
    'Prioritize the movements that are hardest to reproduce at home when you are in the gym.'
  ],
  'Two-Day Rebuild Programme': [
    'Use two repeatable full-body sessions each week for the first 2-4 weeks.',
    'Choose movements that feel stable and leave the gym knowing you could do slightly more.',
    'Add walking or light conditioning on non-lifting days before adding more lifting days.'
  ],
  'High-Protein Plate Builder': [
    'Build most meals from one palm-sized protein portion, vegetables or fruit, a smart carbohydrate and a thumb-sized fat source.',
    'Aim for protein at 3-4 meals per day before worrying about advanced tracking.',
    'Use the same simple meals repeatedly during busy weeks.'
  ],
  'Starter Calorie and Macro Framework': [
    'Start with protein at roughly 1.6-2.2 g per kg of target body weight per day.',
    'For fat loss, begin around 300-500 calories below maintenance and review scale trend, energy and training performance weekly.',
    'Keep fats moderate, then use carbohydrates to support training and adherence.',
    'Adjust only one variable at a time after 10-14 days of consistent tracking.'
  ],
  'High-Protein Food Library': [
    'Base meals around lean meat, fish, eggs, Greek yoghurt, cottage cheese, tofu, tempeh, beans or protein powder when useful.',
    'Keep two quick protein options available for days when cooking is unrealistic.',
    'Pair protein with fibre-rich foods to improve fullness.'
  ],
  'No-Tracking Portion Guide': [
    'Use hand portions: protein palm, carbs cupped hand, fats thumb, vegetables fist.',
    'Start with consistent portions for 10-14 days before changing anything.',
    'Reduce or increase one portion at a time based on progress and hunger.'
  ],
  'Three-Day Meal-Preparation Template': [
    'Prepare two protein options, one carbohydrate base and vegetables for three days at a time.',
    'Keep sauces and seasonings separate so meals do not feel repetitive.',
    'Plan one low-effort backup meal for busy evenings.'
  ],
  'Hunger and Cravings Management Guide': [
    'Prioritize protein, fibre and fluids earlier in the day.',
    'Keep high-trigger foods portioned rather than eating directly from the packet.',
    'Use a planned evening snack if cravings repeatedly break the plan.'
  ],
  'Nutrition Foundations Guide': [
    'Anchor the week around protein, mostly whole foods, water and consistent meal timing.',
    'Improve one habit at a time instead of changing every meal at once.',
    'Use progress photos, measurements, strength and energy alongside scale weight.'
  ]
};

function getResourceByTitle(title) {
  return RESOURCE_BY_TITLE[title] || null;
}

function getResourceBySlug(slug) {
  return RESOURCE_BY_SLUG[slug] || null;
}

function getPrimaryGuide() {
  return getResourceByTitle('28-Day Fat Loss Kickstart');
}

function getDisplayResource(title) {
  const requested = getResourceByTitle(title);
  const fallback = getPrimaryGuide();
  if (!requested) return { resource: fallback, requestedTitle: title, fallbackUsed: true, details: [] };
  return {
    resource: requested,
    requestedTitle: title,
    fallbackUsed: false,
    details: RESOURCE_DETAILS_BY_TITLE[requested.title] || []
  };
}

module.exports = {
  RESOURCE_CATALOGUE,
  getResourceByTitle,
  getResourceBySlug,
  getPrimaryGuide,
  getDisplayResource
};
