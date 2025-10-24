/**
 * Analytics Test Helper (uso temporário em ambiente de desenvolvimento/preview)
 * Permite disparar rapidamente eventos GA4 já mapeados no GTM sem ter que digitar dataLayer.push manualmente.
 * NÃO deixar em produção definitiva — remover depois que a instrumentação for validada.
 */

;(function(global){
  const DEFAULT_ITEM = ({
    item_id: 'premium_monthly',
    item_name: 'Plano Premium Mensal',
    price: 47,
    quantity: 1,
    item_category: 'coaching_plan'
  });

  function push(eventObj){
    if(!global.dataLayer){
      console.warn('[analytics-test-helper] dataLayer ainda não existe. GTM carregou?');
      return;
    }
    global.dataLayer.push(eventObj);
    console.info('[analytics-test-helper] Enviado:', eventObj);
  }

  const helpers = {
    listEvents(){
      if(!global.dataLayer) return [];
      return global.dataLayer.map(e => e.event).filter(Boolean);
    },
    last(eventName){
      if(!global.dataLayer) return null;
      return [...global.dataLayer].reverse().find(e => e.event === eventName) || null;
    },
    planSelection(value=47, currency='GBP'){
      push({
        event: 'plan_selection',
        items: [DEFAULT_ITEM],
        value,
        currency
      });
    },
    beginCheckout(value=47, currency='GBP'){
      push({
        event: 'begin_checkout',
        items: [DEFAULT_ITEM],
        value,
        currency
      });
    },
    generateLead(form_id='contact_form_main', source='contact_page'){
      push({
        event: 'generate_lead',
        form_id,
        source
      });
    },
    signUp(method='email'){
      push({
        event: 'sign_up',
        method
      });
    },
    downloadGuide(file_name='guia_inicial.pdf', guide_id='starter_v1', source='footer_cta'){
      push({
        event: 'download_guide',
        file_name,
        guide_id,
        source
      });
    },
    purchase(value=47, currency='GBP'){
      push({
        event: 'purchase',
        transaction_id: 'debug_'+Date.now(),
        value,
        currency,
        items: [DEFAULT_ITEM]
      });
    },
    batch(){
      this.planSelection();
      this.beginCheckout();
      this.generateLead();
      this.signUp();
      this.downloadGuide();
      this.purchase();
    }
  };

  global.GBAnalyticsTest = helpers;
  console.info('[analytics-test-helper] Registrado como GBAnalyticsTest. Exemplos:');
  console.info('GBAnalyticsTest.purchase()');
  console.info('GBAnalyticsTest.planSelection()');
  console.info('GBAnalyticsTest.batch() // dispara todos em sequência');
})(window);
