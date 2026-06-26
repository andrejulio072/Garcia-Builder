// Supabase public configuration loader for static hosting environments.
// This file must not hardcode project-specific keys. It loads the generated
// env-config.json bundle and mirrors the public values used by legacy scripts.
(function loadSupabasePublicEnv() {
    const isBrowser = typeof window !== 'undefined';
    if (!isBrowser) return;

    const computeSiteBaseUrl = () => {
        try {
            const { origin, pathname } = window.location || {};
            if (!origin || origin === 'null') return null;
            const segments = (pathname || '/').split('/').filter(Boolean);
            const pagesIdx = segments.indexOf('pages');
            const baseSegments = pagesIdx > -1
                ? segments.slice(0, pagesIdx)
                : segments.slice(0, Math.max(segments.length - 1, 0));
            const basePath = baseSegments.length ? `/${baseSegments.join('/')}` : '';
            return `${origin}${basePath}`.replace(/\/$/, '');
        } catch (err) {
            console.warn('[env.js] computeSiteBaseUrl failed:', err);
            return null;
        }
    };

    const isLocalLikeHost = (hostname) => {
        try {
            return !!hostname && (
                hostname === 'localhost' ||
                hostname === '127.0.0.1' ||
                hostname === '0.0.0.0' ||
                hostname === '::1' ||
                /^192\.168\./.test(hostname) ||
                /^10\./.test(hostname) ||
                /\.local$/i.test(hostname)
            );
        } catch {
            return false;
        }
    };

    const normalizeEnv = (data) => {
        if (!data || typeof data !== 'object') return null;
        const env = {
            SUPABASE_URL: typeof data.SUPABASE_URL === 'string' ? data.SUPABASE_URL.trim() : '',
            SUPABASE_ANON_KEY: typeof data.SUPABASE_ANON_KEY === 'string' ? data.SUPABASE_ANON_KEY.trim() : '',
            STRIPE_PUBLISHABLE_KEY: typeof data.STRIPE_PUBLISHABLE_KEY === 'string' ? data.STRIPE_PUBLISHABLE_KEY.trim() : '',
            PUBLIC_SITE_URL: typeof data.PUBLIC_SITE_URL === 'string' ? data.PUBLIC_SITE_URL.trim() : '',
            GA4_MEASUREMENT_ID: typeof data.GA4_MEASUREMENT_ID === 'string' ? data.GA4_MEASUREMENT_ID.trim() : '',
            GOOGLE_OAUTH_ENABLED: data.GOOGLE_OAUTH_ENABLED === true,
            FACEBOOK_OAUTH_ENABLED: data.FACEBOOK_OAUTH_ENABLED === true
        };

        if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
            return null;
        }

        return env;
    };

    const mirrorEnv = (env) => {
        if (!env) return null;
        window.__ENV = Object.assign({}, window.__ENV || {}, env);

        window.SUPABASE_URL = env.SUPABASE_URL;
        window.SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;
        window.NEXT_PUBLIC_SUPABASE_URL = env.SUPABASE_URL;
        window.NEXT_PUBLIC_SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;
        window.GOOGLE_OAUTH_ENABLED = env.GOOGLE_OAUTH_ENABLED === true;
        window.FACEBOOK_OAUTH_ENABLED = env.FACEBOOK_OAUTH_ENABLED === true;

        if (env.STRIPE_PUBLISHABLE_KEY) {
            window.STRIPE_PUBLISHABLE_KEY = env.STRIPE_PUBLISHABLE_KEY;
        }

        const detectedBase = computeSiteBaseUrl();
        const localCurrentHost = isLocalLikeHost(window.location?.hostname || '');
        if (detectedBase && (localCurrentHost || !window.__ENV.PUBLIC_SITE_URL)) {
            window.__ENV.PUBLIC_SITE_URL = detectedBase;
        }

        console.debug('[env.js] Public env loaded', {
            projectRef: (env.SUPABASE_URL.match(/https:\/\/([a-z0-9]+)\.supabase\.co/i) || [])[1] || null,
            hasAnonKey: !!env.SUPABASE_ANON_KEY,
            publicSiteUrl: window.__ENV.PUBLIC_SITE_URL || null
        });

        return window.__ENV;
    };

    const existingEnv = normalizeEnv(window.__ENV);
    if (existingEnv) {
        mirrorEnv(existingEnv);
        return;
    }

    const existingGlobals = normalizeEnv({
        SUPABASE_URL: window.NEXT_PUBLIC_SUPABASE_URL || window.SUPABASE_URL,
        SUPABASE_ANON_KEY: window.NEXT_PUBLIC_SUPABASE_ANON_KEY || window.SUPABASE_ANON_KEY,
        STRIPE_PUBLISHABLE_KEY: window.STRIPE_PUBLISHABLE_KEY,
        PUBLIC_SITE_URL: window.PUBLIC_SITE_URL || window.__ENV?.PUBLIC_SITE_URL,
        GA4_MEASUREMENT_ID: window.GA4_MEASUREMENT_ID
    });
    if (existingGlobals) {
        mirrorEnv(existingGlobals);
        return;
    }

    if (!window.__ENV || typeof window.__ENV !== 'object') {
        window.__ENV = {};
    }

    if (window.__ENV_PROMISE) {
        window.__ENV_PROMISE = window.__ENV_PROMISE.then(mirrorEnv);
        return;
    }

    const origin = window.location?.origin || '';
    const pathParts = (window.location?.pathname || '/').split('/').filter(Boolean);
    const repoBase = origin.includes('github.io') && pathParts.length > 0 ? `/${pathParts[0]}` : '';
    const candidates = [
        '/env-config.json',
        `${repoBase}/env-config.json`,
        './env-config.json',
        '../env-config.json',
        '../../env-config.json',
        'https://garciabuilder.fitness/env-config.json',
        'https://www.garciabuilder.fitness/env-config.json',
        'https://andrejulio072.github.io/Garcia-Builder/env-config.json'
    ].filter((value, index, list) => value && list.indexOf(value) === index);

    window.__ENV_PROMISE = (async () => {
        let lastError;
        for (const candidate of candidates) {
            try {
                const response = await fetch(candidate, { cache: 'no-store' });
                if (!response.ok) {
                    lastError = new Error(`${candidate} returned ${response.status}`);
                    continue;
                }
                const env = normalizeEnv(await response.json());
                if (env) return mirrorEnv(env);
                lastError = new Error(`${candidate} is missing Supabase public config`);
            } catch (error) {
                lastError = error;
            }
        }
        throw lastError || new Error('Unable to load env-config.json');
    })().catch((error) => {
        console.error('[env.js] Failed to load public env config:', error);
        delete window.__ENV_PROMISE;
        throw error;
    });
})();
