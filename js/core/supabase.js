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

    // OAuth Providers Configuration
    const OAUTH_CONFIG = {
        google: {
            clientId: '84856110459-bghsgv3d1pst0n7v6e2nvf0glghf6fs9.apps.googleusercontent.com',
            clientSecret: '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'
        },
        facebook: {
            appId: '1155731136457398',
            appSecret: 'e7947a2b1f7e02df76c92912561d703b'
        }
    };

    console.log('📱 OAuth providers configured:', Object.keys(OAUTH_CONFIG));

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
