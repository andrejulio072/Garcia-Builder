(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const btn = document.getElementById('sendBtn');
  const alertBox = document.getElementById('form-alert');
  const nameEl = document.getElementById('name');
  const emailEl = document.getElementById('email');
  const phoneEl = document.getElementById('phone');
  const goalEl = document.getElementById('goal');
  const timelineEl = document.getElementById('timeline');
  const experienceEl = document.getElementById('experience');
  const preferredContactEl = document.getElementById('preferredContact');
  const budgetEl = document.getElementById('budget');
  const messageEl = document.getElementById('message');
  const consentEl = document.getElementById('consent');
  const charCount = document.getElementById('charCount');
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
  if (!btn || !alertBox || !nameEl || !emailEl || !goalEl ||
      !timelineEl || !experienceEl || !messageEl || !consentEl) {
    console.warn('Contact form: Some required elements are missing');
    return;
  }

  // Character counter
  const updateCount = () => {
    if (charCount) {
      charCount.textContent = `${messageEl.value.length}/1200`;
    }
  };
  messageEl.addEventListener('input', updateCount);
  updateCount();

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
    if (nameEl.classList.contains('input-error')) errors.push('name');
    if (emailEl.classList.contains('input-error')) errors.push('email');
    if (phoneEl && phoneEl.classList.contains('input-error')) errors.push('phone number');
    if (goalEl.classList.contains('input-error')) errors.push('primary goal');
    if (timelineEl.classList.contains('input-error')) errors.push('timeline');
    if (experienceEl.classList.contains('input-error')) errors.push('training experience');
    if (messageEl.classList.contains('input-error')) errors.push('message');
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
              <p class="text-muted small">${getI18nText('contact.form.success_next_step', 'Andre will review your enquiry and reply within 24-48 hours.')}</p>
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

    // Validate required fields
    let bad = false;
    setErr(nameEl, nameEl.value.trim().length < 2);       bad ||= nameEl.classList.contains('input-error');
    setErr(emailEl, !emailOk(emailEl.value));              bad ||= emailEl.classList.contains('input-error');
    setErr(goalEl, !goalEl.value);                         bad ||= goalEl.classList.contains('input-error');
    setErr(timelineEl, !timelineEl.value);                 bad ||= timelineEl.classList.contains('input-error');
    setErr(experienceEl, !experienceEl.value);             bad ||= experienceEl.classList.contains('input-error');
    setErr(messageEl, messageEl.value.trim().length < 10); bad ||= messageEl.classList.contains('input-error');
    setErr(consentEl, !consentEl.checked);                 // visual hint via CSS not needed here

    // Optional field validation
    setErr(phoneEl, !phoneOk(phoneEl.value));              bad ||= phoneEl.classList.contains('input-error');

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
        name: nameEl.value.trim(),
        email: emailEl.value.trim(),
        phone: phoneEl.value.trim() || null,
        goal: goalEl.value || null,
        experience: experienceEl.value || null,
        availability: timelineEl.value || null,
        message: [
          messageEl.value.trim(),
          preferredContactEl?.value ? `Preferred contact: ${preferredContactEl.value}` : '',
          budgetEl?.value ? `Monthly budget: ${budgetEl.value}` : ''
        ].filter(Boolean).join('\n\n'),
        source: 'Contact Page',
        page: window.location.href,
      };

      const res = await fetch('/api/inquiry', {
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
        const userName = nameEl.value.trim();

        form.reset(); updateCount();
        alertBox.classList.remove('visually-hidden');
        alertBox.textContent = getI18nText('contact.form.success_inline', 'Thank you. Your enquiry has been sent. Please check your inbox for confirmation.');

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
            timeline: timelineEl.value || '',
            experience: experienceEl.value || ''
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
              timeline: timelineEl.value || ''
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
      alertBox.textContent = getI18nText('contact.form.network_error', 'Network issue. If it persists, email inquiries@garciabuilder.fitness.');
    } finally {
      btn.disabled = false;
      btn.classList.remove('is-loading');
      if (btnLabel && btn.dataset.default) {
        btnLabel.textContent = getI18nText('contact.form.submit', btn.dataset.default);
      }
    }
  });

  // Ctrl/Cmd + Enter to submit from textarea
  messageEl.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') form.requestSubmit();
  });
})();








