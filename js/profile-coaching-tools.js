(function profileCoachingToolsModule(global) {
  'use strict';

  const GOAL_SUGGESTIONS = [
    { title: 'Lose body fat steadily', category: 'Body composition', detail: 'Build a sustainable calorie deficit while keeping strength and energy.' },
    { title: 'Build lean muscle', category: 'Body composition', detail: 'Progress training volume, protein and recovery without rushing weight gain.' },
    { title: 'Improve body recomposition', category: 'Body composition', detail: 'Reduce fat and build strength with consistent training and nutrition.' },
    { title: 'Train 3 times every week', category: 'Consistency', detail: 'Create a realistic weekly rhythm and complete three quality sessions.' },
    { title: 'Complete 12 workouts this month', category: 'Consistency', detail: 'Use a clear monthly target that is easy to track.' },
    { title: 'Walk 8,000 steps per day', category: 'Daily movement', detail: 'Increase low-intensity activity for fitness, recovery and energy balance.' },
    { title: 'Reach my daily protein target', category: 'Nutrition', detail: 'Hit the saved protein goal on at least six days each week.' },
    { title: 'Prepare meals 4 days per week', category: 'Nutrition', detail: 'Reduce decision fatigue with repeatable meals and planned portions.' },
    { title: 'Drink 2 litres of water daily', category: 'Nutrition', detail: 'Build a dependable hydration baseline and adjust around training.' },
    { title: 'Add 10% to my main lifts', category: 'Strength', detail: 'Progress squat, press, hinge and pull patterns with good technique.' },
    { title: 'Complete my first pull-up', category: 'Strength', detail: 'Use assisted reps, rows, grip work and progressive overload.' },
    { title: 'Run my first 5K', category: 'Performance', detail: 'Build run-walk volume gradually while protecting recovery.' },
    { title: 'Improve my 5K time', category: 'Performance', detail: 'Combine easy runs, one quality session and strength support.' },
    { title: 'Improve mobility 10 minutes daily', category: 'Mobility', detail: 'Use short repeatable work for hips, upper back and shoulders.' },
    { title: 'Sleep 7+ hours consistently', category: 'Recovery', detail: 'Protect a regular sleep window on at least five nights per week.' },
    { title: 'Take 2 recovery sessions weekly', category: 'Recovery', detail: 'Schedule walking, mobility or easy aerobic work between hard sessions.' },
    { title: 'Reduce waist measurement', category: 'Health', detail: 'Track the trend monthly alongside strength, energy and adherence.' },
    { title: 'Feel more energetic during the workday', category: 'Lifestyle', detail: 'Balance meals, movement, sleep and training load for steady energy.' }
  ];

  const STARTER_WORKOUTS = [
    {
      key: 'full-body-foundation-3-day',
      title: 'Full Body Foundation',
      summary: 'Three balanced sessions for strength, confidence and consistent progress.',
      schedule: '3 days/week',
      duration: 45,
      exercises: ['Goblet squat 3 x 8-10', 'Dumbbell press 3 x 8-12', 'Cable or band row 3 x 10-12', 'Romanian deadlift 3 x 8-10', 'Farmer carry 3 x 30m']
    },
    {
      key: 'busy-professional-30-minute',
      title: 'Busy Professional 30-Minute Plan',
      summary: 'Efficient upper/lower sessions that fit a demanding work week.',
      schedule: '4 short days/week',
      duration: 30,
      exercises: ['Main lift 3 x 6-8', 'Push + pull superset 3 x 10', 'Lower body accessory 3 x 10', 'Core or carry finisher 5 min']
    },
    {
      key: 'home-dumbbell-strength',
      title: 'Home Dumbbell Strength',
      summary: 'A complete home plan using dumbbells, a bench and limited space.',
      schedule: '3 days/week',
      duration: 40,
      exercises: ['Dumbbell split squat 3 x 8/side', 'Floor press 3 x 10', 'One-arm row 3 x 10/side', 'Dumbbell hinge 3 x 10', 'Dead bug 3 x 8/side']
    },
    {
      key: 'fat-loss-strength-circuit',
      title: 'Fat Loss Strength Circuit',
      summary: 'Strength-first circuits with simple conditioning and controlled progression.',
      schedule: '4 days/week',
      duration: 40,
      exercises: ['Squat pattern 4 x 8', 'Incline press 4 x 10', 'Lat pulldown 4 x 10', 'Kettlebell swing 4 x 15', 'Bike or row intervals 8 min']
    },
    {
      key: 'strength-and-muscle-upper-lower',
      title: 'Strength & Muscle Upper/Lower',
      summary: 'Four gym sessions combining heavy compounds and hypertrophy accessories.',
      schedule: '4 days/week',
      duration: 60,
      exercises: ['Primary lift 4 x 5-6', 'Secondary compound 3 x 8', 'Two accessories 3 x 10-15', 'Core or carry 3 sets']
    },
    {
      key: 'mobility-reset',
      title: 'Desk Worker Mobility Reset',
      summary: 'Short strength and mobility sessions for hips, shoulders and posture.',
      schedule: '4 short days/week',
      duration: 25,
      exercises: ['90/90 hip switches 2 x 8', 'Band row 3 x 12', 'Split squat 3 x 8/side', 'Thoracic rotation 2 x 8/side', 'Suitcase carry 3 x 30m']
    }
  ];

  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const manager = () => global.GarciaProfileManager || global.ProfileManager;
  const profile = () => manager()?.getProfileData?.() || {};

  function notify(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type === 'error' ? 'danger' : type === 'warning' ? 'warning' : 'success'} position-fixed top-0 end-0 m-3`;
    alert.style.zIndex = '10000';
    alert.setAttribute('role', 'status');
    alert.textContent = message;
    document.body.appendChild(alert);
    global.setTimeout(() => alert.remove(), 3200);
  }

  function normalizeGoals(values) {
    return Array.from(new Set((Array.isArray(values) ? values : [])
      .map((value) => String(value || '').trim())
      .filter(Boolean)))
      .slice(0, 30);
  }

  function renderGoals() {
    const data = profile();
    const goals = normalizeGoals(data.basic?.goals);
    const selected = document.getElementById('selected-goals');
    const suggestions = document.getElementById('goal-suggestion-grid');
    if (!selected || !suggestions) return;

    selected.innerHTML = goals.length
      ? goals.map((goal) => `<span class="goal-chip"><span>${escapeHtml(goal)}</span><button type="button" data-remove-goal="${escapeHtml(goal)}" aria-label="Remove ${escapeHtml(goal)}"><i class="fas fa-times"></i></button></span>`).join('')
      : '<div class="alert-custom w-100"><i class="fas fa-bullseye me-2"></i>No goals selected yet. Choose a suggestion below or add your own.</div>';

    suggestions.innerHTML = GOAL_SUGGESTIONS.map((goal) => {
      const added = goals.includes(goal.title);
      return `<article class="goal-suggestion-card">
        <small class="text-warning text-uppercase fw-semibold">${escapeHtml(goal.category)}</small>
        <h5>${escapeHtml(goal.title)}</h5>
        <p>${escapeHtml(goal.detail)}</p>
        <button type="button" class="btn btn-sm ${added ? 'btn-outline-light' : 'btn-outline-warning'}" data-add-goal="${escapeHtml(goal.title)}" ${added ? 'disabled' : ''}>
          <i class="fas ${added ? 'fa-check' : 'fa-plus'} me-1"></i>${added ? 'Added' : 'Add goal'}
        </button>
      </article>`;
    }).join('');

    selected.querySelectorAll('[data-remove-goal]').forEach((button) => {
      button.addEventListener('click', () => saveGoals(goals.filter((goal) => goal !== button.dataset.removeGoal)));
    });
    suggestions.querySelectorAll('[data-add-goal]').forEach((button) => {
      button.addEventListener('click', () => saveGoals([...goals, button.dataset.addGoal]));
    });
  }

  async function saveGoals(nextGoals) {
    const data = profile();
    data.basic = data.basic || {};
    data.basic.goals = normalizeGoals(nextGoals);
    renderGoals();
    try {
      await manager().saveProfileData('basic');
      manager().updateBasicInfoDisplay?.();
      notify('Goals saved to your account.', 'success');
    } catch (error) {
      notify(error?.message || 'Goals could not be synced.', 'error');
    }
  }

  function setupGoals() {
    renderGoals();
    const input = document.getElementById('custom-goal-input');
    const add = document.getElementById('add-custom-goal');
    const submit = () => {
      const value = String(input?.value || '').trim();
      if (!value) return;
      const goals = normalizeGoals(profile().basic?.goals);
      saveGoals([...goals, value]);
      input.value = '';
    };
    add?.addEventListener('click', submit);
    input?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        submit();
      }
    });
  }

  function starterSnapshot(template) {
    return {
      summary: template.summary,
      schedule: template.schedule,
      duration_minutes: template.duration,
      level: 'Starter',
      goal: 'general fitness',
      place: 'home gym',
      sessions: [{ title: template.title, exercises: template.exercises }]
    };
  }

  function templateExercises(row) {
    const snapshot = row?.template_snapshot || {};
    if (Array.isArray(snapshot.exercises)) return snapshot.exercises;
    if (!Array.isArray(snapshot.sessions)) return [];
    return snapshot.sessions.flatMap((session) => {
      const exercises = Array.isArray(session?.exercises) ? session.exercises : [];
      return exercises.map((exercise) => typeof exercise === 'string'
        ? { name: exercise, session: session?.title || '' }
        : { ...exercise, session: exercise?.session || session?.title || '' });
    });
  }

  function applyWorkoutTemplate(row) {
    if (!row) return;
    const snapshot = row.template_snapshot || {};
    const title = document.getElementById('workout_title');
    const duration = document.getElementById('workout_duration');
    const notes = document.getElementById('workout_notes');
    const templateId = document.getElementById('workout_saved_template_id');
    const exercises = document.getElementById('workout_exercises_json');
    const select = document.getElementById('workout_template_select');

    if (title) title.value = row.title || 'Workout';
    if (duration) duration.value = Number(snapshot.duration_minutes) || 45;
    if (templateId) templateId.value = row.id || '';
    if (exercises) exercises.value = JSON.stringify(templateExercises(row));
    if (select && row.id) select.value = row.id;
    if (notes) {
      const details = [snapshot.summary, snapshot.schedule ? `Schedule: ${snapshot.schedule}` : ''].filter(Boolean);
      notes.value = details.join('\n');
    }
    global.GBPlanStore?.setActiveTemplate?.(row.id, 'workout').catch(() => {});
    document.getElementById('workouts-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function refreshWorkoutTemplates(preferredId) {
    const select = document.getElementById('workout_template_select');
    const empty = document.getElementById('workout-template-empty');
    const savedList = document.getElementById('saved-workout-template-list');
    const starterGrid = document.getElementById('starter-workout-grid');
    if (!select || !empty || !savedList || !starterGrid || !global.GBPlanStore) return [];

    try {
      const result = await global.GBPlanStore.listTemplates();
      const templates = (result.data || []).filter((item) => item.template_type === 'workout');
      profile().savedWorkoutTemplates = templates;
      select.innerHTML = templates.length
        ? '<option value="">Choose a saved template</option>' + templates.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.title)}${item.is_active ? ' — active' : ''}</option>`).join('')
        : '<option value="">No saved templates yet</option>';
      empty.hidden = templates.length > 0;

      savedList.innerHTML = templates.map((item) => {
        const snapshot = item.template_snapshot || {};
        return `<article class="template-card ${item.is_active ? 'is-active' : ''}">
          <small class="text-warning">${item.is_active ? 'ACTIVE PLAN' : 'SAVED PLAN'}</small>
          <h5>${escapeHtml(item.title)}</h5>
          <p>${escapeHtml(snapshot.summary || snapshot.schedule || 'Ready to use and track from your account.')}</p>
          <button type="button" class="btn btn-sm btn-outline-warning" data-use-template="${escapeHtml(item.id)}">Use for this workout</button>
        </article>`;
      }).join('');

      starterGrid.innerHTML = STARTER_WORKOUTS.map((item) => `<article class="template-card">
        <small class="text-warning">${escapeHtml(item.schedule)}</small>
        <h5>${escapeHtml(item.title)}</h5>
        <p>${escapeHtml(item.summary)}</p>
        <button type="button" class="btn btn-sm btn-outline-warning" data-add-starter="${escapeHtml(item.key)}"><i class="fas fa-plus me-1"></i>Add to my account</button>
      </article>`).join('');

      savedList.querySelectorAll('[data-use-template]').forEach((button) => {
        button.addEventListener('click', () => applyWorkoutTemplate(templates.find((item) => item.id === button.dataset.useTemplate)));
      });
      starterGrid.querySelectorAll('[data-add-starter]').forEach((button) => {
        button.addEventListener('click', async () => {
          const starter = STARTER_WORKOUTS.find((item) => item.key === button.dataset.addStarter);
          if (!starter) return;
          button.disabled = true;
          try {
            const saved = await global.GBPlanStore.saveTemplate({
              template_type: 'workout',
              template_key: starter.key,
              title: starter.title,
              source_url: '/pages/public/my-profile.html?tab=workouts',
              template_snapshot: starterSnapshot(starter)
            });
            notify('Workout template added to your account.', 'success');
            const updated = await refreshWorkoutTemplates(saved.data?.id);
            applyWorkoutTemplate(updated.find((item) => item.id === saved.data?.id));
          } catch (error) {
            notify(error?.message || 'Template could not be saved.', 'error');
          } finally {
            button.disabled = false;
          }
        });
      });

      const selectedId = preferredId || templates.find((item) => item.is_active)?.id;
      if (selectedId && templates.some((item) => item.id === selectedId)) select.value = selectedId;
      return templates;
    } catch (error) {
      select.innerHTML = '<option value="">Templates unavailable</option>';
      notify(error?.message || 'Workout templates could not be loaded.', 'warning');
      return [];
    }
  }

  function setupWorkouts() {
    refreshWorkoutTemplates();
    const select = document.getElementById('workout_template_select');
    document.getElementById('use-workout-template')?.addEventListener('click', () => {
      const templates = profile().savedWorkoutTemplates || [];
      const row = templates.find((item) => item.id === select?.value);
      if (!row) {
        notify('Choose a saved workout template first.', 'warning');
        return;
      }
      applyWorkoutTemplate(row);
    });
  }

  function ageFromBirthday(value) {
    if (!value) return 30;
    const birth = new Date(value);
    if (Number.isNaN(birth.getTime())) return 30;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const month = today.getMonth() - birth.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) age -= 1;
    return Math.max(16, Math.min(80, age));
  }

  function legacyGoal(value) {
    return ({ maintain: 'maintenance', cut: 'fat_loss', bulk: 'lean_muscle_gain' })[value] || value || 'maintenance';
  }

  function setValue(id, value) {
    const input = document.getElementById(id);
    if (input && value !== undefined && value !== null && value !== '') input.value = value;
  }

  function macroProfileFromForm() {
    const value = (id) => document.getElementById(id)?.value;
    const bodyFat = String(value('macros_body_fat') || '').trim();
    return {
      name: profile().basic?.full_name || '',
      email: profile().basic?.email || '',
      sex: value('macros_sex') || 'male',
      age: Number(value('macros_age')),
      heightCm: Number(value('macros_height')),
      weightKg: Number(value('macros_weight')),
      bodyFat: bodyFat ? Number(bodyFat) : null,
      goal: legacyGoal(value('macros_goal')),
      trainingFrequency: value('macros_training_frequency') || '3-4',
      sessionDuration: value('macros_session_duration') || '45',
      trainingIntensity: value('macros_training_intensity') || 'moderate',
      dailyActivity: value('macros_daily_activity') || 'light_movement',
      dailySteps: value('macros_daily_steps') || '4000_7000',
      mealPreference: value('macros_meal_preference') || '4',
      dietPreference: value('macros_diet_preference') || 'balanced',
      targetPace: value('macros_target_pace') || 'moderate',
      accuracyMode: value('macros_accuracy_mode') || 'conservative',
      unitSystem: 'metric'
    };
  }

  function showMacroErrors(errors) {
    const box = document.getElementById('advanced-macro-errors');
    if (!box) return;
    box.classList.toggle('d-none', !errors.length);
    box.innerHTML = errors.length ? `<strong>Check these details:</strong><ul class="mb-0 mt-2">${errors.map((error) => `<li>${escapeHtml(error)}</li>`).join('')}</ul>` : '';
  }

  function renderMacroCalculation(calc) {
    if (!calc) return;
    const setText = (id, value) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    };
    setText('display-target-calories', `${Math.round(calc.targetCalories)} kcal`);
    setText('display-maintenance-calories', `${Math.round(calc.maintenanceCalories)} kcal`);
    setText('display-protein-g', `${Math.round(calc.macros.protein)}g`);
    setText('display-carbs-g', `${Math.round(calc.macros.carbs)}g`);
    setText('display-fats-g', `${Math.round(calc.macros.fats)}g`);
    setText('display-fiber-g', `${Math.round(calc.fiberTarget)}g`);
    setText('display-water-range', `${(calc.waterLow / 1000).toFixed(1)}-${(calc.waterHigh / 1000).toFixed(1)}L`);
    document.getElementById('advanced-macro-results')?.classList.remove('d-none');
    const warnings = document.getElementById('advanced-macro-warnings');
    if (warnings) {
      const lines = Array.isArray(calc.warnings) ? calc.warnings : [];
      warnings.classList.toggle('d-none', !lines.length);
      warnings.innerHTML = lines.length ? `<strong>Safety notes</strong><ul class="mb-0 mt-2">${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>` : '';
    }
  }

  function calculateMacros(options) {
    const engine = global.GBAdvancedNutritionCalculator;
    if (!engine?.calculate) {
      showMacroErrors(['The advanced calculator is not available. Refresh and try again.']);
      return false;
    }
    const input = macroProfileFromForm();
    const output = engine.calculate(input);
    showMacroErrors(output.errors || []);
    if (!output.result) return false;

    const calc = output.result;
    const macroCalories = (calc.macros.protein * 4) + (calc.macros.carbs * 4) + (calc.macros.fats * 9);
    const percentages = {
      protein: Math.round((calc.macros.protein * 4 / macroCalories) * 100),
      carbs: Math.round((calc.macros.carbs * 4 / macroCalories) * 100)
    };
    percentages.fats = 100 - percentages.protein - percentages.carbs;

    const data = profile();
    data.macros = data.macros || {};
    Object.assign(data.macros, {
      goal: input.goal,
      activity_level: input.dailyActivity,
      calories: calc.targetCalories,
      protein_pct: percentages.protein,
      carbs_pct: percentages.carbs,
      fats_pct: percentages.fats,
      protein_g: calc.macros.protein,
      carbs_g: calc.macros.carbs,
      fats_g: calc.macros.fats,
      maintenance_calories: calc.maintenanceCalories,
      maintenance_low: calc.maintenanceLow,
      maintenance_high: calc.maintenanceHigh,
      fiber_g: calc.fiberTarget,
      water_low_ml: calc.waterLow,
      water_high_ml: calc.waterHigh,
      calculation_context: input,
      calculator_version: engine.version || 'advanced',
      calculated_at: new Date().toISOString()
    });

    setValue('macros_calories', calc.targetCalories);
    setValue('macros_protein_pct', percentages.protein);
    setValue('macros_carbs_pct', percentages.carbs);
    setValue('macros_fats_pct', percentages.fats);
    setValue('macros_protein_g', calc.macros.protein);
    setValue('macros_carbs_g', calc.macros.carbs);
    setValue('macros_fats_g', calc.macros.fats);
    setValue('macros_calculation_context', JSON.stringify(input));
    renderMacroCalculation(calc);
    if (options?.announce) notify('Advanced targets calculated. Save them to keep them in your account.', 'success');
    return calc;
  }

  function setupMacros() {
    const data = profile();
    const saved = data.macros || {};
    const context = saved.calculation_context && typeof saved.calculation_context === 'object' ? saved.calculation_context : {};
    const metrics = data.body_metrics || {};

    setValue('macros_sex', context.sex || 'male');
    setValue('macros_age', context.age || ageFromBirthday(data.basic?.birthday));
    setValue('macros_height', context.heightCm || metrics.height);
    setValue('macros_weight', context.weightKg || metrics.current_weight);
    setValue('macros_body_fat', context.bodyFat ?? metrics.body_fat_percentage);
    setValue('macros_goal', legacyGoal(context.goal || saved.goal));
    setValue('macros_training_frequency', context.trainingFrequency || '3-4');
    setValue('macros_session_duration', context.sessionDuration || '45');
    setValue('macros_training_intensity', context.trainingIntensity || 'moderate');
    setValue('macros_daily_activity', context.dailyActivity || saved.activity_level || 'light_movement');
    setValue('macros_daily_steps', context.dailySteps || '4000_7000');
    setValue('macros_meal_preference', context.mealPreference || '4');
    setValue('macros_diet_preference', context.dietPreference || 'balanced');
    setValue('macros_target_pace', context.targetPace || 'moderate');
    setValue('macros_accuracy_mode', context.accuracyMode || 'conservative');

    if (saved.calories && saved.protein_g && saved.carbs_g && saved.fats_g) {
      renderMacroCalculation({
        targetCalories: Number(saved.calories),
        maintenanceCalories: Number(saved.maintenance_calories || saved.calories),
        macros: { protein: Number(saved.protein_g), carbs: Number(saved.carbs_g), fats: Number(saved.fats_g) },
        fiberTarget: Number(saved.fiber_g || 25),
        waterLow: Number(saved.water_low_ml || 2000),
        waterHigh: Number(saved.water_high_ml || 3000),
        warnings: []
      });
    }

    document.getElementById('btn-run-advanced-macros')?.addEventListener('click', () => calculateMacros({ announce: true }));
  }

  async function initialize() {
    if (!document.getElementById('workouts-tab')) return;
    const profileManager = manager();
    if (!profileManager) return;
    await profileManager.init();
    setupGoals();
    setupWorkouts();
    setupMacros();
  }

  global.GBProfileCoachingTools = {
    initialize,
    calculateMacros,
    refreshWorkoutTemplates,
    renderGoals,
    goalSuggestions: GOAL_SUGGESTIONS,
    starterWorkouts: STARTER_WORKOUTS
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  else initialize();
})(window);
