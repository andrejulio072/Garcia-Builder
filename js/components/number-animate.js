// Simple number animation for stats (counts up when visible)
(() => {
  const animateValue = (el, endValue, duration = 1200, prefix = '', suffix = '') => {
    const isPercent = /%$/.test(endValue.toString());
    const numericTarget = parseFloat(endValue);
    const start = 0;
    const startTime = performance.now();
    const hasDecimals = /\./.test(endValue.toString());
    const decimals = hasDecimals ? (endValue.toString().split('.')[1] || '').length : 0;

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      let currentValue = start + (numericTarget - start) * eased;
      if (hasDecimals) {
        currentValue = Number(currentValue.toFixed(Math.min(decimals, 1))); // cap at 1 decimal for readability
      } else {
        currentValue = Math.floor(currentValue);
      }
      const text = `${prefix}${currentValue}${isPercent ? '%' : ''}${suffix}`;
      el.textContent = text;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        const finalValue = hasDecimals
          ? Number(numericTarget.toFixed(Math.min(decimals, 1))).toString()
          : Math.trunc(numericTarget).toString();
        el.textContent = `${prefix}${finalValue}${isPercent ? '%' : ''}${suffix}`;
      }
    };
    requestAnimationFrame(tick);
  };

  const init = () => {
    const stats = document.querySelectorAll('.stat-number');
    if (!stats.length) return;

    // Store original text for mixed values (e.g., 4.9)
    stats.forEach((el) => el.setAttribute('data-target', el.textContent.trim()));

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const targetRaw = el.getAttribute('data-target') || '0';
          const endsWithPlus = /\+$/.test(targetRaw);
          const endsWithPercent = /%$/.test(targetRaw);
          const numeric = parseFloat(targetRaw);

          if (!isNaN(numeric)) {
            const displaySuffix = endsWithPlus ? '+' : '';
            const end = endsWithPercent ? `${numeric}%` : targetRaw.replace('+','');
            animateValue(el, end, 1400, '', displaySuffix);
          }
          io.unobserve(el);
        }
      });
    }, { threshold: 0.3 });

    stats.forEach((el) => io.observe(el));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
