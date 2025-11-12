// Currency Conversion System
(() => {
  // Exchange rates (updated periodically - in production, use real API)
  let exchangeRates = {
    'GBP': 1.0,     // Base currency - British Pounds
    'EUR': 1.18,
    'USD': 1.27,
    'BRL': 7.50,
    'CAD': 1.77,
    'AUD': 1.95
  };

  // Base prices in GBP (British Pounds) - Original Stripe prices
  const basePrices = {
    starter: 75,      // £75
    beginner: 95,     // £95
    essentials: 115,  // £115
    full: 155,        // £155
    elite: 230        // £230
  };

  let currentCurrency = 'GBP';
  let isLoading = false;

  // Currency symbols
  const currencySymbols = {
    'EUR': '€',
    'USD': '$',
    'GBP': '£',
    'BRL': 'R$',
    'CAD': 'C$',
    'AUD': 'A$'
  };

  // Initialize currency system
  const init = () => {
    // Support multiple selectors (navbar + legacy)
    const navSelect = document.getElementById('currency-select-nav');
    const legacySelect = document.getElementById('currency-select');
    const currencySelect = navSelect || legacySelect;
    if (!currencySelect) return;

    // Load saved currency preference
    const savedCurrency = localStorage.getItem('preferred-currency');
    if (savedCurrency && exchangeRates[savedCurrency]) {
      currentCurrency = savedCurrency;
      currencySelect.value = savedCurrency;
    }

    // Add change listener
    const onChange = (e) => handleCurrencyChange(e);
    currencySelect.addEventListener('change', onChange);
    if (navSelect && legacySelect) {
      navSelect.addEventListener('change', (e) => {
        legacySelect.value = e.target.value;
        handleCurrencyChange(e);
      });
      legacySelect.addEventListener('change', (e) => {
        navSelect.value = e.target.value;
        handleCurrencyChange(e);
      });
    }

    // Initial conversion
    updatePrices();
  };

  // Handle currency change
  const handleCurrencyChange = async (e) => {
    const newCurrency = e.target.value;
    if (newCurrency === currentCurrency || isLoading) return;

    showLoading(true);

    try {
      // Update exchange rates (in production, fetch from API)
      await updateExchangeRates();

      currentCurrency = newCurrency;
      localStorage.setItem('preferred-currency', newCurrency);

      updatePrices();

      // Show success feedback
      setTimeout(() => {
        showLoading(false);
      }, 500);

    } catch (error) {
      console.error('Currency conversion error:', error);
      showLoading(false);

      // Show error and revert
      e.target.value = currentCurrency;
      showNotification('Failed to update currency. Please try again.', 'error');
    }
  };

  // Show loading indicator
  const showLoading = (show) => {
    isLoading = show;
    const select = document.getElementById('currency-select-nav') || document.getElementById('currency-select');
    if (!select) return;

    const container = select.closest('.currency-selector-control') || select.parentNode;
    if (!container) return;

    const loadingIndicator = container.querySelector('.currency-loading');

    if (show) {
      select.disabled = true;
      if (!loadingIndicator) {
        const loader = document.createElement('span');
        loader.className = 'currency-loading';
        container.appendChild(loader);
      }
    } else {
      select.disabled = false;
      if (loadingIndicator) {
        loadingIndicator.remove();
      }
    }
  };

  // Update all prices on the page
  const updatePrices = () => {
    const pricingGrid = document.getElementById('pricingGrid');
    if (!pricingGrid) return;

  const symbol = currencySymbols[currentCurrency] || '';
    const rate = exchangeRates[currentCurrency];

    // Update plan prices
    Object.keys(basePrices).forEach(planKey => {
      const basePrice = basePrices[planKey];
      const convertedPrice = Math.round(basePrice * rate);
      const formattedPrice = formatPrice(convertedPrice, symbol);

      // Update in DOM
      const planButton = pricingGrid.querySelector(`[data-plan-key="${planKey}"]`);
      if (planButton) {
        planButton.setAttribute('data-plan-price', formattedPrice);

        // Update price display
        const priceTag = planButton.closest('.price').querySelector('.tag');
        if (priceTag) {
          const periodText = priceTag.querySelector('span');
          const period = periodText ? periodText.textContent : '/month';
          priceTag.innerHTML = `${formattedPrice}<span style="font-size:16px">${period}</span>`;
        }
      }
    });

    console.log(`Prices updated to ${currentCurrency}`);
  };

  // Format price according to currency
  const formatPrice = (amount, symbol) => {
    if (currentCurrency === 'BRL') {
      return `${symbol} ${amount.toLocaleString('pt-BR')}`;
    }
    return `${symbol}${amount.toLocaleString()}`;
  };

  // Update exchange rates (mock API call)
  const updateExchangeRates = async () => {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        // In production, fetch real rates from API
        // For now, use static rates with small random variation
        const variation = 0.98 + Math.random() * 0.04; // ±2% variation

        Object.keys(exchangeRates).forEach(currency => {
          if (currency !== 'EUR') {
            exchangeRates[currency] *= variation;
          }
        });

        resolve();
      }, 300);
    });
  };

  // Show notification
  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : 'success'} position-fixed`;
    notification.style.cssText = `
      top: 20px; right: 20px; z-index: 9999;
      max-width: 300px; opacity: 0.95;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  // Public API
  window.CurrencyConverter = {
    init,
    getCurrentCurrency: () => currentCurrency,
    convertPrice: (eurAmount) => Math.round(eurAmount * exchangeRates[currentCurrency]),
    getSymbol: () => currencySymbols[currentCurrency]
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }

  console.log('Currency conversion system loaded');
})();
