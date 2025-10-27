# 🔧 Environment Configuration Setup (env-config.json)

## ⚠️ **CRITICAL: Update Required**

O arquivo `env-config.json` atualmente contém **valores placeholder** que **DEVEM ser substituídos** pelos valores reais do seu projeto Supabase antes do OAuth funcionar.

## 📍 Localização

```
Garcia-Builder/
└── env-config.json  ← Arquivo raiz do projeto
```

## 🔴 Problema Atual

```json
{
  "SUPABASE_URL": "https://placeholder.supabase.co",  ❌ PLACEHOLDER
  "SUPABASE_ANON_KEY": "public-anon-placeholder",     ❌ PLACEHOLDER
  "STRIPE_PUBLISHABLE_KEY": "pk_test_placeholder",    ❌ PLACEHOLDER
  "PUBLIC_SITE_URL": null                             ❌ VAZIO
}
```

### Sintomas:
- ❌ `net::ERR_NAME_NOT_RESOLVED` no console do navegador
- ❌ Botões Google/Facebook não redirecionam
- ❌ OAuth retorna erro `Failed to fetch`
- ❌ Login não funciona

---

## ✅ Solução: Obter Valores Reais do Supabase

### **1️⃣ Acessar Supabase Dashboard**

1. Acesse: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login na sua conta
3. Selecione seu projeto **Garcia Builder** (ou o nome que você configurou)

### **2️⃣ Obter SUPABASE_URL e SUPABASE_ANON_KEY**

1. No painel do projeto, clique em **"Project Settings"** (ícone de engrenagem)
2. Vá para a aba **"API"**
3. Você verá dois valores principais:

#### **Project URL** (SUPABASE_URL):
```
https://seu-projeto-id.supabase.co
```

#### **anon / public key** (SUPABASE_ANON_KEY):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJl...
```
> ⚠️ Este é um token JWT longo (geralmente 200+ caracteres)

### **3️⃣ Obter PUBLIC_SITE_URL**

Este é o URL público onde seu site está hospedado:

- **Produção (Vercel/GitHub Pages)**:
  ```
  https://garciabuilder.fitness
  ou
  https://seu-site.vercel.app
  ```

- **Desenvolvimento Local**:
  ```
  http://localhost:3000
  ou
  http://127.0.0.1:5500  (Live Server VSCode)
  ```

- **GitHub Pages**:
  ```
  https://andrejulio072.github.io/Garcia-Builder
  ```

### **4️⃣ Obter STRIPE_PUBLISHABLE_KEY** (Opcional)

Se você usa Stripe para pagamentos:

1. Acesse: [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Vá para **Developers** → **API keys**
3. Copie o **Publishable key** (começa com `pk_test_` ou `pk_live_`)

---

## 📝 Atualizar env-config.json

Substitua o conteúdo do arquivo `env-config.json` pelos valores reais:

```json
{
  "SUPABASE_URL": "https://seu-projeto-real.supabase.co",
  "SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJl...",
  "STRIPE_PUBLISHABLE_KEY": "pk_test_51A2B3C4D5E6F7G8H9I0J1K2L...",
  "PUBLIC_SITE_URL": "https://garciabuilder.fitness"
}
```

### ⚠️ **IMPORTANTE:**

- ✅ **NUNCA** commite credenciais reais para repositórios públicos
- ✅ Adicione `env-config.json` ao `.gitignore` se o repositório for público
- ✅ Use variáveis de ambiente no CI/CD (Vercel, GitHub Pages, etc.)
- ✅ Para produção, configure as variáveis de ambiente no painel de hospedagem

---

## 🔐 Segurança: Proteger Credenciais

### **Opção 1: .gitignore (Recomendado para Públicos)**

```bash
# Adicionar ao .gitignore
echo "env-config.json" >> .gitignore
git rm --cached env-config.json
git commit -m "chore: remove env-config.json from version control"
```

### **Opção 2: Variáveis de Ambiente (Produção)**

#### **Vercel:**
```bash
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add STRIPE_PUBLISHABLE_KEY
vercel env add PUBLIC_SITE_URL
```

#### **GitHub Pages (Actions):**
```yaml
# .github/workflows/deploy.yml
env:
  SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

---

## ✅ Verificar Configuração

### **1️⃣ Abrir DevTools (F12) → Console**

Você deve ver:
```
✅ Supabase client initialized successfully
📱 OAuth providers configured via Supabase project settings
```

### **2️⃣ Testar OAuth**

1. Abra `pages/auth/login.html`
2. Clique no botão **"Continue with Google"**
3. Deve redirecionar para tela de login do Google
4. Após autorização, deve voltar para `dashboard.html`

### **3️⃣ Verificar Network Tab**

- ✅ Requisições para `https://seu-projeto.supabase.co` devem retornar `200 OK`
- ❌ Se vir `ERR_NAME_NOT_RESOLVED`, o `SUPABASE_URL` ainda está errado

---

## 🐛 Troubleshooting

### Erro: `net::ERR_NAME_NOT_RESOLVED`
**Causa:** `SUPABASE_URL` ainda é o placeholder  
**Solução:** Atualize com URL real do Supabase

### Erro: `Invalid API key`
**Causa:** `SUPABASE_ANON_KEY` incorreta ou expirada  
**Solução:** Copie novamente do Supabase Dashboard → API

### Erro: `Failed to fetch`
**Causa:** URL incorreto ou problemas de CORS  
**Solução:** Verifique **Supabase → Authentication → URL Configuration** e adicione `PUBLIC_SITE_URL` nas URLs permitidas

### OAuth não redireciona
**Causa:** Redirect URLs não configuradas no Supabase  
**Solução:** Veja `docs/OAUTH-SETUP-COMPLETE.md` para configuração completa

---

## 📚 Documentação Relacionada

- `docs/OAUTH-SETUP-COMPLETE.md` - Configuração completa de OAuth (Google/Facebook)
- `docs/setup/SUPABASE-SETUP.md` - Configuração inicial do Supabase
- `VERCEL-DEPLOY-GUIDE.md` - Deploy com variáveis de ambiente

---

## 🎯 Próximos Passos

1. ✅ Atualizar `env-config.json` com valores reais
2. ✅ Testar login local com OAuth
3. ✅ Configurar variáveis de ambiente para produção
4. ✅ Remover `env-config.json` do Git se repositório for público

---

**Última Atualização:** 27 de outubro de 2025  
**Autor:** AI Assistant (DevTools Fixes)
