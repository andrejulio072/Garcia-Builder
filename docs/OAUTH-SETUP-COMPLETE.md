# ⚙️ Configuração OAuth - Google/Facebook

## 🎯 Problema Identificado

O erro `net::ERR_NAME_NOT_RESOLVED` ocorre porque o `env-config.json` contém URLs placeholder inválidas:
- `SUPABASE_URL: "https://placeholder.supabase.co"` ❌
- `SUPABASE_ANON_KEY: "public-anon-placeholder"` ❌

## ✅ Solução Implementada

### 1. Correções no Código

#### `js/core/auth.js`
- ✅ Removido `skipBrowserRedirect: true` (deixar Supabase redirecionar automaticamente)
- ✅ Redirect URL corrigido para `dashboard.html` (destino final após login)
- ✅ Melhor tratamento de erros e feedback ao usuário

#### `js/core/supabase.js`
- ✅ Loader robusto para `env-config.json` com múltiplos caminhos
- ✅ Suporte para localhost, Vercel e GitHub Pages
- ✅ Timeout com mensagem de erro ao usuário

#### `dashboard.html` (novo)
- ✅ Página intermediária para processar retorno OAuth
- ✅ Valida tokens, salva usuário e redireciona para dashboard real
- ✅ Tratamento de erros com feedback visual

### 2. Configuração Necessária no Supabase

#### A. Obter Credenciais

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** > **API**
4. Copie:
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon/public key** (começa com `eyJ...`)

#### B. Configurar OAuth Providers

##### Google OAuth

1. No Supabase: **Authentication** > **Providers** > **Google**
2. Ative o provedor
3. Adicione suas credenciais OAuth do Google:
   - **Client ID**: obtido no [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - **Client Secret**: obtido no Google Cloud Console
4. Configure **Authorized redirect URIs** no Google Cloud Console:
   ```
   https://[SEU-PROJETO].supabase.co/auth/v1/callback
   ```

##### Facebook OAuth

1. No Supabase: **Authentication** > **Providers** > **Facebook**
2. Ative o provedor
3. Adicione suas credenciais OAuth do Facebook:
   - **App ID**: obtido no [Facebook Developers](https://developers.facebook.com/)
   - **App Secret**: obtido no Facebook Developers
4. Configure **Valid OAuth Redirect URIs** no Facebook:
   ```
   https://[SEU-PROJETO].supabase.co/auth/v1/callback
   ```

#### C. Configurar Redirect URLs

No Supabase: **Authentication** > **URL Configuration**

Adicione as seguintes URLs em **Redirect URLs**:

```
# Localhost (desenvolvimento)
http://localhost:3000/dashboard.html
http://localhost:5500/dashboard.html
http://localhost:8080/dashboard.html
http://127.0.0.1:3000/dashboard.html

# GitHub Pages (produção)
https://andrejulio072.github.io/Garcia-Builder/dashboard.html

# Domínio customizado (se aplicável)
https://seu-dominio.com/dashboard.html
```

⚠️ **IMPORTANTE**: Cada URL deve terminar exatamente em `/dashboard.html`

### 3. Atualizar env-config.json

Substitua os placeholders pelos valores reais:

```json
{
  "SUPABASE_URL": "https://xxxxx.supabase.co",
  "SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "STRIPE_PUBLISHABLE_KEY": "pk_test_xxxxx",
  "PUBLIC_SITE_URL": "https://andrejulio072.github.io/Garcia-Builder"
}
```

**Campos obrigatórios:**
- `SUPABASE_URL`: URL do projeto Supabase
- `SUPABASE_ANON_KEY`: Chave pública anon/public
- `PUBLIC_SITE_URL`: URL pública do site (usado para construir redirect URLs)

### 4. Como Testar

#### Teste Local

1. Inicie um servidor local:
   ```bash
   # Usando Python
   python -m http.server 8080
   
   # Usando Node.js
   npx http-server -p 8080
   
   # Usando VS Code Live Server
   # Clique com direito > Open with Live Server
   ```

2. Acesse: `http://localhost:8080/pages/auth/login.html`

3. Clique em "Continuar com Google" ou "Continuar com Facebook"

#### Teste em Produção

1. Faça commit e push das alterações
2. Aguarde deploy no GitHub Pages
3. Acesse: `https://andrejulio072.github.io/Garcia-Builder/pages/auth/login.html`
4. Teste login social

### 5. Fluxo OAuth Esperado

```
1. Usuário clica "Continuar com Google/Facebook"
   ↓
2. Supabase redireciona para provedor (Google/Facebook)
   ↓
3. Usuário faz login no provedor
   ↓
4. Provedor redireciona para Supabase callback
   ↓
5. Supabase processa tokens e redireciona para dashboard.html
   ↓
6. dashboard.html valida autenticação e salva usuário
   ↓
7. Redireciona para pages/public/dashboard.html
```

### 6. Checklist de Validação

- [ ] `env-config.json` com valores reais (não placeholders)
- [ ] Google OAuth configurado no Google Cloud Console
- [ ] Facebook OAuth configurado no Facebook Developers
- [ ] Providers habilitados no Supabase Dashboard
- [ ] Redirect URLs cadastradas no Supabase
- [ ] Callback URLs cadastradas nos providers (Google/Facebook)
- [ ] `PUBLIC_SITE_URL` definido no env-config.json
- [ ] Código commitado e pushed para o repositório

### 7. Troubleshooting

#### Erro: "net::ERR_NAME_NOT_RESOLVED"
**Causa**: `env-config.json` com URLs placeholder  
**Solução**: Atualizar com valores reais do Supabase

#### Erro: "Invalid redirect URL"
**Causa**: URL não cadastrada no Supabase  
**Solução**: Adicionar em Authentication > URL Configuration > Redirect URLs

#### Erro: "Invalid client_id" (Google)
**Causa**: Credenciais OAuth incorretas ou callback URL errada  
**Solução**: Verificar credenciais no Google Cloud Console e callback URL

#### Erro: "App Not Setup" (Facebook)
**Causa**: App não configurado corretamente  
**Solução**: Verificar Valid OAuth Redirect URIs no Facebook Developers

#### Botão não redireciona
**Causa**: Supabase client não inicializou  
**Solução**: Verificar console do browser; deve mostrar "✅ Supabase client initialized successfully"

#### Redireciona mas não loga
**Causa**: Tokens não sendo processados corretamente  
**Solução**: Verificar console do dashboard.html; tokens devem estar na URL (hash ou query params)

### 8. Referências

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase OAuth Guide](https://supabase.com/docs/guides/auth/social-login)
- [Google OAuth Setup](https://support.google.com/cloud/answer/6158849)
- [Facebook OAuth Setup](https://developers.facebook.com/docs/facebook-login/web)

---

## 📝 Resumo das Alterações

### Arquivos Modificados
- ✅ `js/core/auth.js` - OAuth flow corrigido
- ✅ `js/core/supabase.js` - Loader robusto de env-config
- ✅ `dashboard.html` - Página intermediária OAuth

### Próximos Passos
1. Atualizar `env-config.json` com credenciais reais
2. Configurar providers no Supabase
3. Adicionar redirect URLs no Supabase
4. Testar login social

---

**Status**: ✅ Código pronto | ⏳ Aguardando configuração Supabase
