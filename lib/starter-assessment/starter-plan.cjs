const CALCULATOR_URL = '/nutrition-calculator.html';
const WORKOUT_LIBRARY_URL = '/workouts.html#workout-library';
const NUTRITION_LIBRARY_URL = '/nutrition-calculator.html';

const TRAINING_PLANS = {
  'Two-Day Full-Body Starter': {
    weeklyStructure: ['Day 1: Full Body A', 'Day 2: Full Body B', 'Optional: 2-3 easy walks'],
    sessions: [
      {
        name: 'Full Body A',
        focus: 'Technique, confidence and repeatable effort.',
        work: [
          'Leg press or goblet squat: 2-3 sets of 8-12 reps',
          'Romanian deadlift: 2-3 sets of 8-10 reps',
          'Chest press or push-up: 2-3 sets of 8-12 reps',
          'Seated row: 2-3 sets of 10-12 reps',
          'Plank or dead bug: 2-3 controlled sets'
        ]
      },
      {
        name: 'Full Body B',
        focus: 'Repeat the same patterns with slightly different movements.',
        work: [
          'Split squat or step-up: 2-3 sets of 8-10 reps each side',
          'Hip thrust or cable pull-through: 2-3 sets of 10-12 reps',
          'Lat pulldown: 2-3 sets of 8-12 reps',
          'Dumbbell shoulder press: 2-3 sets of 8-12 reps',
          'Loaded carry or side plank: 2-3 controlled sets'
        ]
      }
    ]
  },
  'Three-Day Full-Body Strength and Fat-Loss Template': {
    weeklyStructure: ['Monday: Full Body A', 'Wednesday: Full Body B', 'Friday or Saturday: Full Body C'],
    sessions: [
      {
        name: 'Full Body A',
        focus: 'Lower-body strength plus upper push and pull.',
        work: [
          'Squat or leg press: 3 sets of 6-10 reps',
          'Bench press or chest press: 3 sets of 8-10 reps',
          'Seated row: 3 sets of 10-12 reps',
          'Hamstring curl: 2 sets of 10-15 reps',
          'Cable crunch or plank: 2-3 sets'
        ]
      },
      {
        name: 'Full Body B',
        focus: 'Hinge, vertical pull and controlled volume.',
        work: [
          'Romanian deadlift: 3 sets of 6-10 reps',
          'Lat pulldown: 3 sets of 8-12 reps',
          'Dumbbell shoulder press: 2-3 sets of 8-12 reps',
          'Walking lunge: 2 sets of 10 steps each side',
          'Incline walk or bike: 10-15 minutes easy'
        ]
      },
      {
        name: 'Full Body C',
        focus: 'Repeatable work that supports fat loss without draining recovery.',
        work: [
          'Front squat, goblet squat or leg press: 3 sets of 8-12 reps',
          'Incline press: 3 sets of 8-12 reps',
          'One-arm row: 3 sets of 10-12 reps',
          'Hip thrust: 2-3 sets of 10-12 reps',
          'Farmer carry or dead bug: 2-3 sets'
        ]
      }
    ]
  },
  'Four-Day Upper/Lower Template': {
    weeklyStructure: ['Monday: Upper A', 'Tuesday: Lower A', 'Thursday: Upper B', 'Friday or Saturday: Lower B'],
    sessions: [
      {
        name: 'Upper A',
        focus: 'Pressing, rowing and shoulder stability.',
        work: [
          'Bench press or chest press: 3 sets of 6-10 reps',
          'Seated row: 3 sets of 8-12 reps',
          'Incline dumbbell press: 2-3 sets of 8-12 reps',
          'Lateral raise: 2 sets of 12-15 reps',
          'Triceps pressdown and curl: 2 sets each'
        ]
      },
      {
        name: 'Lower A',
        focus: 'Squat pattern, hamstrings and core.',
        work: [
          'Squat or leg press: 3 sets of 6-10 reps',
          'Romanian deadlift: 3 sets of 8-10 reps',
          'Leg curl: 2-3 sets of 10-15 reps',
          'Calf raise: 2-3 sets of 10-15 reps',
          'Plank or cable crunch: 2-3 sets'
        ]
      },
      {
        name: 'Upper B',
        focus: 'Vertical pull, shoulders and upper-back volume.',
        work: [
          'Lat pulldown or assisted pull-up: 3 sets of 8-12 reps',
          'Shoulder press: 3 sets of 6-10 reps',
          'Chest-supported row: 2-3 sets of 8-12 reps',
          'Rear delt fly: 2 sets of 12-15 reps',
          'Arms superset: 2-3 sets'
        ]
      },
      {
        name: 'Lower B',
        focus: 'Hips, single-leg control and finishers.',
        work: [
          'Deadlift variation or hip thrust: 3 sets of 6-10 reps',
          'Bulgarian split squat or lunge: 2-3 sets of 8-10 reps each side',
          'Leg extension: 2 sets of 10-15 reps',
          'Back extension: 2 sets of 10-12 reps',
          'Incline walk or bike: 10-20 minutes easy'
        ]
      }
    ]
  },
  'Five-Day Structured Gym Template': {
    weeklyStructure: ['Day 1: Upper', 'Day 2: Lower', 'Day 3: Push', 'Day 4: Pull', 'Day 5: Legs or conditioning'],
    sessions: [
      {
        name: 'Five-Day Gym Week',
        focus: 'Higher frequency while keeping recovery under control.',
        work: [
          'Keep the first two days heavier and technique-focused.',
          'Use push and pull days for moderate volume and cleaner reps.',
          'Use the fifth day for legs, conditioning or weak points.',
          'Stop most sets with 1-3 reps in reserve.',
          'Take at least one full rest day each week.'
        ]
      }
    ]
  },
  'Home Dumbbell Training Template': {
    weeklyStructure: ['Day 1: Dumbbell full body', 'Day 2: Rest or walk', 'Day 3: Dumbbell full body', 'Day 4: Optional conditioning or repeat'],
    sessions: [
      {
        name: 'Home Dumbbell Session',
        focus: 'Make limited equipment productive with tempo and range of motion.',
        work: [
          'Goblet squat: 3 sets of 10-15 reps',
          'Dumbbell Romanian deadlift: 3 sets of 8-12 reps',
          'Dumbbell floor press: 3 sets of 8-12 reps',
          'One-arm dumbbell row: 3 sets of 10-12 reps each side',
          'Reverse lunge and plank: 2-3 sets each'
        ]
      }
    ]
  },
  'Bodyweight Consistency Starter': {
    weeklyStructure: ['Three short sessions weekly', 'Daily 10-20 minute walks where possible', 'Repeat the same session until it feels automatic'],
    sessions: [
      {
        name: 'Bodyweight Starter Session',
        focus: 'Build the habit without needing a gym setup.',
        work: [
          'Squat to chair: 2-4 sets of 10-15 reps',
          'Incline push-up: 2-4 sets of 6-12 reps',
          'Hip hinge or glute bridge: 2-4 sets of 10-15 reps',
          'Towel row or backpack row: 2-4 sets of 8-12 reps',
          'Dead bug or plank: 2-3 controlled sets'
        ]
      }
    ]
  },
  'Hybrid Training Starter': {
    weeklyStructure: ['Gym day: heavier lower body and pulling', 'Home day: dumbbells/bodyweight accessories', 'Gym or home day: full-body repeat'],
    sessions: [
      {
        name: 'Hybrid Week',
        focus: 'Use the gym for movements that are harder to recreate at home.',
        work: [
          'Gym: leg press or squat, pulldown, row, press and core.',
          'Home: dumbbell RDL, split squat, floor press, one-arm row and plank.',
          'Repeat the strongest session once more if you train three days.',
          'Keep the same days each week so location does not break consistency.'
        ]
      }
    ]
  },
  'Two-Day Rebuild Programme': {
    weeklyStructure: ['Two full-body sessions weekly', 'Two easy walks weekly', 'One habit review at the end of the week'],
    sessions: [
      {
        name: 'Rebuild Session',
        focus: 'Leave the session feeling better than when you started.',
        work: [
          'Leg press or squat pattern: 2 sets of 8-12 reps',
          'Hinge or hip thrust: 2 sets of 8-12 reps',
          'Machine press or push-up: 2 sets of 8-12 reps',
          'Row or pulldown: 2 sets of 8-12 reps',
          'Five-minute easy finisher or core work'
        ]
      }
    ]
  }
};

