// Configuração Stripe seguindo documentação oficial - VERSÃO PREMIUM
const STRIPE_CONFIG = {
    // Usando chave pública LIVE para produção
    publishableKey: 'pk_live_51S8QxZCEdPbAOAaf5v5Y3yskMYdY3p9sRAIXs2clIAtBiJtLQQwVA3IBcZe02znzJYC8e6BTpdpKRmvkiOZLM5ee00QKktfaZT',
    apiUrl: 'http://localhost:3001/api',
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

console.log('Stripe Mode: Test Keys (Desenvolvimento)');
console.log('API URL:', currentConfig.apiUrl);
console.log('Publishable Key:', currentConfig.publishableKey.substring(0, 20) + '...');
