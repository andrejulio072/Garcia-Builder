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

      // Show success message
      showNotification('¡Gracias! Te contactaremos pronto para tu consulta gratuita.', 'success');

      // Redirect to thank you page or show additional content
      setTimeout(() => {
        showLeadMagnet(leadInfo);
      }, 2000);

      // Reset form
      form.reset();

    } catch (error) {
      console.error('Error capturing lead:', error);
      showNotification('Error al enviar. Por favor, intenta de nuevo.', 'error');
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
      showNotification('Por favor, ingresa un email válido.', 'error');
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

      // Show success message
      showNotification('¡Suscrito exitosamente! Revisa tu email para confirmar.', 'success');

      // Reset form
      form.reset();

    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      showNotification('Error en la suscripción. Intenta de nuevo.', 'error');
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

      // Show success message
      showNotification('¡Solicitud enviada! Te contactaremos dentro de 24 horas.', 'success');

      // Show calendar booking option
      showCalendarBooking();

      form.reset();

    } catch (error) {
      console.error('Error requesting consultation:', error);
      showNotification('Error al enviar solicitud. Intenta de nuevo.', 'error');
    }
  };

  // Setup exit intent popup
  const setupExitIntentPopup = () => {
    let exitIntentTriggered = false;

    const showExitIntent = () => {
      if (exitIntentTriggered) return;

      exitIntentTriggered = true;
      const popup = createExitIntentPopup();
      document.body.appendChild(popup);

      // Track exit intent
      trackEvent('exit_intent_popup_shown');
    };

    // Detect exit intent
    document.addEventListener('mouseleave', (e) => {
      if (e.clientY <= 0) {
        showExitIntent();
      }
    });

    // Mobile scroll exit intent
    let lastScrollY = 0;
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY && currentScrollY < 100) {
        showExitIntent();
      }
      lastScrollY = currentScrollY;
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
            <h3>¡Espera! 🎯</h3>
            <p>¿Te vas sin tu guía gratuita de transformación?</p>
          </div>
          <div class="popup-body">
            <img src="assets/transformation-guide-preview.jpg" alt="Guía Gratuita" class="guide-preview">
            <h4>Descarga GRATIS:</h4>
            <ul>
              <li>✅ Plan de entrenamiento de 30 días</li>
              <li>✅ Guía de nutrición básica</li>
              <li>✅ Calculadora de calorías</li>
              <li>✅ 50 recetas saludables</li>
            </ul>
            <form class="popup-form download-form" data-source="Exit Intent">
              <input type="email" name="email" placeholder="Tu email aquí" required>
              <input type="hidden" name="goal" value="Transformation Guide">
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-download"></i> Descargar Gratis
              </button>
            </form>
            <p class="privacy-note">
              <i class="fas fa-lock"></i>
              No spam. Solo contenido valioso.
            </p>
          </div>
        </div>
      </div>
    `;

    // Setup popup events
    const closeBtn = popup.querySelector('.popup-close');
    const overlay = popup.querySelector('.popup-overlay');
    const form = popup.querySelector('.popup-form');

    closeBtn.addEventListener('click', () => {
      popup.remove();
      trackEvent('exit_intent_popup_closed');
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        popup.remove();
        trackEvent('exit_intent_popup_dismissed');
      }
    });

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

      // Show success and provide immediate download
      showNotification('¡Enviado! Revisa tu email para el enlace de descarga.', 'success');

      // Immediate download
      triggerFileDownload('transformation-guide.pdf');

      // Close popup if exists
      const popup = form.closest('.exit-intent-popup');
      if (popup) {
        popup.remove();
      }

      form.reset();

    } catch (error) {
      console.error('Error processing download:', error);
      showNotification('Error al procesar descarga. Intenta de nuevo.', 'error');
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
      const existingSubscribers = JSON.parse(localStorage.getItem('garcia_newsletter') || '[]');
      existingSubscribers.push(subscriberInfo);
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

    setTimeout(() => {
      notification.remove();
    }, 5000);
  };

  const triggerFileDownload = (filename) => {
    const link = document.createElement('a');
    link.href = `downloads/${filename}`;
    link.download = filename;
    link.click();
  };

  const showLeadMagnet = (leadInfo) => {
    // Show additional valuable content after lead capture
    console.log('Showing lead magnet for:', leadInfo.email);
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
      const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        if (scrollDepth >= 25 && scrollDepth < 50) {
          trackEvent('scroll_25_percent');
        } else if (scrollDepth >= 50 && scrollDepth < 75) {
          trackEvent('scroll_50_percent');
        } else if (scrollDepth >= 75) {
          trackEvent('scroll_75_percent');
        }
      }
    });
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
