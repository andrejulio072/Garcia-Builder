/**
 * 🔐 SUPABASE AUTHENTICATION - GARCIA BUILDER
 * Configuração para autenticação com Supabase + OAuth Social Login
 */

(function () {
    console.log('🔧 Loading Supabase configuration...');

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

        // Try multiple candidate paths so it works on localhost, Vercel and GitHub Pages subpaths
        const origin = window.location.origin || '';
        const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
        const pathParts = (window.location.pathname || '/').split('/').filter(Boolean);
        const repoBase = origin.includes('github.io') && pathParts.length > 0 ? `/${pathParts[0]}` : '';

        const candidates = [
            '/env-config.json', // root (Vercel/custom domain/local dev root)
            `${repoBase}/env-config.json`, // GitHub Pages under repo subpath
            './env-config.json',
            '../env-config.json',
            '../../env-config.json'
        ].filter((v, idx, arr) => !!v && arr.indexOf(v) === idx);

        const tryFetchSequentially = async () => {
            let lastErr;
            for (const url of candidates) {
                try {
                    const response = await fetch(url, { cache: 'no-store' });
                    if (response.ok) {
                        return await response.json();
                    }
                    lastErr = new Error(`env-config at ${url} returned ${response.status}`);
                } catch (e) {
                    lastErr = e;
                }
            }
            throw lastErr || new Error('Failed to load env-config.json from known locations');
        };

        window.__ENV_PROMISE = tryFetchSequentially()
            .then((data) => {
                if (data && typeof data === 'object') {
                    ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'STRIPE_PUBLISHABLE_KEY', 'PUBLIC_SITE_URL'].forEach((key) => {
                        if (typeof data[key] === 'string') {
                            data[key] = data[key].trim();
                        }
                    });
                }

                if (!data?.SUPABASE_URL || !data?.SUPABASE_ANON_KEY) {
                    throw new Error('Supabase env config is missing SUPABASE_URL or SUPABASE_ANON_KEY.');
                }
                window.__ENV = Object.freeze(data);
                return window.__ENV;
            })
            .catch((error) => {
                console.error('[Supabase] Failed to load env config from candidates:', candidates, error);
                delete window.__ENV_PROMISE;
                throw error;
            });

        return window.__ENV_PROMISE;
    };

    if (isFileProtocol || isOffline) {
        const reasons = [];
        if (isFileProtocol) reasons.push('file protocol');
        if (isOffline) reasons.push('offline mode');
        console.info(`[Supabase] Legacy initializer skipped (${reasons.join(' + ')}).`);
        window.supabaseClient = null;
        return;
    }

    loadEnv()
        .then((env) => {
            window.SUPABASE_URL = env.SUPABASE_URL;
            window.SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;

            const supabaseLib = typeof supabase !== 'undefined' ? supabase : window.supabase;

            if (!supabaseLib) {
                console.error('❌ Supabase library not loaded');
                return;
            }

            window.supabaseClient = supabaseLib.createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
            console.log('✅ Supabase client initialized successfully');
        })
        .catch(() => {
            window.supabaseClient = null;
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
