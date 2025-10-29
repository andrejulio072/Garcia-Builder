/**
 * 🔐 GARCIA BUILDER - AUTHENTICATION SYSTEM WITH SUPABASE
 * Sistema de autenticação com Supabase para GitHub Pages
 * Funciona 100% no frontend com verificação de email, reset de senha, etc.
 */

const resolveSiteBaseUrl = () => {
    if (typeof window === 'undefined') {
        return '';
    }

    if (window.__SITE_BASE_URL) {
        return window.__SITE_BASE_URL;
    }

    if (window.__ENV && typeof window.__ENV.PUBLIC_SITE_URL === 'string' && window.__ENV.PUBLIC_SITE_URL.trim()) {
        window.__SITE_BASE_URL = window.__ENV.PUBLIC_SITE_URL.replace(/\/$/, '');
        return window.__SITE_BASE_URL;
    }

    try {
        const { origin, pathname } = window.location;
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
        const computed = `${origin}${basePath}`.replace(/\/$/, '');
        window.__SITE_BASE_URL = computed;
        if (!window.__ENV) window.__ENV = {};
        if (!window.__ENV.PUBLIC_SITE_URL) {
            window.__ENV.PUBLIC_SITE_URL = computed;
        }
        return computed;
    } catch (err) {
        console.warn('[SupabaseAuth] resolveSiteBaseUrl fallback used:', err);
        const fallback = (window.location && window.location.origin) ? window.location.origin : '';
        window.__SITE_BASE_URL = (fallback || '').replace(/\/$/, '');
        return window.__SITE_BASE_URL;
    }
};

const toSiteAbsoluteUrl = (pathOrUrl) => {
    if (!pathOrUrl) {
        return resolveSiteBaseUrl() || (window.location?.origin || '');
    }

    if (/^https?:\/\//i.test(pathOrUrl)) {
        return pathOrUrl;
    }

    if (typeof toAbsoluteUrl === 'function') {
        try {
            return toAbsoluteUrl(pathOrUrl);
        } catch (err) {
            console.warn('[SupabaseAuth] toAbsoluteUrl failed, falling back:', err);
        }
    }

    const base = resolveSiteBaseUrl();
    try {
        return new URL(pathOrUrl, `${base.replace(/\/$/, '')}/`).toString();
    } catch (err) {
        console.warn('[SupabaseAuth] URL construction fallback in use:', err);
        const origin = (window.location && window.location.origin) ? window.location.origin : '';
        const cleanPath = String(pathOrUrl).replace(/^\/+/, '');
        return `${origin.replace(/\/$/, '')}/${cleanPath}`;
    }
};

const withDevReturnIfNeeded = (absoluteUrl) => {
    if (!absoluteUrl) return absoluteUrl;
    try {
        const url = new URL(absoluteUrl);
        if (/^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname)) {
            const base = resolveSiteBaseUrl();
            if (base) {
                url.searchParams.set('devReturn', base.replace(/\/$/, ''));
            }
        }
        return url.toString();
    } catch (err) {
        console.warn('[SupabaseAuth] devReturn injection skipped:', err);
        return absoluteUrl;
    }
};

const buildDashboardRedirectUrl = () => withDevReturnIfNeeded(toSiteAbsoluteUrl('dashboard.html'));
const buildResetPasswordRedirectUrl = () => withDevReturnIfNeeded(toSiteAbsoluteUrl('pages/auth/reset-password.html'));

