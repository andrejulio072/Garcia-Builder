(function () {
  const resultPathSegment = window.location.pathname.split('/').filter(Boolean).pop() || '';
  const resultParams = new URLSearchParams(window.location.search);
  const tokenFromPath = /^(?:start-result(?:\.html)?)$/i.test(resultPathSegment)
    ? ''
    : decodeURIComponent(resultPathSegment);
  const token = tokenFromPath || decodeURIComponent(resultParams.get('token') || resultParams.get('resultToken') || '');
  const i18n = window.GB_STARTER_I18N;
  let language = i18n?.getBrowserLanguage?.() || 'en';
  const extendedLanguages = ['fr', 'it', 'de', 'pl', 'ro', 'ar', 'ru'];
  const isCardResult = resultParams.get('source') === 'card' || extendedLanguages.includes(language);
  const DELIVERY_KEY_PREFIX = 'gb_starter_delivery_';
  const title = document.querySelector('[data-result-title]');
  const summary = document.querySelector('[data-result-summary]');
  const primaryAction = document.querySelector('[data-primary-action]');
  const primaryActionLink = document.querySelector('[data-primary-action-link]');
  const deliveryNotice = document.querySelector('[data-delivery-notice]');
  const panel = document.querySelector('[data-result-panel]');
  const planMount = document.querySelector('[data-plan-mount]');
  const resourceSection = document.querySelector('[data-resource-section]');
  const grid = document.querySelector('[data-resource-grid]');
  const warmSection = document.querySelector('[data-warm-section]');
  const actions = document.querySelector('[data-contact-actions]');
  const contactHeading = warmSection?.querySelector('h2');
  const contactCopy = warmSection?.querySelector('p');

  function copy(key, variables) {
    return i18n?.ui?.(key, language, variables) || key;
  }

  function track(eventName, properties) {
    const safeProperties = { language, ...(properties || {}) };
    if (window.GB_TRACKING?.trackEvent) {
      window.GB_TRACKING.trackEvent(eventName, safeProperties);
      return;
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...safeProperties });
  }

  function renderDeliveryNotice() {
    if (!deliveryNotice || !token) return;
    let deliveryStatus = '';
    try { deliveryStatus = sessionStorage.getItem(`${DELIVERY_KEY_PREFIX}${token}`) || ''; } catch (_) {}
    if (!deliveryStatus) return;
    deliveryNotice.classList.toggle('delivery-notice-warning', deliveryStatus !== 'sent');
    deliveryNotice.textContent = deliveryStatus === 'sent' ? copy('emailSent') : copy('emailNotSent');
    deliveryNotice.hidden = false;
    track('assessment_delivery_notice_viewed', { email_delivery: deliveryStatus });
  }

  function appendList(parent, items) {
    if (!Array.isArray(items) || items.length === 0) return;
    const list = document.createElement('ul');
    items.forEach((value) => {
      const item = document.createElement('li');
      item.textContent = value;
      list.appendChild(item);
    });
    parent.appendChild(list);
  }

  function renderPlanSection(plan) {
    document.querySelectorAll('[data-generated-plan]').forEach((node) => node.remove());
    if (!plan || !planMount) return;

    const section = document.createElement('section');
    section.className = 'starter-plan-output';
    section.id = 'starter-plan';
    section.setAttribute('data-generated-plan', '');
    const heading = document.createElement('h2');
    heading.textContent = plan.title || copy('planDefault');
    const goal = document.createElement('p');
    goal.className = 'plan-goal';
    goal.textContent = plan.goalTarget || copy('planGoalDefault');
    section.append(heading, goal);

    const planGrid = document.createElement('div');
    planGrid.className = 'starter-plan-grid';
    const trainingBlock = document.createElement('article');
    trainingBlock.className = 'starter-plan-block';
    const trainingTitle = document.createElement('h3');
    trainingTitle.textContent = copy('trainingWeek', { title: plan.training?.title || '' });
    trainingBlock.appendChild(trainingTitle);
    appendList(trainingBlock, plan.training?.weeklyStructure);
    (plan.training?.sessions || []).forEach((session) => {
      const sessionHeading = document.createElement('h4');
      sessionHeading.textContent = session.name;
      const focus = document.createElement('p');
      focus.textContent = session.focus;
      trainingBlock.append(sessionHeading, focus);
      appendList(trainingBlock, session.work);
    });
    if (plan.training?.libraryUrl) {
      const workoutLink = document.createElement('a');
      workoutLink.className = 'starter-secondary plan-link';
      workoutLink.href = plan.training.libraryUrl;
      workoutLink.textContent = copy('workoutLibrary');
      workoutLink.addEventListener('click', () => recordEvent('workout_template_viewed', 'workout_library'));
      trainingBlock.appendChild(workoutLink);
    }

    const nutritionBlock = document.createElement('article');
    nutritionBlock.className = 'starter-plan-block';
    const nutritionTitle = document.createElement('h3');
    nutritionTitle.textContent = copy('nutritionTargets', { title: plan.nutrition?.title || '' });
    nutritionBlock.appendChild(nutritionTitle);
    appendList(nutritionBlock, plan.nutrition?.macroTargets);
    if (plan.nutrition?.calculatorUrl) {
      const calculatorLink = document.createElement('a');
      calculatorLink.className = 'starter-secondary plan-link';
      calculatorLink.href = plan.nutrition.calculatorUrl;
      calculatorLink.textContent = copy('calculateMacros');
      calculatorLink.addEventListener('click', () => recordEvent('nutrition_template_viewed', 'macro_calculator'));
      nutritionBlock.appendChild(calculatorLink);
    }

    const mealsBlock = document.createElement('article');
    mealsBlock.className = 'starter-plan-block starter-plan-block-wide';
    const mealsTitle = document.createElement('h3');
    mealsTitle.textContent = copy('eatingDay');
    mealsBlock.appendChild(mealsTitle);
    const mealList = document.createElement('div');
    mealList.className = 'meal-template-list';
    (plan.nutrition?.meals || []).forEach((meal) => {
      const mealItem = document.createElement('div');
      const mealName = document.createElement('strong');
      mealName.textContent = meal.meal;
      const mealCopy = document.createElement('p');
      mealCopy.textContent = `${meal.example}. ${meal.purpose}`;
      mealItem.append(mealName, mealCopy);
      mealList.appendChild(mealItem);
    });
    mealsBlock.appendChild(mealList);
    const shoppingTitle = document.createElement('h4');
    shoppingTitle.textContent = copy('shoppingList');
    mealsBlock.appendChild(shoppingTitle);
    appendList(mealsBlock, plan.nutrition?.shoppingList);

    const nextStepsBlock = document.createElement('article');
    nextStepsBlock.className = 'starter-plan-block starter-plan-block-wide';
    const nextTitle = document.createElement('h3');
    nextTitle.textContent = copy('nextDays');
    nextStepsBlock.appendChild(nextTitle);
    appendList(nextStepsBlock, plan.nextSteps);
    planGrid.append(trainingBlock, nutritionBlock, mealsBlock, nextStepsBlock);
    section.appendChild(planGrid);
    planMount.appendChild(section);
  }

  function recordEvent(eventName, eventKey) {
    if (!token) return Promise.resolve();
    track(eventName, { event_key: eventKey || eventName });
    return fetch('/api/starter-assessment/event', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ resultToken: token, eventName, eventKey: eventKey || eventName })
    }).catch(() => {});
  }

  function resourceEventName(role) {
    if (role === 'primary') return 'guide_downloaded';
    if (role === 'workout') return 'workout_template_viewed';
    return 'nutrition_template_viewed';
  }

  function isExternalUrl(url) {
    try {
      return new URL(url, window.location.origin).origin !== window.location.origin;
    } catch (_) {
      return false;
    }
  }

  function isDownloadUrl(url) {
    return /\.(pdf|zip|docx?|xlsx?)($|[?#])/i.test(String(url || ''));
  }

  function renderResource(resource) {
    const article = document.createElement('article');
    article.className = 'resource-card';
    const heading = document.createElement('h2');
    heading.textContent = resource.requestedTitle || resource.title;
    const resourceCopy = document.createElement('p');
    resourceCopy.textContent = resource.description;
    article.append(heading, resourceCopy);
    if (Array.isArray(resource.details) && resource.details.length > 0) {
      const list = document.createElement('ul');
      list.className = 'resource-detail-list';
      resource.details.forEach((detail) => {
        const item = document.createElement('li');
        item.textContent = detail;
        list.appendChild(item);
      });
      article.appendChild(list);
    }
    if (resource.available && resource.url) {
      const link = document.createElement('a');
      link.className = resource.role === 'primary' ? 'starter-primary' : 'starter-secondary';
      link.href = resource.url;
      link.dataset.resourceLink = resource.slug || resource.role || 'resource';
      if (isExternalUrl(resource.url)) {
        link.target = '_blank';
        link.rel = 'noopener';
      }
      if (isDownloadUrl(resource.url)) {
        link.setAttribute('download', resource.downloadFilename || '');
        link.dataset.downloadResource = 'true';
      }
      link.textContent = resource.actionLabel || (resource.role === 'primary' ? copy('downloadGuide') : copy('openResource'));
      link.setAttribute('aria-label', `${link.textContent}: ${resource.title}`);
      link.addEventListener('click', () => recordEvent(resourceEventName(resource.role), resource.slug));
      article.appendChild(link);
    } else {
      const unavailable = document.createElement('span');
      unavailable.className = 'resource-included';
      unavailable.textContent = copy('included');
      article.appendChild(unavailable);
    }
    return article;
  }

  function renderActions(payload) {
    actions.innerHTML = '';
    const contactLinks = [];
    const definitions = [
      [payload.actions?.whatsappUrl, 'starter-secondary', copy('messageAndre'), 'whatsapp'],
      [payload.actions?.bookingUrl, 'starter-secondary', copy('bookConsultation'), 'booking'],
      [payload.actions?.instagramUrl, 'starter-secondary', 'Instagram', 'instagram'],
      [payload.actions?.contactEmailUrl, 'starter-secondary', copy('emailAndre'), 'email'],
      [payload.actions?.contactUrl || '/contact', 'starter-secondary', copy('contactAndreCta'), 'contact']
    ];
    definitions.forEach(([href, className, label, channel]) => {
      if (!href) return;
      const link = document.createElement('a');
      link.className = className;
      link.classList.add('result-action');
      link.href = href;
      link.textContent = label;
      link.addEventListener('click', () => {
        track('contact_click', { contact_channel: channel });
        if (['whatsapp', 'booking'].includes(channel)) recordEvent(`${channel}_clicked`, `${channel}_clicked`);
      });
      contactLinks.push(link);
    });

    const plansLink = document.createElement('a');
    plansLink.className = 'starter-secondary';
    plansLink.classList.add('result-action');
    plansLink.href = '/packages?utm_source=starter_assessment&utm_medium=result&utm_campaign=starter_plan&utm_content=view_plans';
    plansLink.textContent = copy('viewPlans');
    plansLink.addEventListener('click', () => track('view_plans_click', {}));

    const workoutLink = document.createElement('a');
    workoutLink.className = 'starter-secondary';
    workoutLink.classList.add('result-action');
    workoutLink.href = '/workouts?utm_source=starter_assessment&utm_medium=result&utm_campaign=starter_plan&utm_content=workout_library';
    workoutLink.textContent = copy('workoutLibrary');
    workoutLink.addEventListener('click', () => track('workout_tools_click', {}));

    const nutritionLink = document.createElement('a');
    nutritionLink.className = 'starter-secondary';
    nutritionLink.classList.add('result-action');
    nutritionLink.href = '/nutrition-calculator?utm_source=starter_assessment&utm_medium=result&utm_campaign=starter_plan&utm_content=nutrition_calculator';
    nutritionLink.textContent = copy('calculateMacros');
    nutritionLink.addEventListener('click', () => track('nutrition_tools_click', {}));

    const printButton = document.createElement('button');
    printButton.className = 'starter-secondary result-action result-print-action';
    printButton.type = 'button';
    printButton.textContent = copy('printPlan');
    printButton.addEventListener('click', () => {
      track('starter_plan_printed', {});
      window.print();
    });

    contactLinks.forEach((link) => actions.appendChild(link));
    actions.appendChild(plansLink);
    actions.appendChild(workoutLink);
    actions.appendChild(nutritionLink);
    actions.appendChild(printButton);

    if (contactHeading && contactCopy && !payload.actions?.showWarmLeadCta) {
      contactHeading.textContent = copy('helpPlanTitle');
      contactCopy.textContent = copy('helpPlanCopy');
    }
    warmSection.hidden = false;
  }

  function renderPrimaryAction(payload) {
    if (!primaryAction || !primaryActionLink) return;
    const mode = 'resources';
    const resources = payload.recommendation?.resources || [];
    const primaryResource = resources.find((resource) => resource.role === 'primary' && resource.available && resource.url);
    let href = '';
    let destination = '';
    let serverEvent = '';

    if (primaryResource) {
      href = primaryResource.url;
      destination = primaryResource.slug || 'primary_resource';
      serverEvent = resourceEventName(primaryResource.role);
    }

    if (!href) {
      primaryAction.hidden = true;
      return;
    }

    primaryAction.dataset.ctaMode = mode;
    primaryActionLink.href = href;
    primaryActionLink.textContent = copy('downloadGuide');
    if (isExternalUrl(href)) {
      primaryActionLink.target = '_blank';
      primaryActionLink.rel = 'noopener';
    } else {
      primaryActionLink.removeAttribute('target');
      primaryActionLink.removeAttribute('rel');
    }
    if (isDownloadUrl(href)) {
      primaryActionLink.setAttribute('download', primaryResource?.downloadFilename || '');
      primaryActionLink.dataset.downloadResource = 'true';
    }
    primaryActionLink.onclick = (event) => {
      track('primary_recommendation_cta_clicked', { cta_mode: mode, destination_slug: destination });
      if (serverEvent) recordEvent(serverEvent, `primary_${destination}`);
      void event;
    };
    primaryAction.hidden = false;
  }

  async function loadResult() {
    if (!token) throw new Error(copy('resultNotFound'));
    const response = await fetch(`/api/starter-assessment/result?token=${encodeURIComponent(token)}&language=${encodeURIComponent(language)}`);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) throw new Error(payload.error || copy('resultNotFound'));
    title.textContent = copy('resultHeading', { title: payload.recommendation.resultTitle });
    summary.textContent = payload.recommendation.summary;
    renderPlanSection(payload.recommendation.starterPlan);
    grid.innerHTML = '';
    renderPrimaryAction(payload);
    const secondaryResources = payload.recommendation.resources.filter((resource) => resource.role !== 'primary');
    secondaryResources.forEach((resource) => grid.appendChild(renderResource(resource)));
    resourceSection.hidden = secondaryResources.length === 0;
    renderActions(payload);
    panel?.classList.add('is-result-ready');
    track('result_viewed', { result_path_slug: payload.recommendation.primaryPath });
  }

  async function changeLanguage(selectedLanguage) {
    language = i18n?.setBrowserLanguage?.(selectedLanguage) || selectedLanguage;
    i18n?.applyDocument?.(language);
    renderDeliveryNotice();
    track('assessment_result_language_selected', { selected_language: language });
    await loadResult();
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!isCardResult) {
      document.querySelectorAll('[data-starter-language] option').forEach((option) => {
        if (extendedLanguages.includes(option.value)) option.remove();
      });
    }
    i18n?.applyDocument?.(language);
    renderDeliveryNotice();
    const slowLoadTimer = setTimeout(() => {
      if (panel?.classList.contains('is-result-ready') || !summary) return;
      summary.textContent = copy('resultStillLoading');
    }, 3500);
    document.querySelectorAll('[data-starter-language]').forEach((selector) => {
      selector.addEventListener('change', (event) => {
        changeLanguage(event.target.value).catch(() => {});
      });
    });
    loadResult().catch((error) => {
      title.textContent = copy('resultLoadErrorTitle');
      summary.textContent = error.message || copy('resultNotFound');
      resourceSection.hidden = true;
      primaryAction.hidden = true;
      warmSection.hidden = true;
      panel?.classList.add('is-result-error');
      track('result_load_failed', {});
    }).finally(() => {
      clearTimeout(slowLoadTimer);
    });
  });
})();
