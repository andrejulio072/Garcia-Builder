/**
 * GARCIA BUILDER - NAVBAR ENHANCED
 * Version: 4.0 Professional - Fully Optimized
 * Mobile-first responsive navigation with parallax hero
 * Last Updated: October 24, 2025
 */

(function() {
    'use strict';

    // ===== NAVBAR FUNCTIONALITY =====
    function initNavbar() {
        const menuToggle = document.getElementById('gb-menu-toggle');
        const menu = document.getElementById('gb-menu');

        if (!menuToggle || !menu) return;

        // Toggle menu on hamburger click
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const isActive = menu.classList.toggle('active');
            menuToggle.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', isActive);
            document.body.style.overflow = isActive ? 'hidden' : '';
            document.body.classList.toggle('gb-menu-open', isActive);
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!menu.contains(e.target) && !menuToggle.contains(e.target)) {
                closeMenu();
            }
        });

        // Close menu when clicking on a link
        const menuLinks = menu.querySelectorAll('.gb-menu-link');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                closeMenu();
            });
        });

        // Highlight current page
        const normalizePath = (rawPath) => {
            if (!rawPath) return '/index.html';
            const [pathWithoutQuery] = rawPath.split('?');
            if (pathWithoutQuery === '/' || pathWithoutQuery === '') {
                return '/index.html';
            }
            return pathWithoutQuery.startsWith('/') ? pathWithoutQuery : `/${pathWithoutQuery}`;
        };

        const currentPage = normalizePath(window.location.pathname);
        menuLinks.forEach(link => {
            const linkPage = normalizePath(link.getAttribute('href'));
            if (linkPage === currentPage) {
                link.classList.add('active');
            }
        });

        // Close menu on ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && menu.classList.contains('active')) {
                closeMenu();
            }
        });

        // Helper function to close menu
        function closeMenu() {
            menu.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            document.body.classList.remove('gb-menu-open');
        }
    }

    // ===== HERO PARALLAX EFFECT =====
    function initHeroParallax() {
        const heroSection = document.querySelector('.hero');
        if (!heroSection) return;

        let ticking = false;

        function handleScroll() {
            const scrollY = window.scrollY;
            const parallaxSpeed = 0.5;

            // Only apply parallax within viewport height
            if (scrollY < window.innerHeight) {
                heroSection.style.backgroundPositionY = `${scrollY * parallaxSpeed}px`;
            }
        }

        // Throttle scroll events for performance
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // ===== INITIALIZE ON DOM READY =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initNavbar();
            initHeroParallax();
        });
    } else {
        // DOM already loaded
        initNavbar();
        initHeroParallax();
    }

})();
