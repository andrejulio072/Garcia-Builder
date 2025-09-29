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

  // Setup exit/focus popup - reappears on website reopening
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
    const DELAY_MS = 4000;    // show after 4s for better timing
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

      // Show on all devices, not just desktop
      console.log('Showing exit intent popup!');
      
      shownThisSession = true;
      suppressForSession();

      const popup = createExitIntentPopup();
      document.body.appendChild(popup);
      trackEvent('exit_intent_popup_shown');
    };

    // Timed initial trigger (4s)
    setTimeout(() => {
      console.log('Timer triggered, checking if popup should show...');
      showExitIntent();
    }, DELAY_MS);

    // Public helper to suppress for this session when user converts
    window.gbMarkUserConverted = markUserConverted;

    // Optional: footer trigger link with [data-open-lead-magnet]
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

    // Debug: Add temporary test button (remove after testing)
    if (isHomePage()) {
      const testBtn = document.createElement('button');
      testBtn.innerHTML = '🧪 Test Popup';
      testBtn.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; background: #F6C84E; color: #000; border: none; padding: 10px; border-radius: 5px; cursor: pointer;';
      testBtn.onclick = () => {
        console.log('Test button clicked');
        sessionStorage.clear();
        shownThisSession = false;
        showExitIntent();
      };
      document.body.appendChild(testBtn);
    }
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
            <h3>🎯 Espere! Não Perca Sua Transformação</h3>
            <p>Baixe GRÁTIS seu guia completo de transformação corporal</p>
          </div>
          <div class="popup-body">
            <div style="width: 180px; height: 240px; background: linear-gradient(145deg, #F6C84E 0%, #FFD700 100%); margin: 0 auto 1.5rem; border-radius: 15px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #000; font-weight: bold; text-align: center; box-shadow: 0 8px 25px rgba(0,0,0,0.3); border: 2px solid rgba(246, 200, 78, 0.4);">
              <i class="fas fa-dumbbell" style="font-size: 2.5rem; margin-bottom: 0.5rem;"></i>
              <div style="font-size: 1.1rem;">GUIA DE</div>
              <div style="font-size: 1.3rem;">TRANSFORMAÇÃO</div>
              <div style="font-size: 0.9rem; opacity: 0.8; margin-top: 0.5rem;">100% GRÁTIS</div>
            </div>
            <h4>O que você vai receber:</h4>
            <ul>
              <li>✅ Plano de treino de 30 dias progressivo</li>
              <li>✅ Guia completo de nutrição esportiva</li>
              <li>✅ Calculadora personalizada de macros</li>
              <li>✅ 50+ receitas saudáveis e saborosas</li>
              <li>✅ Dicas profissionais de suplementação</li>
              <li>✅ Cronograma de evolução semanal</li>
            </ul>
            <form class="popup-form download-form" data-source="Exit Intent">
              <input type="email" name="email" placeholder="Digite seu melhor e-mail" required>
              <input type="hidden" name="goal" value="Transformation Guide">
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-download"></i> Baixar Grátis Agora
              </button>
            </form>
            <p class="privacy-note">
              <i class="fas fa-shield-alt"></i>
              100% Seguro. Sem spam. Apenas conteúdo de valor premium.
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
      // Only suppress for this session, not permanently
      if (typeof window.gbMarkUserConverted === 'function' && reason === 'form_submitted') {
        window.gbMarkUserConverted();
      }
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
})();
