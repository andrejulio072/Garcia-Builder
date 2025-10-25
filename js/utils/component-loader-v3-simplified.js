/**
 * GARCIA BUILDER - COMPONENT LOADER v3.0 SIMPLIFIED
 * NO IIFE - Direct window exposure for maximum compatibility
 * Last Updated: October 27, 2025
 */

'use strict';

console.log('[Component Loader v3.0] Initializing...');

// Configuration
const COMPONENTS_PATH = 'components/';
const CACHE = {};

// Inline copies of critical components to provide full-fidelity fallbacks when
// browsers block fetch requests (e.g., file:// protocol or offline previews).
const INLINE_FALLBACKS = {
        navbar: `
<nav class="gb-navbar" role="navigation" aria-label="Main navigation (offline fallback)">
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

                        <div class="gb-navbar-controls">
                                <div id="auth-buttons-navbar" class="gb-auth-buttons">
                                        <a href="pages/auth/login.html" class="gb-btn-link" data-i18n="nav.login">Login</a>
                                        <a href="pricing.html" class="gb-btn-primary-small" data-i18n="nav.register">Register</a>
                                </div>

                                <select id="lang-select-navbar" aria-label="Select language">
                                        <option value="en">EN</option>
                                        <option value="pt">PT</option>
                                        <option value="es">ES</option>
                                </select>
                        </div>

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
                                <a href="index.html" class="gb-menu-link active" data-i18n="nav.home" role="menuitem">Home</a>
                                <a href="about.html" class="gb-menu-link" data-i18n="nav.about" role="menuitem">About</a>
                                <a href="transformations.html" class="gb-menu-link" data-i18n="nav.trans" role="menuitem">Transformations</a>
                                <a href="testimonials.html" class="gb-menu-link" data-i18n="nav.testi" role="menuitem">Testimonials</a>
                                <a href="pricing.html" class="gb-menu-link" data-i18n="nav.pricing" role="menuitem">Pricing</a>
                                <a href="blog.html" class="gb-menu-link" data-i18n="nav.blog" role="menuitem">Blog</a>
                                <a href="faq.html" class="gb-menu-link" data-i18n="nav.faq" role="menuitem">FAQ</a>
                                <a href="contact.html" class="gb-menu-link" data-i18n="nav.contact" role="menuitem">Contact</a>
                        </nav>

                        <div class="gb-menu-footer">
                                <div id="auth-buttons" class="gb-auth-buttons-mobile">
                                        <a href="pages/auth/login.html" class="gb-btn-secondary" data-i18n="nav.login">Login</a>
                                        <a href="pricing.html" class="gb-btn-primary" data-i18n="nav.register">Register</a>
                                </div>

                                <select id="lang-select" class="gb-lang-select" aria-label="Select language">
                                        <option value="en">🇬🇧 English</option>
                                        <option value="pt">🇧🇷 Português</option>
                                        <option value="es">🇪🇸 Español</option>
                                </select>
                        </div>
                </div>
        </div>
</nav>`.trim(),
        footer: `
<footer class="gb-footer" aria-label="Site footer (offline fallback)">
    <div class="gb-footer-main gb-footer-ref">
        <div class="gb-footer-col gb-footer-brand-col">
            <img src="Logo Files/For Web/logo-nobackground-500.png" alt="Garcia Builder Logo" width="56" height="56" loading="lazy" style="margin-bottom:10px;"/>
            <div class="footer-title footer-title-ref">Garcia Builder</div>
            <div class="footer-bio-ref" style="margin-bottom:8px;">Online Coaching — Evidence-based fitness, nutrition & accountability.<br/>Transform your body, sustainably.</div>
            <div class="footer-contact-ref" style="margin-top:14px;">
                <div><a href="mailto:andre@garciabuilder.fitness"><i class="fas fa-envelope"></i> andre@garciabuilder.fitness</a></div>
                <div><a href="https://wa.me/447508497586?text=Hi%20Andre%21%20I%20came%20from%20your%20website%20and%20want%20coaching." target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> WhatsApp</a></div>
            </div>
        </div>
        <div class="gb-footer-col">
            <span class="footer-title footer-title-ref">Links</span>
            <ul style="margin-top:2px;">
                <li><a href="index.html">Home</a></li>
                <li><a href="about.html">About</a></li>
                <li><a href="blog.html">Blog</a></li>
                <li><a href="transformations.html">Results</a></li>
                <li><a href="faq.html">FAQ</a></li>
                <li><a href="pricing.html">Pricing</a></li>
                <li><a href="become-trainer.html">Apply as Trainer</a></li>
            </ul>
        </div>
        <div class="gb-footer-col">
            <span class="footer-title footer-title-ref">Resources</span>
            <ul style="margin-top:2px;">
                <li><a href="assets/empty-guide.pdf" download>Download Guide (PDF)</a></li>
                <li><a href="https://calendly.com/andrenjulio072/consultation" target="_blank" rel="noopener">Book a Call</a></li>
            </ul>
            <div class="footer-follow">
                <span class="footer-subhead">Follow us</span>
                <a href="https://instagram.com/garcia.builder" target="_blank" rel="noopener" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                <a href="https://wa.me/447508497586?text=Hi%20Andre%21%20I%20came%20from%20your%20website%20and%20want%20coaching." target="_blank" rel="noopener" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
            </div>
        </div>
        <div class="gb-footer-col gb-footer-newsletter">
            <span class="footer-title footer-title-ref">Newsletter</span>
            <form class="newsletter-form-ref">
                <input type="email" class="newsletter-input-ref" placeholder="Email address" required />
                <label class="newsletter-checkbox-ref"><input type="checkbox"/> I would like to receive updates and tips from Garcia Builder.</label>
                <button type="submit" class="newsletter-btn-ref">Subscribe</button>
            </form>
            <div class="newsletter-privacy-ref">You can unsubscribe at any time and your information will be treated according to our Privacy Policy.</div>
        </div>
    </div>
    <div class="gb-footer-bottom gb-footer-bottom-ref">
        <div class="gb-footer-legal small">
            <span>© 2025 Garcia Builder</span>
            <a href="#" onclick="openConsentPreferences();return false;">Cookie Preferences</a>
            <a href="privacy.html">Privacy Policy</a>
            <a href="#">Terms & Conditions</a>
        </div>
        <div class="gb-footer-disclaimer-ref">*DISCLAIMER: Results may vary. Results are based on individual circumstances. Timeframes for results are not guaranteed. Willpower is always required!</div>
    </div>
</footer>`.trim()
};

