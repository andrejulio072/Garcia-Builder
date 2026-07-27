(function () {
  if (window.GB_COACHING_PLATFORM) return;
  const configured = (window.__ENV && window.__ENV.COACHING_PLATFORM_NAME) || 'OWNER_CONFIRMATION_REQUIRED';
  window.GB_COACHING_PLATFORM = {
    name: configured
  };
})();
