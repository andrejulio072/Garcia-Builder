(function nutritionCalculatorModule() {
  'use strict';

  const CATEGORY_ALL = 'all';
  const TAG_ALL = 'all';
  const MACRO_KCAL = { protein: 4, carbs: 4, fats: 9 };
  const state = {
    profile: null,
    templates: [],
    selectedTemplateFilter: 'all',
    templateSearch: '',
    showAllTemplates: false,
    selectedFoods: [],
    foodCategoryFilter: CATEGORY_ALL,
    foodTagFilter: TAG_ALL,
    foodSearch: ''
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

  function normalizeSearch(value) {
    return String(value || '').trim().toLowerCase();
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

  function trainingDaysPerWeek(trainingFrequency) {
    const map = {
      '0': 0,
      '1-2': 1.5,
      '3-4': 3.5,
      '5-6': 5.5,
      athlete: 6.5
    };
    return map[trainingFrequency] || 0;
  }

  function baselineActivityMultiplier(dailyActivity, dailySteps) {
    const bySteps = {
      under_4000: 1.2,
      '4000_7000': 1.3,
      '7000_10000': 1.42,
      over_10000: 1.55
    };
    const byLifestyle = {
      mostly_sitting: 1.2,
      light_movement: 1.32,
      active_job: 1.45,
      very_active_job: 1.6
    };
    const lifestyle = byLifestyle[dailyActivity] || byLifestyle.light_movement;
    if (!dailySteps || dailySteps === 'unknown') return lifestyle;
    return Math.max(bySteps[dailySteps] || lifestyle, lifestyle - 0.06);
  }

  function estimateTrainingCalories(weightKg, trainingFrequency, sessionDuration, trainingIntensity) {
    const days = trainingDaysPerWeek(trainingFrequency);
    if (!days) return 0;

    const hours = clamp(toNumber(sessionDuration, 45), 20, 90) / 60;
    const metMap = {
      light: 4,
      moderate: 5.5,
      hard: 7
    };
    const met = metMap[trainingIntensity] || metMap.moderate;
    const netSessionCalories = Math.max(0, (met - 1) * weightKg * hours);
    return netSessionCalories * days / 7;
  }

  function accuracyFactor(mode) {
    const map = {
      conservative: 0.93,
      standard: 1,
      high_output: 1.05
    };
    return map[mode] || map.conservative;
  }

  function goalCalorieDelta(goal, pace, bodyFat, weightKg, maintenanceCalories) {
    const lossRates = {
      slow: 0.0025,
      moderate: 0.005,
      aggressive: 0.0075
    };
    const gainRates = {
      slow: 0.00125,
      moderate: 0.0025,
      aggressive: 0.004
    };
    const lossRate = lossRates[pace] || lossRates.moderate;
    const gainRate = gainRates[pace] || gainRates.moderate;
    const kcalPerKg = 7700;

    if (goal === 'fat_loss' || goal === 'aggressive_fat_loss') {
      const selectedRate = goal === 'aggressive_fat_loss' ? Math.max(lossRate, 0.0075) : lossRate;
      const rawDeficit = (weightKg * kcalPerKg * selectedRate) / 7;
      const cap = goal === 'aggressive_fat_loss' ? 0.25 : pace === 'aggressive' ? 0.22 : pace === 'slow' ? 0.12 : 0.18;
      return -Math.min(rawDeficit, maintenanceCalories * cap);
    }

    if (goal === 'lean_muscle_gain') {
      const rawSurplus = (weightKg * kcalPerKg * gainRate) / 7;
      const cap = pace === 'aggressive' ? 0.1 : pace === 'slow' ? 0.04 : 0.07;
      return Math.min(rawSurplus, maintenanceCalories * cap);
    }

    if (goal === 'recomposition') {
      const recompDeficit = bodyFat && bodyFat > 24 ? 0.07 : bodyFat && bodyFat > 18 ? 0.04 : 0.02;
      return -(maintenanceCalories * recompDeficit);
    }

    if (goal === 'performance') {
      return maintenanceCalories * (pace === 'aggressive' ? 0.05 : pace === 'slow' ? 0.02 : 0.03);
    }

    return 0;
  }

  function proteinPerKg(goal, pace) {
    const ranges = {
      fat_loss: [1.8, 2.2],
      aggressive_fat_loss: [2.0, 2.4],
      recomposition: [1.8, 2.2],
      maintenance: [1.6, 2.0],
      lean_muscle_gain: [1.6, 2.0],
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

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
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
      sessionDuration: String(form.sessionDuration.value || '45'),
      trainingIntensity: String(form.trainingIntensity.value || 'moderate'),
      dailyActivity: String(form.dailyActivity.value || 'light_movement'),
      dailySteps: String(form.dailySteps.value || '4000_7000'),
      mealPreference: String(form.mealPreference.value || '4'),
      dietPreference: String(form.dietPreference.value || 'balanced'),
      targetPace: String(form.targetPace.value || 'moderate'),
      accuracyMode: String(form.accuracyMode.value || 'conservative'),
      unitSystem
    };
  }

  function runCalculation(profile) {
    const bmrMifflin = mifflinStJeor(profile.weightKg, profile.heightCm, profile.age, profile.sex);
    const bmrKatch = profile.bodyFat !== null ? katchMcardle(profile.weightKg, profile.bodyFat) : null;
    const primaryBmr = bmrKatch ? ((bmrKatch + bmrMifflin) / 2) : bmrMifflin;
    const baselineMultiplier = baselineActivityMultiplier(profile.dailyActivity, profile.dailySteps);
    const trainingCaloriesDaily = estimateTrainingCalories(
      profile.weightKg,
      profile.trainingFrequency,
      profile.sessionDuration,
      profile.trainingIntensity
    );
    const maintenanceRaw = (primaryBmr * baselineMultiplier) + trainingCaloriesDaily;
    const modeFactor = accuracyFactor(profile.accuracyMode);
    const maintenanceCalories = roundTo(maintenanceRaw * modeFactor, 10);
    const maintenanceLow = roundTo(maintenanceRaw * modeFactor * 0.92, 10);
    const maintenanceHigh = roundTo(maintenanceRaw * modeFactor * 1.08, 10);

    const calorieDelta = goalCalorieDelta(profile.goal, profile.targetPace, profile.bodyFat, profile.weightKg, maintenanceCalories);
    const targetCaloriesRaw = maintenanceCalories + calorieDelta;
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
      maintenanceLow,
      maintenanceHigh,
      targetCalories,
      bmrMifflin: roundTo(bmrMifflin, 1),
      bmrKatch: bmrKatch ? roundTo(bmrKatch, 1) : null,
      baselineMultiplier: roundTo(baselineMultiplier, 0.01),
      trainingCaloriesDaily: roundTo(trainingCaloriesDaily, 10),
      accuracyFactor: modeFactor,
      calorieDelta: roundTo(calorieDelta, 10),
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
    byId('resultMaintenanceCalories').textContent = formatKcal(calc.maintenanceCalories) + ' (' + formatKcal(calc.maintenanceLow) + '-' + formatKcal(calc.maintenanceHigh) + ' range)';
    byId('resultTargetCalories').textContent = formatKcal(calc.targetCalories);
    byId('resultProtein').textContent = formatGram(calc.macros.protein);
    byId('resultCarbs').textContent = formatGram(calc.macros.carbs);
    byId('resultFats').textContent = formatGram(calc.macros.fats);
    byId('resultFormula').textContent = calc.bmrKatch
      ? 'Mifflin + Katch average, lifestyle x' + calc.baselineMultiplier + ', +' + calc.trainingCaloriesDaily + ' training kcal/day, ' + profile.accuracyMode.replace(/_/g, ' ') + ' mode'
      : 'Mifflin-St Jeor, lifestyle x' + calc.baselineMultiplier + ', +' + calc.trainingCaloriesDaily + ' training kcal/day, ' + profile.accuracyMode.replace(/_/g, ' ') + ' mode';

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

    const filtered = getFilteredTemplates();
    const search = state.templateSearch;
    const hasSearch = search.length > 0;
    const hasFilter = state.selectedTemplateFilter !== 'all';
    const visibleTemplates = state.showAllTemplates || hasSearch || hasFilter ? filtered : filtered.slice(0, 6);
    const count = byId('templateResultCount');
    const intro = byId('templateLibraryIntro');
    const toggle = byId('toggleAllTemplates');
    if (intro) {
      intro.textContent = state.showAllTemplates || hasSearch || hasFilter
        ? 'Use search and filters together to narrow the library by goal, lifestyle, meal style or food preference.'
        : 'Showing the 6 strongest matches first so you do not have to scan every option.';
    }
    if (count) {
      count.textContent = filtered.length + ' template' + (filtered.length === 1 ? '' : 's') + ' found';
    }
    if (toggle) {
      toggle.hidden = filtered.length <= 6 || hasSearch || hasFilter;
      toggle.textContent = state.showAllTemplates ? 'Show Best Matches' : 'Show All Templates';
    }

    if (!visibleTemplates.length) {
      cards.innerHTML = '<p class="library-empty">No templates match this search. Try a broader goal, lifestyle or food term.</p>';
      return;
    }

    cards.innerHTML = visibleTemplates.map(function toCard(template) {
      const sampleDay = template.sampleDay.map(function toMeal(item) {
        return '<li><strong>' + item.meal + ':</strong> ' + item.example + '</li>';
      }).join('');
      const swaps = template.swaps.map(function toSwap(item) { return '<li>' + item + '</li>'; }).join('');
      const shopping = template.shoppingList.map(function toItem(item) { return '<li>' + item + '</li>'; }).join('');
      const tags = template.audienceTags.slice(0, 5).map(function toTag(tag) {
        return '<span>' + tag.replace(/_/g, ' ') + '</span>';
      }).join('');

      return [
        '<article class="template-card">',
        '<header>',
        '<h3>' + template.title + '</h3>',
        '<p class="template-meta">' + template.macroEmphasis + ' | ' + template.calorieRange[0] + '-' + template.calorieRange[1] + ' kcal | ' + template.mealFrequency + ' meals</p>',
        '<div class="template-pill-row">' + tags + '</div>',
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

  function getFilteredTemplates() {
    const filter = state.selectedTemplateFilter;
    const search = state.templateSearch;
    return state.templates.filter(function isMatch(template) {
      if (filter === 'all') return true;
      if (template.goal === filter) return true;
      return template.audienceTags.includes(filter);
    }).filter(function bySearch(template) {
      if (!search) return true;
      const sampleText = template.sampleDay.map(function mapMeal(item) {
        return item.meal + ' ' + item.example;
      }).join(' ');
      const haystack = normalizeSearch([
        template.title,
        template.goal,
        template.macroEmphasis,
        template.bestFor,
        template.notIdealFor,
        template.coachNote,
        template.audienceTags.join(' '),
        template.swaps.join(' '),
        template.shoppingList.join(' '),
        sampleText
      ].join(' '));
      return haystack.includes(search);
    });
  }

  function buildEmailPayload(profile, calc) {
    const recommendedTemplates = state.templates.slice(0, 3).map(function mapTemplate(template) {
      return {
        title: template.title,
        macroEmphasis: template.macroEmphasis,
        calorieRange: template.calorieRange,
        mealFrequency: template.mealFrequency,
        bestFor: template.bestFor,
        sampleDay: template.sampleDay
      };
    });

    return {
      name: profile.name,
      email: profile.email,
      source: 'Nutrition Calculator',
      page: window.location.pathname,
      consent: true,
      sendEmailCopy: true,
      profile: {
        sex: profile.sex,
        age: profile.age,
        heightCm: roundTo(profile.heightCm, 1),
        weightKg: roundTo(profile.weightKg, 1),
        bodyFat: profile.bodyFat,
        goal: profile.goal,
        trainingFrequency: profile.trainingFrequency,
        sessionDuration: profile.sessionDuration,
        trainingIntensity: profile.trainingIntensity,
        dailyActivity: profile.dailyActivity,
        dailySteps: profile.dailySteps,
        mealPreference: profile.mealPreference,
        dietPreference: profile.dietPreference,
        targetPace: profile.targetPace,
        accuracyMode: profile.accuracyMode,
        unitSystem: profile.unitSystem
      },
      result: {
        maintenanceCalories: calc.maintenanceCalories,
        maintenanceLow: calc.maintenanceLow,
        maintenanceHigh: calc.maintenanceHigh,
        targetCalories: calc.targetCalories,
        calorieDelta: calc.calorieDelta,
        baselineMultiplier: calc.baselineMultiplier,
        trainingCaloriesDaily: calc.trainingCaloriesDaily,
        accuracyFactor: calc.accuracyFactor,
        protein: calc.macros.protein,
        carbs: calc.macros.carbs,
        fats: calc.macros.fats,
        fiberTarget: calc.fiberTarget,
        waterLow: calc.waterLow,
        waterHigh: calc.waterHigh,
        mealSplitPlan: calc.mealSplitPlan,
        exampleDay: calc.exampleDay,
        warnings: calc.warnings
      },
      templates: recommendedTemplates
    };
  }

  async function sendNutritionPlanCopy(profile, calc) {
    const status = byId('nutrition-email-status');
    if (!isValidEmail(profile.email)) {
      if (status) {
        status.textContent = 'Add a valid email address if you want a copy sent to your inbox.';
        status.className = 'nutrition-email-status is-error';
      }
      return;
    }

    if (status) {
      status.textContent = 'Sending your nutrition plan copy...';
      status.className = 'nutrition-email-status';
    }

    try {
      const response = await fetch('/api/nutrition-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildEmailPayload(profile, calc))
      });
      const data = await response.json().catch(function fallbackJson() { return {}; });
      if (!response.ok || data.ok !== true) {
        throw new Error(data.error || 'Email send failed');
      }
      if (status) {
        status.textContent = data.emailSent ? 'Plan copy sent. Check your inbox.' : 'Plan saved. Email sending is not configured on this environment.';
        status.className = 'nutrition-email-status is-success';
      }
    } catch (error) {
      if (status) {
        status.textContent = 'Could not send the email copy right now. Your results are still shown below.';
        status.className = 'nutrition-email-status is-error';
      }
      console.warn('nutrition plan email failed', error);
    }
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
    const count = byId('foodResultCount');
    const foodItems = getFilteredFoodItems();

    if (count) {
      count.textContent = foodItems.length + ' food' + (foodItems.length === 1 ? '' : 's') + ' found';
    }

    if (!foodItems.length) {
      cards.innerHTML = '<p class="library-empty">No foods match this search. Try a different food, category or tag.</p>';
      return;
    }

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
        const item = getFilteredFoodItems()[index];
        if (!item) return;
        state.selectedFoods.push(item);
        renderSelectedFoods();
      });
    });
  }

  function getFilteredFoodItems() {
    const search = state.foodSearch;
    return getFoodLibrary().filter(function byFilter(item) {
      const categoryOk = state.foodCategoryFilter === CATEGORY_ALL || item.category === state.foodCategoryFilter;
      const tagOk = state.foodTagFilter === TAG_ALL || item.tags.includes(state.foodTagFilter);
      if (!categoryOk || !tagOk) return false;
      if (!search) return true;
      const haystack = normalizeSearch([
        item.name,
        item.category,
        item.serving,
        item.tags.join(' '),
        item.calories,
        item.protein,
        item.carbs,
        item.fats
      ].join(' '));
      return haystack.includes(search);
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
    const templateSearch = byId('templateSearch');
    if (templateSearch) {
      templateSearch.addEventListener('input', function onTemplateSearch() {
        state.templateSearch = normalizeSearch(templateSearch.value);
        state.showAllTemplates = false;
        renderTemplateCards();
      });
    }

    document.querySelectorAll('.filter-btn').forEach(function bindFilter(button) {
      button.addEventListener('click', function onFilter() {
        document.querySelectorAll('.filter-btn').forEach(function clearState(el) {
          el.classList.remove('is-active');
        });
        button.classList.add('is-active');
        state.selectedTemplateFilter = String(button.getAttribute('data-filter') || 'all');
        state.showAllTemplates = false;
        renderTemplateCards();
      });
    });
  }

  function setupFoodFilters() {
    const categorySelect = byId('foodCategory');
    const tagSelect = byId('foodTag');
    const foodSearch = byId('foodSearch');
    if (!categorySelect || !tagSelect) return;

    if (foodSearch) {
      foodSearch.addEventListener('input', function onFoodSearch() {
        state.foodSearch = normalizeSearch(foodSearch.value);
        renderFoodCards();
      });
    }

    categorySelect.addEventListener('change', function onCategoryChange() {
      state.foodCategoryFilter = categorySelect.value || CATEGORY_ALL;
      renderFoodCards();
    });

    tagSelect.addEventListener('change', function onTagChange() {
      state.foodTagFilter = tagSelect.value || TAG_ALL;
      renderFoodCards();
    });
  }

  function setupLibraryToggles() {
    const showFood = byId('showFoodLibrary');
    const hideFood = byId('hideFoodLibrary');
    const foodLibrary = byId('food-library');
    const toggleTemplates = byId('toggleAllTemplates');

    if (showFood && foodLibrary) {
      showFood.addEventListener('click', function onShowFood() {
        foodLibrary.hidden = false;
        showFood.hidden = true;
        foodLibrary.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    if (hideFood && foodLibrary && showFood) {
      hideFood.addEventListener('click', function onHideFood() {
        foodLibrary.hidden = true;
        showFood.hidden = false;
      });
    }

    if (toggleTemplates) {
      toggleTemplates.addEventListener('click', function onToggleTemplates() {
        state.showAllTemplates = !state.showAllTemplates;
        renderTemplateCards();
      });
    }
  }

  function initialize() {
    const form = byId('nutrition-calculator-form');
    if (!form) return;

    renderFoodSelectors();
    renderFoodCards();
    renderSelectedFoods();
    setupTemplateFilters();
    setupFoodFilters();
    setupLibraryToggles();

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
      if (!isValidEmail(profile.email)) errors.push('Add a valid email address to receive your plan.');
      if (!byId('sendPlanEmail')?.checked) errors.push('Confirm email delivery and lead-storage consent.');
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
      state.templateSearch = '';
      state.showAllTemplates = false;
      const templateSearch = byId('templateSearch');
      if (templateSearch) templateSearch.value = '';
      document.querySelectorAll('.filter-btn').forEach(function resetFilter(button) {
        button.classList.toggle('is-active', (button.getAttribute('data-filter') || 'all') === 'all');
      });

      renderResults(profile, calc);
      renderTemplateCards();
      byId('food-library').hidden = true;
      byId('showFoodLibrary').hidden = false;
      sendNutritionPlanCopy(profile, calc);
      byId('nutrition-results').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  document.addEventListener('DOMContentLoaded', initialize);
})();
