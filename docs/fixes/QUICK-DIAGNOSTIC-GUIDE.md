# 🚀 GUIA RÁPIDO: Diagnosticar Perda de Dados no Refresh

## ⚡ AÇÕES IMEDIATAS (2 minutos)

### Passo 1: Abrir Página de Diagnóstico
```
http://localhost:8000/tests/test-localStorage-diagnostic.html
```

**O que observar**:
- ✅ Se vê "Chaves de Perfil: ✅ 1 chave(s) encontrada(s)"
  - **Conclusão**: Dados ESTÃO salvos → problema é no LOAD
  
- ❌ Se vê "Chaves de Perfil: ❌ Nenhuma chave encontrada"
  - **Conclusão**: Dados NÃO estão salvos → problema é no SAVE

---

### Passo 2: Recarregar My Profile
```
http://localhost:8000/pages/public/my-profile.html
```

**Abrir DevTools Console** (F12) e procurar por:

#### 📥 Logs de Carregamento (no início):
```
📥 Loading profile data...
🔍 Current user: [ID] [EMAIL]
🏗️ Default profile structure initialized
📊 BEFORE load - profileData.basic: { full_name: '', phone: '', ... }
```

#### ☁️ Logs do Supabase:
```
☁️ Attempting to load from Supabase...
📊 AFTER Supabase load - profileData.basic: { ... }
```

#### 💿 Logs do localStorage (CRÍTICO):
```
💿 Loading from localStorage...
💿 loadFromLocalStorage - activeId: [USER-ID]
🔑 Storage keys to check: ["garcia_profile_guest", "garcia_profile_[USER-ID]"]
📦 localStorage.getItem("garcia_profile_[USER-ID]"): {...}
🔍 Parsed snapshot from "garcia_profile_[USER-ID]": { ... }
🔀 Merging snapshot from "garcia_profile_[USER-ID]"...
📝 BEFORE merge - profileData.basic: { ... }
📝 AFTER merge - profileData.basic: { ... }
✅ Merge complete
📊 AFTER localStorage load - profileData.basic: { ... }
```

---

## 📸 O que enviar no chat

### Cenário A: Se dados estão no localStorage
```
"Diagnóstico: Dados EXISTEM no localStorage mas não carregam"

Screenshot 1: Página de diagnóstico mostrando dados salvos
Screenshot 2: Console com logs de loadFromLocalStorage
Screenshot 3: UI mostrando campos vazios
```

### Cenário B: Se dados NÃO estão no localStorage
```
"Diagnóstico: Dados NÃO estão sendo salvos no localStorage"

Screenshot 1: Página de diagnóstico sem dados
Screenshot 2: Console com logs de save (que você já enviou)
Screenshot 3: Verificar se logs mostram "✅ Saved to localStorage"
```

---

## 🔍 Comandos Rápidos no Console (opcional)

### Verificar manualmente o localStorage:
```javascript
// Ver todas as chaves
Object.keys(localStorage)

// Ver chave de perfil específica (substitua USER-ID)
JSON.parse(localStorage.getItem('garcia_profile_USER-ID'))

// Ver chave de autenticação
Object.keys(localStorage).filter(k => k.includes('auth-token'))
```

---

## ⏱️ Tempo estimado
- Passo 1: 30 segundos
- Passo 2: 1 minuto
- Screenshots: 30 segundos

**Total**: ~2 minutos

---

## 🎯 Resultado Esperado

Com essas informações, conseguiremos:
1. ✅ Confirmar se é problema de SAVE ou LOAD
2. ✅ Ver exatamente onde o fluxo falha
3. ✅ Implementar correção precisa
4. ✅ Testar e validar fix final

---

## 📞 Suporte

Se tiver qualquer dúvida, apenas diga no chat:
- "Não vejo a página de diagnóstico"
- "Console não mostra esses logs"
- "Não sei onde abrir DevTools"

E vou te guiar passo a passo! 🚀
