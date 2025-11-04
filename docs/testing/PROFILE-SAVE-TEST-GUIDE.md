# 🧪 Guia de Teste - Salvamento de Dados do Perfil

## 📋 Visão Geral

Este guia descreve os testes para verificar se os dados do usuário estão sendo salvos corretamente no sistema Garcia Builder.

## 🎯 Objetivos do Teste

1. ✅ Verificar que as dependências estão carregadas corretamente
2. ✅ Testar upload de avatar para Supabase Storage
3. ✅ Testar salvamento de informações básicas (nome, telefone)
4. ✅ Testar salvamento de métricas corporais (peso, altura, % gordura)
5. ✅ Verificar persistência de dados (Supabase + localStorage)
6. ✅ Testar conexão com Supabase

## 🧰 Ferramentas

- **Arquivo de Teste**: `test-profile-save.html`
- **URL Local**: http://localhost:8000/test-profile-save.html
- **Console do Navegador**: F12 para ver logs detalhados

## 📝 Passo a Passo dos Testes

### Teste 1: Verificar Dependências ✓
**O que faz**: Verifica se todos os módulos JavaScript necessários estão carregados

**Como testar**:
1. Abrir a página de teste
2. O teste roda automaticamente após 1 segundo
3. Verificar se todos os itens estão marcados como `true`:
   - ✅ `supabaseClient`: Cliente Supabase inicializado
   - ✅ `profileManager`: Gerenciador de perfil carregado
   - ✅ `uploadAvatar`: Função de upload disponível
   - ✅ `saveProfile`: Função de salvamento disponível
   - ℹ️ `currentUser`: Status de autenticação

**Resultado Esperado**: 
```json
{
  "supabaseClient": true,
  "profileManager": true,
  "uploadAvatar": true,
  "saveProfile": true,
  "currentUser": "Authenticated" ou "Not authenticated"
}
```

### Teste 2: Upload de Avatar 📸
**O que faz**: Testa o upload de imagem de avatar para Supabase Storage

**Como testar**:
1. Clicar em "Choose File" e selecionar uma imagem (PNG, JPG, etc.)
2. Clicar em "Upload Test Avatar"
3. Aguardar o resultado

**Validações Automáticas**:
- Tipo de arquivo (apenas imagens)
- Tamanho máximo (5MB)
- Upload para bucket `profiles` no Supabase
- Geração de nome único: `userId-timestamp.ext`
- Fallback para base64 se offline

**Resultado Esperado**:
```json
{
  "avatarUrl": "https://...supabase.co/storage/v1/object/public/profiles/...",
  "fileSize": "123.45 KB",
  "fileType": "image/png"
}
```

### Teste 3: Salvar Informações Básicas 📝
**O que faz**: Testa o salvamento de nome e telefone

**Como testar**:
1. Editar campos "Full Name" e "Phone"
2. Clicar em "Save Basic Info"
3. Verificar mensagem de sucesso

**Dados Salvos**:
- `profileData.basic.full_name`
- `profileData.basic.phone`
- Timestamp de atualização

**Storage**:
- ✅ Supabase: tabela `profiles`
- ✅ localStorage: chave `garcia_profile`

**Resultado Esperado**:
```json
{
  "fullName": "Test User Garcia",
  "phone": "+44 7508 497586",
  "savedAt": "2025-11-01T12:34:56.789Z"
}
```

### Teste 4: Salvar Métricas Corporais ⚖️
**O que faz**: Testa o salvamento de peso, altura e % gordura corporal

**Como testar**:
1. Editar campos "Weight", "Height", "Body Fat %"
2. Clicar em "Save Body Metrics"
3. Verificar cálculo automático de BMI

**Dados Salvos**:
- `profileData.body_metrics.current_weight` (kg)
- `profileData.body_metrics.height` (cm)
- `profileData.body_metrics.body_fat_percentage` (%)
- BMI calculado automaticamente

**Cálculo BMI**: `weight / (height_m)²`

**Resultado Esperado**:
```json
{
  "weight": "80 kg",
  "height": "180 cm",
  "bodyFat": "15%",
  "bmi": "24.7",
  "savedAt": "2025-11-01T12:34:56.789Z"
}
```

### Teste 5: Verificar Persistência de Dados 💾
**O que faz**: Verifica se os dados foram salvos corretamente no localStorage e estão acessíveis

**Como testar**:
1. Após salvar dados nos testes 3 e 4
2. Clicar em "Check Saved Data"
3. Revisar JSON com todos os dados persistidos

**Locais Verificados**:
- `localStorage.gb_current_user`: Cache do usuário atual
- `localStorage.garcia_profile`: Dados completos do perfil
- `localStorage.garcia_user`: Dados de autenticação

**Resultado Esperado**: JSON completo com todas as seções do perfil

### Teste 6: Conexão Supabase 🔌
**O que faz**: Verifica se há conexão ativa com Supabase

