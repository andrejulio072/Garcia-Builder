// Garcia Builder - Newsletter & Lead Generation System
(() => {
  let currentCampaign = null;
  let leadData = {};
  const GUIDE_ASSET_PATH = '/assets/28-days-fat-loss-quickstart.pdf';
  const GUIDE_DOWNLOAD_NAME = '28-Days-Fat-Loss-Quickstart-Garcia-Builder.pdf';
  const resolveApiBaseUrl = () => {
    const configuredBase = window.STRIPE_ENV_CONFIG?.apiUrl;
    if (configuredBase) {
      return String(configuredBase).replace(/\/$/, '');
    }

    const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    return isLocalhost ? 'http://localhost:3001/api' : '/api';
  };

  const getApiUrl = (path) => `${resolveApiBaseUrl()}${path}`;
  const getCurrentLang = () => {
    try {
      return (
        window.GB_I18N?.getLang?.() ||
        localStorage.getItem('gb_lang') ||
        localStorage.getItem('gb_language') ||
        document.documentElement.lang ||
        'en'
      ).toLowerCase().replace('pt-br', 'pt');
    } catch {
      return 'en';
    }
  };
  const getI18nText = (key, fallback) => {
    const lang = getCurrentLang();
    const readPath = (obj, path) => String(path || '').split('.').reduce((acc, part) => acc?.[part], obj);
    return readPath(window.DICTS?.[lang], key) || readPath(window.DICTS?.en, key) || fallback;
  };

  // Initialize newsletter system
  const init = async () => {
    try {
      console.log('🚀 Initializing Newsletter System...');

      // Wait for DOM to be fully ready
      await new Promise(resolve => {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', resolve);
        } else {
          resolve();
        }
      });

      // Setup all form handlers
      setupLeadCaptureForms();
      setupNewsletterForms();

      // Setup exit intent popup (without test button)
      setupExitIntentPopup();

      // Setup analytics tracking
      setupAnalyticsTracking();

      // Load existing leads if admin user
      try {
        if (await isAdmin()) {
          await loadLeadsData();
          console.log('✅ Admin dashboard loaded');
        }
      } catch (adminError) {
        console.log('ℹ️ Not admin user or admin features unavailable');
      }

      console.log('✅ Newsletter system initialized successfully');

      // Dispatch ready event
      window.dispatchEvent(new CustomEvent('newsletterSystemReady'));

    } catch (error) {
      console.error('❌ Error initializing newsletter system:', error);
    }
  };

  // Setup lead capture forms throughout the site
  const setupLeadCaptureForms = () => {
    // Main hero lead capture form with better error handling
    const heroForms = document.querySelectorAll('.hero-lead-form');

    heroForms.forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('.lead-form-submit, .btn-primary, button[type="submit"]');
        const originalText = submitBtn ? submitBtn.innerHTML : '';

        // Show loading state
          if (submitBtn) {
          submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${getI18nText('leadmagnet.processing', 'Processing...')}`;
          submitBtn.disabled = true;
        }

        try {
          const formData = new FormData(form);
          const leadData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone') || '',
            goal: formData.get('goal'),
            source: form.dataset.source || 'Main CTA Form',
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            type: 'consultation_request',
            status: 'new',
            id: generateLeadId()
          };

          // Validate required fields
          if (!leadData.name || !leadData.email || !leadData.goal) {
            throw new Error(getI18nText('leadmagnet.required_fields', 'Please fill in all required fields.'));
          }

          // Save to database
          await saveLeadToDatabase(leadData);

          // Show success message
          form.innerHTML = `
            <div class="lead-form-success">
              <i class="fas fa-check-circle"></i>
              <h3>${getI18nText('consultation.thank_you', 'Thank you.')}</h3>
              <p>${getI18nText('consultation.success', 'Thank you. Your consultation request has been sent. Please check your inbox for confirmation.')}</p>
            </div>
          `;

          // Track conversion
          trackEvent('lead_captured', {
            source: leadData.source,
            goal: leadData.goal,
            page: leadData.page
          });

        } catch (error) {
          console.error('Error saving lead:', error);

          // Show error message
          const errorDiv = document.createElement('div');
          errorDiv.className = 'alert alert-danger mt-3';
          errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            ${error.message || getI18nText('leadmagnet.error_submit', 'Oops! Something went wrong. Try again or book a free consultation on Calendly.')}
          `;
          form.appendChild(errorDiv);

          // Reset button
          if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
          }

          // Remove error after 5 seconds
          setTimeout(() => errorDiv.remove(), 5000);
        }
      });
    });

    // Free consultation forms
    const consultationForms = document.querySelectorAll('.consultation-form');
    consultationForms.forEach(form => {
      form.addEventListener('submit', handleConsultationRequest);
    });

    // Transformation guide download (lead magnet)
    const downloadForms = document.querySelectorAll('.download-form, .lead-magnet-form');
    downloadForms.forEach(form => {
      form.addEventListener('submit', handleDownloadRequest);
    });
  };

  // Setup newsletter subscription forms
  const setupNewsletterForms = () => {
    const newsletterForms = document.querySelectorAll('.newsletter-form, .newsletter-form-ref');
    newsletterForms.forEach(form => {
      if (form.dataset.newsletterBound === '1') return;
      form.dataset.newsletterBound = '1';
      form.addEventListener('submit', handleNewsletterSignup);
    });

    // Footer newsletter
    const footerNewsletter = document.getElementById('footer-newsletter');
    if (footerNewsletter) {
      footerNewsletter.addEventListener('submit', handleNewsletterSignup);
    }
  };

  // Handle lead capture
  const handleLeadCapture = async (event) => {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const leadInfo = {
      id: generateLeadId(),
      email: formData.get('email'),
      name: formData.get('name') || formData.get('full_name'),
      phone: formData.get('phone'),
      goal: formData.get('goal') || 'General Interest',
      source: form.dataset.source || 'Hero Form',
      campaign: currentCampaign || 'default',
      timestamp: new Date().toISOString(),
      ip: await getUserIP(),
      userAgent: navigator.userAgent,
      status: 'new'
    };

    try {
      // Save lead to database
      await saveLeadToDatabase(leadInfo);

      // Send welcome email
      await sendWelcomeEmail(leadInfo);

      // Track conversion
      trackConversion('lead_capture', leadInfo.source);

      // Mark user as converted for session
      if (typeof window.gbMarkUserConverted === 'function') {
        window.gbMarkUserConverted();
      }

      showNotification(
        getI18nText('consultation.success', 'Thank you. Your consultation request has been sent. Please check your inbox for confirmation.'),
        'success'
      );

      // Redirect to thank you page or show additional content
      setTimeout(() => {
        showLeadMagnet(leadInfo);
      }, 2000);

      // Reset form
      form.reset();

    } catch (error) {
    console.error('Error capturing lead:', error);
    showNotification(getI18nText('consultation.error', 'Unable to send your request right now. Please try again in a moment.'), 'error');
    }
  };

  // Handle newsletter signup
  const handleNewsletterSignup = async (event) => {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const email = formData.get('email');
    const name = formData.get('name') || '';

    if (!email || !isValidEmail(email)) {
      showNotification(getI18nText('newsletter.invalid_email', 'Please enter a valid email.'), 'error');
      return;
    }

    const subscriberInfo = {
      id: generateLeadId(),
      email: email,
      name: name,
      type: 'newsletter',
      source: form.dataset.source || 'Newsletter Form',
      preferences: {
        tips: true,
        workouts: true,
        nutrition: true,
        promotions: formData.get('promotions') === 'on'
      },
      timestamp: new Date().toISOString(),
      status: 'subscribed'
    };

    try {
      // Save to database
      const saveResult = await saveNewsletterSubscriber(subscriberInfo);

      // Track conversion
      trackConversion('newsletter_signup', subscriberInfo.source);

      // Mark user as converted for session
      if (typeof window.gbMarkUserConverted === 'function') {
        window.gbMarkUserConverted();
      }

      if (saveResult?.welcomeEmailSent) {
        showNotification(getI18nText('newsletter.success_email_sent', 'Subscription successful. We sent a welcome email.'), 'success');
      } else if (saveResult?.welcomeEmailSkipped) {
        showNotification(getI18nText('newsletter.success_email_pending', 'Subscription successful. Your welcome email will be sent shortly.'), 'success');
      } else {
        showNotification(getI18nText('newsletter.success', 'Subscription successful.'), 'success');
      }

      // Reset form
      form.reset();

    } catch (error) {
  console.error('Error subscribing to newsletter:', error);
  showNotification(getI18nText('newsletter.error', 'Subscription error. Please try again.'), 'error');
    }
  };

  // Handle consultation request
  const handleConsultationRequest = async (event) => {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('.lead-form-submit, .btn-primary, button[type="submit"]');
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';

    const consultationInfo = {
      email: formData.get('email'),
      name: formData.get('name'),
      phone: formData.get('phone') || '',
      goal: formData.get('goal') || '',
      experience: formData.get('experience') || '',
      availability: formData.get('availability') || '',
      message: formData.get('message') || '',
      source: form.dataset.source || 'Consultation Form',
      page: window.location.pathname
    };

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i>${getI18nText('consultation.sending', 'Sending...')}`;
    }

    try {
      if (!consultationInfo.email || !isValidEmail(consultationInfo.email)) {
        throw new Error(getI18nText('consultation.error', 'Unable to send your request right now. Please try again in a moment.'));
      }

      const inquiryResponse = await postJson(getApiUrl('/inquiry'), consultationInfo);
      if (!inquiryResponse?.ok) {
        throw new Error(getI18nText('consultation.error', 'Unable to send your request right now. Please try again in a moment.'));
      }

      // Track conversion only after the backend accepts the request.
      trackConversion('consultation_request', 'Consultation Form');

      showNotification(
        getI18nText('consultation.success', 'Thank you. Your consultation request has been sent. Please check your inbox for confirmation.'),
        'success'
      );

      showCalendarBooking();
      form.reset();

    } catch (error) {
      console.error('Error requesting consultation:', error);
      showNotification(
        getI18nText('consultation.error', 'Unable to send your request right now. Please try again in a moment.'),
        'error'
      );
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    }
  };

  // Setup exit/focus popup - real exit intent detection
  const setupExitIntentPopup = () => {
    // Show only on homepage - improved detection
    const isHomePage = () => {
      const p = (window.location.pathname || '').toLowerCase();
      const h = window.location.href.toLowerCase();

      // Check if it's the root path, index.html, or localhost root
      const isRoot = p === '/' || p === '' || p === '/index.html' || p.endsWith('/index.html');
      const isLocalhost = h.includes('localhost') && (h.endsWith('/') || h.endsWith('/index.html') || h.split('/').pop() === '');

      const result = isRoot || isLocalhost;
      console.log('🏠 Homepage detection:', {
        pathname: p,
        href: h,
        isRoot,
        isLocalhost,
        finalResult: result
      });

      return result;
    };

    console.log('🚀 Setting up exit intent popup...');
    console.log('📍 Current location:', window.location.href);
    console.log('🏠 Is homepage:', isHomePage());

    // Only proceed if we're on the homepage
    if (!isHomePage()) {
      console.log('❌ Not on homepage - exit intent popup disabled');
      return;
    }

    // Session-based frequency controls (resets when user reopens website)
    const EXIT_SESSION_KEY = 'gb_exit_intent_shown_session';
    let shownThisSession = false;

    const isSuppressed = () => {
      // Check if already shown this session only
      if (sessionStorage.getItem(EXIT_SESSION_KEY) === '1') {
        console.log('Popup suppressed: already shown this session');
        return true;
      }

      // If user already became lead/subscriber locally in this session, don't show
      try {
        const sessionLeads = sessionStorage.getItem('garcia_session_leads');
        const sessionSubs = sessionStorage.getItem('garcia_session_subscribers');
        if (sessionLeads || sessionSubs) {
          console.log('Popup suppressed: user already converted');
          return true;
        }
      } catch (_) {}
      return false;
    };

    const suppressForSession = () => {
      sessionStorage.setItem(EXIT_SESSION_KEY, '1');
    };

    const markUserConverted = () => {
      // Mark that user converted in this session
      sessionStorage.setItem('garcia_session_leads', '1');
      suppressForSession();
    };

    const showExitIntent = () => {
      console.log('🎯 Tentando mostrar popup exit intent...');

      // Double-check homepage (user might have navigated)
      if (!isHomePage()) {
        console.log('❌ Bloqueado: não está mais na homepage');
        return;
      }

      if (shownThisSession) {
        console.log('❌ Bloqueado: já mostrado nesta sessão');
        return;
      }

      if (isSuppressed()) {
        console.log('❌ Bloqueado: suprimido para esta sessão');
        return;
      }

      console.log('✅ Mostrando exit intent popup!');

      shownThisSession = true;
      suppressForSession();

      const popup = createExitIntentPopup();
      document.body.appendChild(popup);

      // Show popup with animation
      setTimeout(() => {
        popup.style.display = 'flex';
        popup.classList.add('show');
      }, 100);

      trackEvent('exit_intent_popup_shown');
      console.log('🎉 Popup exibido com sucesso!');
    };

    // Real exit intent detection - mouse leaving viewport
    let exitIntentTriggered = false;
    document.addEventListener('mouseleave', (e) => {
      // Only trigger if mouse leaves from the top of the page and not already triggered
      if (e.clientY <= 0 && !exitIntentTriggered && !shownThisSession) {
        exitIntentTriggered = true;
        showExitIntent();
      }
    });

    // Enhanced mobile detection and behavior
    const isMobile = () => {
      return window.innerWidth <= 768 ||
             /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
             'ontouchstart' in window;
    };

    // Mobile and touch-friendly scroll detection
    if (isMobile()) {
      let scrollTriggered = false;
      let lastScrollY = 0;

      const handleMobileScroll = () => {
        const currentScrollY = window.scrollY;
        const scrollPercent = currentScrollY / (document.body.scrollHeight - window.innerHeight);

        // Trigger when user scrolls past 60% and has been scrolling down
        if (scrollPercent > 0.6 && currentScrollY > lastScrollY && !scrollTriggered && !shownThisSession) {
          scrollTriggered = true;
          console.log('Mobile scroll trigger activated at', Math.round(scrollPercent * 100) + '%');
          setTimeout(showExitIntent, 3000); // 3 second delay on mobile
        }

        lastScrollY = currentScrollY;
      };

      // Use passive listeners for better performance on mobile
      window.addEventListener('scroll', handleMobileScroll, { passive: true });

      // Additional mobile trigger: after significant time on page
      setTimeout(() => {
        if (!shownThisSession && !scrollTriggered) {
          console.log('Mobile time-based trigger activated');
          showExitIntent();
        }
      }, 30000); // 30 seconds fallback
    }

    // Public helper to suppress for this session when user converts
    window.gbMarkUserConverted = markUserConverted;

    // Footer trigger link with [data-open-lead-magnet]
    document.querySelectorAll('[data-open-lead-magnet]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Lead magnet link clicked, clearing session and showing popup...');
        // Clear session to allow popup to show
        sessionStorage.removeItem(EXIT_SESSION_KEY);
        sessionStorage.removeItem('garcia_session_leads');
        sessionStorage.removeItem('garcia_session_subscribers');
        shownThisSession = false;
        showExitIntent();
      });
    });

    // Exit intent popup is now properly configured without test button
    // Manual trigger will work through lead magnet links and proper exit detection
  };

  const ensureExitIntentStyles = () => {
    if (document.getElementById('gb-exit-intent-styles')) return;

    const style = document.createElement('style');
    style.id = 'gb-exit-intent-styles';
    style.textContent = `
      .exit-intent-overlay {
        align-items: center;
        background: rgba(3, 7, 18, .78);
        backdrop-filter: blur(10px);
        display: none;
        inset: 0;
        justify-content: center;
        opacity: 0;
        overflow-y: auto;
        padding: 22px;
        position: fixed;
        transition: opacity .22s ease;
        z-index: 10000;
      }

      .exit-intent-overlay.show {
        opacity: 1;
      }

      .exit-intent-popup {
        background: #0b1220;
        border: 1px solid rgba(246, 200, 78, .28);
        border-radius: 8px;
        box-shadow: 0 34px 90px rgba(0, 0, 0, .48);
        color: #f8fafc;
        display: grid;
        grid-template-columns: minmax(230px, .82fr) minmax(320px, 1.18fr);
        max-width: 860px;
        overflow: hidden;
        position: relative;
        width: min(100%, 860px);
      }

      .exit-intent-close {
        align-items: center;
        background: rgba(15, 23, 42, .82);
        border: 1px solid rgba(255, 255, 255, .16);
        border-radius: 999px;
        color: #f8fafc;
        display: inline-flex;
        font-size: 24px;
        height: 38px;
        justify-content: center;
        line-height: 1;
        position: absolute;
        right: 14px;
        top: 14px;
        transition: background .18s ease, border-color .18s ease, transform .18s ease;
        width: 38px;
        z-index: 2;
      }

      .exit-intent-close:hover,
      .exit-intent-close:focus-visible {
        background: rgba(246, 200, 78, .18);
        border-color: rgba(246, 200, 78, .62);
        outline: none;
        transform: translateY(-1px);
      }

      .exit-intent-visual {
        background:
          linear-gradient(180deg, rgba(15, 23, 42, .94), rgba(3, 7, 18, .98)),
          url("assets/images/blog/preview-fat-loss-nutrition-photo.jpg") center / cover;
        border-right: 1px solid rgba(246, 200, 78, .18);
        display: flex;
        flex-direction: column;
        gap: 18px;
        justify-content: space-between;
        min-height: 430px;
        padding: 32px 28px;
      }

      .exit-intent-brand {
        align-items: center;
        display: flex;
        gap: 12px;
      }

      .exit-intent-brand img {
        height: 42px;
        object-fit: contain;
        width: 42px;
      }

      .exit-intent-brand strong {
        color: #fff7d6;
        display: block;
        font-size: 1rem;
        line-height: 1.2;
      }

      .exit-intent-brand span {
        color: rgba(226, 232, 240, .72);
        display: block;
        font-size: .78rem;
        margin-top: 2px;
      }

      .exit-intent-guide-card {
        background: rgba(15, 23, 42, .78);
        border: 1px solid rgba(246, 200, 78, .22);
        border-radius: 8px;
        padding: 18px;
      }

      .exit-intent-guide-card span {
        color: #f6c84e;
        display: block;
        font-size: .76rem;
        font-weight: 900;
        letter-spacing: .08em;
        text-transform: uppercase;
      }

      .exit-intent-guide-card strong {
        color: #fff;
        display: block;
        font-size: 1.45rem;
        line-height: 1.12;
        margin-top: 8px;
      }

      .exit-intent-guide-card p {
        color: rgba(226, 232, 240, .75);
        font-size: .92rem;
        line-height: 1.5;
        margin: 12px 0 0;
      }

      .exit-intent-proof {
        display: grid;
        gap: 10px;
      }

      .exit-intent-proof div {
        align-items: center;
        background: rgba(255, 255, 255, .06);
        border: 1px solid rgba(255, 255, 255, .1);
        border-radius: 8px;
        color: rgba(248, 250, 252, .86);
        display: flex;
        font-size: .9rem;
        gap: 10px;
        padding: 10px 12px;
      }

      .exit-intent-proof i {
        color: #f6c84e;
        width: 18px;
      }

      .exit-intent-content {
        padding: 42px 38px 34px;
      }

      .exit-intent-header {
        margin-bottom: 22px;
        padding-right: 30px;
      }

      .exit-intent-badge {
        color: #f6c84e;
        display: block;
        font-size: .74rem;
        font-weight: 900;
        letter-spacing: .12em;
        margin-bottom: 10px;
        text-transform: uppercase;
      }

      .exit-intent-header h3 {
        color: #fff;
        font-size: clamp(1.75rem, 4vw, 2.45rem);
        font-weight: 900;
        letter-spacing: 0;
        line-height: 1.04;
        margin: 0;
      }

      .exit-intent-header p {
        color: rgba(226, 232, 240, .78);
        font-size: 1rem;
        line-height: 1.55;
        margin: 14px 0 0;
      }

      .exit-intent-form {
        display: grid;
        gap: 12px;
      }

      .exit-intent-field {
        display: grid;
        gap: 7px;
      }

      .exit-intent-field label {
        color: rgba(248, 250, 252, .86);
        font-size: .82rem;
        font-weight: 800;
      }

      .exit-intent-form input[type="text"],
      .exit-intent-form input[type="email"] {
        background: rgba(15, 23, 42, .92);
        border: 1px solid rgba(148, 163, 184, .3);
        border-radius: 8px;
        color: #fff;
        font-size: 1rem;
        height: 50px;
        padding: 0 14px;
        transition: border-color .18s ease, box-shadow .18s ease, background .18s ease;
        width: 100%;
      }

      .exit-intent-form input::placeholder {
        color: rgba(203, 213, 225, .58);
      }

      .exit-intent-form input:focus {
        background: rgba(15, 23, 42, 1);
        border-color: rgba(246, 200, 78, .82);
        box-shadow: 0 0 0 3px rgba(246, 200, 78, .16);
        outline: none;
      }

      .exit-intent-form button[type="submit"] {
        align-items: center;
        background: linear-gradient(135deg, #f6c84e, #d8a927);
        border: 0;
        border-radius: 8px;
        color: #111827;
        display: inline-flex;
        font-size: .98rem;
        font-weight: 900;
        gap: 10px;
        height: 52px;
        justify-content: center;
        margin-top: 4px;
        padding: 0 18px;
        transition: filter .18s ease, transform .18s ease;
        width: 100%;
      }

      .exit-intent-form button[type="submit"]:hover,
      .exit-intent-form button[type="submit"]:focus-visible {
        filter: brightness(1.04);
        outline: none;
        transform: translateY(-1px);
      }

      .exit-intent-form button[type="submit"]:disabled {
        cursor: wait;
        filter: grayscale(.3);
        transform: none;
      }

      .exit-intent-benefits {
        border-top: 1px solid rgba(148, 163, 184, .18);
        margin-top: 20px;
        padding-top: 18px;
      }

      .exit-intent-benefits ul {
        display: grid;
        gap: 10px;
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .exit-intent-benefits li {
        align-items: flex-start;
        color: rgba(226, 232, 240, .84);
        display: flex;
        font-size: .92rem;
        gap: 10px;
        line-height: 1.35;
      }

      .exit-intent-benefits i {
        color: #f6c84e;
        margin-top: 2px;
      }

      .exit-intent-privacy {
        color: rgba(203, 213, 225, .66);
        font-size: .78rem;
        line-height: 1.45;
        margin: 14px 0 0;
      }

      .exit-intent-success {
        align-items: center;
        display: flex;
        flex-direction: column;
        min-height: 430px;
        justify-content: center;
        padding: 42px 34px;
        text-align: center;
      }

      .exit-intent-success i {
        color: #34d399;
        font-size: 3rem;
        margin-bottom: 16px;
      }

      .exit-intent-success h3 {
        color: #fff;
        font-size: 2rem;
        font-weight: 900;
        margin: 0;
      }

      .exit-intent-success p {
        color: rgba(226, 232, 240, .78);
        line-height: 1.55;
        margin: 12px auto 0;
        max-width: 440px;
      }

      .exit-intent-success a {
        background: #f6c84e;
        border-radius: 8px;
        color: #111827;
        display: inline-flex;
        font-weight: 900;
        margin-top: 20px;
        padding: 13px 18px;
        text-decoration: none;
      }

      @media (max-width: 760px) {
        .exit-intent-overlay {
          align-items: flex-start;
          padding: 14px;
        }

        .exit-intent-popup {
          grid-template-columns: 1fr;
          margin: auto 0;
          max-width: 440px;
        }

        .exit-intent-visual {
          border-right: 0;
          border-bottom: 1px solid rgba(246, 200, 78, .18);
          min-height: auto;
          padding: 22px;
        }

        .exit-intent-guide-card {
          display: none;
        }

        .exit-intent-proof {
          grid-template-columns: 1fr;
        }

        .exit-intent-content {
          padding: 28px 20px 22px;
        }

        .exit-intent-header {
          padding-right: 36px;
        }

        .exit-intent-close {
          right: 10px;
          top: 10px;
        }
      }
    `;
    document.head.appendChild(style);
  };

  // Create exit intent popup with mobile optimization
  const createExitIntentPopup = () => {
    ensureExitIntentStyles();

    const popup = document.createElement('div');
    popup.className = 'exit-intent-overlay';
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-modal', 'true');
    popup.setAttribute('aria-labelledby', 'exit-intent-title');

    // Prevent body scroll on mobile when popup is open
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      document.body.style.overflow = 'hidden';
    }

    const t = {
      badge: getI18nText('leadmagnet.popup_badge', 'WAIT!'),
      title: getI18nText('leadmagnet.popup_title', 'Do not leave empty-handed!'),
      subtitle: getI18nText('leadmagnet.popup_subtitle', 'Get the free 28 Days Fat Loss Quickstart by email.'),
      name: getI18nText('leadmagnet.name', 'Full Name'),
      namePlaceholder: getI18nText('leadmagnet.name_placeholder', 'Enter your name'),
      emailLabel: getI18nText('leadmagnet.email', 'Email Address'),
      email: getI18nText('leadmagnet.email_placeholder', 'you@email.com'),
      button: getI18nText('leadmagnet.popup_button', 'Send Me the Ebook'),
      benefit1: getI18nText('leadmagnet.popup_benefit1', '28-day fat-loss structure'),
      benefit2: getI18nText('leadmagnet.popup_benefit2', 'Nutrition and shopping guidance'),
      benefit3: getI18nText('leadmagnet.popup_benefit3', 'Simple habits and accountability'),
      close: getI18nText('leadmagnet.popup_close', 'Close popup'),
      privacy: getI18nText('leadmagnet.privacy', 'No spam. The guide arrives instantly and you can unsubscribe anytime.')
    };
    popup.innerHTML = `
      <div class="exit-intent-popup">
        <button class="exit-intent-close" aria-label="${t.close}">&times;</button>
        <aside class="exit-intent-visual" aria-hidden="true">
          <div class="exit-intent-brand">
            <img src="assets/images/logo-nobackground-500.png" alt="">
            <div>
              <strong>Garcia Builder</strong>
              <span>Evidence-based online coaching</span>
            </div>
          </div>
          <div class="exit-intent-guide-card">
            <span>${t.badge}</span>
            <strong>28 Days Fat Loss Quickstart</strong>
            <p>${t.subtitle}</p>
          </div>
          <div class="exit-intent-proof">
            <div><i class="fas fa-dumbbell"></i><span>${t.benefit1}</span></div>
            <div><i class="fas fa-utensils"></i><span>${t.benefit2}</span></div>
            <div><i class="fas fa-calendar-check"></i><span>${t.benefit3}</span></div>
          </div>
        </aside>
        <div class="exit-intent-content">
          <div class="exit-intent-header">
            <span class="exit-intent-badge">${t.badge}</span>
            <h3 id="exit-intent-title">${t.title}</h3>
            <p>${t.subtitle}</p>
          </div>
          <form class="exit-intent-form download-form" data-source="Exit Intent">
            <div class="exit-intent-field">
              <label for="exit-intent-name">${t.name}</label>
              <input id="exit-intent-name" type="text" name="name" placeholder="${t.namePlaceholder}" required autocomplete="name">
            </div>
            <div class="exit-intent-field">
              <label for="exit-intent-email">${t.emailLabel}</label>
              <input id="exit-intent-email" type="email" name="email" placeholder="${t.email}" required autocomplete="email">
            </div>
            <input type="hidden" name="goal" value="28 Days Fat Loss Quickstart">
            <input type="hidden" name="guide_id" value="28-days-fat-loss-quickstart">
            <button type="submit">
              <i class="fas fa-download"></i> ${t.button}
            </button>
          </form>
          <p class="exit-intent-privacy">${t.privacy}</p>
          <div class="exit-intent-benefits">
            <ul>
              <li><i class="fas fa-check"></i> ${t.benefit1}</li>
              <li><i class="fas fa-check"></i> ${t.benefit2}</li>
              <li><i class="fas fa-check"></i> ${t.benefit3}</li>
            </ul>
          </div>
        </div>
      </div>
    `;

    // Enhanced close handlers with mobile support
    const closePopup = () => {
      popup.remove();
      document.body.style.overflow = ''; // Restore scrolling

      // Mark popup as shown for this session - will only reset when browser/tab is closed
      suppressForSession();
      shownThisSession = true;

      trackEvent('exit_intent_popup_closed');

      console.log('✅ Popup fechado - não aparecerá novamente até reabrir o site');
    };

    // Handle close button with better touch support
    popup.querySelector('.exit-intent-close').addEventListener('click', closePopup);
    popup.querySelector('.exit-intent-close').addEventListener('touchend', (e) => {
      e.preventDefault();
      closePopup();
    });

    // Handle form submission with mobile optimization
    popup.querySelector('.exit-intent-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = popup.querySelector('input[name="name"]').value.trim();
      const email = popup.querySelector('input[name="email"]').value.trim();
      const submitBtn = popup.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      // Show loading state
      submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${getI18nText('leadmagnet.sending', 'Sending...')}`;
      submitBtn.disabled = true;

      try {
        const leadResponse = await saveLeadToDatabase({
          id: generateLeadId(),
          name: name,
          email: email,
          source: 'Exit Intent Popup',
          timestamp: new Date().toISOString(),
          page: window.location.pathname,
          type: 'lead_magnet',
          goal: '28 Days Fat Loss Quickstart',
          guide_id: '28-days-fat-loss-quickstart',
          status: 'new'
        });

        await sendDownloadLink({ name, email }, leadResponse);
        triggerFileDownload();

        const emailMessage = leadResponse?.customerEmailSent
          ? getI18nText('leadmagnet.email_sent_message', 'Check your email. The ebook was sent to your inbox.')
          : getI18nText('leadmagnet.email_pending_message', 'The email could not be sent in this environment. Use the button below to download the ebook.');

        // Show success and close
        popup.querySelector('.exit-intent-popup').innerHTML = `
          <div class="exit-intent-success">
            <i class="fas fa-check-circle"></i>
            <h3>${getI18nText('leadmagnet.download_success_title', 'Success!')}</h3>
            <p>${emailMessage}</p>
            <a href="${GUIDE_ASSET_PATH}" download="${GUIDE_DOWNLOAD_NAME}">
              ${getI18nText('leadmagnet.download_now', 'Download ebook now')}
            </a>
          </div>
        `;

        setTimeout(() => {
          popup.remove();
          document.body.style.overflow = ''; // Restore scrolling
        }, leadResponse?.customerEmailSent ? 3000 : 8000);

        // Track conversion
        trackEvent('lead_magnet_download', { source: 'exit_intent' });

        // Mark user as converted
        if (typeof window.gbMarkUserConverted === 'function') {
          window.gbMarkUserConverted();
        }

      } catch (error) {
        console.error('Error saving lead:', error);
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        showNotification(getI18nText('leadmagnet.error_process', 'Unable to process your request. Please try again.'), 'error');
      }
    });

    // Enhanced close on background click with touch support
    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        closePopup();
      }
    });

    // Touch support for mobile
    popup.addEventListener('touchend', (e) => {
      if (e.target === popup) {
        e.preventDefault();
        closePopup();
      }
    });

    // Close on ESC key
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closePopup();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);

    return popup;
  };

  // Handle download request
  const handleDownloadRequest = async (event) => {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('.lead-form-submit, .btn-primary, button[type="submit"]');
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i>${getI18nText('leadmagnet.sending', 'Sending...')}`;
    }

    const downloadInfo = {
      id: generateLeadId(),
      email: formData.get('email'),
      name: formData.get('name') || '',
      goal: formData.get('goal') || '28 Days Fat Loss Quickstart',
      guide_id: form.dataset.guideId || formData.get('guide_id') || '28-days-fat-loss-quickstart',
      type: 'download',
      source: form.dataset.source || 'Download Form',
      timestamp: new Date().toISOString(),
      status: 'new'
    };

    try {
      if (!downloadInfo.email) {
        throw new Error(getI18nText('newsletter.invalid_email', 'Please enter a valid email address.'));
      }

      // Save lead and send the ebook email through the backend.
      const leadResponse = await saveLeadToDatabase(downloadInfo);

      await sendDownloadLink(downloadInfo, leadResponse);

      // Track conversion
      trackConversion('guide_download', downloadInfo.source);

      // Show success and provide immediate download.
      const emailWasSent = leadResponse?.customerEmailSent;
      const emailSkipped = leadResponse?.customerEmailSkipped || leadResponse?.fallback;
      const notificationMessage = emailWasSent
        ? getI18nText('leadmagnet.email_sent_message', 'Sent! Check your email for the ebook.')
        : emailSkipped
          ? getI18nText('leadmagnet.email_pending_message', 'Saved. Use the download link shown on the page.')
          : getI18nText('leadmagnet.download_ready_message', 'Saved. Use the download link shown on the page.');
      showNotification(notificationMessage, emailWasSent ? 'success' : 'info');

      // Immediate download if asset available
      triggerFileDownload();

      // Close popup if exists
      const popup = form.closest('.exit-intent-popup');
      if (popup) {
        if (typeof window.gbMarkUserConverted === 'function') window.gbMarkUserConverted();
        popup.remove();
      }

      // Replace form content with success state for inline magnet
      if (form.classList.contains('lead-magnet-form')) {
        form.innerHTML = `
          <div class="lead-form-success text-center">
            <i class="fas fa-check-circle fa-2x text-success mb-3"></i>
            <h3>${getI18nText('leadmagnet.download_success_title', 'Ebook on the way!')}</h3>
            <p class="mb-3">${emailWasSent ? getI18nText('leadmagnet.email_sent_message', 'Check your inbox and spam folder for the ebook.') : getI18nText('leadmagnet.email_pending_message', 'The email could not be sent in this environment. Use the button below to download the ebook.')}</p>
            <a href="${GUIDE_ASSET_PATH}" download="${GUIDE_DOWNLOAD_NAME}" class="btn btn-primary">
              ${getI18nText('leadmagnet.download_now', 'Download ebook now')}
            </a>
          </div>
        `;
      } else {
        form.reset();
      }

    } catch (error) {
      console.error('Error processing download:', error);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml || getI18nText('leadmagnet.submit', 'Send');
      }
      const message = error?.message && error.message !== 'Request failed'
        ? error.message
        : getI18nText('leadmagnet.error_process', 'Unable to process your download. Please try again.');
      showNotification(message, 'error');
    }

    if (submitBtn && form.classList.contains('lead-magnet-form') === false) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }
  };

  const postJson = async (url, payload) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.error) {
      const error = new Error(data?.error || response.statusText || 'Request failed');
      error.response = data;
      throw error;
    }
    return data;
  };

  // Save lead to database
  const saveLeadToDatabase = async (leadInfo) => {
    if (!leadInfo || !leadInfo.email) {
      throw new Error('Lead email is required');
    }

    const metadata = { ...leadInfo };
    delete metadata.email;
    delete metadata.name;
    delete metadata.source;

    const payload = {
      email: leadInfo.email,
      name: leadInfo.name || null,
      source: leadInfo.source || 'Website',
    };

    if (Object.keys(metadata).length) {
      payload.notes = JSON.stringify(metadata);
    }

    try {
      return await postJson(getApiUrl('/lead'), payload);
    } catch (apiError) {
      console.warn('Lead API unavailable, saving locally as fallback', apiError);
    }

    const existingLeads = JSON.parse(localStorage.getItem('garcia_leads') || '[]');
    existingLeads.push(leadInfo);
    localStorage.setItem('garcia_leads', JSON.stringify(existingLeads));

    return {
      ok: true,
      fallback: true,
      customerEmailSent: false,
      customerEmailSkipped: true,
      guideUrl: GUIDE_ASSET_PATH
    };
  };

  // Save newsletter subscriber
  const saveNewsletterSubscriber = async (subscriberInfo) => {
    if (!subscriberInfo || !subscriberInfo.email) {
      throw new Error('Subscriber email is required');
    }

    const payload = {
      email: subscriberInfo.email,
      name: subscriberInfo.name || null,
      source: subscriberInfo.source || 'Newsletter Form',
    };

    try {
      return await postJson(getApiUrl('/newsletter'), payload);
    } catch (apiError) {
      console.warn('Newsletter API unavailable, falling back to direct client/local storage', apiError);
    }

    if (window.supabaseClient) {
      const { error } = await window.supabaseClient
        .from('newsletter_subscribers')
        .insert([subscriberInfo]);

      if (error) throw error;
      return { ok: true, fallback: true, welcomeEmailSent: false, welcomeEmailSkipped: true };
    } else {
      // Fallback to localStorage
      const existingSubscribers = JSON.parse(
        localStorage.getItem('garcia_newsletter_subscribers') ||
        localStorage.getItem('garcia_newsletter') || '[]'
      );
      existingSubscribers.push(subscriberInfo);
      // Write to canonical key and mirror to legacy key for compatibility
      localStorage.setItem('garcia_newsletter_subscribers', JSON.stringify(existingSubscribers));
      localStorage.setItem('garcia_newsletter', JSON.stringify(existingSubscribers));
      return { ok: true, fallback: true, welcomeEmailSent: false, welcomeEmailSkipped: true };
    }
  };

  // Send welcome email
  const sendWelcomeEmail = async (leadInfo) => {
    // In production, integrate with email service (SendGrid, Mailchimp, etc.)
    console.log('Sending welcome email to:', leadInfo.email);

    // For now, simulate email sending
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  // Send newsletter confirmation
  const sendNewsletterConfirmation = async (subscriberInfo) => {
    console.log('Sending newsletter confirmation to:', subscriberInfo.email);
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  // The backend sends the actual ebook email from /api/lead.
  const sendDownloadLink = async (downloadInfo, leadResponse = {}) => {
    if (leadResponse.customerEmailSent) {
      console.log('Ebook email sent to:', downloadInfo.email);
    } else if (leadResponse.customerEmailSkipped) {
      console.warn('Ebook email skipped. Configure SMTP on the server to send emails.');
    } else {
      console.warn('Ebook email status unknown:', leadResponse);
    }
    return leadResponse;
  };

  // Utility functions
  const generateLeadId = () => {
    return 'lead_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getUserIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };

  const isAdmin = async () => {
    // Check if current user is admin
    if (window.supabaseClient) {
      const { data: { user } } = await window.supabaseClient.auth.getUser();
      return user && user.user_metadata?.role === 'admin';
    }
    return false;
  };

  const trackConversion = (event, source) => {
    // Map internal event names to GA4-friendly events
    const map = {
      'newsletter_signup': { gaEvent: 'sign_up', params: { method: 'newsletter', source } },
      'lead_capture': { gaEvent: 'generate_lead', params: { lead_type: 'general', source } },
      'consultation_request': { gaEvent: 'generate_lead', params: { lead_type: 'consultation', source } },
      'guide_download': { gaEvent: 'download_guide', params: { source } }
    };

    const mapped = map[event];
    try {
      // Use dataLayer (preferred via GTM)
      window.dataLayer = window.dataLayer || [];
      if (mapped) {
        window.dataLayer.push({ event: mapped.gaEvent, ...mapped.params });
      } else {
        window.dataLayer.push({ event: 'conversion_generic', conv_event: event, source });
      }
    } catch(e) { console.warn('dataLayer push failed', e); }

    // Legacy direct gtag fallback (in case still present anywhere)
    if (typeof gtag !== 'undefined') {
      const evName = mapped ? mapped.gaEvent : 'conversion';
      const params = mapped ? mapped.params : { event_category: 'Lead Generation', event_label: source, value: 1 };
      gtag('event', evName, params);
    }

    // Meta Pixel basic mapping (optional enhancement later)
    try {
      if (typeof fbq === 'function') {
        if (event === 'newsletter_signup') fbq('track', 'CompleteRegistration', { content_name: 'newsletter', source });
        else if (event === 'lead_capture' || event === 'consultation_request') fbq('track', 'Lead', { content_name: event, source });
      }
    } catch(e){ console.warn('fbq track fail', e); }

    console.log('Conversion tracked:', event, source, mapped);
  };

  const trackEvent = (event) => {
    if (typeof gtag !== 'undefined') {
      gtag('event', event, {
        event_category: 'User Interaction'
      });
    }

    console.log('Event tracked:', event);
  };

  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    setTimeout(() => notification.remove(), 4000);
  };

  // Subtle lead magnet after successful lead capture (non-intrusive)
  const showLeadMagnet = (leadInfo) => {
    if (typeof window.gbSuppressExitIntent === 'function') window.gbSuppressExitIntent();
    console.log('Lead captured, offering magnet later for:', leadInfo?.email);
  };

  const showCalendarBooking = () => {
    // Show calendar booking widget
    console.log('Showing calendar booking widget');
  };

  // Setup analytics tracking
  const setupAnalyticsTracking = () => {
    // Track page views
    trackEvent('page_view');

    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop || 0;
      const scrollHeight = doc.scrollHeight - window.innerHeight;
      const pct = Math.max(0, Math.min(100, Math.round((scrollTop / (scrollHeight || 1)) * 100)));
      if (pct > maxScrollDepth) {
        maxScrollDepth = pct;
        if (pct >= 25 && pct < 50) trackEvent('scroll_25_percent');
        else if (pct >= 50 && pct < 75) trackEvent('scroll_50_percent');
        else if (pct >= 75) trackEvent('scroll_75_percent');
      }
    }, { passive: true });
  };

  const triggerFileDownload = () => {
    const link = document.createElement('a');
    link.href = GUIDE_ASSET_PATH;
    link.download = GUIDE_DOWNLOAD_NAME;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Load leads data for admin
  const loadLeadsData = async () => {
    try {
      if (window.supabaseClient) {
        const { data: leads } = await window.supabaseClient
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });

        let subscribersQuery = window.supabaseClient
          .from('newsletter_subscribers')
          .select('*');

        let subscribers = [];
        let subscribersError = null;

        ({ data: subscribers, error: subscribersError } = await subscribersQuery.order('created_at', { ascending: false }));
        if (subscribersError) {
          ({ data: subscribers, error: subscribersError } = await subscribersQuery.order('timestamp', { ascending: false }));
        }
        if (subscribersError) {
          console.warn('newsletter subscribers sort warning:', subscribersError);
          subscribers = subscribers || [];
        }

        leadData = { leads: leads || [], subscribers: subscribers || [] };
      } else {
        leadData = {
          leads: JSON.parse(localStorage.getItem('garcia_leads') || '[]'),
          subscribers: JSON.parse(localStorage.getItem('garcia_newsletter') || '[]')
        };
      }

      console.log('Leads data loaded:', leadData);
    } catch (error) {
      console.error('Error loading leads data:', error);
    }
  };

  // Export functions for global access
  window.GarciaNewsletterManager = {
    init,
    handleLeadCapture,
    handleNewsletterSignup,
    trackConversion,
    trackEvent,
    getLeadsData: () => leadData
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Make system globally available for debugging
  window.GarciaNewsletterSystem = {
    init,
    handleLeadCapture,
    handleNewsletterSignup,
    trackConversion,
    trackEvent,
    getLeadsData: () => leadData,
    // Debug functions
    resetPopupSession: () => {
      sessionStorage.removeItem('gb_exit_intent_shown_session');
      sessionStorage.removeItem('garcia_session_leads');
      sessionStorage.removeItem('garcia_session_subscribers');
      console.log('🧹 Sessão do popup resetada - popup pode aparecer novamente');
    },
    checkPopupStatus: () => {
      const status = {
        isHomePage: window.location.pathname === '/' || window.location.pathname.endsWith('/index.html'),
        sessionSuppressed: sessionStorage.getItem('gb_exit_intent_shown_session') === '1',
        currentPath: window.location.pathname,
        currentHref: window.location.href
      };
      console.table(status);
      return status;
    }
  };
})();
