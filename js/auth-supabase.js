/**
 * 🔐 GARCIA BUILDER - AUTHENTICATION SYSTEM WITH SUPABASE
 * Sistema de autenticação com Supabase para GitHub Pages
 * Funciona 100% no frontend com verificação de email, reset de senha, etc.
 */

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

    updateUserStorage(user) {
        const userData = {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email,
            email_confirmed: user.email_confirmed_at ? true : false,
            last_sign_in: user.last_sign_in_at,
            created_at: user.created_at
        };
        localStorage.setItem('gb_current_user', JSON.stringify(userData));
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

            // Validações
            if (!full_name) throw new Error("Please enter your full name");
            if (!this.isValidEmail(email)) throw new Error("Please enter a valid email address");
            if (!this.isValidPassword(password)) throw new Error("Password must be at least 8 characters long");

            const { data, error } = await window.supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name },
                    emailRedirectTo: `${window.location.origin}/Garcia-Builder/dashboard.html`
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
            let redirectUrl = 'dashboard.html';

            if (pendingPayment) {
                const paymentData = JSON.parse(pendingPayment);
                redirectUrl = `pricing.html?auto-pay=${paymentData.planKey}`;
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

        try {
            const email = (
                document.getElementById("signin-email") ||
                document.getElementById("loginEmail") ||
                document.querySelector('input[name="email"]')
            )?.value.trim();

            if (!email) {
                this.showMessage("Please enter your email address first.", "warning");
                return;
            }

            if (!this.isValidEmail(email)) {
                this.showMessage("Please enter a valid email address.", "warning");
                return;
            }

            const btn = e.target;
            const originalText = btn.textContent;
            btn.textContent = 'Sending...';
            btn.disabled = true;

            const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/Garcia-Builder/reset-password.html`
            });

            if (error) throw error;

            this.showMessage(`📧 Password reset link sent to ${email}. Check your inbox!`, "success");

            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            }, 3000);

        } catch (error) {
            console.error('Password reset error:', error);
            this.showMessage(error.message, "danger");
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

// Initialize auth system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar um pouco para garantir que o Supabase foi carregado
    setTimeout(() => {
        window.authSystem = new SupabaseAuthSystem();
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
