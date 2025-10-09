// Authentication Guard - Protect pages that require login

class AuthGuard {
    constructor() {
        this.init();
    }

    init() {
        this.addUserMenuToNavbar();
        this.protectRestrictedContent();
        this.addLoginPrompts();
        this.setupCompactNavbar();
    }

    addUserMenuToNavbar() {
        console.log('AuthGuard: Adding user menu to navbar');
        const currentUser = AuthSystem.getCurrentUser();
        console.log('AuthGuard: Current user:', currentUser);

        // Try to find the auth-buttons container first
        let userMenu = document.querySelector('#auth-buttons');
        console.log('AuthGuard: Found #auth-buttons container:', !!userMenu);

    // Note: Compact navbar will control which links stay inline; no special-case visibility here

        // If not found, fall back to the old method
        if (!userMenu) {
            const navbar = document.querySelector('.navbar .container');
            if (!navbar) return;

            userMenu = navbar.querySelector('.user-menu');

            if (!userMenu) {
                userMenu = document.createElement('div');
                userMenu.className = 'user-menu ms-auto';

                // Insert before language switcher
                const langDropdown = navbar.querySelector('#languageDropdown');
                if (langDropdown) {
                    langDropdown.parentNode.parentNode.insertBefore(userMenu, langDropdown.parentNode);
                } else {
                    navbar.appendChild(userMenu);
                }
            }
        }

        if (currentUser) {

            const firstName = (currentUser.name || currentUser.full_name || currentUser.email || 'User').toString().split(' ')[0];
            const displayName = (currentUser.name || currentUser.full_name || currentUser.email || 'User');
            const displayEmail = currentUser.email || '';

            // User is logged in - show enhanced user menu
            userMenu.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-gold btn-sm dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown" aria-expanded="false" style="font-weight: 600; padding: 8px 16px;">
                        <i class="fas fa-user-circle" style="font-size: 1.2rem;"></i>
                        <span class="d-none d-sm-inline">${firstName}</span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-lg" style="min-width: 280px; border-radius: 12px; border: 1px solid rgba(246, 200, 78, 0.2); background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);">
                        <li>
                            <div class="dropdown-item-text" style="padding: 12px 16px; border-bottom: 1px solid rgba(246, 200, 78, 0.1);">
                                <div class="fw-bold text-gold" style="font-size: 1.05rem; margin-bottom: 4px;">${displayName}</div>
                                <small class="text-muted" style="font-size: 0.85rem;">${displayEmail}</small>
                            </div>
                        </li>
                        <li><hr class="dropdown-divider" style="border-color: rgba(246, 200, 78, 0.1); margin: 0;"></li>
                        <li>
                            <a class="dropdown-item d-flex align-items-center gap-2" href="dashboard.html" style="padding: 10px 16px; transition: all 0.2s;">
                                <i class="fas fa-tachometer-alt" style="width: 20px; color: #F6C84E;"></i>
                                <span>${this.getTranslation('nav.dashboard') || 'Dashboard'}</span>
                            </a>
                        </li>
                        <li>
                            <a class="dropdown-item d-flex align-items-center gap-2" href="my-profile.html" style="padding: 10px 16px; transition: all 0.2s;">
                                <i class="fas fa-user" style="width: 20px; color: #F6C84E;"></i>
                                <span>${this.getTranslation('nav.profile') || 'My Profile'}</span>
                            </a>
                        </li>
                        <li><hr class="dropdown-divider" style="border-color: rgba(246, 200, 78, 0.1); margin: 8px 0;"></li>
                        <li>
                            <button class="dropdown-item d-flex align-items-center gap-2 text-danger" onclick="AuthGuard.handleLogout(event)" style="padding: 10px 16px; transition: all 0.2s;">
                                <i class="fas fa-sign-out-alt" style="width: 20px;"></i>
                                <span>${this.getTranslation('nav.logout') || 'Logout'}</span>
                            </button>
                        </li>
                    </ul>
                </div>
            `;
        } else {

            // User not logged in - show enhanced login/register buttons
            const loginText = this.getTranslation('nav.login') || 'Login';
            const registerText = this.getTranslation('nav.register') || 'Register';

            userMenu.innerHTML = `
                <div class="d-flex gap-2 align-items-center">
                    <a href="login.html?action=login" class="btn btn-outline-light btn-sm d-flex align-items-center gap-2" style="border-color: #F6C84E; color: #F6C84E; padding: 8px 16px; font-weight: 500; transition: all 0.3s; border-radius: 8px;">
                        <i class="fas fa-sign-in-alt"></i>
                        <span>${loginText}</span>
                    </a>
                    <a href="login.html?action=register" class="btn btn-sm d-flex align-items-center gap-2" style="background: linear-gradient(135deg, #F6C84E 0%, #e6b73e 100%); border: none; color: #000; font-weight: 600; padding: 8px 16px; transition: all 0.3s; border-radius: 8px; box-shadow: 0 2px 8px rgba(246, 200, 78, 0.3);">
                        <i class="fas fa-user-plus"></i>
                        <span>${registerText}</span>
                    </a>
                </div>
            `;
        }

        // Add hover styles dynamically
        const style = document.createElement('style');
        style.textContent = `
            .dropdown-menu .dropdown-item:hover {
                background: linear-gradient(135deg, rgba(246, 200, 78, 0.1) 0%, rgba(246, 200, 78, 0.05) 100%) !important;
                color: #F6C84E !important;
                transform: translateX(4px);
            }
            .btn-gold {
                background: linear-gradient(135deg, #F6C84E 0%, #e6b73e 100%);
                border: none;
                color: #000;
                box-shadow: 0 2px 8px rgba(246, 200, 78, 0.3);
                transition: all 0.3s;
            }
            .btn-gold:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(246, 200, 78, 0.5);
                background: linear-gradient(135deg, #ffd966 0%, #F6C84E 100%);
            }
            .text-gold {
                color: #F6C84E !important;
            }
        `;
        document.head.appendChild(style);
    }

    static handleLogout(event) {
        event.preventDefault();
        event.stopPropagation();

        // Close dropdown
        const dropdown = event.target.closest('.dropdown');
        if (dropdown) {
            const bsDropdown = bootstrap.Dropdown.getInstance(dropdown.querySelector('[data-bs-toggle="dropdown"]'));
            if (bsDropdown) {
                bsDropdown.hide();
            }
        }

        // Show confirmation
        if (confirm('Are you sure you want to logout?')) {
            // Clear all auth data
            localStorage.removeItem('currentUser');
            localStorage.removeItem('auth_token');
            sessionStorage.clear();

            // Call AuthSystem logout
            if (typeof AuthSystem !== 'undefined' && AuthSystem.logout) {
                AuthSystem.logout();
            }

            // Redirect to homepage
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 100);
        }
    }

    protectRestrictedContent() {
        // Find elements that require authentication
        const restrictedElements = document.querySelectorAll('[data-auth-required]');

        restrictedElements.forEach(element => {
            if (!AuthSystem.isLoggedIn()) {
                // Replace content with login prompt
                const originalContent = element.innerHTML;
                element.innerHTML = this.getLoginPromptHTML();
                element.setAttribute('data-original-content', originalContent);
            }
        });
    }

    addLoginPrompts() {
        // Add login prompts to pricing CTAs
    const pricingButtons = document.querySelectorAll('.pricing-card .btn-primary');

        pricingButtons.forEach(button => {
            if (!AuthSystem.isLoggedIn()) {
                const originalHref = button.getAttribute('href');
                button.setAttribute('href', 'login.html?action=register&plan=' + encodeURIComponent(originalHref));

                // Update button text
                const buttonText = button.querySelector('span');
                if (buttonText && !/Sign up/i.test(buttonText.textContent)) {
                    buttonText.textContent = 'Sign up to start';
                }
            }
        });

        // Add login prompts to contact forms
        const contactForms = document.querySelectorAll('form[action*="formspree"]');

        contactForms.forEach(form => {
            if (!AuthSystem.isLoggedIn()) {
                const submitButton = form.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.showLoginModal();
                    });
                }
            }
        });
    }

    getLoginPromptHTML() {
        return `
            <div class="text-center p-4 border border-warning rounded" style="background: rgba(246, 200, 78, 0.1);">
                <i class="fas fa-lock text-warning display-4 mb-3"></i>
                <h4 class="text-warning mb-3">Restricted Content</h4>
                <p class="text-muted mb-3">Please log in to access this exclusive content</p>
                <div class="d-flex gap-2 justify-content-center">
                    <a href="login.html?action=login" class="btn btn-outline-warning btn-sm">
                        <i class="fas fa-sign-in-alt me-1"></i>Login
                    </a>
                    <a href="login.html?action=register" class="btn btn-warning btn-sm">
                        <i class="fas fa-user-plus me-1"></i>Create Account
                    </a>
                </div>
            </div>
        `;
    }

    showLoginModal() {
        // Create login modal if it doesn't exist
        let modal = document.getElementById('loginPromptModal');

        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'loginPromptModal';
            modal.className = 'modal fade';
            modal.innerHTML = `
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-body text-center p-4">
                            <i class="fas fa-user-circle text-warning display-4 mb-3"></i>
                            <h4>Login Required</h4>
                            <p class="text-muted">You need to log in to access this feature</p>
                            <div class="d-flex gap-2 justify-content-center mt-4">
                                <a href="login.html?action=login&redirect=${encodeURIComponent(window.location.pathname)}" class="btn btn-outline-primary">
                                    <i class="fas fa-sign-in-alt me-1"></i>Login
                                </a>
                                <a href="login.html?action=register&redirect=${encodeURIComponent(window.location.pathname)}" class="btn btn-primary">
                                    <i class="fas fa-user-plus me-1"></i>Create Account
                                </a>
                            </div>
                            <button type="button" class="btn btn-sm btn-link text-muted mt-3" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    }

    getTranslation(key) {
        try {
            if (window.GB_I18N && window.GB_I18N.get) {
                return window.GB_I18N.get(key);
            }
            // Fallback translations if i18n is not loaded yet
            const fallbacks = {
                'nav.login': 'Login',
                'nav.register': 'Register',
                'nav.logout': 'Logout',
                'nav.profile': 'My Profile',
                'nav.dashboard': 'Dashboard'
            };
            return fallbacks[key] || null;
        } catch (error) {
            console.warn('Translation not found:', key);
            return null;
        }
    }

    // Static method to protect entire pages
    static protectPage() {
        if (!AuthSystem.isLoggedIn()) {
            const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
            window.location.href = `login.html?redirect=${currentUrl}`;
            return false;
        }
        return true;
    }

    // Compact navbar: keep Home + Pricing inline on small screens; full navbar on desktop
    setupCompactNavbar() {
        try {
            const navbarEl = document.querySelector('.navbar');
            if (!navbarEl) return;
            const navbar = navbarEl.querySelector('.inner')
                || navbarEl.querySelector('.container.inner')
                || navbarEl.querySelector('.container')
                || navbarEl;
            if (!navbar || navbar.dataset.compactInit === '1') return;
            let nav = navbar.querySelector('.nav') || navbar.querySelector('.nav-links');
            // If no nav group exists, create a minimal one with 3 primary links
            if (!nav) {
                nav = document.createElement('div');
                nav.className = 'nav';
                const home = document.createElement('a'); home.href = 'index.html'; home.textContent = this.getTranslation('nav.home') || 'Home';
                const pricing = document.createElement('a'); pricing.href = 'pricing.html'; pricing.textContent = this.getTranslation('nav.pricing') || 'Pricing';
                const login = document.createElement('a'); login.href = 'login.html'; login.textContent = this.getTranslation('nav.login') || 'Login';
                nav.append(home, pricing, login);
                // Insert after brand if present, else append to navbar
                const brand = navbar.querySelector('.brand');
                if (brand && brand.parentNode === navbar) {
                    brand.insertAdjacentElement('afterend', nav);
                } else {
                    navbar.appendChild(nav);
                }
            }

            const links = Array.from(nav.querySelectorAll('a'));
            if (!links.length) return;

            const isPrimary = (a) => {
                const href = (a.getAttribute('href') || '').toLowerCase();
                const i18n = a.getAttribute('data-i18n') || '';
                return (
                    /index\.html$/.test(href) || i18n === 'nav.home' ||
                    /pricing\.html$/.test(href) || i18n === 'nav.pricing' ||
                    /login\.html$/.test(href)   || i18n === 'nav.login'
                );
            };

            // Mark primary links for CSS control
            links.forEach(a => { if (isPrimary(a)) a.classList.add('gb-primary'); });

            // Create hamburger button (initially hidden via CSS on desktop)
            const btn = document.createElement('button');
            btn.className = 'hamburger-btn';
            btn.setAttribute('type', 'button');
            btn.setAttribute('aria-label', 'Open menu');
            btn.innerHTML = '<span class="hamburger-lines"></span>';
            const lang = navbar.querySelector('.lang');
            if (lang) navbar.insertBefore(btn, lang); else navbar.appendChild(btn);

            // Build slide-out menu once
            let overlay = document.getElementById('gb-more-menu');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'gb-more-menu';
                overlay.className = 'gb-more-menu';
                overlay.innerHTML = `
                    <div class="gb-more-content">
                        <div class="gb-more-header">
                            <strong>Menu</strong>
                            <button class="gb-close" aria-label="Close">&times;</button>
                        </div>
                        <nav class="gb-more-nav"></nav>
                    </div>`;
                document.body.appendChild(overlay);
                overlay.querySelector('.gb-close').addEventListener('click', () => overlay.classList.remove('open'));
                overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('open'); });
            }

            const moreNav = overlay.querySelector('.gb-more-nav');

            const rebuildMoreMenu = () => {
                // Populate slide-out with non-primary links
                moreNav.innerHTML = '';
                const nonPrimary = Array.from(nav.querySelectorAll('a')).filter(a => !a.classList.contains('gb-primary'));
                nonPrimary.forEach((a, idx) => {
                    const item = document.createElement('div');
                    item.className = 'gb-item';
                    item.style.setProperty('--i', String(idx));
                    const clone = a.cloneNode(true);
                    item.appendChild(clone);
                    moreNav.appendChild(item);
                });
            };

            const applyLayout = () => {
                // Always keep navbar collapsed to show only primary links (Home, Pricing, Login)
                navbar.classList.add('is-collapsed');
                rebuildMoreMenu();
                btn.onclick = () => overlay.classList.add('open');
            };

            // Initial and on-resize (debounced)
            applyLayout();
            let t;
            window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(applyLayout, 120); });

            navbar.dataset.compactInit = '1';
        } catch (e) {
            console.warn('Compact navbar setup failed', e);
        }
    }
}

// Initialize auth guard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authGuard = new AuthGuard();
});

// Export for external use
window.AuthGuard = AuthGuard;
