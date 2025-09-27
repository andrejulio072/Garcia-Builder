// Backend API para integração com Stripe
// Este arquivo deve ser executado em um servidor Node.js/Express

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Verificar se as variáveis de ambiente foram carregadas
console.log('Environment variables check:');
console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'https://seudominio.com'], // Ajuste conforme necessário
    credentials: true
}));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '..')));

// Configuração dos produtos/preços para teste
const PRICE_CONFIG = {
    starter: {
        name: 'Starter Plan',
        amount: 7500, // £75 em centavos
        currency: 'gbp'
    },
    beginner: {
        name: 'Beginner Plan',
        amount: 9500, // £95 em centavos
        currency: 'gbp'
    },
    essentials: {
        name: 'Essentials Plan',
        amount: 11500, // £115 em centavos
        currency: 'gbp'
    },
    full: {
        name: 'Full Plan',
        amount: 15500, // £155 em centavos
        currency: 'gbp'
    },
    elite: {
        name: 'Elite Plan',
        amount: 23000, // £230 em centavos
        currency: 'gbp'
    }
};

// Endpoint para criar sessão de checkout (MODO DEMONSTRAÇÃO)
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { planKey, planName, customerEmail, successUrl, cancelUrl } = req.body;

        // Validar entrada
        if (!planKey || !PRICE_CONFIG[planKey]) {
            return res.status(400).json({ error: 'Plano não encontrado' });
        }

        const planConfig = PRICE_CONFIG[planKey];

        console.log(`📝 Criando sessão LIVE para: ${planConfig.name} - £${planConfig.amount/100}`);
        console.log(`👤 Cliente: ${customerEmail}`);

        // **MODO LIVE** - Usar Stripe real com chaves live
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: planConfig.currency,
                    product_data: {
                        name: planConfig.name,
                        description: `Plano de coaching personalizado - ${planConfig.name}`
                    },
                    unit_amount: planConfig.amount,
                    recurring: {
                        interval: 'month'
                    }
                },
                quantity: 1
            }],
            mode: 'subscription',
            customer_email: customerEmail,
            success_url: successUrl || `${process.env.FRONTEND_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/pricing.html`,
            metadata: {
                planKey: planKey,
                planName: planConfig.name
            }
        });

        console.log(`✅ Sessão LIVE criada: ${session.id}`);
        res.json({
            sessionId: session.id,
            url: session.url,
            planDetails: {
                name: planConfig.name,
                amount: planConfig.amount,
                currency: planConfig.currency,
                planKey: planKey
            }
        });

    } catch (error) {
        console.error('Erro ao criar sessão de checkout DEMO:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
});

// Endpoint para verificar status do pagamento
app.get('/api/payment-status/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        res.json({
            status: session.payment_status,
            customer_email: session.customer_details?.email,
            subscription_id: session.subscription
        });
    } catch (error) {
        console.error('Erro ao verificar status do pagamento:', error);
        res.status(500).json({ error: 'Erro ao verificar pagamento' });
    }
});

// Webhook para eventos do Stripe
app.post('/api/stripe-webhook', express.raw({type: 'application/json'}), (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = 'whsec_...'; // Substitua pelo seu webhook secret

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.log(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Processar eventos específicos
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log('Pagamento concluído:', session.id);
            // Aqui você pode atualizar seu banco de dados, enviar emails, etc.
            handleSuccessfulPayment(session);
            break;

        case 'invoice.payment_succeeded':
            const invoice = event.data.object;
            console.log('Pagamento de fatura bem-sucedido:', invoice.id);
            // Lidar com pagamentos recorrentes
            break;

        case 'customer.subscription.deleted':
            const subscription = event.data.object;
            console.log('Assinatura cancelada:', subscription.id);
            // Lidar com cancelamentos
            break;

        default:
            console.log(`Evento não tratado: ${event.type}`);
    }

    res.json({received: true});
});

// Função para lidar com pagamentos bem-sucedidos
async function handleSuccessfulPayment(session) {
    try {
        // Buscar detalhes do cliente
        const customer = await stripe.customers.retrieve(session.customer);

        console.log('Novo cliente:', {
            email: customer.email,
            name: customer.name,
            planName: session.metadata.plan_name,
            subscriptionId: session.subscription
        });

        // Aqui você pode:
        // 1. Salvar no banco de dados
        // 2. Enviar email de boas-vindas
        // 3. Criar conta no seu sistema
        // 4. Integrar com outras ferramentas (ex: Trainerize)

    } catch (error) {
        console.error('Erro ao processar pagamento bem-sucedido:', error);
    }
}

// Endpoint de saúde
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
