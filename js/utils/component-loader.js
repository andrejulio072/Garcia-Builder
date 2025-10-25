/**
 * GARCIA BUILDER - COMPONENT LOADER
 * Version: 2.0 Production-Ready
 * Dynamic HTML component loading system with script re-execution
 * Last Updated: October 25, 2025
 * 
 * Usage: Add data-component="navbar" to any element to load that component
 * 
 * FIXES:
 * - Uses relative paths (components/ not /components/)
 * - Re-executes inline scripts after component injection
 * - Initializes navbar.js functionality after loading
 */

(function() {
    'use strict';

    // Use RELATIVE path for better compatibility across environments
    const COMPONENTS_PATH = 'components/';
    const CACHE = {};

    /**
     * Load HTML component from external file
     * @param {string} componentName - Name of the component file (without .html)
     * @returns {Promise<string>} HTML content
     */
    async function loadComponent(componentName) {
        // Check cache first
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
            // Return placeholder to avoid breaking page layout
            return `<!-- Component ${componentName} failed to load: ${error.message} -->`;
        }
    }

    /**
     * Execute inline scripts from injected HTML
     * @param {HTMLElement} container - Container with injected HTML
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
     * Initialize navbar functionality after injection
     * Ensures menu toggle, language selector, etc. work correctly
     */
    function initializeNavbar() {
        const menuToggle = document.getElementById('gb-menu-toggle');
        const menu = document.getElementById('gb-menu');

        if (!menuToggle || !menu) {
            console.warn('[Component Loader] Navbar elements not found');
            return;
        }

        console.log('[Component Loader] Initializing navbar functionality...');

        // Menu toggle
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const isActive = menu.classList.toggle('active');
            menuToggle.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', isActive);
            document.body.style.overflow = isActive ? 'hidden' : '';
        });

        // Click outside to close
        document.addEventListener('click', function(e) {
            if (!menu.contains(e.target) && !menuToggle.contains(e.target)) {
                menu.classList.remove('active');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });

        // Close on menu link click
        const menuLinks = menu.querySelectorAll('.gb-menu-link');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                menu.classList.remove('active');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        // Highlight current page
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        menuLinks.forEach(link => {
            const linkPage = link.getAttribute('href');
            if (linkPage === currentPage) {
                link.classList.add('active');
            }
        });

        // Escape key to close
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
     * Inject component HTML into placeholder element
     * @param {HTMLElement} element - Element with data-component attribute
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

        // Replace element with component HTML
        element.outerHTML = html;
        
        // Execute any inline scripts in the component
        executeScripts(document.body);
        
        // Initialize navbar functionality if navbar was loaded
        if (componentName === 'navbar') {
            // Wait a tick for DOM to settle
            setTimeout(() => {
                initializeNavbar();
            }, 50);
        }
        
        // Trigger custom event for component loaded
        document.dispatchEvent(new CustomEvent('componentLoaded', {
            detail: { componentName, timestamp: Date.now() }
        }));

        console.log(`[Component Loader] ✓ Injected ${componentName}`);
    }

    /**
     * Initialize all components on page
     */
    async function initComponents() {
        const elements = document.querySelectorAll('[data-component]');
        console.log(`[Component Loader] Found ${elements.length} components to load`);
        
        if (elements.length === 0) {
            console.warn('[Component Loader] No components found on page');
            return;
        }

        // Load components sequentially to maintain order
        for (const el of elements) {
            await injectComponent(el);
        }
        
        console.log(`[Component Loader] ✓ All ${elements.length} components loaded successfully`);
    }

    /**
     * Public API
     */
    window.ComponentLoader = {
        load: loadComponent,
        init: initComponents,
        cache: CACHE // Expose cache for debugging
    };

    // MULTI-TRIGGER INITIALIZATION - Force execution in all scenarios
    console.log('[Component Loader] Initializing with readyState:', document.readyState);
    
    // Trigger 1: DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('[Component Loader] Trigger 1: DOMContentLoaded fired');
            initComponents();
        });
    } else {
        // Trigger 2: Already loaded - run immediately
        console.log('[Component Loader] Trigger 2: Document already ready, running immediately');
        initComponents();
    }
    
    // Trigger 3: Window load (fallback)
    window.addEventListener('load', () => {
        console.log('[Component Loader] Trigger 3: Window load event');
        // Check if components were already loaded
        const unloadedComponents = document.querySelectorAll('[data-component]');
        if (unloadedComponents.length > 0) {
            console.warn('[Component Loader] Found unloaded components, retrying...');
            initComponents();
        }
    });
    
    // Trigger 4: Immediate check after 100ms (safety net)
    setTimeout(() => {
        const unloadedComponents = document.querySelectorAll('[data-component]');
        if (unloadedComponents.length > 0) {
            console.warn('[Component Loader] Trigger 4: Safety check - components not loaded, forcing...');
            initComponents();
        }
    }, 100);

})();
