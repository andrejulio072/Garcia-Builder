/**
 * Legacy Component Loader bridge
 *
 * This file keeps backward compatibility for pages that still reference
 * `js/utils/component-loader.js` while delegating to the new
 * `component-loader-v3-simplified.js` implementation.
 *
 * If the v3 script cannot be fetched (network/CORS/offline), we fall back to
 * the previous inline loader so that the navbar/footer still render.
 */

(function () {
    'use strict';

    const VERSION = '20251027';

    // Avoid double-bootstrap if the new loader is already present
    if (window.ComponentLoader && typeof window.ComponentLoader.init === 'function') {
        console.debug('[Component Loader Bridge] ComponentLoader already present.');
        return;
    }

    function resolveResource(relativePath) {
        try {
            if (document.currentScript && document.currentScript.src) {
                return new URL(relativePath, document.currentScript.src).href;
            }
        } catch (err) {
            console.warn('[Component Loader Bridge] Unable to resolve resource URL:', err);
        }
        return relativePath;
    }

    function bootstrapV3WhenReady() {
        const attemptInit = () => {
            if (window.ComponentLoader && typeof window.ComponentLoader.init === 'function') {
                window.ComponentLoader.init();
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', attemptInit, { once: true });
        } else {
            attemptInit();
        }

        window.addEventListener('load', () => {
            if (window.ComponentLoader && typeof window.ComponentLoader.init === 'function') {
                const pending = document.querySelectorAll('[data-component]');
                if (pending.length) {
                    console.warn('[Component Loader Bridge] Pending components detected after load, retrying init.');
                    window.ComponentLoader.init();
                }
            }
        });
    }

    function legacyFallback() {
        console.warn('[Component Loader Bridge] Falling back to inline legacy loader.');

        const COMPONENTS_PATH = 'components/';
        const CACHE = {};

        async function loadComponent(componentName) {
            if (CACHE[componentName]) {
                return CACHE[componentName];
            }

            try {
                const response = await fetch(`${COMPONENTS_PATH}${componentName}.html`, { cache: 'no-store' });
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const html = await response.text();
                CACHE[componentName] = html;
                return html;
            } catch (error) {
                console.error(`[Legacy Component Loader] Failed to load ${componentName}:`, error);
                return `<!-- Component ${componentName} failed to load: ${error.message} -->`;
            }
        }

        function executeScripts(container) {
            const scripts = container.querySelectorAll('script');
            scripts.forEach((oldScript) => {
                const newScript = document.createElement('script');
                Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value));
                newScript.textContent = oldScript.textContent;
                oldScript.parentNode.replaceChild(newScript, oldScript);
            });
        }

        function initializeNavbar() {
            const menuToggle = document.getElementById('gb-menu-toggle');
            const menu = document.getElementById('gb-menu');

            if (!menuToggle || !menu) {
                console.warn('[Legacy Component Loader] Navbar elements not found');
                return;
            }

            const closeMenu = () => {
                menu.classList.remove('active');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            };

            menuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const isActive = menu.classList.toggle('active');
                menuToggle.classList.toggle('active');
                menuToggle.setAttribute('aria-expanded', isActive);
                document.body.style.overflow = isActive ? 'hidden' : '';
            });

            document.addEventListener('click', (e) => {
                if (!menu.contains(e.target) && !menuToggle.contains(e.target)) {
                    closeMenu();
                }
            });

            menu.querySelectorAll('.gb-menu-link').forEach((link) => {
                link.addEventListener('click', closeMenu);
            });

            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            menu.querySelectorAll('.gb-menu-link').forEach((link) => {
                if (link.getAttribute('href') === currentPage) {
                    link.classList.add('active');
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && menu.classList.contains('active')) {
                    closeMenu();
                }
            });
        }

        async function injectComponent(element) {
            const componentName = element.getAttribute('data-component');
            if (!componentName) return;

            const html = await loadComponent(componentName);
            if (!html || html.includes('failed to load')) {
                return;
            }

            element.outerHTML = html;
            executeScripts(document.body);

            if (componentName === 'navbar') {
                setTimeout(initializeNavbar, 50);
            }

            document.dispatchEvent(new CustomEvent('componentLoaded', {
                detail: { componentName, timestamp: Date.now(), fallback: true },
            }));
        }

        async function initComponents() {
            const elements = document.querySelectorAll('[data-component]');
            if (!elements.length) {
                return;
            }

            for (const el of elements) {
                // eslint-disable-next-line no-await-in-loop
                await injectComponent(el);
            }
        }

        window.ComponentLoader = {
            load: loadComponent,
            init: initComponents,
            cache: CACHE,
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initComponents, { once: true });
        } else {
            initComponents();
        }

        window.addEventListener('load', () => {
            const pending = document.querySelectorAll('[data-component]');
            if (pending.length) {
                initComponents();
            }
        });
    }

    const scriptUrl = resolveResource(`component-loader-v3-simplified.js?v=${VERSION}`);
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = false;
    script.onload = () => {
        console.log('[Component Loader Bridge] Loaded component-loader-v3-simplified.js');
        bootstrapV3WhenReady();
    };
    script.onerror = (error) => {
        console.error('[Component Loader Bridge] Failed to load v3 script.', error);
        legacyFallback();
    };

    (document.head || document.documentElement).appendChild(script);
})();
