(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const btn = document.getElementById('sendBtn');
  const alertBox = document.getElementById('form-alert');
  const firstNameEl = document.getElementById('firstName');
  const lastNameEl = document.getElementById('lastName');
  const emailEl = document.getElementById('email');
  const phoneEl = document.getElementById('phone');
  const goalEl = document.getElementById('goal');
  const currentWeightEl = document.getElementById('currentWeight');
  const mainStruggleEl = document.getElementById('mainStruggle');
  const trainingLocationEl = document.getElementById('trainingLocation');
  const startTimelineEl = document.getElementById('startTimeline');
  const investmentReadinessEl = document.getElementById('investmentReadiness');
  const consentEl = document.getElementById('consent');
  const sourceEl = document.getElementById('source');
  const pageEl = document.getElementById('page');
  const utmSourceEl = document.getElementById('utm_source');
  const utmMediumEl = document.getElementById('utm_medium');
  const utmCampaignEl = document.getElementById('utm_campaign');
  const utmContentEl = document.getElementById('utm_content');
  const utmTermEl = document.getElementById('utm_term');
  const btnLabel = btn ? btn.querySelector('[data-i18n="contact.form.submit"]') : null;
  const getCurrentLang = () => {
    try {
      return (window.GB_I18N?.getLang?.() || localStorage.getItem('gb_lang') || 'en').toLowerCase();
    } catch {
      return 'en';
    }
  };
  const getI18nText = (key, fallback) => {
    const readPath = (obj, path) => String(path || '').split('.').reduce((acc, part) => acc?.[part], obj);
    const lang = getCurrentLang();
    return readPath(window.DICTS?.[lang], key) || readPath(window.DICTS?.en, key) || fallback;
  };

  // Check if required elements exist
  if (!btn || !alertBox || !firstNameEl || !lastNameEl || !emailEl || !phoneEl || !goalEl ||
      !currentWeightEl || !mainStruggleEl || !trainingLocationEl || !startTimelineEl || !investmentReadinessEl || !consentEl) {
    console.warn('Contact form: Some required elements are missing');
    return;
  }

  // Helpers
  const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const phoneOk = v => !v || /^[\+]?[0-9\s\-\(\)]{6,24}$/.test(v.trim());
  const weightOk = value => {
    const match = String(value || '').replace(',', '.').match(/\d+(?:\.\d+)?/);
    const weight = match ? Number(match[0]) : NaN;
    return Number.isFinite(weight) && weight >= 30 && weight <= 300;
  };
  const createLeadId = () => {
    try {
      if (window.crypto && typeof window.crypto.randomUUID === 'function') {
        return window.crypto.randomUUID();
      }
      const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
      return template.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    } catch {
      return `lead-${Date.now()}`;
    }
  };
  const setErr = (el, on) => el.classList.toggle('input-error', !!on);
  const escapeHtml = value => String(value || '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[char]));

  // Generate specific error message
  const getErrorMessage = () => getI18nText('contact.form.validation_error', 'Please check the highlighted fields.');
  const successMessage = 'Thanks \u2014 your application has been received. I\'ll review your goal and get back to you.';
  const failureMessage = 'Something went wrong. Please try again or message me directly on WhatsApp.';
  const isHotLeadPayload = payload => {
    const readiness = String(payload.investmentReadiness || '').trim().toLowerCase();
    const timeline = String(payload.startTimeline || '').trim().toLowerCase();
    return readiness === 'ready now' && (timeline === 'now' || timeline === 'this week');
  };

  // Simple submit rate-limit: 1 per 60s
  const canSubmit = () => {
    const last = Number(localStorage.getItem('gb_last_submit')||0);
    return Date.now() - last > 60_000;
  };

  // Success popup function
  const showSuccessPopup = (userName) => {
    const safeName = escapeHtml(userName);

    // Create modal HTML
    const modalHTML = `
      <div class="modal fade" id="successModal" tabindex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header border-0">
              <h1 class="modal-title fs-4 text-center w-100" id="successModalLabel">
                ${getI18nText('contact.form.success_title', 'Message sent successfully')}
              </h1>
            </div>
            <div class="modal-body text-center">
              <p class="mb-3">${getI18nText('contact.form.success_greeting', 'Thank you')} <strong>${safeName}</strong>.</p>
              <p class="text-muted mb-3">${successMessage}</p>
              <a class="btn btn-warning" href="https://wa.me/447508497586?text=Hi%20Andre%2C%20I%20want%20to%20start%20coaching." target="_blank" rel="noopener">Message on WhatsApp</a>
            </div>
            <div class="modal-footer border-0 justify-content-center">
                <button type="button" class="btn btn-gradient px-4" data-bs-dismiss="modal">${getI18nText('contact.form.success_dismiss', 'Got it')}</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('successModal');
    if (existingModal) {
      existingModal.remove();
    }

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('successModal'));
    modal.show();

    // Auto-hide after 8 seconds
    setTimeout(() => {
      modal.hide();
    }, 8000);

    // Remove modal from DOM after hiding
    document.getElementById('successModal').addEventListener('hidden.bs.modal', () => {
      document.getElementById('successModal').remove();
    });
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (btn.disabled) return;

    const qp = new URLSearchParams(window.location.search || '');
    const attrib = window.GB_ATTRIBUTION || (() => {
      try {
        return JSON.parse(localStorage.getItem('gb_attrib_v1') || '{}');
      } catch {
        return {};
      }
    })();

    if (sourceEl) {
      sourceEl.value = 'website';
    }
    if (pageEl) pageEl.value = window.location.pathname;
    if (utmSourceEl) utmSourceEl.value = qp.get('utm_source') || attrib.utm_source || localStorage.getItem('gb_utm_source') || '';
    if (utmMediumEl) utmMediumEl.value = qp.get('utm_medium') || attrib.utm_medium || localStorage.getItem('gb_utm_medium') || '';
    if (utmCampaignEl) utmCampaignEl.value = qp.get('utm_campaign') || attrib.utm_campaign || localStorage.getItem('gb_utm_campaign') || '';
    if (utmContentEl) utmContentEl.value = qp.get('utm_content') || attrib.utm_content || localStorage.getItem('gb_utm_content') || '';
    if (utmTermEl) utmTermEl.value = qp.get('utm_term') || attrib.utm_term || localStorage.getItem('gb_utm_term') || '';
    const gclid = qp.get('gclid') || attrib.gclid || localStorage.getItem('gb_gclid') || '';
    const fbclid = qp.get('fbclid') || attrib.fbclid || localStorage.getItem('gb_fbclid') || '';

    // Validate required fields
    let bad = false;
    setErr(firstNameEl, firstNameEl.value.trim().length < 2); bad ||= firstNameEl.classList.contains('input-error');
    setErr(lastNameEl, lastNameEl.value.trim().length < 2); bad ||= lastNameEl.classList.contains('input-error');
    setErr(emailEl, !emailOk(emailEl.value));              bad ||= emailEl.classList.contains('input-error');
    setErr(phoneEl, !phoneOk(phoneEl.value) || !phoneEl.value.trim()); bad ||= phoneEl.classList.contains('input-error');
    setErr(goalEl, !goalEl.value);                         bad ||= goalEl.classList.contains('input-error');
    setErr(currentWeightEl, !weightOk(currentWeightEl.value)); bad ||= currentWeightEl.classList.contains('input-error');
    setErr(mainStruggleEl, mainStruggleEl.value.trim().length < 3); bad ||= mainStruggleEl.classList.contains('input-error');
    setErr(trainingLocationEl, !trainingLocationEl.value); bad ||= trainingLocationEl.classList.contains('input-error');
    setErr(startTimelineEl, !startTimelineEl.value);       bad ||= startTimelineEl.classList.contains('input-error');
    setErr(investmentReadinessEl, !investmentReadinessEl.value); bad ||= investmentReadinessEl.classList.contains('input-error');
    setErr(consentEl, !consentEl.checked);
    bad ||= consentEl.classList.contains('input-error');

    if (bad) {
      alertBox.classList.remove('visually-hidden');
      alertBox.textContent = getErrorMessage();
      return;
    }

    if (!canSubmit()) {
      alertBox.classList.remove('visually-hidden');
      alertBox.textContent = getI18nText('contact.form.rate_limit', 'Message already sent. Please wait a minute before trying again.');
      return;
    }

    // Send
    btn.disabled = true;
    btn.classList.add('is-loading');
    if (btnLabel) {
      btnLabel.textContent = getI18nText('contact.form.sending', btn.dataset.loading || 'Sending...');
    }

    try {
      const leadId = createLeadId();
      const payload = {
        lead_id: leadId,
        firstName: firstNameEl.value.trim(),
        lastName: lastNameEl.value.trim(),
        email: emailEl.value.trim(),
        phone: phoneEl.value.trim(),
        goal: goalEl.value || '',
        currentWeight: currentWeightEl.value.trim(),
        mainStruggle: mainStruggleEl.value.trim(),
        trainingLocation: trainingLocationEl.value || '',
        startTimeline: startTimelineEl.value || '',
        investmentReadiness: investmentReadinessEl.value || '',
        consent: !!consentEl.checked,
        source: 'website',
        page: pageEl?.value || window.location.pathname,
        utm_source: utmSourceEl?.value || '',
        utm_medium: utmMediumEl?.value || '',
        utm_campaign: utmCampaignEl?.value || '',
        utm_content: utmContentEl?.value || '',
        utm_term: utmTermEl?.value || '',
        gclid,
        fbclid
      };

      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const responseData = await res.json().catch(() => ({}));

      if (res.ok && responseData?.ok === true) {
        localStorage.setItem('gb_last_submit', Date.now().toString());
        form.reset();
        alertBox.classList.remove('visually-hidden');
        alertBox.textContent = responseData?.message || successMessage;

        // ---- Analytics / Tracking ----
        const trackingPayload = {
          lead_type: 'coaching_application',
          page: window.location.pathname,
          source: 'website',
          utm_source: payload.utm_source || '',
          utm_medium: payload.utm_medium || '',
          utm_campaign: payload.utm_campaign || '',
          utm_content: payload.utm_content || '',
          utm_term: payload.utm_term || ''
        };
        try {
          if (window.GB_TRACKING && typeof window.GB_TRACKING.trackEvent === 'function') {
            window.GB_TRACKING.trackEvent('generate_lead', trackingPayload);
            window.GB_TRACKING.trackEvent('application_submit', trackingPayload);
            if (isHotLeadPayload(payload)) {
              window.GB_TRACKING.trackEvent('hot_lead', {
                ...trackingPayload,
                lead_quality: 'hot'
              });
            }
          } else {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ event: 'generate_lead', ...trackingPayload });
            window.dataLayer.push({ event: 'application_submit', ...trackingPayload });
            if (isHotLeadPayload(payload)) {
              window.dataLayer.push({ event: 'hot_lead', ...trackingPayload, lead_quality: 'hot' });
            }
          }
        } catch(e){ console.warn('dataLayer push failed', e); }

        // Google Ads conversion (contact form submission)
        try {
          if (typeof window.gtag_report_conversion === 'function') {
            window.gtag_report_conversion();
          } else if (typeof window.gtag === 'function') {
            window.gtag('event', 'conversion', {
              send_to: 'AW-17627402053/mdOMCOTV3acbEMWes9VB',
              value: 1.0,
              currency: 'EUR'
            });
          }
        } catch(e){ console.warn('Google Ads conversion event failed', e); }

        // Meta Pixel Lead event (guard if fbq present)
        try {
          if (typeof fbq === 'function') {
            fbq('track', 'Lead', {
              content_name: 'coaching_application'
            });
          }
        } catch(e){ console.warn('fbq lead track failed', e); }

        if (!window.__GB_DISABLE_FORM_REDIRECT) {
          window.location.href = '/thank-you-application.html';
        }
      } else {
        alertBox.classList.remove('visually-hidden');
        alertBox.textContent = failureMessage;
      }
    } catch {
      alertBox.classList.remove('visually-hidden');
      alertBox.textContent = failureMessage;
    } finally {
      btn.disabled = false;
      btn.classList.remove('is-loading');
      if (btnLabel && btn.dataset.default) {
        btnLabel.textContent = getI18nText('contact.form.submit', btn.dataset.default);
      }
    }
  });

})();








