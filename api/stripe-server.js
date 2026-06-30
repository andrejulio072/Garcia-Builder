// Endpoint de diagnóstico para checagem de domínio e protocolo
app.get('/_whoami', (req, res) => {
    res.json({
        host: req.headers.host,
        proto: req.headers['x-forwarded-proto'] || req.protocol,
        ip: req.ip,
        userAgent: req.headers['user-agent']
    });
});
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
// Inicializar Stripe seguindo documentação oficial
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
console.log('✅ Stripe inicializado seguindo padrão oficial');

const cors = require('cors');

const app = express();

// Middleware para forçar HTTPS e domínio canônico sem www
app.use((req, res, next) => {
    // Força HTTPS
    if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    // Remove www do domínio
    if (req.headers.host === 'www.garciabuilder.fitness') {
        return res.redirect(301, `https://garciabuilder.fitness${req.url}`);
    }
    next();
});

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
    monthly: {
        name: 'Monthly Online Coaching',
        amount: 20000, // €200.00 em centavos
        currency: 'eur'
    },
    eight_week: {
        name: '8 Week Fat Loss Kickstart',
        amount: 35900, // €359.00 em centavos
        currency: 'eur'
    },
    twelve_week: {
        name: '12 Week Transformation',
        amount: 51900, // €519.00 em centavos
        currency: 'eur'
    },
    eighteen_week: {
        name: '18 Week Complete Transformation',
        amount: 69900, // €699.00 em centavos
        currency: 'eur'
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

        console.log(`📝 Criando Checkout Session: ${planConfig.name} - €${planConfig.amount/100}`);
        console.log(`👤 Cliente: ${customerEmail}`);

        // Criar Checkout Session seguindo documentação oficial do Stripe
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
            success_url: successUrl || `http://localhost:3001/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl || `http://localhost:3001/pricing.html`,
            metadata: {
                planKey: planKey,
                planName: planConfig.name
            }
        });

        console.log(`✅ Checkout Session criada: ${session.id}`);

        // Retornar URL para redirecionamento (padrão oficial)
        res.json({
            sessionId: session.id,
            url: session.url,
            planDetails: {
                name: planConfig.name,
                amount: planConfig.amount,
                currency: planConfig.currency,
                planKey: planKey
            }
        });    } catch (error) {
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
        // 4. Integrar com outras ferramentas (ex: My PT Hub)

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
