# Configuração OAuth - Garcia Builder

## 🔧 Configuração do Supabase Auth

### 1. Acesse o Dashboard do Supabase
- Vá para [supabase.com](https://supabase.com)
- Entre no seu projeto Garcia Builder
- Navegue para **Authentication** → **Settings**

### 2. Configure Site URL
```
Site URL: https://seu-usuario.github.io/Garcia-Builder
```

### 3. Configure Redirect URLs
```
Redirect URLs:
- https://seu-usuario.github.io/Garcia-Builder/dashboard.html
- https://seu-usuario.github.io/Garcia-Builder/login.html
- http://localhost:3000/dashboard.html (para testes locais)
- http://localhost:3000/login.html (para testes locais)
```

## 🔑 Configuração Google OAuth

### 1. Google Cloud Console
1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie ou selecione seu projeto
3. Navegue para **APIs & Services** → **Credentials**

### 2. Criar OAuth 2.0 Client ID
- **Application type**: Web application
- **Name**: Garcia Builder Auth
- **Authorized JavaScript origins**:
  ```
  https://seu-usuario.github.io
  http://localhost:3000
  ```
- **Authorized redirect URIs**:
  ```
  https://xyzcompany.supabase.co/auth/v1/callback
  ```
  *(Substitua `xyzcompany` pela sua URL do Supabase)*

### 3. Configurar no Supabase
1. Vá para **Authentication** → **Providers** → **Google**
2. **Enable**: ✅ Habilitado
3. **Client ID**: Cole o Client ID do Google
4. **Client Secret**: Cole o Client Secret do Google

## 📘 Configuração Facebook OAuth

### 1. Facebook Developers
1. Acesse [developers.facebook.com](https://developers.facebook.com)
2. Crie um novo app ou selecione existente
3. Vá para **Products** → **Facebook Login** → **Settings**

### 2. Configurar URLs
- **Valid OAuth Redirect URIs**:
  ```
  https://xyzcompany.supabase.co/auth/v1/callback
  ```
  *(Substitua `xyzcompany` pela sua URL do Supabase)*

### 3. Configurar no Supabase
1. Vá para **Authentication** → **Providers** → **Facebook**
2. **Enable**: ✅ Habilitado
3. **Client ID**: App ID do Facebook
4. **Client Secret**: App Secret do Facebook

## 🧪 Teste da Configuração

### 1. Execute o SQL
```sql
-- Cole e execute o conteúdo do arquivo supabase-schema-update.sql
-- no SQL Editor do Supabase
```

### 2. Teste Local
```bash
# Inicie um servidor local para testar
python -m http.server 3000
# ou
npx serve -p 3000
```

### 3. Verificação
1. Acesse `http://localhost:3000/login.html`
2. Teste o cadastro com telefone e data de nascimento
3. Teste login com Google/Facebook
4. Verifique se os dados aparecem no dashboard

## 🔍 Troubleshooting

### Erro "Invalid redirect URL"
- Verifique se todas as URLs estão configuradas corretamente
- Certifique-se de usar HTTPS em produção

### OAuth não funciona
- Confirme que Client ID/Secret estão corretos
- Verifique se os domínios estão autorizados
- Teste em modo incógnito

### Campos não aparecem
- Execute o SQL de schema update
- Verifique se RLS está configurado corretamente
- Confirme que `auth.uid()` está funcionando

## 📊 Monitoramento

### Logs do Supabase
- **Authentication** → **Logs** para ver tentativas de login
- **API** → **Logs** para erros de banco de dados

### Console do Navegador
```javascript
// Debug: verificar dados do usuário
const { data, error } = await supabase.auth.getUser();
console.log('User:', data.user);

// Debug: verificar perfil
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .single();
console.log('Profile:', profile);
```

---
**Após configurar tudo, teste tanto localmente quanto no GitHub Pages!** 🚀
