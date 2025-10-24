/**
 * GARCIA BUILDER - COMPONENT LOADER
 * Version: 1.0 Professional
 * Dynamic HTML component loading system
 * Last Updated: October 25, 2025
 * 
 * Usage: Add data-component="navbar" to any element to load that component
 */

(function() {
    'use strict';

    const COMPONENTS_PATH = '/components/';
    const CACHE = {};

    /**
     * Load HTML component from external file
     * @param {string} componentName - Name of the component file (without .html)
     * @returns {Promise<string>} HTML content
     */
    async function loadComponent(componentName) {
        // Check cache first
        if (CACHE[componentName]) {
            return CACHE[componentName];
        }

        try {
            const response = await fetch(`${COMPONENTS_PATH}${componentName}.html`);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${componentName}`);
            }
            const html = await response.text();
            CACHE[componentName] = html;
            return html;
        } catch (error) {
            console.error(`[Component Loader] Error loading ${componentName}:`, error);
            return '';
        }
    }

    /**
     * Inject component HTML into placeholder element
     * @param {HTMLElement} element - Element with data-component attribute
     */
    async function injectComponent(element) {
        const componentName = element.getAttribute('data-component');
        if (!componentName) return;

        const html = await loadComponent(componentName);
        if (html) {
            element.outerHTML = html;
            
            // Trigger custom event for component loaded
            document.dispatchEvent(new CustomEvent('componentLoaded', {
                detail: { componentName }
            }));
        }
    }

    /**
     * Initialize all components on page
     */
    async function initComponents() {
        const elements = document.querySelectorAll('[data-component]');
        const promises = Array.from(elements).map(el => injectComponent(el));
        await Promise.all(promises);
        
        console.log(`[Component Loader] Loaded ${elements.length} components`);
    }

    /**
     * Public API
     */
    window.ComponentLoader = {
        load: loadComponent,
        init: initComponents
    };

    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initComponents);
    } else {
        initComponents();
    }

})();
