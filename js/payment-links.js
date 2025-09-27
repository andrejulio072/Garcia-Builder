/**
 * 🔗 GARCIA BUILDER - PAYMENT LINKS SOLUTION
 * Solução compatível com GitHub Pages (sem backend necessário)
 * Usando Payment Links oficiais do Stripe
 */

// Configuração dos Payment Links (você vai criar estes no painel Stripe)
// Simple Payment Links mapping - used directly by pricing.js
window.PAYMENT_LINKS = {
    starter: "https://buy.stripe.com/7sY6oG8qsexmbXEfkyak000",
    beginner: "https://buy.stripe.com/6oU5kC7mobla2n48Waak001",
    essentials: "https://buy.stripe.com/14A14m6ik74U9Pw2xMak002",
    full: "https://buy.stripe.com/bJe3cu5egbla7Hodcqak003",
    elite: "https://buy.stripe.com/5kQdR85eg1KA1j04FUak004"
};

// Full plan details for display purposes
const PAYMENT_LINKS = {
    starter: {
        name: 'Starter Plan',
        price: '£75/month',
        description: 'Perfect for beginners starting their fitness journey',
        paymentLink: 'https://buy.stripe.com/7sY6oG8qsexmbXEfkyak000',
        features: [
            'Basic workout plans',
            'Nutrition guidelines',
            'Email support',
            'Trainerize app access'
        ]
    },
    beginner: {
        name: 'Beginner Plan',
        price: '£95/month',
        description: 'Enhanced plan with more features and support',
        paymentLink: 'https://buy.stripe.com/6oU5kC7mobla2n48Waak001',
        features: [
            'Enhanced workout plans',
            'Meal prep guides',
            'Priority support',
            'Progress tracking',
            'Trainerize app access'
        ]
    },
    essentials: {
        name: 'Essentials Plan',
        price: '£115/month',
        description: 'Comprehensive fitness and nutrition coaching',
        paymentLink: 'https://buy.stripe.com/14A14m6ik74U9Pw2xMak002',
        features: [
            'Custom workout plans',
            'Personalized nutrition',
            '1-on-1 coaching calls',
            'Progress analytics',
            'Trainerize app access'
        ]
    },
    full: {
        name: 'Full Plan',
        price: '£155/month',
        description: 'Complete transformation package with premium support',
        paymentLink: 'https://buy.stripe.com/bJe3cu5egbla7Hodcqak003',
        features: [
            'Premium coaching',
            'Weekly check-ins',
            '24/7 support',
            'Supplement guidance',
            'Lifestyle coaching',
            'Trainerize app access'
        ]
    },
    elite: {
        name: 'Elite Plan',
        price: '£230/month',
        description: 'Ultimate coaching experience with exclusive access',
        paymentLink: 'https://buy.stripe.com/5kQdR85eg1KA1j04FUak004',
        features: [
            'VIP coaching',
            'Daily support',
            'Custom meal delivery',
            'Exclusive content',
            'Personal trainer access',
            'Trainerize app access'
        ]
    }
};// Função para processar seleção de plano (substitui a lógica complexa anterior)
function handlePlanSelection(planKey, planName, planPrice, buttonElement = null) {
    console.log('🔗 Selecionando plano:', planKey);

    // Verificar se o plano existe
    if (!PAYMENT_LINKS[planKey]) {
        console.error('Plano não encontrado:', planKey);
        alert('Plano não encontrado. Tente novamente.');
        return;
    }

    const plan = PAYMENT_LINKS[planKey];

    // Mostrar loading no botão
    if (buttonElement) {
        const originalText = buttonElement.textContent;
        buttonElement.textContent = 'Redirecionando...';
        buttonElement.disabled = true;

        // Restaurar botão após 3 segundos (caso o usuário volte)
        setTimeout(() => {
            buttonElement.textContent = originalText;
            buttonElement.disabled = false;
        }, 3000);
    }

    // Log para debug
    console.log('🚀 Redirecionando para Payment Link:', plan.paymentLink);

    // Salvar seleção no localStorage para tracking
    localStorage.setItem('selectedPlan', JSON.stringify({
        key: planKey,
        name: planName,
        price: planPrice,
        timestamp: Date.now(),
        paymentLink: plan.paymentLink
    }));

    // Redirecionar diretamente para o Payment Link do Stripe
    window.open(plan.paymentLink, '_blank');
}

// Função para verificar se os Payment Links estão configurados
function validatePaymentLinks() {
    const unconfiguredPlans = [];

    Object.entries(PAYMENT_LINKS).forEach(([key, plan]) => {
        if (plan.paymentLink.includes('YOUR_') || plan.paymentLink.includes('_HERE')) {
            unconfiguredPlans.push(key);
        }
    });

    if (unconfiguredPlans.length > 0) {
        console.warn('⚠️ Payment Links não configurados para:', unconfiguredPlans);
        console.log('📋 Para configurar:');
        console.log('1. Acesse https://dashboard.stripe.com/products');
        console.log('2. Crie produtos para cada plano');
        console.log('3. Gere Payment Links para cada produto');
        console.log('4. Substitua as URLs no código');
        return false;
    }

    console.log('✅ Todos os Payment Links configurados');
    return true;
}

// Função utilitária para criar botão de pagamento direto
function createPaymentButton(planKey, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container não encontrado:', containerId);
        return;
    }

    const plan = PAYMENT_LINKS[planKey];
    if (!plan) {
        console.error('Plano não encontrado:', planKey);
        return;
    }

    const button = document.createElement('a');
    button.href = plan.paymentLink;
    button.className = 'btn btn-gold btn-lg w-100';
    button.target = '_blank';
    button.rel = 'noopener noreferrer';
    button.textContent = `Assinar ${plan.name}`;
    button.style.textDecoration = 'none';

    container.appendChild(button);
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔗 Payment Links Solution carregada');
    validatePaymentLinks();
});

// Exportar configurações para uso global
window.GARCIA_PAYMENT_LINKS = PAYMENT_LINKS;
window.handlePlanSelection = handlePlanSelection;
window.createPaymentButton = createPaymentButton;
