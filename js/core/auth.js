// Authentication System - Garcia Builder

function computeSiteBaseUrl() {
    if (typeof window === 'undefined') {
        return '';
    }

    if (window.__SITE_BASE_URL) {
        return window.__SITE_BASE_URL;
    }

    const envBase = window.__ENV && typeof window.__ENV.PUBLIC_SITE_URL === 'string'
        ? window.__ENV.PUBLIC_SITE_URL
        : null;

    if (envBase) {
        window.__SITE_BASE_URL = envBase.replace(/\/$/, '');
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
        window.__SITE_BASE_URL = `${origin}${basePath}`.replace(/\/$/, '');
        return window.__SITE_BASE_URL;
    } catch (err) {
        console.warn('computeSiteBaseUrl fallback to origin:', err);
        const fallback = window.location ? window.location.origin : '';
        window.__SITE_BASE_URL = (fallback || '').replace(/\/$/, '');
        return window.__SITE_BASE_URL;
    }
}

function toAbsoluteUrl(pathOrUrl, fallbackPath = '') {
    if (!pathOrUrl) {
        return fallbackPath ? toAbsoluteUrl(fallbackPath) : `${computeSiteBaseUrl()}/`;
    }

    if (/^https?:\/\//i.test(pathOrUrl)) {
        return pathOrUrl;
    }

    try {
        return new URL(pathOrUrl, `${computeSiteBaseUrl()}/`).toString();
    } catch (err) {
        console.warn('toAbsoluteUrl fallback in use:', { pathOrUrl, err });
        const cleanPath = pathOrUrl.replace(/^\/+/, '');
        return `${computeSiteBaseUrl()}/${cleanPath}`;
    }
}

