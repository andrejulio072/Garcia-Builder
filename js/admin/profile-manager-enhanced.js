// Garcia Builder - Enhanced Profile Manager with Better Error Handling
(() => {
  let currentUser = null;
  let profileData = {};
  let saveInProgress = false;

  // Initialize profile management
  const init = async () => {
    try {
      console.log('🔧 Initializing Enhanced Profile Manager...');

      // Check authentication
      currentUser = await getCurrentUser();
      if (!currentUser) {
        console.warn('No authenticated user found');
        return;
      }

      console.log('✅ User found:', currentUser.email);

      // Load profile data
      await loadProfileData();

      // Initialize UI
      initializeUI();

      // Set up event listeners
      setupEventListeners();

      console.log('✅ Profile management initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing profile management:', error);
      showNotification('Error loading profile. Please refresh the page.', 'error');
    }
  };

  // Get current user with multiple fallbacks
  const getCurrentUser = async () => {
    try {
      // Method 1: Supabase client
      if (window.supabaseClient && window.supabaseClient.auth) {
        const { data: { user }, error } = await window.supabaseClient.auth.getUser();
        if (user && !error) {
          console.log('User from Supabase:', user.email);
          return user;
        }
      }

      // Method 2: Enhanced Auth System
      if (window.enhancedAuth && window.enhancedAuth.currentUser) {
        console.log('User from Enhanced Auth:', window.enhancedAuth.currentUser.email);
        return window.enhancedAuth.currentUser;
      }

      // Method 3: Local storage (for admin users)
      const localUser = JSON.parse(localStorage.getItem('garcia_current_user') || 'null');
      if (localUser && localUser.email) {
        console.log('User from localStorage:', localUser.email);
        return localUser;
      }

      // Method 4: Legacy storage
      const legacyUser = JSON.parse(localStorage.getItem('gb_current_user') || 'null');
      if (legacyUser && legacyUser.email) {
        console.log('User from legacy storage:', legacyUser.email);
        return legacyUser;
      }

      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  };

  // Load complete profile data with better error handling
  const loadProfileData = async () => {
    try {
      // Initialize default profile structure
      profileData = {
        basic: {
          id: currentUser.id || 'local-' + Date.now(),
          email: currentUser.email || '',
          full_name: '',
          first_name: '',
          last_name: '',
          phone: '',
          avatar_url: '',
          birthday: '',
          location: '',
          bio: '',
          goals: [],
          experience_level: 'beginner',
          joined_date: new Date().toISOString(),
          last_login: new Date().toISOString()
        },
        body_metrics: {
          current_weight: '',
          height: '',
          target_weight: '',
          body_fat_percentage: '',
          measurements: {
            chest: '', waist: '', hips: '', arms: '', thighs: ''
          },
          updated_at: new Date().toISOString()
        },
        preferences: {
          units: 'metric',
          theme: 'dark',
          language: 'en',
          notifications: { email: true, push: true, reminders: true }
        }
      };

      // Load from multiple sources
      await loadFromSupabase();
      loadFromLocalStorage();
      loadFromUserMetadata();

      console.log('✅ Profile data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading profile data:', error);
    }
  };

  // Load from Supabase with better error handling
  const loadFromSupabase = async () => {
    if (!window.supabaseClient) return;

    try {
      console.log('🔍 Loading from Supabase...');

      const { data: profile, error } = await window.supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profile && !error) {
        console.log('✅ Profile found in Supabase');

        // Map Supabase data to our structure
        profileData.basic = {
          ...profileData.basic,
          full_name: profile.full_name || '',
          phone: profile.phone || '',
          birthday: profile.birthday || '',
          location: profile.location || '',
          bio: profile.bio || '',
          avatar_url: profile.avatar_url || ''
        };

        // Parse JSON fields safely
        if (profile.body_metrics && typeof profile.body_metrics === 'object') {
          profileData.body_metrics = { ...profileData.body_metrics, ...profile.body_metrics };
        }

        if (profile.preferences && typeof profile.preferences === 'object') {
          profileData.preferences = { ...profileData.preferences, ...profile.preferences };
        }
      } else {
        console.log('⚠️ No profile in Supabase or error:', error?.message);
      }
    } catch (error) {
      console.warn('⚠️ Supabase load error (using fallbacks):', error.message);
    }
  };

  // Load from user metadata
  const loadFromUserMetadata = () => {
    if (!currentUser.user_metadata) return;

    try {
      const metadata = currentUser.user_metadata;

      // Basic info from metadata
      if (metadata.full_name) profileData.basic.full_name = metadata.full_name;
      if (metadata.phone) profileData.basic.phone = metadata.phone;
      if (metadata.avatar_url) profileData.basic.avatar_url = metadata.avatar_url;

      // Additional fields
      if (metadata.profile) {
        Object.assign(profileData.basic, metadata.profile);
      }

      console.log('✅ Loaded from user metadata');
    } catch (error) {
      console.warn('⚠️ Error loading from metadata:', error);
    }
  };

  // Load from localStorage
  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem(`garcia_profile_${currentUser.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        profileData = { ...profileData, ...parsed };
        console.log('✅ Loaded from localStorage');
      }
    } catch (error) {
      console.warn('⚠️ localStorage load error:', error);
    }
  };

  // Enhanced save with multiple fallbacks
  const saveProfileData = async (section = null) => {
    if (saveInProgress) {
      console.log('Save already in progress, skipping...');
      return false;
    }

    saveInProgress = true;

    try {
      console.log(`💾 Saving profile${section ? ` (${section})` : ''}...`);

      // Update timestamp
      if (section && profileData[section]) {
        profileData[section].updated_at = new Date().toISOString();
      }

      let saveSuccess = false;

      // Method 1: Try Supabase
      if (window.supabaseClient) {
        try {
          await saveToSupabase(section);
          saveSuccess = true;
          console.log('✅ Saved to Supabase');
        } catch (supabaseError) {
          console.warn('⚠️ Supabase save failed:', supabaseError.message);

          // Method 2: Fallback to user metadata
          try {
            await saveToUserMetadata(section);
            saveSuccess = true;
            console.log('✅ Saved to user metadata');
          } catch (metadataError) {
            console.warn('⚠️ Metadata save failed:', metadataError.message);
          }
        }
      }

      // Method 3: Always save to localStorage as backup
      saveToLocalStorage();
      console.log('✅ Saved to localStorage');

      if (saveSuccess) {
        showNotification('Profile updated successfully!', 'success');
        updateAllDisplays();
        return true;
      } else {
        showNotification('Profile saved locally. Changes will sync when connection is restored.', 'warning');
        return true;
      }

    } catch (error) {
      console.error('❌ Save error:', error);
      showNotification('Error saving profile. Please try again.', 'error');
      return false;
    } finally {
      saveInProgress = false;
    }
  };

  // Save to Supabase
  const saveToSupabase = async (section) => {
    if (!window.supabaseClient) throw new Error('Supabase client not available');

    const payload = {
      id: currentUser.id,
      updated_at: new Date().toISOString()
    };

    // Basic info
    if (!section || section === 'basic') {
      Object.assign(payload, {
        full_name: profileData.basic.full_name || '',
        phone: profileData.basic.phone || null,
        birthday: profileData.basic.birthday || null,
        location: profileData.basic.location || null,
        bio: profileData.basic.bio || null,
        avatar_url: profileData.basic.avatar_url || null
      });
    }

    // Body metrics as JSON
    if (!section || section === 'body_metrics') {
      payload.body_metrics = profileData.body_metrics || {};
    }

    // Preferences as JSON
    if (!section || section === 'preferences') {
      payload.preferences = profileData.preferences || {};
    }

    const { error } = await window.supabaseClient
      .from('profiles')
      .upsert(payload, { onConflict: 'id' });

    if (error) throw error;
  };

  // Save to user metadata
  const saveToUserMetadata = async (section) => {
    if (!window.supabaseClient) throw new Error('Supabase client not available');

    const metadataUpdate = {};

    if (!section || section === 'basic') {
      Object.assign(metadataUpdate, {
        full_name: profileData.basic.full_name,
        phone: profileData.basic.phone,
        profile: {
          birthday: profileData.basic.birthday,
          location: profileData.basic.location,
          bio: profileData.basic.bio,
          experience_level: profileData.basic.experience_level
        }
      });
    }

    if (!section || section === 'body_metrics') {
      metadataUpdate.body_metrics = profileData.body_metrics;
    }

    if (!section || section === 'preferences') {
      metadataUpdate.preferences = profileData.preferences;
    }

    const { error } = await window.supabaseClient.auth.updateUser({
      data: metadataUpdate
    });

    if (error) throw error;
  };

  // Save to localStorage
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem(
        `garcia_profile_${currentUser.id}`,
        JSON.stringify(profileData)
      );
    } catch (error) {
      console.warn('⚠️ localStorage save error:', error);
    }
  };

  // Update all UI displays
  const updateAllDisplays = () => {
    try {
      updateBasicInfoDisplay();
      updateDashboardStats();
      populateFormFields();
    } catch (error) {
      console.warn('⚠️ Display update error:', error);
    }
  };

  // Update basic info display
  const updateBasicInfoDisplay = () => {
    const elements = {
      'user-name': profileData.basic.full_name || 'User',
      'user-email': profileData.basic.email,
      'user-phone': profileData.basic.phone || 'Not provided',
      'user-location': profileData.basic.location || 'Not provided',
      'user-bio': profileData.basic.bio || 'No bio added yet',
      'profile-name': profileData.basic.full_name || 'Your Profile',
      'profile-email': profileData.basic.email
    };

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });

    // Update avatars
    updateAvatars();
  };

  // Update avatars
  const updateAvatars = () => {
    const avatars = document.querySelectorAll('.user-avatar, .main-avatar, #user-avatar');
    const avatarUrl = profileData.basic.avatar_url ||
      `https://via.placeholder.com/150/333/fff?text=${(profileData.basic.full_name?.charAt(0) || 'U')}`;

    avatars.forEach(avatar => {
      if (avatar) avatar.src = avatarUrl;
    });
  };

  // Update dashboard stats
  const updateDashboardStats = () => {
    const metrics = profileData.body_metrics || {};
    const weight = parseFloat(metrics.current_weight) || 0;
    const height = parseFloat(metrics.height) || 0;
    const targetWeight = parseFloat(metrics.target_weight) || 0;

    // Calculate BMI
    let bmi = 0;
    if (weight > 0 && height > 0) {
      bmi = weight / ((height / 100) ** 2);
    }

    // Update stat cards
    updateStatCard('current-weight', weight > 0 ? `${weight}kg` : '--');
    updateStatCard('target-weight', targetWeight > 0 ? `${targetWeight}kg` : '--');
    updateStatCard('bmi', bmi > 0 ? bmi.toFixed(1) : '--');
    updateStatCard('height', height > 0 ? `${height}cm` : '--');
  };

  // Helper to update stat cards
  const updateStatCard = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };

  // Populate form fields
  const populateFormFields = () => {
    // Basic info form
    populateForm('personalInfoForm', profileData.basic);
    populateForm('fitnessProfileForm', profileData.basic);

    // Body metrics form
    populateForm('bodyMetricsForm', profileData.body_metrics);
  };

  // Helper to populate a form
  const populateForm = (formId, data) => {
    const form = document.getElementById(formId);
    if (!form || !data) return;

    Object.entries(data).forEach(([key, value]) => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input && value !== null && value !== undefined) {
        input.value = value;
      }
    });
  };

  // Initialize UI
  const initializeUI = () => {
    updateAllDisplays();
    console.log('✅ UI initialized');
  };

  // Setup event listeners
  const setupEventListeners = () => {
    // Form submissions
    const forms = document.querySelectorAll('form[data-profile-section]');
    forms.forEach(form => {
      form.addEventListener('submit', handleFormSubmit);
    });

    // Save buttons
    const saveButtons = document.querySelectorAll('[data-save-profile]');
    saveButtons.forEach(button => {
      button.addEventListener('click', handleSaveButton);
    });

    console.log('✅ Event listeners setup');
  };

  // Handle form submission
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const form = event.target;
    const section = form.dataset.profileSection;
    const formData = new FormData(form);

    // Update profile data
    if (section && profileData[section]) {
      Object.entries(Object.fromEntries(formData)).forEach(([key, value]) => {
        profileData[section][key] = value;
      });
    }

    // Save data
    await saveProfileData(section);
  };

  // Handle save button click
  const handleSaveButton = async (event) => {
    const section = event.target.dataset.saveProfile;
    await saveProfileData(section);
  };

  // Show notification
  const showNotification = (message, type = 'info') => {
    // Remove existing notifications
    document.querySelectorAll('.garcia-notification').forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} garcia-notification position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 5000);
  };

  // Public API
  window.GarciaProfileManager = {
    init,
    getCurrentUser,
    getProfileData: () => profileData,
    saveProfileData,
    updateBasicInfoDisplay,
    updateDashboardStats,
    updateAllDisplays,
    handleFormSubmit,
    showNotification
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  console.log('🚀 Enhanced Profile Manager loaded');
})();
