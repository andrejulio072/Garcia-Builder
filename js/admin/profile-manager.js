// Garcia Builder - Complete Profile Management System
(() => {
  let currentUser = null;
  let profileData = {};

  const getAvatarFallback = () => {
    const baseName = (profileData.basic?.full_name || profileData.basic?.email || currentUser?.email || 'User').trim();
    const encoded = encodeURIComponent(baseName || 'User');
    return `https://ui-avatars.com/api/?background=1a1a1a&color=F6C84E&name=${encoded}&size=256&bold=true`;
  };

  const syncAuthCache = () => {
    try {
      const existingRaw = localStorage.getItem('gb_current_user');
      const existing = existingRaw ? JSON.parse(existingRaw) : {};

      const fallbackUser = currentUser ? {
        id: currentUser.id,
        email: currentUser.email,
        full_name: currentUser.user_metadata?.full_name || currentUser.email,
        avatar_url: currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture || null,
        phone: currentUser.user_metadata?.phone || null,
        user_metadata: { ...(currentUser.user_metadata || {}) }
      } : {};

      const merged = {
        ...fallbackUser,
        ...existing,
        id: existing.id || fallbackUser.id || currentUser?.id || null,
        email: profileData.basic?.email || existing.email || fallbackUser.email || currentUser?.email || '',
        full_name: profileData.basic?.full_name || existing.full_name || fallbackUser.full_name || currentUser?.email || 'User',
        avatar_url: profileData.basic?.avatar_url || existing.avatar_url || fallbackUser.avatar_url || null,
        phone: profileData.basic?.phone || existing.phone || fallbackUser.phone || null,
        user_metadata: {
          ...(fallbackUser.user_metadata || {}),
          ...(existing.user_metadata || {})
        }
      };

      merged.user_metadata = {
        ...(merged.user_metadata || {}),
        full_name: merged.full_name,
        phone: profileData.basic?.phone || merged.user_metadata?.phone || null,
        avatar_url: profileData.basic?.avatar_url || merged.user_metadata?.avatar_url || null,
        body_metrics: profileData.body_metrics,
        preferences: profileData.preferences
      };

      localStorage.setItem('gb_current_user', JSON.stringify(merged));

      if (currentUser) {
        currentUser.email = merged.email || currentUser.email;
        currentUser.user_metadata = {
          ...(currentUser.user_metadata || {}),
          ...merged.user_metadata
        };
      }

      console.log('ProfileManager: Auth cache synchronized');
    } catch (error) {
      console.warn('ProfileManager: Failed to sync cached auth user', error);
    }
  };

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
      console.log('📥 Loading profile data...');
      
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

      if (!profileData.basic.full_name) {
        profileData.basic.full_name = currentUser?.user_metadata?.full_name || currentUser?.email || 'User';
      }
      if (!profileData.basic.email) {
        profileData.basic.email = currentUser?.email || profileData.basic.full_name || '';
      }
      if (!profileData.basic.avatar_url) {
        // Priority: picture (OAuth) > avatar_url > empty
        profileData.basic.avatar_url = currentUser?.user_metadata?.picture || 
                                       currentUser?.user_metadata?.avatar_url || 
                                       '';
        console.log('🖼️ Avatar URL set:', profileData.basic.avatar_url);
      }

      syncAuthCache();
      console.log('✅ Profile data loaded successfully');
      console.log('📊 Profile sections:', Object.keys(profileData));
      console.log('👤 User:', profileData.basic.full_name, profileData.basic.email);
      console.log('🖼️ Avatar:', profileData.basic.avatar_url ? 'Yes' : 'No (will use initials)');
    } catch (error) {
      console.error('❌ Error loading profile data:', error);
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

      // Preferred: fetch weight history from body_metrics table
      await fetchWeightHistoryFromTable();

      // Fallback: if still empty, use metadata
      if ((!profileData.body_metrics.weight_history || profileData.body_metrics.weight_history.length === 0) && currentUser.user_metadata?.body_metrics?.weight_history?.length) {
        profileData.body_metrics.weight_history = currentUser.user_metadata.body_metrics.weight_history;
      }

      // Fetch latest body metrics record to populate current fields (weight, height, body fat, measurements)
      await fetchLatestBodyMetricsFromTable();

    } catch (error) {
      console.error('Error loading from Supabase:', error);
    }
  };

  // Fetch weight history rows from body_metrics table
  const fetchWeightHistoryFromTable = async () => {
    try {
      if (!window.supabaseClient) return;
      const { data, error } = await window.supabaseClient
        .from('body_metrics')
        .select('date, weight')
        .eq('user_id', currentUser.id)
        .order('date', { ascending: false })
        .limit(30); // Limit to last 30 entries to prevent performance issues
      if (error) {
        console.warn('Could not fetch body_metrics:', error.message || error);
        return;
      }
      if (Array.isArray(data)) {
        profileData.body_metrics.weight_history = data
          .filter(r => r.date && r.weight != null)
          .map(r => ({ date: new Date(r.date).toISOString(), weight: Number(r.weight) }))
          .reverse(); // Reverse to get chronological order
      }
    } catch (e) {
      console.warn('Failed to load weight history from table:', e?.message || e);
    }
  };

  // Fetch the latest body metrics entry to hydrate current fields
  const fetchLatestBodyMetricsFromTable = async () => {
    try {
      if (!window.supabaseClient) return;
      const { data, error } = await window.supabaseClient
        .from('body_metrics')
        .select('date, weight, height, body_fat, measurements')
        .eq('user_id', currentUser.id)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) {
        console.warn('Could not fetch latest body metrics:', error.message || error);
        return;
      }
      if (data) {
        if (data.weight != null && data.weight !== '') profileData.body_metrics.current_weight = Number(data.weight);
        if (data.height != null && data.height !== '') profileData.body_metrics.height = Number(data.height);
        if (data.body_fat != null && data.body_fat !== '') profileData.body_metrics.body_fat_percentage = Number(data.body_fat);
        const m = data.measurements || {};
        if (typeof m === 'object') {
          const setIf = (key) => {
            if (m[key] != null && m[key] !== '') {
              profileData.body_metrics.measurements[key] = Number(m[key]);
            }
          };
          ['chest','waist','hips','arms','thighs','muscle_mass'].forEach(setIf);
        }
      }
    } catch (e) {
      console.warn('Failed to load latest body metrics from table:', e?.message || e);
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
      let supabaseSuccess = false;
      let supabaseError = null;
    
    try {
      console.log(`💾 Saving profile${section ? ` (${section})` : ''}...`);
      
      // Update timestamp
      if (section) {
        profileData[section].updated_at = new Date().toISOString();
      }

        // Try to save to Supabase (but don't fail if it doesn't work)
      if (window.supabaseClient) {
          try {
            await saveToSupabase(section);
            console.log('✅ Saved to Supabase');
            supabaseSuccess = true;
          } catch (supabaseErr) {
            console.warn('⚠️ Supabase save failed (will use localStorage):', supabaseErr.message);
            supabaseError = supabaseErr;
            // Don't throw - continue to localStorage save
          }
        } else {
          console.warn('⚠️ Supabase client not available (using localStorage only)');
      }

        // ALWAYS save to localStorage as backup (or primary if Supabase failed)
      saveToLocalStorage();
      console.log('✅ Saved to localStorage');
      
      syncAuthCache();
      window.authGuard?.addUserMenuToNavbar?.();

        // Show appropriate notification
        if (supabaseSuccess) {
          showNotification('Profile updated successfully!', 'success');
        } else if (supabaseError) {
          showNotification('Saved locally. Will sync when online.', 'warning');
        } else {
          showNotification('Profile updated (offline mode)!', 'success');
        }
      
      console.log('✅ Profile save complete');
      return true;
    } catch (error) {
      console.error('❌ Error saving profile data:', error);

        // Last resort: try localStorage one more time
        try {
          saveToLocalStorage();
          showNotification('Saved locally only. Check connection.', 'warning');
          return true;
        } catch (localErr) {
          console.error('❌ Even localStorage failed:', localErr);
          showNotification('Error saving profile. Please try again.', 'error');
          return false;
      }

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
          const sanitize = (value) => {
            if (value === undefined || value === null) return null;
            if (typeof value === 'string') {
              const trimmed = value.trim();
              return trimmed.length ? trimmed : null;
            }
            return value;
          };

          const payload = {
            id: currentUser.id,
            full_name: sanitize(profileData.basic.full_name) || currentUser.user_metadata?.full_name || '',
            phone: sanitize(profileData.basic.phone) || currentUser.user_metadata?.phone || null,
            avatar_url: sanitize(profileData.basic.avatar_url) || currentUser.user_metadata?.avatar_url || null,
            updated_at: new Date().toISOString()
          };

          if (profileData.basic.birthday) {
            payload.date_of_birth = normalizeDate(profileData.basic.birthday);
          }

          const { error: profileError } = await window.supabaseClient
            .from('profiles')
            .upsert(payload, { onConflict: 'id' });

          const metadataPayload = {
            full_name: sanitize(profileData.basic.full_name),
            phone: sanitize(profileData.basic.phone),
            avatar_url: sanitize(profileData.basic.avatar_url),
            date_of_birth: normalizeDate(profileData.basic.birthday),
            location: sanitize(profileData.basic.location),
            bio: sanitize(profileData.basic.bio),
            experience_level: sanitize(profileData.basic.experience_level)
          };

          const cleanedMetadata = Object.fromEntries(
            Object.entries(metadataPayload).filter(([, value]) => value !== undefined)
          );

          let metadataError = null;
          if (Object.keys(cleanedMetadata).length > 0) {
            const { data: updatedUser, error } = await window.supabaseClient.auth.updateUser({
              data: cleanedMetadata
            });
            metadataError = error || null;
            if (!metadataError && updatedUser?.user) {
              currentUser = updatedUser.user;
            } else if (!metadataError && currentUser) {
              currentUser.user_metadata = {
                ...(currentUser.user_metadata || {}),
                ...cleanedMetadata
              };
            }
          }

          if (profileError) {
            console.warn('Profiles table upsert failed:', profileError);
          }

          if (profileError && metadataError) {
            throw new Error(metadataError.message || profileError.message || 'Failed to save profile');
          }

        } catch (error) {
          console.error('Error saving basic profile:', error);
          throw error;
        }
      }

      // Save metrics: preferred upsert to body_metrics table (today) and mirror to user metadata
      if (section === 'body_metrics' || !section) {
        try {
          // 1) Upsert into table for today's date
          try {
            const today = new Date().toISOString().slice(0,10);
            const payload = {
              user_id: currentUser.id,
              date: today,
              weight: num(profileData.body_metrics.current_weight),
              height: num(profileData.body_metrics.height),
              body_fat: num(profileData.body_metrics.body_fat_percentage),
              measurements: {
                chest: num(profileData.body_metrics.measurements?.chest ?? profileData.body_metrics.measurements_chest),
                waist: num(profileData.body_metrics.measurements?.waist ?? profileData.body_metrics.measurements_waist),
                hips: num(profileData.body_metrics.measurements?.hips ?? profileData.body_metrics.measurements_hips),
                arms: num(profileData.body_metrics.measurements?.arms ?? profileData.body_metrics.measurements_arms),
                thighs: num(profileData.body_metrics.measurements?.thighs ?? profileData.body_metrics.measurements_thighs),
                muscle_mass: num(profileData.body_metrics.muscle_mass),
                target_weight: num(profileData.body_metrics.target_weight)
              },
              client_id: `bm-${today}`,
              updated_at: new Date().toISOString()
            };
            const { error: bmErr } = await window.supabaseClient
              .from('body_metrics')
              .upsert(payload, { onConflict: 'user_id,client_id' });
            if (bmErr) console.warn('Upsert body_metrics table failed:', bmErr);
          } catch (e) {
            console.warn('Could not upsert body metrics table:', e?.message || e);
          }

          // 2) Mirror to user metadata as fallback
          const metricsData = {
            current_weight: num(profileData.body_metrics.current_weight),
            height: num(profileData.body_metrics.height),
            target_weight: num(profileData.body_metrics.target_weight),
            body_fat_percentage: num(profileData.body_metrics.body_fat_percentage),
            muscle_mass: num(profileData.body_metrics.muscle_mass),
            measurements: {
              chest: num(profileData.body_metrics.measurements?.chest ?? profileData.body_metrics.measurements_chest),
              waist: num(profileData.body_metrics.measurements?.waist ?? profileData.body_metrics.measurements_waist),
              hips: num(profileData.body_metrics.measurements?.hips ?? profileData.body_metrics.measurements_hips),
              arms: num(profileData.body_metrics.measurements?.arms ?? profileData.body_metrics.measurements_arms),
              thighs: num(profileData.body_metrics.measurements?.thighs ?? profileData.body_metrics.measurements_thighs)
            },
            updated_at: new Date().toISOString()
          };

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

          // Best-effort: also write calories to today's body_metrics row
          try {
            const today = new Date().toISOString().slice(0,10);
            const { data: existing } = await window.supabaseClient
              .from('body_metrics')
              .select('measurements')
              .eq('user_id', currentUser.id)
              .eq('date', today)
              .maybeSingle();
            const measurements = existing?.measurements || {};
            measurements.calories = macrosData.calories;
            const payload = { user_id: currentUser.id, date: today, measurements, client_id: `bm-${today}` };
            const { error: upErr } = await window.supabaseClient
              .from('body_metrics')
              .upsert(payload, { onConflict: 'user_id,client_id' });
            if (upErr) console.warn('Failed to upsert calories into body_metrics:', upErr);
          } catch (e) {
            console.warn('Could not mirror macros calories to body_metrics:', e?.message || e);
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
  // Render body fat chart (async fetch)
  renderBodyFatHistoryChart();
  // Render waist and muscle charts
  renderWaistHistoryChart();
  renderMuscleHistoryChart();

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
      const src = profileData.basic.avatar_url || getAvatarFallback();
      avatar.src = src;
      const label = profileData.basic.full_name || profileData.basic.email || 'Profile avatar';
      avatar.alt = `${label}'s avatar`;
    });

    window.authGuard?.addUserMenuToNavbar?.();
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
    console.log('📝 Setting up forms with profile data...');
    
    // Basic info form
    const basicForm = document.getElementById('basic-info-form');
    if (basicForm) {
      console.log('✅ Found basic-info-form');
      // Populate form fields
      const fields = ['full_name', 'first_name', 'last_name', 'phone', 'birthday', 'location', 'bio', 'experience_level', 'trainer_name', 'trainer_id'];
      fields.forEach(field => {
        const input = basicForm.querySelector(`[name="${field}"]`);
        if (input && profileData.basic[field]) {
          input.value = profileData.basic[field];
          console.log(`  ✓ ${field}: ${profileData.basic[field]}`);
        }
      });

      // Handle goals checkboxes
      const goalCheckboxes = basicForm.querySelectorAll('input[name="goals"]');
      goalCheckboxes.forEach(checkbox => {
        checkbox.checked = profileData.basic.goals.includes(checkbox.value);
      });
      console.log(`  ✓ Goals: ${profileData.basic.goals.join(', ')}`);
    } else {
      console.warn('⚠️ basic-info-form not found');
    }

    // Body metrics form
    const metricsForm = document.getElementById('body-metrics-form');
    if (metricsForm) {
      console.log('✅ Found body-metrics-form');
      const fields = ['current_weight', 'height', 'target_weight', 'body_fat_percentage', 'muscle_mass'];
      fields.forEach(field => {
        const input = metricsForm.querySelector(`[name="${field}"]`);
        if (input && profileData.body_metrics[field]) {
          input.value = profileData.body_metrics[field];
          console.log(`  ✓ ${field}: ${profileData.body_metrics[field]}`);
        }
      });

      // Measurements
      Object.entries(profileData.body_metrics.measurements || {}).forEach(([key, value]) => {
        const input = metricsForm.querySelector(`[name="measurements_${key}"]`);
        if (input && value) {
          input.value = value;
          console.log(`  ✓ measurement ${key}: ${value}`);
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
          console.log('  ✓ Triggered BMI calculation');
        }
      }, 200);
    } else {
      console.warn('⚠️ body-metrics-form not found');
    }
    
    console.log('✅ Forms setup complete');
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

      const saved = await saveProfileData('basic');
      if (saved) {
        updateBasicInfoDisplay();
      }
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
    // Body fat tracking
    const bodyFatInput = document.getElementById('body_fat_percentage');
    if (bodyFatInput) {
      bodyFatInput.addEventListener('change', handleBodyFatChange);
    }
    // Waist tracking
    const waistInput = document.getElementById('measurements_waist');
    if (waistInput) {
      waistInput.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) {
          upsertMeasurementsToTable({ waist: Number(val) }).then(renderWaistHistoryChart).catch(()=>{});
        }
      });
    }
    // Muscle mass tracking
    const muscleInput = document.getElementById('muscle_mass');
    if (muscleInput) {
      muscleInput.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) {
          upsertMeasurementsToTable({ muscle_mass: Number(val) }).then(renderMuscleHistoryChart).catch(()=>{});
        }
      });
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

      // Also upsert into body_metrics table (preferred)
      upsertWeightRowToTable(parseFloat(newWeight)).catch(() => {});
    }
  };

  // Handle body fat change
  const handleBodyFatChange = (event) => {
    const bf = event.target.value;
    if (bf && bf !== profileData.body_metrics.body_fat_percentage) {
      // Save current value
      profileData.body_metrics.body_fat_percentage = parseFloat(bf);
      // Persist to metadata (best effort)
      window.supabaseClient?.auth?.updateUser({
        data: { body_metrics: { ...profileData.body_metrics } }
      }).catch(() => {});
      // Update chart
      renderBodyFatHistoryChart();
      // Upsert into table for today
      upsertBodyFatRowToTable(parseFloat(bf)).catch(() => {});
    }
  };

  const upsertBodyFatRowToTable = async (bodyFat) => {
    try {
      if (!window.supabaseClient) return;
      const today = new Date().toISOString().slice(0,10);
      const { data: { user } } = await window.supabaseClient.auth.getUser();
      const payload = {
        user_id: user?.id,
        date: today,
        body_fat: bodyFat,
        client_id: `bm-${today}`,
        updated_at: new Date().toISOString()
      };
      const { error } = await window.supabaseClient
        .from('body_metrics')
        .upsert(payload, { onConflict: 'user_id,client_id' });
      if (error) console.warn('Upsert body fat to table failed:', error.message || error);
    } catch (e) {
      console.warn('Upsert body fat error:', e?.message || e);
    }
  };

  // Merge updates into today's measurements JSON and upsert
  const upsertMeasurementsToTable = async (partial) => {
    try {
      if (!window.supabaseClient) return;
      const today = new Date().toISOString().slice(0,10);
      const { data: existing, error: selErr } = await window.supabaseClient
        .from('body_metrics')
        .select('measurements')
        .eq('user_id', currentUser.id)
        .eq('date', today)
        .maybeSingle();
      if (selErr) { /* continue best-effort */ }
      const base = existing?.measurements || {};
      const measurements = { ...base, ...partial };
      const payload = { user_id: currentUser.id, date: today, measurements, client_id: `bm-${today}`, updated_at: new Date().toISOString() };
      const { error: upErr } = await window.supabaseClient
        .from('body_metrics')
        .upsert(payload, { onConflict: 'user_id,client_id' });
      if (upErr) console.warn('Failed to upsert measurements:', upErr);
    } catch (e) {
      console.warn('upsertMeasurementsToTable error:', e?.message || e);
    }
  };

  // Upsert a weight row for today into body_metrics using unique client_id per date
  const upsertWeightRowToTable = async (weight) => {
    try {
      if (!window.supabaseClient) return;
      const today = new Date().toISOString().slice(0,10);
      const clientId = `wh-${today}`;
      const heightNum = Number(profileData.body_metrics.height || 0) || null;
      const bodyFatNum = Number(profileData.body_metrics.body_fat_percentage || 0) || null;
      const { data: { user } } = await window.supabaseClient.auth.getUser();
      const payload = {
        user_id: user?.id,
        date: today,
        weight,
        height: heightNum,
        body_fat: bodyFatNum,
        client_id: clientId,
        updated_at: new Date().toISOString()
      };
      const { error } = await window.supabaseClient
        .from('body_metrics')
        .upsert(payload, { onConflict: 'user_id,client_id' });
      if (error) console.warn('Upsert weight to table failed:', error.message || error);
    } catch (e) {
      console.warn('Upsert weight error:', e?.message || e);
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
    let lastWeightDataLength = 0;
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

        // Prevent infinite re-rendering if data hasn't changed
        if (entries.length === lastWeightDataLength && weightChartInstance) {
          return;
        }
        lastWeightDataLength = entries.length;

        // Prepare data - limit to last 20 entries for performance
      const sorted = [...entries].sort((a,b) => new Date(a.date) - new Date(b.date));
        const limitedData = sorted.slice(-20); // Show only last 20 entries
        const labels = limitedData.map(e => new Date(e.date).toLocaleDateString());
        const data = limitedData.map(e => e.weight);

      if (empty) empty.style.display = 'none';
      canvas.style.display = '';

      const ctx = canvas.getContext('2d');
      if (weightChartInstance) {
          weightChartInstance.destroy(); // Destroy previous chart to prevent memory leaks
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

  // Render body fat history chart (from table if available, fallback to metadata current values over time)
  let bodyFatChartInstance = null;
  const renderBodyFatHistoryChart = async () => {
    try {
      const empty = document.getElementById('bodyfat-chart-empty');
      const canvas = document.getElementById('bodyfat-history-canvas');
      if (!canvas) return;

      // Prefer reading from table: last 180 days of body_fat not null
      let rows = [];
      try {
        if (window.supabaseClient) {
          const { data, error } = await window.supabaseClient
            .from('body_metrics')
            .select('date, body_fat')
            .eq('user_id', currentUser.id)
            .not('body_fat', 'is', null)
            .order('date', { ascending: true })
            .limit(180);
          if (!error && Array.isArray(data)) rows = data;
        }
      } catch (e) { /* noop */ }

      if (!rows.length) {
        if (empty) empty.style.display = '';
        if (canvas) canvas.style.display = 'none';
        return;
      }

      const labels = rows.map(r => new Date(r.date).toLocaleDateString());
      const values = rows.map(r => Number(r.body_fat));

      if (empty) empty.style.display = 'none';
      canvas.style.display = '';

      const ctx = canvas.getContext('2d');
      if (bodyFatChartInstance) {
        bodyFatChartInstance.data.labels = labels;
        bodyFatChartInstance.data.datasets[0].data = values;
        bodyFatChartInstance.update();
        return;
      }

      bodyFatChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Body Fat %',
            data: values,
            borderColor: 'rgba(99, 179, 237, 1)',
            backgroundColor: 'rgba(99, 179, 237, 0.15)',
            tension: 0.3,
            fill: true,
            pointRadius: 3,
            pointHoverRadius: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#fff' } } },
          scales: {
            x: { ticks: { color: '#ddd' }, grid: { color: 'rgba(255,255,255,0.1)' } },
            y: { ticks: { color: '#ddd' }, grid: { color: 'rgba(255,255,255,0.1)' } }
          }
        }
      });
    } catch (e) {
      console.warn('Could not render body fat chart:', e);
    }
  };

  // Waist history chart from measurements.waist
  let waistChartInstance = null;
  const renderWaistHistoryChart = async () => {
    try {
      const empty = document.getElementById('waist-chart-empty');
      const canvas = document.getElementById('waist-history-canvas');
      if (!canvas) return;
      let rows = [];
      try {
        if (window.supabaseClient) {
          const { data, error } = await window.supabaseClient
            .from('body_metrics')
            .select('date, measurements')
            .eq('user_id', currentUser.id)
            .order('date', { ascending: true })
            .limit(180);
          if (!error && Array.isArray(data)) rows = data.filter(r => r.measurements?.waist != null);
        }
      } catch (e) { /* noop */ }

      if (!rows.length) {
        if (empty) empty.style.display = '';
        canvas.style.display = 'none';
        return;
      }
      const labels = rows.map(r => new Date(r.date).toLocaleDateString());
      const values = rows.map(r => Number(r.measurements.waist));
      if (empty) empty.style.display = 'none';
      canvas.style.display = '';
      const ctx = canvas.getContext('2d');
      if (waistChartInstance) {
        waistChartInstance.data.labels = labels;
        waistChartInstance.data.datasets[0].data = values;
        waistChartInstance.update();
        return;
      }
      waistChartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets: [{ label: 'Waist (cm)', data: values, borderColor: 'rgba(246, 200, 78, 1)', backgroundColor: 'rgba(246, 200, 78, 0.15)', tension: 0.3, fill: true, pointRadius: 3, pointHoverRadius: 5 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#fff' } } }, scales: { x: { ticks: { color: '#ddd' }, grid: { color: 'rgba(255,255,255,0.1)' } }, y: { ticks: { color: '#ddd' }, grid: { color: 'rgba(255,255,255,0.1)' } } } }
      });
    } catch (e) { console.warn('Could not render waist chart:', e); }
  };

  // Muscle mass history chart from measurements.muscle_mass
  let muscleChartInstance = null;
  const renderMuscleHistoryChart = async () => {
    try {
      const empty = document.getElementById('muscle-chart-empty');
      const canvas = document.getElementById('muscle-history-canvas');
      if (!canvas) return;
      let rows = [];
      try {
        if (window.supabaseClient) {
          const { data, error } = await window.supabaseClient
            .from('body_metrics')
            .select('date, measurements')
            .eq('user_id', currentUser.id)
            .order('date', { ascending: true })
            .limit(180);
          if (!error && Array.isArray(data)) rows = data.filter(r => r.measurements?.muscle_mass != null);
        }
      } catch (e) { /* noop */ }

      if (!rows.length) {
        if (empty) empty.style.display = '';
        canvas.style.display = 'none';
        return;
      }
      const labels = rows.map(r => new Date(r.date).toLocaleDateString());
      const values = rows.map(r => Number(r.measurements.muscle_mass));
      if (empty) empty.style.display = 'none';
      canvas.style.display = '';
      const ctx = canvas.getContext('2d');
      if (muscleChartInstance) {
        muscleChartInstance.data.labels = labels;
        muscleChartInstance.data.datasets[0].data = values;
        muscleChartInstance.update();
        return;
      }
      muscleChartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets: [{ label: 'Muscle Mass (kg)', data: values, borderColor: 'rgba(16, 185, 129, 1)', backgroundColor: 'rgba(16, 185, 129, 0.15)', tension: 0.3, fill: true, pointRadius: 3, pointHoverRadius: 5 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#fff' } } }, scales: { x: { ticks: { color: '#ddd' }, grid: { color: 'rgba(255,255,255,0.1)' } }, y: { ticks: { color: '#ddd' }, grid: { color: 'rgba(255,255,255,0.1)' } } } }
      });
    } catch (e) { console.warn('Could not render muscle chart:', e); }
  };

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Upload avatar to Supabase Storage
  const uploadAvatar = async (file) => {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Validate file size (5MB limit)
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_SIZE) {
        throw new Error('File size must be less than 5MB');
      }

      console.log('📤 Uploading avatar...');

      // Try Supabase Storage if available
      if (window.supabaseClient && currentUser) {
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
          const filePath = `avatars/${fileName}`;

          // Upload to Supabase Storage
          const { data, error } = await window.supabaseClient.storage
            .from('profiles')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) throw error;

          // Get public URL
          const { data: { publicUrl } } = window.supabaseClient.storage
            .from('profiles')
            .getPublicUrl(filePath);

          console.log('✅ Avatar uploaded to Supabase:', publicUrl);

          // Update profile data
          profileData.basic.avatar_url = publicUrl;
          await saveProfileData('basic');

          return publicUrl;
        } catch (supabaseError) {
          console.warn('⚠️ Supabase upload failed, using base64 fallback:', supabaseError);
          // Fall through to base64 fallback
        }
      }

      // Fallback: Convert to base64 and store locally
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const base64Url = e.target.result;
            console.log('✅ Avatar converted to base64 (local only)');
            
            // Update profile data
            profileData.basic.avatar_url = base64Url;
            await saveProfileData('basic');
            
            resolve(base64Url);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('❌ Error uploading avatar:', error);
      showNotification(`Error uploading avatar: ${error.message}`, 'error');
      throw error;
    }
  };

  const showNotification = (message, type = 'info') => {
    // Simple notification system
      let alertClass = 'alert-info';
      if (type === 'error') alertClass = 'alert-danger';
      else if (type === 'success') alertClass = 'alert-success';
      else if (type === 'warning') alertClass = 'alert-warning';
    
    const notification = document.createElement('div');
      notification.className = `alert ${alertClass} position-fixed top-0 end-0 m-3`;
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
    saveProfile: saveProfileData, // Alias for compatibility
    uploadAvatar,
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
