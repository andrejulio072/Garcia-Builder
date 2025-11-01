# 🧪 Guia de Testes - Avatar e Perfil

## ✅ Commits Prontos
- **c74235b** - fix: implementar avatar OAuth e corrigir salvamento de perfil
- **ab46a86** - fix: corrigir logout em todos os contextos

---

## 🚀 Como Rodar os Testes

### 1️⃣ Iniciar Servidor Local
```bash
# Opção 1: Python
python -m http.server 8000

# Opção 2: Node.js
npx serve .

# Opção 3: Live Server (VS Code Extension)
# Clique com botão direito em index.html → "Open with Live Server"
```

### 2️⃣ Abrir no Navegador
```
http://localhost:8000
```

### 3️⃣ Abrir DevTools
- Pressione **F12**
- Vá para aba **Console**

### 4️⃣ Fazer Login
- Clique em **Login** ou **Sign In**
- Escolha **Google** ou **Facebook**
- Complete o login OAuth

---

## ✅ Checklist de Testes

### [ ] TESTE 1 - Avatar OAuth
**Passos:**
1. Fazer login com Google ou Facebook
2. Verificar se aparece foto do perfil no dashboard (canto superior direito)
3. Verificar console

**Resultado Esperado:**
- ✅ Avatar do OAuth aparecendo no dashboard
- Console mostra: `✅ Using OAuth avatar: https://...`

**Se falhar:**
- Console mostra: `⚠️ No OAuth picture, using initials`
- Verifique qual avatar foi usado nos logs

---

### [ ] TESTE 2 - Salvar Perfil Básico
**Passos:**
1. Ir para página de **Perfil**
2. Preencher:
   - Nome completo
   - Telefone
   - Objetivos (checkboxes)
3. Clicar em **Save**
4. Recarregar página (F5)
5. Verificar se dados persistiram

**Resultado Esperado:**
- ✅ Campos preenchidos após reload
- ✅ Nome correto no dashboard (não "User")
- Console mostra: `💾 Saving profile (basic)` + `✅ Saved to localStorage`

**Console Logs:**
```
✓ full_name: Seu Nome
✓ phone: (11) 99999-9999
✓ goals: Perder peso, Ganhar massa muscular
```

---

### [ ] TESTE 3 - Salvar Métricas Corporais
**Passos:**
1. Na aba **Body Metrics** do perfil
2. Preencher:
   - Peso atual (kg)
   - Altura (cm)
   - Medidas corporais (peito, cintura, quadril, etc)
3. Clicar em **Save**
4. Recarregar página (F5)
5. Verificar se métricas persistiram

**Resultado Esperado:**
- ✅ Métricas preenchidas após reload
- ✅ IMC calculado automaticamente
- Console mostra: `💾 Saving profile (body_metrics)` + `✅ Saved to Supabase`

**Console Logs:**
```
✓ current_weight: 80
✓ height: 175
✓ measurement chest: 100
✓ Triggered BMI calculation
```

---

### [ ] TESTE 4 - Verificar LocalStorage
**Passos:**
1. Abrir DevTools → **Application** (ou Storage)
2. Ir para **Local Storage**
3. Procurar chave: `garcia_profile_<user-id>`

**Resultado Esperado:**
- ✅ Chave existe no localStorage
- ✅ JSON contém `basic` e `body_metrics` preenchidos

**Estrutura Esperada:**
```json
{
  "basic": {
    "full_name": "Seu Nome",
    "phone": "(11) 99999-9999",
    "goals": ["Perder peso", "Ganhar massa muscular"],
    "avatar_url": "https://..."
  },
  "body_metrics": {
    "current_weight": 80,
    "height": 175,
    "measurements": {
      "chest": 100,
      "waist": 85,
      "hips": 95
    }
  }
}
```

---

## 🔍 Comandos do Console para Debug

### Ver perfil salvo no localStorage
```javascript
Object.keys(localStorage)
  .filter(k => k.startsWith('garcia_profile_'))
  .forEach(k => console.log(k, JSON.parse(localStorage[k])));
```

### Ver usuário atual (OAuth)
```javascript
supabaseClient.auth.getUser()
  .then(({data}) => console.log('User:', data.user));
```

### Forçar reload do perfil
```javascript
GarciaProfileManager.loadProfileData();
```

### Verificar avatar do usuário
```javascript
supabaseClient.auth.getUser()
  .then(({data}) => console.log('Avatar:', data.user?.user_metadata?.picture));
```

