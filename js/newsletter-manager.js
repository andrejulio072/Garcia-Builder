// Garcia Builder - Newsletter & Lead Generation System
(() => {
  let currentCampaign = null;
  let leadData = {};

  // Initialize newsletter system
  const init = async () => {
    try {
      // Setup lead capture forms
      setupLeadCaptureForms();

      // Setup newsletter forms
      setupNewsletterForms();

      // Setup exit intent popup
      setupExitIntentPopup();

      // Setup analytics tracking
      setupAnalyticsTracking();

      // Load existing leads if admin
      if (await isAdmin()) {
        await loadLeadsData();
      }

      console.log('Newsletter system initialized successfully');
    } catch (error) {
      console.error('Error initializing newsletter system:', error);
    }
  };

  // Setup lead capture forms throughout the site
  const setupLeadCaptureForms = () => {
    // Hero section lead capture
    const heroForms = document.querySelectorAll('.hero-lead-form');
    heroForms.forEach(form => {
      form.addEventListener('submit', handleLeadCapture);
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

  // Setup exit/focus popup - simplified: show once after short delay, never again after close
  const setupExitIntentPopup = () => {
    // Show only on homepage and keep it minimal & professional
    const isHomePage = () => {
      const p = (window.location.pathname || '').toLowerCase();
      return p === '/' || p.endsWith('/index.html') || p === '';
    };

    // Frequency controls (persist suppression after close)
    const EXIT_SUPPRESS_KEY = 'gb_exit_intent_suppress_until';
    const EXIT_SESSION_KEY = 'gb_exit_intent_shown_session';
    const SUPPRESS_DAYS = 30; // cooldown after dismiss/submit
    const DELAY_MS = 2500;    // show after ~2.5s
    let shownThisSession = false;

    const isSuppressed = () => {
      // once per session
      if (sessionStorage.getItem(EXIT_SESSION_KEY) === '1') return true;

      // 30-day cooldown
      const until = parseInt(localStorage.getItem(EXIT_SUPPRESS_KEY) || '0', 10);
      if (!Number.isNaN(until) && until > Date.now()) return true;

      // If user already became lead/subscriber locally, don't show
      try {
        const leads = JSON.parse(localStorage.getItem('garcia_leads') || '[]');
        const subsA = JSON.parse(localStorage.getItem('garcia_newsletter_subscribers') || '[]');
        const subsB = JSON.parse(localStorage.getItem('garcia_newsletter') || '[]');
        const hasSubs = (Array.isArray(subsA) && subsA.length) || (Array.isArray(subsB) && subsB.length);
        if ((Array.isArray(leads) && leads.length) || hasSubs) return true;
      } catch (_) {}
      return false;
    };

    const suppressNow = () => {
      sessionStorage.setItem(EXIT_SESSION_KEY, '1');
      const until = Date.now() + SUPPRESS_DAYS * 24 * 60 * 60 * 1000;
      localStorage.setItem(EXIT_SUPPRESS_KEY, String(until));
    };

    const showExitIntent = () => {
      if (shownThisSession || isSuppressed()) return;
      if (!isHomePage()) return; // homepage only
      // desktop-only (avoid mobile pollution)
      if (!window.matchMedia || !window.matchMedia('(pointer: fine)').matches) return;

      shownThisSession = true;
      sessionStorage.setItem(EXIT_SESSION_KEY, '1');

      const popup = createExitIntentPopup();
      document.body.appendChild(popup);
      trackEvent('exit_intent_popup_shown');
    };

    // Timed initial trigger (2.5s)
    setTimeout(() => showExitIntent(), DELAY_MS);

    // Public helper to suppress if user interacts positively elsewhere
    window.gbSuppressExitIntent = suppressNow;

    // Optional: footer trigger link with [data-open-lead-magnet]
    document.querySelectorAll('[data-open-lead-magnet]').forEach(el => {
      el.addEventListener('click', (e) => { e.preventDefault(); showExitIntent(); });
    });
  };

  // Create exit intent popup
  const createExitIntentPopup = () => {
    const popup = document.createElement('div');
    popup.className = 'exit-intent-popup';
    popup.innerHTML = `
      <div class="popup-overlay">
        <div class="popup-content">
          <button class="popup-close">&times;</button>
          <div class="popup-header">
            <h3>Espere um momento 🎯</h3>
            <p>Vai sair sem sua guia gratuita de transformação?</p>
          </div>
          <div class="popup-body">
            <img src="assets/transformation-guide-preview.jpg" alt="Guia Gratuita" class="guide-preview">
            <h4>Baixe GRÁTIS:</h4>
            <ul>
              <li>✅ Plano de treino de 30 dias</li>
              <li>✅ Guia básico de nutrição</li>
              <li>✅ Calculadora de calorias</li>
              <li>✅ 50 receitas saudáveis</li>
            </ul>
            <form class="popup-form download-form" data-source="Exit Intent">
              <input type="email" name="email" placeholder="Seu email aqui" required>
              <input type="hidden" name="goal" value="Transformation Guide">
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-download"></i> Baixar Agora
              </button>
            </form>
            <p class="privacy-note">
              <i class="fas fa-lock"></i>
              Sem spam. Apenas conteúdo valioso.
            </p>
          </div>
        </div>
      </div>
    `;

    // Setup popup events
    const closeBtn = popup.querySelector('.popup-close');
    const overlay = popup.querySelector('.popup-overlay');
    const form = popup.querySelector('.popup-form');

    const dismiss = (reason) => {
      popup.remove();
      if (typeof window.gbSuppressExitIntent === 'function') window.gbSuppressExitIntent();
      trackEvent(reason || 'exit_intent_popup_closed');
    };

    closeBtn.addEventListener('click', () => dismiss('exit_intent_popup_closed'));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) dismiss('exit_intent_popup_dismissed'); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') dismiss('exit_intent_popup_esc'); }, { once: true });

    form.addEventListener('submit', handleDownloadRequest);

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

  // Show success and provide immediate download (PT-BR)
  showNotification('Enviado! Confira seu e-mail para o link de download.', 'success');

      // Immediate download
      triggerFileDownload('transformation-guide.pdf');

      // Close popup if exists
      const popup = form.closest('.exit-intent-popup');
      if (popup) {
        if (typeof window.gbSuppressExitIntent === 'function') window.gbSuppressExitIntent();
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
})();
