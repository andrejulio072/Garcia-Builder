/**
 * GARCIA BUILDER - COMPONENT LOADER v3.0 SIMPLIFIED
 * NO IIFE - Direct window exposure for maximum compatibility
 * Last Updated: October 27, 2025
 */

'use strict';

console.log('[Component Loader v3.0] Initializing...');

(function handleSupabaseRecoveryBounce() {
    try {
        if (typeof window === 'undefined' || !window.location) {
            return;
        }

        const { location } = window;
        const pathname = (location.pathname || '').toLowerCase();
        if (pathname.includes('reset-password.html')) {
            return;
        }

        const hash = location.hash || '';
        if (!hash || hash.length < 2) {
            return;
        }

        const params = new URLSearchParams(hash.slice(1));
        const isRecovery = params.get('type') === 'recovery' || params.get('event') === 'PASSWORD_RECOVERY';
        const hasTokens = params.has('access_token') && params.has('refresh_token');
        if (!isRecovery || !hasTokens) {
            return;
        }

        let baseUrl = '';
        try {
            const configured = window.__ENV && typeof window.__ENV.PUBLIC_SITE_URL === 'string'
                ? window.__ENV.PUBLIC_SITE_URL.trim()
                : '';
            if (configured) {
                baseUrl = configured.replace(/\/$/, '');
            }
        } catch (err) {
            console.warn('[Recovery Bounce] __ENV lookup failed:', err);
        }

        if (!baseUrl) {
            const origin = location.origin && location.origin !== 'null' ? location.origin : '';
            if (!origin) {
                return;
            }
            baseUrl = origin.replace(/\/$/, '');
        }

        const target = new URL('pages/auth/reset-password.html', `${baseUrl}/`);
        const query = new URLSearchParams(location.search || '');
        if (query.toString()) {
            target.search = query.toString();
        }
        target.hash = hash;

        console.log('[Recovery Bounce] Redirecting to reset password form:', target.toString());
        window.location.replace(target.toString());
    } catch (err) {
        console.warn('[Recovery Bounce] Failed to reroute tokenized recovery flow:', err);
    }
})();

// Configuration
const COMPONENTS_PATH = 'components/';
const CACHE = {};

function isFileProtocol() {
    return typeof window !== 'undefined' && window.location && window.location.protocol === 'file:';
}

function isOffline() {
    return typeof navigator !== 'undefined' && navigator.onLine === false;
}

