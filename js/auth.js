// Authentication System - Garcia Builder
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
    }

    setupEventListeners() {
        // Form switching
        document.getElementById('showRegister')?.addEventListener('click', () => this.showForm('register'));
        document.getElementById('showLogin')?.addEventListener('click', () => this.showForm('login'));

        // Form submissions - APENAS para formulários tradicionais
        const loginForm = document.getElementById('loginFormElement');
        const registerForm = document.getElementById('registerFormElement');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                // Permitir OAuth buttons sem validação
                if (e.submitter && e.submitter.id && (e.submitter.id.includes('google') || e.submitter.id.includes('facebook'))) {
                    return; // Deixa OAuth passar sem validação
                }
                this.handleLogin(e);
            });
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                // Permitir OAuth buttons sem validação
                if (e.submitter && e.submitter.id && (e.submitter.id.includes('google') || e.submitter.id.includes('facebook'))) {
                    return; // Deixa OAuth passar sem validação
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
            weak: 'Senha fraca',
            medium: 'Senha média',
            strong: 'Senha forte'
        };

        strengthText.textContent = strengthMessages[strength] || '';
    }

    validateEmail(input) {
        const email = input.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email || !emailRegex.test(email)) {
            this.setFieldError(input, 'Por favor, insira um email válido');
            return false;
        }

        this.setFieldValid(input);
        return true;
    }

    validatePasswordMatch(passwordInput, confirmInput) {
        const password = passwordInput.value;
        const confirm = confirmInput.value;

        if (confirm && password !== confirm) {
            this.setFieldError(confirmInput, 'As senhas não coincidem');
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
            this.showError('Por favor, preencha todos os campos');
            return;
        }

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        this.setLoadingState(submitBtn, true);

        try {
            // Simulate API delay
            await this.delay(1000);

            // Find user
            const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());

            if (!user) {
                throw new Error('Email não encontrado');
            }

            // Check password (in production, use proper hashing)
            if (user.password !== password) {
                throw new Error('Senha incorreta');
            }

            // Update last login
            user.lastLogin = new Date().toISOString();
            this.saveUsers();

            // Set current user
            this.currentUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                registeredAt: user.registeredAt,
                lastLogin: user.lastLogin
            };

            // Save to localStorage
            localStorage.setItem('gb_current_user', JSON.stringify(this.currentUser));

            if (rememberMe) {
                localStorage.setItem('gb_remember_user', email);
            }

            // Show success
            this.showSuccess('Login realizado com sucesso!', 'Redirecionando...');

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
                    window.location.href = `pricing.html?auto-pay=${paymentData.planKey}`;
                    return;
                }

                const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || 'index.html';
                window.location.href = redirectUrl;
            }, 1500);

        } catch (error) {
            this.showError(error.message);
        } finally {
            this.setLoadingState(submitBtn, false);
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
            this.showError('Por favor, preencha todos os campos');
            return;
        }

        if (password.length < 6) {
            this.showError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('As senhas não coincidem');
            return;
        }

        if (!agreeTerms) {
            this.showError('Você deve concordar com os termos de uso');
            return;
        }

        // Check if email already exists
        if (this.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            this.showError('Este email já está cadastrado');
            return;
        }

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        this.setLoadingState(submitBtn, true);

        try {
            // Simulate API delay
            await this.delay(1500);

            // Create new user
            const newUser = {
                id: this.generateId(),
                name,
                email: email.toLowerCase(),
                password, // In production, hash this!
                registeredAt: new Date().toISOString(),
                lastLogin: null
            };

            // Add to users array
            this.users.push(newUser);
            this.saveUsers();

            // Show success and auto-login
            this.showSuccess('Conta criada com sucesso!', 'Fazendo login automaticamente...');

            // Auto-login
            setTimeout(() => {
                document.getElementById('loginEmail').value = email;
                document.getElementById('loginPassword').value = password;
                this.showForm('login');

                // Trigger login after form switch
                setTimeout(() => {
                    document.getElementById('loginFormElement').dispatchEvent(new Event('submit'));
                }, 300);
            }, 1500);

        } catch (error) {
            this.showError('Erro ao criar conta: ' + error.message);
        } finally {
            this.setLoadingState(submitBtn, false);
        }
    }

    checkAuthStatus() {
        // If user is already logged in, redirect to main site
        if (this.currentUser && window.location.pathname.includes('login.html')) {
            const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || 'index.html';
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

    showSuccess(title, message = '') {
        document.getElementById('successTitle').textContent = title;
        document.getElementById('successMessage').textContent = message;

        const modal = new bootstrap.Modal(document.getElementById('successModal'));
        modal.show();
    }

    showError(message) {
        document.getElementById('errorTitle').textContent = 'Erro!';
        document.getElementById('errorMessage').textContent = message;

        const modal = new bootstrap.Modal(document.getElementById('errorModal'));
        modal.show();
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
        return JSON.parse(localStorage.getItem('gb_current_user') || 'null');
    }

    static isLoggedIn() {
        return !!AuthSystem.getCurrentUser();
    }

    static logout() {
        localStorage.removeItem('gb_current_user');
        localStorage.removeItem('gb_remember_user');
        window.location.href = 'login.html';
    }

    static requireAuth() {
        if (!AuthSystem.isLoggedIn()) {
            const currentUrl = encodeURIComponent(window.location.pathname);
            window.location.href = `login.html?redirect=${currentUrl}`;
            return false;
        }
        return true;
    }
}

// OAUTH SOCIAL LOGIN - INDEPENDENTE DE FORMULÁRIOS
function setupSocialLogin() {
    console.log('🔧 Configurando login social...');

    // Aguardar Supabase estar disponível
    const waitForSupabase = () => {
        if (!window.supabaseClient) {
            console.warn('⏳ Aguardando Supabase...');
            setTimeout(waitForSupabase, 500);
            return;
        }

        console.log('✅ Supabase disponível, configurando OAuth...');
        setupOAuthButtons();
    };

    waitForSupabase();
}

function setupOAuthButtons() {
    // URLs de redirecionamento
    const currentHost = window.location.origin;
    const isLocal = currentHost.includes('localhost') || currentHost.includes('127.0.0.1');
    const redirectTo = isLocal
        ? `${currentHost}/dashboard.html`
        : `https://andrejulio072.github.io/Garcia-Builder/dashboard.html`;

    console.log('🔗 OAuth redirect URL:', redirectTo);

    // GOOGLE OAUTH - COMPLETAMENTE INDEPENDENTE
    const setupGoogleButton = (btnId) => {
        const btn = document.getElementById(btnId);
        if (!btn) return;

        console.log(`🔵 Configurando botão Google: ${btnId}`);

        // Remover todos os listeners existentes
        btn.replaceWith(btn.cloneNode(true));
        const newBtn = document.getElementById(btnId);

        newBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            console.log('� CLIQUE NO GOOGLE - INICIANDO OAUTH');

            try {
                newBtn.disabled = true;
                newBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Redirecionando para Google...';

                const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: redirectTo,
                        queryParams: {
                            access_type: 'offline',
                            prompt: 'select_account'
                        }
                    }
                });

                if (error) {
                    console.error('❌ Erro Google OAuth:', error);
                    throw error;
                }

                console.log('✅ Google OAuth iniciado com sucesso!');

            } catch (error) {
                console.error('❌ Falha no Google OAuth:', error);
                showAuthMessage(`Erro no login Google: ${error.message}`, 'danger');
                newBtn.disabled = false;
                newBtn.innerHTML = '<i class="fab fa-google me-2"></i>Continuar com Google';
            }
        });
    };

    // Configurar todos os botões Google
    setupGoogleButton('google-btn-login');
    setupGoogleButton('google-btn-register');

    // FACEBOOK OAUTH - COMPLETAMENTE INDEPENDENTE
    const setupFacebookButton = (btnId) => {
        const btn = document.getElementById(btnId);
        if (!btn) return;

        console.log(`🔷 Configurando botão Facebook: ${btnId}`);

        // Remover todos os listeners existentes
        btn.replaceWith(btn.cloneNode(true));
        const newBtn = document.getElementById(btnId);

        newBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            console.log('� CLIQUE NO FACEBOOK - INICIANDO OAUTH');

            try {
                newBtn.disabled = true;
                newBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Redirecionando para Facebook...';

                const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
                    provider: 'facebook',
                    options: {
                        redirectTo: redirectTo,
                        queryParams: {
                            scope: 'email'
                        }
                    }
                });

                if (error) {
                    console.error('❌ Erro Facebook OAuth:', error);
                    throw error;
                }

                console.log('✅ Facebook OAuth iniciado com sucesso!');

            } catch (error) {
                console.error('❌ Falha no Facebook OAuth:', error);
                showAuthMessage(`Erro no login Facebook: ${error.message}`, 'danger');
                newBtn.disabled = false;
                newBtn.innerHTML = '<i class="fab fa-facebook-f me-2"></i>Continuar com Facebook';
            }
        });
    };

    // Configurar todos os botões Facebook
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
