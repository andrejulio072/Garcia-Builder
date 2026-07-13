(function () {
  const token = decodeURIComponent(window.location.pathname.split('/').filter(Boolean).pop() || '');
  const title = document.querySelector('[data-result-title]');
  const summary = document.querySelector('[data-result-summary]');
  const grid = document.querySelector('[data-resource-grid]');
  const warmSection = document.querySelector('[data-warm-section]');
  const actions = document.querySelector('[data-contact-actions]');
  const contactHeading = warmSection ? warmSection.querySelector('h2') : null;
  const contactCopy = warmSection ? warmSection.querySelector('p') : null;

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
