(function nutritionCalculatorModule() {
  'use strict';

  const CATEGORY_ALL = 'all';
  const TAG_ALL = 'all';
  const MACRO_KCAL = { protein: 4, carbs: 4, fats: 9 };
  const state = {
    profile: null,
    templates: [],
    selectedTemplateFilter: 'all',
    selectedFoods: [],
    foodCategoryFilter: CATEGORY_ALL,
    foodTagFilter: TAG_ALL
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function roundTo(value, step) {
    return Math.round(value / step) * step;
  }

  function toNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function poundsToKg(lb) {
    return lb * 0.45359237;
  }

  function inchesToCm(inches) {
    return inches * 2.54;
  }

  function convertToMetric(unitSystem, height, weight) {
    if (unitSystem === 'imperial') {
      return {
        heightCm: inchesToCm(height),
        weightKg: poundsToKg(weight)
      };
    }
    return { heightCm: height, weightKg: weight };
  }

  function mifflinStJeor(weightKg, heightCm, age, sex) {
    const base = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
    return sex === 'female' ? base - 161 : base + 5;
  }

  function katchMcardle(weightKg, bodyFatPercentage) {
    const leanBodyMass = weightKg * (1 - (bodyFatPercentage / 100));
    return 370 + (21.6 * leanBodyMass);
  }

  function activityMultiplier(dailyActivity, trainingFrequency) {
    const key = dailyActivity + '|' + trainingFrequency;
    const map = {
      'mostly_sitting|0': 1.2,
      'mostly_sitting|1-2': 1.3,
      'light_movement|1-2': 1.375,
      'light_movement|3-4': 1.45,
      'active_job|3-4': 1.55,
      'active_job|5-6': 1.65,
      'very_active_job|5-6': 1.75,
      'mostly_sitting|athlete': 1.85,
      'light_movement|athlete': 1.85,
      'active_job|athlete': 1.85,
      'very_active_job|athlete': 1.85
    };
    if (map[key]) return map[key];

    if (trainingFrequency === 'athlete') return 1.85;
    if (dailyActivity === 'very_active_job') return trainingFrequency === '5-6' ? 1.75 : 1.65;
    if (dailyActivity === 'active_job') return trainingFrequency === '5-6' ? 1.65 : 1.55;
    if (dailyActivity === 'light_movement') return trainingFrequency === '0' ? 1.25 : 1.4;
    return trainingFrequency === '0' ? 1.2 : 1.3;
  }

  function goalAdjustment(goal, pace, bodyFat) {
    const paceBias = pace === 'slow' ? -0.03 : pace === 'aggressive' ? 0.03 : 0;
    const map = {
      aggressive_fat_loss: -0.25,
      fat_loss: -0.18,
      maintenance: 0,
      recomposition: bodyFat && bodyFat > 22 ? -0.07 : 0,
      lean_muscle_gain: 0.08,
      performance: 0.03
    };
    const base = map[goal] || 0;
    if (goal === 'fat_loss') {
      return clamp(base + paceBias, -0.2, -0.15);
    }
    if (goal === 'aggressive_fat_loss') {
      return clamp(base + paceBias, -0.28, -0.22);
    }
    if (goal === 'lean_muscle_gain') {
      return clamp(base + paceBias, 0.05, 0.1);
    }
    if (goal === 'performance') {
      return clamp(base + paceBias, 0, 0.05);
    }
    if (goal === 'recomposition') {
      return clamp(base + paceBias, -0.1, 0);
    }
    return base;
  }

  function proteinPerKg(goal, pace) {
    const ranges = {
      fat_loss: [2.0, 2.4],
      aggressive_fat_loss: [2.2, 2.6],
      recomposition: [2.0, 2.3],
      maintenance: [1.6, 2.0],
      lean_muscle_gain: [1.8, 2.2],
      performance: [1.6, 2.0]
    };
    const [min, max] = ranges[goal] || ranges.maintenance;
    if (pace === 'slow') return min;
    if (pace === 'aggressive') return max;
    return (min + max) / 2;
  }

  function fatPerKg(goal, pace) {
    if (goal === 'aggressive_fat_loss') return 0.7;
    if (goal === 'lean_muscle_gain') return pace === 'aggressive' ? 0.8 : 0.75;
    if (goal === 'performance') return 0.8;
    if (pace === 'slow') return 0.85;
    return 0.75;
  }

  function applyMacroSafety(targetCalories, weightKg, proteinG, carbsG, fatsG, sex) {
    const warnings = [];

    let protein = roundTo(proteinG, 5);
    let fats = roundTo(fatsG, 5);
    const minFatFromKg = roundTo(Math.max(weightKg * 0.6, 30), 5);
    fats = Math.max(fats, minFatFromKg);

    let carbs = roundTo((targetCalories - (protein * 4) - (fats * 9)) / 4, 5);
    if (carbs < 0) carbs = 0;

    const fatCaloriesShare = (fats * 9) / targetCalories;
    if (fatCaloriesShare < 0.2) {
      warnings.push('Fat intake dropped under 20% of calories. We adjusted fats to support hormones and recovery.');
      const adjustedFat = roundTo((targetCalories * 0.2) / 9, 5);
      fats = Math.max(adjustedFat, minFatFromKg);
      carbs = roundTo((targetCalories - (protein * 4) - (fats * 9)) / 4, 5);
    }

    if (carbs < 40) {
      warnings.push('Carbs were very low for this setup. Carbs were raised for training quality and daily energy.');
      carbs = 40;
      const remainingForFat = targetCalories - (protein * 4) - (carbs * 4);
      fats = roundTo(Math.max(remainingForFat / 9, minFatFromKg), 5);
    }

    if (sex === 'female' && targetCalories < 1200) {
      warnings.push('Target calories are very low for most women. Consider a slower pace and monitor energy/recovery.');
    }
    if (sex === 'male' && targetCalories < 1500) {
      warnings.push('Target calories are very low for most men. Consider a slower pace and monitor recovery/performance.');
    }

    return {
      protein: Math.max(0, protein),
      carbs: Math.max(0, carbs),
      fats: Math.max(0, fats),
      warnings
    };
  }

  function mealSplit(mealPreference, targetCalories, macros) {
    const splitMap = {
      '3': [
        { meal: 'Breakfast', pct: 0.3 },
        { meal: 'Lunch', pct: 0.35 },
        { meal: 'Dinner', pct: 0.35 }
      ],
      '4': [
        { meal: 'Breakfast', pct: 0.25 },
        { meal: 'Lunch', pct: 0.3 },
        { meal: 'Dinner', pct: 0.3 },
        { meal: 'Snack', pct: 0.15 }
      ],
      '5': [
        { meal: 'Breakfast', pct: 0.2 },
        { meal: 'Lunch', pct: 0.25 },
        { meal: 'Pre/Post workout or snack', pct: 0.2 },
        { meal: 'Dinner', pct: 0.25 },
        { meal: 'Evening snack', pct: 0.1 }
      ]
    };

    return (splitMap[mealPreference] || splitMap['4']).map(function mapSplit(item) {
      return {
        meal: item.meal,
        calories: roundTo(targetCalories * item.pct, 10),
        protein: roundTo(macros.protein * item.pct, 5),
        carbs: roundTo(macros.carbs * item.pct, 5),
        fats: roundTo(macros.fats * item.pct, 5)
      };
    });
  }

  function buildExampleDay(profile, splits) {
    const examples = {
      balanced: ['Greek yogurt, berries, oats and chia seeds', 'Chicken breast, rice, salad and olive oil dressing', 'Protein shake and fruit', 'White fish, potatoes and mixed vegetables', 'Cottage cheese bowl and nuts'],
      high_protein: ['Egg whites, whole eggs and toast', 'Turkey mince bowl with potatoes and vegetables', 'Protein yogurt and berries', 'Lean beef stir-fry with rice', 'Whey shake and kiwi'],
      vegetarian: ['Greek yogurt bowl with oats and fruit', 'Tofu quinoa bowl with vegetables', 'Edamame and fruit', 'Lentil pasta with salad', 'Cottage cheese and chia seeds'],
      pescatarian: ['Skyr, fruit and oats', 'Tuna rice bowl with salad', 'Protein shake and banana', 'Salmon, potatoes and green beans', 'Greek yogurt and berries'],
      simple_meal_prep: ['Overnight oats and whey', 'Meal prep chicken rice box', 'Protein yogurt pot', 'Air fryer fish, potatoes and veg', 'Rice cakes and cottage cheese'],
      busy_professional: ['Protein oats jar', 'Wrap with pre-cooked chicken + salad', 'Protein shake + apple', 'Lean protein bowl with microwave rice', 'Greek yogurt and nuts']
    };
    const selected = examples[profile.dietPreference] || examples.balanced;
    return splits.map(function toExample(split, index) {
      return split.meal + ': ' + selected[index] + ' (' + split.calories + ' kcal target).';
    });
  }

  function practicalMessage() {
    return 'Your estimated target is not a final prescription. It is a starting point. Run it for 10-14 days, track body weight, energy, hunger and performance, then adjust. The best plan is not the lowest calorie number. It is the number you can execute consistently.';
  }

  function matchingScore(template, profile) {
    let score = 0;
    if (template.goal === profile.goal) score += 8;
    if (template.audienceTags.includes(profile.dietPreference)) score += 5;
    if (profile.sex === 'female' && template.audienceTags.includes('women')) score += 3;
    if (profile.sex === 'male' && template.audienceTags.includes('men')) score += 3;
    if (profile.goal === 'fat_loss' && template.audienceTags.includes('fat_loss')) score += 2;
    if (profile.goal === 'lean_muscle_gain' && template.audienceTags.includes('muscle_gain')) score += 2;
    if (profile.goal === 'performance' && template.audienceTags.includes('performance')) score += 2;
    if (Number(template.mealFrequency) === Number(profile.mealPreference)) score += 1;
    return score;
  }

  function getTemplateLibrary() {
    return (window.GBNutritionLibrary && window.GBNutritionLibrary.templateLibrary) || [];
  }

  function getFoodLibrary() {
    return (window.GBNutritionLibrary && window.GBNutritionLibrary.foodLibrary) || [];
  }

  function getCategoryLabels() {
    return (window.GBNutritionLibrary && window.GBNutritionLibrary.categoryLabels) || {};
  }

  function formatKcal(value) {
    return String(value) + ' kcal';
  }

  function formatGram(value) {
    return String(value) + ' g';
  }

  function showErrors(errors) {
    const errorsBox = byId('nutrition-errors');
    if (!errorsBox) return;
    if (!errors.length) {
      errorsBox.hidden = true;
      errorsBox.innerHTML = '';
      return;
    }
    errorsBox.hidden = false;
    errorsBox.innerHTML = errors.map(function toLine(error) {
      return '<p>' + error + '</p>';
    }).join('');
  }

  function validateProfile(profile) {
    const errors = [];

    if (!profile.sex) errors.push('Select sex.');
    if (profile.age < 16 || profile.age > 80) errors.push('Age must be between 16 and 80.');
    if (profile.heightCm < 130 || profile.heightCm > 230) errors.push('Height must be between 130 and 230 cm.');
    if (profile.weightKg < 35 || profile.weightKg > 250) errors.push('Weight must be between 35 and 250 kg.');
    if (profile.bodyFat !== null && (profile.bodyFat < 3 || profile.bodyFat > 70)) errors.push('Body fat must be between 3% and 70% when provided.');
    if (!profile.goal) errors.push('Select a goal.');
    if (!profile.trainingFrequency) errors.push('Select training frequency.');
    if (!profile.dailyActivity) errors.push('Select daily activity.');
    if (!profile.mealPreference) errors.push('Select meal preference.');
    if (!profile.dietPreference) errors.push('Select diet preference.');

    return errors;
  }

  function gatherProfile(form) {
    const unitSystem = String(form.unitSystem.value || 'metric');
    const rawHeight = toNumber(form.height.value, 0);
    const rawWeight = toNumber(form.weight.value, 0);
    const converted = convertToMetric(unitSystem, rawHeight, rawWeight);
    const bodyFatRaw = form.bodyFat.value.trim();

    return {
      name: String(form.name.value || '').trim(),
      email: String(form.email.value || '').trim(),
      sex: String(form.sex.value || 'male'),
      age: clamp(toNumber(form.age.value, 30), 0, 120),
      heightCm: converted.heightCm,
      weightKg: converted.weightKg,
      bodyFat: bodyFatRaw ? toNumber(bodyFatRaw, null) : null,
      goal: String(form.goal.value || 'maintenance'),
      trainingFrequency: String(form.trainingFrequency.value || '3-4'),
      dailyActivity: String(form.dailyActivity.value || 'light_movement'),
      mealPreference: String(form.mealPreference.value || '4'),
      dietPreference: String(form.dietPreference.value || 'balanced'),
      targetPace: String(form.targetPace.value || 'moderate'),
      unitSystem
    };
  }

  function runCalculation(profile) {
    const bmrMifflin = mifflinStJeor(profile.weightKg, profile.heightCm, profile.age, profile.sex);
    const bmrKatch = profile.bodyFat !== null ? katchMcardle(profile.weightKg, profile.bodyFat) : null;
    const primaryBmr = bmrKatch || bmrMifflin;
    const multiplier = activityMultiplier(profile.dailyActivity, profile.trainingFrequency);
    const maintenanceCalories = roundTo(primaryBmr * multiplier, 10);

    const adjustment = goalAdjustment(profile.goal, profile.targetPace, profile.bodyFat);
    const targetCaloriesRaw = maintenanceCalories * (1 + adjustment);
    const targetCalories = roundTo(clamp(targetCaloriesRaw, 1100, 5000), 10);

    const proteinKg = proteinPerKg(profile.goal, profile.targetPace);
    const fatKg = fatPerKg(profile.goal, profile.targetPace);

    const proteinG = profile.weightKg * proteinKg;
    const fatG = profile.weightKg * fatKg;
    const initialCarbs = (targetCalories - (proteinG * 4) - (fatG * 9)) / 4;

    const macros = applyMacroSafety(targetCalories, profile.weightKg, proteinG, initialCarbs, fatG, profile.sex);
    const fiberByCalories = roundTo((targetCalories / 1000) * 12, 1);
    const fiberTarget = clamp(roundTo(Math.max(25, fiberByCalories), 1), 25, 45);
    const waterLow = roundTo(profile.weightKg * 30, 10);
    const waterHigh = roundTo(profile.weightKg * 40, 10);

    return {
      maintenanceCalories,
      targetCalories,
      bmrMifflin: roundTo(bmrMifflin, 1),
      bmrKatch: bmrKatch ? roundTo(bmrKatch, 1) : null,
      multiplier,
      macros,
      fiberTarget,
      waterLow,
      waterHigh,
      mealSplitPlan: mealSplit(profile.mealPreference, targetCalories, macros),
      exampleDay: buildExampleDay(profile, mealSplit(profile.mealPreference, targetCalories, macros)),
      warnings: macros.warnings
    };
  }

  function renderMacroBars(macros) {
    const totalMacroCalories = (macros.protein * MACRO_KCAL.protein) + (macros.carbs * MACRO_KCAL.carbs) + (macros.fats * MACRO_KCAL.fats);
    const pPct = totalMacroCalories ? ((macros.protein * 4) / totalMacroCalories) * 100 : 0;
    const cPct = totalMacroCalories ? ((macros.carbs * 4) / totalMacroCalories) * 100 : 0;
    const fPct = totalMacroCalories ? ((macros.fats * 9) / totalMacroCalories) * 100 : 0;

    byId('bar-protein').style.width = pPct.toFixed(1) + '%';
    byId('bar-carbs').style.width = cPct.toFixed(1) + '%';
    byId('bar-fats').style.width = fPct.toFixed(1) + '%';
    byId('bar-protein-label').textContent = pPct.toFixed(1) + '%';
    byId('bar-carbs-label').textContent = cPct.toFixed(1) + '%';
    byId('bar-fats-label').textContent = fPct.toFixed(1) + '%';
  }

  function renderResults(profile, calc) {
    byId('resultMessage').textContent = practicalMessage();
    byId('resultMaintenanceCalories').textContent = formatKcal(calc.maintenanceCalories);
    byId('resultTargetCalories').textContent = formatKcal(calc.targetCalories);
    byId('resultProtein').textContent = formatGram(calc.macros.protein);
    byId('resultCarbs').textContent = formatGram(calc.macros.carbs);
    byId('resultFats').textContent = formatGram(calc.macros.fats);
    byId('resultFormula').textContent = calc.bmrKatch
      ? 'Katch-McArdle (' + calc.bmrKatch + ' BMR)'
      : 'Mifflin-St Jeor (' + calc.bmrMifflin + ' BMR)';

    byId('resultFiber').textContent = 'Fiber target: ' + calc.fiberTarget + ' g/day (10-14g per 1000 kcal in practice).';
    byId('resultHydration').textContent = 'Water target: ' + calc.waterLow + '-' + calc.waterHigh + ' ml/day. Increase with heat, sweat and high activity.';
    byId('resultCheckin').textContent = 'Progress check: Track weight trend, energy, hunger, sleep and performance for 10-14 days before changing intake.';
    byId('resultSafeguards').textContent = 'This is an estimate, not a medical prescription. Adjust based on real progress and biofeedback.';

    const warningItems = calc.warnings.concat([
      'Speak with a qualified healthcare professional before following a calorie target if you are pregnant, have diabetes, eating disorders, medical conditions, or use medication.'
    ]);
    const warningBox = byId('resultWarnings');
    warningBox.innerHTML = warningItems.map(function toItem(item) {
      return '<p>' + item + '</p>';
    }).join('');

    const splitList = byId('resultMealSplit');
    splitList.innerHTML = '';
    calc.mealSplitPlan.forEach(function addSplit(split) {
      const li = document.createElement('li');
      li.textContent = split.meal + ': ' + split.calories + ' kcal (' + split.protein + 'P / ' + split.carbs + 'C / ' + split.fats + 'F)';
      splitList.appendChild(li);
    });

    const dayList = byId('resultExampleDay');
    dayList.innerHTML = '';
    calc.exampleDay.forEach(function addDay(item) {
      const li = document.createElement('li');
      li.textContent = item;
      dayList.appendChild(li);
    });

    renderMacroBars(calc.macros);

    byId('nutrition-results').hidden = false;
    byId('template-library').hidden = false;
    byId('food-library').hidden = false;
  }

  function renderTemplateCards() {
    const cards = byId('templateCards');
    if (!cards) return;

    const filter = state.selectedTemplateFilter;
    const filtered = state.templates.filter(function isMatch(template) {
      if (filter === 'all') return true;
      if (template.goal === filter) return true;
      return template.audienceTags.includes(filter);
    });

    cards.innerHTML = filtered.map(function toCard(template) {
      const sampleDay = template.sampleDay.map(function toMeal(item) {
        return '<li><strong>' + item.meal + ':</strong> ' + item.example + '</li>';
      }).join('');
      const swaps = template.swaps.map(function toSwap(item) { return '<li>' + item + '</li>'; }).join('');
      const shopping = template.shoppingList.map(function toItem(item) { return '<li>' + item + '</li>'; }).join('');

      return [
        '<article class="template-card">',
        '<header>',
        '<h3>' + template.title + '</h3>',
        '<p class="template-meta">' + template.macroEmphasis + ' | ' + template.calorieRange[0] + '-' + template.calorieRange[1] + ' kcal | ' + template.mealFrequency + ' meals</p>',
        '</header>',
        '<p><strong>Best for:</strong> ' + template.bestFor + '</p>',
        '<p><strong>Not ideal for:</strong> ' + template.notIdealFor + '</p>',
        '<h4>Sample day</h4>',
        '<ul>' + sampleDay + '</ul>',
        '<h4>Food swaps</h4>',
        '<ul>' + swaps + '</ul>',
        '<h4>Shopping list</h4>',
        '<ul class="shopping-list">' + shopping + '</ul>',
        '<p class="coach-note"><strong>Coach note:</strong> ' + template.coachNote + '</p>',
        '</article>'
      ].join('');
    }).join('');
  }

  function renderFoodSelectors() {
    const categoryLabels = getCategoryLabels();
    const categorySelect = byId('foodCategory');
    const tagSelect = byId('foodTag');
    if (!categorySelect || !tagSelect) return;

    const categories = Object.keys(categoryLabels);
    categorySelect.innerHTML = ['<option value="all">All categories</option>'].concat(categories.map(function mapCategory(category) {
      return '<option value="' + category + '">' + categoryLabels[category] + '</option>';
    })).join('');

    const tags = Array.from(new Set(getFoodLibrary().flatMap(function mapTags(item) {
      return item.tags;
    }))).sort();
    tagSelect.innerHTML = ['<option value="all">All tags</option>'].concat(tags.map(function mapTag(tag) {
      return '<option value="' + tag + '">' + tag.replace(/_/g, ' ') + '</option>';
    })).join('');
  }

  function renderFoodCards() {
    const cards = byId('foodCards');
    if (!cards) return;
    const categoryLabels = getCategoryLabels();

    const foodItems = getFoodLibrary().filter(function byFilter(item) {
      const categoryOk = state.foodCategoryFilter === CATEGORY_ALL || item.category === state.foodCategoryFilter;
      const tagOk = state.foodTagFilter === TAG_ALL || item.tags.includes(state.foodTagFilter);
      return categoryOk && tagOk;
    });

    cards.innerHTML = foodItems.map(function toFoodCard(item, index) {
      return [
        '<article class="food-card">',
        '<h4>' + item.name + '</h4>',
        '<p class="food-meta">' + (categoryLabels[item.category] || item.category) + ' | ' + item.serving + '</p>',
        '<p class="food-macros">' + item.calories + ' kcal | ' + item.protein + 'P / ' + item.carbs + 'C / ' + item.fats + 'F</p>',
        '<p class="food-tags">' + item.tags.join(', ').replace(/_/g, ' ') + '</p>',
        '<button class="btn btn-outline-warning add-food-btn" type="button" data-food-index="' + index + '">Add food</button>',
        '</article>'
      ].join('');
    }).join('');

    cards.querySelectorAll('.add-food-btn').forEach(function bindFoodButton(button) {
      button.addEventListener('click', function onAddFood() {
        const index = toNumber(button.getAttribute('data-food-index'), -1);
        if (index < 0) return;
        const filteredItems = getFoodLibrary().filter(function byFilter(item) {
          const categoryOk = state.foodCategoryFilter === CATEGORY_ALL || item.category === state.foodCategoryFilter;
          const tagOk = state.foodTagFilter === TAG_ALL || item.tags.includes(state.foodTagFilter);
          return categoryOk && tagOk;
        });
        const item = filteredItems[index];
        if (!item) return;
        state.selectedFoods.push(item);
        renderSelectedFoods();
      });
    });
  }

  function renderSelectedFoods() {
    const list = byId('selectedFoodsList');
    const totals = byId('selectedFoodsTotals');
    if (!list || !totals) return;

    if (!state.selectedFoods.length) {
      list.innerHTML = '<li>No foods selected yet.</li>';
      totals.textContent = 'Totals: --';
      return;
    }

    list.innerHTML = state.selectedFoods.map(function toItem(item, idx) {
      return '<li>' + item.name + ' (' + item.serving + ') <button type="button" class="remove-food" data-remove-index="' + idx + '">remove</button></li>';
    }).join('');

    const summary = state.selectedFoods.reduce(function accumulate(acc, item) {
      acc.calories += item.calories;
      acc.protein += item.protein;
      acc.carbs += item.carbs;
      acc.fats += item.fats;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

    totals.textContent = 'Totals: ' + roundTo(summary.calories, 1) + ' kcal | ' + roundTo(summary.protein, 1) + 'P / ' + roundTo(summary.carbs, 1) + 'C / ' + roundTo(summary.fats, 1) + 'F';

    list.querySelectorAll('.remove-food').forEach(function bindRemove(button) {
      button.addEventListener('click', function onRemove() {
        const index = toNumber(button.getAttribute('data-remove-index'), -1);
        if (index < 0) return;
        state.selectedFoods.splice(index, 1);
        renderSelectedFoods();
      });
    });
  }

  function updateUnitInputs(unit) {
    const height = byId('height');
    const weight = byId('weight');
    const currentUnit = byId('unitSystem').value;
    if (!height || !weight || currentUnit === unit) return;

    let h = toNumber(height.value, 0);
    let w = toNumber(weight.value, 0);

    if (unit === 'imperial') {
      h = h / 2.54;
      w = w / 0.45359237;
      height.min = '51';
      height.max = '90';
      weight.min = '77';
      weight.max = '551';
      byId('height-unit-label').textContent = 'in';
      byId('weight-unit-label').textContent = 'lb';
    } else {
      h = h * 2.54;
      w = w * 0.45359237;
      height.min = '130';
      height.max = '230';
      weight.min = '35';
      weight.max = '250';
      byId('height-unit-label').textContent = 'cm';
      byId('weight-unit-label').textContent = 'kg';
    }

    height.value = roundTo(h, 1);
    weight.value = roundTo(w, 1);
    byId('unitSystem').value = unit;
  }

  function setupTemplateFilters() {
    document.querySelectorAll('.filter-btn').forEach(function bindFilter(button) {
      button.addEventListener('click', function onFilter() {
        document.querySelectorAll('.filter-btn').forEach(function clearState(el) {
          el.classList.remove('is-active');
        });
        button.classList.add('is-active');
        state.selectedTemplateFilter = String(button.getAttribute('data-filter') || 'all');
        renderTemplateCards();
      });
    });
  }

  function setupFoodFilters() {
    const categorySelect = byId('foodCategory');
    const tagSelect = byId('foodTag');
    if (!categorySelect || !tagSelect) return;

    categorySelect.addEventListener('change', function onCategoryChange() {
      state.foodCategoryFilter = categorySelect.value || CATEGORY_ALL;
      renderFoodCards();
    });

    tagSelect.addEventListener('change', function onTagChange() {
      state.foodTagFilter = tagSelect.value || TAG_ALL;
      renderFoodCards();
    });
  }

  function initialize() {
    const form = byId('nutrition-calculator-form');
    if (!form) return;

    renderFoodSelectors();
    renderFoodCards();
    renderSelectedFoods();
    setupTemplateFilters();
    setupFoodFilters();

    document.querySelectorAll('.unit-btn').forEach(function bindUnitButton(button) {
      button.addEventListener('click', function onUnitClick() {
        document.querySelectorAll('.unit-btn').forEach(function removeActive(el) {
          el.classList.remove('is-active');
        });
        button.classList.add('is-active');
        const unit = String(button.getAttribute('data-unit') || 'metric');
        updateUnitInputs(unit);
      });
    });

    form.addEventListener('submit', function onSubmit(event) {
      event.preventDefault();

      const profile = gatherProfile(form);
      const errors = validateProfile(profile);
      showErrors(errors);
      if (errors.length) return;

      // TODO: Integrate optional lead capture here if/when a dedicated endpoint is confirmed.

      const calc = runCalculation(profile);
      state.profile = profile;

      const sortedTemplates = getTemplateLibrary().slice().sort(function sortTemplates(a, b) {
        return matchingScore(b, profile) - matchingScore(a, profile);
      });
      state.templates = sortedTemplates;
      state.selectedTemplateFilter = 'all';
      document.querySelectorAll('.filter-btn').forEach(function resetFilter(button) {
        button.classList.toggle('is-active', (button.getAttribute('data-filter') || 'all') === 'all');
      });

      renderResults(profile, calc);
      renderTemplateCards();
      byId('nutrition-results').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  document.addEventListener('DOMContentLoaded', initialize);
})();
