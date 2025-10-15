"""
Script para atualizar navbars nas páginas restantes (trainer, admin, etc)
"""

import os
import re

BASE_DIR = r"c:\Users\andre\OneDrive\Área de Trabalho\Garcia-Builder\Garcia-Builder"

# Páginas adicionais
ADDITIONAL_PAGES = [
    'trainer-dashboard.html',
    'become-trainer.html',
    'admin-dashboard.html',
    'admin-trainers.html',
    'admin-setup-complete.html',
    'certificacao-completa.html',
    'success.html',
    'thanks-ebook.html',
    'lead-magnet.html',
    'programs.html',
]

NEW_NAVBAR_CSS = '''<style>
/* ===== NAVBAR ENHANCED - HAMBURGER SEMPRE VISÍVEL ===== */
.gb-navbar {
    position: sticky;
    top: 0;
    z-index: 1000;
    background: rgba(9, 14, 24, 0.95);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(246, 200, 78, 0.2);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
}

.gb-navbar .container {
    padding: 0.75rem 1rem;
}

.gb-navbar-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

.gb-logo-section {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    transition: transform 0.3s ease;
}

.gb-logo-section:hover {
    transform: scale(1.05);
}

.gb-logo-img {
    height: 60px;
    width: auto;
    object-fit: contain;
}

.gb-logo-text {
    background: linear-gradient(135deg, #F6C84E 0%, #FFD700 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 1.75rem;
    font-weight: 900;
    line-height: 1.2;
    white-space: nowrap;
}

.gb-hamburger {
    background: rgba(246, 200, 78, 0.15);
    border: 1px solid rgba(246, 200, 78, 0.3);
    border-radius: 10px;
    padding: 10px 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 50px;
    min-height: 50px;
}

.gb-hamburger:hover {
    background: rgba(246, 200, 78, 0.25);
    border-color: #F6C84E;
    transform: scale(1.05);
}

.gb-hamburger-icon {
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: 24px;
}

.gb-hamburger-line {
    width: 100%;
    height: 3px;
    background: #F6C84E;
    border-radius: 3px;
    transition: all 0.3s ease;
}

.gb-hamburger.active .gb-hamburger-line:nth-child(1) {
    transform: rotate(45deg) translate(7px, 7px);
}

.gb-hamburger.active .gb-hamburger-line:nth-child(2) {
    opacity: 0;
}

.gb-hamburger.active .gb-hamburger-line:nth-child(3) {
    transform: rotate(-45deg) translate(7px, -7px);
}

.gb-menu {
    position: fixed;
    top: 92px;
    left: 0;
    right: 0;
    background: rgba(15, 15, 15, 0.98);
    backdrop-filter: blur(20px);
    border-bottom: 2px solid rgba(246, 200, 78, 0.3);
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.gb-menu.active {
    max-height: calc(100vh - 92px);
    overflow-y: auto;
}

.gb-menu-inner {
    padding: 1.5rem 1rem;
}

.gb-menu-links {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
}

.gb-menu-link {
    display: block;
    padding: 1rem 1.25rem;
    color: rgba(255, 255, 255, 0.9);
    text-decoration: none;
    font-weight: 600;
    font-size: 1.1rem;
    border-radius: 12px;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.gb-menu-link:hover,
.gb-menu-link.active {
    background: rgba(246, 200, 78, 0.15);
    color: #F6C84E;
    border-color: rgba(246, 200, 78, 0.3);
    transform: translateX(8px);
}

.gb-menu-footer {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.gb-lang-select {
    padding: 0.75rem 1rem;
    background: rgba(246, 200, 78, 0.1);
    border: 1px solid rgba(246, 200, 78, 0.3);
    border-radius: 10px;
    color: #F6C84E;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.gb-lang-select:hover {
    background: rgba(246, 200, 78, 0.2);
}

@media (min-width: 1024px) {
    .gb-logo-img {
        height: 70px;
    }

    .gb-logo-text {
        font-size: 2rem;
    }

    .gb-hamburger {
        min-width: 60px;
        min-height: 60px;
    }

    .gb-menu {
        top: 102px;
    }

    .gb-menu.active {
        max-height: calc(100vh - 102px);
    }

    .gb-menu-inner {
        max-width: 500px;
        margin: 0 auto;
        padding: 2rem 1rem;
    }

    .gb-menu-link {
        font-size: 1.25rem;
        padding: 1.25rem 1.5rem;
    }
}

@media (max-width: 768px) {
    .gb-logo-img {
        height: 50px;
    }

    .gb-logo-text {
        font-size: 1.5rem;
    }

    .gb-hamburger {
        min-width: 45px;
        min-height: 45px;
        padding: 8px 12px;
    }

    .gb-menu-link {
        font-size: 1rem;
        padding: 0.875rem 1rem;
    }
}

.gb-menu::-webkit-scrollbar {
    width: 8px;
}

.gb-menu::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
}

.gb-menu::-webkit-scrollbar-thumb {
    background: rgba(246, 200, 78, 0.5);
    border-radius: 4px;
}

.gb-menu::-webkit-scrollbar-thumb:hover {
    background: rgba(246, 200, 78, 0.7);
}

#auth-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

#auth-buttons .btn {
    padding: 0.875rem 1.5rem;
    border-radius: 10px;
    font-weight: 600;
    text-align: center;
    transition: all 0.3s ease;
}

#auth-buttons .btn-primary {
    background: linear-gradient(135deg, #F6C84E 0%, #FFD700 100%);
    color: #000;
    border: none;
}

#auth-buttons .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(246, 200, 78, 0.4);
}

#auth-buttons .btn-outline {
    background: transparent;
    border: 1px solid rgba(246, 200, 78, 0.5);
    color: #F6C84E;
}

#auth-buttons .btn-outline:hover {
    background: rgba(246, 200, 78, 0.15);
}
</style>

'''