const NUTRITION_PLANS = {
  'High-Protein Plate Builder': {
    title: 'High-Protein Plate Builder',
    macroTargets: [
      'Protein: include a clear protein source at 3-4 meals per day.',
      'Calories: keep portions repeatable for 10-14 days, then adjust from progress.',
      'Carbs: place most starches around training or your busiest part of the day.',
      'Fats: use thumb-sized portions from oils, avocado, nuts, eggs or oily fish.'
    ],
    meals: [
      { meal: 'Breakfast', example: 'Greek yogurt, berries and oats', purpose: 'Protein and fibre early in the day.' },
      { meal: 'Lunch', example: 'Chicken or tuna wrap with salad and fruit', purpose: 'A repeatable high-protein work meal.' },
      { meal: 'Snack', example: 'Protein shake or cottage cheese with fruit', purpose: 'Stops long gaps turning into overeating.' },
      { meal: 'Dinner', example: 'Lean mince, rice or potatoes and vegetables', purpose: 'Simple plate structure without complicated recipes.' }
    ],
    shoppingList: ['Greek yogurt', 'Chicken breast or turkey mince', 'Eggs', 'Rice or potatoes', 'Mixed vegetables', 'Fruit', 'Protein powder if useful']
  },
  'Starter Calorie and Macro Framework': {
    title: 'Starter Calorie and Macro Framework',
    macroTargets: [
      'Protein: start at 1.6-2.2 g per kg of target body weight per day.',
      'Fat loss calories: start about 300-500 calories below maintenance.',
      'Muscle gain calories: start about 150-250 calories above maintenance.',
      'Fats: keep roughly 0.6-1.0 g per kg of body weight, then use carbs to support training.',
      'Use the calculator link for exact calorie and macro numbers.'
    ],
    meals: [
      { meal: 'Breakfast', example: 'Eggs or protein oats with fruit', purpose: 'Start protein early.' },
      { meal: 'Lunch', example: 'Lean protein bowl with rice, potatoes or wrap', purpose: 'Keeps calories measurable.' },
      { meal: 'Snack', example: 'Greek yogurt, whey or cottage cheese', purpose: 'Adds protein without a large meal.' },
      { meal: 'Dinner', example: 'Lean protein, vegetables and one measured carb portion', purpose: 'Simple tracking and consistent portions.' }
    ],
    shoppingList: ['Eggs', 'Oats', 'Lean meat or tofu', 'Greek yogurt', 'Rice', 'Potatoes', 'Vegetables', 'Low-calorie sauces']
  },
  'High-Protein Food Library': {
    title: 'High-Protein Food Library',
    macroTargets: [
      'Protein: choose one protein anchor at every meal.',
      'Calories: keep high-protein snacks available so takeaways become less likely.',
      'Fibre: pair protein with fruit, vegetables, beans or whole grains.',
      'Preparation: keep two no-cook protein options ready at all times.'
    ],
    meals: [
      { meal: 'Breakfast', example: 'Protein oats or egg toast', purpose: 'Easy protein before the day gets busy.' },
      { meal: 'Lunch', example: 'Turkey mince, chicken, tuna or tofu bowl', purpose: 'Main protein anchor.' },
      { meal: 'Snack', example: 'Protein yogurt, whey, boiled eggs or cottage cheese', purpose: 'Fast option when cooking is unrealistic.' },
      { meal: 'Dinner', example: 'Fish, lean beef, chicken or tempeh with vegetables', purpose: 'Protein plus volume for fullness.' }
    ],
    shoppingList: ['Chicken', 'Tuna', 'Eggs', 'Greek yogurt', 'Cottage cheese', 'Tofu or tempeh', 'Beans', 'Whey protein']
  },
  'No-Tracking Portion Guide': {
    title: 'No-Tracking Portion Guide',
    macroTargets: [
      'Protein: 1-2 palm-sized portions per main meal.',
      'Carbs: 1 cupped-hand portion per meal, more around training if performance drops.',
      'Fats: 1 thumb-sized portion per meal.',
      'Vegetables or fruit: 1-2 fist-sized portions per meal.',
      'Adjust one portion at a time after 10-14 consistent days.'
    ],
    meals: [
      { meal: 'Breakfast', example: 'Eggs, toast and fruit', purpose: 'Uses hand portions without tracking.' },
      { meal: 'Lunch', example: 'Protein salad bowl with one carb portion', purpose: 'Easy visual structure.' },
      { meal: 'Snack', example: 'Greek yogurt and berries', purpose: 'Protein plus fibre.' },
      { meal: 'Dinner', example: 'Protein, vegetables, potatoes or rice and a small fat source', purpose: 'Balanced plate without weighing food.' }
    ],
    shoppingList: ['Eggs', 'Lean protein', 'Salad bags', 'Microwave rice', 'Potatoes', 'Frozen vegetables', 'Greek yogurt', 'Fruit']
  },
  'Three-Day Meal-Preparation Template': {
    title: 'Three-Day Meal-Preparation Template',
    macroTargets: [
      'Protein: prepare two cooked protein options every three days.',
      'Calories: repeat the same lunch or dinner for three days before changing it.',
      'Carbs: cook one base such as rice, pasta, potatoes or wraps.',
      'Backup meal: keep one low-effort meal ready for busy evenings.'
    ],
    meals: [
      { meal: 'Breakfast', example: 'Overnight oats with whey and berries', purpose: 'Prepared in advance.' },
      { meal: 'Lunch', example: 'Chicken rice box with vegetables and sauce', purpose: 'Repeatable meal-prep base.' },
      { meal: 'Snack', example: 'Protein yogurt pot and fruit', purpose: 'Easy portable protein.' },
      { meal: 'Dinner', example: 'Turkey mince chilli with rice or potatoes', purpose: 'Batch-cooked dinner.' }
    ],
    shoppingList: ['Chicken breast', 'Turkey mince', 'Rice', 'Oats', 'Whey protein', 'Greek yogurt', 'Frozen vegetables', 'Sauces and seasoning']
  },
  'Hunger and Cravings Management Guide': {
    title: 'Hunger and Cravings Management Guide',
    macroTargets: [
      'Protein: hit protein earlier in the day instead of saving most food for night.',
      'Fibre: add fruit, vegetables or beans to the meals that usually leave you hungry.',
      'Fluids: drink water before assuming hunger is a need for snacks.',
      'Planned snack: include one evening snack if cravings repeatedly break the plan.'
    ],
    meals: [
      { meal: 'Breakfast', example: 'Protein oats with berries', purpose: 'Protein and fibre for appetite control.' },
      { meal: 'Lunch', example: 'Large chicken salad bowl with potatoes or rice', purpose: 'High volume without random grazing.' },
      { meal: 'Snack', example: 'Greek yogurt, fruit and a small chocolate portion', purpose: 'Planned sweet option.' },
      { meal: 'Dinner', example: 'Lean protein stir-fry with vegetables and noodles', purpose: 'Filling dinner that still fits the goal.' }
    ],
    shoppingList: ['Oats', 'Berries', 'Chicken', 'Potatoes', 'Greek yogurt', 'Fruit', 'Lean protein', 'High-volume vegetables']
  },
  'Nutrition Foundations Guide': {
    title: 'Nutrition Foundations Guide',
    macroTargets: [
      'Protein: include protein at each meal before changing anything advanced.',
      'Calories: keep meal timing and portions consistent for two weeks.',
      'Hydration: aim for regular water intake across the day.',
      'Progress: use scale trend, photos, measurements, energy and training performance.'
    ],
    meals: [
      { meal: 'Breakfast', example: 'Eggs or yogurt with fruit', purpose: 'Simple protein-first start.' },
      { meal: 'Lunch', example: 'Protein wrap or bowl with vegetables', purpose: 'Reliable weekday meal.' },
      { meal: 'Snack', example: 'Fruit plus protein yogurt or shake', purpose: 'Controls long gaps between meals.' },
      { meal: 'Dinner', example: 'Lean protein, vegetables and rice or potatoes', purpose: 'Balanced default dinner.' }
    ],
    shoppingList: ['Eggs', 'Greek yogurt', 'Chicken or tofu', 'Wraps', 'Rice', 'Potatoes', 'Vegetables', 'Fruit']
  }
};

