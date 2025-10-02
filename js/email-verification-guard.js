// Email Verification Guard - Protects pages requiring verified email
(() => {
    let emailVerificationGuard = null;

    class EmailVerificationGuard {
        constructor() {
            this.init();
        }

        async init() {
            console.log('🔐 Initializing Email Verification Guard...');

            // Check if user needs email verification
            const needsVerification = await this.checkEmailVerification();

            if (needsVerification) {
                this.showEmailVerificationRequired();
            } else {
                console.log('✅ Email verification check passed');
            }
        }

        async checkEmailVerification() {
            try {
                // Check if we're on a page that requires verification
                const protectedPages = [
                    'dashboard.html',
                    'enhanced-dashboard.html',
                    'my-profile.html',
                    'trainer-dashboard.html',
                    'admin-dashboard.html',
                    'enhanced-admin-dashboard.html'
                ];

                const currentPage = window.location.pathname.split('/').pop();
                if (!protectedPages.includes(currentPage)) {
                    return false; // Page doesn't require verification
                }

                // Skip verification in dev mode
                const isLocal = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1');
                const isDev = new URLSearchParams(window.location.search).get('dev') === '1';
                if (isLocal && isDev) {
                    console.log('🔧 Dev mode: Skipping email verification');
                    return false;
                }

                // Check if Supabase is available
                if (!window.supabaseClient || !window.supabaseClient.auth) {
                    console.warn('Supabase not available, skipping email verification');
                    return false;
                }

                // Get current user from Supabase
                const { data: { user }, error } = await window.supabaseClient.auth.getUser();

                if (error) {
                    console.error('Error getting user:', error);
                    // Redirect to login if there's an auth error
                    window.location.href = 'login.html';
                    return true;
                }

                if (!user) {
                    console.log('No user found, redirecting to login');
                    window.location.href = 'login.html';
                    return true;
                }

                // Check if email is confirmed
                if (!user.email_confirmed_at) {
                    console.log('Email not confirmed for user:', user.email);
                    return true; // Need verification
                }

                console.log('✅ Email verified for user:', user.email);
                return false; // No verification needed

            } catch (error) {
                console.error('Error checking email verification:', error);
                return false; // Don't block on errors
            }
        }

        showEmailVerificationRequired() {
            // Load translations if available
            const t = window.i18n && window.i18n.t ? window.i18n.t : (key) => {
                // Fallback English translations
                const fallbacks = {
                    'email_verification_required': 'Email Verification Required',
                    'email_verification_message': 'To access the dashboard, please verify your email address. We\'ve sent a verification link to your email.',
                    'resend_verification': 'Resend Email',
                    'check_verification': 'I\'ve Verified',
                    'verification_trouble': 'Having trouble? Check your spam folder or contact support.',
                    'logout_try_different': 'Logout and try different email'
                };
                return fallbacks[key] || key;
            };

            // Create overlay
            const overlay = document.createElement('div');
            overlay.id = 'email-verification-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Poppins', sans-serif;
            `;

            // Create modal
            const modal = document.createElement('div');
            modal.style.cssText = `
                background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                padding: 40px;
                border-radius: 20px;
                max-width: 500px;
                width: 90%;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(246, 200, 78, 0.2);
            `;

            modal.innerHTML = `
                <div style="margin-bottom: 30px;">
                    <i class="fas fa-envelope-circle-check" style="font-size: 4rem; color: #f6c84e; margin-bottom: 20px;"></i>
                    <h2 style="color: white; margin-bottom: 15px; font-weight: 600;">${t('email_verification_required')}</h2>
                    <p style="color: #ccc; line-height: 1.6; margin-bottom: 25px;">
                        ${t('email_verification_message')}
                    </p>
                </div>

                <div style="margin-bottom: 30px;">
                    <button id="resend-verification-btn" class="btn" style="
                        background: linear-gradient(45deg, #f6c84e, #ffd700);
                        border: none;
                        color: #1a1a1a;
                        padding: 12px 30px;
                        border-radius: 25px;
                        font-weight: 600;
                        margin-right: 15px;
                        cursor: pointer;
                    ">
                        <i class="fas fa-paper-plane" style="margin-right: 8px;"></i>
                        ${t('resend_verification')}
                    </button>

                    <button id="check-verification-btn" class="btn" style="
                        background: transparent;
                        border: 2px solid #f6c84e;
                        color: #f6c84e;
                        padding: 12px 30px;
                        border-radius: 25px;
                        font-weight: 600;
                        margin-right: 15px;
                        cursor: pointer;
                    ">
                        <i class="fas fa-sync" style="margin-right: 8px;"></i>
                        ${t('check_verification')}
                    </button>
                </div>

                <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 20px;">
                    <p style="color: #888; font-size: 0.9rem; margin-bottom: 15px;">
                        ${t('verification_trouble')}
                    </p>
                    <button id="logout-verification-btn" style="
                        background: none;
                        border: none;
                        color: #888;
                        text-decoration: underline;
                        cursor: pointer;
                        font-size: 0.9rem;
                    ">
                        ${t('logout_try_different')}
                    </button>
                </div>

                <div id="verification-message" style="margin-top: 20px; font-size: 0.9rem;"></div>
            `;

            overlay.appendChild(modal);
            document.body.appendChild(overlay);

            // Setup event listeners
            this.setupVerificationEventListeners();
        }

        setupVerificationEventListeners() {
            // Resend verification email
            document.getElementById('resend-verification-btn')?.addEventListener('click', async () => {
                await this.resendVerificationEmail();
            });

            // Check if verification completed
            document.getElementById('check-verification-btn')?.addEventListener('click', async () => {
                await this.checkVerificationStatus();
            });

            // Logout
            document.getElementById('logout-verification-btn')?.addEventListener('click', async () => {
                await this.logoutUser();
            });
        }

        async resendVerificationEmail() {
            const t = window.i18n && window.i18n.t ? window.i18n.t : (key) => {
                const fallbacks = {
                    'sending_verification': 'Sending verification email...',
                    'verification_email_sent': 'Verification email sent!',
                    'verification_check_inbox': 'Check your inbox and click the verification link'
                };
                return fallbacks[key] || key;
            };

            try {
                const messageDiv = document.getElementById('verification-message');
                messageDiv.innerHTML = `<div style="color: #ffc107;"><i class="fas fa-spinner fa-spin"></i> ${t('sending_verification')}</div>`;

                const { data: { user } } = await window.supabaseClient.auth.getUser();
                if (!user) {
                    throw new Error('No user found');
                }

                const { error } = await window.supabaseClient.auth.resend({
                    type: 'signup',
                    email: user.email,
                    options: {
                        emailRedirectTo: `${window.location.origin}/dashboard.html`
                    }
                });

                if (error) throw error;

                messageDiv.innerHTML = `
                    <div style="color: #28a745;">
                        <i class="fas fa-check-circle"></i>
                        ${t('verification_email_sent')}<br>
                        ${t('verification_check_inbox')}
                    </div>
                `;

            } catch (error) {
                console.error('Error resending verification:', error);
                document.getElementById('verification-message').innerHTML = `
                    <div style="color: #dc3545;">
                        <i class="fas fa-exclamation-circle"></i>
                        Error: ${error.message}
                    </div>
                `;
            }
        }

        async checkVerificationStatus() {
            const t = window.i18n && window.i18n.t ? window.i18n.t : (key) => {
                const fallbacks = {
                    'checking_verification': 'Checking verification status...',
                    'email_verified_success': 'Email verified! Redirecting...',
                    'email_not_verified_yet': 'Email not yet verified. Please check your email and click the verification link.'
                };
                return fallbacks[key] || key;
            };

            try {
                const messageDiv = document.getElementById('verification-message');
                messageDiv.innerHTML = `<div style="color: #ffc107;"><i class="fas fa-spinner fa-spin"></i> ${t('checking_verification')}</div>`;

                // Refresh user data from Supabase
                const { data: { user }, error } = await window.supabaseClient.auth.getUser();

                if (error) throw error;

                if (user && user.email_confirmed_at) {
                    messageDiv.innerHTML = `
                        <div style="color: #28a745;">
                            <i class="fas fa-check-circle"></i>
                            ${t('email_verified_success')}
                        </div>
                    `;

                    // Remove overlay and reload page
                    setTimeout(() => {
                        document.getElementById('email-verification-overlay')?.remove();
                        window.location.reload();
                    }, 1500);
                } else {
                    messageDiv.innerHTML = `
                        <div style="color: #ffc107;">
                            <i class="fas fa-clock"></i>
                            ${t('email_not_verified_yet')}
                        </div>
                    `;
                }

            } catch (error) {
                console.error('Error checking verification:', error);
                document.getElementById('verification-message').innerHTML = `
                    <div style="color: #dc3545;">
                        <i class="fas fa-exclamation-circle"></i>
                        Error: ${error.message}
                    </div>
                `;
            }
        }

        async logoutUser() {
            try {
                if (window.supabaseClient && window.supabaseClient.auth) {
                    await window.supabaseClient.auth.signOut();
                }

                // Clear local storage
                localStorage.removeItem('garcia_current_user');
                localStorage.removeItem('gb_current_user');

                // Redirect to login
                window.location.href = 'login.html';

            } catch (error) {
                console.error('Error logging out:', error);
                window.location.href = 'login.html';
            }
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            emailVerificationGuard = new EmailVerificationGuard();
        });
    } else {
        emailVerificationGuard = new EmailVerificationGuard();
    }

    // Export for external access
    window.EmailVerificationGuard = EmailVerificationGuard;

})();
