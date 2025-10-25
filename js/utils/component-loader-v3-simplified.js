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

/**
 * Load HTML component from external file
 */
async function loadComponent(componentName) {
    if (CACHE[componentName]) {
        console.log(`[Component Loader] Using cached ${componentName}`);
        return CACHE[componentName];
    }

    try {
        const url = `${COMPONENTS_PATH}${componentName}.html`;
        console.log(`[Component Loader] Fetching ${url}...`);
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const html = await response.text();
        CACHE[componentName] = html;
        console.log(`[Component Loader] ✓ Loaded ${componentName} (${html.length} chars)`);
        return html;
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
 * Initialize navbar functionality
 */
function initializeNavbar() {
    const menuToggle = document.getElementById('gb-menu-toggle');
    const menu = document.getElementById('gb-menu');

    if (!menuToggle || !menu) {
        console.warn('[Component Loader] Navbar elements not found');
        return;
    }

    console.log('[Component Loader] Initializing navbar...');

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

    console.log('[Component Loader] ✓ Navbar initialized');
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
        setTimeout(() => {
            initializeNavbar();
        }, 50);
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
