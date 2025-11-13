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
    // Create modal HTML
    const modalHTML = `
      <div class="modal fade" id="successModal" tabindex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header border-0">
              <h1 class="modal-title fs-4 text-center w-100" id="successModalLabel">
                <i class="text-success">✅</i> Message Sent Successfully!
              </h1>
            </div>
            <div class="modal-body text-center">
              <p class="mb-3">Thank you <strong>${userName}</strong>!</p>
              <p class="text-muted mb-3">Your message has been sent successfully and a confirmation email has been sent to:</p>
              <p class="text-primary fw-bold">${userEmail}</p>
              <p class="text-muted small">I'll reply within 24-48 hours. Check your spam folder if you don't receive the confirmation email.</p>
            </div>
            <div class="modal-footer border-0 justify-content-center">
                <button type="button" class="btn btn-gradient px-4" data-bs-dismiss="modal">Got it!</button>
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

  // Send confirmation email function
  const sendConfirmationEmail = async (userName, userEmail) => {
    try {
      // Create confirmation email data
      const confirmationData = new FormData();
      confirmationData.append('_to', userEmail);
      confirmationData.append('_subject', 'Message Received - Garcia Builder Coaching');
      confirmationData.append('_template', 'table');
      confirmationData.append('name', userName);
      confirmationData.append('message', `
Hi ${userName},

Thank you for reaching out! I've received your message and will get back to you within 24-48 hours.

In the meantime, feel free to:
- Follow me on Instagram @garcia.builder for daily tips
- Check out transformation stories at garciabuilder.com
- Book a free consultation call here: https://calendly.com/andrenjulio072/consultation

Looking forward to speaking with you soon!

Best regards,
Andre Garcia
Garcia Builder - Online Coaching
Email: andre@garciabuilder.fitness
Calendly: https://calendly.com/andrenjulio072/consultation
Site: garciabuilder.com

If you'd like to chat sooner, feel free to book a free consultation call using the link above.
      `);

      // Send confirmation email via Formspree
      await fetch('https://formspree.io/f/mldpgrwq', {
        method: 'POST',
        body: confirmationData,
        headers: { 'Accept': 'application/json' }
      });

      console.log('Confirmation email sent successfully');
    } catch (error) {
      console.warn('Failed to send confirmation email:', error);
    }
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
      alertBox.textContent = 'Message already sent. Please wait a minute before trying again.';
      return;
    }

    // Send
    btn.disabled = true;
    btn.classList.add('is-loading');
    if (btnLabel && btn.dataset.loading) {
      btnLabel.textContent = btn.dataset.loading;
    }

    try {
      const targetUrl = form.getAttribute('action') || '/api/contact';
      const payload = {
        name: nameEl.value.trim(),
        email: emailEl.value.trim(),
        phone: phoneEl.value.trim() || null,
        preferred_contact: preferredContactEl ? preferredContactEl.value : null,
        primary_goal: goalEl.value || null,
        timeline: timelineEl.value || null,
        experience: experienceEl.value || null,
        budget: budgetEl ? budgetEl.value : null,
        message: messageEl.value.trim(),
        page_path: window.location.href,
        user_agent: navigator.userAgent,
      };

      const res = await fetch(targetUrl, {
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
          alertBox.textContent = 'Thanks! Your message was sent. I\'ll reply within 24-48h.';

        // Show success popup and send confirmation email
        showSuccessPopup(userName, userEmail);
        sendConfirmationEmail(userName, userEmail);

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
        alertBox.textContent = `Hmm, something went wrong (${apiError}). You can also email me at: andre@garciabuilder.fitness`;
      }
    } catch {
      alertBox.classList.remove('visually-hidden');
      alertBox.textContent = 'Network issue. If it persists, email me at: andre@garciabuilder.fitness';
    } finally {
      btn.disabled = false;
      btn.classList.remove('is-loading');
      if (btnLabel && btn.dataset.default) {
        btnLabel.textContent = btn.dataset.default;
      }
    }
  });

  // Ctrl/Cmd + Enter to submit from textarea
  messageEl.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') form.requestSubmit();
  });
})();