// Inline copies of critical components to provide full-fidelity fallbacks when
// browsers block fetch requests (e.g., file:// protocol or offline previews).
const INLINE_FALLBACKS = {
    navbar: `
<nav class="gb-navbar" role="navigation" aria-label="Main navigation (offline fallback)">
    <div class="container">
        <div class="gb-navbar-content">
            <a href="#" class="gb-logo-section" aria-label="Garcia Builder Home" data-gb-nav="index.html">
             <img src="Logo%20Files/For%20Web/logo-nobackground-500.png"
                 data-gb-logo-src="Logo%20Files/For%20Web/logo-nobackground-500.png"
                     alt="Garcia Builder Logo"
                     class="gb-logo-img"
                     loading="eager"
                     decoding="async">
                <span class="gb-logo-text">Garcia Builder</span>
            </a>

            <nav class="gb-navbar-links" role="menubar" aria-label="Primary">
                <a href="#" class="gb-navbar-link" data-i18n="nav.home" role="menuitem" data-gb-nav="index.html">Home</a>
                <a href="#" class="gb-navbar-link" data-i18n="nav.about" role="menuitem" data-gb-nav="about.html">About</a>
                <a href="#" class="gb-navbar-link" data-i18n="nav.trans" role="menuitem" data-gb-nav="transformations.html">Transformations</a>
                <a href="#" class="gb-navbar-link" data-i18n="nav.testi" role="menuitem" data-gb-nav="testimonials.html">Testimonials</a>
                <a href="#" class="gb-navbar-link" data-i18n="nav.pricing" role="menuitem" data-gb-nav="pricing.html">Pricing</a>
                <a href="#" class="gb-navbar-link" data-i18n="nav.blog" role="menuitem" data-gb-nav="blog.html">Blog</a>
                <a href="#" class="gb-navbar-link" data-i18n="nav.faq" role="menuitem" data-gb-nav="faq.html">FAQ</a>
                <a href="#" class="gb-navbar-link" data-i18n="nav.contact" role="menuitem" data-gb-nav="contact.html">Contact</a>
            </nav>

            <div class="gb-navbar-actions">
                <div class="gb-navbar-controls">
                    <div id="auth-buttons-navbar" class="gb-auth-buttons">
                        <a href="#" class="gb-btn-link" data-i18n="nav.login" data-gb-nav="pages/auth/login.html">Login</a>
                        <a href="#" class="gb-btn-primary-small" data-i18n="nav.register" data-gb-nav="pages/auth/login.html?action=register">Register</a>
                    </div>
                </div>

                <button type="button" class="gb-hamburger"
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
    </div>

    <div class="gb-menu" id="gb-menu">
        <div class="gb-menu-inner">
            <nav class="gb-menu-links" role="menubar">
                <a href="#" class="gb-menu-link" data-i18n="nav.home" role="menuitem" data-gb-nav="index.html">Home</a>
                <a href="#" class="gb-menu-link" data-i18n="nav.about" role="menuitem" data-gb-nav="about.html">About</a>
                <a href="#" class="gb-menu-link" data-i18n="nav.trans" role="menuitem" data-gb-nav="transformations.html">Transformations</a>
                <a href="#" class="gb-menu-link" data-i18n="nav.testi" role="menuitem" data-gb-nav="testimonials.html">Testimonials</a>
                <a href="#" class="gb-menu-link" data-i18n="nav.pricing" role="menuitem" data-gb-nav="pricing.html">Pricing</a>
                <a href="#" class="gb-menu-link" data-i18n="nav.blog" role="menuitem" data-gb-nav="blog.html">Blog</a>
                <a href="#" class="gb-menu-link" data-i18n="nav.faq" role="menuitem" data-gb-nav="faq.html">FAQ</a>
                <a href="#" class="gb-menu-link" data-i18n="nav.contact" role="menuitem" data-gb-nav="contact.html">Contact</a>
            </nav>

            <div class="gb-menu-footer">
                <div id="auth-buttons" class="gb-auth-buttons-mobile">
                    <a href="#" class="gb-btn-secondary" data-i18n="nav.login" data-gb-nav="pages/auth/login.html">Login</a>
                    <a href="#" class="gb-btn-primary" data-i18n="nav.register" data-gb-nav="pages/auth/login.html?action=register">Register</a>
                </div>
                <div class="gb-menu-language" role="group" aria-label="Site language selector">
                    <label for="lang-select" class="visually-hidden" data-i18n="footer.language_label">Site language</label>
                    <select id="lang-select" class="gb-lang-select" aria-label="Select language" title="Select language">
                        <option value="en">EN • English</option>
                        <option value="pt">PT • Português</option>
                        <option value="es">ES • Español</option>
                    </select>
                    <small class="gb-menu-language-note" data-i18n="footer.language_help">Change the language used across the site.</small>
                </div>
            </div>
        </div>
    </div>
</nav>`.trim(),
        footer: `
<footer class="gb-footer" aria-label="Site footer (offline fallback)">
    <div class="gb-footer-main gb-footer-ref">
        <div class="gb-footer-col gb-footer-brand-col">
            <img src="Logo%20Files/For%20Web/logo-nobackground-500.png" alt="Garcia Builder Logo" data-gb-logo-src="Logo%20Files/For%20Web/logo-nobackground-500.png" width="56" height="56" loading="lazy" style="margin-bottom:10px;"/>
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
                <li><a href="/index.html">Home</a></li>
                <li><a href="/about.html">About</a></li>
                <li><a href="/blog.html">Blog</a></li>
                <li><a href="/transformations.html">Results</a></li>
                <li><a href="/faq.html">FAQ</a></li>
                <li><a href="/pricing.html">Pricing</a></li>
                <li><a href="/pages/public/become-trainer.html">Apply as Trainer</a></li>
            </ul>
        </div>
        <div class="gb-footer-col">
            <span class="footer-title footer-title-ref">Resources</span>
            <ul style="margin-top:2px;">
                <li><a href="/assets/empty-guide.pdf" download>Download Guide (PDF)</a></li>
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
            <form class="newsletter-form-ref" aria-label="Footer newsletter signup">
                <input type="email" class="newsletter-input-ref" id="footer-newsletter-email-fallback" name="email" placeholder="Email address" required autocomplete="email" />
                <label class="newsletter-checkbox-ref" for="footer-newsletter-consent-fallback">
                    <input type="checkbox" id="footer-newsletter-consent-fallback" name="consent" value="yes" required /> I would like to receive updates and tips from Garcia Builder.
                </label>
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
                const warnFn = (isFileProtocol() || isOffline()) ? console.info : console.warn;
                warnFn(`[Component Loader] Failed from ${url}: ${err.message}`);
                // try next URL
            }
        }
        // If we reach here, all fetch attempts failed. Provide a helpful error and continue.
        throw lastError || new Error('Unknown fetch error');
    } catch (error) {
        const fallbackLog = (isFileProtocol() || isOffline()) ? console.info : console.error;
        fallbackLog(`[Component Loader] ✗ Failed to load ${componentName}:`, error);

        if (isFileProtocol()) {
            console.info('[Component Loader] Running from file:// — browsers often block fetch in this context.\n' +
                'Recommended: use the local static server (tools/static-server.js) and open http://localhost:5173');
        } else if (isOffline()) {
            console.info('[Component Loader] Browser reports offline mode — component fetch skipped until connection resumes.');
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
        const logo = document.querySelector('.gb-navbar .gb-logo-img');
        if (logo) {
            ensureNavbarLogoPath(logo);
        }
        ensureNavbarLinks();

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
            const menuPanel = currentMenu ? currentMenu.querySelector('.gb-menu-inner') : null;
            if (currentMenu && currentToggle && currentMenu.classList.contains('active') && !newMenuToggle.contains(e.target) && (!menuPanel || !menuPanel.contains(e.target))) {
                currentMenu.classList.remove('active');
                currentToggle.classList.remove('active');
                currentToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });

        const menuLinks = menu.querySelectorAll('.gb-menu-link');
        const desktopLinks = document.querySelectorAll('.gb-navbar-links .gb-navbar-link');
        console.log('[Component Loader] Found', menuLinks.length, 'menu links and', desktopLinks.length, 'desktop links');

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

        const normalizePath = (rawPath) => {
            if (!rawPath) return '/index.html';
            const [pathWithoutQuery] = rawPath.split('?');
            if (pathWithoutQuery === '/' || pathWithoutQuery === '') {
                return '/index.html';
            }
            return pathWithoutQuery.startsWith('/') ? pathWithoutQuery : `/${pathWithoutQuery}`;
        };

        const currentPage = normalizePath(window.location.pathname);
        const currentProjectPath = getCurrentProjectPath();
        const highlightLinks = [...menuLinks, ...desktopLinks];
        highlightLinks.forEach(link => {
            const navTarget = link.getAttribute('data-gb-nav');
            if (navTarget) {
                const sanitizedTarget = navTarget.trim().replace(/^\/+/, '');
                const targetPath = sanitizedTarget.split('?')[0];
                if (targetPath && targetPath === currentProjectPath) {
                    link.classList.add('active');
                    return;
                }
            }

            const linkPage = normalizePath(link.getAttribute('href'));
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

function ensureNavbarLogoPath(logoEl) {
    if (!logoEl || logoEl.dataset.gbLogoResolved === '1') {
        return;
    }

    const raw = logoEl.getAttribute('data-gb-logo-src') || logoEl.getAttribute('src');
    if (!raw) {
        return;
    }

    const sanitized = raw.trim().replace(/\\/g, '/');
    const encoded = sanitized.replace(/ /g, '%20').replace(/^\/+/, '');
    const relativeBase = encoded.startsWith('Logo%20Files') ? encoded : `Logo%20Files/For%20Web/${encoded}`;

    const candidates = [];
    const addCandidate = (path) => {
        if (path && !candidates.includes(path)) {
            candidates.push(path);
        }
    };

    addCandidate(logoEl.getAttribute('src'));
    addCandidate(relativeBase);
    addCandidate(`./${relativeBase}`);
    addCandidate(`../${relativeBase}`);
    addCandidate(`../../${relativeBase}`);
    addCandidate(`../../../${relativeBase}`);
    addCandidate(`../../../../${relativeBase}`);
    try {
        const relativePrefix = computeRelativePrefix();
        if (relativePrefix) {
            addCandidate(`${relativePrefix}${relativeBase}`);
        }
    } catch (err) {
        // ignore prefix errors
    }
    addCandidate(`/${relativeBase}`);

    try {
        const origin = window.location && window.location.origin;
        if (origin && origin !== 'null') {
            addCandidate(`${origin}/${relativeBase}`);
        }
    } catch (err) {
        // ignore origin issues
    }

    addCandidate(`https://garciabuilder.fitness/${relativeBase}`);

    const tester = new Image();
    const tryIndex = (idx) => {
        if (idx >= candidates.length) {
            console.warn('[Navbar] Failed to resolve logo path after trying', candidates.length, 'candidates');
            return;
        }
        const candidate = candidates[idx];
        if (!candidate) {
            tryIndex(idx + 1);
            return;
        }
        tester.onload = () => {
            logoEl.src = candidate;
            logoEl.dataset.gbLogoResolved = '1';
        };
        tester.onerror = () => {
            tryIndex(idx + 1);
        };
        tester.src = candidate;
    };

    if (!logoEl.complete || logoEl.naturalWidth === 0) {
        tryIndex(0);
    } else {
        logoEl.dataset.gbLogoResolved = '1';
    }
}

