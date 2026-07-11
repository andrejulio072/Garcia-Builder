(function () {
  const token = decodeURIComponent(window.location.pathname.split('/').filter(Boolean).pop() || '');
  const title = document.querySelector('[data-result-title]');
  const summary = document.querySelector('[data-result-summary]');
  const grid = document.querySelector('[data-resource-grid]');
  const warmSection = document.querySelector('[data-warm-section]');
  const actions = document.querySelector('[data-contact-actions]');

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
    contactLinks.slice(0, 2).forEach((link) => actions.appendChild(link));
    warmSection.hidden = !payload.actions?.showWarmLeadCta || contactLinks.length === 0;
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
