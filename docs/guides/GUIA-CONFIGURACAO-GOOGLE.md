# 🎯 GUIA COMPLETO - CONFIGURAÇÃO GOOGLE ANALYTICS & TAG MANAGER

## 📊 **PASSO 1: GOOGLE SEARCH CONSOLE**

### **1.1 Adicionar Propriedade**
1. Acesse: https://search.google.com/search-console/
2. Clique **"Adicionar propriedade"**
3. Escolha **"Prefixo do URL"**
4. Digite: `https://garciabuilder.fitness`

### **1.2 Verificação (ESCOLHA UMA OPÇÃO)**

#### **OPÇÃO A: Verificação por DNS (RECOMENDADO)**
1. Escolha **"Verificação por DNS"**
2. Google dará um código TXT: `google-site-verification=ABC123...`
3. **AÇÃO:** Adicionar TXT record no DNS do domínio

#### **OPÇÃO B: Upload de arquivo HTML**
1. Baixar arquivo `googleXXXXXX.html`
2. Fazer upload na raiz do site
3. Confirmar acesso: `https://garciabuilder.fitness/googleXXXXXX.html`

### **1.3 Enviar Sitemap**
Após verificação:
1. Menu **"Sitemaps"**
2. Adicionar: `sitemap-optimized.xml`
3. Clicar **"Enviar"**

---

## 📈 **PASSO 2: GOOGLE ANALYTICS 4**

### **2.1 Criar Conta**
1. Acesse: https://analytics.google.com/
2. **Admin → Criar conta**
3. Configurações:
   - **Nome da conta:** `Garcia Builder`
   - **Nome da propriedade:** `Garcia Builder Website`
   - **Fuso horário:** `(GMT+00:00) Dublin`
   - **Moeda:** `Euro (EUR)`
   - **Setor:** `Fitness e bem-estar`
   - **Tamanho da empresa:** `Pequena (1-100)`

### **2.2 Configurar Stream de Dados**
1. **Plataforma:** Web
2. **URL do site:** `https://garciabuilder.fitness`
3. **Nome do stream:** `Garcia Builder Website`

### **2.3 Copiar Measurement ID**
Exemplo: `G-XXXXXXXXXX` (anotar para usar no GTM)

---

## 🏷️ **PASSO 3: GOOGLE TAG MANAGER**

### **3.1 Criar Conta**
1. Acesse: https://tagmanager.google.com/
2. **Criar conta**
3. Configurações:
   - **Nome da conta:** `Garcia Builder`
   - **País:** `Irlanda`
   - **Nome do contêiner:** `Garcia Builder Website`
   - **Plataforma:** **Web**

### **3.2 Anotar Container ID**
Exemplo: `GTM-XXXXXXX` (substituir no código)

---

## ⚙️ **PASSO 4: CONFIGURAR TAGS NO GTM**

### **4.1 Variáveis Integradas**
1. **Variables → Configure**
2. Habilitar:
   - ✅ Page URL
   - ✅ Page Title
   - ✅ Referrer
   - ✅ Click Element
   - ✅ Click Text
   - ✅ Form Element

### **4.2 Criar Variáveis Personalizadas**

#### **UTM Source**
- **Tipo:** URL Variable
- **Component Type:** Query
- **Query Key:** `utm_source`

#### **UTM Campaign**
- **Tipo:** URL Variable
- **Component Type:** Query
- **Query Key:** `utm_campaign`

#### **UTM Medium**
- **Tipo:** URL Variable
- **Component Type:** Query
- **Query Key:** `utm_medium`

### **4.3 Criar Tags**

#### **TAG 1: GA4 Configuration**
- **Tipo:** Google Analytics: GA4 Configuration
- **Measurement ID:** `G-XXXXXXXXXX` (do GA4)
- **Trigger:** All Pages

#### **TAG 2: GA4 Event - Lead Generated**
- **Tipo:** Google Analytics: GA4 Event
- **Configuration Tag:** {{GA4 Configuration}}
- **Event Name:** `lead_generated`
- **Parameters:**
  - `lead_source` = `{{utm_source}}`
  - `lead_campaign` = `{{utm_campaign}}`
  - `value` = `25`
  - `currency` = `EUR`
- **Trigger:** Custom Event `lead_generated`

#### **TAG 3: GA4 Event - Coaching Inquiry**
- **Event Name:** `coaching_inquiry`
- **Parameters:**
  - `inquiry_type` = `{{inquiry_type}}`
  - `value` = `50`
  - `currency` = `EUR`
- **Trigger:** Custom Event `coaching_inquiry`

#### **TAG 4: GA4 Event - Ebook Download**
- **Event Name:** `ebook_download`
- **Parameters:**
  - `file_name` = `7-passos-secar-mantendo-massa`
  - `value` = `25`
  - `currency` = `EUR`
- **Trigger:** Custom Event `ebook_downloaded`

