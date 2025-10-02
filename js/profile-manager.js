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

      // Initial display update
      updateBodyMetricsDisplays();

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
        macros: {
          goal: 'maintain',
          activity_level: 'moderate',
          calories: '',
          protein_pct: 30,
          carbs_pct: 40,
          fats_pct: 30,
          protein_g: '',
          carbs_g: '',
          fats_g: '',
          updated_at: new Date().toISOString()
        },
        habits: {
          // keyed by yyyy-mm-dd
          daily: {},
          updated_at: new Date().toISOString()
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
      // Load from main profiles table
      const { data: profile, error: profileError } = await window.supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profile && !profileError) {
        // Map Supabase profile to our structure
        profileData.basic = {
          ...profileData.basic,
          full_name: profile.full_name || currentUser.user_metadata?.full_name || '',
          email: currentUser.email || '',
          phone: profile.phone || currentUser.user_metadata?.phone || '',
          avatar_url: profile.avatar_url || currentUser.user_metadata?.avatar_url || '',
          birthday: profile.date_of_birth || currentUser.user_metadata?.birthday || '',
          location: currentUser.user_metadata?.location || '',
          bio: currentUser.user_metadata?.bio || '',
          experience_level: currentUser.user_metadata?.experience_level || 'beginner'
        };
      } else {
        // Fallback to user metadata
        const userData = currentUser.user_metadata || {};
        profileData.basic = {
          ...profileData.basic,
          full_name: userData.full_name || '',
          email: currentUser.email || '',
          phone: userData.phone || '',
          avatar_url: userData.avatar_url || '',
          birthday: userData.birthday || '',
          location: userData.location || '',
          bio: userData.bio || '',
          experience_level: userData.experience_level || 'beginner'
        };
      }

      // Load body metrics from user metadata
      if (currentUser.user_metadata?.body_metrics) {
        Object.assign(profileData.body_metrics, currentUser.user_metadata.body_metrics);
      }

      // Load preferences from user metadata
      if (currentUser.user_metadata?.preferences) {
        Object.assign(profileData.preferences, currentUser.user_metadata.preferences);
      }
      // Load habits from user metadata
      if (currentUser.user_metadata?.habits) {
        Object.assign(profileData.habits, currentUser.user_metadata.habits);
      }

      // Load macros from user metadata
      if (currentUser.user_metadata?.macros) {
        Object.assign(profileData.macros, currentUser.user_metadata.macros);
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

      // Try to create profiles table if it doesn't exist
      if (error.message && error.message.includes('table') && error.message.includes('does not exist')) {
        try {
          await createProfilesTable();
          // Retry saving after creating table
          await saveToSupabase(section);
          saveToLocalStorage();
          showNotification('Profile updated successfully!', 'success');
          return true;
        } catch (createError) {
          console.error('Error creating profiles table:', createError);
        }
      }

      showNotification('Error saving profile. Please try again.', 'error');
      return false;
    }
  };

  // Create profiles table if it doesn't exist
  const createProfilesTable = async () => {
    try {
      const { error } = await window.supabaseClient.rpc('exec', {
        sql: `
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
          full_name TEXT,
          phone TEXT,
          avatar_url TEXT,
          date_of_birth DATE,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Enable RLS
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY IF NOT EXISTS "Users can view own profile" ON profiles
          FOR SELECT USING (auth.uid() = id);

        CREATE POLICY IF NOT EXISTS "Users can update own profile" ON profiles
          FOR UPDATE USING (auth.uid() = id);

        CREATE POLICY IF NOT EXISTS "Users can insert own profile" ON profiles
          FOR INSERT WITH CHECK (auth.uid() = id);
        `
      });

      if (error) {
        console.warn('Could not create profiles table via RPC:', error);
      } else {
        console.log('Profiles table created successfully');
      }
    } catch (error) {
      console.warn('Could not create profiles table:', error);
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

      // Try to save to profiles table (main Supabase auth table)
      if (section === 'basic' || !section) {
        try {
          // Use the main profiles table that comes with Supabase Auth
          const payload = {
            id: currentUser.id,
            full_name: profileData.basic.full_name || currentUser.user_metadata?.full_name || '',
            phone: profileData.basic.phone || currentUser.user_metadata?.phone || null,
            avatar_url: profileData.basic.avatar_url || currentUser.user_metadata?.avatar_url || null,
            updated_at: new Date().toISOString()
          };

          // Add custom fields if they exist
          if (profileData.basic.birthday) {
            payload.date_of_birth = normalizeDate(profileData.basic.birthday);
          }

          const { error: profileError } = await window.supabaseClient
            .from('profiles')
            .upsert(payload, { onConflict: 'id' });

          if (profileError) {
            console.warn('Profiles table upsert failed, trying fallback:', profileError);

            // Fallback: Try to update user metadata
            const { error: metadataError } = await window.supabaseClient.auth.updateUser({
              data: {
                full_name: profileData.basic.full_name,
                phone: profileData.basic.phone,
                birthday: profileData.basic.birthday,
                location: profileData.basic.location,
                bio: profileData.basic.bio,
                experience_level: profileData.basic.experience_level
              }
            });

            if (metadataError) {
              throw new Error(`Failed to save profile: ${metadataError.message}`);
            }
          }

        } catch (error) {
          console.error('Error saving basic profile:', error);
          throw error;
        }
      }

      // Save metrics to user metadata as fallback (no separate table needed)
      if (section === 'body_metrics' || !section) {
        try {
          const metricsData = {
            current_weight: num(profileData.body_metrics.current_weight),
            height: num(profileData.body_metrics.height),
            target_weight: num(profileData.body_metrics.target_weight),
            body_fat_percentage: num(profileData.body_metrics.body_fat_percentage),
            muscle_mass: num(profileData.body_metrics.muscle_mass),
            measurements_chest: num(profileData.body_metrics.measurements_chest),
            measurements_waist: num(profileData.body_metrics.measurements_waist),
            measurements_hips: num(profileData.body_metrics.measurements_hips),
            measurements_arms: num(profileData.body_metrics.measurements_arms),
            measurements_thighs: num(profileData.body_metrics.measurements_thighs),
            updated_at: new Date().toISOString()
          };

          // Store in user metadata
          const { error: metricsError } = await window.supabaseClient.auth.updateUser({
            data: { body_metrics: metricsData }
          });

          if (metricsError) {
            console.warn('Failed to save metrics to user metadata:', metricsError);
          }

        } catch (error) {
          console.error('Error saving body metrics:', error);
          // Don't throw error for metrics, just log it
        }
      }

  // Save preferences to user metadata
      if (section === 'preferences' || !section) {
        try {
          const preferencesData = {
            units: profileData.preferences.units || 'metric',
            language: profileData.preferences.language || 'en',
            notifications: profileData.preferences.notifications || {},
            updated_at: new Date().toISOString()
          };

          // Store in user metadata
          const { error: prefsError } = await window.supabaseClient.auth.updateUser({
            data: { preferences: preferencesData }
          });

          if (prefsError) {
            console.warn('Failed to save preferences to user metadata:', prefsError);
          }

        } catch (error) {
          console.error('Error saving preferences:', error);
          // Don't throw error for preferences, just log it
        }
      }

      // Save macros to user metadata
      if (section === 'macros' || !section) {
        try {
          const macrosData = {
            goal: profileData.macros.goal || 'maintain',
            activity_level: profileData.macros.activity_level || 'moderate',
            calories: profileData.macros.calories ? Number(profileData.macros.calories) : null,
            protein_pct: Number(profileData.macros.protein_pct) || 0,
            carbs_pct: Number(profileData.macros.carbs_pct) || 0,
            fats_pct: Number(profileData.macros.fats_pct) || 0,
            protein_g: profileData.macros.protein_g ? Number(profileData.macros.protein_g) : null,
            carbs_g: profileData.macros.carbs_g ? Number(profileData.macros.carbs_g) : null,
            fats_g: profileData.macros.fats_g ? Number(profileData.macros.fats_g) : null,
            updated_at: new Date().toISOString()
          };

          const { error: macrosError } = await window.supabaseClient.auth.updateUser({
            data: { macros: macrosData }
          });

          if (macrosError) {
            console.warn('Failed to save macros to user metadata:', macrosError);
          }

        } catch (error) {
          console.error('Error saving macros:', error);
        }
      }

      // Save habits to user metadata
      if (section === 'habits' || !section) {
        try {
          const habitsData = {
            daily: profileData.habits.daily || {},
            updated_at: new Date().toISOString()
          };
          const { error: habitsError } = await window.supabaseClient.auth.updateUser({ data: { habits: habitsData } });
          if (habitsError) console.warn('Failed to save habits to user metadata:', habitsError);
        } catch (e) {
          console.error('Error saving habits:', e);
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

    // Render weight chart if data exists
    renderWeightHistoryChart();

  // Habits
  setupHabitsForm();
  renderHabitsStreaks();
  renderHabitsStepsChart();

    // Setup Macros form
    setupMacrosForm();

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

      // Trigger auto-calculations after form is populated
      setTimeout(() => {
        updateBodyMetricsDisplays();

        // Trigger BMI calculation if weight and height are available
        const weightInput = metricsForm.querySelector('[name="current_weight"]');
        const heightInput = metricsForm.querySelector('[name="height"]');
        if (weightInput && heightInput && weightInput.value && heightInput.value) {
          weightInput.dispatchEvent(new Event('input'));
        }
      }, 200);
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
      // Persist progress photos in metadata as well
      try {
        await window.supabaseClient?.auth?.updateUser({
          data: { body_metrics: { ...profileData.body_metrics, progress_photos: profileData.body_metrics.progress_photos } }
        });
      } catch (e) { console.warn('Could not persist progress photos to metadata', e); }
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

    // Setup automatic calculations
    setupAutoCalculations();

    // Macros auto calculations
    setupMacrosAutoCalculations();

    // Auto-save habits on change
    const habitsForm = document.getElementById('habits-form');
    if (habitsForm) {
      habitsForm.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', () => {
          const evt = { target: habitsForm, preventDefault: () => {} };
          handleFormSubmit(evt);
        });
      });
    }
  };

  // Habits helpers
  const todayKey = () => new Date().toISOString().slice(0,10);

  const setupHabitsForm = () => {
    const form = document.getElementById('habits-form');
    if (!form) return;

    const t = profileData.habits.daily[todayKey()] || {};
    const map = {
      water_ml: 'habits_water',
      steps: 'habits_steps',
      sleep_hours: 'habits_sleep',
      workout: 'habits_workout',
      meditation: 'habits_meditation',
      stretch: 'habits_stretch'
    };
    Object.entries(map).forEach(([k,id]) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (el.type === 'checkbox') el.checked = !!t[k];
      else if (t[k] !== undefined) el.value = t[k];
    });
  };

  const renderHabitsStreaks = () => {
    const metrics = ['workout','meditation','stretch'];
    metrics.forEach(m => {
      const n = computeStreak(m);
      const el = document.getElementById(`streak-${m}`);
      if (el) el.textContent = n;
    });
  };

  const computeStreak = (metric) => {
    const entries = profileData.habits.daily || {};
    // Count consecutive days backwards from today
    let streak = 0;
    for (let i=0; i<365; i++) {
      const d = new Date();
      d.setDate(d.getDate()-i);
      const key = d.toISOString().slice(0,10);
      if (entries[key]?.[metric]) streak++; else break;
    }
    return streak;
  };

  let habitsStepsChartInstance = null;
  const renderHabitsStepsChart = () => {
    const canvas = document.getElementById('habits-steps-canvas');
    if (!canvas) return;
    const entries = profileData.habits.daily || {};
    const labels = [];
    const data = [];
    for (let i=6; i>=0; i--) {
      const d = new Date();
      d.setDate(d.getDate()-i);
      const key = d.toISOString().slice(0,10);
      labels.push(d.toLocaleDateString());
      data.push(entries[key]?.steps || 0);
    }
    const ctx = canvas.getContext('2d');
    if (habitsStepsChartInstance) {
      habitsStepsChartInstance.data.labels = labels;
      habitsStepsChartInstance.data.datasets[0].data = data;
      habitsStepsChartInstance.update();
      return;
    }
    habitsStepsChartInstance = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Steps', data, backgroundColor: 'rgba(246,200,78,0.55)' }] },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: '#fff' } } },
        scales: {
          x: { ticks: { color: '#ddd' }, grid: { color: 'rgba(255,255,255,0.1)' } },
          y: { ticks: { color: '#ddd' }, grid: { color: 'rgba(255,255,255,0.1)' } }
        }
      }
    });
  };

  // Setup Macros form population
  const setupMacrosForm = () => {
    const form = document.getElementById('macros-form');
    if (!form) return;

    // Populate
    const f = profileData.macros || {};
    const map = new Map([
      ['goal','macros_goal'],
      ['activity_level','macros_activity'],
      ['calories','macros_calories'],
      ['protein_pct','macros_protein_pct'],
      ['carbs_pct','macros_carbs_pct'],
      ['fats_pct','macros_fats_pct']
    ]);
    map.forEach((elId,key) => {
      const el = document.getElementById(elId);
      if (el && f[key] !== undefined && f[key] !== '') el.value = f[key];
    });

    // Render targets
    renderMacroTargets();

    // Auto-calc calories button
    document.getElementById('btn-auto-calc-calories')?.addEventListener('click', () => {
      const cals = autoCalculateCalories();
      const input = document.getElementById('macros_calories');
      if (cals && input) {
        input.value = Math.round(cals);
        profileData.macros.calories = Math.round(cals);
        renderMacroTargets();
      } else {
        document.getElementById('macros-tip')?.setAttribute('style','display:block');
      }
    });
  };

  // Setup listeners for macros auto updates
  const setupMacrosAutoCalculations = () => {
    const form = document.getElementById('macros-form');
    if (!form) return;

    const inputs = ['macros_goal','macros_activity','macros_calories','macros_protein_pct','macros_carbs_pct','macros_fats_pct'];
    inputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => {
        // Update model
        const nameMap = {
          'macros_goal':'goal',
          'macros_activity':'activity_level',
          'macros_calories':'calories',
          'macros_protein_pct':'protein_pct',
          'macros_carbs_pct':'carbs_pct',
          'macros_fats_pct':'fats_pct'
        };
        const key = nameMap[id];
        profileData.macros[key] = el.type === 'number' ? Number(el.value) : el.value;

        // Keep split to 100%
        enforceMacroSplit();
        renderMacroTargets();
      });
    });
  };

  // Ensure macro split total equals 100%
  const enforceMacroSplit = () => {
    const p = Number(document.getElementById('macros_protein_pct')?.value || 0);
    const c = Number(document.getElementById('macros_carbs_pct')?.value || 0);
    const f = Number(document.getElementById('macros_fats_pct')?.value || 0);
    const total = p + c + f;
    if (!total) return;
    if (total !== 100) {
      // Normalize proportionally
      const np = Math.round((p / total) * 100);
      const nc = Math.round((c / total) * 100);
      let nf = 100 - np - nc;
      // Update UI
      ['macros_protein_pct','macros_carbs_pct','macros_fats_pct'].forEach((id, idx) => {
        const val = idx === 0 ? np : idx === 1 ? nc : nf;
        const el = document.getElementById(id);
        if (el) el.value = val;
      });
      // Update model
      profileData.macros.protein_pct = np;
      profileData.macros.carbs_pct = nc;
      profileData.macros.fats_pct = nf;
    }
  };

  // Auto-calc calories based on BMR, activity and goal
  const autoCalculateCalories = () => {
    const weight = Number(profileData.body_metrics.current_weight || 0);
    const height = Number(profileData.body_metrics.height || 0);
    if (!weight || !height) return null;

    // Reuse BMR function (assume age 30, male)
    const bmr = calculateBMR(weight, height);
    const activityMap = { sedentary:1.2, light:1.375, moderate:1.55, very:1.725, athlete:1.9 };
    const factor = activityMap[profileData.macros.activity_level || 'moderate'] || 1.55;
    let tdee = bmr * factor;

    // Adjust for goal
    const goal = profileData.macros.goal || 'maintain';
    if (goal === 'cut') tdee *= 0.85; // ~15% deficit
    if (goal === 'bulk') tdee *= 1.10; // ~10% surplus
    return tdee;
  };

  // Compute grams from calories and split
  const renderMacroTargets = () => {
    const calories = Number(document.getElementById('macros_calories')?.value || profileData.macros.calories || 0);
    const p = Number(document.getElementById('macros_protein_pct')?.value || profileData.macros.protein_pct || 0);
    const c = Number(document.getElementById('macros_carbs_pct')?.value || profileData.macros.carbs_pct || 0);
    const f = Number(document.getElementById('macros_fats_pct')?.value || profileData.macros.fats_pct || 0);
    if (!calories || (p + c + f) !== 100) {
      ['display-protein-g','display-carbs-g','display-fats-g'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '--g';
      });
      return;
    }

    const proteinCal = calories * (p/100);
    const carbsCal = calories * (c/100);
    const fatsCal = calories * (f/100);
    const proteinG = Math.round(proteinCal / 4);
    const carbsG = Math.round(carbsCal / 4);
    const fatsG = Math.round(fatsCal / 9);

    profileData.macros.protein_g = proteinG;
    profileData.macros.carbs_g = carbsG;
    profileData.macros.fats_g = fatsG;

    const map = new Map([
      ['display-protein-g', proteinG + 'g'],
      ['display-carbs-g', carbsG + 'g'],
      ['display-fats-g', fatsG + 'g']
    ]);
    map.forEach((val,id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    });
  };

  // Setup automatic calculations for body metrics
  const setupAutoCalculations = () => {
    const metricsForm = document.getElementById('body-metrics-form');
    if (!metricsForm) return;

    // Get input elements
    const weightInput = metricsForm.querySelector('[name="current_weight"]');
    const heightInput = metricsForm.querySelector('[name="height"]');
    const bodyFatInput = metricsForm.querySelector('[name="body_fat_percentage"]');
    const muscleMassInput = metricsForm.querySelector('[name="muscle_mass"]');

    // Auto-calculate BMI when weight and height change
    if (weightInput && heightInput) {
      const calculateAndDisplayBMI = () => {
        const weight = parseFloat(weightInput.value);
        const height = parseFloat(heightInput.value);

        if (weight > 0 && height > 0) {
          // Convert height from cm to meters for BMI calculation
          const heightInMeters = height / 100;
          const bmi = weight / (heightInMeters * heightInMeters);

          // Update BMI display in the cards
          updateBMIDisplay(bmi);

          // Also estimate body fat percentage if not manually entered
          if (!bodyFatInput.value) {
            estimateBodyFat(bmi);
          }
        }
      };

      weightInput.addEventListener('input', calculateAndDisplayBMI);
      heightInput.addEventListener('input', calculateAndDisplayBMI);

      // Calculate on page load if values exist
      setTimeout(calculateAndDisplayBMI, 100);
    }

    // Auto-calculate lean body mass when weight and body fat are entered
    if (weightInput && bodyFatInput) {
      const calculateLeanBodyMass = () => {
        const weight = parseFloat(weightInput.value);
        const bodyFat = parseFloat(bodyFatInput.value);

        if (weight > 0 && bodyFat >= 0 && bodyFat <= 50) {
          const leanBodyMass = weight * (1 - bodyFat / 100);

          // Update muscle mass field if not manually entered
          if (muscleMassInput && !muscleMassInput.value) {
            muscleMassInput.value = Math.round(leanBodyMass * 10) / 10;
          }

          // Update muscle mass display card
          updateMuscleMassDisplay(leanBodyMass);
        }
      };

      weightInput.addEventListener('input', calculateLeanBodyMass);
      bodyFatInput.addEventListener('input', calculateLeanBodyMass);

      // Calculate on page load if values exist
      setTimeout(calculateLeanBodyMass, 100);
    }

    // Update displays when any measurement changes
    const measurementInputs = metricsForm.querySelectorAll('input[type="number"]');
    measurementInputs.forEach(input => {
      input.addEventListener('input', () => {
        updateBodyMetricsDisplays();
        calculateAdvancedMetrics();
      });
    });

    // Calculate advanced metrics on page load
    setTimeout(() => {
      calculateAdvancedMetrics();
    }, 200);
  };

  // Calculate advanced metrics (calories, hydration, progress)
  const calculateAdvancedMetrics = () => {
    const metricsForm = document.getElementById('body-metrics-form');
    if (!metricsForm) return;

    const weight = parseFloat(metricsForm.querySelector('[name="current_weight"]')?.value || 0);
    const height = parseFloat(metricsForm.querySelector('[name="height"]')?.value || 0);
    const targetWeight = parseFloat(metricsForm.querySelector('[name="target_weight"]')?.value || 0);
    const bodyFat = parseFloat(metricsForm.querySelector('[name="body_fat_percentage"]')?.value || 0);

    // Calculate daily calorie needs (basic formula)
    if (weight > 0 && height > 0) {
      const bmr = calculateBMR(weight, height);
      const dailyCalories = Math.round(bmr * 1.55); // Moderate activity level
      updateCaloriesDisplay(dailyCalories);
    }

    // Calculate daily water intake recommendation
    if (weight > 0) {
      const dailyWater = Math.round(weight * 35); // 35ml per kg
      updateHydrationDisplay(dailyWater);
    }

    // Calculate progress to goal
    if (weight > 0 && targetWeight > 0) {
      const progressToGoal = calculateProgressToGoal(weight, targetWeight);
      updateProgressDisplay(progressToGoal);
    }

    // Determine fitness category
    if (weight > 0 && height > 0 && bodyFat > 0) {
      const fitnessCategory = determineFitnessCategory(weight, height, bodyFat);
      updateFitnessCategoryDisplay(fitnessCategory);
    }
  };

  // Calculate Basal Metabolic Rate (BMR)
  const calculateBMR = (weight, height) => {
    // Using Mifflin-St Jeor Equation (assuming average age 30, male)
    // For more accuracy, would need age and gender inputs
    return (10 * weight) + (6.25 * height) - (5 * 30) + 5;
  };

  // Calculate progress to goal
  const calculateProgressToGoal = (currentWeight, targetWeight) => {
    const difference = Math.abs(currentWeight - targetWeight);
    const direction = currentWeight > targetWeight ? 'lose' : 'gain';
    const weeksToGoal = Math.ceil(difference / 0.5); // Assuming 0.5kg per week

    return {
      difference: Math.round(difference * 10) / 10,
      direction,
      weeksToGoal,
      percentage: currentWeight === targetWeight ? 100 : 0
    };
  };

  // Determine fitness category based on BMI and body fat
  const determineFitnessCategory = (weight, height, bodyFat) => {
    const bmi = weight / Math.pow(height / 100, 2);

    if (bodyFat < 10) return { category: 'Athletic', color: '#10B981' };
    if (bodyFat < 15 && bmi < 25) return { category: 'Fit', color: '#059669' };
    if (bodyFat < 20 && bmi < 27) return { category: 'Average', color: '#F59E0B' };
    if (bodyFat < 25) return { category: 'Above Average', color: '#D97706' };
    return { category: 'Needs Improvement', color: '#DC2626' };
  };

  // Update BMI display in the dashboard cards
  const updateBMIDisplay = (bmi) => {
    const bmiCard = document.querySelector('[data-metric="bmi"]');
    if (bmiCard) {
      const bmiValue = bmiCard.querySelector('.metric-value');
      if (bmiValue) {
        bmiValue.textContent = Math.round(bmi * 10) / 10;
      }

      // Update BMI category and color
      const bmiCategory = getBMICategory(bmi);
      bmiCard.setAttribute('data-category', bmiCategory.toLowerCase());
    }
  };

  // Get BMI category
  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  // Estimate body fat percentage based on BMI (basic estimation)
  const estimateBodyFat = (bmi) => {
    // Basic estimation formula (not medical grade)
    let estimatedBodyFat;

    if (bmi < 18.5) {
      estimatedBodyFat = Math.max(5, bmi * 0.8);
    } else if (bmi < 25) {
      estimatedBodyFat = bmi * 1.2 + 0.23;
    } else {
      estimatedBodyFat = bmi * 1.5 - 5;
    }

    // Update body fat display
    const bodyFatCard = document.querySelector('[data-metric="body-fat"]');
    if (bodyFatCard) {
      const bodyFatValue = bodyFatCard.querySelector('.metric-value');
      if (bodyFatValue) {
        bodyFatValue.textContent = Math.round(estimatedBodyFat * 10) / 10;
      }
    }
  };

  // Update muscle mass display
  const updateMuscleMassDisplay = (leanBodyMass) => {
    const muscleMassCard = document.querySelector('[data-metric="muscle-mass"]');
    if (muscleMassCard) {
      const muscleMassValue = muscleMassCard.querySelector('.metric-value');
      if (muscleMassValue) {
        muscleMassValue.textContent = Math.round(leanBodyMass * 10) / 10;
      }
    }
  };

  // Update all body metrics displays
  const updateBodyMetricsDisplays = () => {
    const metricsForm = document.getElementById('body-metrics-form');
    if (!metricsForm) return;

    // Update all metric cards with current form values
    const metrics = {
      'current-weight': metricsForm.querySelector('[name="current_weight"]')?.value || '--',
      'height': metricsForm.querySelector('[name="height"]')?.value || '--',
      'target-weight': metricsForm.querySelector('[name="target_weight"]')?.value || '--',
      'body-fat': metricsForm.querySelector('[name="body_fat_percentage"]')?.value || '--',
      'muscle-mass': metricsForm.querySelector('[name="muscle_mass"]')?.value || '--',
      'chest': metricsForm.querySelector('[name="measurements_chest"]')?.value || '--',
      'waist': metricsForm.querySelector('[name="measurements_waist"]')?.value || '--',
      'hips': metricsForm.querySelector('[name="measurements_hips"]')?.value || '--',
      'arms': metricsForm.querySelector('[name="measurements_arms"]')?.value || '--',
      'thighs': metricsForm.querySelector('[name="measurements_thighs"]')?.value || '--'
    };

    Object.entries(metrics).forEach(([metric, value]) => {
      const card = document.querySelector(`[data-metric="${metric}"]`);
      if (card) {
        const valueElement = card.querySelector('.metric-value');
        if (valueElement) {
          valueElement.textContent = value;
        }
      }
    });
  };

  // Update calories display
  const updateCaloriesDisplay = (calories) => {
    const caloriesCard = document.querySelector('[data-metric="calories"]');
    if (caloriesCard) {
      const caloriesValue = caloriesCard.querySelector('.metric-value');
      if (caloriesValue) {
        caloriesValue.textContent = calories.toLocaleString();
      }
    }
  };

  // Update hydration display
  const updateHydrationDisplay = (waterMl) => {
    const hydrationCard = document.querySelector('[data-metric="hydration"]');
    if (hydrationCard) {
      const hydrationValue = hydrationCard.querySelector('.metric-value');
      if (hydrationValue) {
        const liters = (waterMl / 1000).toFixed(1);
        hydrationValue.textContent = `${liters}L`;
      }
    }
  };

  // Update progress display
  const updateProgressDisplay = (progress) => {
    const progressCard = document.querySelector('[data-metric="progress"]');
    if (progressCard) {
      const progressValue = progressCard.querySelector('.metric-value');
      const progressLabel = progressCard.querySelector('.metric-label');
      if (progressValue && progressLabel) {
        if (progress.percentage === 100) {
          progressValue.textContent = 'Goal!';
          progressLabel.textContent = 'Target Reached';
        } else {
          progressValue.textContent = `${progress.difference}kg`;
          progressLabel.textContent = `to ${progress.direction} (${progress.weeksToGoal} weeks)`;
        }
      }
    }
  };

  // Update fitness category display
  const updateFitnessCategoryDisplay = (fitness) => {
    const fitnessCard = document.querySelector('[data-metric="fitness-category"]');
    if (fitnessCard) {
      const fitnessValue = fitnessCard.querySelector('.metric-value');
      if (fitnessValue) {
        fitnessValue.textContent = fitness.category;
        fitnessValue.style.color = fitness.color;
      }
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
  } else if (section === 'macros') {
      const obj = Object.fromEntries(formData);
      profileData.macros.goal = obj.goal || 'maintain';
      profileData.macros.activity_level = obj.activity_level || 'moderate';
      profileData.macros.calories = obj.calories ? Number(obj.calories) : '';
      profileData.macros.protein_pct = obj.protein_pct ? Number(obj.protein_pct) : 30;
      profileData.macros.carbs_pct = obj.carbs_pct ? Number(obj.carbs_pct) : 40;
      profileData.macros.fats_pct = obj.fats_pct ? Number(obj.fats_pct) : 30;
      // Recompute and write displays
      enforceMacroSplit();
      renderMacroTargets();
    } else if (section === 'habits') {
      const obj = Object.fromEntries(formData);
      const key = todayKey();
      profileData.habits.daily[key] = {
        water_ml: obj.water_ml ? Number(obj.water_ml) : 0,
        steps: obj.steps ? Number(obj.steps) : 0,
        sleep_hours: obj.sleep_hours ? Number(obj.sleep_hours) : 0,
        workout: !!obj.workout,
        meditation: !!obj.meditation,
        stretch: !!obj.stretch
      };
      profileData.habits.updated_at = new Date().toISOString();
      renderHabitsStreaks();
      renderHabitsStepsChart();
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

      // Save to metadata (best effort)
      window.supabaseClient?.auth?.updateUser({
        data: { body_metrics: { ...profileData.body_metrics, weight_history: profileData.body_metrics.weight_history } }
      }).catch(() => {});

      // Update chart
      renderWeightHistoryChart();
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

  // Render weight history chart using Chart.js
  let weightChartInstance = null;
  const renderWeightHistoryChart = () => {
    try {
      const entries = profileData.body_metrics?.weight_history || [];
      const empty = document.getElementById('weight-chart-empty');
      const canvas = document.getElementById('weight-history-canvas');
      if (!canvas) return;

      if (!entries.length) {
        if (empty) empty.style.display = '';
        canvas.style.display = 'none';
        return;
      }

      // Prepare data
      const sorted = [...entries].sort((a,b) => new Date(a.date) - new Date(b.date));
      const labels = sorted.map(e => new Date(e.date).toLocaleDateString());
      const data = sorted.map(e => e.weight);

      if (empty) empty.style.display = 'none';
      canvas.style.display = '';

      const ctx = canvas.getContext('2d');
      if (weightChartInstance) {
        weightChartInstance.data.labels = labels;
        weightChartInstance.data.datasets[0].data = data;
        weightChartInstance.update();
        return;
      }

      weightChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Weight (kg)',
            data,
            borderColor: 'rgba(246, 200, 78, 1)',
            backgroundColor: 'rgba(246, 200, 78, 0.15)',
            tension: 0.3,
            fill: true,
            pointRadius: 3,
            pointHoverRadius: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#fff' } }
          },
          scales: {
            x: { ticks: { color: '#ddd' }, grid: { color: 'rgba(255,255,255,0.1)' } },
            y: { ticks: { color: '#ddd' }, grid: { color: 'rgba(255,255,255,0.1)' } }
          }
        }
      });
    } catch (e) {
      console.warn('Could not render weight chart:', e);
    }
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
