// Garcia Builder - Navigation Manager Bridge
// Ensures legacy component path continues to work after script relocation.
(function bridgeNavigationManager() {
  if (window.GarciaNavigationManager) {
    return;
  }

  try {
    const currentScript = document.currentScript;
    const scriptSrc = currentScript && currentScript.src ? currentScript.src : '';
    const basePath = scriptSrc
      ? scriptSrc.replace(/\/js\/components\/navigation-manager\.js(?:\?.*)?$/i, '')
      : '';

    const loader = document.createElement('script');
    loader.src = `${basePath}/js/navigation-manager.js`;
    loader.defer = true;
    loader.onload = () => {
      if (!window.GarciaNavigationManager) {
        console.warn('Navigation manager bridge loaded script but API is still missing.');
      }
    };
    loader.onerror = (error) => {
      console.error('Failed to load navigation manager from bridge script.', error);
    };

    document.head.appendChild(loader);
  } catch (error) {
    console.error('Navigation manager bridge initialization failed.', error);
  }
})();
