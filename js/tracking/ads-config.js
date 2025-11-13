// Central Ads / Conversion configuration
// Prepara labels e IDs reutilizados em páginas (success, pricing, etc.)
// Defina aqui quando tiver o valor real de conversão Google Ads (ex: 'AbCdEfGhIjkLmNoPqR')

window.ADS_CONFIG = window.ADS_CONFIG || {};
window.ADS_CONFIG.google = window.ADS_CONFIG.google || {};

if (typeof window.ADS_CONFIG.google.conversionLabel === 'undefined') {
  window.ADS_CONFIG.google.conversionLabel = window.AW_CONVERSION_LABEL || '';
}

if (typeof window.ADS_CONFIG.google.ga4MeasurementId === 'undefined') {
  const envGa4Id = (window.__ENV && window.__ENV.GA4_MEASUREMENT_ID) || window.GA4_MEASUREMENT_ID || window.GA_MEASUREMENT_ID || '';
  window.ADS_CONFIG.google.ga4MeasurementId = envGa4Id || '';
}

// Sincroniza window.AW_CONVERSION_LABEL se preenchido posteriormente via script inline
if (window.AW_CONVERSION_LABEL && !window.ADS_CONFIG.google.conversionLabel) {
  window.ADS_CONFIG.google.conversionLabel = window.AW_CONVERSION_LABEL;
}

if (window.ADS_CONFIG.google.ga4MeasurementId && !window.GA4_MEASUREMENT_ID) {
  window.GA4_MEASUREMENT_ID = window.ADS_CONFIG.google.ga4MeasurementId;
}

// Helper de acesso seguro
window.getGoogleConversionLabel = function(){
  return (window.ADS_CONFIG && window.ADS_CONFIG.google && window.ADS_CONFIG.google.conversionLabel) || '';
};
