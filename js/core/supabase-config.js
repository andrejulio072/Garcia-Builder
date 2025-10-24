// Garcia Builder - Supabase Configuration
(() => {
  // Initialize Supabase client
  if (typeof supabase !== 'undefined') {
    window.supabaseClient = supabase.createClient(
      'https://vxlqshnykoihsxndltjc.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4bHFzaG55a29paHN4bmRsdGpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNDMwODcsImV4cCI6MjA3NDcxOTA4N30.sK6BtmbtmL9SsHxBNyagQhyoWcjRZqh6lMxjMu9J71E'
    );

    console.log('✅ Supabase client initialized successfully');
  } else {
    console.warn('⚠️ Supabase library not loaded, using localStorage fallback');
  }
})();
