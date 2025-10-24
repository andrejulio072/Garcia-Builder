// Central Ads / Conversion configuration
// Prepara labels e IDs reutilizados em páginas (success, pricing, etc.)
// Defina aqui quando tiver o valor real de conversão Google Ads (ex: 'AbCdEfGhIjkLmNoPqR')
window.ADS_CONFIG = window.ADS_CONFIG || {
  google: {
    conversionLabel: window.AW_CONVERSION_LABEL || '' // manter compatibilidade com lógica existente
  }
};

// Sincroniza window.AW_CONVERSION_LABEL se preenchido posteriormente via script inline
if (window.AW_CONVERSION_LABEL && !window.ADS_CONFIG.google.conversionLabel) {
  window.ADS_CONFIG.google.conversionLabel = window.AW_CONVERSION_LABEL;
}

// Helper de acesso seguro
window.getGoogleConversionLabel = function(){
  return (window.ADS_CONFIG && window.ADS_CONFIG.google && window.ADS_CONFIG.google.conversionLabel) || '';
};
