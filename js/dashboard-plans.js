(function initDashboardPlans(global) {
  'use strict';

  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const today = () => new Date().toISOString().slice(0, 10);
  const formatDate = (value) => {
    if (!value) return '';
    return new Intl.DateTimeFormat(document.documentElement.lang || 'en', { day: 'numeric', month: 'short', year: 'numeric' })
      .format(new Date(`${value}T12:00:00`));
  };

  const state = { templates: [], workouts: [], nutrition: [] };

  const setStatus = (message, tone = '') => {
    const status = qs('#plan-hub-status');
    if (!status) return;
    status.textContent = message;
    status.className = `plan-hub-status${tone ? ` is-${tone}` : ''}`;
  };

  const setBusy = (form, busy) => {
    const button = qs('button[type="submit"]', form);
    if (!button) return;
    button.disabled = busy;
    button.setAttribute('aria-busy', String(busy));
  };

  const create = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text != null) element.textContent = text;
    return element;
  };

  const activeTemplate = (type) => state.templates.find((item) => item.template_type === type && item.is_active)
    || state.templates.find((item) => item.template_type === type);

  const renderActiveCard = (type) => {
    const root = qs(`#active-${type}-plan`);
    if (!root) return;
    const plan = activeTemplate(type);
    const heading = qs('h3', root);
    const description = qs('p', root);
    const link = qs('a', root);
    if (!plan) {
      heading.textContent = type === 'workout' ? 'No workout selected' : 'No nutrition plan selected';
      description.textContent = type === 'workout'
        ? 'Choose any workout from the library and add it to your account.'
        : 'Calculate your targets and save one of the matched templates.';
      link.href = type === 'workout' ? '/workouts' : '/nutrition-calculator';
      link.firstChild.textContent = type === 'workout' ? 'Browse workout templates ' : 'Browse nutrition templates ';
      return;
    }

    heading.textContent = plan.title;
    const snapshot = plan.template_snapshot || {};
    if (type === 'workout') {
      const meta = [snapshot.level, snapshot.schedule, snapshot.project].filter(Boolean).join(' · ');
      description.textContent = meta || 'Ready to use in your next training session.';
      link.href = plan.source_url || '/workouts';
      link.firstChild.textContent = 'Open workout plan ';
    } else {
      const range = Array.isArray(snapshot.calorieRange) ? `${snapshot.calorieRange[0]}-${snapshot.calorieRange[1]} kcal` : '';
      description.textContent = [snapshot.macroEmphasis, range].filter(Boolean).join(' · ') || 'Ready for your next nutrition check-in.';
      link.href = plan.source_url || '/nutrition-calculator';
      link.firstChild.textContent = 'Open nutrition plan ';
    }
  };

  const renderSavedPlans = () => {
    const list = qs('#saved-plan-list');
    const count = qs('#saved-plan-count');
    if (!list || !count) return;
    count.textContent = `${state.templates.length} plan${state.templates.length === 1 ? '' : 's'}`;
    list.replaceChildren();

    if (!state.templates.length) {
      list.append(create('div', 'plan-empty-state', 'Your saved workout and nutrition templates will appear here.'));
      return;
    }

    state.templates.forEach((plan) => {
      const item = create('article', `saved-plan-item${plan.is_active ? ' is-active' : ''}`);
      const copy = create('div', 'saved-plan-copy');
      const type = create('span', 'saved-plan-type', plan.template_type === 'workout' ? 'Workout' : 'Nutrition');
      const title = create('h4', '', plan.title);
      const meta = create('p', '', plan.is_active ? 'Active plan' : `Saved ${formatDate((plan.created_at || '').slice(0, 10))}`);
      copy.append(type, title, meta);

      const actions = create('div', 'saved-plan-actions');
      if (!plan.is_active) {
        const use = create('button', 'plan-action-primary', 'Use this plan');
        use.type = 'button';
        use.addEventListener('click', async () => {
          use.disabled = true;
          const result = await global.GBPlanStore.setActiveTemplate(plan.id, plan.template_type);
          state.templates.forEach((itemPlan) => {
            if (itemPlan.template_type === plan.template_type) itemPlan.is_active = itemPlan.id === plan.id;
          });
          renderAll();
          setStatus(result.synced ? `${plan.title} is now active.` : `${plan.title} is active on this device; cloud sync will retry.`, result.synced ? 'success' : 'warning');
        });
        actions.append(use);
      }
      const remove = create('button', 'plan-action-secondary', 'Remove');
      remove.type = 'button';
      remove.addEventListener('click', async () => {
        remove.disabled = true;
        try {
          await global.GBPlanStore.deleteTemplate(plan.id);
          state.templates = state.templates.filter((itemPlan) => itemPlan.id !== plan.id);
          renderAll();
          setStatus(`${plan.title} was removed.`, 'success');
        } catch (error) {
          remove.disabled = false;
          setStatus('This plan could not be removed. Please try again.', 'error');
        }
      });
      actions.append(remove);
      item.append(copy, actions);
      list.append(item);
    });
  };

  const fillPlanSelects = () => {
    const fill = (selector, type, emptyLabel) => {
      const select = qs(selector);
      if (!select) return;
      const current = select.value;
      select.replaceChildren(new Option(emptyLabel, ''));
      state.templates.filter((item) => item.template_type === type).forEach((plan) => {
        const option = new Option(`${plan.title}${plan.is_active ? ' (active)' : ''}`, plan.id);
        select.add(option);
      });
      const active = activeTemplate(type);
      select.value = state.templates.some((item) => item.id === current) ? current : (active?.id || '');
    };
    fill('#workout-day-form select[name="saved_template_id"]', 'workout', 'Unplanned workout');
    fill('#nutrition-day-form select[name="saved_template_id"]', 'nutrition', 'No saved plan');
  };

  const renderHistory = () => {
    const root = qs('#plan-history-list');
    if (!root) return;
    root.replaceChildren();
    const entries = [
      ...state.workouts.map((item) => ({ ...item, kind: 'workout', date: item.workout_date })),
      ...state.nutrition.map((item) => ({ ...item, kind: 'nutrition', date: item.log_date }))
    ].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 20);

    if (!entries.length) {
      root.append(create('div', 'plan-empty-state', 'Complete your first workout or nutrition day to start the timeline.'));
      return;
    }

    entries.forEach((entry) => {
      const item = create('article', 'history-item');
      const icon = create('span', `history-icon history-icon-${entry.kind}`);
      icon.innerHTML = entry.kind === 'workout' ? '<i class="fas fa-dumbbell" aria-hidden="true"></i>' : '<i class="fas fa-utensils" aria-hidden="true"></i>';
      const copy = create('div', 'history-copy');
      const title = entry.kind === 'workout'
        ? (entry.workout_name || entry.title || 'Workout completed')
        : `Nutrition · ${entry.adherence_percent || 0}% on plan`;
      copy.append(create('h4', '', title));
      const details = entry.kind === 'workout'
        ? [entry.duration_minutes ? `${entry.duration_minutes} min` : '', entry.completed ? 'Completed' : 'Logged'].filter(Boolean).join(' · ')
        : [entry.meals_completed != null ? `${entry.meals_completed}/${entry.target_meals || 0} meals` : '', entry.water_ml ? `${entry.water_ml} ml water` : '', entry.calories ? `${entry.calories} kcal` : ''].filter(Boolean).join(' · ');
      copy.append(create('p', '', details || 'Daily entry saved'));
      item.append(icon, copy, create('time', '', formatDate(entry.date)));
      root.append(item);
    });
  };

  const updateDashboardCounters = () => {
    const completed = state.workouts.filter((item) => item.completed !== false).length;
    const uniqueDates = Array.from(new Set([
      ...state.workouts.map((item) => item.workout_date),
      ...state.nutrition.map((item) => item.log_date)
    ].filter(Boolean))).sort().reverse();
    let streak = 0;
    const cursor = new Date();
    cursor.setHours(12, 0, 0, 0);
    for (let offset = 0; offset < 366; offset += 1) {
      const key = cursor.toISOString().slice(0, 10);
      if (uniqueDates.includes(key)) streak += 1;
      else if (offset > 0 || !uniqueDates.includes(today())) break;
      cursor.setDate(cursor.getDate() - 1);
    }
    const set = (selector, value) => { const element = qs(selector); if (element) element.textContent = value; };
    set('#workouts-completed', completed);
    set('#total-sessions', completed);
    set('#current-streak', streak);
    set('#highlight-training', `${completed} session${completed === 1 ? '' : 's'}`);
    set('#highlight-streak', `${streak} day${streak === 1 ? '' : 's'}`);
  };

  const renderAll = () => {
    renderActiveCard('workout');
    renderActiveCard('nutrition');
    renderSavedPlans();
    fillPlanSelects();
    renderHistory();
    updateDashboardCounters();
  };

  const bindTabs = () => {
    qsa('[data-log-tab]').forEach((button) => {
      button.addEventListener('click', () => {
        const target = button.dataset.logTab;
        qsa('[data-log-tab]').forEach((tab) => {
          const active = tab === button;
          tab.classList.toggle('is-active', active);
          tab.setAttribute('aria-selected', String(active));
        });
        qsa('[data-log-panel]').forEach((panel) => { panel.hidden = panel.dataset.logPanel !== target; });
      });
    });
  };

  const bindForms = () => {
    const workoutForm = qs('#workout-day-form');
    const nutritionForm = qs('#nutrition-day-form');
    [workoutForm, nutritionForm].forEach((form) => {
      const dateInput = form?.querySelector('input[type="date"]');
      if (dateInput && !dateInput.value) dateInput.value = today();
    });

    workoutForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      setBusy(workoutForm, true);
      const values = Object.fromEntries(new FormData(workoutForm));
      const selected = state.templates.find((item) => item.id === values.saved_template_id);
      try {
        const result = await global.GBPlanStore.saveWorkoutLog({
          ...values,
          title: selected?.title || 'Workout completed',
          workout_name: selected?.title || 'Workout completed',
          exercises: selected?.template_snapshot?.exercises || [],
          completed: true
        });
        state.workouts = [result.data, ...state.workouts];
        workoutForm.elements.notes.value = '';
        workoutForm.elements.duration_minutes.value = '';
        renderAll();
        setStatus(result.synced ? 'Workout saved to your account.' : 'Workout saved on this device; cloud sync will retry.', result.synced ? 'success' : 'warning');
      } catch (_) {
        setStatus('Your workout could not be saved. Please sign in again and retry.', 'error');
      } finally {
        setBusy(workoutForm, false);
      }
    });

    nutritionForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      setBusy(nutritionForm, true);
      const values = Object.fromEntries(new FormData(nutritionForm));
      try {
        const result = await global.GBPlanStore.saveNutritionLog(values);
        state.nutrition = [result.data, ...state.nutrition.filter((item) => item.log_date !== result.data.log_date)];
        renderAll();
        setStatus(result.synced ? 'Nutrition day saved to your account.' : 'Nutrition day saved on this device; cloud sync will retry.', result.synced ? 'success' : 'warning');
      } catch (_) {
        setStatus('Your nutrition day could not be saved. Please sign in again and retry.', 'error');
      } finally {
        setBusy(nutritionForm, false);
      }
    });
  };

  const load = async () => {
    if (!global.GBPlanStore) return;
    setStatus('Loading your plans...');
    try {
      const pending = await global.GBPlanStore.consumePendingTemplate();
      const [templates, logs] = await Promise.all([
        global.GBPlanStore.listTemplates(),
        global.GBPlanStore.listRecentLogs(30)
      ]);
      state.templates = templates.data || [];
      state.workouts = logs.workouts || [];
      state.nutrition = logs.nutrition || [];
      renderAll();
      if (pending && !pending.requiresAuth) {
        setStatus(`${pending.data.title} was added to your account.`, pending.synced ? 'success' : 'warning');
      } else if (!templates.synced || !logs.synced) {
        setStatus('Showing locally saved data. Cloud sync will retry when the connection is available.', 'warning');
      } else {
        setStatus('Your plans and daily progress are synced.', 'success');
      }
    } catch (error) {
      console.warn('[DashboardPlans] Initialization failed:', error);
      setStatus('Sign in to load and save your training and nutrition plans.', 'error');
    }
  };

  const init = () => {
    if (!qs('#my-plans')) return;
    bindTabs();
    bindForms();
    load();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})(window);
