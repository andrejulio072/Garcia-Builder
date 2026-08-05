// Load non-critical styles after the initial page and hero resources settle.
(function loadDeferredStyles() {
  let started = false;

  function start() {
    if (started) return;
    started = true;
    document.querySelectorAll('link[data-deferred-stylesheet]').forEach((placeholder) => {
      const href = placeholder.getAttribute('data-href');
      if (!href || document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) return;
      // Activate the original node in place so the declared cascade order is
      // retained when framework styles are deferred.
      placeholder.href = href;
      placeholder.rel = 'stylesheet';
      placeholder.removeAttribute('data-href');
      placeholder.removeAttribute('data-deferred-stylesheet');
    });
  }

  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
})();
