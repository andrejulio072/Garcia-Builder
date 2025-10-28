// Supabase public configuration injected for static hosting environments.
// These values are safe to surface client-side (public anon key and project URL).
(function injectSupabasePublicEnv() {
    const SUPABASE_URL = "https://qejtjcaldnuokoofpqap.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlanRqY2FsZG51b2tvb2ZwcWFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5OTY2MjgsImV4cCI6MjA3NDU3MjYyOH0.-4KmNNRpmNLu4-xPtnC4-FJJTBbvrSk03v2WCaT5Kyw";

    const computeSiteBaseUrl = () => {
        try {
            const { origin, pathname } = window.location || {};
            if (!origin) return null;
            const segments = (pathname || '/').split('/').filter(Boolean);
            const pagesIdx = segments.indexOf('pages');
            let baseSegments;
            if (pagesIdx > -1) {
                baseSegments = segments.slice(0, pagesIdx);
            } else if (segments.length > 0) {
                baseSegments = segments.slice(0, segments.length - 1);
            } else {
                baseSegments = [];
            }
            const basePath = baseSegments.length ? `/${baseSegments.join('/')}` : '';
            return `${origin}${basePath}`.replace(/\/$/, '');
        } catch (err) {
            console.warn('computeSiteBaseUrl failed:', err);
            return null;
        }
    };

    // Preserve any values already defined (e.g., from server-injected config)
    if (typeof window.__ENV !== 'object' || window.__ENV === null) {
        window.__ENV = {};
    }

    if (!window.__ENV.SUPABASE_URL) {
        window.__ENV.SUPABASE_URL = SUPABASE_URL;
    }
    if (!window.__ENV.SUPABASE_ANON_KEY) {
        window.__ENV.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
    }

    // Mirror into the legacy/global variables used across the app
    window.SUPABASE_URL = window.SUPABASE_URL || SUPABASE_URL;
    window.SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;
    window.NEXT_PUBLIC_SUPABASE_URL = window.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL;
    window.NEXT_PUBLIC_SUPABASE_ANON_KEY = window.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;

    // Provide a best-effort PUBLIC_SITE_URL when absent to support redirect helpers
    if (!window.__ENV.PUBLIC_SITE_URL) {
        const detectedBase = computeSiteBaseUrl();
        if (detectedBase) {
            window.__ENV.PUBLIC_SITE_URL = detectedBase;
        }
    }

    console.debug('[env.js] Supabase public env injected', {
        hasUrl: !!window.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!window.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        publicSiteUrl: window.__ENV.PUBLIC_SITE_URL || null
    });
})();
