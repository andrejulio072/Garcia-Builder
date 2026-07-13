(function () {
  const token = decodeURIComponent(window.location.pathname.split('/').filter(Boolean).pop() || '');
  const title = document.querySelector('[data-result-title]');
  const summary = document.querySelector('[data-result-summary]');
  const grid = document.querySelector('[data-resource-grid]');
  const warmSection = document.querySelector('[data-warm-section]');
  const actions = document.querySelector('[data-contact-actions]');
  const contactHeading = warmSection ? warmSection.querySelector('h2') : null;
  const contactCopy = warmSection ? warmSection.querySelector('p') : null;

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
    if (!plan || !grid || !grid.parentNode) return;

    const section = document.createElement('section');
    section.className = 'starter-plan-output';
    section.setAttribute('data-generated-plan', '');

    const heading = document.createElement('h2');
    heading.textContent = plan.title || 'Your Practical Starter Plan';
    const goal = document.createElement('p');
    goal.className = 'plan-goal';
    goal.textContent = plan.goalTarget || 'Use this as your first-week structure before making advanced changes.';
    section.append(heading, goal);

    const planGrid = document.createElement('div');
    planGrid.className = 'starter-plan-grid';

    const trainingBlock = document.createElement('article');
    trainingBlock.className = 'starter-plan-block';
    const trainingTitle = document.createElement('h3');
    trainingTitle.textContent = `Training this week: ${plan.training?.title || 'Starter training structure'}`;
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

    const nutritionBlock = document.createElement('article');
    nutritionBlock.className = 'starter-plan-block';
    const nutritionTitle = document.createElement('h3');
    nutritionTitle.textContent = `Macro targets: ${plan.nutrition?.title || 'Nutrition starter framework'}`;
    nutritionBlock.appendChild(nutritionTitle);
    appendList(nutritionBlock, plan.nutrition?.macroTargets);
    if (plan.nutrition?.calculatorUrl) {
      const calculatorLink = document.createElement('a');
      calculatorLink.className = 'starter-secondary plan-link';
      calculatorLink.href = plan.nutrition.calculatorUrl;
      calculatorLink.textContent = 'Calculate exact macro targets';
      calculatorLink.addEventListener('click', () => recordEvent('nutrition_template_viewed', 'macro_calculator'));
      nutritionBlock.appendChild(calculatorLink);
    }

    const mealsBlock = document.createElement('article');
    mealsBlock.className = 'starter-plan-block starter-plan-block-wide';
    const mealsTitle = document.createElement('h3');
    mealsTitle.textContent = 'Simple day of eating';
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
    shoppingTitle.textContent = 'Starter shopping list';
    mealsBlock.appendChild(shoppingTitle);
    appendList(mealsBlock, plan.nutrition?.shoppingList);

    const nextStepsBlock = document.createElement('article');
    nextStepsBlock.className = 'starter-plan-block starter-plan-block-wide';
    const nextTitle = document.createElement('h3');
    nextTitle.textContent = 'Next 7 days';
    nextStepsBlock.appendChild(nextTitle);
    appendList(nextStepsBlock, plan.nextSteps);

    planGrid.append(trainingBlock, nutritionBlock, mealsBlock, nextStepsBlock);
    section.appendChild(planGrid);
    grid.parentNode.insertBefore(section, grid);
  }

  function track(eventName, properties) {
    const safeProperties = properties || {};
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...safeProperties });
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, safeProperties);
    }
  }

  function recordEvent(eventName, eventKey) {
    if (!token) return Promise.resolve();
    track(eventName, {});
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

  function renderResource(resource) {
    const article = document.createElement('article');
    article.className = 'resource-card';
    const heading = document.createElement('h2');
    heading.textContent = resource.requestedTitle || resource.title;
    const copy = document.createElement('p');
    copy.textContent = resource.description;
    article.append(heading, copy);

    if (resource.fallbackUsed && resource.unavailableTitle) {
      const note = document.createElement('p');
      note.className = 'fallback-note';
      note.textContent = `${resource.unavailableTitle} is being prepared. Use the 28-Day Kickstart for now.`;
      article.appendChild(note);
    }

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
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = resource.actionLabel || (resource.role === 'primary' ? 'Download My 28-Day Kickstart' : 'Open Resource');
      link.setAttribute('aria-label', `${link.textContent}: ${resource.title}`);
      link.addEventListener('click', () => recordEvent(resourceEventName(resource.role), resource.slug));
      article.appendChild(link);
    } else {
      const unavailable = document.createElement('span');
      unavailable.className = 'resource-included';
      unavailable.textContent = 'Included in your starter plan above';
      article.appendChild(unavailable);
    }
    return article;
  }

  function renderActions(payload) {
    actions.innerHTML = '';
    const contactLinks = [];
    if (payload.actions?.whatsappUrl) {
      const whatsapp = document.createElement('a');
      whatsapp.className = 'starter-primary';
      whatsapp.href = payload.actions.whatsappUrl;
      whatsapp.textContent = 'Message Andre on WhatsApp';
      whatsapp.addEventListener('click', () => recordEvent('whatsapp_clicked', 'whatsapp_clicked'));
      contactLinks.push(whatsapp);
    }
    if (payload.actions?.bookingUrl) {
      const booking = document.createElement('a');
      booking.className = 'starter-secondary';
      booking.href = payload.actions.bookingUrl;
      booking.textContent = 'Book a Consultation';
      booking.addEventListener('click', () => recordEvent('consultation_clicked', 'consultation_clicked'));
      contactLinks.push(booking);
    }
    if (payload.actions?.instagramUrl) {
      const instagram = document.createElement('a');
      instagram.className = 'starter-secondary';
      instagram.href = payload.actions.instagramUrl;
      instagram.textContent = 'Instagram';
      contactLinks.push(instagram);
    }
    if (payload.actions?.contactEmailUrl) {
      const email = document.createElement('a');
      email.className = 'starter-secondary';
      email.href = payload.actions.contactEmailUrl;
      email.textContent = 'Email Andre';
      contactLinks.push(email);
    }
    if (payload.actions?.siteUrl) {
      const site = document.createElement('a');
      site.className = 'starter-secondary';
      site.href = payload.actions.siteUrl;
      site.textContent = 'Visit Garcia Builder Fitness';
      contactLinks.push(site);
    }
    contactLinks.forEach((link) => actions.appendChild(link));
    if (contactHeading && contactCopy && !payload.actions?.showWarmLeadCta) {
      contactHeading.textContent = 'Want help turning this into a real plan?';
      contactCopy.textContent = 'Use the contact options below if you want Andre to review your goal, training schedule and nutrition starting point.';
    }
    warmSection.hidden = contactLinks.length === 0;
  }

  async function loadResult() {
    if (!token) throw new Error('Result not found.');
    const response = await fetch(`/api/starter-assessment/result/${encodeURIComponent(token)}`);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) throw new Error(payload.error || 'Unable to load this result right now.');

    title.textContent = `Your Best Starting Path: ${payload.recommendation.resultTitle}`;
    summary.textContent = payload.recommendation.summary;
    renderPlanSection(payload.recommendation.starterPlan);
    grid.innerHTML = '';
    payload.recommendation.resources.forEach((resource) => grid.appendChild(renderResource(resource)));
    grid.hidden = false;
    renderActions(payload);
    track('result_viewed', { result_path_slug: payload.recommendation.primaryPath });
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadResult().catch((error) => {
      title.textContent = 'We could not open this result link';
      summary.textContent = error.message || 'Please complete the assessment again to generate a fresh result.';
      grid.hidden = true;
      warmSection.hidden = true;
    });
  });
})();
