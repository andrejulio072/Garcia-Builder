// Authentication Guard - Protect pages that require login

class AuthGuard {
    constructor() {
        this.init();
    }

    init() {
        this.addUserMenuToNavbar();
        this.protectRestrictedContent();
        this.addLoginPrompts();
    }

    addUserMenuToNavbar() {
        const currentUser = AuthSystem.getCurrentUser();
        const navbar = document.querySelector('.navbar .container');

        if (!navbar) return;

        // Find or create user menu container
        let userMenu = navbar.querySelector('.user-menu');

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

        if (currentUser) {
            // User is logged in - show user menu
            userMenu.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-outline-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        <i class="fas fa-user-circle me-1"></i>
                        <span class="d-none d-sm-inline">${currentUser.name.split(' ')[0]}</span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li>
                            <span class="dropdown-item-text">
                                <div class="fw-bold">${currentUser.name}</div>
                                <small class="text-muted">${currentUser.email}</small>
                            </span>
                        </li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="profile.html"><i class="fas fa-user me-2"></i>Meu Perfil</a></li>
                        <li><a class="dropdown-item" href="dashboard.html"><i class="fas fa-tachometer-alt me-2"></i>Dashboard</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><button class="dropdown-item text-danger" onclick="AuthSystem.logout()"><i class="fas fa-sign-out-alt me-2"></i>Sair</button></li>
                    </ul>
                </div>
            `;
        } else {
            // User not logged in - show login/register buttons
            userMenu.innerHTML = `
                <div class="d-flex gap-2 align-items-center">
                    <a href="login.html?action=login" class="btn btn-outline-light btn-sm d-flex align-items-center" style="border-color: #F6C84E; color: #F6C84E;">
                        <i class="fas fa-sign-in-alt me-1"></i>
                        <span>Login</span>
                    </a>
                    <a href="login.html?action=register" class="btn btn-sm d-flex align-items-center" style="background: linear-gradient(135deg, #F6C84E 0%, #e6b73e 100%); border: none; color: #000; font-weight: 600;">
                        <i class="fas fa-user-plus me-1"></i>
                        <span>Cadastrar</span>
                    </a>
                </div>
            `;
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
                if (buttonText && !buttonText.textContent.includes('Cadastre-se')) {
                    buttonText.textContent = 'Cadastre-se para Começar';
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
                <h4 class="text-warning mb-3">Conteúdo Restrito</h4>
                <p class="text-muted mb-3">Faça login para acessar este conteúdo exclusivo</p>
                <div class="d-flex gap-2 justify-content-center">
                    <a href="login.html?action=login" class="btn btn-outline-warning btn-sm">
                        <i class="fas fa-sign-in-alt me-1"></i>Fazer Login
                    </a>
                    <a href="login.html?action=register" class="btn btn-warning btn-sm">
                        <i class="fas fa-user-plus me-1"></i>Criar Conta
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
                            <h4>Login Necessário</h4>
                            <p class="text-muted">Você precisa fazer login para acessar esta funcionalidade</p>
                            <div class="d-flex gap-2 justify-content-center mt-4">
                                <a href="login.html?action=login&redirect=${encodeURIComponent(window.location.pathname)}" class="btn btn-outline-primary">
                                    <i class="fas fa-sign-in-alt me-1"></i>Fazer Login
                                </a>
                                <a href="login.html?action=register&redirect=${encodeURIComponent(window.location.pathname)}" class="btn btn-primary">
                                    <i class="fas fa-user-plus me-1"></i>Criar Conta
                                </a>
                            </div>
                            <button type="button" class="btn btn-sm btn-link text-muted mt-3" data-bs-dismiss="modal">Fechar</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
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
}

// Initialize auth guard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authGuard = new AuthGuard();
});

// Export for external use
window.AuthGuard = AuthGuard;