NEW_NAVBAR_HTML = '''<nav class="gb-navbar" role="navigation" aria-label="Main navigation">
    <div class="container">
        <div class="gb-navbar-content">
            <a href="index.html" class="gb-logo-section" aria-label="Garcia Builder Home">
                <img src="Logo Files/For Web/logo-nobackground-500.png"
                     alt="Garcia Builder Logo"
                     class="gb-logo-img"
                     loading="eager"
                     decoding="async">
                <span class="gb-logo-text">Garcia Builder</span>
            </a>

            <button class="gb-hamburger"
                    id="gb-menu-toggle"
                    aria-label="Toggle navigation menu"
                    aria-expanded="false"
                    aria-controls="gb-menu">
                <div class="gb-hamburger-icon">
                    <span class="gb-hamburger-line"></span>
                    <span class="gb-hamburger-line"></span>
                    <span class="gb-hamburger-line"></span>
                </div>
            </button>
        </div>
    </div>

    <div class="gb-menu" id="gb-menu" role="menu">
        <div class="gb-menu-inner">
            <nav class="gb-menu-links" role="menubar">
                <a href="index.html" class="gb-menu-link" data-i18n="nav.home" role="menuitem">Home</a>
                <a href="about.html" class="gb-menu-link" data-i18n="nav.about" role="menuitem">About</a>
                <a href="transformations.html" class="gb-menu-link" data-i18n="nav.trans" role="menuitem">Transformations</a>
                <a href="testimonials.html" class="gb-menu-link" data-i18n="nav.testi" role="menuitem">Testimonials</a>
                <a href="pricing.html" class="gb-menu-link" data-i18n="nav.pricing" role="menuitem">Pricing</a>
                <a href="blog.html" class="gb-menu-link" data-i18n="nav.blog" role="menuitem">Blog</a>
                <a href="faq.html" class="gb-menu-link" data-i18n="nav.faq" role="menuitem">FAQ</a>
                <a href="contact.html" class="gb-menu-link" data-i18n="nav.contact" role="menuitem">Contact</a>
            </nav>

            <div class="gb-menu-footer">
                <div id="auth-buttons"></div>

                <select id="lang-select" class="gb-lang-select" aria-label="Select language">
                    <option value="en">🇬🇧 English</option>
                    <option value="pt">🇧🇷 Português</option>
                    <option value="es">🇪🇸 Español</option>
                </select>
            </div>
        </div>
    </div>
</nav>

<script>
(function() {
    'use strict';

    const menuToggle = document.getElementById('gb-menu-toggle');
    const menu = document.getElementById('gb-menu');

    if (!menuToggle || !menu) return;

    menuToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        const isActive = menu.classList.toggle('active');
        menuToggle.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', isActive);
        document.body.style.overflow = isActive ? 'hidden' : '';
    });

    document.addEventListener('click', function(e) {
        if (!menu.contains(e.target) && !menuToggle.contains(e.target)) {
            menu.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    });

    const menuLinks = menu.querySelectorAll('.gb-menu-link');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            menu.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    menuLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && menu.classList.contains('active')) {
            menu.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    });
})();
</script>'''

def update_navbar_in_file(filepath):
    """Atualiza ou adiciona navbar em um arquivo"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Verifica se já tem a nova navbar
        if 'gb-navbar' in content:
            print(f"✓ {os.path.basename(filepath)} - já tem a nova navbar")
            return True

        # Pattern para encontrar navbar antiga
        old_navbar_pattern = r'<nav class="navbar">.*?</nav>'

        if re.search(old_navbar_pattern, content, re.DOTALL):
            # Tem navbar antiga - substituir
            if NEW_NAVBAR_CSS not in content:
                content = re.sub(r'(<nav class="navbar">)', NEW_NAVBAR_CSS + r'\1', content, count=1)
            content = re.sub(old_navbar_pattern, NEW_NAVBAR_HTML, content, flags=re.DOTALL, count=1)

            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

            print(f"✅ {os.path.basename(filepath)} - navbar atualizada")
            return True
        else:
            # Não tem navbar - adicionar após <body>
            body_pattern = r'(<body[^>]*>)'
            if re.search(body_pattern, content):
                content = re.sub(body_pattern, r'\1\n' + NEW_NAVBAR_CSS + NEW_NAVBAR_HTML, content, count=1)

                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)

                print(f"✅ {os.path.basename(filepath)} - navbar adicionada")
                return True
            else:
                print(f"⚠️  {os.path.basename(filepath)} - tag <body> não encontrada")
                return False

    except Exception as e:
        print(f"❌ Erro em {os.path.basename(filepath)}: {str(e)}")
        return False

def main():
    print("🚀 Atualizando páginas adicionais...\n")

    updated = 0
    failed = 0

    for page in ADDITIONAL_PAGES:
        filepath = os.path.join(BASE_DIR, page)
        if os.path.exists(filepath):
            if update_navbar_in_file(filepath):
                updated += 1
            else:
                failed += 1
        else:
            print(f"⚠️  {page} - arquivo não encontrado")

    print(f"\n📊 Resumo:")
    print(f"   ✅ Páginas atualizadas: {updated}")
    print(f"   ❌ Falhas: {failed}")

if __name__ == "__main__":
    main()
