// Supabase Configuration for Garcia Builder
console.log('🔧 Loading Supabase configuration...');

// Configuração Supabase
const SUPABASE_URL = 'https://qejtjcaldnuokoofpqap.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlanRqY2FsZG51b2tvb2ZwcWFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc0NTY5NTMsImV4cCI6MjA0MzAzMjk1M30.oPB-H7Kk1BPvPIMLRkYQpOOdEkXzIww2lCZPEu5rD7Q';

// Inicializar Supabase Client
if (window.supabase) {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client initialized successfully');
} else {
    console.error('❌ Supabase library not loaded');
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