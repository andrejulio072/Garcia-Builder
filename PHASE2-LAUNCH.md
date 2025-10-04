## Fase 2 – Lançamento de Aquisição & Escala Inicial

Este documento resume o que fazer fora do código (plataformas) + o que já está pronto internamente.

### 1. GA4
1. Admin > Conversions: marcar purchase, generate_lead, sign_up (opcional begin_checkout).
2. Audiences sugeridas: Visitors_30d, Engaged_30d, Checkout_Started (begin_checkout sem purchase 14d), Leads, Customers.
3. Ativar Google Signals se política de consentimento suportar.
4. Data retention: 14 months.

### 2. GTM
Criar/validar tags GA4 evento para generate_lead, sign_up, download_guide (se ainda não publicados). Publicar container versão: GA4-Pixel-v1.

### 3. Search Console
Adicionar propriedade, verificar domínio ou HTML file, submeter sitemap.xml, revisar Coverage após 48h.

### 4. Google Ads (início enxuto)
Campanha Brand + Campanha Core Intent (grupos por tema). Negativas: free, jobs, pdf, template, reddit, forum.
Importar conversões GA4 ou usar measurement direta (preferir importar para ver value). Extensões: Sitelinks, Callouts, Structured Snippets.

### 5. Meta Ads
Substituir FACEBOOK_PIXEL_ID real no código. Domínio verificado no BM. Configurar eventos priorizados (purchase > generate_lead > sign_up). Campanhas: TOF (vídeo) + BOF (conversions/lead). Público remarketing site 30d.

### 6. Instagram Orgânico (Ciclo 30 dias)
3 Reels + 2 Carrosséis + 1 Caso + Stories diários. CTA flutuante: consulta / guia.

### 7. Email Automação
Workflow mínimo (D0, D1, D3, D5, D7). Plataforma leve (Mailerlite / Brevo). Segmentar leads vs clientes.

### 8. KPIs 1ª Quinzena
CTR Search Brand >30%; CTR Generic 6–12%; CPL Meta €7–15; CPL Search €10–18; Lead→Consulta 35–55%; Consulta→Cliente 25–40%.

### 9. Naming UTM
utm_source, utm_medium, utm_campaign, utm_content, utm_term. Padrão: campanha: fase_objetivo_var (ex: search_core_en).

### 10. Daily Routine (<10min)
1. GA4 Realtime.
2. GAds spend.
3. Meta frequência / comentários.
4. Follow-up WhatsApp < 24h.

### 11. Scripts Internos
- utm-capture.js (OK) – atribuição forms.
- engagement-tracking.js – scroll + lead magnet (adicionado agora).
- Próximo: consent mode stub / view_item_list (opcional Fase 3).

### 12. Publicação Container
Debug Preview > Tag Assistant > validar eventos + DebugView GA4 > Publish: GA4-Pixel-v1.

### Checklist Ordem de Execução
1. Pixel ID real.
2. Marcar conversões GA4.
3. Criar tags faltantes / Publish.
4. Search Console + sitemap.
5. GAds Brand + Core.
6. Meta TOF + BOF.
7. Email workflow (3 primeiros emails prontos).
8. Calendário Instagram.
9. Monitorar KPIs 5 dias antes de escalar.

---
Após termos ≥25 leads e ≥5 vendas: iniciar Lookalikes e Display/YouTube remarketing.