function ensureNavbarLinks() {
    const anchors = document.querySelectorAll('.gb-navbar [data-gb-nav]');
    if (!anchors.length) {
        return;
    }

    anchors.forEach(anchor => {
        const target = anchor.getAttribute('data-gb-nav');
        if (!target) {
            return;
        }
        const href = resolveNavHref(target);
        if (href) {
            anchor.setAttribute('href', href);
        }
    });
}

function shouldSkipAssetNormalization(value) {
    if (!value) {
        return true;
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return true;
    }

    return /^(?:[a-z]+:|\/\/|#)/i.test(trimmed);
}

function normalizeGlobalAssets() {
    const assetTargets = [
        { selector: 'img[src*="Logo Files"], img[src*="Logo%20Files"], img[data-gb-logo-src], img[data-resolve-asset]', attribute: 'src' },
        { selector: 'link[rel~="icon"], link[rel="apple-touch-icon"]', attribute: 'href' }
    ];

    assetTargets.forEach(({ selector, attribute }) => {
        document.querySelectorAll(selector).forEach(element => {
            const rawValue = element.getAttribute(attribute);
            if (shouldSkipAssetNormalization(rawValue)) {
                return;
            }

            try {
                const resolved = new URL(rawValue, document.baseURI).toString();
                if (resolved && resolved !== rawValue) {
                    element.setAttribute(attribute, resolved);
                }
            } catch (error) {
                console.warn('[Asset Normalizer] Failed to resolve path for', rawValue, error);
            }
        });
    });
}

function canonicalizeNavTarget(target) {
    if (!target || typeof target !== 'string') {
        return target;
    }

    try {
        const hasWindow = typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null';
        const base = hasWindow ? `${window.location.origin}/` : 'https://garciabuilder.fitness/';
        const parsed = new URL(target, base);
        const normalizedPath = parsed.pathname.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '').toLowerCase();

        const applyPath = (path, extraParams) => {
            parsed.pathname = path.startsWith('/') ? path : `/${path}`;
            if (extraParams && parsed.searchParams) {
                Object.entries(extraParams).forEach(([key, value]) => {
                    if (!parsed.searchParams.has(key)) {
                        parsed.searchParams.set(key, value);
                    }
                });
            }
        };

        if (normalizedPath === 'pages/auth' || normalizedPath === 'pages/auth/index' || normalizedPath === 'pages/auth/index.html') {
            applyPath('pages/auth/login.html');
        } else if (normalizedPath === 'pages/auth/login') {
            applyPath('pages/auth/login.html');
        } else if (normalizedPath === 'pages/auth/register') {
            applyPath('pages/auth/login.html', { action: 'register' });
        }

        const pathname = parsed.pathname.replace(/^\/+/, '');
        const search = parsed.search || '';
        const hash = parsed.hash || '';
        return `${pathname}${search}${hash}`;
    } catch (error) {
        console.warn('[Navbar] Failed to canonicalize nav target:', target, error);
        return target;
    }
}