function resolveRedirectTarget(searchParams, defaultPath = 'dashboard.html') {
    const param = searchParams.get('redirect');
    if (param) {
        try {
            return toAbsoluteUrl(decodeURIComponent(param));
        } catch (err) {
            console.warn('resolveRedirectTarget decode failed, using raw value:', err);
            return toAbsoluteUrl(param);
        }
    }
    return toAbsoluteUrl(defaultPath);
}
class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('gb_users') || '[]');
        this.currentUser = JSON.parse(localStorage.getItem('gb_current_user') || 'null');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidation();
        this.checkAuthStatus();
        this.setupPasswordToggle();
        this.setupPasswordStrength();

        // Dev mode: allow quick local login when running on localhost with ?dev=1
        try {
            const isLocal = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1');
            const isDev = new URLSearchParams(window.location.search).get('dev') === '1';
            if (isLocal && isDev && !localStorage.getItem('gb_current_user')) {
                const devUser = {
                    id: 'dev-user-1',
                    name: 'Test User',
                    full_name: 'Test User',
                    email: 'test.user@example.com',
                    registeredAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString()
                };
                localStorage.setItem('gb_current_user', JSON.stringify(devUser));

                if (window.location.pathname.endsWith('login.html')) {
                    window.location.href = toAbsoluteUrl('dashboard.html?dev=1');
                }
            }
        } catch (e) {
            console.warn('Dev mode init skipped:', e?.message || e);
        }

        // Form submissions - APENAS para formulários tradicionais
        const loginForm = document.getElementById('loginFormElement');
        const registerForm = document.getElementById('registerFormElement');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                // Se for botão social, não validar campos de formulário
                if (e.submitter && e.submitter.type === 'button' && (e.submitter.id.includes('google') || e.submitter.id.includes('facebook'))) {
                    e.preventDefault(); // Impedir submit do form
                    return; // Deixa o event listener específico do botão social tratar
                }
                this.handleLogin(e);
            });
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                // Se for botão social, não validar campos de formulário
                if (e.submitter && e.submitter.type === 'button' && (e.submitter.id.includes('google') || e.submitter.id.includes('facebook'))) {
                    e.preventDefault(); // Impedir submit do form
                    return; // Deixa o event listener específico do botão social tratar
                }
                this.handleRegister(e);
            });
        }

        // Language switching
        document.querySelectorAll('[data-lang]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = button.getAttribute('data-lang');
                this.switchLanguage(lang);
            });
        });

        // Check for authentication redirects
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('action') === 'login') {
            this.showForm('login');
        } else if (urlParams.get('action') === 'register') {
            this.showForm('register');
        }

        // Check for payment flow return
        if (urlParams.get('return') === 'payment') {
            const planKey = urlParams.get('plan');
            if (planKey) {
                // Armazenar informações do plano para após o login/registro
                localStorage.setItem('pendingPayment', JSON.stringify({
                    planKey: planKey,
                    returnUrl: 'pricing.html',
                    timestamp: Date.now()
                }));
            }
        }
    }

    setupEventListeners() {
        try {
            const loginForm = document.getElementById('loginForm');
            const registerForm = document.getElementById('registerForm');

            const toggleView = (view) => {
                if (!loginForm || !registerForm) return;
                if (view === 'register') {
                    loginForm.classList.remove('active');
                    registerForm.classList.add('active');
                } else {
                    registerForm.classList.remove('active');
                    loginForm.classList.add('active');
                }

                try {
                    const url = new URL(window.location);
                    url.searchParams.set('action', view);
                    window.history.replaceState({}, '', url);
                } catch (historyErr) {
                    console.warn('Auth form toggle history update failed:', historyErr);
                }
            };

            const focusFirstInput = (container) => {
                if (!container) return;
                const field = container.querySelector('input:not([type="hidden"])');
                if (field) {
                    setTimeout(() => field.focus(), 50);
                }
            };

            const showRegisterBtn = document.getElementById('showRegister');
            if (showRegisterBtn) {
                showRegisterBtn.addEventListener('click', (event) => {
                    event.preventDefault();
                    toggleView('register');
                    focusFirstInput(registerForm);
                });
            }

            const showLoginBtn = document.getElementById('showLogin');
            if (showLoginBtn) {
                showLoginBtn.addEventListener('click', (event) => {
                    event.preventDefault();
                    toggleView('login');
                    focusFirstInput(loginForm);
                });
            }

            // Support explicit action via URL (e.g., ?action=register)
            const initialAction = new URLSearchParams(window.location.search).get('action');
            if (initialAction === 'register') {
                toggleView('register');
                focusFirstInput(registerForm);
            } else {
                toggleView('login');
                focusFirstInput(loginForm);
            }
        } catch (err) {
            console.warn('setupEventListeners failed:', err);
        }
    }

    setupFormValidation() {
        // Real-time email validation
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            input.addEventListener('blur', () => this.validateEmail(input));
            input.addEventListener('input', () => this.clearValidation(input));
        });

        // Password confirmation validation
        const confirmPassword = document.getElementById('confirmPassword');
        const registerPassword = document.getElementById('registerPassword');

        if (confirmPassword && registerPassword) {
            confirmPassword.addEventListener('input', () => {
                this.validatePasswordMatch(registerPassword, confirmPassword);
            });
            registerPassword.addEventListener('input', () => {
                this.validatePasswordMatch(registerPassword, confirmPassword);
            });
        }
    }

    setupPasswordToggle() {
        const toggleButtons = document.querySelectorAll('[id^="toggle"][id$="Password"]');
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const input = button.closest('.input-group').querySelector('input');
                const icon = button.querySelector('i');

                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.replace('fa-eye', 'fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.replace('fa-eye-slash', 'fa-eye');
                }
            });
        });
    }

    setupPasswordStrength() {
        const registerPassword = document.getElementById('registerPassword');
        if (!registerPassword) return;

        registerPassword.addEventListener('input', (e) => {
            const password = e.target.value;
            const strength = this.calculatePasswordStrength(password);
            this.updatePasswordStrengthUI(strength);
        });
    }

    calculatePasswordStrength(password) {
        let score = 0;
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            numbers: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        Object.values(checks).forEach(check => {
            if (check) score++;
        });

        if (score < 3) return 'weak';
        if (score < 5) return 'medium';
        return 'strong';
    }

    updatePasswordStrengthUI(strength) {
        const strengthElement = document.querySelector('.password-strength');
        const strengthText = document.querySelector('.password-strength-text');

        if (!strengthElement || !strengthText) return;

        // Remove existing classes
        strengthElement.classList.remove('weak', 'medium', 'strong');

        // Add new class
        strengthElement.classList.add(strength);

        // Update text
        const strengthMessages = {
            weak: 'Weak password',
            medium: 'Medium strength',
            strong: 'Strong password'
        };

        strengthText.textContent = strengthMessages[strength] || '';
    }

    validateEmail(input) {
        const email = input.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Exceção para administradores locais - aceitar emails fictícios
        const isAdminLocal = email && (
            email === 'admin@local' ||
            email === 'admin@system' ||
            email === 'admin' ||
            email.startsWith('admin@') && email.length < 20 // IDs admin simples
        );

        if (isAdminLocal) {
            this.setFieldValid(input);
            return true;
        }

        // Validação normal para outros usuários
        if (!email || !emailRegex.test(email)) {
            this.setFieldError(input, 'Please enter a valid email address');
            return false;
        }

        this.setFieldValid(input);
        return true;
    }

    validatePasswordMatch(passwordInput, confirmInput) {
        const password = passwordInput.value;
        const confirm = confirmInput.value;

        if (confirm && password !== confirm) {
            this.setFieldError(confirmInput, 'Passwords do not match');
            return false;
        }

        if (confirm && password === confirm) {
            this.setFieldValid(confirmInput);
        }
        return true;
    }

    setFieldError(input, message) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');

        // Remove existing feedback
        const existingFeedback = input.parentNode.querySelector('.invalid-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }

        // Add error message
        const feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        feedback.textContent = message;
        input.parentNode.appendChild(feedback);
    }

    setFieldValid(input) {
        input.classList.add('is-valid');
        input.classList.remove('is-invalid');

        // Remove error message
        const existingFeedback = input.parentNode.querySelector('.invalid-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }
    }

    clearValidation(input) {
        input.classList.remove('is-invalid', 'is-valid');
        const feedback = input.parentNode.querySelector('.invalid-feedback');
        if (feedback) {
            feedback.remove();
        }
    }

    showForm(formType) {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (formType === 'register') {
            loginForm?.classList.remove('active');
            registerForm?.classList.add('active');
        } else {
            registerForm?.classList.remove('active');
            loginForm?.classList.add('active');
        }

        // Update URL without reload
        const url = new URL(window.location);
        url.searchParams.set('action', formType);
        window.history.pushState({}, '', url);
    }

    async handleLogin(e) {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Basic validation
        if (!email || !password) {
            this.showError('Please fill in all fields');
            return;
        }

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        this.setLoadingState(submitBtn, true);

        try {
            // PRIMEIRO: Verificar se é admin local
            const isAdminLocal = email === 'admin@local' || email === 'admin' ||
                                email.startsWith('admin@') && email.length < 20;

            if (isAdminLocal) {
                // Buscar admin no localStorage
                const users = JSON.parse(localStorage.getItem('gb_users') || '[]');
                const adminUser = users.find(u =>
                    u.email === email ||
                    (u.role === 'admin' && (u.email === 'admin@local' || u.username === 'admin'))
                );

                if (adminUser && adminUser.password === password) {
                    // Login admin local bem-sucedido
                    adminUser.lastLogin = new Date().toISOString();
                    localStorage.setItem('gb_users', JSON.stringify(users));

                    this.currentUser = {
                        id: adminUser.id,
                        name: adminUser.full_name || adminUser.username,
                        full_name: adminUser.full_name || '',
                        email: adminUser.email,
                        role: adminUser.role,
                        registeredAt: adminUser.created_at || new Date().toISOString(),
                        lastLogin: new Date().toISOString(),
                        is_local_admin: true
                    };
                    localStorage.setItem('gb_current_user', JSON.stringify(this.currentUser));

                    // Redirecionar admin para dashboard admin
                    this.setLoadingState(submitBtn, false);
                    this.redirectAdminAfterLogin();
                    return;
                } else {
                    throw new Error('Invalid admin credentials');
                }
            }

            // SEGUNDO: Tentar Supabase para usuários normais
            if (window.supabaseClient && window.supabaseClient.auth) {
                const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
                if (error) throw new Error(error.message || 'Login failed');

                const supaUser = data.user;
                // Normalize and persist user locally for cross-script UI
                this.currentUser = {
                    id: supaUser?.id,
                    name: supaUser?.user_metadata?.full_name || supaUser?.email,
                    full_name: supaUser?.user_metadata?.full_name || '',
                    email: supaUser?.email,
                    registeredAt: supaUser?.created_at || new Date().toISOString(),
                    lastLogin: new Date().toISOString()
                };
                localStorage.setItem('gb_current_user', JSON.stringify(this.currentUser));

                // Best-effort: upsert user profile record in Supabase
                try {
                    await window.supabaseClient
                      .from('user_profiles')
                      .upsert({
                        user_id: supaUser.id,
                        email: supaUser.email,
                        full_name: supaUser.user_metadata?.full_name || '',
                        joined_date: supaUser.created_at || new Date().toISOString(),
                        last_login: new Date().toISOString()
                      });
                } catch (e) {
                    console.warn('Profile upsert skipped:', e?.message || e);
                }
            } else {
                // Fallback: local auth
                // Simulate API delay
                await this.delay(500);
                const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
                if (!user) {
                    throw new Error('Email not found');
                }
                if (user.password !== password) {
                    throw new Error('Incorrect password');
                }
                user.lastLogin = new Date().toISOString();
                this.saveUsers();
                this.currentUser = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    registeredAt: user.registeredAt,
                    lastLogin: user.lastLogin
                };
                localStorage.setItem('gb_current_user', JSON.stringify(this.currentUser));
            }

            if (rememberMe) {
                localStorage.setItem('gb_remember_user', email);
            }

            // Show success
            this.showSuccess('Login successful!', 'Redirecting...');
            // Tracking login (email/password or local)
            try {
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    event: 'user_login',
                    method: 'password',
                    auth_provider: (window.supabaseClient ? 'supabase_email' : 'local'),
                    user_email_domain: (email.split('@')[1]||'')
                });
            } catch (e) { console.warn('user_login tracking failed', e); }

            // Redirect after success
            setTimeout(() => {
                // Verificar se há pagamento pendente
                const pendingPayment = localStorage.getItem('pendingPayment');
                if (pendingPayment) {
                    const paymentData = JSON.parse(pendingPayment);
                    localStorage.removeItem('pendingPayment');

                    // Armazenar email do usuário para o sistema de pagamento
                    localStorage.setItem('userEmail', this.currentUser.email);

                    // Redirecionar para pricing com auto-pagamento
                    window.location.href = toAbsoluteUrl(`pricing.html?auto-pay=${paymentData.planKey}`);
                    return;
                }

                const redirectUrl = resolveRedirectTarget(new URLSearchParams(window.location.search));
                window.location.href = redirectUrl;
            }, 1500);

        } catch (error) {
            const rawMessage = (error && error.message) ? String(error.message) : String(error || '');
            const friendly = this.getFriendlyErrorMessage(rawMessage, 'login');
            this.showError(friendly || rawMessage || 'Login failed. Please try again.');
        } finally {
            this.setLoadingState(submitBtn, false);
        }
    }

    redirectAdminAfterLogin() {
        // Redirecionar admins para o dashboard administrativo
        if (this.currentUser && this.currentUser.role === 'admin') {
            console.log('Redirecting admin to admin dashboard...');
            setTimeout(() => {
                    window.location.href = toAbsoluteUrl('pages/admin/enhanced-admin-dashboard.html');
            }, 1000);
        } else {
            // Para outros usuários, usar redirecionamento normal
            const redirectUrl = resolveRedirectTarget(new URLSearchParams(window.location.search));
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1000);
        }
    }

    async handleRegister(e) {
        e.preventDefault();

        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            this.showError('Please fill out all fields');
            return;
        }

        if (password.length < 6) {
            this.showError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('Passwords do not match');
            return;
        }

        if (!agreeTerms) {
            this.showError('You must agree to the terms of use');
            return;
        }

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        this.setLoadingState(submitBtn, true);

        try {
            // Prefer Supabase sign up when available (sends verification email)
            if (window.supabaseClient && window.supabaseClient.auth) {
                const emailRedirectTo = toAbsoluteUrl('dashboard.html');

                const { data, error } = await window.supabaseClient.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo,
                        data: {
                            full_name: name,
                            phone: document.getElementById('registerPhone')?.value || '',
                            date_of_birth: document.getElementById('registerDob')?.value || ''
                        }
                    }
                });

                if (error) {
                    const message = (error.message || '').toLowerCase();
                    if (message.includes('already been registered') || message.includes('already registered')) {
                        this.showError('An account with this email already exists. Try signing in or use Google login.');
                        // Pré-preencher o email no formulário de login para facilitar o acesso
                        try {
                            document.getElementById('loginEmail').value = email;
                            this.showForm('login');
                        } catch (prefillErr) {
                            console.warn('Login form prefill failed:', prefillErr);
                        }
                        return;
                    }

                    throw new Error(error.message || 'Registration failed');
                }

                // Save email for convenience
                localStorage.setItem('gb_remember_user', email);
                this.showSuccess('Account created successfully!', 'Check your email to verify your account.');
                // Tracking new Supabase email/password registration
                try {
                    window.dataLayer = window.dataLayer || [];
                    window.dataLayer.push({
                        event: 'sign_up',
                        method: 'password',
                        auth_provider: 'supabase_email',
                        user_email_domain: (email.split('@')[1]||'')
                    });
                    if (typeof fbq !== 'undefined') {
                        fbq('track','CompleteRegistration',{content_name:'account_create',method:'password'});
                    }
                } catch(trErr){ console.warn('sign_up tracking (supabase) failed', trErr); }
                // Switch to login form for when user returns
                setTimeout(() => this.showForm('login'), 800);
                return;
            }

            // Fallback: local registration
            await this.delay(800);
            if (this.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
                this.showError('This email is already registered');
                return;
            }
            const newUser = {
                id: this.generateId(),
                name,
                email: email.toLowerCase(),
                password,
                registeredAt: new Date().toISOString(),
                lastLogin: null
            };
            this.users.push(newUser);
            this.saveUsers();
            this.showSuccess('Account created successfully!', 'Signing you in...');
            // Tracking local registration fallback
            try {
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    event: 'sign_up',
                    method: 'local_password',
                    auth_provider: 'local',
                    user_email_domain: (email.split('@')[1]||'')
                });
                if (typeof fbq !== 'undefined') {
                    fbq('track','CompleteRegistration',{content_name:'account_create',method:'local_password'});
                }
            } catch(tr2){ console.warn('sign_up tracking (local) failed', tr2); }
            setTimeout(() => {
                document.getElementById('loginEmail').value = email;
                document.getElementById('loginPassword').value = password;
                this.showForm('login');
                setTimeout(() => {
                    document.getElementById('loginFormElement').dispatchEvent(new Event('submit'));
                }, 300);
            }, 800);

        } catch (error) {
            const rawMessage = (error && error.message) ? String(error.message) : String(error || '');
            const friendly = this.getFriendlyErrorMessage(rawMessage, 'register');
            this.showError(friendly || `Error creating account: ${rawMessage || 'Unknown error'}`);
        } finally {
            this.setLoadingState(submitBtn, false);
        }
    }

    checkAuthStatus() {
        // If user is already logged in, redirect to main site
        if (this.currentUser && window.location.pathname.includes('login.html')) {
            const redirectUrl = resolveRedirectTarget(new URLSearchParams(window.location.search));
            window.location.href = redirectUrl;
            return;
        }

        // Auto-fill remembered email
        const rememberedEmail = localStorage.getItem('gb_remember_user');
        if (rememberedEmail) {
            const emailInput = document.getElementById('loginEmail');
            if (emailInput) {
                emailInput.value = rememberedEmail;
                document.getElementById('rememberMe').checked = true;
            }
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    saveUsers() {
        localStorage.setItem('gb_users', JSON.stringify(this.users));
    }

    setLoadingState(button, isLoading) {
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    getFriendlyErrorMessage(message, context = 'generic') {
        if (!message) return null;
        const normalized = message.toLowerCase();

        const templates = [
            {
                match: ['invalid login credentials', 'invalid email or password', 'wrong email or password', 'credenciais inválidas'],
                text: 'Incorrect email or password. Please double-check your credentials and try again.'
            },
            {
                match: ['email not confirmed', 'email needs to be confirmed', 'user has not been confirmed'],
                text: "Email not confirmed yet. Check your inbox (and spam folder) for the confirmation email or request a new link via 'Forgot password'."
            },
            {
                match: ['user not found', 'email not found', 'no user found', 'invalid email'],
                text: 'Account not found. Create a new account or verify that the email address is correct.'
            },
            {
                match: ['too many requests', 'rate limit', '429'],
                text: 'Too many attempts in a short time. Wait a moment before trying again.'
            },
            {
                match: ['network error', 'fetch failed', 'failed to fetch', 'network request failed'],
                text: 'Network issue detected. Check your connection and try again.'
            }
        ];

        for (const tpl of templates) {
            if (tpl.match.some((needle) => normalized.includes(needle))) {
                return tpl.text;
            }
        }

        if (context === 'register' && normalized.includes('already')) {
            return 'This email is already registered. Use the login form or reset your password.';
        }

        return null;
    }

    showSuccess(title, message = '') {
        document.getElementById('successTitle').textContent = title;
        document.getElementById('successMessage').textContent = message;

        const modal = new bootstrap.Modal(document.getElementById('successModal'));
        modal.show();
    }

    showError(message) {
        try {
            document.getElementById('errorTitle').textContent = 'Error!';
            document.getElementById('errorMessage').textContent = message;
            const modalEl = document.getElementById('errorModal');
            if (modalEl && window.bootstrap && typeof bootstrap.Modal === 'function') {
                const modal = new bootstrap.Modal(modalEl);
                modal.show();
            }
        } catch {}
        // Inline fallback for environments where Bootstrap modal isn’t available yet
        if (typeof showAuthMessage === 'function') {
            showAuthMessage(message, 'danger');
        } else {
            console.error('[Auth Error]', message);
            try { alert(message); } catch {}
        }
    }

    switchLanguage(lang) {
        localStorage.setItem('gb_language', lang);

        // Update current language display
        document.getElementById('currentLang').textContent = lang.toUpperCase();

        // Apply translations if available
        if (typeof applyTranslations === 'function') {
            applyTranslations(lang);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Public methods for external use
    static getCurrentUser() {
        // Prefer local cached user for sync speed
        const cached = JSON.parse(localStorage.getItem('gb_current_user') || 'null');
        return cached;
    }

    static isLoggedIn() {
        return !!AuthSystem.getCurrentUser();
    }

    static async logout() {
        try {
            if (window.supabaseClient && window.supabaseClient.auth) {
                await window.supabaseClient.auth.signOut();
            } else if (window.supabase && window.supabase.auth) {
                await window.supabase.auth.signOut();
            }
        } catch (e) {
            console.warn('Supabase signOut error (ignored):', e?.message || e);
        } finally {
            localStorage.removeItem('gb_current_user');
            localStorage.removeItem('gb_remember_user');
            window.location.href = toAbsoluteUrl('pages/auth/login.html');
        }
    }

    static requireAuth() {
        if (!AuthSystem.isLoggedIn()) {
            const currentUrl = window.location.pathname + window.location.search + window.location.hash;
            window.location.href = `${toAbsoluteUrl('pages/auth/login.html')}?redirect=${encodeURIComponent(currentUrl)}`;
            return false;
        }
        return true;
    }
}

// OAUTH SOCIAL LOGIN - INDEPENDENTE DE FORMULÁRIOS
function setupSocialLogin() {
    console.log('🔧 Configurando login social...');

    // Aguardar Supabase estar disponível
    let attempts = 0;
    const maxAttempts = 20; // ~10s
    const waitForSupabase = () => {
        if (!window.supabaseClient) {
            attempts++;
            if (attempts % 2 === 1) {
                // reduzir spam no console
                console.warn('⏳ Aguardando Supabase...');
            }
            if (attempts >= maxAttempts) {
                console.error('❌ Supabase não inicializou. Verifique env-config.json e a conexão.');
                showAuthMessage('Falha ao iniciar autenticação. Verifique sua conexão ou tente recarregar a página.', 'danger');
                return;
            }
            setTimeout(waitForSupabase, 500);
            return;
        }

        console.log('✅ Supabase disponível, configurando OAuth...');
        setupOAuthButtons();
    };

    waitForSupabase();
}

function setupOAuthButtons() {
    // URLs de redirecionamento conforme documentação Supabase
    const baseUrl = computeSiteBaseUrl();

    // Redirect para dashboard.html após login (destino final)
    // IMPORTANTE: Esta URL deve estar em Supabase > Authentication > URL Configuration > Redirect URLs
    const redirectTo = `${baseUrl}/dashboard.html`;

    console.log('🔗 OAuth redirect URL configurada:', redirectTo);

    // GOOGLE OAUTH - Seguindo documentação oficial
    const setupGoogleButton = (btnId) => {
        const btn = document.getElementById(btnId);
        if (!btn) return;

        if (btn.dataset.useModule === 'true') {
            console.log(`🔵 Botão Google ${btnId} gerenciado pelo módulo dedicado; ignorando handler legacy.`);
            return;
        }

        console.log(`🔵 Configurando botão Google: ${btnId}`);

        // Limpar listeners anteriores
        const newBtn = btn.cloneNode(true);
        btn.replaceWith(newBtn);

        newBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            console.log('🚀 Iniciando Google OAuth...');

            try {
                newBtn.disabled = true;
                newBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Conectando ao Google...';

                // Chamada OAuth conforme documentação Supabase v2
                // Remover skipBrowserRedirect - deixar Supabase redirecionar automaticamente
                const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: redirectTo,
                        queryParams: {
                            access_type: 'offline',
                            prompt: 'consent'
                        }
                    }
                });

                if (error) {
                    console.error('❌ Erro ao iniciar Google OAuth:', error);
                    throw error;
                }

                // O Supabase SDK já redirecionou automaticamente para Google
                console.log('✅ Redirecionamento Google iniciado');

            } catch (error) {
                console.error('❌ Falha no Google OAuth:', error);
                showAuthMessage(`Erro ao conectar com Google: ${error.message}`, 'danger');
                newBtn.disabled = false;
                newBtn.innerHTML = '<i class="fab fa-google me-2"></i>Continuar com Google';
            }
        });
    };

    // FACEBOOK OAUTH - Seguindo documentação oficial
    const setupFacebookButton = (btnId) => {
        const btn = document.getElementById(btnId);
        if (!btn) return;

        console.log(`🔷 Configurando botão Facebook: ${btnId}`);

        // Limpar listeners anteriores
        const newBtn = btn.cloneNode(true);
        btn.replaceWith(newBtn);

        newBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            console.log('🚀 Iniciando Facebook OAuth...');

            try {
                newBtn.disabled = true;
                newBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Conectando ao Facebook...';

                // Chamada OAuth conforme documentação Supabase v2
                // Remover skipBrowserRedirect - deixar Supabase redirecionar automaticamente
                const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
                    provider: 'facebook',
                    options: {
                        redirectTo: redirectTo,
                        scopes: 'email'
                    }
                });

                if (error) {
                    console.error('❌ Erro ao iniciar Facebook OAuth:', error);
                    throw error;
                }

                // O Supabase SDK já redirecionou automaticamente para Facebook
                console.log('✅ Redirecionamento Facebook iniciado');

            } catch (error) {
                console.error('❌ Falha no Facebook OAuth:', error);
                showAuthMessage(`Erro ao conectar com Facebook: ${error.message}`, 'danger');
                newBtn.disabled = false;
                newBtn.innerHTML = '<i class="fab fa-facebook-f me-2"></i>Continuar com Facebook';
            }
        });
    };

    // Configurar todos os botões Google e Facebook
    setupGoogleButton('login-with-google');
    setupGoogleButton('google-btn-register');
    setupFacebookButton('facebook-btn-login');
    setupFacebookButton('facebook-btn-register');
}