// Resolve the best URL for a component and provide robust fallbacks.
// We try multiple strategies so the loader works when served from a host
// or when someone (for testing) opens the HTML file directly from disk.
function resolveComponentURLs(componentName) {
    const list = [];

    // 1) Prefer origin-aware absolute path when origin is available (http/https)
    try {
        if (window.location && window.location.origin && !window.location.origin.includes('null')) {
            list.push(window.location.origin + `/components/${componentName}.html`);
        }
    } catch (e) {
        // ignore
    }

    // 2) Root-absolute path (works on most hosted environments)
    list.push(`/components/${componentName}.html`);

    // 3) Simple relative path (works when served from a static server and sometimes with file://)
    list.push(`${COMPONENTS_PATH}${componentName}.html`);

    // 4) Base-directory resolution: use the current document base to build a components URL.
    //    This helps when pages are opened as file:///.../path/index.html
    try {
        const docBase = document.baseURI || window.location.href;
        const baseDir = docBase.replace(/[^/]+$/, '');
        list.push(baseDir + `components/${componentName}.html`);
    } catch (e) {
        // ignore
    }

    // Deduplicate while keeping order
    return Array.from(new Set(list));
}

/**
 * Load HTML component from external file
 */
async function loadComponent(componentName) {
    if (CACHE[componentName]) {
        console.log(`[Component Loader] Using cached ${componentName}`);
        return CACHE[componentName];
    }

    try {
        const urls = resolveComponentURLs(componentName);
        let lastError = null;

        for (const url of urls) {
            try {
                console.log(`[Component Loader] Fetching ${url}...`);
                const response = await fetch(url, { cache: 'no-store' });
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                const html = await response.text();
                CACHE[componentName] = html;
                console.log(`[Component Loader] ✓ Loaded ${componentName} from ${url} (${html.length} chars)`);
                return html;
            } catch (err) {
                lastError = err;
                console.warn(`[Component Loader] Failed from ${url}: ${err.message}`);
                // try next URL
            }
        }
        // If we reach here, all fetch attempts failed. Provide a helpful error and continue.
        throw lastError || new Error('Unknown fetch error');
    } catch (error) {
        console.error(`[Component Loader] ✗ Failed to load ${componentName}:`, error);

        // If we're running from file:// it's very common for fetch to fail in browsers.
        if (window.location && window.location.protocol === 'file:') {
            console.warn('[Component Loader] Running from file:// — fetch may be blocked by the browser.\n' +
                'Recommended: run the local static server (see tools/static-server.js) and open http://localhost:5173');
        }

        return `<!-- Component ${componentName} failed to load: ${error.message} -->`;
    }
}

/**
 * Execute inline scripts from injected HTML
 */
function executeScripts(container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
        });
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode.replaceChild(newScript, oldScript);
    });
}

/**
 * Initialize navbar functionality - ULTRA ROBUST VERSION
 */
