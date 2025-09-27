// Buscar Price IDs dos produtos existentes
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function getPriceIds() {
    try {
        console.log('🔍 Buscando Price IDs dos produtos...\n');

        // Buscar todos os preços
        const prices = await stripe.prices.list({ limit: 20 });

        console.log(`💰 Encontrados ${prices.data.length} preços:\n`);

        for (const price of prices.data) {
            const product = await stripe.products.retrieve(price.product);
            const amount = price.unit_amount / 100;
            const currency = price.currency.toUpperCase();

            console.log(`📦 ${product.name}`);
            console.log(`   Price ID: ${price.id}`);
            console.log(`   Valor: ${currency === 'GBP' ? '£' : currency}${amount.toFixed(2)}/${price.recurring?.interval || 'único'}`);
            console.log(`   Status: ${product.active ? 'Ativo' : 'Inativo'}`);
            console.log('');
        }

        // Organizar por plano
        console.log('🎯 Mapeamento para configuração:');
        console.log('================================');

        const planMapping = {
            'starter': null,
            'beginner': null,
            'essentials': null,
            'full': null,
            'elite': null
        };

        for (const price of prices.data) {
            const product = await stripe.products.retrieve(price.product);
            const name = product.name.toLowerCase();

            if (name.includes('starter')) {
                planMapping.starter = price.id;
                console.log(`PRICE_STARTER=${price.id}`);
            } else if (name.includes('beginner')) {
                planMapping.beginner = price.id;
                console.log(`PRICE_BEGINNER=${price.id}`);
            } else if (name.includes('essentials')) {
                planMapping.essentials = price.id;
                console.log(`PRICE_ESSENTIALS=${price.id}`);
            } else if (name.includes('full')) {
                planMapping.full = price.id;
                console.log(`PRICE_FULL=${price.id}`);
            } else if (name.includes('elite')) {
                planMapping.elite = price.id;
                console.log(`PRICE_ELITE=${price.id}`);
            }
        }

    } catch (error) {
        console.log('❌ Erro:', error.message);
    }
}

getPriceIds();
