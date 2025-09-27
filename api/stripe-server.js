// Backend API para integração com Stripe
// Este arquivo deve ser executado em um servidor Node.js/Express

const express = require('express');
const stripe = require('stripe')('sk_test_...'); // Substitua pela sua chave secreta do Stripe
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000', 'https://seudominio.com'], // Ajuste conforme necessário
    credentials: true
}));

// Configuração dos produtos/preços
const PRICE_CONFIG = {
    starter: {
        priceId: 'price_starter_monthly', // Substitua pelos seus Price IDs do Stripe
        name: 'Starter Plan'
    },
    beginner: {
        priceId: 'price_beginner_monthly',
        name: 'Beginner Plan'
    },
    essentials: {
        priceId: 'price_essentials_monthly',
        name: 'Essentials Plan'
    },
    full: {
        priceId: 'price_full_monthly',
        name: 'Full Plan'
    },
    elite: {
        priceId: 'price_elite_monthly',
        name: 'Elite Plan'
    }
};

// Endpoint para criar sessão de checkout
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { priceId, planName, customerEmail, successUrl, cancelUrl } = req.body;

        // Validar entrada
        if (!priceId) {
            return res.status(400).json({ error: 'Price ID é obrigatório' });
        }

        // Parâmetros da sessão
        const sessionParams = {
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            mode: 'subscription', // ou 'payment' para pagamentos únicos
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                plan_name: planName,
            },
            // Adicionar informações do cliente se disponível
            ...(customerEmail && {
                customer_email: customerEmail,
                customer_creation: 'always'
            }),
            // Configurações adicionais
            allow_promotion_codes: true,
            billing_address_collection: 'auto',
            shipping_address_collection: {
                allowed_countries: ['US', 'BR', 'PT', 'ES', 'GB'], // Ajuste conforme necessário
            },
            // Configurar trial period se necessário
            subscription_data: {
                trial_period_days: 7, // 7 dias de trial gratuito
                metadata: {
                    plan_name: planName,
                    source: 'website'
                }
            }
        };

        // Criar sessão no Stripe
        const session = await stripe.checkout.sessions.create(sessionParams);

        res.json({ 
            id: session.id,
            url: session.url 
        });

    } catch (error) {
        console.error('Erro ao criar sessão de checkout:', error);
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