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
  const consentEl = document.getElementById('consent');
  const sourceEl = document.getElementById('source');
  const pageEl = document.getElementById('page');
  const utmSourceEl = document.getElementById('utm_source');
  const utmCampaignEl = document.getElementById('utm_campaign');
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
      !currentWeightEl || !mainStruggleEl || !consentEl) {
    console.warn('Contact form: Some required elements are missing');
    return;
  }

  // Helpers
  const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const phoneOk = v => !v || /^[\+]?[0-9\s\-\(\)]{6,24}$/.test(v.trim());
  const setErr = (el, on) => el.classList.toggle('input-error', !!on);
  const escapeHtml = value => String(value || '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[char]));

  // Generate specific error message
  const getErrorMessage = () => {
    const errors = [];
    if (firstNameEl.classList.contains('input-error')) errors.push('first name');
    if (lastNameEl.classList.contains('input-error')) errors.push('last name');
    if (emailEl.classList.contains('input-error')) errors.push('email');
    if (phoneEl.classList.contains('input-error')) errors.push('phone number');
    if (goalEl.classList.contains('input-error')) errors.push('primary goal');
    if (currentWeightEl.classList.contains('input-error')) errors.push('current weight');
    if (mainStruggleEl.classList.contains('input-error')) errors.push('main struggle');
    if (consentEl.classList.contains('input-error')) errors.push('consent agreement');

    return errors.length ? `Please check: ${errors.join(', ')}` : 'Please check the highlighted fields.';
  };

  // Simple submit rate-limit: 1 per 60s
  const canSubmit = () => {
    const last = Number(localStorage.getItem('gb_last_submit')||0);
    return Date.now() - last > 60_000;
  };

  // Success popup function
  const showSuccessPopup = (userName, userEmail) => {
    const safeName = escapeHtml(userName);
    const safeEmail = escapeHtml(userEmail);

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
              <p class="mb-3">${getI18nText('contact.form.success_greeting', 'Thank you')} <strong>${safeName}</strong>!</p>
              <p class="text-muted mb-3">${getI18nText('contact.form.success_email_note', 'Your message was received. Please check your inbox for the confirmation email sent by Garcia Builder Fitness:')}</p>
              <p class="text-primary fw-bold">${safeEmail}</p>
              <p class="text-muted small">Thanks — your details have been received. I’ll review your goal and get back to you.</p>
              <a class="btn btn-warning" href="https://calendly.com/andrenjulio072/consultation" target="_blank" rel="noopener">${getI18nText('contact.form.book_consultation', 'Book Free Consultation')}</a>
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

    const qp = new URLSearchParams(window.location.search || '');
    if (sourceEl) sourceEl.value = sourceEl.value || 'Contact Consultation Form';
    if (pageEl) pageEl.value = window.location.href;
    if (utmSourceEl) utmSourceEl.value = qp.get('utm_source') || localStorage.getItem('gb_utm_source') || '';
    if (utmCampaignEl) utmCampaignEl.value = qp.get('utm_campaign') || localStorage.getItem('gb_utm_campaign') || '';

    // Validate required fields
    let bad = false;
    setErr(firstNameEl, firstNameEl.value.trim().length < 2); bad ||= firstNameEl.classList.contains('input-error');
    setErr(lastNameEl, lastNameEl.value.trim().length < 2); bad ||= lastNameEl.classList.contains('input-error');
    setErr(emailEl, !emailOk(emailEl.value));              bad ||= emailEl.classList.contains('input-error');
    setErr(phoneEl, !phoneOk(phoneEl.value) || !phoneEl.value.trim()); bad ||= phoneEl.classList.contains('input-error');
    setErr(goalEl, !goalEl.value);                         bad ||= goalEl.classList.contains('input-error');
    setErr(currentWeightEl, !(Number(currentWeightEl.value) > 0)); bad ||= currentWeightEl.classList.contains('input-error');
    setErr(mainStruggleEl, mainStruggleEl.value.trim().length < 3); bad ||= mainStruggleEl.classList.contains('input-error');
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
      const payload = {
        firstName: firstNameEl.value.trim(),
        lastName: lastNameEl.value.trim(),
        email: emailEl.value.trim(),
        phone: phoneEl.value.trim(),
        goal: goalEl.value || '',
        currentWeight: Number(currentWeightEl.value),
        mainStruggle: mainStruggleEl.value.trim(),
        consent: !!consentEl.checked,
        source: sourceEl?.value || 'Contact Consultation Form',
        page: pageEl?.value || window.location.href,
        utm_source: utmSourceEl?.value || '',
        utm_campaign: utmCampaignEl?.value || ''
      };

      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const responseData = await res.json().catch(() => ({}));

      if (res.ok && (responseData?.ok || !responseData?.error)) {
        localStorage.setItem('gb_last_submit', Date.now().toString());

        // Store user data for confirmation
        const userEmail = emailEl.value.trim();
        const userName = `${firstNameEl.value.trim()} ${lastNameEl.value.trim()}`.trim();

        form.reset();
        alertBox.classList.remove('visually-hidden');
        alertBox.textContent = 'Thanks — your details have been received. I\'ll review your goal and get back to you.';

        // Show success popup. Confirmation and admin emails are sent by /api/inquiry.
        showSuccessPopup(userName, userEmail);

        // ---- Analytics / Tracking ----
        try {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: 'generate_lead',
            form_id: 'contact_form_main',
            form_name: 'Contact Coaching Inquiry',
            lead_email_domain: userEmail.split('@')[1] || '',
            goal: goalEl.value || '',
            current_weight: payload.currentWeight || '',
            main_struggle: payload.mainStruggle || ''
          });
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
              content_name: 'contact_form_main',
              goal: goalEl.value || '',
              main_struggle: payload.mainStruggle || ''
            });
          }
        } catch(e){ console.warn('fbq lead track failed', e); }
      } else {
        alertBox.classList.remove('visually-hidden');
        const apiError = responseData?.error || res.statusText || 'Unknown error';
        alertBox.textContent = `${getI18nText('contact.form.error', 'Unable to send your request right now. Please try again in a moment.')} (${apiError})`;
      }
    } catch {
      alertBox.classList.remove('visually-hidden');
      alertBox.textContent = 'Something went wrong while sending your details. Please try again in a moment.';
    } finally {
      btn.disabled = false;
      btn.classList.remove('is-loading');
      if (btnLabel && btn.dataset.default) {
        btnLabel.textContent = getI18nText('contact.form.submit', btn.dataset.default);
      }
    }
  });

})();