// Helper function para mostrar mensagens de erro/sucesso
function showAuthMessage(message, type = 'info') {
    const authMsg = document.getElementById('auth-msg');
    if (authMsg) {
        authMsg.className = `alert alert-${type}`;
        authMsg.innerHTML = `<i class="fas fa-${type === 'danger' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>${message}`;
        authMsg.classList.remove('d-none');

        // Auto-hide após 5 segundos
        setTimeout(() => {
            if (authMsg) {
                authMsg.classList.add('d-none');
            }
        }, 5000);
    }
}

// Initialize auth system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando sistema de autenticação...');
    window.authSystem = new AuthSystem();

    // Default language to English if unset
    const lang = localStorage.getItem('gb_language') || 'en';
    try {
        document.getElementById('currentLang').textContent = (lang || 'en').toUpperCase();
    } catch {}
    if (typeof applyTranslations === 'function') {
        applyTranslations(lang);
    }

    // Sync Supabase session user to local cache so other scripts (auth-guard) see it
    (async () => {
        try {
            if (window.supabaseClient && window.supabaseClient.auth) {
                // Verificar se há tokens OAuth na URL (retorno de Google/Facebook)
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const hasOAuthTokens = hashParams.has('access_token') || hashParams.has('error');
                
                if (hasOAuthTokens) {
                    console.log('🔐 Processando retorno OAuth...');
                    showAuthMessage('Processando login...', 'info');
                }
                
                const { data } = await window.supabaseClient.auth.getUser();
                const u = data?.user;
                if (u) {
                    const normalized = {
                        id: u.id,
                        name: u.user_metadata?.full_name || u.email,
                        full_name: u.user_metadata?.full_name || '',
                        email: u.email,
                        registeredAt: u.created_at || new Date().toISOString(),
                        lastLogin: new Date().toISOString()
                    };
                    localStorage.setItem('gb_current_user', JSON.stringify(normalized));
                }

                // Listen for auth state changes (OAuth redirects, logout in other tabs)
                window.supabaseClient.auth.onAuthStateChange(async (event, session) => {
                    console.log(`🔔 Auth state changed: ${event}`, session?.user?.email || 'no user');
                    
                    try {
                        if (event === 'SIGNED_IN' && session?.user) {
                            const su = session.user;
                            const norm = {
                                id: su.id,
                                name: su.user_metadata?.full_name || su.email,
                                full_name: su.user_metadata?.full_name || '',
                                email: su.email,
                                registeredAt: su.created_at || new Date().toISOString(),
                                lastLogin: new Date().toISOString()
                            };
                            localStorage.setItem('gb_current_user', JSON.stringify(norm));
                            
                            // Ensure user profile is upserted in Supabase after OAuth/social login
                            try {
                                await window.supabaseClient
                                  .from('user_profiles')
                                  .upsert({
                                    user_id: su.id,
                                    email: su.email,
                                    full_name: su.user_metadata?.full_name || '',
                                    joined_date: su.created_at || new Date().toISOString(),
                                    last_login: new Date().toISOString()
                                  });
                            } catch (e) {
                                console.warn('Profile upsert (OAuth) skipped:', e?.message || e);
                            }
                            
                            // OAuth / external provider tracking
                            try {
                                window.dataLayer = window.dataLayer || [];
                                const provider = (su.app_metadata && su.app_metadata.provider) || 'oauth';
                                window.dataLayer.push({
                                    event: 'user_login',
                                    method: provider,
                                    auth_provider: provider,
                                    user_email_domain: (su.email||'').split('@')[1] || ''
                                });
                                const createdTs = new Date(su.created_at).getTime();
                                if (Date.now() - createdTs < 10000) { // approx new user window
                                    window.dataLayer.push({
                                        event: 'sign_up',
                                        method: provider,
                                        auth_provider: provider,
                                        user_email_domain: (su.email||'').split('@')[1] || ''
                                    });
                                    if (typeof fbq !== 'undefined') {
                                        fbq('track','CompleteRegistration',{content_name:'account_create',method:provider});
                                    }
                                }
                            } catch(oauthErr){ console.warn('OAuth tracking failed', oauthErr); }

                            // Se estiver na página de login E houver hash de OAuth na URL, redirecionar
                            if (window.location.pathname.includes('login.html')) {
                                console.log('✅ Login OAuth bem-sucedido! Redirecionando para dashboard...');
                                
                                // Verificar se há pagamento pendente
                                const pendingPayment = localStorage.getItem('pendingPayment');
                                if (pendingPayment) {
                                    const paymentData = JSON.parse(pendingPayment);
                                    localStorage.removeItem('pendingPayment');
                                    localStorage.setItem('userEmail', norm.email);
                                    setTimeout(() => {
                                        window.location.href = toAbsoluteUrl(`pricing.html?auto-pay=${paymentData.planKey}`);
                                    }, 1000);
                                    return;
                                }
                                
                                // Redirecionar para dashboard ou URL solicitada
                                const redirectUrl = resolveRedirectTarget(new URLSearchParams(window.location.search));
                                setTimeout(() => {
                                    window.location.href = redirectUrl;
                                }, 1000);
                            }
                        }
                        if (event === 'SIGNED_OUT') {
                            localStorage.removeItem('gb_current_user');
                        }
                    } catch (e) {
                        console.warn('onAuthStateChange handler error:', e?.message || e);
                    }
                });
            }
        } catch (e) {
            console.warn('Supabase getUser failed:', e?.message || e);
        }
    })();

    // Setup social login - aguardar um pouco para garantir que tudo carregou
    setTimeout(() => {
        console.log('🔧 Configurando login social...');
        setupSocialLogin();
    }, 1000);
});

// Também tentar configurar quando a página carrega completamente
window.addEventListener('load', () => {
    setTimeout(() => {
        if (typeof setupSocialLogin === 'function') {
            console.log('🔄 Re-configurando login social após load...');
            setupSocialLogin();
        }
    }, 500);
});

// Export for external use
window.AuthSystem = AuthSystem;