function getGoalTarget(answers) {
  if (answers.primary_goal === 'Build muscle') {
    return 'Start with a small calorie surplus, stable protein and progressive training performance.';
  }
  if (answers.primary_goal === 'Rebuild consistency') {
    return 'Start with consistent meals and repeatable sessions before pushing calories aggressively.';
  }
  if (answers.primary_goal === 'Become fitter and more energetic') {
    return 'Start near maintenance calories, increase protein and build training consistency first.';
  }
  return 'Start with a modest calorie deficit, high protein and enough carbs to train well.';
}

function buildStarterPlan(answers, recommendation) {
  const training = TRAINING_PLANS[recommendation.workoutTemplate] || TRAINING_PLANS['Two-Day Rebuild Programme'];
  const nutrition = NUTRITION_PLANS[recommendation.nutritionTemplate] || NUTRITION_PLANS['Nutrition Foundations Guide'];

  return {
    title: 'Your Practical Starter Plan',
    goalTarget: getGoalTarget(answers),
    training: {
      title: recommendation.workoutTemplate,
      weeklyStructure: training.weeklyStructure,
      sessions: training.sessions,
      libraryUrl: WORKOUT_LIBRARY_URL
    },
    nutrition: {
      title: nutrition.title,
      macroTargets: nutrition.macroTargets,
      meals: nutrition.meals,
      shoppingList: nutrition.shoppingList,
      calculatorUrl: CALCULATOR_URL,
      libraryUrl: NUTRITION_LIBRARY_URL
    },
    nextSteps: [
      'Follow this structure for the next 7 days before changing exercises or meals.',
      'Track body weight trend, waist measurement, energy and training performance.',
      'Use the macro calculator when you are ready to turn the ranges into exact targets.',
      'Contact Andre if you want this rebuilt around your exact schedule, food preferences and goal.'
    ]
  };
}

module.exports = {
  buildStarterPlan
};
