// Garcia Builder - Supabase Configuration
(() => {
  const isBrowser = typeof window !== 'undefined';
  const isFileProtocol = isBrowser && window.location && window.location.protocol === 'file:';
  const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;

  const loadEnv = () => {
    if (!isBrowser) {
      return Promise.reject(new Error('Supabase client requires browser environment.'));
    }

    if (window.__ENV) {
      return Promise.resolve(window.__ENV);
    }

    if (window.__ENV_PROMISE) {
      return window.__ENV_PROMISE;
    }

    window.__ENV_PROMISE = fetch('/env-config.json', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load env-config.json (${response.status})`);
        }
        return response.json();
      })
      .then((data) => {
        if (!data?.SUPABASE_URL || !data?.SUPABASE_ANON_KEY) {
          throw new Error('Supabase env config is missing SUPABASE_URL or SUPABASE_ANON_KEY.');
        }
        window.__ENV = Object.freeze(data);
        return window.__ENV;
      })
      .catch((error) => {
        console.error('[Supabase] Failed to load env config:', error);
        delete window.__ENV_PROMISE;
        throw error;
      });

    return window.__ENV_PROMISE;
  };

  if (isFileProtocol || isOffline) {
    const reasons = [];
    if (isFileProtocol) reasons.push('file protocol');
    if (isOffline) reasons.push('offline mode');
    console.info(`[Supabase] Skipping initialization (${reasons.join(' + ')}).`);
    if (isBrowser) {
      window.supabaseClient = null;
    }
    return;
  }

  loadEnv()
    .then((env) => {
      const supabaseLib = typeof supabase !== 'undefined' ? supabase : window.supabase;

      if (!supabaseLib) {
        console.warn('[Supabase] Library not loaded, using local fallback.');
        return;
      }

      try {
        window.supabaseClient = supabaseLib.createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
        console.log('[Supabase] Client initialized successfully.');
      } catch (error) {
        console.error('[Supabase] Failed to initialize client:', error);
        window.supabaseClient = null;
      }
    })
    .catch(() => {
      // Errors already logged in loadEnv
      window.supabaseClient = null;
    });
})();
