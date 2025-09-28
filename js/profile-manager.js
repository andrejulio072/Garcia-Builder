// Garcia Builder - Complete Profile Management System
(() => {
  let currentUser = null;
  let profileData = {};

  // Initialize profile management
  const init = async () => {
    try {
      // Check authentication
      currentUser = await getCurrentUser();
      if (!currentUser) {
        window.location.href = 'login.html';
        return;
      }

      // Load profile data
      await loadProfileData();

      // Initialize UI
      initializeUI();

      // Set up event listeners
      setupEventListeners();

      console.log('Profile management initialized successfully');
    } catch (error) {
      console.error('Error initializing profile management:', error);
      showNotification('Error loading profile. Please refresh the page.', 'error');
    }
  };

  // Get current user
  const getCurrentUser = async () => {
    try {
      // Check Supabase auth first
      if (window.supabase) {
        const { data: { user } } = await window.supabase.auth.getUser();
        if (user) return user;
      }

      // Fallback to localStorage
      const userData = localStorage.getItem('garcia_user');
      if (userData) {
        return JSON.parse(userData);
      }

      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  };

  // Load complete profile data
  const loadProfileData = async () => {
    try {
      // Initialize default profile structure
      profileData = {
        basic: {
          id: currentUser.id,
          email: currentUser.email || '',
          full_name: currentUser.user_metadata?.full_name || '',
          first_name: currentUser.user_metadata?.first_name || '',
          last_name: currentUser.user_metadata?.last_name || '',
          phone: currentUser.user_metadata?.phone || '',
          avatar_url: currentUser.user_metadata?.avatar_url || '',
          birthday: '',
          location: '',
          bio: '',
          goals: [],
          experience_level: '',
          joined_date: new Date().toISOString(),
          last_login: new Date().toISOString()
        },
        body_metrics: {
          current_weight: '',
          height: '',
          target_weight: '',
          body_fat_percentage: '',
          measurements: {
            chest: '',
            waist: '',
            hips: '',
            arms: '',
            thighs: ''
          },
          progress_photos: [],
          weight_history: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        preferences: {
          units: 'metric', // metric or imperial
          theme: 'dark',
          language: 'en',
          notifications: {
            email: true,
            push: true,
            reminders: true
          },
          privacy: {
            profile_visible: true,
            progress_visible: false
          }
        },
        activity: {
          workouts_completed: 0,
          total_sessions: 0,
          streak_days: 0,
          achievements: [],
          last_workout: null,
          weekly_goals: {}
        }
      };

      // Try to load from Supabase
      if (window.supabase) {
        await loadFromSupabase();
      }

      // Fallback to localStorage
      loadFromLocalStorage();

      console.log('Profile data loaded:', profileData);
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  // Load data from Supabase
  const loadFromSupabase = async () => {
    try {
      // Load basic profile
      const { data: profile, error: profileError } = await window.supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (profile && !profileError) {
        Object.assign(profileData.basic, profile);
      }

      // Load body metrics
      const { data: metrics, error: metricsError } = await window.supabase
        .from('body_metrics')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (metrics && metrics.length > 0 && !metricsError) {
        Object.assign(profileData.body_metrics, metrics[0]);
      }

      // Load preferences
      const { data: prefs, error: prefsError } = await window.supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (prefs && !prefsError) {
        Object.assign(profileData.preferences, prefs);
      }

    } catch (error) {
      console.error('Error loading from Supabase:', error);
    }
  };

  // Load data from localStorage as fallback
  const loadFromLocalStorage = () => {
    try {
      const savedProfile = localStorage.getItem(`garcia_profile_${currentUser.id}`);
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        profileData = { ...profileData, ...parsed };
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  };

  // Save profile data
  const saveProfileData = async (section = null) => {
    try {
      // Update timestamp
      if (section) {
        profileData[section].updated_at = new Date().toISOString();
      }

      // Save to Supabase
      if (window.supabase) {
        await saveToSupabase(section);
      }

      // Save to localStorage as backup
      saveToLocalStorage();

      showNotification('Profile updated successfully!', 'success');
      return true;
    } catch (error) {
      console.error('Error saving profile data:', error);
      showNotification('Error saving profile. Please try again.', 'error');
      return false;
    }
  };

  // Save to Supabase
  const saveToSupabase = async (section) => {
    try {
      if (section === 'basic' || !section) {
        const { error } = await window.supabase
          .from('user_profiles')
          .upsert({
            user_id: currentUser.id,
            ...profileData.basic
          });

        if (error) throw error;
      }

      if (section === 'body_metrics' || !section) {
        const { error } = await window.supabase
          .from('body_metrics')
          .upsert({
            user_id: currentUser.id,
            ...profileData.body_metrics
          });

        if (error) throw error;
      }

      if (section === 'preferences' || !section) {
        const { error } = await window.supabase
          .from('user_preferences')
          .upsert({
            user_id: currentUser.id,
            ...profileData.preferences
          });

        if (error) throw error;
      }

    } catch (error) {
      console.error('Error saving to Supabase:', error);
      throw error;
    }
  };

  // Save to localStorage
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem(
        `garcia_profile_${currentUser.id}`,
        JSON.stringify(profileData)
      );
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  // Initialize UI components
  const initializeUI = () => {
    // Update basic info displays
    updateBasicInfoDisplay();

    // Update dashboard stats
    updateDashboardStats();

    // Setup forms
    setupForms();

    // Setup photo upload
    setupPhotoUpload();

    console.log('UI initialized');
  };

  // Update basic info display
  const updateBasicInfoDisplay = () => {
    const elements = {
      'user-name': profileData.basic.full_name || profileData.basic.first_name || 'User',
      'user-email': profileData.basic.email,
      'user-phone': profileData.basic.phone || 'Not provided',
      'user-location': profileData.basic.location || 'Not provided',
      'user-bio': profileData.basic.bio || 'No bio added yet',
      'user-goals': profileData.basic.goals.join(', ') || 'No goals set',
      'user-experience': profileData.basic.experience_level || 'Not specified',
      'member-since': formatDate(profileData.basic.joined_date)
    };

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    });

    // Update avatar
    const avatars = document.querySelectorAll('.user-avatar, .main-avatar, #user-avatar');
    avatars.forEach(avatar => {
      if (profileData.basic.avatar_url) {
        avatar.src = profileData.basic.avatar_url;
      } else {
        avatar.src = 'https://via.placeholder.com/150/333/fff?text=' +
                    (profileData.basic.full_name?.charAt(0) || 'U');
      }
    });
  };

  // Update dashboard stats
  const updateDashboardStats = () => {
    const stats = {
      'workouts-completed': profileData.activity.workouts_completed,
      'current-streak': profileData.activity.streak_days,
      'total-sessions': profileData.activity.total_sessions,
      'current-weight': profileData.body_metrics.current_weight ?
        `${profileData.body_metrics.current_weight} ${profileData.preferences.units === 'metric' ? 'kg' : 'lbs'}` : 'Not set',
      'target-weight': profileData.body_metrics.target_weight ?
        `${profileData.body_metrics.target_weight} ${profileData.preferences.units === 'metric' ? 'kg' : 'lbs'}` : 'Not set',
      'bmi': calculateBMI() || 'Not available'
    };

    Object.entries(stats).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    });
  };

  // Setup forms
  const setupForms = () => {
    // Basic info form
    const basicForm = document.getElementById('basic-info-form');
    if (basicForm) {
      // Populate form fields
      const fields = ['full_name', 'first_name', 'last_name', 'phone', 'birthday', 'location', 'bio', 'experience_level'];
      fields.forEach(field => {
        const input = basicForm.querySelector(`[name="${field}"]`);
        if (input && profileData.basic[field]) {
          input.value = profileData.basic[field];
        }
      });

      // Handle goals checkboxes
      const goalCheckboxes = basicForm.querySelectorAll('input[name="goals"]');
      goalCheckboxes.forEach(checkbox => {
        checkbox.checked = profileData.basic.goals.includes(checkbox.value);
      });
    }

    // Body metrics form
    const metricsForm = document.getElementById('body-metrics-form');
    if (metricsForm) {
      const fields = ['current_weight', 'height', 'target_weight', 'body_fat_percentage'];
      fields.forEach(field => {
        const input = metricsForm.querySelector(`[name="${field}"]`);
        if (input && profileData.body_metrics[field]) {
          input.value = profileData.body_metrics[field];
        }
      });

      // Measurements
      Object.entries(profileData.body_metrics.measurements || {}).forEach(([key, value]) => {
        const input = metricsForm.querySelector(`[name="measurements_${key}"]`);
        if (input && value) {
          input.value = value;
        }
      });
    }
  };

  // Setup photo upload
  const setupPhotoUpload = () => {
    const photoInput = document.getElementById('photo-upload');
    const avatarUpload = document.getElementById('avatar-upload');

    if (photoInput) {
      photoInput.addEventListener('change', handlePhotoUpload);
    }

    if (avatarUpload) {
      avatarUpload.addEventListener('change', handleAvatarUpload);
    }
  };

  // Handle photo upload
  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const imageUrl = await uploadImage(file, 'progress');
      profileData.body_metrics.progress_photos.push({
        url: imageUrl,
        date: new Date().toISOString(),
        notes: ''
      });

      await saveProfileData('body_metrics');
      updateProgressPhotos();
    } catch (error) {
      console.error('Error uploading photo:', error);
      showNotification('Error uploading photo. Please try again.', 'error');
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const imageUrl = await uploadImage(file, 'avatars');
      profileData.basic.avatar_url = imageUrl;

      await saveProfileData('basic');
      updateBasicInfoDisplay();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      showNotification('Error uploading avatar. Please try again.', 'error');
    }
  };

  // Upload image
  const uploadImage = async (file, folder) => {
    // For now, use a placeholder service or base64
    // In production, implement proper image upload to Supabase Storage
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        // For demo purposes, store as base64
        // In production, upload to Supabase Storage
        resolve(e.target.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Setup event listeners
  const setupEventListeners = () => {
    // Save buttons
    document.querySelectorAll('.save-profile-btn').forEach(btn => {
      btn.addEventListener('click', handleSaveProfile);
    });

    // Form submissions
    const forms = document.querySelectorAll('form[data-profile-section]');
    forms.forEach(form => {
      form.addEventListener('submit', handleFormSubmit);
    });

    // Weight tracking
    const weightInput = document.getElementById('current_weight');
    if (weightInput) {
      weightInput.addEventListener('change', handleWeightChange);
    }
  };

  // Handle save profile
  const handleSaveProfile = async (event) => {
    const section = event.target.dataset.section;
    const success = await saveProfileData(section);

    if (success) {
      updateBasicInfoDisplay();
      updateDashboardStats();
    }
  };

  // Handle form submit
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const form = event.target;
    const section = form.dataset.profileSection;
    const formData = new FormData(form);

    // Update profile data based on section
    if (section === 'basic') {
      Object.entries(Object.fromEntries(formData)).forEach(([key, value]) => {
        if (key === 'goals') {
          profileData.basic.goals = formData.getAll('goals');
        } else {
          profileData.basic[key] = value;
        }
      });
    } else if (section === 'body_metrics') {
      Object.entries(Object.fromEntries(formData)).forEach(([key, value]) => {
        if (key.startsWith('measurements_')) {
          const measurementKey = key.replace('measurements_', '');
          profileData.body_metrics.measurements[measurementKey] = value;
        } else {
          profileData.body_metrics[key] = value;
        }
      });
    }

    await saveProfileData(section);
  };

  // Handle weight change
  const handleWeightChange = (event) => {
    const newWeight = event.target.value;
    if (newWeight && newWeight !== profileData.body_metrics.current_weight) {
      // Add to weight history
      profileData.body_metrics.weight_history.push({
        weight: parseFloat(newWeight),
        date: new Date().toISOString()
      });

      // Keep only last 50 entries
      if (profileData.body_metrics.weight_history.length > 50) {
        profileData.body_metrics.weight_history = profileData.body_metrics.weight_history.slice(-50);
      }
    }
  };

  // Calculate BMI
  const calculateBMI = () => {
    const weight = parseFloat(profileData.body_metrics.current_weight);
    const height = parseFloat(profileData.body_metrics.height);

    if (!weight || !height) return null;

    // Convert height to meters if in cm
    const heightInMeters = height > 3 ? height / 100 : height;
    const bmi = weight / (heightInMeters * heightInMeters);

    return bmi.toFixed(1);
  };

  // Update progress photos display
  const updateProgressPhotos = () => {
    const container = document.getElementById('progress-photos-container');
    if (!container) return;

    container.innerHTML = '';

    profileData.body_metrics.progress_photos.forEach((photo, index) => {
      const photoElement = document.createElement('div');
      photoElement.className = 'progress-photo';
      photoElement.innerHTML = `
        <img src="${photo.url}" alt="Progress photo ${index + 1}" class="img-fluid rounded">
        <div class="photo-date">${formatDate(photo.date)}</div>
      `;
      container.appendChild(photoElement);
    });
  };

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const showNotification = (message, type = 'info') => {
    // Simple notification system
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : 'success'} position-fixed top-0 end-0 m-3`;
    notification.style.zIndex = '9999';
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  // Public API
  window.GarciaProfileManager = {
    init,
    getCurrentUser,
    getProfileData: () => profileData,
    saveProfileData,
    updateBasicInfoDisplay,
    updateDashboardStats
  };

  // Auto-initialize if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
