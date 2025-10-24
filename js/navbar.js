/**
 * GARCIA BUILDER - NAVBAR ENHANCED
 * Version: 3.0 Professional
 * Mobile-first responsive navigation
 */

document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.gb-hamburger');
    const menu = document.querySelector('.gb-menu');
    const menuLinks = document.querySelectorAll('.gb-menu-link');
    
    // Toggle menu
    if (hamburger && menu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            menu.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (menu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    }
    
    // Close menu when clicking on a link
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (menu.classList.contains('active')) {
                hamburger.classList.remove('active');
                menu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (menu.classList.contains('active')) {
            if (!menu.contains(event.target) && !hamburger.contains(event.target)) {
                hamburger.classList.remove('active');
                menu.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
    
    // Highlight active page
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    menuLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
            link.classList.add('active');
        }
    });
});
