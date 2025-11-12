/**
 * GARCIA BUILDER - VIDEO PLAYER MODULE
 * Version: 1.0 Professional
 * Lazy-loaded YouTube video player with analytics
 * Last Updated: October 25, 2025
 */

(function() {
    'use strict';

    function initVideoPlayers() {
        const containers = document.querySelectorAll('[data-video-id]');
        if (!containers.length) {
            return;
        }

        containers.forEach((container) => {
            if (!container || container.dataset.videoInit === '1') {
                return;
            }

            container.dataset.videoInit = '1';

            const videoId = container.getAttribute('data-video-id');
            if (!videoId) {
                return;
            }

            const playButton = container.querySelector('.gb-video-play');
            const analyticsLabel = container.getAttribute('data-analytics-label') || 'homepage_demo';
            const analyticsLocation = container.getAttribute('data-analytics-location') || 'homepage_hero';
            const iframeTitle = container.getAttribute('data-video-title') || 'Garcia Builder Method';
            const shouldLoop = container.getAttribute('data-loop') !== 'false';
            const shouldMute = container.getAttribute('data-mute') !== 'false';
            const showControls = container.getAttribute('data-controls') !== 'false';

            function activateVideo() {
                if (container.dataset.videoActive === '1') {
                    return;
                }

                container.dataset.videoActive = '1';

                const iframe = document.createElement('iframe');
                iframe.setAttribute('allowfullscreen', '');
                iframe.setAttribute('title', iframeTitle);
                iframe.setAttribute('frameborder', '0');
                iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');

                iframe.style.position = 'absolute';
                iframe.style.top = '0';
                iframe.style.left = '0';
                iframe.style.width = '100%';
                iframe.style.height = '100%';

                const params = new URLSearchParams({
                    autoplay: '1',
                    rel: '0',
                    modestbranding: '1',
                    playsinline: '1'
                });

                if (shouldMute) {
                    params.set('mute', '1');
                }

                if (!showControls) {
                    params.set('controls', '0');
                }

                if (shouldLoop) {
                    params.set('loop', '1');
                    params.set('playlist', videoId);
                }

                iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${params.toString()}`;

                container.innerHTML = '';
                container.appendChild(iframe);

                trackVideoPlay(videoId, analyticsLabel, analyticsLocation);
            }

            function handleKeyPress(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    activateVideo();
                }
            }

            if (playButton) {
                playButton.addEventListener('click', activateVideo);
            }

            container.addEventListener('click', function(event) {
                // Avoid double triggering when clicking the button itself (already handled)
                if (event.target === playButton || (playButton && playButton.contains(event.target))) {
                    return;
                }
                activateVideo();
            });

            container.addEventListener('keydown', handleKeyPress);
        });
    }

    function trackVideoPlay(videoId, label, location) {
        try {
            if (window.gtag) {
                gtag('event', 'play_video', {
                    event_category: 'engagement',
                    event_label: label,
                    video_id: videoId
                });
            }

            if (window.dataLayer) {
                window.dataLayer.push({
                    event: 'video_play',
                    video_id: videoId,
                    video_location: location
                });
            }
        } catch (e) {
            console.warn('[Video Player] Tracking failed:', e);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVideoPlayers);
    } else {
        initVideoPlayers();
    }

})();
