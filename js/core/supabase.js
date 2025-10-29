/**
 * 🔐 SUPABASE AUTHENTICATION - GARCIA BUILDER
 * Configuração para autenticação com Supabase + OAuth Social Login
 */

(function () {
    console.log('🔧 Loading Supabase configuration...');

    if (!Array.isArray(window.__supabaseReadyQueue)) {
        window.__supabaseReadyQueue = [];
    }

    window.waitForSupabaseClient = function waitForSupabaseClient(timeout = 10000) {
        if (window.supabaseClient) {
            return Promise.resolve(window.supabaseClient);
        }

        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error('Supabase client initialization timed out'));
            }, Math.max(0, timeout));

            window.__supabaseReadyQueue.push((client) => {
                clearTimeout(timer);
                if (client) {
                    resolve(client);
                } else {
                    reject(new Error('Supabase client failed to initialize'));
                }
            });
        });
    };

    const isBrowser = typeof window !== 'undefined';
    const isFileProtocol = isBrowser && window.location && window.location.protocol === 'file:';
    const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;

    const normalizeEnvObject = (data) => {
        if (!data || typeof data !== 'object') return null;
        const normalized = Object.assign({}, data);
        ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'STRIPE_PUBLISHABLE_KEY', 'PUBLIC_SITE_URL'].forEach((key) => {
            if (typeof normalized[key] === 'string') {
                normalized[key] = normalized[key].trim();
            }
        });
        if (!normalized.SUPABASE_URL || !normalized.SUPABASE_ANON_KEY) {
            return null;
        }
        return normalized;
    };

    const deriveEnvFromGlobals = () => {
        try {
            const url = window.NEXT_PUBLIC_SUPABASE_URL || window.SUPABASE_URL;
            const anon = window.NEXT_PUBLIC_SUPABASE_ANON_KEY || window.SUPABASE_ANON_KEY;
            const publicSite = window.__ENV && window.__ENV.PUBLIC_SITE_URL
                ? window.__ENV.PUBLIC_SITE_URL
                : (window.PUBLIC_SITE_URL || null);

            if (!url || !anon) {
                return null;
            }

            const globalEnv = normalizeEnvObject({
                SUPABASE_URL: url,
                SUPABASE_ANON_KEY: anon,
                PUBLIC_SITE_URL: publicSite
            });

            if (globalEnv) {
                window.__ENV = Object.assign({}, window.__ENV || {}, globalEnv);
                return window.__ENV;
            }
        } catch (err) {
            console.warn('[Supabase] Failed to derive env from globals:', err);
        }
        return null;
    };

    const loadEnv = () => {
        if (!isBrowser) {
            return Promise.reject(new Error('Supabase client requires browser environment.'));
        }

        if (window.__ENV && window.__ENV.SUPABASE_URL && window.__ENV.SUPABASE_ANON_KEY) {
            return Promise.resolve(window.__ENV);
        }

        const globalEnv = deriveEnvFromGlobals();
        if (globalEnv) {
            return Promise.resolve(globalEnv);
        }

        if (window.__ENV_PROMISE) {
            return window.__ENV_PROMISE;
        }

        // Try multiple candidate paths so it works on localhost, Vercel and GitHub Pages subpaths
        const origin = window.location.origin || '';
        const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
        const pathParts = (window.location.pathname || '/').split('/').filter(Boolean);
        const repoBase = origin.includes('github.io') && pathParts.length > 0 ? `/${pathParts[0]}` : '';

        const absoluteFallbacks = [
                'https://garciabuilder.fitness/env-config.json',
                'https://www.garciabuilder.fitness/env-config.json',
                'https://andrejulio072.github.io/Garcia-Builder/env-config.json'
            ];

            const candidates = [
                '/env-config.json', // root (Vercel/custom domain/local dev root)
                `${repoBase}/env-config.json`, // GitHub Pages under repo subpath
                './env-config.json',
                '../env-config.json',
            '../../env-config.json',
                ...absoluteFallbacks
            ].filter((v, idx, arr) => !!v && arr.indexOf(v) === idx);

        const tryFetchSequentially = async () => {
            let lastErr;
            for (const url of candidates) {
                try {
                    console.info('[Supabase] Fetching env config from', url);
                    const response = await fetch(url, { cache: 'no-store' });
                    if (response.ok) {
                        return await response.json();
                    }
                    lastErr = new Error(`env-config at ${url} returned ${response.status}`);
                } catch (e) {
                    console.warn('[Supabase] Env config fetch failed for', url, e?.message || e);
                    lastErr = e;
                }
            }
            throw lastErr || new Error('Failed to load env-config.json from known locations');
        };

        window.__ENV_PROMISE = tryFetchSequentially()
            .then((data) => {
                const normalized = normalizeEnvObject(data);
                if (!normalized) {
                    throw new Error('Supabase env config is missing SUPABASE_URL or SUPABASE_ANON_KEY.');
                }
                window.__ENV = Object.assign({}, normalized, window.__ENV || {});
                return window.__ENV;
            })
            .catch((error) => {
                const fallbackEnv = deriveEnvFromGlobals();
                if (fallbackEnv) {
                    console.warn('[Supabase] Falling back to globals after env-config fetch failure.');
                    return fallbackEnv;
                }
                console.error('[Supabase] Failed to load env config from candidates:', candidates, error);
                delete window.__ENV_PROMISE;
                throw error;
            });

        return window.__ENV_PROMISE;
    };

    if (isOffline) {
        console.info('[Supabase] Initializer skipped (offline mode).');
        window.supabaseClient = null;
        return;
    }
    if (isFileProtocol) {
        // Allow initialization under file:// to support lightweight local testing.
        // OAuth redirects won’t return to file://, but email/password flows work.
        console.info('[Supabase] Running under file:// protocol; proceeding with initialization for local testing.');
    }

    loadEnv()
        .then((env) => {
            window.SUPABASE_URL = env.SUPABASE_URL;
            window.SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;
            window.NEXT_PUBLIC_SUPABASE_URL = env.SUPABASE_URL;
            window.NEXT_PUBLIC_SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;

            const supabaseLib = typeof supabase !== 'undefined' ? supabase : window.supabase;

            if (!supabaseLib) {
                console.error('❌ Supabase library not loaded');
                return;
            }

            window.supabaseClient = supabaseLib.createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
            console.log('✅ Supabase client initialized successfully');

            if (Array.isArray(window.__supabaseReadyQueue)) {
                window.__supabaseReadyQueue.forEach((resolver) => {
                    try {
                        resolver(window.supabaseClient);
                    } catch (queueErr) {
                        console.warn('Supabase ready resolver threw:', queueErr);
                    }
                });
                window.__supabaseReadyQueue = null;
            }
        })
        .catch((err) => {
            console.error('[Supabase] Initialization failed:', err);
            window.supabaseClient = null;
            if (Array.isArray(window.__supabaseReadyQueue)) {
                window.__supabaseReadyQueue.forEach((resolver) => {
                    try {
                        resolver(null);
                    } catch (queueErr) {
                        console.warn('Supabase ready rejection handler threw:', queueErr);
                    }
                });
                window.__supabaseReadyQueue = null;
            }
        });

    // OAuth providers are configured in Supabase Dashboard; no client secrets should exist in frontend.
    console.log('📱 OAuth providers configured via Supabase project settings');

    /**
     * Configurações adicionais do projeto Supabase:
     *
     * ✅ CONFIGURADO - Não precisa repetir:
     * 1. Project URL definido via env-config.json
     * 2. Auth configurado com OAuth Google e Facebook
     * 3. URL Configuration: https://andrejulio072.github.io/Garcia-Builder/*
     * 4. Tabela profiles com phone e date_of_birth criada
     * 5. RLS policies configuradas
     *
     * 🎯 Sistema pronto para uso com:
     * - Autenticação por email/senha
     * - Login social (Google + Facebook)
     * - Campos extras: telefone + data nascimento
     * - Dashboard com perfil do usuário
     */
})();
