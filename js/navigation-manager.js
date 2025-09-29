// Garcia Builder - Navigation Manager
// Handles conditional navigation based on user roles

(() => {
  'use strict';

  let currentUser = null;
  let isTrainer = false;

  // Initialize navigation manager
  const init = async () => {
    try {
      currentUser = await getCurrentUser();
      if (currentUser) {
        await checkTrainerStatus();
        updateNavigation();
      }
    } catch (error) {
      console.error('Navigation manager initialization error:', error);
    }
  };

  // Get current user
  const getCurrentUser = async () => {
    try {
      if (window.supabaseClient && window.supabaseClient.auth) {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (user) return user;
      }
      const stored = localStorage.getItem('gb_current_user') || localStorage.getItem('garcia_user');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  };

  // Check if current user is a trainer
  const checkTrainerStatus = async () => {
    try {
      if (!window.supabaseClient || !currentUser) {
        isTrainer = false;
        return;
      }

      // Check if user has any clients assigned to them
      const { data, error } = await window.supabaseClient
        .from('user_profiles')
        .select('user_id')
        .eq('trainer_id', currentUser.id)
        .limit(1);

      if (error) {
        console.error('Error checking trainer status:', error);
        isTrainer = false;
        return;
      }

      isTrainer = data && data.length > 0;
    } catch (error) {
      console.error('Error in checkTrainerStatus:', error);
      isTrainer = false;
    }
  };

  // Update navigation based on user role and login status
  const updateNavigation = () => {
    const navs = document.querySelectorAll('.navbar .nav, nav.nav');

    const url = new URL(window.location.href);
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const tab = url.searchParams.get('tab');

    // Helper to build a link element
    const buildLink = (href, text, i18nKey, isActive) => {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = text;
      if (i18nKey) a.setAttribute('data-i18n', i18nKey);
      if (isActive) a.classList.add('active');
      return a;
    };

    // Determine login state (cached currentUser)
    const loggedIn = !!currentUser;

    navs.forEach(nav => {
      // Clear existing nav links, keep container element
      while (nav.firstChild) nav.removeChild(nav.firstChild);

      // Marketing/primary links (always visible)
      const links = [
        { href: 'index.html', key: 'nav.home', text: 'Home', active: path === 'index.html' || path === '' },
        { href: 'about.html', key: 'nav.about', text: 'About', active: path === 'about.html' },
        { href: 'transformations.html', key: 'nav.trans', text: 'Transformations', active: path === 'transformations.html' },
        { href: 'testimonials.html', key: 'nav.testi', text: 'Testimonials', active: path === 'testimonials.html' },
        { href: 'pricing.html', key: 'nav.pricing', text: 'Pricing', active: path === 'pricing.html' },
        { href: 'faq.html', key: 'nav.faq', text: 'FAQ', active: path === 'faq.html' },
        { href: 'contact.html', key: 'nav.contact', text: 'Contact', active: path === 'contact.html' }
      ];

      // App links (login-aware)
      if (loggedIn) {
        links.push(
          { href: 'dashboard.html', key: 'nav.dashboard', text: 'Dashboard', active: path === 'dashboard.html' },
          // Profile cluster with deep links
          { href: 'my-profile.html', key: 'nav.profile', text: 'Profile', active: path === 'my-profile.html' && !tab },
          { href: 'my-profile.html?tab=metrics', key: 'nav.metrics', text: 'Metrics', active: path === 'my-profile.html' && tab === 'metrics' },
          { href: 'my-profile.html?tab=progress', key: 'nav.progress', text: 'Progress', active: path === 'my-profile.html' && tab === 'progress' }
        );

        // Role-aware Trainer link
        if (isTrainer) {
          links.push({ href: 'trainer-dashboard.html', key: 'nav.trainer', text: 'Trainer', active: path === 'trainer-dashboard.html' });
        }
      }

      // Render links
      for (const l of links) {
        nav.appendChild(buildLink(l.href, l.text, l.key, l.active));
      }
    });

    // Hide trainer ID field for non-trainers and non-admins
    hideTrainerIdField();
  };

  // Hide trainer ID field from regular users
  const hideTrainerIdField = () => {
    const trainerIdField = document.getElementById('trainer_id');
    const trainerIdGroup = trainerIdField?.closest('.col-md-6');

    if (trainerIdGroup) {
      // Only show to trainers or if user has admin flag
      const isAdmin = currentUser?.user_metadata?.is_admin || false;
      if (!isTrainer && !isAdmin) {
        trainerIdGroup.style.display = 'none';
      } else {
        trainerIdGroup.style.display = 'block';
      }
    }
  };

  // Public API
  window.GarciaNavigationManager = {
    init,
    getCurrentUser,
    checkTrainerStatus,
    isTrainer: () => isTrainer,
    updateNavigation
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
