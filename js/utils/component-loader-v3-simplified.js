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

                // Provide a lightweight, safe inline fallback so opening files directly still shows a usable UI.
                const fallback = (function(name) {
                        if (name === 'navbar') {
                                return `
<nav class="gb-navbar gb-navbar-fallback" role="navigation" aria-label="Main navigation (fallback)">
    <div class="container">
        <a href="index.html" class="gb-logo-section">Garcia Builder</a>
        <div class="gb-navbar-controls">
            <a href="pages/auth/login.html" class="gb-btn-link">Login</a>
            <a href="pricing.html" class="gb-btn-primary-small">Register</a>
        </div>
    </div>
</nav>`;
                        }
                        if (name === 'footer') {
                                return `
<footer class="gb-footer gb-footer-fallback" aria-label="Site footer (fallback)">
    <div class="container"><div style="padding:16px;text-align:center;color:#ddd;font-size:14px;">Garcia Builder — <a href="contact.html">Contact</a> · <a href="privacy.html">Privacy</a></div></div>
</footer>`;
                        }
                        return `<!-- No fallback for ${name} -->`;
                })(componentName);

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
