(function initGarciaNutritionLibrary() {
  'use strict';

  const foodLibrary = [
    { name: 'Chicken breast', category: 'lean_proteins', serving: '120g cooked', calories: 198, protein: 37, carbs: 0, fats: 4, tags: ['fat_loss', 'muscle_gain', 'quick', 'meal_prep', 'high_protein', 'budget', 'busy_professional'] },
    { name: 'Turkey mince 5%', category: 'lean_proteins', serving: '120g cooked', calories: 205, protein: 30, carbs: 0, fats: 9, tags: ['fat_loss', 'muscle_gain', 'meal_prep', 'high_protein', 'budget'] },
    { name: 'White fish', category: 'lean_proteins', serving: '150g cooked', calories: 165, protein: 34, carbs: 0, fats: 2, tags: ['fat_loss', 'high_protein', 'quick', 'pescatarian'] },
    { name: 'Tuna', category: 'lean_proteins', serving: '1 can drained', calories: 132, protein: 29, carbs: 0, fats: 1, tags: ['fat_loss', 'high_protein', 'quick', 'meal_prep', 'pescatarian', 'budget', 'busy_professional'] },
    { name: 'Egg whites', category: 'lean_proteins', serving: '200ml', calories: 98, protein: 21, carbs: 1, fats: 0, tags: ['fat_loss', 'high_protein', 'quick', 'budget'] },
    { name: 'Greek yogurt 0%', category: 'lean_proteins', serving: '200g', calories: 114, protein: 20, carbs: 8, fats: 0, tags: ['fat_loss', 'vegetarian', 'high_protein', 'quick', 'busy_professional'] },
    { name: 'Cottage cheese', category: 'lean_proteins', serving: '200g', calories: 166, protein: 24, carbs: 7, fats: 4, tags: ['fat_loss', 'vegetarian', 'high_protein', 'quick', 'budget'] },
    { name: 'Whey protein', category: 'lean_proteins', serving: '1 scoop 30g', calories: 120, protein: 24, carbs: 3, fats: 2, tags: ['fat_loss', 'muscle_gain', 'high_protein', 'quick', 'busy_professional'] },

    { name: 'Salmon', category: 'higher_fat_proteins', serving: '150g cooked', calories: 312, protein: 33, carbs: 0, fats: 20, tags: ['muscle_gain', 'pescatarian', 'high_protein', 'performance'] },
    { name: 'Whole eggs', category: 'higher_fat_proteins', serving: '2 large eggs', calories: 156, protein: 13, carbs: 1, fats: 11, tags: ['muscle_gain', 'vegetarian', 'high_protein', 'budget'] },
    { name: 'Lean beef', category: 'higher_fat_proteins', serving: '120g cooked', calories: 250, protein: 31, carbs: 0, fats: 14, tags: ['muscle_gain', 'high_protein', 'meal_prep'] },
    { name: 'Chicken thighs', category: 'higher_fat_proteins', serving: '150g cooked', calories: 312, protein: 32, carbs: 0, fats: 20, tags: ['muscle_gain', 'meal_prep', 'budget'] },
    { name: 'Mackerel', category: 'higher_fat_proteins', serving: '130g cooked', calories: 300, protein: 29, carbs: 0, fats: 20, tags: ['pescatarian', 'performance', 'high_protein'] },

    { name: 'Tofu', category: 'vegetarian_proteins', serving: '150g', calories: 170, protein: 17, carbs: 4, fats: 10, tags: ['vegetarian', 'fat_loss', 'meal_prep'] },
    { name: 'Tempeh', category: 'vegetarian_proteins', serving: '120g', calories: 230, protein: 24, carbs: 13, fats: 11, tags: ['vegetarian', 'muscle_gain', 'high_protein'] },
    { name: 'Lentils', category: 'vegetarian_proteins', serving: '200g cooked', calories: 232, protein: 18, carbs: 40, fats: 1, tags: ['vegetarian', 'high_fiber', 'budget', 'meal_prep'] },
    { name: 'Chickpeas', category: 'vegetarian_proteins', serving: '160g cooked', calories: 262, protein: 14, carbs: 44, fats: 4, tags: ['vegetarian', 'high_fiber', 'budget'] },
    { name: 'Black beans', category: 'vegetarian_proteins', serving: '170g cooked', calories: 227, protein: 15, carbs: 41, fats: 1, tags: ['vegetarian', 'high_fiber', 'budget', 'meal_prep'] },
    { name: 'Edamame', category: 'vegetarian_proteins', serving: '150g', calories: 188, protein: 17, carbs: 14, fats: 8, tags: ['vegetarian', 'high_protein', 'high_fiber', 'quick'] },
    { name: 'Seitan', category: 'vegetarian_proteins', serving: '120g', calories: 170, protein: 31, carbs: 8, fats: 2, tags: ['vegetarian', 'high_protein', 'muscle_gain'] },

    { name: 'Rice', category: 'carbohydrates', serving: '180g cooked', calories: 235, protein: 4, carbs: 52, fats: 1, tags: ['fat_loss', 'muscle_gain', 'meal_prep', 'budget', 'busy_professional'] },
    { name: 'Potatoes', category: 'carbohydrates', serving: '300g baked', calories: 240, protein: 7, carbs: 53, fats: 0, tags: ['fat_loss', 'high_fiber', 'budget'] },
    { name: 'Sweet potatoes', category: 'carbohydrates', serving: '250g baked', calories: 225, protein: 4, carbs: 53, fats: 0, tags: ['fat_loss', 'high_fiber', 'meal_prep'] },
    { name: 'Oats', category: 'carbohydrates', serving: '60g dry', calories: 228, protein: 8, carbs: 38, fats: 4, tags: ['muscle_gain', 'high_fiber', 'budget', 'busy_professional'] },
    { name: 'Wholegrain bread', category: 'carbohydrates', serving: '2 slices', calories: 190, protein: 8, carbs: 34, fats: 2, tags: ['fat_loss', 'quick', 'budget'] },
    { name: 'Pasta', category: 'carbohydrates', serving: '180g cooked', calories: 281, protein: 10, carbs: 56, fats: 2, tags: ['muscle_gain', 'meal_prep', 'budget'] },
    { name: 'Couscous', category: 'carbohydrates', serving: '180g cooked', calories: 201, protein: 7, carbs: 41, fats: 0, tags: ['fat_loss', 'quick', 'meal_prep'] },
    { name: 'Quinoa', category: 'carbohydrates', serving: '180g cooked', calories: 220, protein: 8, carbs: 39, fats: 4, tags: ['vegetarian', 'high_fiber', 'meal_prep'] },
    { name: 'Wraps', category: 'carbohydrates', serving: '1 medium wrap', calories: 145, protein: 5, carbs: 24, fats: 3, tags: ['quick', 'busy_professional'] },
    { name: 'Bagels', category: 'carbohydrates', serving: '1 bagel', calories: 250, protein: 9, carbs: 50, fats: 2, tags: ['muscle_gain', 'performance', 'quick'] },

    { name: 'Banana', category: 'fruits', serving: '1 medium', calories: 105, protein: 1, carbs: 27, fats: 0, tags: ['quick', 'performance', 'budget'] },
    { name: 'Apple', category: 'fruits', serving: '1 medium', calories: 95, protein: 0, carbs: 25, fats: 0, tags: ['fat_loss', 'quick', 'high_fiber', 'budget'] },
    { name: 'Berries', category: 'fruits', serving: '150g', calories: 65, protein: 1, carbs: 14, fats: 0, tags: ['fat_loss', 'high_fiber', 'quick'] },
    { name: 'Orange', category: 'fruits', serving: '1 medium', calories: 62, protein: 1, carbs: 15, fats: 0, tags: ['fat_loss', 'high_fiber'] },
    { name: 'Kiwi', category: 'fruits', serving: '2 medium', calories: 90, protein: 2, carbs: 22, fats: 1, tags: ['fat_loss', 'high_fiber'] },
    { name: 'Grapes', category: 'fruits', serving: '150g', calories: 104, protein: 1, carbs: 27, fats: 0, tags: ['quick', 'performance'] },
    { name: 'Pineapple', category: 'fruits', serving: '180g', calories: 90, protein: 1, carbs: 24, fats: 0, tags: ['quick', 'performance'] },

    { name: 'Broccoli', category: 'vegetables', serving: '200g', calories: 70, protein: 6, carbs: 13, fats: 1, tags: ['fat_loss', 'high_fiber', 'volume_food'] },
    { name: 'Spinach', category: 'vegetables', serving: '120g', calories: 28, protein: 3, carbs: 4, fats: 0, tags: ['fat_loss', 'high_fiber', 'volume_food'] },
    { name: 'Mixed salad', category: 'vegetables', serving: '180g', calories: 30, protein: 2, carbs: 5, fats: 0, tags: ['fat_loss', 'volume_food', 'quick'] },
    { name: 'Peppers', category: 'vegetables', serving: '150g', calories: 45, protein: 1, carbs: 9, fats: 0, tags: ['fat_loss', 'high_fiber', 'meal_prep'] },
    { name: 'Courgette', category: 'vegetables', serving: '200g', calories: 36, protein: 3, carbs: 6, fats: 1, tags: ['fat_loss', 'volume_food'] },
    { name: 'Mushrooms', category: 'vegetables', serving: '180g', calories: 40, protein: 6, carbs: 6, fats: 1, tags: ['fat_loss', 'volume_food', 'meal_prep'] },
    { name: 'Carrots', category: 'vegetables', serving: '150g', calories: 62, protein: 1, carbs: 14, fats: 0, tags: ['high_fiber', 'budget'] },
    { name: 'Green beans', category: 'vegetables', serving: '180g', calories: 56, protein: 3, carbs: 12, fats: 0, tags: ['high_fiber', 'fat_loss', 'volume_food'] },
    { name: 'Cauliflower', category: 'vegetables', serving: '220g', calories: 55, protein: 4, carbs: 11, fats: 0, tags: ['fat_loss', 'volume_food'] },
    { name: 'Tomatoes', category: 'vegetables', serving: '180g', calories: 32, protein: 2, carbs: 7, fats: 0, tags: ['fat_loss', 'quick'] },

    { name: 'Olive oil', category: 'healthy_fats', serving: '1 tbsp', calories: 119, protein: 0, carbs: 0, fats: 14, tags: ['fat_loss', 'muscle_gain', 'meal_prep'] },
    { name: 'Avocado', category: 'healthy_fats', serving: '100g', calories: 160, protein: 2, carbs: 9, fats: 15, tags: ['fat_loss', 'high_fiber'] },
    { name: 'Peanut butter', category: 'healthy_fats', serving: '20g', calories: 120, protein: 5, carbs: 4, fats: 10, tags: ['muscle_gain', 'quick', 'busy_professional'] },
    { name: 'Almonds', category: 'healthy_fats', serving: '25g', calories: 145, protein: 5, carbs: 5, fats: 13, tags: ['muscle_gain', 'quick'] },
    { name: 'Cashews', category: 'healthy_fats', serving: '25g', calories: 138, protein: 5, carbs: 8, fats: 11, tags: ['muscle_gain', 'quick'] },
    { name: 'Chia seeds', category: 'healthy_fats', serving: '20g', calories: 98, protein: 3, carbs: 8, fats: 6, tags: ['high_fiber', 'fat_loss', 'vegetarian'] },
    { name: 'Flaxseed', category: 'healthy_fats', serving: '15g', calories: 80, protein: 3, carbs: 4, fats: 6, tags: ['high_fiber', 'vegetarian'] },

    { name: 'Protein yogurt', category: 'snacks', serving: '1 pot 180g', calories: 135, protein: 20, carbs: 12, fats: 0, tags: ['fat_loss', 'quick', 'high_protein', 'busy_professional'] },
    { name: 'Protein shake', category: 'snacks', serving: '1 serving', calories: 120, protein: 24, carbs: 3, fats: 2, tags: ['fat_loss', 'muscle_gain', 'quick', 'high_protein'] },
    { name: 'Rice cakes', category: 'snacks', serving: '3 cakes', calories: 105, protein: 2, carbs: 24, fats: 1, tags: ['quick', 'performance'] },
    { name: 'Fruit + yogurt bowl', category: 'snacks', serving: '250g bowl', calories: 210, protein: 18, carbs: 26, fats: 3, tags: ['fat_loss', 'high_protein', 'quick'] },
    { name: 'Cottage cheese bowl', category: 'snacks', serving: '220g bowl', calories: 210, protein: 28, carbs: 11, fats: 5, tags: ['high_protein', 'fat_loss'] },
    { name: 'Boiled eggs', category: 'snacks', serving: '2 eggs', calories: 156, protein: 13, carbs: 1, fats: 11, tags: ['quick', 'high_protein'] },
    { name: 'Tuna rice cakes', category: 'snacks', serving: '1 snack plate', calories: 250, protein: 30, carbs: 24, fats: 4, tags: ['high_protein', 'busy_professional'] },
    { name: 'Hummus and veg', category: 'snacks', serving: '180g', calories: 220, protein: 8, carbs: 21, fats: 11, tags: ['vegetarian', 'high_fiber', 'quick'] },

    { name: 'Bagel + whey shake', category: 'pre_workout', serving: '1 set', calories: 370, protein: 33, carbs: 53, fats: 3, tags: ['performance', 'muscle_gain', 'quick'] },
    { name: 'Banana + rice cakes + yogurt', category: 'pre_workout', serving: '1 set', calories: 320, protein: 18, carbs: 56, fats: 2, tags: ['performance', 'quick'] },
    { name: 'Chicken + rice bowl', category: 'post_workout', serving: '1 bowl', calories: 540, protein: 45, carbs: 66, fats: 11, tags: ['muscle_gain', 'performance', 'meal_prep'] },
    { name: 'Tofu + noodles + veg', category: 'post_workout', serving: '1 bowl', calories: 520, protein: 32, carbs: 63, fats: 14, tags: ['vegetarian', 'performance', 'meal_prep'] },

    { name: 'Microwave rice cups', category: 'simple_meal_prep_foods', serving: '1 cup', calories: 210, protein: 4, carbs: 45, fats: 1, tags: ['busy_professional', 'quick', 'meal_prep'] },
    { name: 'Pre-cooked chicken packs', category: 'simple_meal_prep_foods', serving: '150g', calories: 210, protein: 38, carbs: 2, fats: 5, tags: ['busy_professional', 'quick', 'high_protein'] },
    { name: 'Frozen veg mix', category: 'simple_meal_prep_foods', serving: '250g', calories: 95, protein: 6, carbs: 16, fats: 1, tags: ['busy_professional', 'high_fiber', 'meal_prep'] },
    { name: 'Potato wedges air-fried', category: 'low_calorie_volume_foods', serving: '250g', calories: 210, protein: 5, carbs: 44, fats: 2, tags: ['fat_loss', 'volume_food', 'high_fiber'] },
    { name: 'Cauliflower rice', category: 'low_calorie_volume_foods', serving: '250g', calories: 65, protein: 5, carbs: 12, fats: 1, tags: ['fat_loss', 'volume_food'] },
    { name: 'Zucchini noodles', category: 'low_calorie_volume_foods', serving: '250g', calories: 42, protein: 3, carbs: 8, fats: 1, tags: ['fat_loss', 'volume_food', 'quick'] }
  ];

  const templateLibrary = [
    {
      id: 'female-fat-loss-1500',
      title: 'Female Fat Loss - 1500 kcal High Protein',
      goal: 'fat_loss',
      audienceTags: ['women', 'fat_loss', 'busy_professional'],
      calorieRange: [1400, 1600],
      macroEmphasis: 'High protein, high volume, controlled fats',
      mealFrequency: 4,
      sampleDay: [
        { meal: 'Breakfast', example: 'Greek yogurt 0%, berries, oats, chia', purpose: 'High-protein and fiber start' },
        { meal: 'Lunch', example: 'Chicken breast, rice, mixed salad, olive oil', purpose: 'Lean protein with controlled carbs' },
        { meal: 'Snack', example: 'Protein shake and apple', purpose: 'Easy protein top-up' },
        { meal: 'Dinner', example: 'White fish, potatoes, broccoli', purpose: 'Volume dinner without heavy calories' }
      ],
      swaps: ['Chicken -> turkey mince, tuna, tofu', 'Rice -> potatoes, quinoa, wraps'],
      shoppingList: ['Greek yogurt', 'berries', 'oats', 'chicken breast', 'rice', 'mixed salad', 'white fish', 'potatoes', 'broccoli'],
      coachNote: 'The target is not minimal intake. It is repeatable structure with weekly data.',
      bestFor: 'Women cutting body fat with manageable hunger.',
      notIdealFor: 'Very high training output without calorie adjustments.'
    },
    {
      id: 'female-fat-loss-1800-training',
      title: 'Female Fat Loss - 1800 kcal Training Days',
      goal: 'fat_loss',
      audienceTags: ['women', 'fat_loss', 'performance'],
      calorieRange: [1700, 1900],
      macroEmphasis: 'Carbs around training, high protein baseline',
      mealFrequency: 4,
      sampleDay: [
        { meal: 'Breakfast', example: 'Oats, whey, banana, peanut butter', purpose: 'Fuel morning training' },
        { meal: 'Lunch', example: 'Turkey mince, couscous, peppers', purpose: 'Recovery carbs + protein' },
        { meal: 'Snack', example: 'Protein yogurt and kiwi', purpose: 'Satiety and micronutrients' },
        { meal: 'Dinner', example: 'Salmon, potatoes, spinach salad', purpose: 'Omega-3 and evening recovery' }
      ],
      swaps: ['Turkey mince -> chicken or tofu', 'Couscous -> rice or quinoa'],
      shoppingList: ['oats', 'whey', 'banana', 'turkey mince', 'couscous', 'protein yogurt', 'salmon', 'potatoes', 'spinach'],
      coachNote: 'Keep harder sessions supported with carbs instead of chasing low numbers every day.',
      bestFor: 'Women training 3-5 sessions weekly.',
      notIdealFor: 'People who skip training most weeks.'
    },
    {
      id: 'female-recomp-2000',
      title: 'Female Recomposition - 2000 kcal',
      goal: 'recomposition',
      audienceTags: ['women', 'recomposition', 'performance'],
      calorieRange: [1900, 2100],
      macroEmphasis: 'High protein with stable training carbs',
      mealFrequency: 4,
      sampleDay: [
        { meal: 'Breakfast', example: 'Eggs, wholegrain toast, fruit', purpose: 'Protein + controlled carbs' },
        { meal: 'Lunch', example: 'Chicken wrap, side salad, yogurt', purpose: 'Portable meal for busy days' },
        { meal: 'Snack', example: 'Cottage cheese bowl with berries', purpose: 'Lean protein between meals' },
        { meal: 'Dinner', example: 'Lean beef stir-fry, rice, vegetables', purpose: 'Performance and recovery support' }
      ],
      swaps: ['Lean beef -> tofu/tempeh', 'Wrap -> rice bowl'],
      shoppingList: ['eggs', 'toast', 'chicken', 'wraps', 'salad', 'cottage cheese', 'berries', 'lean beef', 'rice', 'veg mix'],
      coachNote: 'Progress is measured by measurements, photos, and strength, not just scale weight.',
      bestFor: 'Women lifting regularly who want shape and performance.',
      notIdealFor: 'Those expecting fast scale drops.'
    },
    {
      id: 'female-lean-gain-2200',
      title: 'Female Lean Muscle Gain - 2200 kcal',
      goal: 'muscle_gain',
      audienceTags: ['women', 'muscle_gain', 'performance'],
      calorieRange: [2100, 2300],
      macroEmphasis: 'Moderate surplus, protein spread over five meals',
      mealFrequency: 5,
      sampleDay: [
        { meal: 'Breakfast', example: 'Greek yogurt, granola, banana', purpose: 'Calorie start without digestive load' },
        { meal: 'Meal 2', example: 'Protein oats and berries', purpose: 'Protein + carb refill' },
        { meal: 'Lunch', example: 'Chicken thighs, rice, mixed veg', purpose: 'Dense recovery meal' },
        { meal: 'Pre/Post snack', example: 'Bagel and whey shake', purpose: 'Training energy and recovery' },
        { meal: 'Dinner', example: 'Salmon, quinoa, green beans', purpose: 'Evening protein and omega-3s' }
      ],
      swaps: ['Chicken thighs -> lean beef or tofu', 'Quinoa -> pasta or potatoes'],
      shoppingList: ['greek yogurt', 'granola', 'oats', 'chicken thighs', 'rice', 'bagels', 'whey', 'salmon', 'quinoa', 'green beans'],
      coachNote: 'Lean gain is controlled. Track weekly rate and keep digestion comfortable.',
      bestFor: 'Women wanting strength and glute-focused progression.',
      notIdealFor: 'Users who dislike multiple meals.'
    },
    {
      id: 'male-fat-loss-1900',
      title: 'Male Fat Loss - 1900 kcal High Protein',
      goal: 'fat_loss',
      audienceTags: ['men', 'fat_loss', 'busy_professional'],
      calorieRange: [1800, 2050],
      macroEmphasis: 'High protein, appetite control, repeatable meals',
      mealFrequency: 4,
      sampleDay: [
        { meal: 'Breakfast', example: 'Egg whites + 2 whole eggs, toast, tomatoes', purpose: 'Protein-led breakfast' },
        { meal: 'Lunch', example: 'Chicken breast, potatoes, salad', purpose: 'Large-volume lunch' },
        { meal: 'Snack', example: 'Protein yogurt and fruit', purpose: 'Control evening hunger' },
        { meal: 'Dinner', example: 'Lean beef mince bowl with vegetables', purpose: 'High satiety meal' }
      ],
      swaps: ['Lean beef -> turkey mince', 'Potatoes -> rice'],
      shoppingList: ['egg whites', 'eggs', 'toast', 'chicken breast', 'potatoes', 'salad', 'protein yogurt', 'lean beef', 'vegetables'],
      coachNote: 'The simplest plan wins for desk-job consistency.',
      bestFor: 'Men cutting while working office hours.',
      notIdealFor: 'Athlete-level daily volume.'
    },
    {
      id: 'male-fat-loss-2200-active',
      title: 'Male Fat Loss - 2200 kcal Active Lifestyle',
      goal: 'fat_loss',
      audienceTags: ['men', 'fat_loss', 'performance'],
      calorieRange: [2100, 2350],
      macroEmphasis: 'Sustainable deficit with training carbs',
      mealFrequency: 4,
      sampleDay: [
        { meal: 'Breakfast', example: 'Overnight oats with whey and berries', purpose: 'Quick prep + high protein' },
        { meal: 'Lunch', example: 'Turkey mince pasta with vegetables', purpose: 'Fuel active day' },
        { meal: 'Snack', example: 'Cottage cheese, kiwi, almonds', purpose: 'Protein and micronutrients' },
        { meal: 'Dinner', example: 'White fish, rice, green beans, olive oil', purpose: 'Balanced recovery dinner' }
      ],
      swaps: ['Pasta -> rice or couscous', 'White fish -> tuna or salmon'],
      shoppingList: ['oats', 'whey', 'berries', 'turkey mince', 'pasta', 'cottage cheese', 'kiwi', 'white fish', 'rice', 'green beans'],
      coachNote: 'Keep deficit mild enough to keep training quality high.',
      bestFor: 'Men training 3-5 days with active routines.',
      notIdealFor: 'Rapid-cut expectations.'
    },
    {
      id: 'male-recomp-2500',
      title: 'Male Recomposition - 2500 kcal',
      goal: 'recomposition',
      audienceTags: ['men', 'recomposition', 'performance'],
      calorieRange: [2400, 2600],
      macroEmphasis: 'Protein high, carbs periodized around sessions',
      mealFrequency: 4,
      sampleDay: [
        { meal: 'Breakfast', example: 'Greek yogurt bowl with oats and banana', purpose: 'Training fuel' },
        { meal: 'Lunch', example: 'Chicken rice bowl with vegetables', purpose: 'Core performance meal' },
        { meal: 'Snack', example: 'Whey shake and rice cakes', purpose: 'Fast digesting pre/post option' },
        { meal: 'Dinner', example: 'Lean beef, potatoes, spinach', purpose: 'Strength retention support' }
      ],
      swaps: ['Lean beef -> salmon', 'Potatoes -> quinoa'],
      shoppingList: ['greek yogurt', 'oats', 'banana', 'chicken', 'rice', 'whey', 'rice cakes', 'lean beef', 'potatoes', 'spinach'],
      coachNote: 'Use weekly averages and performance trends before changing calories.',
      bestFor: 'Lifters wanting better body composition with stable strength.',
      notIdealFor: 'Users who avoid resistance training.'
    },
    {
      id: 'male-lean-gain-2800',
      title: 'Male Lean Muscle Gain - 2800 kcal',
      goal: 'muscle_gain',
      audienceTags: ['men', 'muscle_gain', 'performance'],
      calorieRange: [2700, 2950],
      macroEmphasis: 'Controlled surplus with high carbs',
      mealFrequency: 5,
      sampleDay: [
        { meal: 'Breakfast', example: 'Eggs, bagel, fruit', purpose: 'High energy breakfast' },
        { meal: 'Meal 2', example: 'Protein yogurt + granola', purpose: 'Add calories without heavy prep' },
        { meal: 'Lunch', example: 'Chicken thighs, rice, vegetables', purpose: 'Dense lunch for progression' },
        { meal: 'Pre/Post', example: 'Whey shake + banana + rice cakes', purpose: 'Session fueling' },
        { meal: 'Dinner', example: 'Salmon, pasta, salad', purpose: 'Recovery and omega-3 intake' }
      ],
      swaps: ['Chicken thighs -> lean beef', 'Pasta -> potatoes'],
      shoppingList: ['eggs', 'bagels', 'fruit', 'protein yogurt', 'granola', 'chicken thighs', 'rice', 'whey', 'banana', 'salmon', 'pasta'],
      coachNote: 'Aim for small weekly gain with strong gym performance.',
      bestFor: 'Men chasing lean mass with regular training.',
      notIdealFor: 'Users not willing to track intake weekly.'
    },
    {
      id: 'hardgainer-3200',
      title: 'Hardgainer Muscle Gain - 3200 kcal',
      goal: 'muscle_gain',
      audienceTags: ['muscle_gain', 'performance', 'high_activity'],
      calorieRange: [3050, 3400],
      macroEmphasis: 'Calorie density from quality foods',
      mealFrequency: 5,
      sampleDay: [
        { meal: 'Breakfast', example: 'Oats, whey, whole milk, banana, peanut butter', purpose: 'Dense liquid-friendly calories' },
        { meal: 'Meal 2', example: 'Bagel, eggs, avocado', purpose: 'Mid-morning energy' },
        { meal: 'Lunch', example: 'Lean beef pasta with olive oil', purpose: 'Big recovery meal' },
        { meal: 'Snack', example: 'Greek yogurt, granola, honey', purpose: 'Easy additional calories' },
        { meal: 'Dinner', example: 'Salmon, rice, vegetables, nuts', purpose: 'Final calorie push with fats' }
      ],
      swaps: ['Beef pasta -> chicken rice + olive oil', 'Whole milk -> lactose-free alternative'],
      shoppingList: ['oats', 'whey', 'milk', 'banana', 'peanut butter', 'bagels', 'eggs', 'beef', 'pasta', 'greek yogurt', 'salmon', 'rice'],
      coachNote: 'If appetite is low, use liquid calories and lower-volume options.',
      bestFor: 'High activity users struggling to gain weight.',
      notIdealFor: 'Users currently trying to cut.'
    },
    {
      id: 'aggressive-fat-loss-short-phase',
      title: 'Aggressive Fat Loss - Short Phase',
      goal: 'aggressive_fat_loss',
      audienceTags: ['fat_loss', 'advanced', 'high_protein'],
      calorieRange: [1300, 2200],
      macroEmphasis: 'Very high protein, strict food quality',
      mealFrequency: 4,
      sampleDay: [
        { meal: 'Breakfast', example: 'Egg white omelette, berries', purpose: 'Protein heavy low-calorie start' },
        { meal: 'Lunch', example: 'Chicken salad bowl with potatoes', purpose: 'High satiety lunch' },
        { meal: 'Snack', example: 'Protein shake and cucumber sticks', purpose: 'Low-calorie protein hit' },
        { meal: 'Dinner', example: 'White fish, cauliflower rice, mixed vegetables', purpose: 'Volume dinner with controlled carbs' }
      ],
      swaps: ['White fish -> tuna or tofu', 'Potatoes -> extra vegetables for short blocks'],
      shoppingList: ['egg whites', 'berries', 'chicken', 'salad', 'potatoes', 'protein powder', 'white fish', 'cauliflower rice', 'vegetables'],
      coachNote: 'Short phase only. Monitor energy, recovery, mood, and training quality closely.',
      bestFor: 'Experienced users in time-limited cutting blocks.',
      notIdealFor: 'Beginners or high-stress periods.'
    },
    {
      id: 'beginner-fat-loss-plate-method',
      title: 'Beginner Fat Loss - Simple Plate Method',
      goal: 'fat_loss',
      audienceTags: ['beginner', 'fat_loss'],
      calorieRange: [1500, 2400],
      macroEmphasis: 'Portion method without heavy tracking',
      mealFrequency: 3,
      sampleDay: [
        { meal: 'Meal 1', example: 'Protein source + fruit + oats', purpose: 'Simple base meal' },
        { meal: 'Meal 2', example: 'Half plate vegetables, quarter protein, quarter carbs', purpose: 'Visual plate control' },
        { meal: 'Meal 3', example: 'Protein + potatoes/rice + salad', purpose: 'Repeatable dinner structure' }
      ],
      swaps: ['Any lean protein swap is valid', 'Carb source can rotate daily'],
      shoppingList: ['lean proteins', 'fruit', 'oats', 'vegetables', 'rice/potatoes', 'salad ingredients'],
      coachNote: 'Consistency beats complexity in the first 8-12 weeks.',
      bestFor: 'New clients with no tracking experience.',
      notIdealFor: 'Detailed macro tracking preferences.'
    },
    {
      id: 'busy-pro-3-meal',
      title: 'Busy Professional - 3 Meal Structure',
      goal: 'fat_loss',
      audienceTags: ['busy_professional', 'fat_loss', 'maintenance'],
      calorieRange: [1700, 2600],
      macroEmphasis: 'Simple repeat meals for workdays',
      mealFrequency: 3,
      sampleDay: [
        { meal: 'Breakfast', example: 'Protein oats jar prepared night before', purpose: 'Zero-friction morning meal' },
        { meal: 'Lunch', example: 'Meal-prep chicken rice box with veg', purpose: 'Reliable office lunch' },
        { meal: 'Dinner', example: 'Quick stir-fry with lean protein and wrap/rice', purpose: 'Practical end-of-day meal' }
      ],
      swaps: ['Chicken boxes -> tuna pasta boxes', 'Stir-fry -> air-fryer plate'],
      shoppingList: ['oats', 'protein powder', 'chicken', 'rice', 'frozen veg', 'wraps', 'stir-fry sauces'],
      coachNote: 'Repeat your best meals Monday to Friday, then adjust portions on social days.',
      bestFor: 'Busy clients 30-45 with office schedules.',
      notIdealFor: 'People who prefer frequent snacking.'
    },
    {
      id: 'busy-pro-meal-prep-week',
      title: 'Busy Professional - Meal Prep Week',
      goal: 'maintenance',
      audienceTags: ['busy_professional', 'meal_prep'],
      calorieRange: [1800, 2900],
      macroEmphasis: 'Batch-cooked proteins, carbs, and vegetables',
      mealFrequency: 4,
      sampleDay: [
        { meal: 'Breakfast', example: 'Greek yogurt pots with fruit', purpose: 'Fast setup breakfast' },
        { meal: 'Lunch', example: 'Turkey mince couscous prep container', purpose: 'Batch meal for consistency' },
        { meal: 'Snack', example: 'Protein shake + nuts', purpose: 'Portable energy' },
        { meal: 'Dinner', example: 'Salmon tray bake with potatoes and veg', purpose: 'One-pan dinner strategy' }
      ],
      swaps: ['Turkey mince -> lentils + tofu', 'Salmon tray bake -> chicken tray bake'],
      shoppingList: ['greek yogurt', 'fruit', 'turkey mince', 'couscous', 'protein powder', 'nuts', 'salmon', 'potatoes', 'vegetables'],
      coachNote: 'One prep block per week removes weekday decision fatigue.',
      bestFor: 'Office workers with low weekday bandwidth.',
      notIdealFor: 'People who avoid leftovers.'
    },
    {
      id: 'vegetarian-fat-loss-high-protein',
      title: 'Vegetarian Fat Loss - High Protein',
      goal: 'fat_loss',
      audienceTags: ['vegetarian', 'fat_loss', 'high_protein'],
      calorieRange: [1500, 2200],
      macroEmphasis: 'Protein quality + fiber density',
      mealFrequency: 4,
      sampleDay: [
        { meal: 'Breakfast', example: 'Skyr/Greek yogurt, oats, berries', purpose: 'High protein and fiber' },
        { meal: 'Lunch', example: 'Tofu quinoa bowl with mixed veg', purpose: 'Complete meal profile' },
        { meal: 'Snack', example: 'Edamame and fruit', purpose: 'Portable protein/fiber snack' },
        { meal: 'Dinner', example: 'Lentil pasta with tomato sauce and salad', purpose: 'Satiety-focused evening meal' }
      ],
      swaps: ['Tofu -> tempeh/seitan', 'Lentil pasta -> chickpea pasta'],
      shoppingList: ['greek yogurt', 'oats', 'berries', 'tofu', 'quinoa', 'edamame', 'fruit', 'lentil pasta', 'tomato sauce', 'salad'],
      coachNote: 'Distribute protein across each meal to support adherence and recovery.',
      bestFor: 'Vegetarians targeting fat loss without low-protein intake.',
      notIdealFor: 'Strict vegan plans requiring separate customization.'
    },
    {
      id: 'vegetarian-muscle-gain',
      title: 'Vegetarian Muscle Gain',
      goal: 'muscle_gain',
      audienceTags: ['vegetarian', 'muscle_gain', 'performance'],
      calorieRange: [2200, 3200],
      macroEmphasis: 'Higher calories with complete protein pairings',
      mealFrequency: 5,
      sampleDay: [
        { meal: 'Breakfast', example: 'Protein oats with milk and banana', purpose: 'Dense and digestible calories' },
        { meal: 'Meal 2', example: 'Greek yogurt + granola', purpose: 'Quick calorie increase' },
        { meal: 'Lunch', example: 'Tempeh rice bowl with avocado', purpose: 'Protein + fats + carbs' },
        { meal: 'Snack', example: 'Seitan wrap and fruit', purpose: 'Portable meal for busy schedules' },
        { meal: 'Dinner', example: 'Tofu stir-fry noodles + vegetables', purpose: 'High-energy recovery meal' }
      ],
      swaps: ['Tempeh -> tofu + lentils', 'Noodles -> couscous/pasta'],
      shoppingList: ['oats', 'protein powder', 'milk', 'banana', 'greek yogurt', 'granola', 'tempeh', 'rice', 'avocado', 'seitan', 'wraps', 'tofu', 'noodles'],
      coachNote: 'Use mixed sources to hit leucine-rich protein totals daily.',
      bestFor: 'Vegetarian lifters pushing lean gain phases.',
      notIdealFor: 'Users unwilling to eat 4-5 times daily.'
    },
    {
      id: 'pescatarian-fat-loss',
      title: 'Pescatarian Fat Loss',
      goal: 'fat_loss',
      audienceTags: ['pescatarian', 'fat_loss', 'mediterranean'],
      calorieRange: [1600, 2400],
      macroEmphasis: 'Lean fish proteins, high-volume produce',
      mealFrequency: 4,
      sampleDay: [
        { meal: 'Breakfast', example: 'Greek yogurt, chia, berries', purpose: 'Protein/fiber breakfast' },
        { meal: 'Lunch', example: 'Tuna potato salad with olive oil dressing', purpose: 'Satiating lunch' },
        { meal: 'Snack', example: 'Protein shake and orange', purpose: 'Easy protein hit' },
        { meal: 'Dinner', example: 'White fish, rice, vegetables', purpose: 'Low-fat protein and controlled carbs' }
      ],
      swaps: ['White fish -> prawns/cod/tuna', 'Potatoes -> quinoa'],
      shoppingList: ['greek yogurt', 'chia', 'berries', 'tuna', 'potatoes', 'olive oil', 'protein powder', 'oranges', 'white fish', 'rice', 'vegetables'],
      coachNote: 'Prioritize protein per meal and keep oils measured.',
      bestFor: 'Pescatarian clients aiming for clean fat loss.',
      notIdealFor: 'Those avoiding seafood variety.'
    },
    {
      id: 'pescatarian-performance',
      title: 'Pescatarian Performance',
      goal: 'performance',
      audienceTags: ['pescatarian', 'performance', 'high_activity'],
      calorieRange: [2200, 3300],
      macroEmphasis: 'Higher carbs around sessions, omega-3 support',
      mealFrequency: 5,
      sampleDay: [
        { meal: 'Breakfast', example: 'Oats, whey, banana', purpose: 'Training fuel' },
        { meal: 'Meal 2', example: 'Greek yogurt + fruit + granola', purpose: 'Session support snack' },
        { meal: 'Lunch', example: 'Salmon rice bowl with vegetables', purpose: 'Recovery nutrition' },
        { meal: 'Pre/Post', example: 'Bagel + tuna + fruit', purpose: 'Easy performance carbs' },
        { meal: 'Dinner', example: 'Mackerel, potatoes, spinach', purpose: 'Final protein and micronutrients' }
      ],
      swaps: ['Mackerel -> white fish + olive oil', 'Bagel -> wraps'],
      shoppingList: ['oats', 'whey', 'banana', 'greek yogurt', 'granola', 'salmon', 'rice', 'bagels', 'tuna', 'mackerel', 'potatoes', 'spinach'],
      coachNote: 'Carb timing matters more when output is high.',
      bestFor: 'Active pescatarian users with high training load.',
      notIdealFor: 'Users with low activity levels.'
    },
    {
      id: 'high-fiber-fat-loss',
      title: 'High-Fiber Fat Loss',
      goal: 'fat_loss',
      audienceTags: ['fat_loss', 'high_fiber', 'appetite_control'],
      calorieRange: [1500, 2300],
      macroEmphasis: '30-40g fiber with high satiety meals',
      mealFrequency: 4,
      sampleDay: [
        { meal: 'Breakfast', example: 'Overnight oats, chia, berries, yogurt', purpose: 'Fiber-first start' },
        { meal: 'Lunch', example: 'Chicken, lentils, salad bowl', purpose: 'Mixed fiber sources' },
        { meal: 'Snack', example: 'Apple + cottage cheese', purpose: 'Protein and fiber snack' },
        { meal: 'Dinner', example: 'White fish, potatoes, broccoli, carrots', purpose: 'Large-volume evening meal' }
      ],
      swaps: ['Lentils -> black beans', 'White fish -> tofu'],
      shoppingList: ['oats', 'chia', 'berries', 'yogurt', 'chicken', 'lentils', 'salad', 'apple', 'cottage cheese', 'white fish', 'broccoli', 'carrots'],
      coachNote: 'Fiber improves satiety, digestion, and consistency in calorie control.',
      bestFor: 'Clients struggling with hunger in deficits.',
      notIdealFor: 'Low-fiber tolerance cases requiring gradual ramp-up.'
    },
    {
      id: 'low-appetite-muscle-gain',
      title: 'Low Appetite Muscle Gain',
      goal: 'muscle_gain',
      audienceTags: ['muscle_gain', 'low_appetite', 'busy_professional'],
      calorieRange: [2400, 3500],
      macroEmphasis: 'Liquid calories + dense food choices',
      mealFrequency: 5,
      sampleDay: [
        { meal: 'Breakfast', example: 'Smoothie: milk, whey, oats, banana, peanut butter', purpose: 'Big calories with low volume' },
        { meal: 'Meal 2', example: 'Bagel with eggs', purpose: 'Energy dense meal' },
        { meal: 'Lunch', example: 'Beef rice bowl with olive oil', purpose: 'High-calorie core meal' },
        { meal: 'Snack', example: 'Greek yogurt + nuts + honey', purpose: 'Easy add-on calories' },
        { meal: 'Dinner', example: 'Salmon pasta with vegetables', purpose: 'Calorie dense and nutrient rich' }
      ],
      swaps: ['Beef -> chicken thighs', 'Pasta -> couscous'],
      shoppingList: ['milk', 'whey', 'oats', 'banana', 'peanut butter', 'bagels', 'eggs', 'beef', 'rice', 'olive oil', 'greek yogurt', 'nuts', 'salmon', 'pasta'],
      coachNote: 'Do not force giant plates. Use dense meals and shakes strategically.',
      bestFor: 'Hardgainers who feel full quickly.',
      notIdealFor: 'Anyone targeting aggressive fat loss.'
    },
    {
      id: 'weekend-flex-fat-loss',
      title: 'Weekend Flexible Fat Loss',
      goal: 'fat_loss',
      audienceTags: ['fat_loss', 'social_lifestyle', 'busy_professional'],
      calorieRange: [1600, 2500],
      macroEmphasis: 'Weekday structure with weekend calorie buffer',
      mealFrequency: 4,
      sampleDay: [
        { meal: 'Breakfast', example: 'Protein yogurt bowl', purpose: 'Control early-day hunger' },
        { meal: 'Lunch', example: 'Chicken wrap + salad', purpose: 'Predictable weekday lunch' },
        { meal: 'Snack', example: 'Protein shake + fruit', purpose: 'Hold appetite before social events' },
        { meal: 'Dinner', example: 'Fish, potatoes, vegetables, measured oil', purpose: 'High satiety dinner' }
      ],
      swaps: ['Wrap -> rice bowl', 'Fish -> lean beef/tofu'],
      shoppingList: ['protein yogurt', 'chicken', 'wraps', 'salad', 'protein powder', 'fruit', 'fish', 'potatoes', 'vegetables'],
      coachNote: 'Use weekly averages. One social meal does not ruin progress.',
      bestFor: 'People with weekend events and weekday structure.',
      notIdealFor: 'Users seeking rigid daily identical intake.'
    },
    {
      id: 'training-rest-day-split',
      title: 'Training Day / Rest Day Split',
      goal: 'recomposition',
      audienceTags: ['recomposition', 'fat_loss', 'intermediate', 'performance'],
      calorieRange: [1800, 3000],
      macroEmphasis: 'Higher-carb training days, lower-carb rest days',
      mealFrequency: 4,
      sampleDay: [
        { meal: 'Training Breakfast', example: 'Oats, whey, fruit', purpose: 'Carb-supported output' },
        { meal: 'Training Lunch', example: 'Chicken rice bowl', purpose: 'Performance meal' },
        { meal: 'Rest Lunch', example: 'Chicken + large salad + olive oil + potatoes', purpose: 'Lower carb, higher satiety' },
        { meal: 'Dinner', example: 'Lean protein + veg + measured carbs', purpose: 'Flexible daily structure' }
      ],
      swaps: ['Rice portions up/down by training day', 'Fats adjusted inversely to carbs'],
      shoppingList: ['oats', 'whey', 'fruit', 'chicken', 'rice', 'salad', 'olive oil', 'potatoes', 'lean proteins'],
      coachNote: 'Match fuel to output, not emotions.',
      bestFor: 'Intermediate lifters with consistent training schedule.',
      notIdealFor: 'Unpredictable weekly training patterns.'
    },
    {
      id: 'strength-performance-template',
      title: 'Strength Performance Template',
      goal: 'performance',
      audienceTags: ['performance', 'men', 'women', 'athlete'],
      calorieRange: [2300, 3700],
      macroEmphasis: 'High carbs, high protein, recovery focus',
      mealFrequency: 5,
      sampleDay: [
        { meal: 'Pre-lift', example: 'Bagel, whey, banana', purpose: 'Fast digesting fuel' },
        { meal: 'Post-lift', example: 'Rice, chicken, fruit juice', purpose: 'Rapid glycogen replenishment' },
        { meal: 'Lunch', example: 'Beef pasta with vegetables', purpose: 'Higher energy intake' },
        { meal: 'Snack', example: 'Greek yogurt + granola', purpose: 'Extra carbs/protein' },
        { meal: 'Dinner', example: 'Salmon, potatoes, greens', purpose: 'Recovery and micronutrients' }
      ],
      swaps: ['Chicken -> tofu/white fish', 'Bagel -> rice cakes + fruit'],
      shoppingList: ['bagels', 'whey', 'banana', 'rice', 'chicken', 'juice', 'beef', 'pasta', 'greek yogurt', 'granola', 'salmon', 'potatoes'],
      coachNote: 'Performance requires enough carbs and recovery consistency.',
      bestFor: 'Lifters and athletes with high output sessions.',
      notIdealFor: 'Sedentary users without training demand.'
    },
    {
      id: 'minimal-cooking-template',
      title: 'Minimal Cooking Template',
      goal: 'maintenance',
      audienceTags: ['busy_professional', 'student', 'minimal_cooking'],
      calorieRange: [1600, 2600],
      macroEmphasis: 'Supermarket-ready, no complex prep',
      mealFrequency: 3,
      sampleDay: [
        { meal: 'Breakfast', example: 'Protein yogurt, fruit, oats sachet', purpose: 'Grab-and-go start' },
        { meal: 'Lunch', example: 'Pre-cooked chicken, microwave rice cup, salad bag', purpose: 'No-cook lunch option' },
        { meal: 'Dinner', example: 'Frozen fish fillets, air-fryer potatoes, frozen veg', purpose: 'Simple dinner system' }
      ],
      swaps: ['Chicken -> tuna/cottage cheese', 'Fish fillets -> tofu stir-fry'],
      shoppingList: ['protein yogurt', 'fruit', 'oats sachets', 'pre-cooked chicken', 'rice cups', 'salad bags', 'frozen fish', 'potatoes', 'frozen veg'],
      coachNote: 'You do not need chef-level prep to be consistent.',
      bestFor: 'Students and workers with limited kitchen time.',
      notIdealFor: 'Users wanting broad meal variety daily.'
    },
    {
      id: 'premium-coaching-preview',
      title: 'Premium Coaching Preview Template',
      goal: 'maintenance',
      audienceTags: ['lead_generation', 'busy_professional', 'premium'],
      calorieRange: [1500, 3400],
      macroEmphasis: 'Personalised from your current calculator result',
      mealFrequency: 4,
      sampleDay: [
        { meal: 'Meal 1', example: 'Protein-focused breakfast personalized to your target', purpose: 'Kickstart adherence and appetite control' },
        { meal: 'Meal 2', example: 'Structured lunch with measured carbs and vegetables', purpose: 'Control energy across workday' },
        { meal: 'Meal 3', example: 'Snack planned around your schedule', purpose: 'Prevent under-eating or overeating swings' },
        { meal: 'Meal 4', example: 'Dinner adjusted to your training and recovery needs', purpose: 'Finish day aligned with target' }
      ],
      swaps: ['Food swaps are pre-built inside the Garcia Builder Coaching App/My PT Hub based on your preferences and weekly check-ins'],
      shoppingList: ['Built from your calculator output, diet preference, and schedule after onboarding'],
      coachNote: 'Inside the Garcia Builder Coaching App, this gets adjusted weekly from your real progress data.',
      bestFor: 'Users ready for coaching and accountability.',
      notIdealFor: 'People who do not want weekly adherence tracking.'
    },
    {
      id: 'female-maintenance-1900',
      title: 'Female Maintenance - 1900 kcal Structured',
      goal: 'maintenance',
      audienceTags: ['women', 'maintenance', 'busy_professional'],
      calorieRange: [1800, 2050],
      macroEmphasis: 'Balanced macros with high protein floor',
      mealFrequency: 4,
      sampleDay: [
        { meal: 'Breakfast', example: 'Eggs, toast, fruit', purpose: 'Balanced start' },
        { meal: 'Lunch', example: 'Chicken quinoa salad', purpose: 'Sustainable midday meal' },
        { meal: 'Snack', example: 'Protein yogurt + nuts', purpose: 'Steady energy' },
        { meal: 'Dinner', example: 'Salmon, rice, vegetables', purpose: 'Recovery and satiety' }
      ],
      swaps: ['Quinoa -> couscous', 'Salmon -> tofu + olive oil'],
      shoppingList: ['eggs', 'toast', 'fruit', 'chicken', 'quinoa', 'salad', 'protein yogurt', 'nuts', 'salmon', 'rice', 'vegetables'],
      coachNote: 'Maintenance still needs structure to avoid drift.',
      bestFor: 'Women maintaining body composition after a cut.',
      notIdealFor: 'Aggressive fat loss phases.'
    },
    {
      id: 'male-maintenance-2600',
      title: 'Male Maintenance - 2600 kcal Performance Balance',
      goal: 'maintenance',
      audienceTags: ['men', 'maintenance', 'performance'],
      calorieRange: [2450, 2750],
      macroEmphasis: 'Performance-supportive maintenance intake',
      mealFrequency: 4,
      sampleDay: [
        { meal: 'Breakfast', example: 'Oats, whey, berries', purpose: 'Morning fuel' },
        { meal: 'Lunch', example: 'Lean beef rice bowl', purpose: 'Training support' },
        { meal: 'Snack', example: 'Cottage cheese + fruit', purpose: 'Protein spread' },
        { meal: 'Dinner', example: 'Chicken thighs, potatoes, veg', purpose: 'Recovery meal' }
      ],
      swaps: ['Beef -> turkey mince', 'Potatoes -> pasta'],
      shoppingList: ['oats', 'whey', 'berries', 'lean beef', 'rice', 'cottage cheese', 'fruit', 'chicken thighs', 'potatoes', 'vegetables'],
      coachNote: 'Hold bodyweight trends steady while improving output.',
      bestFor: 'Men maintaining while pushing training quality.',
      notIdealFor: 'Large cut or bulking goals.'
    },
    {
      id: 'female-performance-2300',
      title: 'Female Performance - 2300 kcal',
      goal: 'performance',
      audienceTags: ['women', 'performance', 'high_activity'],
      calorieRange: [2200, 2450],
      macroEmphasis: 'Carb-forward with high protein baseline',
      mealFrequency: 5,
      sampleDay: [
        { meal: 'Pre training', example: 'Bagel + whey', purpose: 'Fast pre-lift fuel' },
        { meal: 'Post training', example: 'Rice bowl with chicken and fruit', purpose: 'Recovery support' },
        { meal: 'Lunch', example: 'Turkey pasta and vegetables', purpose: 'Carb replenishment' },
        { meal: 'Snack', example: 'Greek yogurt + granola', purpose: 'Additional carbs and protein' },
        { meal: 'Dinner', example: 'White fish, potatoes, salad', purpose: 'Evening nutrition quality' }
      ],
      swaps: ['Turkey -> tofu/tempeh', 'Bagel -> rice cakes + banana'],
      shoppingList: ['bagels', 'whey', 'rice', 'chicken', 'fruit', 'turkey', 'pasta', 'greek yogurt', 'granola', 'white fish', 'potatoes', 'salad'],
      coachNote: 'High output requires high quality fueling.',
      bestFor: 'Women in higher-volume training blocks.',
      notIdealFor: 'Low-activity weeks.'
    },
    {
      id: 'male-aggressive-cut-2100',
      title: 'Male Aggressive Cut - 2100 kcal Short Block',
      goal: 'aggressive_fat_loss',
      audienceTags: ['men', 'aggressive_fat_loss', 'advanced'],
      calorieRange: [1900, 2250],
      macroEmphasis: 'Very high protein with strict food quality',
      mealFrequency: 4,
      sampleDay: [
        { meal: 'Breakfast', example: 'Egg whites, whole egg, berries', purpose: 'Protein-dominant start' },
        { meal: 'Lunch', example: 'Chicken and large mixed salad with potatoes', purpose: 'Satiety and micronutrients' },
        { meal: 'Snack', example: 'Whey shake + cucumber + rice cakes', purpose: 'Controlled snack' },
        { meal: 'Dinner', example: 'White fish, cauliflower rice, vegetables', purpose: 'Low-calorie volume meal' }
      ],
      swaps: ['Chicken -> turkey or tuna', 'Potatoes -> lower portion rice'],
      shoppingList: ['egg whites', 'eggs', 'berries', 'chicken', 'salad', 'potatoes', 'whey', 'cucumber', 'rice cakes', 'white fish', 'cauliflower rice'],
      coachNote: 'Short-term block. Review biofeedback weekly.',
      bestFor: 'Experienced users with clear timeline and coaching oversight.',
      notIdealFor: 'Beginners or high stress/lack of sleep.'
    }
  ];

  window.GBNutritionLibrary = {
    foodLibrary,
    templateLibrary,
    categoryLabels: {
      lean_proteins: 'Lean Proteins',
      higher_fat_proteins: 'Higher-Fat Proteins',
      vegetarian_proteins: 'Vegetarian Proteins',
      carbohydrates: 'Carbohydrates',
      fruits: 'Fruits',
      vegetables: 'Vegetables',
      healthy_fats: 'Healthy Fats',
      snacks: 'Snacks',
      pre_workout: 'Pre-Workout',
      post_workout: 'Post-Workout',
      simple_meal_prep_foods: 'Simple Meal Prep Foods',
      low_calorie_volume_foods: 'Low-Calorie Volume Foods'
    }
  };
})();
