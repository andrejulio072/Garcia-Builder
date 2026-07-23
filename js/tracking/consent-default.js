(function () {
  'use strict';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  var denied = {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted'
  };
  var state = Object.assign({}, denied);

  try {
    var stored = JSON.parse(window.localStorage.getItem('gb_consent_v1') || 'null');
    var choices = stored && stored.choices && typeof stored.choices === 'object'
      ? stored.choices
      : null;

    if (choices) {
      ['ad_storage', 'analytics_storage', 'ad_user_data', 'ad_personalization'].forEach(function (key) {
        state[key] = choices[key] === 'granted' ? 'granted' : 'denied';
      });
    } else if (stored && stored.status === 'granted') {
      state.ad_storage = 'granted';
      state.analytics_storage = 'granted';
      state.ad_user_data = 'granted';
      state.ad_personalization = 'granted';
    }
  } catch (_) {
    state = denied;
  }

  window.gtag('consent', 'default', state);
})();