function initializeNavbar() {
    console.log('[Component Loader] Attempting to initialize navbar...');

    // Wait for navbar to be fully in DOM
    let attempts = 0;
    const maxAttempts = 10;

    const tryInit = function() {
        attempts++;
        const menuToggle = document.getElementById('gb-menu-toggle');
        const menu = document.getElementById('gb-menu');

        if (!menuToggle || !menu) {
            console.warn(`[Component Loader] Navbar elements not found (attempt ${attempts}/${maxAttempts})`);
            if (attempts < maxAttempts) {
                setTimeout(tryInit, 100);
            } else {
                console.error('[Component Loader] ❌ Failed to find navbar elements after 10 attempts!');
            }
            return;
        }

        console.log('[Component Loader] ✓ Navbar elements found! Initializing...');

        // Remove any existing listeners (prevent duplicates)
        const newMenuToggle = menuToggle.cloneNode(true);
        menuToggle.parentNode.replaceChild(newMenuToggle, menuToggle);

        newMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const currentMenu = document.getElementById('gb-menu');
            const isActive = currentMenu.classList.toggle('active');
            newMenuToggle.classList.toggle('active');
            newMenuToggle.setAttribute('aria-expanded', isActive);
            document.body.style.overflow = isActive ? 'hidden' : '';
            console.log('[Navbar] Menu toggled:', isActive ? 'OPEN' : 'CLOSED');
        });

        document.addEventListener('click', function(e) {
            const currentMenu = document.getElementById('gb-menu');
            const currentToggle = document.getElementById('gb-menu-toggle');
            if (currentMenu && currentToggle && !currentMenu.contains(e.target) && !currentToggle.contains(e.target)) {
                currentMenu.classList.remove('active');
                currentToggle.classList.remove('active');
                currentToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });

        const menuLinks = menu.querySelectorAll('.gb-menu-link');
        console.log('[Component Loader] Found', menuLinks.length, 'menu links');

        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                const currentMenu = document.getElementById('gb-menu');
                const currentToggle = document.getElementById('gb-menu-toggle');
                if (currentMenu) currentMenu.classList.remove('active');
                if (currentToggle) {
                    currentToggle.classList.remove('active');
                    currentToggle.setAttribute('aria-expanded', 'false');
                }
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
            if (e.key === 'Escape') {
                const currentMenu = document.getElementById('gb-menu');
                const currentToggle = document.getElementById('gb-menu-toggle');
                if (currentMenu && currentMenu.classList.contains('active')) {
                    currentMenu.classList.remove('active');
                    if (currentToggle) {
                        currentToggle.classList.remove('active');
                        currentToggle.setAttribute('aria-expanded', 'false');
                    }
                    document.body.style.overflow = '';
                }
            }
        });

        console.log('[Component Loader] ✅ Navbar fully initialized!');
    };

    // Start initialization
    tryInit();
}

/**
 * Inject component HTML into placeholder
 */
async function injectComponent(element) {
    const componentName = element.getAttribute('data-component');
    if (!componentName) return;

    console.log(`[Component Loader] Injecting ${componentName}...`);

    const html = await loadComponent(componentName);
        if (!html || html.includes('failed to load')) {
                console.error(`[Component Loader] ✗ Cannot inject ${componentName} — applying inline fallback`);

                const fallback = INLINE_FALLBACKS[componentName] || `<!-- No fallback for ${componentName} -->`;

                element.outerHTML = fallback;
                // still execute any scripts on the page
                executeScripts(document.body);

                if (componentName === 'navbar') {
                        setTimeout(() => initializeNavbar(), 200);
                }

                document.dispatchEvent(new CustomEvent('componentLoaded', { detail: { componentName, fallback: true, timestamp: Date.now() } }));
                console.warn(`[Component Loader] Fallback injected for ${componentName}`);
                return;
        }

        element.outerHTML = html;
    executeScripts(document.body);

    if (componentName === 'navbar') {
        // Give extra time for DOM to settle before initializing navbar
        setTimeout(() => {
            console.log('[Component Loader] Starting navbar initialization after injection...');
            initializeNavbar();
        }, 200);
    }

    document.dispatchEvent(new CustomEvent('componentLoaded', {
        detail: { componentName, timestamp: Date.now() }
    }));

    console.log(`[Component Loader] ✓ Injected ${componentName}`);
}

/**
 * Initialize all components
 */
async function initComponents() {
    const elements = document.querySelectorAll('[data-component]');
    console.log(`[Component Loader] Found ${elements.length} components to load`);

    if (elements.length === 0) {
        console.warn('[Component Loader] No components found on page');
        return;
    }

    for (const el of elements) {
        await injectComponent(el);
    }

    console.log(`[Component Loader] ✓ All ${elements.length} components loaded!`);
}

// EXPOSE TO WINDOW (NO IIFE!)
window.ComponentLoader = {
    load: loadComponent,
    init: initComponents,
    cache: CACHE
};

// AUTO-INITIALIZE
console.log('[Component Loader] Document state:', document.readyState);

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Component Loader] DOMContentLoaded fired');
        initComponents();
    });
} else {
    console.log('[Component Loader] Document already loaded, initializing now');
    initComponents();
}

// Additional safety check
window.addEventListener('load', function() {
    const unloaded = document.querySelectorAll('[data-component]');
    if (unloaded.length > 0) {
        console.warn('[Component Loader] Safety check - retrying...');
        initComponents();
    }
});

console.log('[Component Loader v3.0] Script loaded successfully!');
