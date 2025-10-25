/**
 * 🔐 SUPABASE AUTHENTICATION - GARCIA BUILDER
 * Configuração para autenticação com Supabase + OAuth Social Login
 */

console.log('🔧 Loading Supabase configuration...');

// Credenciais do projeto Supabase - Garcia Builder (Chave válida)
window.SUPABASE_URL = "https://qejtjcaldnuokoofpqap.supabase.co";
window.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlanRqY2FsZG51b2tvb2ZwcWFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5OTY2MjgsImV4cCI6MjA3NDU3MjYyOH0.-4KmNNRpmNLu4-xPtnC4-FJJTBbvrSk03v2WCaT5Kyw";

const isFileProtocol = typeof window !== 'undefined' && window.location && window.location.protocol === 'file:';
const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;

if (isFileProtocol || isOffline) {
    const reasons = [];
    if (isFileProtocol) reasons.push('file protocol');
    if (isOffline) reasons.push('offline mode');
    console.info(`[Supabase] Legacy initializer skipped (${reasons.join(' + ')}).`);
    window.supabaseClient = null;
} else {

    // Criar cliente Supabase
    if (typeof supabase !== 'undefined') {
        window.supabaseClient = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
        console.log('✅ Supabase client initialized successfully');
    } else if (window.supabase) {
        window.supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
        console.log('✅ Supabase client initialized successfully');
    } else {
        console.error('❌ Supabase library not loaded');
    }
}

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
 * 1. Project URL: https://qejtjcaldnuokoofpqap.supabase.co
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
