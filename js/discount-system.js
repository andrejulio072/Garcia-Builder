// Discount Code System
(() => {
  // Available discount codes
  const discountCodes = {
    'MEMBER15': { type: 'percentage', value: 15, description: 'Member Exclusive - 15% off' },
    'WELCOME10': { type: 'percentage', value: 10, description: 'Welcome Bonus - 10% off' },
    'SPRING20': { type: 'percentage', value: 20, description: 'Spring Special - 20% off' },
    'STUDENT': { type: 'percentage', value: 25, description: 'Student Discount - 25% off' },
    'FIRST50': { type: 'fixed', value: 50, description: 'First Time - €50 off' },
    'LOYALTY': { type: 'percentage', value: 30, description: 'Loyalty Reward - 30% off' }
  };

  let currentDiscount = null;
  let originalPrices = {};

  const init = () => {
    const showDiscountBtn = document.getElementById('show-discount-form');
    const discountForm = document.getElementById('discount-form');
    const applyBtn = document.getElementById('apply-discount');
    const discountInput = document.getElementById('discount-code');

    if (!showDiscountBtn || !discountForm || !applyBtn || !discountInput) return;

    // Show/hide discount form
    showDiscountBtn.addEventListener('click', () => {
      if (discountForm.style.display === 'none') {
        discountForm.style.display = 'block';
        showDiscountBtn.textContent = '❌ Hide discount form';
        discountInput.focus();
      } else {
        discountForm.style.display = 'none';
        showDiscountBtn.textContent = '🎁 Have a discount code?';
      }
    });

    // Apply discount
    applyBtn.addEventListener('click', applyDiscount);

    // Apply on Enter key
    discountInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        applyDiscount();
      }
    });

    // Auto-uppercase input
    discountInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase();
    });

    // Store original prices
    storeOriginalPrices();

    console.log('Discount system initialized');
  };

  const storeOriginalPrices = () => {
    const pricingGrid = document.getElementById('pricingGrid');
    if (!pricingGrid) return;

    pricingGrid.querySelectorAll('[data-plan-key]').forEach(button => {
      const planKey = button.getAttribute('data-plan-key');
      const priceTag = button.closest('.price').querySelector('.tag');
      if (priceTag && planKey) {
        const priceText = priceTag.textContent.split('/')[0].trim();
        originalPrices[planKey] = priceText;
      }
    });
  };

  const applyDiscount = () => {
    const discountInput = document.getElementById('discount-code');
    const discountResult = document.getElementById('discount-result');
    const applyBtn = document.getElementById('apply-discount');

    const code = discountInput.value.trim().toUpperCase();

    if (!code) {
      showDiscountResult('Please enter a discount code', 'error');
      return;
    }

    // Show loading
    applyBtn.disabled = true;
    applyBtn.textContent = 'Applying...';

    setTimeout(() => {
      if (discountCodes[code]) {
        currentDiscount = { code, ...discountCodes[code] };
        applyDiscountToPrices();
        showDiscountResult(`✅ ${discountCodes[code].description} applied!`, 'success');

        // Analytics event
        if (window.gtag) {
          window.gtag('event', 'discount_applied', {
            discount_code: code,
            discount_value: discountCodes[code].value,
            discount_type: discountCodes[code].type
          });
        }
      } else {
        showDiscountResult('❌ Invalid discount code. Please try again.', 'error');

        // Suggest similar codes
        const suggestions = suggestSimilarCodes(code);
        if (suggestions.length > 0) {
          setTimeout(() => {
            showDiscountResult(`💡 Did you mean: ${suggestions.join(', ')}?`, 'info');
          }, 2000);
        }
      }

      applyBtn.disabled = false;
      applyBtn.textContent = 'Apply';
    }, 800);
  };

  const applyDiscountToPrices = () => {
    const pricingGrid = document.getElementById('pricingGrid');
    if (!pricingGrid || !currentDiscount) return;

    pricingGrid.querySelectorAll('[data-plan-key]').forEach(button => {
      const planKey = button.getAttribute('data-plan-key');
      const priceCard = button.closest('.price');
      const priceTag = priceCard.querySelector('.tag');

      if (!priceTag || !originalPrices[planKey]) return;

      const originalPriceText = originalPrices[planKey];
      const priceMatch = originalPriceText.match(/[\d,]+/);
      if (!priceMatch) return;

      const originalPrice = parseInt(priceMatch[0].replace(/,/g, ''));
      let discountedPrice;

      if (currentDiscount.type === 'percentage') {
        discountedPrice = Math.round(originalPrice * (1 - currentDiscount.value / 100));
      } else {
        discountedPrice = Math.max(0, originalPrice - currentDiscount.value);
      }

      // Format prices
      const symbol = originalPriceText.charAt(0);
      const currency = window.CurrencyConverter?.getCurrentCurrency() || 'EUR';
      const formatter = getNumberFormatter(currency);

      const formattedOriginal = `${symbol}${formatter.format(originalPrice)}`;
      const formattedDiscounted = `${symbol}${formatter.format(discountedPrice)}`;

      // Update display
      const periodText = priceTag.querySelector('span').textContent;
      priceTag.innerHTML = `
        <span class="original-price">${formattedOriginal}</span>
        <span class="discounted-price">${formattedDiscounted}</span>
        <span style="font-size:16px">${periodText}</span>
      `;

      // Add visual effect
      priceCard.classList.add('discounted');

      // Update button data
      button.setAttribute('data-plan-price', formattedDiscounted);
      button.setAttribute('data-discount-applied', currentDiscount.code);
    });
  };

  const removeDiscount = () => {
    const pricingGrid = document.getElementById('pricingGrid');
    if (!pricingGrid) return;

    pricingGrid.querySelectorAll('[data-plan-key]').forEach(button => {
      const planKey = button.getAttribute('data-plan-key');
      const priceCard = button.closest('.price');
      const priceTag = priceCard.querySelector('.tag');

      if (!priceTag || !originalPrices[planKey]) return;

      const periodText = priceTag.querySelector('span').textContent;
      priceTag.innerHTML = `${originalPrices[planKey]}<span style="font-size:16px">${periodText}</span>`;

      priceCard.classList.remove('discounted');
      button.removeAttribute('data-discount-applied');
      button.setAttribute('data-plan-price', originalPrices[planKey]);
    });

    currentDiscount = null;
  };

  const showDiscountResult = (message, type) => {
    const discountResult = document.getElementById('discount-result');
    if (!discountResult) return;

    discountResult.className = `discount-result discount-${type}`;
    discountResult.textContent = message;

    if (type === 'success') {
      // Add remove option
      setTimeout(() => {
        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn btn-sm btn-outline-light ms-2';
        removeBtn.textContent = 'Remove';
        removeBtn.onclick = () => {
          removeDiscount();
          discountResult.textContent = '';
          discountResult.className = 'discount-result';
          document.getElementById('discount-code').value = '';
        };
        discountResult.appendChild(removeBtn);
      }, 1000);
    }

    // Auto-clear after delay
    if (type === 'error' || type === 'info') {
      setTimeout(() => {
        discountResult.textContent = '';
        discountResult.className = 'discount-result';
      }, 4000);
    }
  };

  const suggestSimilarCodes = (input) => {
    const suggestions = [];
    const codes = Object.keys(discountCodes);

    codes.forEach(code => {
      if (code.includes(input.substring(0, 3)) || input.includes(code.substring(0, 3))) {
        suggestions.push(code);
      }
    });

    return suggestions.slice(0, 2);
  };

  const getNumberFormatter = (currency) => {
    const locale = currency === 'BRL' ? 'pt-BR' : 'en-US';
    return new Intl.NumberFormat(locale);
  };

  // Public API
  window.DiscountSystem = {
    init,
    getCurrentDiscount: () => currentDiscount,
    applyCode: (code) => {
      document.getElementById('discount-code').value = code;
      applyDiscount();
    },
    removeDiscount,
    getAvailableCodes: () => Object.keys(discountCodes)
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }

  console.log('Discount system loaded');
})();
