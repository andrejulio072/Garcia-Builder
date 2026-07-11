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
    url: null,
    downloadFilename: null,
    available: false
  },
  {
    slug: 'three-day-full-body-strength-fat-loss',
    title: 'Three-Day Full-Body Strength and Fat-Loss Template',
    description: 'A balanced three-day gym setup for strength, muscle retention and fat-loss support.',
    type: 'workout',
    url: null,
    downloadFilename: null,
    available: false
  },
  {
    slug: 'four-day-upper-lower',
    title: 'Four-Day Upper/Lower Template',
    description: 'A structured upper/lower split for progressing key lifts across the week.',
    type: 'workout',
    url: null,
    downloadFilename: null,
    available: false
  },
  {
    slug: 'five-day-structured-gym',
    title: 'Five-Day Structured Gym Template',
    description: 'A higher-frequency gym structure for people ready to train most weekdays.',
    type: 'workout',
    url: null,
    downloadFilename: null,
    available: false
  },
  {
    slug: 'home-dumbbell-training',
    title: 'Home Dumbbell Training Template',
    description: 'A home-friendly plan built around simple equipment and repeatable sessions.',
    type: 'workout',
    url: null,
    downloadFilename: null,
    available: false
  },
  {
    slug: 'bodyweight-consistency-starter',
    title: 'Bodyweight Consistency Starter',
    description: 'A low-equipment starting point for building the habit of training.',
    type: 'workout',
    url: null,
    downloadFilename: null,
    available: false
  },
  {
    slug: 'hybrid-training-starter',
    title: 'Hybrid Training Starter',
    description: 'A flexible split for combining gym and home sessions.',
    type: 'workout',
    url: null,
    downloadFilename: null,
    available: false
  },
  {
    slug: 'two-day-rebuild-programme',
    title: 'Two-Day Rebuild Programme',
    description: 'A manageable restart plan when consistency matters more than complexity.',
    type: 'workout',
    url: null,
    downloadFilename: null,
    available: false
  },
  {
    slug: 'high-protein-plate-builder',
    title: 'High-Protein Plate Builder',
    description: 'A simple structure for building filling meals around protein, plants and smart portions.',
    type: 'nutrition',
    url: null,
    downloadFilename: null,
    available: false
  },
  {
    slug: 'starter-calorie-macro-framework',
    title: 'Starter Calorie and Macro Framework',
    description: 'A starting framework for understanding calories, protein and progress tracking.',
    type: 'nutrition',
    url: null,
    downloadFilename: null,
    available: false
  },
  {
    slug: 'high-protein-food-library',
    title: 'High-Protein Food Library',
    description: 'A curated list of protein options for easier meals and snacks.',
    type: 'nutrition',
    url: null,
    downloadFilename: null,
    available: false
  },
  {
    slug: 'no-tracking-portion-guide',
    title: 'No-Tracking Portion Guide',
    description: 'A portion-based approach for people who do not want to track every meal.',
    type: 'nutrition',
    url: null,
    downloadFilename: null,
    available: false
  },
  {
    slug: 'three-day-meal-preparation',
    title: 'Three-Day Meal-Preparation Template',
    description: 'A simple approach for preparing meals without making the week rigid.',
    type: 'nutrition',
    url: null,
    downloadFilename: null,
    available: false
  },
  {
    slug: 'hunger-cravings-management',
    title: 'Hunger and Cravings Management Guide',
    description: 'Practical steps for managing hunger, snacking and overeating patterns.',
    type: 'nutrition',
    url: null,
    downloadFilename: null,
    available: false
  },
  {
    slug: 'nutrition-foundations',
    title: 'Nutrition Foundations Guide',
    description: 'The core nutrition habits that support fat loss, energy and body composition.',
    type: 'nutrition',
    url: null,
    downloadFilename: null,
    available: false
  }
];

const RESOURCE_BY_TITLE = Object.fromEntries(RESOURCE_CATALOGUE.map((resource) => [resource.title, resource]));
const RESOURCE_BY_SLUG = Object.fromEntries(RESOURCE_CATALOGUE.map((resource) => [resource.slug, resource]));

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
  if (!requested) return { resource: fallback, requestedTitle: title, fallbackUsed: true };
  if (requested.available && requested.url) return { resource: requested, requestedTitle: title, fallbackUsed: false };
  return { resource: fallback, requestedTitle: title, fallbackUsed: true };
}

module.exports = {
  RESOURCE_CATALOGUE,
  getResourceByTitle,
  getResourceBySlug,
  getPrimaryGuide,
  getDisplayResource
};
