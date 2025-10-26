// Animate KPI counters when they enter the viewport
(() => {
  const animateValue = (el, target, options = {}) => {
    const {
      duration = 1200,
      prefix = '',
      suffix = '',
      decimals = 0,
      isPercent = false,
      start = 0
    } = options;

    const factor = Math.pow(10, decimals);
    const formatValue = (value) => {
      let val = Number.isFinite(value) ? value : 0;
      if (decimals > 0) {
        val = Math.round(val * factor) / factor;
        return `${prefix}${val.toFixed(decimals)}${isPercent ? '%' : ''}${suffix}`;
      }
      val = Math.round(val);
      return `${prefix}${val}${isPercent ? '%' : ''}${suffix}`;
    };

    el.textContent = formatValue(start);
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = start + (target - start) * eased;
      el.textContent = formatValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = formatValue(target);
      }
    };

    requestAnimationFrame(tick);
  };

  const parseNumericTarget = (raw) => parseFloat(raw.replace(/[^0-9.,-]/g, '').replace(',', '.'));

  const init = () => {
    const stats = document.querySelectorAll('.stat-number');
    if (!stats.length) return;

    stats.forEach((el) => {
      if (!el.hasAttribute('data-target')) {
        el.setAttribute('data-target', el.textContent.trim());
      }
    });

    const observer = new IntersectionObserver((entries, io) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        if (el.dataset.animated === '1') {
          io.unobserve(el);
          return;
        }

        const rawTarget = (el.getAttribute('data-target') || '0').trim();
        const prefix = el.dataset.prefix || '';
        let suffix = el.dataset.suffix || '';
        const decimalsAttr = el.getAttribute('data-decimals');
        let decimals = Number.isFinite(parseInt(decimalsAttr, 10)) ? Math.max(0, parseInt(decimalsAttr, 10)) : undefined;
        const isPercent = rawTarget.endsWith('%') || suffix === '%';
        const hasPlus = rawTarget.endsWith('+');

        if (!suffix && hasPlus) {
          suffix = '+';
        }

        let numericTarget = parseNumericTarget(rawTarget);
        if (!Number.isFinite(numericTarget)) {
          numericTarget = 0;
        }

        if (decimals === undefined) {
          const fractional = rawTarget.split('.')[1];
          decimals = fractional ? Math.min(fractional.replace(/[^0-9]/g, '').length, 3) : 0;
        }

        const startAttr = el.getAttribute('data-start');
        const start = Number.isFinite(parseFloat(startAttr)) ? parseFloat(startAttr) : 0;

        animateValue(el, numericTarget, {
          duration: 1400,
          prefix,
          suffix,
          decimals,
          isPercent,
          start
        });

        el.dataset.animated = '1';
        io.unobserve(el);
      });
    }, { threshold: 0.3 });

    stats.forEach((el) => observer.observe(el));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
