# 🚀 Garcia Builder - Configuração Supabase

## 📋 Resumo do que foi implementado

✅ Sistema de autenticação Supabase completo implementado
✅ Formulários de login, cadastro e reset de senha funcionais
✅ Proteção de páginas com autenticação obrigatória
✅ Interface de usuário integrada com Bootstrap
✅ Sistema de pagamento Stripe com Payment Links

## 🔧 Passos para configurar o Supabase

### 1. Criar conta no Supabase
1. Acesse https://supabase.com
2. Clique em "Start your project"
3. Faça login com GitHub, Google ou email
4. Clique em "New Project"

### 2. Configurar o projeto
1. **Organization**: Escolha ou crie uma organização
2. **Project Name**: `garcia-builder`
3. **Database Password**: Crie uma senha forte (anote!)
4. **Region**: Escolha a região mais próxima (ex: South America)
5. Clique em "Create new project"

### 3. Obter as credenciais do projeto
Após o projeto ser criado (pode levar alguns minutos):

1. Vá para **Settings** > **API**
2. Copie os valores:
   - **Project URL** (algo como: `https://xxx.supabase.co`)
   - **anon public key** (chave pública que começa com `eyJhbG...`)

### 4. Configurar as credenciais no código

Abra o arquivo `js/supabase.js` e substitua as credenciais:

```javascript
// Configuração do Supabase
const supabaseUrl = 'SUA_URL_DO_SUPABASE_AQUI'; // Cole a Project URL aqui
const supabaseKey = 'SUA_CHAVE_PUBLICA_AQUI';   // Cole a anon public key aqui
```

### 5. Configurar o banco de dados

No painel do Supabase, vá para **SQL Editor** e execute este comando:

```sql
-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Política para usuários atualizarem apenas seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Política para criação automática de perfil
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função quando um novo usuário é criado
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 6. Configurar autenticação por email

No painel do Supabase:

1. Vá para **Authentication** > **Settings**
2. Em **Auth Settings**, configure:
   - **Enable email confirmations**: ✅ Ativado
   - **Site URL**: `https://seudominio.github.io` (substitua pela URL do seu GitHub Pages)
   - **Redirect URLs**: Adicione:
     - `https://seudominio.github.io/dashboard.html`
     - `https://seudominio.github.io/reset-password.html`

### 7. Configurar templates de email (opcional)

Em **Authentication** > **Email Templates**, você pode personalizar:
- **Confirm signup**: Email de confirmação de cadastro
- **Reset password**: Email de reset de senha
- **Magic Link**: Email de login mágico

## 🧪 Testando o sistema

### 1. Teste local
1. Abra `login.html` no navegador
2. Tente criar uma nova conta
3. Verifique o email de confirmação
4. Faça login e acesse o dashboard

### 2. Teste no GitHub Pages
1. Faça push das alterações para o GitHub
2. Aguarde o deploy do GitHub Pages
3. Teste o fluxo completo online

## 🔐 Recursos implementados

### Sistema de Autenticação
- ✅ **Cadastro de usuário** com validação de email
- ✅ **Login com email/senha**
- ✅ **Reset de senha** via email
- ✅ **Confirmação de email** obrigatória
- ✅ **Logout seguro**
- ✅ **Proteção de páginas** (dashboard)
- ✅ **Gerenciamento de sessão** automático

### Interface de Usuário
- ✅ **Design responsivo** com Bootstrap
- ✅ **Mensagens de status** informativas
- ✅ **Validação de formulários** em tempo real
- ✅ **Internacionalização** (i18n) preservada
- ✅ **Dropdown de usuário** no header
- ✅ **Redirecionamento inteligente** após login

### Integração com Stripe
- ✅ **Payment Links** funcionais
- ✅ **Páginas de preço** atualizadas
- ✅ **Sem dependência de backend**
- ✅ **Compatível com GitHub Pages**

## 🛠️ Arquivos modificados/criados

### Novos arquivos:
- `js/supabase.js` - Configuração do cliente Supabase
- `js/auth-supabase.js` - Sistema de autenticação completo
- `reset-password.html` - Página de reset de senha
- `SUPABASE-SETUP.md` - Este guia de configuração

### Arquivos modificados:
- `login.html` - Integração com Supabase
- `dashboard.html` - Proteção e dados do usuário
- `js/payment-links.js` - URLs dos Payment Links
- `js/pricing.js` - Integração com Payment Links
- `pricing.html` - Scripts atualizados

## 🚨 Importante

1. **Segurança**: As chaves públicas do Supabase podem ser expostas no frontend
2. **HTTPS**: O GitHub Pages usa HTTPS automaticamente, necessário para autenticação
3. **Email**: Configure um provedor de email no Supabase para produção
4. **Domínio**: Atualize as URLs de redirecionamento quando mudar o domínio

## 📞 Suporte

Se encontrar problemas:

1. **Logs do navegador**: Abra F12 > Console para ver erros
2. **Logs do Supabase**: Vá para Logs no painel do Supabase
3. **Documentação**: https://supabase.com/docs
4. **Comunidade**: https://github.com/supabase/supabase/discussions

---

**🎉 Parabéns! Seu sistema de autenticação Supabase está pronto para uso!**
