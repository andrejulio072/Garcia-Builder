# 🎯 Integração com Stripe - Garcia Builder

Este guia mostra como configurar e usar a integração com Stripe para processar pagamentos online no site Garcia Builder.

## 📋 Pré-requisitos

1. **Conta Stripe**: Crie uma conta em [stripe.com](https://stripe.com)
2. **Node.js**: Versão 16 ou superior
3. **Chaves da API**: Obtidas no dashboard do Stripe

## 🚀 Configuração Inicial

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

1. Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

2. Configure suas chaves do Stripe no arquivo `.env`:
```bash
STRIPE_SECRET_KEY=sk_test_sua_chave_secreta_aqui
STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_publica_aqui
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret_aqui
```

### 3. Criar Produtos no Stripe

1. Acesse o [Dashboard do Stripe](https://dashboard.stripe.com)
2. Vá em **Products** → **Create Product**
3. Crie produtos para cada plano:
   - **Starter Plan**
   - **Beginner Plan** 
   - **Essentials Plan**
   - **Full Plan**
   - **Elite Plan**

4. Para cada produto, crie um **Price** (preço recorrente mensal)
5. Copie os **Price IDs** gerados

### 4. Configurar Price IDs

Edite o arquivo `js/stripe-payments.js` e substitua os Price IDs:

```javascript
priceIds: {
    starter: 'price_1234567890abcdef',     // Seu Price ID real
    beginner: 'price_1234567890ghijkl',
    essentials: 'price_1234567890mnopqr',
    full: 'price_1234567890stuvwx',
    elite: 'price_1234567890yz1234'
}
```

### 5. Configurar Chave Pública

No mesmo arquivo `js/stripe-payments.js`, configure sua chave pública:

```javascript
publishableKey: 'pk_test_sua_chave_publica_aqui'
```

## 🖥️ Executar o Servidor

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

O servidor estará disponível em: `http://localhost:3001`

## 🔧 Configurar Webhooks

1. No Dashboard do Stripe, vá em **Developers** → **Webhooks**
2. Clique em **Add endpoint**
3. Configure a URL: `https://seudominio.com/api/stripe-webhook`
4. Selecione os eventos:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
5. Copie o **Signing secret** para o arquivo `.env`

## 💳 Como Funciona

### Fluxo de Pagamento

1. **Cliente clica em "Comprar Agora"** na página de preços
2. **JavaScript chama a API** para criar uma sessão de checkout
3. **Cliente é redirecionado** para o Stripe Checkout
4. **Após o pagamento**, cliente retorna para a página de sucesso
5. **Webhook confirma** o pagamento e processa a assinatura

### Estrutura de Arquivos

```
├── js/
│   ├── stripe-payments.js     # Frontend - integração com Stripe
│   └── pricing.js            # Geração dinâmica dos planos
├── api/
│   └── stripe-server.js      # Backend - API para Stripe
├── success.html              # Página de confirmação
├── package.json             # Dependências
└── .env.example            # Exemplo de configuração
```

## 🎨 Personalização

### Modificar Planos

Edite o arquivo de tradução (`assets/i18n.js`) para alterar:
- Nomes dos planos
- Preços exibidos
- Descrições
- Features

### Styling

Os botões de pagamento herdam o estilo existente da classe `.btn-gold`.

## 🔒 Segurança

- ✅ **Chaves secretas** ficam apenas no servidor
- ✅ **Validação de webhooks** com assinatura
- ✅ **HTTPS obrigatório** em produção
- ✅ **Cors configurado** adequadamente

## 🧪 Teste

### Cartões de Teste

Use estes cartões para testar:

- **Sucesso**: `4242 4242 4242 4242`
- **Recusado**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0000 0000 3220`

### Modo de Teste

Certifique-se de usar chaves de teste (`sk_test_` e `pk_test_`) durante o desenvolvimento.

## 🚀 Deploy em Produção

### 1. Configurar Domínio

Atualize as URLs no arquivo `.env`:
```bash
FRONTEND_URL=https://seudominio.com
SUCCESS_URL=https://seudominio.com/success.html
CANCEL_URL=https://seudominio.com/pricing.html
```

### 2. Usar Chaves de Produção

Substitua as chaves de teste pelas de produção:
```bash
STRIPE_SECRET_KEY=sk_live_sua_chave_producao
STRIPE_PUBLISHABLE_KEY=pk_live_sua_chave_producao
```

### 3. Configurar HTTPS

- O Stripe exige HTTPS em produção
- Configure SSL/TLS no seu servidor
- Atualize webhooks com URLs HTTPS

## 📞 Suporte e Recursos

- **Documentação Stripe**: [stripe.com/docs](https://stripe.com/docs)
- **Dashboard Stripe**: [dashboard.stripe.com](https://dashboard.stripe.com)
- **Status Stripe**: [status.stripe.com](https://status.stripe.com)

## ⚠️ Observações Importantes

1. **Nunca exponha** chaves secretas no frontend
2. **Sempre valide** webhooks no backend
3. **Use HTTPS** em produção
4. **Teste thoroughly** antes de ir ao ar
5. **Configure alertas** para falhas de pagamento

## 📝 Próximos Passos

Após configurar a integração básica, considere:

- ✅ Integração com sistema de CRM
- ✅ Emails automáticos pós-compra
- ✅ Dashboard administrativo
- ✅ Relatórios de receita
- ✅ Gestão de cancelamentos

---

## 🎉 Pronto para Usar!

Com esta configuração, seu site Garcia Builder estará pronto para processar pagamentos online de forma segura e profissional.

**Boa sorte com suas vendas! 💪🏋️‍♂️**