// Teste simples das chaves LIVE
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testConnection() {
    try {
        console.log('🔍 Testando conexão com Stripe...');
        console.log('Chave:', process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 20) + '...' : 'NÃO ENCONTRADA');

        // Listar produtos existentes
        const products = await stripe.products.list({ limit: 10 });
        console.log(`✅ Conexão OK! Encontrados ${products.data.length} produtos:`);

        products.data.forEach(product => {
            console.log(`  - ${product.name} (${product.active ? 'Ativo' : 'Inativo'})`);
        });

        if (products.data.length === 0) {
            console.log('📝 Nenhum produto encontrado. Vamos criar os produtos de coaching!');
        }

    } catch (error) {
        console.log('❌ Erro na conexão:', error.message);
    }
}

testConnection();
