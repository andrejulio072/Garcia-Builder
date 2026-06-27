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
          submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
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
            throw new Error('Por favor, preencha todos os campos obrigatórios');
          }

          // Save to database
          await saveLeadToDatabase(leadData);

          // Show success message
          form.innerHTML = `
            <div class="lead-form-success">
              <i class="fas fa-check-circle"></i>
              <h3>Obrigado!</h3>
              <p>Entraremos em contato em até 24 horas para agendar sua consulta gratuita.</p>
              <p><strong>Próximos passos:</strong> Verifique seu email para uma mensagem de boas-vindas com dicas de preparação.</p>
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
            ${error.message || 'Algo deu errado. Tente novamente ou entre em contato diretamente.'}
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

  // Show success message (PT-BR)
  showNotification('Obrigado! Entraremos em contato em breve para sua consulta gratuita.', 'success');

      // Redirect to thank you page or show additional content
      setTimeout(() => {
        showLeadMagnet(leadInfo);
      }, 2000);

      // Reset form
      form.reset();

    } catch (error) {
  console.error('Error capturing lead:', error);
  showNotification('Erro ao enviar. Por favor, tente novamente.', 'error');
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
      showNotification('Por favor, insira um e-mail válido.', 'error');
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

      // Show success message (PT-BR)
      if (saveResult?.welcomeEmailSent) {
        showNotification('Inscrição realizada com sucesso! Enviamos um email de boas-vindas.', 'success');
      } else if (saveResult?.welcomeEmailSkipped) {
        showNotification('Inscrição realizada com sucesso! Seu email de boas-vindas será enviado em breve.', 'success');
      } else {
        showNotification('Inscrição realizada com sucesso!', 'success');
      }

      // Reset form
      form.reset();

    } catch (error) {
  console.error('Error subscribing to newsletter:', error);
  showNotification('Erro na inscrição. Tente novamente.', 'error');
    }
  };

  // Handle consultation request
  const handleConsultationRequest = async (event) => {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    const consultationInfo = {
      id: generateLeadId(),
      email: formData.get('email'),
      name: formData.get('name'),
      phone: formData.get('phone'),
      goal: formData.get('goal'),
      experience: formData.get('experience'),
      availability: formData.get('availability'),
      message: formData.get('message'),
      type: 'consultation',
      source: 'Consultation Form',
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    try {
      // Save consultation request
      await saveConsultationRequest(consultationInfo);

      // Send confirmation to user
      await sendConsultationConfirmation(consultationInfo);

      // Notify admin
      await notifyAdminNewConsultation(consultationInfo);

      // Track conversion
      trackConversion('consultation_request', 'Consultation Form');

  // Show success message (PT-BR)
  showNotification('Solicitação enviada! Entraremos em contato em até 24 horas.', 'success');

      // Show calendar booking option
      showCalendarBooking();

      form.reset();

    } catch (error) {
  console.error('Error requesting consultation:', error);
  showNotification('Erro ao enviar solicitação. Tente novamente.', 'error');
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

  // Create exit intent popup with mobile optimization
  const createExitIntentPopup = () => {
    const popup = document.createElement('div');
    popup.className = 'exit-intent-overlay';

    // Prevent body scroll on mobile when popup is open
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      document.body.style.overflow = 'hidden';
    }

    const lang = (localStorage.getItem('gb_lang') || 'en').toLowerCase();
    const popupI18n = {
      en: {
        badge: '🔥 WAIT!',
        title: 'Don’t leave empty-handed!',
        subtitle: 'Get the FREE 28 Days Fat Loss Quickstart by email',
        email: 'Enter your email',
        button: 'Send Me the Ebook',
        benefit1: '28-day fat-loss structure',
        benefit2: 'Nutrition and shopping guidance',
        benefit3: 'Simple habits and accountability',
        close: 'Close popup'
      },
      pt: {
        badge: '🔥 ESPERA!',
        title: 'Não saia de mãos vazias!',
        subtitle: 'Receba por email o 28 Days Fat Loss Quickstart grátis',
        email: 'Digite seu email',
        button: 'Enviar Ebook',
        benefit1: 'Estrutura de perda de gordura em 28 dias',
        benefit2: 'Nutrição e lista de compras',
        benefit3: 'Hábitos simples e accountability',
        close: 'Fechar popup'
      },
      es: {
        badge: '🔥 ¡ESPERA!',
        title: '¡No te vayas con las manos vacías!',
        subtitle: 'Recibe por email el 28 Days Fat Loss Quickstart gratis',
        email: 'Introduce tu correo',
        button: 'Enviar Ebook',
        benefit1: 'Estructura de perdida de grasa en 28 dias',
        benefit2: 'Nutricion y lista de compras',
        benefit3: 'Habitos simples y accountability',
        close: 'Cerrar popup'
      }
    };
    const t = popupI18n[lang] || popupI18n.en;
    popup.innerHTML = `
      <div class="exit-intent-popup">
        <button class="exit-intent-close" aria-label="${t.close}">&times;</button>
        <div class="exit-intent-content">
          <div class="exit-intent-header">
            <span class="exit-intent-badge">${t.badge}</span>
            <h3>${t.title}</h3>
            <p>${t.subtitle}</p>
          </div>
          <form class="exit-intent-form download-form" data-source="Exit Intent">
            <input type="email" name="email" placeholder="${t.email}" required autocomplete="email">
            <input type="hidden" name="goal" value="28 Days Fat Loss Quickstart">
            <input type="hidden" name="guide_id" value="28-days-fat-loss-quickstart">
            <button type="submit">
              <i class="fas fa-download"></i> ${t.button}
            </button>
          </form>
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
      const email = popup.querySelector('input[name="email"]').value;
      const submitBtn = popup.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      // Show loading state
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
      submitBtn.disabled = true;

      try {
        const leadResponse = await saveLeadToDatabase({
          id: generateLeadId(),
          email: email,
          source: 'Exit Intent Popup',
          timestamp: new Date().toISOString(),
          page: window.location.pathname,
          type: 'lead_magnet',
          goal: '28 Days Fat Loss Quickstart',
          guide_id: '28-days-fat-loss-quickstart',
          status: 'new'
        });

        await sendDownloadLink({ email }, leadResponse);
        triggerFileDownload();

        const emailMessage = leadResponse?.customerEmailSent
          ? 'Verifique seu email. O ebook foi enviado para sua caixa de entrada.'
          : 'SMTP local não está configurado, então o email não foi enviado neste teste. Use o botão abaixo para baixar o ebook.';

        // Show success and close
        popup.querySelector('.exit-intent-content').innerHTML = `
          <div class="text-center" style="padding: 2rem; color: #fff;">
            <i class="fas fa-check-circle" style="font-size: 3rem; color: #28a745; margin-bottom: 1rem;"></i>
            <h3>Sucesso!</h3>
            <p>${emailMessage}</p>
            <a href="${GUIDE_ASSET_PATH}" download="${GUIDE_DOWNLOAD_NAME}" class="btn btn-primary mt-2">
              Download ebook now
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
        showNotification('Erro ao processar. Tente novamente.', 'error');
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
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
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
        throw new Error('Please enter a valid email address.');
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
        ? 'Sent! Check your email for the ebook.'
        : emailSkipped
          ? 'Saved. SMTP is not configured locally; use the download link shown on the page.'
          : 'Saved. Use the download link shown on the page.';
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
            <h3>Ebook on the way!</h3>
            <p class="mb-3">${emailWasSent ? 'Check your inbox and spam folder for the ebook.' : 'SMTP is not configured locally, so the test email was skipped.'}</p>
            <a href="${GUIDE_ASSET_PATH}" download="${GUIDE_DOWNLOAD_NAME}" class="btn btn-primary">
              Download ebook now
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
        submitBtn.innerHTML = originalBtnHtml || 'Send';
      }
      const message = error?.message && error.message !== 'Request failed'
        ? error.message
        : 'Erro ao processar download. Tente novamente.';
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

  const saveConsultationRequest = async (info) => {
    console.log('Consultation request captured:', info);
    await saveLeadToDatabase(info);
  };

  const notifyAdminNewConsultation = async (info) => {
    console.log('Notify admin (stub):', info.email);
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
