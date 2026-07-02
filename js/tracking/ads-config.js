// Central Ads / Conversion configuration
// Prepara labels e IDs reutilizados em páginas (success, pricing, etc.)
// Defina aqui quando tiver o valor real de conversão Google Ads (ex: 'AbCdEfGhIjkLmNoPqR')

window.ADS_CONFIG = window.ADS_CONFIG || {};
window.ADS_CONFIG.google = window.ADS_CONFIG.google || {};

if (typeof window.ADS_CONFIG.google.conversionLabel === 'undefined') {
  window.ADS_CONFIG.google.conversionLabel = window.AW_CONVERSION_LABEL || '';
}

// GA4 is managed by Google Tag Manager. Keep the measurement ID available for
// diagnostics/config only; do not initialize GA4 directly in frontend code.
if (!window.ADS_CONFIG.google.ga4MeasurementId) {
  const envGa4Id = (window.__ENV && (window.__ENV.NEXT_PUBLIC_GA4_MEASUREMENT_ID || window.__ENV.GA4_MEASUREMENT_ID)) ||
    window.NEXT_PUBLIC_GA4_MEASUREMENT_ID ||
    window.GA4_MEASUREMENT_ID ||
    '';
  window.ADS_CONFIG.google.ga4MeasurementId = (envGa4Id && typeof envGa4Id === 'string') ? envGa4Id.trim().toUpperCase() : '';
}

// Sincroniza window.AW_CONVERSION_LABEL se preenchido posteriormente via script inline
if (window.AW_CONVERSION_LABEL && !window.ADS_CONFIG.google.conversionLabel) {
  window.ADS_CONFIG.google.conversionLabel = window.AW_CONVERSION_LABEL;
}

if (window.ADS_CONFIG.google.ga4MeasurementId && !window.NEXT_PUBLIC_GA4_MEASUREMENT_ID) {
  window.NEXT_PUBLIC_GA4_MEASUREMENT_ID = window.ADS_CONFIG.google.ga4MeasurementId;
}

// Helper de acesso seguro
window.getGoogleConversionLabel = function(){
  return (window.ADS_CONFIG && window.ADS_CONFIG.google && window.ADS_CONFIG.google.conversionLabel) || '';
};
