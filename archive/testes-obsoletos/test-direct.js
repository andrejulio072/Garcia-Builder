// Teste direto com chave hardcoded
const stripe = require('stripe')('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');

async function testDirect() {
    try {
        console.log('🔍 Testando chave direta...');

        const products = await stripe.products.list({ limit: 5 });
        console.log(`✅ Sucesso! Encontrados ${products.data.length} produtos`);

        if (products.data.length > 0) {
            products.data.forEach(product => {
                console.log(`  - ${product.name} (ID: ${product.id})`);
            });
        } else {
            console.log('📝 Nenhum produto encontrado - conta limpa, pronta para criar produtos!');
        }

    } catch (error) {
        console.log('❌ Erro:', error.message);

        if (error.message.includes('Invalid API Key')) {
            console.log('🔍 Possíveis causas:');
            console.log('  1. Chave copiada incorretamente');
            console.log('  2. Chave revogada ou expirada');
            console.log('  3. Conta Stripe com problemas');
        }
    }
}

testDirect();
