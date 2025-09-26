/*! i18n-shim: provides window.__i18n over GB_I18N to keep legacy injectors working */
(function(){
  if (window.__i18n) return;
  function get(){ try{ return (window.GB_I18N && window.GB_I18N.getLang && window.GB_I18N.getLang()) || 'en'; } catch { return 'en'; } }
  function set(next){
    if(window.GB_I18N && window.GB_I18N.setLang){ window.GB_I18N.setLang(next); }
  }
  window.__i18n = { get, set };
})();