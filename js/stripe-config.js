// Configuração de ambiente para Stripe
const STRIPE_CONFIG = {
    development: {
        publishableKey: 'pk_test_51S8Qxo2HQhMPvsUVtWDDtKrSyNzhc8QxEB13lJuhZTm4XgtGeDuqrrrrhGvgb671t4evmIju9k92FtBoCZsd6vhu00UoCa2KlA',
        apiUrl: 'http://localhost:3001/api',
        priceIds: {
            starter: 'price_1SBnsQ2HQhMPvsUVKjShuCqS',
            beginner: 'price_1SBo0l2HQhMPvsUVb0CamUon',
            essentials: 'price_1SBo1D2HQhMPvsUVPZsgOFzA',
            full: 'price_1SBo1h2HQhMPvsUVSFUxEoi0',
            elite: 'price_1SBo2M2HQhMPvsUVZBfruITl'
        }
    },
    production: {
        publishableKey: 'pk_live_51...', // Substitua pela sua chave de produção quando for ao vivo
        apiUrl: 'https://seudominio.com/api',
        priceIds: {
            starter: 'price_1SBnsQ2HQhMPvsUVKjShuCqS',
            beginner: 'price_1SBo0l2HQhMPvsUVb0CamUon',
            essentials: 'price_1SBo1D2HQhMPvsUVPZsgOFzA',
            full: 'price_1SBo1h2HQhMPvsUVSFUxEoi0',
            elite: 'price_1SBo2M2HQhMPvsUVZBfruITl'
        }
    }
};

// Detectar ambiente
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const currentConfig = isDevelopment ? STRIPE_CONFIG.development : STRIPE_CONFIG.production;

// Exportar configuração
window.STRIPE_ENV_CONFIG = currentConfig;

console.log('Stripe Environment:', isDevelopment ? 'Development' : 'Production');
console.log('API URL:', currentConfig.apiUrl);
