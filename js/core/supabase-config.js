// Garcia Builder - Supabase Configuration
(() => {
  const isBrowser = typeof window !== 'undefined';
  const isFileProtocol = isBrowser && window.location && window.location.protocol === 'file:';
  const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;

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

  if (typeof supabase !== 'undefined') {
    try {
      window.supabaseClient = supabase.createClient(
        'https://vxlqshnykoihsxndltjc.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4bHFzaG55a29paHN4bmRsdGpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNDMwODcsImV4cCI6MjA3NDcxOTA4N30.sK6BtmbtmL9SsHxBNyagQhyoWcjRZqh6lMxjMu9J71E'
      );
      console.log('[Supabase] Client initialized successfully.');
    } catch (error) {
      console.error('[Supabase] Failed to initialize client:', error);
    }
  } else {
    console.warn('[Supabase] Library not loaded, using localStorage fallback.');
  }
})();
