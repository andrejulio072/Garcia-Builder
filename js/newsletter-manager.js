// Garcia Builder - Newsletter & Lead Generation System
(() => {
  let currentCampaign = null;
  let leadData = {};

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

    // Transformation guide download
    const downloadForms = document.querySelectorAll('.download-form');
    downloadForms.forEach(form => {
      form.addEventListener('submit', handleDownloadRequest);
    });
  };

  // Setup newsletter subscription forms
  const setupNewsletterForms = () => {
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    newsletterForms.forEach(form => {
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
      await saveNewsletterSubscriber(subscriberInfo);

      // Send confirmation email
      await sendNewsletterConfirmation(subscriberInfo);

      // Track conversion
      trackConversion('newsletter_signup', subscriberInfo.source);

      // Mark user as converted for session
      if (typeof window.gbMarkUserConverted === 'function') {
        window.gbMarkUserConverted();
      }

  // Show success message (PT-BR)
  showNotification('Inscrição realizada com sucesso! Confira seu e-mail para confirmar.', 'success');

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
    // Show only on homepage and keep it minimal & professional
    const isHomePage = () => {
      const p = (window.location.pathname || '').toLowerCase();
      const h = window.location.href.toLowerCase();
      return p === '/' || p.endsWith('/index.html') || p === '' || h.includes('index.html') || h.endsWith('/');
    };

    console.log('Setting up exit intent popup...');
    console.log('Current path:', window.location.pathname);
    console.log('Is home page:', isHomePage());

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
      console.log('Attempting to show exit intent popup...');

      if (shownThisSession) {
        console.log('Popup blocked: already shown this session');
        return;
      }

      if (isSuppressed()) {
        console.log('Popup blocked: suppressed');
        return;
      }

      if (!isHomePage()) {
        console.log('Popup blocked: not on homepage');
        return;
      }

      console.log('Showing exit intent popup!');

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

    // Mobile fallback: show after significant scroll + time delay
    if (window.innerWidth <= 768) {
      let scrollTriggered = false;
      window.addEventListener('scroll', () => {
        if (window.scrollY > window.innerHeight * 0.6 && !scrollTriggered && !shownThisSession) {
          scrollTriggered = true;
          setTimeout(showExitIntent, 3000); // 3 second delay on mobile
        }
      });
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

  // Create exit intent popup
  const createExitIntentPopup = () => {
    const popup = document.createElement('div');
    popup.className = 'exit-intent-overlay';
    popup.innerHTML = `
      <div class="exit-intent-popup">
        <button class="exit-intent-close">&times;</button>
        <div class="exit-intent-content">
          <div class="exit-intent-header">
            <span class="exit-intent-badge">🔥 ESPERA!</span>
            <h3>Não saia de mãos vazias!</h3>
            <p>Baixe seu guia de treino GRATUITO antes de ir</p>
          </div>
          <form class="exit-intent-form download-form" data-source="Exit Intent">
            <input type="email" name="email" placeholder="Digite seu email" required>
            <input type="hidden" name="goal" value="Transformation Guide">
            <button type="submit">
              <i class="fas fa-download"></i> Baixar Guia Grátis
            </button>
          </form>
          <div class="exit-intent-benefits">
            <ul>
              <li><i class="fas fa-check"></i> Plano de treino de 7 dias</li>
              <li><i class="fas fa-check"></i> Básicos da nutrição</li>
              <li><i class="fas fa-check"></i> Dicas de acompanhamento</li>
            </ul>
          </div>
        </div>
      </div>
    `;

    // Handle close button
    popup.querySelector('.exit-intent-close').addEventListener('click', () => {
      popup.remove();
      trackEvent('exit_intent_popup_closed');
    });

    // Handle form submission
    popup.querySelector('.exit-intent-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = popup.querySelector('input[name="email"]').value;

      try {
        await saveLeadToDatabase({
          id: generateLeadId(),
          email: email,
          source: 'Exit Intent Popup',
          timestamp: new Date().toISOString(),
          page: window.location.pathname,
          type: 'lead_magnet',
          goal: 'Transformation Guide',
          status: 'new'
        });

        // Show success and close
        popup.querySelector('.exit-intent-content').innerHTML = `
          <div class="text-center" style="padding: 2rem; color: #fff;">
            <i class="fas fa-check-circle" style="font-size: 3rem; color: #28a745; margin-bottom: 1rem;"></i>
            <h3>Sucesso!</h3>
            <p>Verifique seu email para o guia de treino gratuito!</p>
          </div>
        `;

        setTimeout(() => popup.remove(), 3000);

        // Track conversion
        trackEvent('lead_magnet_download', { source: 'exit_intent' });

        // Mark user as converted
        if (typeof window.gbMarkUserConverted === 'function') {
          window.gbMarkUserConverted();
        }

      } catch (error) {
        console.error('Error saving lead:', error);
        showNotification('Erro ao processar. Tente novamente.', 'error');
      }
    });

    // Close on background click
    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        popup.remove();
        trackEvent('exit_intent_popup_dismissed');
      }
    });

    // Close on ESC key
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        popup.remove();
        trackEvent('exit_intent_popup_esc');
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

    const downloadInfo = {
      id: generateLeadId(),
      email: formData.get('email'),
      name: formData.get('name') || '',
      goal: formData.get('goal') || 'Transformation Guide',
      type: 'download',
      source: form.dataset.source || 'Download Form',
      timestamp: new Date().toISOString(),
      status: 'new'
    };

    try {
      // Save lead
      await saveLeadToDatabase(downloadInfo);

      // Send download link
      await sendDownloadLink(downloadInfo);

      // Track conversion
      trackConversion('guide_download', downloadInfo.source);

      // Show success and provide immediate download
      showNotification('Sent! Check your email for the download link.', 'success');

      // Immediate download
      triggerFileDownload('transformation-guide.pdf');

      // Close popup if exists
      const popup = form.closest('.exit-intent-popup');
      if (popup) {
        if (typeof window.gbMarkUserConverted === 'function') window.gbMarkUserConverted();
        popup.remove();
      }

      form.reset();

    } catch (error) {
  console.error('Error processing download:', error);
  showNotification('Erro ao processar download. Tente novamente.', 'error');
    }
  };

  // Save lead to database
  const saveLeadToDatabase = async (leadInfo) => {
    if (window.supabaseClient) {
      const { error } = await window.supabaseClient
        .from('leads')
        .insert([leadInfo]);

      if (error) throw error;
    } else {
      // Fallback to localStorage
      const existingLeads = JSON.parse(localStorage.getItem('garcia_leads') || '[]');
      existingLeads.push(leadInfo);
      localStorage.setItem('garcia_leads', JSON.stringify(existingLeads));
    }
  };

  // Save newsletter subscriber
  const saveNewsletterSubscriber = async (subscriberInfo) => {
    if (window.supabaseClient) {
      const { error } = await window.supabaseClient
        .from('newsletter_subscribers')
        .insert([subscriberInfo]);

      if (error) throw error;
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

  // Send download link
  const sendDownloadLink = async (downloadInfo) => {
    console.log('Sending download link to:', downloadInfo.email);
    return new Promise(resolve => setTimeout(resolve, 1000));
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
    // Google Analytics or other analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'conversion', {
        event_category: 'Lead Generation',
        event_label: source,
        value: 1
      });
    }

    console.log('Conversion tracked:', event, source);
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

  // Stubs to avoid runtime errors on optional flows
  const triggerFileDownload = (filename) => {
    console.log('Trigger download requested for:', filename);
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
          .order('timestamp', { ascending: false });

        const { data: subscribers } = await window.supabaseClient
          .from('newsletter_subscribers')
          .select('*')
          .order('timestamp', { ascending: false });

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
    getLeadsData: () => leadData
  };
})();
