// Vamos testar as chaves antigas de teste que funcionavam antes
const stripe = require('stripe')('sk_test_51S8Qxo2HQhMPvsUV1scRlAz9QJZWzvKP8KEnPhpwPndsLadV39sL1j222zSN5DNRqwpD6hWD2WOupiI1cbFzM1g00HuHDKhOF');

async function testOldKeys() {
    try {
        console.log('🔍 Testando chaves antigas de teste...');

        const products = await stripe.products.list({ limit: 5 });
        console.log(`✅ Chaves antigas funcionam! Encontrados ${products.data.length} produtos`);

        if (products.data.length > 0) {
            console.log('\n📦 Produtos existentes:');
            products.data.forEach(product => {
                console.log(`  - ${product.name} (ID: ${product.id})`);
            });
        }

        // Listar preços também
        const prices = await stripe.prices.list({ limit: 10 });
        console.log(`\n💰 Preços encontrados: ${prices.data.length}`);

        prices.data.forEach(price => {
            console.log(`  - ${price.id}: £${(price.unit_amount / 100).toFixed(2)}/${price.recurring?.interval || 'one-time'}`);
        });

        return true;

    } catch (error) {
        console.log('❌ Chaves antigas não funcionam:', error.message);
        return false;
    }
}

testOldKeys();
