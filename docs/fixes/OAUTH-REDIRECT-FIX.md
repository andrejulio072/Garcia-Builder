# 🔧 Fix: OAuth Redirecionando para Dashboard Errado

## 🔴 Problema Identificado

O login com Google estava redirecionando para `/dashboard.html` (página intermediária) em vez de `/pages/public/dashboard.html` (dashboard real).

### Causa Raiz

1. **Redirecionamento Incorreto**: As funções `buildHostedAuthRedirect()` e `buildDashboardRedirectUrl()` estavam configuradas para redirecionar para `dashboard.html` na raiz
2. **Arquivo Intermediário**: O arquivo `dashboard.html` na raiz é apenas um processador OAuth, não o dashboard real
3. **Configuração no Supabase**: As URLs de redirecionamento configuradas no Supabase provavelmente apontavam para a URL errada

### Fluxo Problemático

```
Usuário clica "Login com Google"
    ↓
Supabase processa OAuth
    ↓
Redireciona para: https://garciabuilder.fitness/dashboard.html ❌
    ↓
Usuário vê página intermediária de processamento
    ↓
Deveria ir para: https://garciabuilder.fitness/pages/public/dashboard.html ✅
```

## ✅ Solução Implementada

### 1. Arquivos Modificados

#### `js/core/auth.js`
```javascript
// ANTES
function buildHostedAuthRedirect(path = 'dashboard.html') {
    // ...
    redirect = new URL(path || 'dashboard.html', `${hostedBase}/`);
    // ...
}

// DEPOIS
function buildHostedAuthRedirect(path = 'pages/public/dashboard.html') {
    // ...
    redirect = new URL(path || 'pages/public/dashboard.html', `${hostedBase}/`);
    // ...
}
```

#### `js/core/auth-supabase.js`
```javascript
// ANTES
const buildDashboardRedirectUrl = () => withDevReturnIfNeeded(toSiteAbsoluteUrl('dashboard.html'));

// DEPOIS
const buildDashboardRedirectUrl = () => withDevReturnIfNeeded(toSiteAbsoluteUrl('pages/public/dashboard.html'));
```

#### `pages/auth/login.html`
```javascript
// ANTES
const url = new URL('dashboard.html', `${baseOrigin}/`);

// DEPOIS
const url = new URL('pages/public/dashboard.html', `${baseOrigin}/`);
```

### 2. Configuração Necessária no Supabase

⚠️ **IMPORTANTE**: Você DEVE atualizar as URLs de redirecionamento no dashboard do Supabase.

#### Passo a Passo:

1. **Acesse o Supabase Dashboard**
   - Vá para [supabase.com/dashboard](https://supabase.com/dashboard)
   - Selecione seu projeto Garcia Builder

2. **Navegue para Authentication > URL Configuration**

3. **Atualize as Redirect URLs**

   **REMOVER** (URLs antigas):
   ```
   https://garciabuilder.fitness/dashboard.html
   https://andrejulio072.github.io/Garcia-Builder/dashboard.html
   http://localhost:3000/dashboard.html
   http://localhost:5500/dashboard.html
   http://127.0.0.1:3000/dashboard.html
   ```

   **ADICIONAR** (URLs corretas):
   ```
   https://garciabuilder.fitness/pages/public/dashboard.html
   https://andrejulio072.github.io/Garcia-Builder/pages/public/dashboard.html
   http://localhost:3000/pages/public/dashboard.html
   http://localhost:5500/pages/public/dashboard.html
   http://127.0.0.1:3000/pages/public/dashboard.html
   http://localhost:8080/pages/public/dashboard.html
   ```

4. **Clique em "Save"**

### 3. Verificar Site URL

No mesmo painel (**Authentication > URL Configuration**):

- **Site URL**: Deve ser sua URL de produção
  ```
  https://garciabuilder.fitness
  ```
  ou
  ```
  https://andrejulio072.github.io/Garcia-Builder
  ```

## 🧪 Como Testar

### Teste Local (Desenvolvimento)

1. Inicie seu servidor local:
   ```bash
   # Se usando Live Server na porta 5500
   # ou qualquer outro servidor local
   ```

2. Acesse: `http://localhost:5500/pages/auth/login.html`

3. Clique em "Continuar com Google"

4. Verifique no console do navegador:
   ```javascript
   // Deve mostrar:
   [OAuth] Redirect URL configured: http://localhost:5500/pages/public/dashboard.html?devReturn=...
   ```

5. Após login no Google, você deve ser redirecionado para:
   ```
   http://localhost:5500/pages/public/dashboard.html
   ```

### Teste em Produção

1. Acesse: `https://garciabuilder.fitness/pages/auth/login.html`

2. Clique em "Continuar com Google"

3. Após login no Google, você deve ser redirecionado para:
   ```
   https://garciabuilder.fitness/pages/public/dashboard.html
   ```

## 📋 Checklist de Verificação

- [ ] Arquivos JavaScript atualizados (`auth.js`, `auth-supabase.js`, `login.html`)
- [ ] URLs de redirecionamento atualizadas no Supabase Dashboard
- [ ] Site URL configurada corretamente no Supabase
- [ ] Teste local funcionando (localhost)
- [ ] Teste em produção funcionando (garciabuilder.fitness)
- [ ] Console do navegador não mostra erros de OAuth
- [ ] Usuário é redirecionado corretamente após login

## 🔍 Debugging

Se ainda houver problemas, verifique:

### 1. Console do Navegador

```javascript
// Durante o login, você deve ver:
🔗 OAuth redirect URL configurada: https://garciabuilder.fitness/pages/public/dashboard.html
🚀 Iniciando Google OAuth...
✅ Redirecionamento Google iniciado
```

### 2. Network Tab

- Verifique se a requisição OAuth está sendo feita com o `redirect_uri` correto:
  ```
  redirect_uri=https://garciabuilder.fitness/pages/public/dashboard.html
  ```

### 3. Supabase Logs

- No Supabase Dashboard, vá para **Authentication > Logs**
- Verifique se há erros relacionados a "Invalid redirect URI"

### 4. Verificar env-config.json

Certifique-se de que `PUBLIC_SITE_URL` está correto:

```json
{
  "SUPABASE_URL": "https://seu-projeto.supabase.co",
  "SUPABASE_ANON_KEY": "eyJ...",
  "PUBLIC_SITE_URL": "https://garciabuilder.fitness"
}
```

## 📚 Arquivos Relacionados

- `js/core/auth.js` - Funções de autenticação principais
- `js/core/auth-supabase.js` - Sistema de autenticação Supabase
- `pages/auth/login.html` - Página de login
- `dashboard.html` - Processador OAuth intermediário (mantido para compatibilidade)
- `pages/public/dashboard.html` - Dashboard real do usuário
- `env-config.json` - Configurações do projeto

## 🎯 Resultado Esperado

Após as correções:

1. ✅ Usuário clica em "Continuar com Google"
2. ✅ É redirecionado para autenticação do Google
3. ✅ Após autenticar, retorna diretamente para `/pages/public/dashboard.html`
4. ✅ Vê o dashboard completo e funcional
5. ✅ Não vê a página intermediária de processamento

---

**Status**: ✅ Código atualizado | ⏳ Aguardando configuração no Supabase Dashboard

**Data**: 29 de outubro de 2025
**Branch**: fix/auth-login-404
