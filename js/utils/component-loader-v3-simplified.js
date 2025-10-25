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

// Resolve the best URL for a component and provide robust fallbacks
function resolveComponentURLs(componentName) {
    // Absolute root path works reliably on Vercel regardless of the current page path
    const absolute = `/components/${componentName}.html`;
    // Relative path for local file viewing (file://) or simple static servers
    const relative = `${COMPONENTS_PATH}${componentName}.html`;
    return [absolute, relative];
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

        throw lastError || new Error('Unknown fetch error');
    } catch (error) {
        console.error(`[Component Loader] ✗ Failed to load ${componentName}:`, error);
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
        console.error(`[Component Loader] ✗ Cannot inject ${componentName}`);
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