function resolveNavHref(target) {
    if (!target || typeof target !== 'string') {
        return '#';
    }

    const trimmed = target.trim();
    if (!trimmed) {
        return '#';
    }

    if (/^[a-z]+:/i.test(trimmed) || trimmed.startsWith('#')) {
        return trimmed;
    }

    const normalized = canonicalizeNavTarget(trimmed.replace(/^\/+/, ''));
    const protocol = (typeof window !== 'undefined' && window.location) ? window.location.protocol : '';

    if (protocol === 'file:') {
        return `${computeRelativePrefix()}${normalized}`;
    }

    const sanitized = normalized.replace(/^\/+/, '');
    const basePath = computeSiteBasePath();
    if (!basePath || basePath === '/') {
        return `/${sanitized}`;
    }

    const trimmedBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
    return `${trimmedBase}/${sanitized}`;
}

function computeRelativePrefix() {
    try {
        if (typeof window === 'undefined' || !window.location) {
            return '';
        }

        const path = window.location.pathname.replace(/\\/g, '/');
        const segments = path.split('/').filter(Boolean);
        if (segments.length === 0) {
            return '';
        }

    const lowerSegments = segments.map(seg => seg.toLowerCase());
    const markerIdx = lowerSegments.lastIndexOf('garcia-builder');
    const relativeSegments = markerIdx !== -1 ? segments.slice(markerIdx + 1) : segments;
        if (relativeSegments.length === 0) {
            return '';
        }

        const lastSegment = relativeSegments[relativeSegments.length - 1];
        const isFile = /\.[a-z0-9]+$/i.test(lastSegment || '');
        const depth = isFile ? relativeSegments.length - 1 : relativeSegments.length;

        if (depth <= 0) {
            return '';
        }

        return '../'.repeat(depth);
    } catch (error) {
        console.warn('[Navbar] Failed to compute relative prefix:', error);
        return '';
    }
}

