// Configuração Stripe seguindo documentação oficial - VERSÃO PREMIUM
// Seleciona automaticamente a API base: localhost no dev, same-origin em produção (Render/domínio).
const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const API_BASE = isLocalhost ? 'http://localhost:3001/api' : '/api';

const STRIPE_CONFIG = {
    // Usando chave pública LIVE para produção (chave pública pode estar no front com segurança)
    publishableKey: 'pk_live_51S8QxZCEdPbAOAaf5v5Y3yskMYdY3p9sRAIXs2clIAtBiJtLQQwVA3IBcZe02znzJYC8e6BTpdpKRmvkiOZLM5ee00QKktfaZT',
    apiUrl: API_BASE,
    plans: {
        starter: { name: 'Starter Plan', price: '£75', amount: 7500 },
        beginner: { name: 'Beginner Plan', price: '£95', amount: 9500 },
        essentials: { name: 'Essentials Plan', price: '£115', amount: 11500 },
        full: { name: 'Full Plan', price: '£155', amount: 15500 },
        elite: { name: 'Elite Plan', price: '£230', amount: 23000 }
    }
};

// Usar configuração test (recomendado pela documentação para desenvolvimento)
const currentConfig = STRIPE_CONFIG;

// Exportar configuração
window.STRIPE_ENV_CONFIG = currentConfig;

console.log('[Stripe] Environment:', isLocalhost ? 'development (localhost)' : 'production (same-origin)');
console.log('[Stripe] API URL:', currentConfig.apiUrl);
console.log('[Stripe] Publishable Key:', currentConfig.publishableKey.substring(0, 20) + '...');
