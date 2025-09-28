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

  // Update navigation based on user role
  const updateNavigation = () => {
    // Add trainer link to navigation if user is a trainer
    const navs = document.querySelectorAll('.nav, nav.nav');

    navs.forEach(nav => {
      // Remove existing trainer link to avoid duplicates
      const existingTrainerLink = nav.querySelector('a[href="trainer-dashboard.html"]');
      if (existingTrainerLink) {
        existingTrainerLink.remove();
      }

      if (isTrainer) {
        // Create trainer dashboard link
        const trainerLink = document.createElement('a');
        trainerLink.href = 'trainer-dashboard.html';
        trainerLink.textContent = 'Trainer';
        trainerLink.setAttribute('data-i18n', 'nav.trainer');

        // Add active class if on trainer dashboard
        if (window.location.pathname.includes('trainer-dashboard.html')) {
          trainerLink.classList.add('active');
        }

        // Insert trainer link after profile link or at the end
        const profileLink = nav.querySelector('a[href="my-profile.html"]');
        if (profileLink) {
          profileLink.insertAdjacentElement('afterend', trainerLink);
        } else {
          nav.appendChild(trainerLink);
        }
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
