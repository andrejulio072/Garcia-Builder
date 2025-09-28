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
        const ret = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `login.html?redirect=${ret}`;
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
      // Prefer Supabase client if available
      if (window.supabaseClient && window.supabaseClient.auth) {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (user) return user;
      }

      // Fallback: auth system might have stored a normalized current user
      const stored = localStorage.getItem('gb_current_user') || localStorage.getItem('garcia_user');
      if (stored) return JSON.parse(stored);

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
          birthday: currentUser.user_metadata?.date_of_birth || '',
          location: '',
          bio: '',
          goals: [],
          experience_level: '',
          trainer_id: null,
          trainer_name: '',
          joined_date: new Date().toISOString(),
          last_login: new Date().toISOString()
        },
        body_metrics: {
          current_weight: '',
          height: '',
          target_weight: '',
          body_fat_percentage: '',
          muscle_mass: '',
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
      if (window.supabaseClient) {
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
      const { data: profile, error: profileError } = await window.supabaseClient
        .from('user_profiles')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (profile && !profileError) {
        Object.assign(profileData.basic, profile);
      }

      // Load body metrics
      const { data: metrics, error: metricsError } = await window.supabaseClient
        .from('body_metrics')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (metrics && !metricsError) {
        Object.assign(profileData.body_metrics, metrics);
      }

      // Load preferences
      const { data: prefs, error: prefsError } = await window.supabaseClient
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
      if (window.supabaseClient) {
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
      const num = (v) => {
        if (v === undefined || v === null || v === '') return null;
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
      };

      const pick = (obj, keys) => keys.reduce((acc, k) => {
        if (obj[k] !== undefined) acc[k] = obj[k];
        return acc;
      }, {});

      const normalizeDate = (v) => {
        if (!v) return null;
        // Handle dd/mm/yyyy or yyyy-mm-dd
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) {
          const [d, m, y] = v.split('/');
          return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
        }
        // Accept yyyy-mm-dd or ISO
        const dt = new Date(v);
        if (!isNaN(dt.getTime())) {
          return dt.toISOString().slice(0,10);
        }
        return null;
      };

      if (section === 'basic' || !section) {
        // whitelist columns for user_profiles
        const allowed = [
          'email','full_name','first_name','last_name','phone','avatar_url','birthday','location','bio','goals','experience_level','joined_date','last_login','trainer_id','trainer_name'
        ];
        const base = pick(profileData.basic, allowed);
        const payload = {
          user_id: currentUser.id,
          ...base,
          birthday: normalizeDate(base.birthday),
          updated_at: new Date().toISOString()
        };
        const { error } = await window.supabaseClient
          .from('user_profiles')
          .upsert(payload);

        if (error) {
          const msg = error?.message || 'Unknown error';
          console.error('user_profiles upsert failed:', error);
          showNotification(`Profile save failed: ${msg}`, 'error');
          throw error;
        }
      }

      if (section === 'body_metrics' || !section) {
        const allowed = [
          'current_weight','height','target_weight','body_fat_percentage','muscle_mass','measurements','progress_photos','weight_history','created_at','updated_at'
        ];
        const base = pick(profileData.body_metrics, allowed);
        const payload = {
          user_id: currentUser.id,
          ...base,
          current_weight: num(base.current_weight),
          height: num(base.height),
          target_weight: num(base.target_weight),
          body_fat_percentage: num(base.body_fat_percentage),
          muscle_mass: num(base.muscle_mass),
          updated_at: new Date().toISOString()
        };
        const { error } = await window.supabaseClient
          .from('body_metrics')
          .upsert(payload);

        if (error) {
          const msg = error?.message || 'Unknown error';
          console.error('body_metrics upsert failed:', error);
          showNotification(`Metrics save failed: ${msg}`, 'error');
          throw error;
        }
      }

      if (section === 'preferences' || !section) {
        const allowed = ['units','theme','language','notifications','privacy','created_at','updated_at'];
        const base = pick(profileData.preferences, allowed);
        const payload = {
          user_id: currentUser.id,
          ...base,
          updated_at: new Date().toISOString()
        };
        const { error } = await window.supabaseClient
          .from('user_preferences')
          .upsert(payload);

        if (error) {
          const msg = error?.message || 'Unknown error';
          console.error('user_preferences upsert failed:', error);
          showNotification(`Preferences save failed: ${msg}`, 'error');
          throw error;
        }
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

  // Render any existing progress photos
  updateProgressPhotos();

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
      'member-since': formatDate(profileData.basic.joined_date),
      'member-since-display': formatDate(profileData.basic.joined_date),
      'last-login': formatDate(profileData.basic.last_login),
      'profile-name': profileData.basic.full_name || profileData.basic.first_name || 'Your Profile',
      'profile-email': profileData.basic.email
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
      const fields = ['full_name', 'first_name', 'last_name', 'phone', 'birthday', 'location', 'bio', 'experience_level', 'trainer_name', 'trainer_id'];
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
      const fields = ['current_weight', 'height', 'target_weight', 'body_fat_percentage', 'muscle_mass'];
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
    try {
      if (window.supabaseClient && window.supabaseClient.storage) {
        const bucket = 'user-assets';
        const path = `${currentUser.id}/${folder}/${Date.now()}-${file.name}`;
        const { data, error } = await window.supabaseClient.storage.from(bucket).upload(path, file, {
          cacheControl: '3600', upsert: false, contentType: file.type
        });
        if (error) throw error;
        const { data: pub } = window.supabaseClient.storage.from(bucket).getPublicUrl(data.path);
        return pub.publicUrl;
      }
    } catch (e) {
      console.warn('Supabase Storage upload failed, falling back to base64:', e?.message || e);
    }
    // Fallback: base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
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
      // Normalize birthday
      if (profileData.basic.birthday) {
        const v = profileData.basic.birthday;
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) {
          const [d,m,y] = v.split('/');
          profileData.basic.birthday = `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
        }
      }
    } else if (section === 'body_metrics') {
      Object.entries(Object.fromEntries(formData)).forEach(([key, value]) => {
        if (key.startsWith('measurements_')) {
          const measurementKey = key.replace('measurements_', '');
          profileData.body_metrics.measurements[measurementKey] = value;
        } else {
          profileData.body_metrics[key] = value;
        }
      });
    } else if (section === 'preferences') {
      // Selects
      const units = formData.get('units');
      const language = formData.get('language');
      if (units) profileData.preferences.units = units;
      if (language) profileData.preferences.language = language;

      // Notifications
      profileData.preferences.notifications = {
        ...profileData.preferences.notifications,
        email: !!formData.get('email_notifications'),
        reminders: !!formData.get('workout_reminders'),
      };

      // Privacy
      profileData.preferences.privacy = {
        ...profileData.preferences.privacy,
        profile_visible: !!formData.get('profile_visible'),
        progress_visible: !!formData.get('progress_visible')
      };
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
    updateDashboardStats,
    handleFormSubmit,
    handleSaveProfile
  };

  // Auto-initialize if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