**Como testar**:
1. Clicar em "Test Connection"
2. Verificar status da autenticação

**Se Autenticado** ✅:
```json
{
  "userId": "uuid-here",
  "email": "user@example.com",
  "provider": "google",
  "lastSignIn": "2025-11-01T10:00:00Z"
}
```

**Se Não Autenticado** ℹ️:
```json
{
  "status": "No active session"
}
```

## 🔍 Monitoramento e Debug

### Console do Browser (F12)

**Logs Esperados ao Salvar**:
```
💾 Saving profile (basic)...
✅ Saved to Supabase
✅ Saved to localStorage
✅ Profile save complete
```

**Em caso de erro de rede**:
```
⚠️ Supabase save failed (will use localStorage): Network error
✅ Saved to localStorage
```

### DevTools Network Tab

**Requests ao Supabase**:
- `POST /rest/v1/profiles` - Upsert de dados
- `POST /storage/v1/object/profiles/` - Upload de avatar
- `GET /auth/v1/user` - Verificação de usuário

### LocalStorage Inspector

**Chaves Importantes**:
- `garcia_profile`: Dados completos do perfil
- `gb_current_user`: Cache do usuário
- `sb-*-auth-token`: Tokens Supabase

## ✅ Checklist de Validação

### Funcionalidades Críticas
- [ ] Dependências carregadas (Supabase, ProfileManager)
- [ ] Upload de avatar funciona (Supabase Storage)
- [ ] Salvamento de informações básicas (nome, telefone)
- [ ] Salvamento de métricas corporais (peso, altura, gordura)
- [ ] Dados persistem em localStorage
- [ ] Dados sincronizam com Supabase (quando online)
- [ ] Mensagens de erro apropriadas
- [ ] Modo offline funciona (localStorage fallback)

### Casos de Erro
- [ ] Upload de arquivo muito grande (>5MB) é rejeitado
- [ ] Upload de arquivo não-imagem é rejeitado
- [ ] Salvamento sem conexão usa localStorage
- [ ] Recuperação automática quando conexão volta

### Integridade de Dados
- [ ] BMI calculado corretamente
- [ ] Timestamps atualizados corretamente
- [ ] Dados não são perdidos ao recarregar página
- [ ] Avatar URL é válido e acessível

## 🐛 Problemas Conhecidos

### Issue #1: Duplicate Script Declarations
**Status**: Pendente  
**Descrição**: AuthSystem/AuthGuard/COMPONENTS_PATH já declarados  
**Impacto**: Warnings no console, sem impacto funcional  
**Fix**: Adicionar guards `if (!window.AuthSystem)` ou remover duplicatas

## 📊 Resultado dos Testes

### Data: [A COMPLETAR]
### Testador: [A COMPLETAR]

| Teste | Status | Notas |
|-------|--------|-------|
| 1. Dependências | ⏳ | |
| 2. Avatar Upload | ⏳ | |
| 3. Info Básica | ⏳ | |
| 4. Métricas Corpo | ⏳ | |
| 5. Persistência | ⏳ | |
| 6. Conexão Supabase | ⏳ | |

**Legenda**: ✅ Passou | ❌ Falhou | ⏳ Pendente | ⚠️ Com ressalvas

## 🚀 Próximos Passos

1. Executar todos os testes
2. Documentar resultados
3. Corrigir bugs encontrados
4. Fazer commit das correções
5. Merge para main
6. Deploy em produção

## 📚 Arquivos Relacionados

- `test-profile-save.html` - Suite de testes
- `js/admin/profile-manager.js` - Implementação principal
- `pages/public/my-profile.html` - UI do perfil
- `js/core/supabase.js` - Cliente Supabase
- `js/core/auth.js` - Sistema de autenticação

## 💡 Dicas

1. **Use o modo incógnito** para testar sem cache
2. **Abra o DevTools** antes de iniciar os testes
3. **Limpe o localStorage** entre testes se necessário: `localStorage.clear()`
4. **Teste com e sem conexão** para validar fallback
5. **Use imagens pequenas** (<1MB) para testes de avatar

---

**Última Atualização**: 2025-11-01  
**Versão**: 1.0.0  
**Branch**: `fix/logo-and-profile-data-save`

### Teste 7: Exportar Dados do Usu�rio
1. Abrir `pages/public/my-profile.html` (localhost ou file://)
2. Navegar para **Settings > Data Safety & Export**
3. (Opcional) clicar em `Sync Pending Data` para for�ar o envio ao Supabase
4. Clicar em `Download My Data`
5. Confirmar que o arquivo `garcia-builder-export-*.json` foi baixado
6. Conferir se o JSON cont�m os blocos `profile_data`, `body_metrics_entries`, `local_storage` e `supabase_snapshot`

> O arquivo inclui o cache offline (`gb_*`), o hist�rico local e os registros atuais do Supabase (quando online).
