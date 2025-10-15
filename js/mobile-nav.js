// Mobile Navigation - Standalone hamburger menu implementation
// This script adds a hamburger menu for mobile devices

(function() {
    'use strict';
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileNav);
    } else {
        initMobileNav();
    }
    
    function initMobileNav() {
        const navbar = document.querySelector('.navbar .container.inner');
        if (!navbar) return;
        
        // Check if hamburger button already exists
        if (navbar.querySelector('.hamburger-btn')) return;
        
        // Create hamburger button
        const btn = document.createElement('button');
        btn.className = 'hamburger-btn';
        btn.setAttribute('type', 'button');
        btn.setAttribute('aria-label', 'Open menu');
        btn.innerHTML = '<span class="hamburger-lines"></span>';
        
        // Insert hamburger before language selector
        const lang = navbar.querySelector('.lang');
        if (lang) {
            navbar.insertBefore(btn, lang);
        } else {
            navbar.appendChild(btn);
        }
        
        // Build slide-out menu if it doesn't exist
        let overlay = document.getElementById('gb-more-menu');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'gb-more-menu';
            overlay.className = 'gb-more-menu';
            overlay.innerHTML = `
                <div class="gb-more-content">
                    <div class="gb-more-header">
                        <strong>Menu</strong>
                        <button class="gb-close" type="button" aria-label="Close">&times;</button>
                    </div>
                    <nav class="gb-more-nav"></nav>
                </div>`;
            document.body.appendChild(overlay);
            
            // Close button handler
            overlay.querySelector('.gb-close').addEventListener('click', () => {
                overlay.classList.remove('open');
            });
            
            // Click outside to close
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.classList.remove('open');
                }
            });
        }
        
        const moreNav = overlay.querySelector('.gb-more-nav');
        if (!moreNav) return;
        
        // Clear existing menu items
        moreNav.innerHTML = '';
        
        // Copy navigation links to slide-out menu
        const navLinks = navbar.querySelectorAll('.nav a');
        navLinks.forEach((link, index) => {
            const item = document.createElement('div');
            item.className = 'gb-item';
            item.style.setProperty('--i', index);
            
            const clone = link.cloneNode(true);
            clone.removeAttribute('class'); // Remove active class from clones
            
            item.appendChild(clone);
            moreNav.appendChild(item);
        });
        
        // Add auth buttons to mobile menu if they exist
        const authButtons = document.querySelector('#auth-buttons');
        if (authButtons && authButtons.children.length > 0) {
            const authContainer = document.createElement('div');
            authContainer.className = 'gb-item';
            authContainer.style.setProperty('--i', navLinks.length);
            authContainer.style.borderTop = '1px solid var(--line)';
            authContainer.style.marginTop = '1rem';
            authContainer.style.paddingTop = '1rem';
            
            // Clone auth buttons
            Array.from(authButtons.children).forEach(btn => {
                const clone = btn.cloneNode(true);
                clone.style.width = '100%';
                clone.style.marginBottom = '0.5rem';
                authContainer.appendChild(clone);
            });
            
            moreNav.appendChild(authContainer);
        }
        
        // Hamburger button click handler
        btn.addEventListener('click', () => {
            overlay.classList.add('open');
        });
        
        // Handle escape key to close menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('open')) {
                overlay.classList.remove('open');
            }
        });
    }
})();
