// Script para verificar se os produtos Stripe ainda existem
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function checkProducts() {
    console.log('🔍 Verificando produtos no Stripe...\n');

    const priceIds = [
        'price_1SBnsQ2HQhMPvsUVKjShuCqS',  // Starter
        'price_1SBo0l2HQhMPvsUVb0CamUon',  // Beginner
        'price_1SBo1D2HQhMPvsUVPZsgOFzA',  // Essentials
        'price_1SBo1h2HQhMPvsUVSFUxEoi0',  // Full
        'price_1SBo2M2HQhMPvsUVZBfruITl'   // Elite
    ];

    const planNames = ['Starter', 'Beginner', 'Essentials', 'Full', 'Elite'];

    for (let i = 0; i < priceIds.length; i++) {
        try {
            const price = await stripe.prices.retrieve(priceIds[i]);
            const product = await stripe.products.retrieve(price.product);

            console.log(`✅ ${planNames[i]}:`);
            console.log(`   Price ID: ${price.id}`);
            console.log(`   Product: ${product.name}`);
            console.log(`   Amount: £${(price.unit_amount / 100).toFixed(2)}`);
            console.log(`   Status: ${product.active ? 'Ativo' : 'Inativo'}`);
            console.log('');

        } catch (error) {
            console.log(`❌ ${planNames[i]}: ERRO - ${error.message}`);
            console.log(`   Price ID: ${priceIds[i]}`);
            console.log('');
        }
    }
}

// Executar verificação
checkProducts().catch(console.error);