function getCurrentProjectPath() {
    try {
        if (typeof window === 'undefined' || !window.location) {
            return 'index.html';
        }

        const path = window.location.pathname.replace(/\\/g, '/');
        const segments = path.split('/').filter(Boolean);
        if (segments.length === 0) {
            return 'index.html';
        }

        const lowerSegments = segments.map(seg => seg.toLowerCase());
        const markerIdx = lowerSegments.lastIndexOf('garcia-builder');
        const relativeSegments = markerIdx !== -1 ? segments.slice(markerIdx + 1) : segments;

        if (!relativeSegments.length) {
            return 'index.html';
        }

        const lastSegment = relativeSegments[relativeSegments.length - 1];
        const isDirectory = lastSegment && !/\.[a-z0-9]+$/i.test(lastSegment);
        return isDirectory ? `${relativeSegments.join('/')}/index.html` : relativeSegments.join('/');
    } catch (error) {
        console.warn('[Navbar] Failed to compute project path:', error);
        return window.location ? window.location.pathname : 'index.html';
    }
}

function computeSiteBasePath() {
    try {
        if (typeof window === 'undefined' || !window.location) {
            return '/';
        }

        if (window.__ENV && typeof window.__ENV.PUBLIC_SITE_URL === 'string' && window.__ENV.PUBLIC_SITE_URL.trim()) {
            try {
                const envUrl = new URL(window.__ENV.PUBLIC_SITE_URL.trim());
                const envPath = envUrl.pathname.replace(/\\/g, '/');
                if (!envPath || envPath === '/') {
                    return '/';
                }
                return envPath.endsWith('/') ? envPath : `${envPath}/`;
            } catch (envErr) {
                console.warn('[Navbar] Failed to parse PUBLIC_SITE_URL base path:', envErr);
            }
        }

        const { pathname } = window.location;
        if (!pathname || pathname === '/' || pathname === '') {
            return '/';
        }

        const segments = pathname.replace(/\\/g, '/').split('/').filter(Boolean);
        if (!segments.length) {
            return '/';
        }

        const last = segments[segments.length - 1];
        const isFile = /\.[a-z0-9]+$/i.test(last);
        const baseSegments = isFile ? segments.slice(0, -1) : segments;
        if (!baseSegments.length) {
            return '/';
        }

        return `/${baseSegments.join('/')}/`;
    } catch (error) {
        console.warn('[Navbar] Failed to compute site base path:', error);
        return '/';
    }
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
        const injectLog = (isFileProtocol() || isOffline()) ? console.info : console.warn;
        injectLog(`[Component Loader] ✗ Cannot inject ${componentName} — applying inline fallback`);

                const fallback = INLINE_FALLBACKS[componentName] || `<!-- No fallback for ${componentName} -->`;

                element.outerHTML = fallback;
                // still execute any scripts on the page
                executeScripts(document.body);

                if (componentName === 'navbar') {
                        setTimeout(() => initializeNavbar(), 200);
                }

                document.dispatchEvent(new CustomEvent('componentLoaded', { detail: { componentName, fallback: true, timestamp: Date.now() } }));
                const fallbackInfo = (isFileProtocol() || isOffline()) ? console.info : console.warn;
                fallbackInfo(`[Component Loader] Fallback injected for ${componentName}`);
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

    normalizeGlobalAssets();

    if (elements.length === 0) {
        console.warn('[Component Loader] No components found on page');
        normalizeGlobalAssets();
        return;
    }

    for (const el of elements) {
        await injectComponent(el);
    }

    console.log(`[Component Loader] ✓ All ${elements.length} components loaded!`);
    normalizeGlobalAssets();
}

// EXPOSE TO WINDOW (NO IIFE!)
window.ComponentLoader = {
    load: loadComponent,
    init: initComponents,
    cache: CACHE,
    normalizeNavLinks: ensureNavbarLinks,
    resolveNavHref,
    canonicalizeNavTarget,
    computeSiteBasePath
};

document.addEventListener('componentLoaded', normalizeGlobalAssets);

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
