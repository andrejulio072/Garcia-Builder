// Script de teste para verificar a API Stripe
async function testarAPI() {
    console.log('🧪 Testando API Stripe...');

    try {
        // Testar endpoint de saúde
        console.log('📊 Testando health check...');
        const healthResponse = await fetch('http://localhost:3001/health');
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData);

        // Testar criação de sessão de checkout
        console.log('💳 Testando criação de sessão de checkout...');
        const sessionResponse = await fetch('http://localhost:3001/api/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                priceId: 'price_1SBojACEdPbAOAafxaiDr1nB', // Starter Plan
                planName: 'Starter Plan',
                customerEmail: 'test@example.com',
                successUrl: 'http://localhost:3001/success.html',
                cancelUrl: 'http://localhost:3001/pricing.html'
            })
        });

        if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            console.log('✅ Sessão criada com sucesso:', sessionData);
            console.log('🔗 Session ID:', sessionData.sessionId);
        } else {
            const errorData = await sessionResponse.text();
            console.error('❌ Erro na criação da sessão:', errorData);
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

// Executar teste
testarAPI();
