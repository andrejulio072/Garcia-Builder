/**
 * 🎯 GARCIA BUILDER - STRIPE DISCOUNT INTEGRATION
 * Sistema de integração para planos com desconto direto no Stripe
 * Implementa os descontos de 3/6/12 meses automaticamente
 */

(function() {
  'use strict';

  // Configuração dos descontos por período
  const PERIOD_DISCOUNTS = {
    monthly: { months: 1, discount: 0, label: 'Monthly' },
    quarterly: { months: 3, discount: 10, label: '3 Months' },
    biannual: { months: 6, discount: 15, label: '6 Months' },
    annual: { months: 12, discount: 25, label: '12 Months' }
  };

  // Base payment links (monthly prices)
  const BASE_PAYMENT_LINKS = {
    starter: "https://buy.stripe.com/7sY6oG8qsexmbXEfkyak000",
    beginner: "https://buy.stripe.com/6oU5kC7mobla2n48Waak001", 
    essentials: "https://buy.stripe.com/14A14m6ik74U9Pw2xMak002",
    full: "https://buy.stripe.com/bJe3cu5egbla7Hodcqak003",
    elite: "https://buy.stripe.com/5kQdR85eg1KA1j04FUak004"
  };

  // Preços base em GBP para cálculo de desconto
  const BASE_PRICES = {
    starter: 75,
    beginner: 95,
    essentials: 115,
    full: 155,
    elite: 230
  };

  /**
   * Gera um payment link personalizado com desconto aplicado
   * @param {string} planKey - Chave do plano (starter, beginner, etc.)
   * @param {string} period - Período selecionado (monthly, quarterly, etc.)
   * @returns {string} URL do payment link com parâmetros de desconto
   */
  function generateDiscountedPaymentLink(planKey, period = 'monthly') {
    const baseLink = BASE_PAYMENT_LINKS[planKey];
    const periodConfig = PERIOD_DISCOUNTS[period];
    
    if (!baseLink || !periodConfig) {
      console.warn(`Invalid plan key (${planKey}) or period (${period})`);
      return baseLink || '#';
    }

    // Se for mensal, retorna o link base
    if (period === 'monthly') {
      return baseLink;
    }

    // Para planos com desconto, adiciona parâmetros customizados
    const basePrice = BASE_PRICES[planKey];
    const discountedPrice = Math.round(basePrice * (1 - periodConfig.discount / 100));
    const totalPrice = discountedPrice * periodConfig.months;
    const savings = (basePrice - discountedPrice) * periodConfig.months;

    // Cria URL com parâmetros personalizados
    const url = new URL(baseLink);
    url.searchParams.set('client_reference_id', `${planKey}_${period}_${Date.now()}`);
    url.searchParams.set('custom_plan_period', period);
    url.searchParams.set('custom_months', periodConfig.months.toString());
    url.searchParams.set('custom_discount', periodConfig.discount.toString());
    url.searchParams.set('custom_original_price', basePrice.toString());
    url.searchParams.set('custom_discounted_price', discountedPrice.toString());
    url.searchParams.set('custom_total_price', totalPrice.toString());
    url.searchParams.set('custom_savings', savings.toString());

    return url.toString();
  }

  /**
   * Calcula o preço com desconto aplicado
   * @param {string} planKey - Chave do plano
   * @param {string} period - Período selecionado
   * @returns {object} Objeto com preços calculados
   */
  function calculateDiscountedPricing(planKey, period = 'monthly') {
    const basePrice = BASE_PRICES[planKey];
    const periodConfig = PERIOD_DISCOUNTS[period];
    
    if (!basePrice || !periodConfig) {
      return null;
    }

    const discountedMonthlyPrice = Math.round(basePrice * (1 - periodConfig.discount / 100));
    const totalPrice = discountedMonthlyPrice * periodConfig.months;
    const originalTotalPrice = basePrice * periodConfig.months;
    const totalSavings = originalTotalPrice - totalPrice;
    const monthlySavings = basePrice - discountedMonthlyPrice;

    return {
      planKey,
      period,
      months: periodConfig.months,
      discountPercentage: periodConfig.discount,
      originalMonthlyPrice: basePrice,
      discountedMonthlyPrice: discountedMonthlyPrice,
      totalPrice: totalPrice,
      originalTotalPrice: originalTotalPrice,
      totalSavings: totalSavings,
      monthlySavings: monthlySavings,
      currency: '£'
    };
  }

  /**
   * Gera estatísticas de economia para exibição
   * @param {string} planKey - Chave do plano
   * @param {string} period - Período selecionado
   * @returns {object} Objeto com informações de economia
   */
  function generateSavingsInfo(planKey, period) {
    const pricing = calculateDiscountedPricing(planKey, period);
    if (!pricing || pricing.discountPercentage === 0) {
      return null;
    }

    return {
      savingsPerMonth: `${pricing.currency}${pricing.monthlySavings}`,
      totalSavings: `${pricing.currency}${pricing.totalSavings}`,
      discountPercentage: `${pricing.discountPercentage}%`,
      payUpfront: `${pricing.currency}${pricing.totalPrice}`,
      vsMonthly: `${pricing.currency}${pricing.originalTotalPrice}`,
      periodLabel: PERIOD_DISCOUNTS[period].label
    };
  }

  /**
   * Atualiza os payment links globais com base no período selecionado
   * @param {string} period - Período selecionado
   */
  function updatePaymentLinksForPeriod(period = 'monthly') {
    if (!window.PAYMENT_LINKS) {
      window.PAYMENT_LINKS = {};
    }

    Object.keys(BASE_PAYMENT_LINKS).forEach(planKey => {
      window.PAYMENT_LINKS[planKey] = generateDiscountedPaymentLink(planKey, period);
    });

    // Disparar evento para notificar outras partes do sistema
    window.dispatchEvent(new CustomEvent('paymentLinksUpdated', {
      detail: { period, links: window.PAYMENT_LINKS }
    }));
  }

  /**
   * Inicializa o sistema de desconto
   */
  function initializeDiscountSystem() {
    // Atualizar links inicialmente
    updatePaymentLinksForPeriod('monthly');

    // Escutar mudanças no seletor de período
    document.addEventListener('change', function(e) {
      if (e.target.name === 'planDuration') {
        const selectedPeriod = e.target.value;
        updatePaymentLinksForPeriod(selectedPeriod);
        
        // Log para debugging
        console.log(`Discount system: Updated payment links for period: ${selectedPeriod}`);
      }
    });

    // Disponibilizar funções globalmente para uso em outros scripts
    window.StripeDiscountIntegration = {
      generateDiscountedPaymentLink,
      calculateDiscountedPricing,
      generateSavingsInfo,
      updatePaymentLinksForPeriod,
      PERIOD_DISCOUNTS,
      BASE_PRICES
    };

    console.log('✅ Stripe Discount Integration initialized');
  }

  // Inicializar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDiscountSystem);
  } else {
    initializeDiscountSystem();
  }

})();