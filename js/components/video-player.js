/**
 * GARCIA BUILDER - VIDEO PLAYER MODULE
 * Version: 1.0 Professional
 * Lazy-loaded YouTube video player with analytics
 * Last Updated: October 25, 2025
 */

(function() {
    'use strict';

    /**
     * Initialize video player functionality
     * Converts thumbnail to YouTube iframe on click
     */
    function initVideoPlayer() {
        const container = document.getElementById('gb-video');
        if (!container) return;

        const playButton = container.querySelector('.gb-video-play');
        const videoId = container.getAttribute('data-video-id');

        /**
         * Activate YouTube iframe
         * Replaces thumbnail with embedded video
         */
        function activateVideo() {
            if (!videoId) return;

            const iframe = document.createElement('iframe');
            iframe.setAttribute('allowfullscreen', '');
            iframe.setAttribute('title', 'Garcia Builder Method');
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
            
            // Styling
            iframe.style.position = 'absolute';
            iframe.style.top = '0';
            iframe.style.left = '0';
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            
            // YouTube nocookie domain for privacy
            iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0&modestbranding=1`;
            
            // Replace content
            container.innerHTML = '';
            container.appendChild(iframe);
            
            // Track video play event
            trackVideoPlay();
        }

        /**
         * Handle keyboard accessibility
         */
        function handleKeyPress(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                activateVideo();
            }
        }

        /**
         * Track video play in Google Analytics
         */
        function trackVideoPlay() {
            try {
                if (window.gtag) {
                    gtag('event', 'play_video', {
                        event_category: 'engagement',
                        event_label: 'homepage_demo',
                        video_id: videoId
                    });
                }

                if (window.dataLayer) {
                    dataLayer.push({
                        event: 'video_play',
                        video_id: videoId,
                        video_location: 'homepage_hero'
                    });
                }
            } catch(e) {
                console.warn('[Video Player] Tracking failed:', e);
            }
        }

        // Event listeners
        if (playButton) {
            playButton.addEventListener('click', activateVideo);
        }
        container.addEventListener('keydown', handleKeyPress);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVideoPlayer);
    } else {
        initVideoPlayer();
    }

})();
