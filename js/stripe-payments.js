// Stripe Payment Integration
(function() {
    // Obter configuração do ambiente
    const getStripeConfig = () => {
        if (window.STRIPE_ENV_CONFIG) {
            return {
                ...window.STRIPE_ENV_CONFIG,
                successUrl: window.location.origin + '/success.html',
                cancelUrl: window.location.origin + '/pricing.html'
            };
        }
        
        // Fallback para configuração padrão
        return {
            publishableKey: 'pk_test_...',  // Configure suas chaves no stripe-config.js
            apiUrl: 'http://localhost:3001/api',
            priceIds: {
                starter: 'price_starter_id',
                beginner: 'price_beginner_id',
                essentials: 'price_essentials_id',
                full: 'price_full_id',
                elite: 'price_elite_id'
            },
            successUrl: window.location.origin + '/success.html',
            cancelUrl: window.location.origin + '/pricing.html'
        };
    };

    const STRIPE_CONFIG = getStripeConfig();

    let stripe;

    // Inicializar Stripe
    function initializeStripe() {
        if (window.Stripe && STRIPE_CONFIG.publishableKey.startsWith('pk_')) {
            stripe = window.Stripe(STRIPE_CONFIG.publishableKey);
            console.log('Stripe initialized successfully');
            return true;
        }
        return false;
    }

    // Criar sessão de checkout
    async function createCheckoutSession(priceId, planName, userEmail) {
        try {
            const response = await fetch(`${STRIPE_CONFIG.apiUrl}/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId: priceId,
                    planName: planName,
                    customerEmail: userEmail,
                    successUrl: STRIPE_CONFIG.successUrl + '?session_id={CHECKOUT_SESSION_ID}',
                    cancelUrl: STRIPE_CONFIG.cancelUrl
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create checkout session');
            }

            const session = await response.json();
            return session;
        } catch (error) {
            console.error('Error creating checkout session:', error);
            throw error;
        }
    }

    // Redirecionar para checkout
    async function redirectToCheckout(sessionId) {
        if (!stripe) {
            throw new Error('Stripe not initialized');
        }

        const { error } = await stripe.redirectToCheckout({
            sessionId: sessionId
        });

        if (error) {
            throw error;
        }
    }

    // Processar pagamento de plano
    async function processPlanPayment(planKey, planName) {
        try {
            // Mostrar loading
            showPaymentLoading(true);

            // Verificar se o usuário está logado
            const currentUser = window.AuthSystem && window.AuthSystem.getCurrentUser();
            const userEmail = currentUser ? currentUser.email : null;

            // Obter price ID
            const priceId = STRIPE_CONFIG.priceIds[planKey];
            if (!priceId || priceId.includes('_id')) {
                throw new Error('Price ID não configurado para este plano. Configure seus Price IDs do Stripe.');
            }

            // Criar sessão de checkout
            const session = await createCheckoutSession(priceId, planName, userEmail);

            // Redirecionar para checkout
            await redirectToCheckout(session.id);

        } catch (error) {
            console.error('Payment error:', error);
            showPaymentError(error.message);
        } finally {
            showPaymentLoading(false);
        }
    }

    // Mostrar/esconder loading
    function showPaymentLoading(show) {
        const loadingElement = document.getElementById('payment-loading');
        if (loadingElement) {
            loadingElement.style.display = show ? 'block' : 'none';
        }

        // Desabilitar todos os botões de payment
        document.querySelectorAll('.payment-btn').forEach(btn => {
            btn.disabled = show;
            if (show) {
                btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processando...';
            }
        });
    }

    // Mostrar erro de pagamento
    function showPaymentError(message) {
        // Criar modal de erro ou usar alert como fallback
        if (window.bootstrap && window.bootstrap.Modal) {
            showErrorModal(message);
        } else {
            alert('Erro no pagamento: ' + message);
        }
    }

    // Modal de erro
    function showErrorModal(message) {
        const modalHtml = `
            <div class="modal fade" id="paymentErrorModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Erro no Pagamento</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>${message}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Adicionar modal ao DOM
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);

        // Mostrar modal
        const modal = new window.bootstrap.Modal(document.getElementById('paymentErrorModal'));
        modal.show();

        // Remover modal após fechar
        document.getElementById('paymentErrorModal').addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modalContainer);
        });
    }

    // Atualizar botões de preços para usar Stripe
    function updatePricingButtons() {
        // Atualizar botões dos planos principais
        document.querySelectorAll('.price .btn-gold').forEach((btn, index) => {
            const planKeys = ['starter', 'beginner', 'essentials', 'full', 'elite'];
            const planKey = planKeys[index];
            
            if (planKey && STRIPE_CONFIG.priceIds[planKey]) {
                btn.classList.add('payment-btn');
                btn.textContent = 'Comprar Agora';
                btn.href = '#';
                
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const planName = btn.closest('.price').querySelector('h3').textContent;
                    processPlanPayment(planKey, planName);
                });
            }
        });

        // Atualizar botão do desconto de membro
        const memberDiscountBtn = document.querySelector('.member-discount .btn-gold');
        if (memberDiscountBtn) {
            memberDiscountBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Redirecionar para contato para aplicar desconto manualmente
                window.location.href = 'contact.html?discount=MEMBER15';
            });
        }
    }

    // Adicionar loading overlay ao HTML
    function addPaymentLoadingOverlay() {
        const loadingHtml = `
            <div id="payment-loading" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.8); z-index: 9999; color: white;">
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p style="font-size: 1.2rem;">Processando seu pagamento...</p>
                    <p style="font-size: 1rem; opacity: 0.8;">Você será redirecionado para o Stripe</p>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', loadingHtml);
    }

    // Inicialização
    function initialize() {
        // Adicionar overlay de loading
        addPaymentLoadingOverlay();
        
        // Tentar inicializar Stripe
        if (!initializeStripe()) {
            console.warn('Stripe não pôde ser inicializado. Verifique se a chave pública está configurada.');
            return;
        }

        // Aguardar carregamento dos planos
        const checkPricing = () => {
            if (document.querySelector('.price')) {
                updatePricingButtons();
            } else {
                setTimeout(checkPricing, 100);
            }
        };
        checkPricing();
    }

    // Expor funções globalmente para debug
    window.StripePayments = {
        processPlanPayment,
        initializeStripe,
        updateConfig: (newConfig) => Object.assign(STRIPE_CONFIG, newConfig)
    };

    // Inicializar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // Reinicializar após mudanças de idioma
    document.addEventListener('languageChanged', () => {
        setTimeout(updatePricingButtons, 200);
    });

})();