(function () {
  const token = decodeURIComponent(window.location.pathname.split('/').filter(Boolean).pop() || '');
  const title = document.querySelector('[data-result-title]');
  const summary = document.querySelector('[data-result-summary]');
  const grid = document.querySelector('[data-resource-grid]');
  const warmSection = document.querySelector('[data-warm-section]');
  const nextStepTitle = document.querySelector('[data-next-step-title]');
  const nextStepCopy = document.querySelector('[data-next-step-copy]');
  const emailNotice = document.querySelector('[data-email-notice]');
  const actions = document.querySelector('[data-contact-actions]');

  function track(eventName, properties) {
    const safeProperties = properties || {};
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...safeProperties });
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

    if (resource.available && resource.url) {
      const link = document.createElement('a');
      link.className = resource.role === 'primary' ? 'starter-primary' : 'starter-secondary';
      link.href = resource.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = resource.role === 'primary' ? 'Download My 28-Day Kickstart' : 'View Resource';
      link.setAttribute('aria-label', `${link.textContent}: ${resource.title}`);
      link.addEventListener('click', () => recordEvent(resourceEventName(resource.role), resource.slug));
      article.appendChild(link);
    } else {
      const unavailable = document.createElement('span');
      unavailable.className = 'starter-secondary';
      unavailable.textContent = 'Resource coming soon';
      article.appendChild(unavailable);
    }
    return article;
  }

  function renderActions(payload) {
    actions.innerHTML = '';
    const temperature = payload.actions?.leadTemperatureCategory || 'cold';
    const links = {};

    if (payload.actions?.bookingUrl) {
      const booking = document.createElement('a');
      booking.className = 'starter-secondary';
      booking.href = payload.actions.bookingUrl;
      booking.textContent = 'Book a Free Coaching Consultation';
      booking.addEventListener('click', () => recordEvent('consultation_clicked', 'consultation_clicked'));
      links.booking = booking;
    }
    if (payload.actions?.whatsappUrl) {
      const whatsapp = document.createElement('a');
      whatsapp.className = 'starter-secondary';
      whatsapp.href = payload.actions.whatsappUrl;
      whatsapp.textContent = 'Message Andre About My Plan';
      whatsapp.addEventListener('click', () => recordEvent('whatsapp_clicked', 'whatsapp_clicked'));
      links.whatsapp = whatsapp;
    }

    const coaching = document.createElement('a');
    coaching.className = 'starter-secondary';
    coaching.href = payload.actions?.coachingUrl || '/online-coaching.html';
    coaching.textContent = 'Learn About Online Coaching';
    coaching.addEventListener('click', () => track('online_coaching_clicked', { lead_temperature_category: temperature }));
    links.coaching = coaching;

    const order = temperature === 'warm'
      ? ['booking', 'whatsapp']
      : temperature === 'interested'
        ? ['whatsapp', 'booking']
        : ['coaching'];

    if (temperature === 'warm') {
      nextStepTitle.textContent = 'Ready for a plan built around you?';
      nextStepCopy.textContent = 'Book a free coaching consultation to discuss your goal, schedule and the support that would help most.';
    } else if (temperature === 'interested') {
      nextStepTitle.textContent = 'Would you like help applying your result?';
      nextStepCopy.textContent = 'Message Andre about your plan or book a free consultation when you are ready.';
    } else {
      nextStepTitle.textContent = 'Want to see how tailored support works?';
      nextStepCopy.textContent = 'Use your free resources first, then learn how online coaching can add structure and accountability.';
    }

    order.map((key) => links[key]).filter(Boolean).forEach((link, index) => {
      link.className = index === 0 ? 'starter-primary' : 'starter-secondary';
      actions.appendChild(link);
    });
    warmSection.hidden = actions.children.length === 0;
  }

  async function loadResult() {
    if (!token) throw new Error('Result not found.');
    const response = await fetch(`/api/starter-assessment/result/${encodeURIComponent(token)}`);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) throw new Error(payload.error || 'Unable to load this result right now.');

    title.textContent = `Your Best Starting Path: ${payload.recommendation.resultTitle}`;
    summary.textContent = payload.recommendation.summary;
    grid.innerHTML = '';
    payload.recommendation.resources.forEach((resource) => grid.appendChild(renderResource(resource)));
    grid.hidden = false;
    renderActions(payload);
    emailNotice.hidden = payload.delivery?.emailSent !== false;
    track('result_viewed', {
      result_path_slug: payload.recommendation.primaryPath,
      lead_temperature_category: payload.actions?.leadTemperatureCategory || undefined
    });
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