### **4.4 Criar Triggers**

#### **Custom Event Triggers:**
1. **lead_generated**
   - **Tipo:** Custom Event
   - **Event name:** `lead_generated`

2. **coaching_inquiry**
   - **Tipo:** Custom Event
   - **Event name:** `coaching_inquiry`

3. **ebook_downloaded**
   - **Tipo:** Custom Event
   - **Event name:** `ebook_downloaded`

---

## 📱 **PASSO 5: FACEBOOK PIXEL (META)**

### **5.1 Criar Pixel**
1. Acesse: https://business.facebook.com/
2. **Eventos → Pixels**
3. **Criar pixel**
4. Nome: `Garcia Builder Website`

### **5.2 Copiar Pixel ID**
Exemplo: `123456789012345` (substituir no código)

### **5.3 Configurar Eventos**
**Eventos Standard:**
- ✅ PageView (automático)
- ✅ Lead (formulários)
- ✅ ViewContent (páginas importantes)
- ✅ Purchase (vendas)

---

## 🔧 **PASSO 6: ATUALIZAR CÓDIGOS NO SITE**

### **6.1 Substituir IDs nos Arquivos**

#### **index.html:**
```html
<!-- Trocar GTM-GARCIABUILDER por GTM-XXXXXXX (real) -->
<!-- Trocar FACEBOOK_PIXEL_ID por 123456789012345 (real) -->
```

#### **lead-magnet.html:**
```html
<!-- Trocar GTM-LEADMAGNET por GTM-XXXXXXX (mesmo ID) -->
```

#### **thanks-ebook.html:**
```html
<!-- Mesmo processo -->
```

### **6.2 Implementar em Outras Páginas**
Copiar códigos do GTM e Facebook Pixel para:
- `pricing.html`
- `contact.html`
- `about.html`
- `transformations.html`

---

## ✅ **PASSO 7: TESTAR CONFIGURAÇÃO**

### **7.1 Google Tag Assistant**
1. Instalar extensão: **Tag Assistant Legacy**
2. Visitar: `https://garciabuilder.fitness`
3. Verificar se aparece:
   - ✅ Google Analytics
   - ✅ Google Tag Manager

### **7.2 Facebook Pixel Helper**
1. Instalar extensão: **Facebook Pixel Helper**
2. Verificar se detecta o pixel

### **7.3 GTM Preview Mode**
1. No GTM: **Preview**
2. Inserir URL: `https://garciabuilder.fitness`
3. Testar eventos funcionando

### **7.4 Teste de Conversões**
1. Preencher formulário lead magnet
2. Verificar evento `lead_generated` no GTM
3. Confirmar no GA4: **Relatórios → Eventos**

---

## 📊 **PASSO 8: CONFIGURAR CONVERSÕES GA4**

### **8.1 Marcar Eventos como Conversões**
1. **Admin → Eventos**
2. Marcar como conversão:
   - ✅ `lead_generated`
   - ✅ `coaching_inquiry`
   - ✅ `ebook_download`
   - ✅ `purchase`

### **8.2 Criar Audiências**
1. **Admin → Audiências**
2. **Nova audiência:**
   - **Nome:** `Lead Magnet Visitors`
   - **Condição:** `page_location contains lead-magnet`
   - **Duração:** 30 dias

---

## 🎯 **RESUMO - CHECKLIST FINAL**

### **✅ Google Search Console:**
- [ ] Propriedade adicionada e verificada
- [ ] Sitemap enviado e indexado
- [ ] Sem erros de cobertura

### **✅ Google Analytics 4:**
- [ ] Conta criada e configurada
- [ ] Measurement ID anotado
- [ ] Eventos aparecendo nos relatórios

### **✅ Google Tag Manager:**
- [ ] Container criado
- [ ] Tags configuradas (GA4 + eventos)
- [ ] Preview mode testado
- [ ] Publicado em produção

### **✅ Facebook Pixel:**
- [ ] Pixel criado e ID copiado
- [ ] Código implementado no site
- [ ] Eventos PageView e Lead funcionando

### **✅ Códigos Atualizados:**
- [ ] IDs reais substituídos no código
- [ ] Tracking implementado em todas as páginas
- [ ] Teste completo de conversões

---

## 📞 **PRÓXIMOS PASSOS**

1. **IMPLEMENTAR HOJE:** Google Search Console + GA4
2. **AMANHÃ:** GTM + Facebook Pixel
3. **TESTE:** Verificar todos os eventos funcionando
4. **OTIMIZAR:** Análise de dados após 7 dias

**🎯 RESULTADO:** Tracking completo para escalar de 0 para 500+ leads/mês!

---

**💡 DICAS IMPORTANTES:**
- Sempre testar em Preview antes de publicar
- Aguardar 24-48h para dados aparecerem
- Documentar todos os IDs para referência futura
- Configurar alertas para anomalias de tráfego
