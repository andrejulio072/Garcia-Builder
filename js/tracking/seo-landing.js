
(function () {
  const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'];
  function readStoredAttribution() {
    try {
      const stored = JSON.parse(localStorage.getItem('gb_attrib_v1') || '{}');
      return stored && typeof stored === 'object' ? stored : {};
    } catch (e) {
      return {};
    }
  }
  function attribution() {
    return Object.assign({}, readStoredAttribution(), window.GB_ATTRIBUTION || {});
  }
  function attributionPayload() {
    const source = attribution();
    return UTM_KEYS.reduce((acc, key) => {
      if (source[key]) acc[key] = String(source[key]).slice(0, 160);
      return acc;
    }, {});
  }
  function pushEvent(eventName, params) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: eventName }, attributionPayload(), params || {}));
  }
  window.GB_SEO_TRACK = { pushEvent, attributionPayload };
  document.addEventListener('click', function (event) {
    const el = event.target.closest('[data-gb-event]');
    if (!el) return;
    const eventName = el.getAttribute('data-gb-event');
    if (!eventName) return;
    pushEvent(eventName, {
      cta_location: location.pathname,
      cta_text: (el.textContent || '').trim().slice(0, 80),
      package_id: el.getAttribute('data-package') || undefined,
      package_name: el.getAttribute('data-package-name') || undefined
    });
  });
  const pricing = document.querySelector('[data-view-pricing]');
  if (pricing && 'IntersectionObserver' in window) {
    let seen = false;
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!seen && entry.isIntersecting) {
          seen = true;
          pushEvent('view_pricing', { page_path: location.pathname });
          observer.disconnect();
        }
      });
    }, { threshold: 0.35 });
    observer.observe(pricing);
  }
  function values(form) {
    return Array.from(new FormData(form).entries()).reduce((acc, pair) => {
      acc[pair[0]] = pair[1];
      return acc;
    }, {});
  }
  function setStatus(form, message, isError) {
    const status = form.querySelector('.gb-form-status');
    if (status) {
      status.textContent = message || '';
      status.style.color = isError ? '#ffb4b4' : '#f8e08e';
    }
  }
  function bindApplication(form) {
    let started = false;
    form.addEventListener('input', function () {
      if (!started) {
        started = true;
        pushEvent('start_application', { form_id: 'coaching_application' });
      }
    }, { once: false });
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const data = values(form);
      const payload = Object.assign({}, data, attributionPayload(), {
        lead_id: (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : 'lead-' + Date.now(),
        source: 'Coaching Application',
        page: location.pathname,
        consent: Boolean(data.consent)
      });
      setStatus(form, 'Submitting your application...', false);
      try {
        const response = await fetch('/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.error || 'Application could not be submitted.');
        }
        pushEvent('generate_lead', { lead_type: 'coaching_application' });
        pushEvent('application_submit', { lead_type: 'coaching_application' });
        if (data.investmentReadiness === 'Ready Now' && (data.startTimeline === 'Now' || data.startTimeline === 'This Week')) {
          pushEvent('hot_lead', { readiness: 'ready_now', timeline: data.startTimeline });
        }
        location.assign('/thank-you-application');
      } catch (err) {
        setStatus(form, err.message || 'Something went wrong. Please try again.', true);
      }
    });
  }
  function bindEbook(form) {
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const data = values(form);
      const name = [data.firstName, data.lastName].filter(Boolean).join(' ').trim();
      const payload = Object.assign({}, attributionPayload(), {
        email: data.email,
        name,
        source: '28-Day Fat Loss Kickstart',
        guide: '28-day-fat-loss-kickstart',
        goal: data.goal,
        consent: Boolean(data.consent),
        page: location.pathname
      });
      setStatus(form, 'Sending the guide...', false);
      try {
        const response = await fetch('/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.error || 'Guide request could not be submitted.');
        }
        pushEvent('generate_lead', { lead_type: 'ebook' });
        pushEvent('ebook_download', { guide: '28-day-fat-loss-kickstart' });
        location.assign('/thank-you-ebook');
      } catch (err) {
        setStatus(form, err.message || 'Something went wrong. Please try again.', true);
      }
    });
  }
  document.querySelectorAll('[data-gb-application-form]').forEach(bindApplication);
  document.querySelectorAll('[data-gb-ebook-form]').forEach(bindEbook);
})();
