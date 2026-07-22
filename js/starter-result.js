(function () {
  const token = decodeURIComponent(window.location.pathname.split('/').filter(Boolean).pop() || '');
  const i18n = window.GB_STARTER_I18N;
  let language = i18n?.getBrowserLanguage?.() || 'en';
  const DELIVERY_KEY_PREFIX = 'gb_starter_delivery_';
  const title = document.querySelector('[data-result-title]');
  const summary = document.querySelector('[data-result-summary]');
  const primaryAction = document.querySelector('[data-primary-action]');
  const primaryActionLink = document.querySelector('[data-primary-action-link]');
  const deliveryNotice = document.querySelector('[data-delivery-notice]');
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
    if (!plan || !grid?.parentNode) return;

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
    grid.parentNode.insertBefore(section, grid);
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
      [payload.actions?.whatsappUrl, 'starter-secondary', copy('messageAndre'), 'whatsapp_clicked'],
      [payload.actions?.bookingUrl, 'starter-secondary', copy('bookConsultation'), 'consultation_clicked'],
      [payload.actions?.instagramUrl, 'starter-secondary', 'Instagram', 'instagram_clicked'],
      [payload.actions?.contactEmailUrl, 'starter-secondary', copy('emailAndre'), 'contact_email_clicked'],
      [payload.actions?.siteUrl, 'starter-secondary', copy('visitSite'), 'site_clicked']
    ];
    definitions.forEach(([href, className, label, eventName]) => {
      if (!href) return;
      const link = document.createElement('a');
      link.className = className;
      link.href = href;
      link.textContent = label;
      link.addEventListener('click', () => {
        if (['whatsapp_clicked', 'consultation_clicked'].includes(eventName)) recordEvent(eventName, eventName);
        else track(eventName, {});
      });
      contactLinks.push(link);
    });
    contactLinks.forEach((link) => actions.appendChild(link));
    if (contactHeading && contactCopy && !payload.actions?.showWarmLeadCta) {
      contactHeading.textContent = copy('helpPlanTitle');
      contactCopy.textContent = copy('helpPlanCopy');
    }
    warmSection.hidden = contactLinks.length === 0;
  }

  function renderPrimaryAction(payload) {
    if (!primaryAction || !primaryActionLink) return;
    const mode = payload.recommendation?.ctaMode || 'resources';
    const resources = payload.recommendation?.resources || [];
    const primaryResource = resources.find((resource) => resource.role === 'primary' && resource.available && resource.url);
    let href = '';
    let destination = '';
    let serverEvent = '';

    if (mode === 'conversation') {
      if (payload.actions?.whatsappUrl) {
        href = payload.actions.whatsappUrl;
        destination = 'whatsapp';
        serverEvent = 'whatsapp_clicked';
      } else if (payload.actions?.bookingUrl) {
        href = payload.actions.bookingUrl;
        destination = 'consultation';
        serverEvent = 'consultation_clicked';
      } else if (payload.actions?.contactEmailUrl) {
        href = payload.actions.contactEmailUrl;
        destination = 'email';
      }
    } else if (mode === 'templates') {
      href = '#starter-plan';
      destination = 'starter_plan';
    } else if (primaryResource) {
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
    primaryActionLink.textContent = payload.recommendation.supportCTA;
    primaryActionLink.target = mode === 'resources' ? '_blank' : '';
    primaryActionLink.rel = mode === 'resources' ? 'noopener' : '';
    primaryActionLink.onclick = (event) => {
      track('primary_recommendation_cta_clicked', { cta_mode: mode, destination_slug: destination });
      if (serverEvent) recordEvent(serverEvent, `primary_${destination}`);
      if (mode === 'templates') {
        event.preventDefault();
        const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        document.querySelector(href)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      }
    };
    primaryAction.hidden = false;
  }

  async function loadResult() {
    if (!token) throw new Error(copy('resultNotFound'));
    const response = await fetch(`/api/starter-assessment/result/${encodeURIComponent(token)}?language=${encodeURIComponent(language)}`);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) throw new Error(payload.error || copy('resultNotFound'));
    title.textContent = copy('resultHeading', { title: payload.recommendation.resultTitle });
    summary.textContent = payload.recommendation.summary;
    renderPlanSection(payload.recommendation.starterPlan);
    grid.innerHTML = '';
    payload.recommendation.resources.forEach((resource) => grid.appendChild(renderResource(resource)));
    grid.hidden = false;
    renderPrimaryAction(payload);
    renderActions(payload);
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
    i18n?.applyDocument?.(language);
    renderDeliveryNotice();
    const slowLoadTimer = setTimeout(() => {
      if (!grid.hidden || !summary) return;
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
      grid.hidden = true;
      primaryAction.hidden = true;
      warmSection.hidden = true;
      track('result_load_failed', {});
    }).finally(() => {
      clearTimeout(slowLoadTimer);
    });
  });
})();