### Ver todos os logs de perfil
```javascript
// Já está implementado automaticamente!
// Procure por emojis no console:
// 📊 = Dashboard
// 📥 = Loading data
// 💾 = Saving data
// ✅ = Success
// ⚠️ = Warning
// 🖼️ = Avatar
// ✓ = Field populated
```

---

## 🐛 Troubleshooting

### ❌ Avatar não aparece
**Sintomas:**
- Aparece placeholder ou iniciais
- Console mostra: `⚠️ No OAuth picture`

**Possíveis causas:**
1. Login não foi feito com OAuth (Google/Facebook)
2. OAuth não forneceu foto do perfil
3. Problema de CORS (verifique Network tab)

**Solução:**
```javascript
// Verificar se OAuth forneceu picture
supabaseClient.auth.getUser()
  .then(({data}) => {
    console.log('Picture:', data.user?.user_metadata?.picture);
    console.log('Avatar URL:', data.user?.user_metadata?.avatar_url);
  });
```

---

### ❌ Perfil não salva
**Sintomas:**
- Dados não persistem após reload
- Console não mostra `💾 Saving profile`

**Possíveis causas:**
1. Form não foi encontrado (console mostra `⚠️ form not found`)
2. Botão Save não está funcionando
3. Erro no Supabase (verifique console para erros)

**Solução:**
```javascript
// Verificar se forms foram encontrados
console.log('Basic form:', document.getElementById('basic-info-form'));
console.log('Metrics form:', document.getElementById('body-metrics-form'));

// Forçar save manual
GarciaProfileManager.saveProfileData('basic');
```

---

### ❌ Métricas não salvam
**Sintomas:**
- Peso/altura não persistem
- IMC não calcula

**Possíveis causas:**
1. Form body-metrics-form não existe
2. Campos com IDs incorretos
3. Erro no cálculo de IMC

**Solução:**
```javascript
// Verificar campos de métricas
const form = document.getElementById('body-metrics-form');
console.log('Weight input:', form?.querySelector('[name="current_weight"]'));
console.log('Height input:', form?.querySelector('[name="height"]'));

// Verificar profileData
console.log('Body metrics:', GarciaProfileManager.profileData.body_metrics);
```

---

### ❌ LocalStorage vazio
**Sintomas:**
- Chave `garcia_profile_<user-id>` não existe
- JSON está vazio ou sem dados

**Possíveis causas:**
1. Save nunca foi executado
2. Erro ao salvar (console mostra erro)
3. User ID incorreto

**Solução:**
```javascript
// Verificar user ID
supabaseClient.auth.getUser()
  .then(({data}) => console.log('User ID:', data.user?.id));

// Forçar criação da chave
GarciaProfileManager.saveToLocalStorage();

// Verificar se salvou
console.log('Keys:', Object.keys(localStorage).filter(k => k.startsWith('garcia_')));
```

---

## 📝 O Que Reportar

Quando reportar os resultados dos testes, inclua:

### ✅ Testes que FUNCIONARAM:
- [ ] Avatar OAuth apareceu
- [ ] Nome correto no dashboard
- [ ] Perfil salvou
- [ ] Métricas salvaram
- [ ] Dados persistiram após reload

### ❌ Testes que FALHARAM:
Para cada teste que falhou, copie:
1. **Console logs** (print screen ou copiar texto)
2. **Network tab** (erros de API)
3. **Application tab** → LocalStorage (conteúdo)
4. Qual navegador está usando

### 📸 Screenshots Úteis:
- Dashboard mostrando avatar e nome
- Perfil com dados preenchidos
- Console com logs coloridos
- LocalStorage com dados salvos

---

## 🎯 Resultado Final Esperado

Após concluir todos os testes, você deve ter:

✅ Avatar do OAuth aparecendo no dashboard e perfil  
✅ Nome completo correto (não "User")  
✅ Perfil completo salvo (nome, telefone, objetivos)  
✅ Métricas corporais salvas (peso, altura, medidas)  
✅ IMC calculado automaticamente  
✅ Dados persistindo após reload (F5)  
✅ LocalStorage populado com JSON completo  
✅ Console mostrando logs de sucesso (✅, 💾, 📊)  

---

**Branch:** `fix/logout-and-profile`  
**Último commit:** `c74235b` - fix: implementar avatar OAuth e corrigir salvamento de perfil

**📞 Após testar, reporte os resultados!**
