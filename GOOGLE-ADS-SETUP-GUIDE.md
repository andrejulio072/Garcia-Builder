# 📋 GUIA PASSO A PASSO - CONFIGURAR GOOGLE ADS CONVERSÃO

**🎯 Objetivo:** Ativar rastreamento de conversões no Google Ads em 10 minutos

---

## ✅ PRÉ-REQUISITOS

- [x] Código já está implementado no site (AW-1762742053)
- [x] Tag global em todas as páginas
- [x] Event snippet na página success.html
- [ ] Conta Google Ads ativa
- [ ] Acesso ao painel do Google Ads

---

## 🚀 PASSO 1: ACESSAR CONVERSÕES

1. Ir para: https://ads.google.com/
2. Fazer login na conta
3. Clicar em **"Ferramentas e Configurações"** (ícone de chave inglesa no canto superior direito)
4. Em **"Medição"**, clicar em **"Conversões"**

---

## 🎯 PASSO 2: CRIAR NOVA CONVERSÃO

1. Na página de Conversões, clicar em **"+ Nova ação de conversão"**
2. Selecionar **"Website"**
3. Selecionar **"Criada manualmente com código"**
4. Clicar em **"Continuar"**

---

## 📝 PASSO 3: CONFIGURAR DETALHES DA CONVERSÃO

### **Nome e Categoria:**
```
Nome: Purchase - Coaching Plan
Categoria: Compra/Venda
Descrição: Conversão quando cliente completa pagamento
```

### **Valor:**
```
☑ Usar um valor diferente para cada conversão
☐ Usar o mesmo valor para cada conversão

→ Selecionar: "Usar um valor diferente para cada conversão"
```

### **Contagem:**
```
○ Uma conversão
● Todas as conversões

→ Selecionar: "Todas as conversões"
```

### **Janela de conversão (Click-through):**
```
30 dias (padrão)
```

### **Janela de conversão (View-through):**
```
1 dia (padrão)
```

### **Modelo de atribuição:**
```
Baseado em dados (recomendado)
```

---

## 🔧 PASSO 4: CONFIGURAR TAG

1. Em **"Configurar a tag"**, selecionar:
   ```
   ● Usar o Google tag
   ```

2. **ID da tag:** `AW-1762742053`

3. **Rótulo de conversão:** `mdOMCOTV3acbEWWes9VB`

4. Clicar em **"Concluído"**

---

## ⚡ PASSO 5: ATIVAR ENHANCED CONVERSIONS

1. Na lista de conversões, encontrar "Purchase - Coaching Plan"
2. Clicar nos 3 pontinhos (⋮) → **"Configurações"**
3. Rolar até **"Conversões otimizadas"**
4. Ativar: **"Ativar conversões otimizadas"**
5. Método: **"Google tag"** (já implementado automaticamente)
6. Salvar

---

## 🧪 PASSO 6: TESTAR

### **Teste Imediato (Tag Assistant):**

1. Instalar: [Google Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-companion/jmekfmbnaedfebfnmakmokmlfpblbfdm)
2. Visitar: `https://garciabuilder.fitness/`
3. Clicar no ícone Tag Assistant
4. Clicar em **"Connect"**
5. Navegar pelo site
6. Verificar se aparece: `Google Ads - AW-1762742053` ✅

### **Teste Real:**

1. Fazer uma compra teste com cartão Stripe de teste
2. Aguardar 10-15 minutos
3. Voltar ao Google Ads → Conversões
4. Verificar se apareceu 1 conversão registrada

### **Teste com Preview Mode:**

1. No Google Ads, em Conversões
2. Clicar na conversão criada
3. Clicar em **"Ver conversões recentes"**
4. Aguardar 24-48h para dados completos

---

## 📊 PASSO 7: CONFIGURAR RELATÓRIOS

### **Adicionar Colunas:**

1. Ir para qualquer campanha
2. Clicar em **"Colunas"** → **"Modificar colunas"**
3. Em **"Conversões"**, adicionar:
   - ✅ Conversões
   - ✅ Taxa de conversão
   - ✅ Custo por conversão
   - ✅ Valor da conversão

### **Criar Segmento:**

1. Ir para **"Relatórios"** → **"Conversões"**
2. Filtrar por:
   - **Nome da conversão:** "Purchase - Coaching Plan"
   - **Período:** Últimos 30 dias

---

## 🎯 PASSO 8: USAR EM CAMPANHAS

### **Criar Campanha com Foco em Conversões:**

1. Clicar em **"+ Nova campanha"**
2. **Objetivo:** Vendas
3. **Tipo de campanha:** Pesquisa ou Performance Max
4. Em **"Conversões"**, selecionar:
   - ✅ Purchase - Coaching Plan
5. **Estratégia de lance:**
   - Recomendado: "Maximizar conversões"
   - Ou: "CPA desejado" (após 30 conversões)

### **Definir Orçamento:**

```
Orçamento diário recomendado: €20-50
CPA target: €30-50 (após dados suficientes)
```

---

## ✅ CHECKLIST FINAL

### **No Google Ads:**
- [ ] Conversão "Purchase - Coaching Plan" criada
- [ ] Enhanced Conversions ativado
- [ ] Tag ID correto (AW-1762742053)
- [ ] Rótulo correto (mdOMCOTV3acbEWWes9VB)
- [ ] Valor configurado como "diferente para cada"
- [ ] Contagem em "Todas"

### **No Site:**
- [x] Tag global em todas as páginas ✅
- [x] Event snippet em success.html ✅
- [x] Valor dinâmico implementado ✅
- [x] Transaction ID único ✅

### **Testes:**
- [ ] Tag Assistant mostra tag carregando
- [ ] Compra teste dispara conversão
- [ ] Valor correto aparece no Google Ads
- [ ] Conversão aparece em 24-48h

---

## 🚨 ERROS COMUNS E SOLUÇÕES

### **❌ Conversão não aparece:**

**Possível causa 1:** Tag não está carregando
- Solução: Usar Tag Assistant para verificar

**Possível causa 2:** Conversão não foi criada no Google Ads
- Solução: Seguir PASSO 2-4 acima

**Possível causa 3:** Aguardar mais tempo
- Solução: Dados podem demorar até 48h

### **❌ Valor incorreto:**

**Possível causa:** Moeda errada
- Solução: Verificar se está em GBP (não EUR)

**Possível causa:** Valor em centavos
- Solução: Código divide por 100 automaticamente

### **❌ Múltiplas conversões para mesma compra:**

**Possível causa:** Usuário recarrega success.html
- Solução: Adicionar flag no localStorage (implementar se necessário)

---

## 📞 PRECISA DE AJUDA?

### **Google Ads Support:**
- Chat: https://support.google.com/google-ads/gethelp
- Telefone: Disponível no painel do Google Ads
- Email: Via painel de suporte

### **Documentação:**
- Configurar conversões: https://support.google.com/google-ads/answer/6095821
- Enhanced Conversions: https://support.google.com/google-ads/answer/9888656
- Troubleshooting: https://support.google.com/google-ads/answer/2454992

---

## 🎉 PRONTO!

Após configurar, suas conversões começarão a aparecer automaticamente.

**Próximos passos:**
1. Aguardar primeiras conversões (24-48h)
2. Criar campanha com foco em conversões
3. Otimizar com base em dados
4. Escalar o que funciona

**Boa sorte! 🚀**