class SupabaseAuthSystem {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
        this.init();
    }

    async init() {
        // Aguardar Supabase estar disponível
        if (!window.supabaseClient) {
            console.error('❌ Supabase client not available');
            return;
        }

        try {
            // Verificar sessão atual
            const { data: { session }, error } = await window.supabaseClient.auth.getSession();
            if (error) throw error;

            if (session?.user) {
                this.currentUser = session.user;
                this.updateUserStorage(session.user);
            }

            this.setupEventListeners();
            this.setupAuthStateListener();
            this.isInitialized = true;

            console.log('✅ Supabase Auth System initialized');
        } catch (error) {
            console.error('❌ Error initializing auth system:', error);
        }
    }

    setupEventListeners() {
        // Form switching
        document.getElementById('showRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('register');
        });

        document.getElementById('showLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('login');
        });

        // Form submissions
        const loginForm = document.getElementById('loginFormElement') || document.getElementById('signin-form');
        const registerForm = document.getElementById('registerFormElement') || document.getElementById('signup-form');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Forgot password
        const forgotBtn = document.getElementById('forgot-btn') || document.getElementById('forgotPassword');
        if (forgotBtn) {
            forgotBtn.addEventListener('click', (e) => this.handleForgotPassword(e));
        }

        // Language switching (manter compatibilidade)
        document.querySelectorAll('[data-lang]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = button.getAttribute('data-lang');
                this.switchLanguage(lang);
            });
        });
    }

    setupAuthStateListener() {
        window.supabaseClient.auth.onAuthStateChange((event, session) => {
            console.log('🔄 Auth state changed:', event);

            if (event === 'SIGNED_IN' && session?.user) {
                this.currentUser = session.user;
                this.updateUserStorage(session.user);
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.clearUserStorage();
            }
        });
    }

    async updateUserStorage(user) {
        try {
            // Dados básicos do usuário
            const userData = {
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.email,
                email_confirmed: user.email_confirmed_at ? true : false,
                last_sign_in: user.last_sign_in_at,
                created_at: user.created_at,
                // Dados do OAuth (Google, Facebook, etc.)
                provider: user.app_metadata?.provider || 'email',
                providers: user.app_metadata?.providers || ['email'],
                // Dados adicionais do metadata
                avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
                phone: user.user_metadata?.phone || null,
                date_of_birth: user.user_metadata?.date_of_birth || null,
                // Dados do provedor social
                google_data: user.app_metadata?.provider === 'google' ? {
                    picture: user.user_metadata?.picture,
                    verified_email: user.user_metadata?.email_verified,
                    locale: user.user_metadata?.locale
                } : null,
                facebook_data: user.app_metadata?.provider === 'facebook' ? {
                    picture: user.user_metadata?.picture,
                    verified: user.user_metadata?.email_verified
                } : null
            };

            // Tentar buscar dados do perfil na tabela user_profiles
            try {
                const { data: profile, error } = await window.supabaseClient
                    .from('user_profiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (!error && profile) {
                    // Mesclar dados do perfil
                    userData.profile = profile;
                    userData.phone = profile.phone || userData.phone;
                    userData.date_of_birth = profile.date_of_birth || userData.date_of_birth;
                    userData.city = profile.city || null;
                    userData.country = profile.country || null;
                    userData.bio = profile.bio || null;
                    userData.preferences = profile.preferences || {};
                } else {
                    // Criar perfil inicial se não existir
                    await this.createUserProfile(user, userData);
                }
            } catch (profileError) {
                console.warn('Profile fetch error (creating new):', profileError);
                await this.createUserProfile(user, userData);
            }

            localStorage.setItem('gb_current_user', JSON.stringify(userData));
            console.log('✅ User data stored:', userData);

        } catch (error) {
            console.error('❌ Error updating user storage:', error);
            // Fallback para dados básicos
            const fallbackData = {
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.email
            };
            localStorage.setItem('gb_current_user', JSON.stringify(fallbackData));
        }
    }

    async createUserProfile(user, userData) {
        try {
            const profileData = {
                user_id: user.id,
                email: user.email,
                full_name: userData.full_name,
                phone: userData.phone,
                date_of_birth: userData.date_of_birth,
                avatar_url: userData.avatar_url,
                provider: userData.provider,
                preferences: {
                    currency: 'EUR',
                    language: 'en',
                    email_notifications: true,
                    theme: 'dark'
                },
                created_at: new Date().toISOString()
            };

            const { error } = await window.supabaseClient
                .from('user_profiles')
                .insert([profileData])
                .select();

            if (error) throw error;
            console.log('✅ User profile created');

        } catch (error) {
            console.error('❌ Error creating user profile:', error);
        }
    }

    clearUserStorage() {
        localStorage.removeItem('gb_current_user');
        localStorage.removeItem('gb_remember_me');
    }

    showMessage(text, type = "info") {
        const messageBox = document.getElementById("auth-msg") || document.getElementById("statusMessage");
        if (!messageBox) {
            console.log(`${type.toUpperCase()}: ${text}`);
            return;
        }

        messageBox.className = `alert alert-${type}`;
        messageBox.textContent = text;
        messageBox.classList.remove("d-none");

        // Auto-hide success messages
        if (type === "success") {
            setTimeout(() => messageBox.classList.add("d-none"), 5000);
        }
    }

    async handleRegister(e) {
        e.preventDefault();

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        try {
            submitBtn.textContent = 'Creating account...';
            submitBtn.disabled = true;

            // Obter dados do formulário (flexível para diferentes layouts)
            const full_name = (
                document.getElementById("signup-name") ||
                document.getElementById("registerName") ||
                document.querySelector('input[name="name"]')
            )?.value.trim();

            const email = (
                document.getElementById("signup-email") ||
                document.getElementById("registerEmail") ||
                document.querySelector('input[name="email"]')
            )?.value.trim();

            const password = (
                document.getElementById("signup-password") ||
                document.getElementById("registerPassword") ||
                document.querySelector('input[name="password"]')
            )?.value;

            // Novos campos extras
            const phone = (
                document.getElementById("registerPhone") ||
                document.querySelector('input[name="phone"]')
            )?.value.trim() || null;

            const date_of_birth = (
                document.getElementById("registerDob") ||
                document.querySelector('input[name="date_of_birth"]')
            )?.value || null;

            // Validações
            if (!full_name) throw new Error("Please enter your full name");
            if (!this.isValidEmail(email)) throw new Error("Please enter a valid email address");
            if (!this.isValidPassword(password)) throw new Error("Password must be at least 8 characters long");

            const { data, error } = await window.supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name, phone, date_of_birth },
                    emailRedirectTo: buildDashboardRedirectUrl()
                }
            });

            if (error) throw error;

            this.showMessage("🎉 Account created! Check your inbox to confirm your email, then sign in.", "success");

            // Limpar formulário
            e.target.reset();

            // Mostrar formulário de login após 2 segundos
            setTimeout(() => this.showForm('login'), 2000);

        } catch (error) {
            console.error('Registration error:', error);
            this.showMessage(error.message, "danger");
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    async handleLogin(e) {
        e.preventDefault();

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        try {
            submitBtn.textContent = 'Signing in...';
            submitBtn.disabled = true;

            // Obter dados do formulário (flexível para diferentes layouts)
            const email = (
                document.getElementById("signin-email") ||
                document.getElementById("loginEmail") ||
                document.querySelector('input[name="email"]')
            )?.value.trim();

            const password = (
                document.getElementById("signin-password") ||
                document.getElementById("loginPassword") ||
                document.querySelector('input[name="password"]')
            )?.value;

            const remember = (
                document.getElementById("remember-me") ||
                document.getElementById("rememberMe")
            )?.checked;

            // Validações
            if (!this.isValidEmail(email)) throw new Error("Please enter a valid email address");
            if (!password) throw new Error("Please enter your password");

            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            // Salvar preferência de "remember me"
            localStorage.setItem('gb_remember_me', remember ? 'true' : 'false');

            this.showMessage("✅ Welcome back! Redirecting...", "success");

            // Verificar se há pagamento pendente
            const pendingPayment = localStorage.getItem('pendingPayment');
            let redirectUrl = buildDashboardRedirectUrl();

            if (pendingPayment) {
                const paymentData = JSON.parse(pendingPayment);
                redirectUrl = toSiteAbsoluteUrl(`pricing.html?auto-pay=${encodeURIComponent(paymentData.planKey)}`);
                localStorage.removeItem('pendingPayment');
            }

            // Redirecionar após 1 segundo
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1000);

        } catch (error) {
            console.error('Login error:', error);
            let errorMessage = error.message;

            if (errorMessage.includes('Invalid login credentials')) {
                errorMessage = "Invalid email or password. Please try again.";
            } else if (errorMessage.includes('Email not confirmed')) {
                errorMessage = "Please check your inbox and confirm your email before signing in.";
            }

            this.showMessage(errorMessage, "danger");
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    async handleForgotPassword(e) {
        e.preventDefault();

        const translate = (key, fallback) => {
            try {
                const api = window.GBi18n;
                if (api && typeof api.t === 'function') {
                    const value = api.t(key);
                    if (typeof value === 'string' && value.trim()) {
                        return value;
                    }
                }
            } catch (err) {
                console.warn('i18n lookup failed for', key, err);
            }
            return fallback;
        };

        const formatMessage = (template, replacements = {}) => {
            if (typeof template !== 'string') {
                return '';
            }
            return template.replace(/\{(\w+)\}/g, (_, token) => {
                return Object.prototype.hasOwnProperty.call(replacements, token) ? replacements[token] : `{${token}}`;
            });
        };

        try {
            const emailField = (
                document.getElementById("signin-email") ||
                document.getElementById("loginEmail") ||
                document.querySelector('input[name="email"]')
            );

            const email = emailField ? emailField.value.trim() : '';

            if (!email) {
                this.showMessage(translate('auth.forgot_email_required', 'Please enter your email address.'), "warning");
                return;
            }

            if (!this.isValidEmail(email)) {
                this.showMessage(translate('auth.email_invalid', 'Please enter a valid email address.'), "warning");
                return;
            }

            const btn = e.target;
            const originalText = btn.textContent;
            btn.textContent = translate('auth.sending', 'Sending...');
            btn.disabled = true;

            const redirectTo = buildResetPasswordRedirectUrl();
            const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, { redirectTo });

            if (error) throw error;

            const successMessage = formatMessage(
                translate(
                    'auth.forgot_success',
                    '📧 Password reset link sent to {email}. Check your inbox!'
                ),
                { email }
            );

            this.showMessage(successMessage, "success");

            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            }, 3000);

        } catch (error) {
            console.error('Password reset error:', error);

            const message = (error && error.message ? error.message : '').toLowerCase();

            if (message.includes('user') && message.includes('not') && message.includes('found')) {
                this.showMessage(
                    translate('auth.forgot_error_user_not_found', 'No account found with this email address.'),
                    "danger"
                );
                return;
            }

            if (message.includes('rate') && message.includes('limit')) {
                this.showMessage(
                    translate(
                        'auth.forgot_error_rate_limit',
                        'Too many reset requests. Please wait a few minutes before trying again.'
                    ),
                    "danger"
                );
                return;
            }

            const fallback = translate('auth.forgot_error_generic', 'Error: {message}');
            this.showMessage(formatMessage(fallback, { message: error?.message || 'Unknown error' }), "danger");
        }
    }

    showForm(formType) {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (!loginForm || !registerForm) return;

        if (formType === 'login') {
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
        } else {
            loginForm.classList.remove('active');
            registerForm.classList.add('active');
        }
    }

    switchLanguage(lang) {
        localStorage.setItem('selectedLanguage', lang);

        // Update current language display
        const currentLangEl = document.getElementById('currentLang');
        if (currentLangEl) {
            currentLangEl.textContent = lang.toUpperCase();
        }

        // Apply translations if available
        if (typeof applyTranslations === 'function') {
            applyTranslations(lang);
        }
    }

    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    isValidPassword(password) {
        return password && password.length >= 8;
    }

    // Public methods for external use
    async getCurrentUser() {
        if (!window.supabaseClient) return null;

        try {
            const { data: { user }, error } = await window.supabaseClient.auth.getUser();
            if (error) throw error;
            return user;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    async isLoggedIn() {
        const user = await this.getCurrentUser();
        return !!user;
    }

    async logout() {
        try {
            const { error } = await window.supabaseClient.auth.signOut();
            if (error) throw error;

            this.clearUserStorage();
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
            alert('Error signing out: ' + error.message);
        }
    }

    async requireAuth() {
        const isLoggedIn = await this.isLoggedIn();
        if (!isLoggedIn) {
            const currentUrl = encodeURIComponent(window.location.pathname);
            window.location.href = `login.html?redirect=${currentUrl}`;
            return false;
        }
        return true;
    }

    async isEmailConfirmed() {
        const user = await this.getCurrentUser();
        return user?.email_confirmed_at ? true : false;
    }

    // Static methods for backward compatibility
    static getCurrentUser() {
        return JSON.parse(localStorage.getItem('gb_current_user') || 'null');
    }

    static isLoggedIn() {
        return !!SupabaseAuthSystem.getCurrentUser();
    }

    static logout() {
        if (window.authSystem) {
            window.authSystem.logout();
        } else {
            localStorage.removeItem('gb_current_user');
            window.location.href = 'login.html';
        }
    }

    static requireAuth() {
        if (!SupabaseAuthSystem.isLoggedIn()) {
            const currentUrl = encodeURIComponent(window.location.pathname);
            window.location.href = `login.html?redirect=${currentUrl}`;
            return false;
        }
        return true;
    }
}

// Social Login Functions
function setupSocialLogin() {
    const oauthRedirectTo = buildDashboardRedirectUrl();

    // Google Login
    const googleBtn = document.getElementById("google-btn");
    if (googleBtn) {
        googleBtn.addEventListener("click", async () => {
            try {
                googleBtn.disabled = true;
                googleBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Conectando...';

                const { error } = await window.supabaseClient.auth.signInWithOAuth({
                    provider: "google",
                    options: { redirectTo: oauthRedirectTo }
                });

                if (error) throw error;
            } catch (error) {
                console.error('Google login error:', error);
                if (window.authSystem) {
                    window.authSystem.showMessage(error.message, "danger");
                }
            } finally {
                googleBtn.disabled = false;
                googleBtn.innerHTML = '<i class="fab fa-google text-danger me-2"></i>Continuar com Google';
            }
        });
    }

    // Facebook Login
    const facebookBtn = document.getElementById("facebook-btn");
    if (facebookBtn) {
        facebookBtn.addEventListener("click", async () => {
            try {
                facebookBtn.disabled = true;
                facebookBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Conectando...';

                const { error } = await window.supabaseClient.auth.signInWithOAuth({
                    provider: "facebook",
                    options: { redirectTo: oauthRedirectTo }
                });

                if (error) throw error;
            } catch (error) {
                console.error('Facebook login error:', error);
                if (window.authSystem) {
                    window.authSystem.showMessage(error.message, "danger");
                }
            } finally {
                facebookBtn.disabled = false;
                facebookBtn.innerHTML = '<i class="fab fa-facebook-f me-2"></i>Continuar com Facebook';
            }
        });
    }
}

// Initialize auth system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar um pouco para garantir que o Supabase foi carregado
    setTimeout(() => {
        window.authSystem = new SupabaseAuthSystem();
        setupSocialLogin(); // Configurar login social
    }, 100);
});

// Global functions for convenience
window.signOut = async () => {
    if (window.authSystem) {
        await window.authSystem.logout();
    } else {
        window.location.href = 'login.html';
    }
};

window.getCurrentUser = async () => {
    if (window.authSystem) {
        return await window.authSystem.getCurrentUser();
    }
    return null;
};

window.isEmailConfirmed = async () => {
    if (window.authSystem) {
        return await window.authSystem.isEmailConfirmed();
    }
    return false;
};

// Export for external use (backward compatibility)
window.AuthSystem = SupabaseAuthSystem;
window.SupabaseAuthSystem = SupabaseAuthSystem;

console.log('🔐 Supabase Auth System loaded - Garcia Builder');
