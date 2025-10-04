# Documentação de Tracking – Garcia Builder

> Versão: v1.2 (GA4 + Pixel publicados via GTM)
> Status: Container publicado (`GA4-Pixel-v1`). Tags GA4 (select_item, begin_checkout, lead, sign_up, download_guide, purchase) e Meta Pixel (Base, ViewContent, InitiateCheckout, Lead, CompleteRegistration, Purchase) implementadas e validadas em Preview antes da publicação.

---
## 1. Objetivos
Centralizar a medição de funil (visita → interação com planos → início de checkout → lead / sign_up → purchase) em **Google Analytics 4** e **Meta Pixel**, usando **Google Tag Manager (GTM)** para flexibilidade, governança e futura implementação de Consent Mode.

## 2. Componentes
- Container GTM: `GTM-TG5TFZ2C`
- GA4 Measurement ID: `G-CMMHJP9LEY`
- Meta Pixel ID: (preencher / confirmar) <!-- Substituir antes de ambientes de produção -->
- Fonte de eventos: pushes `dataLayer.push({...})` já existentes no front-end.

## 3. Eventos do Site (dataLayer atuais)
| Evento (dataLayer) | GA4 Event Name (Tag) | Pixel Event | Descrição | Status |
|--------------------|----------------------|-------------|-----------|--------|
| plan_selection     | select_item          | ViewContent             | Usuário seleciona/visualiza um plano específico | Implementado |
| begin_checkout     | begin_checkout       | InitiateCheckout | Usuário avança para iniciar processo de checkout | Implementado |
| generate_lead      | lead                 | Lead        | Conversão de lead (form contato / consultoria) | Implementado |
| sign_up            | sign_up              | CompleteRegistration (opcional) | Criação/registro de conta (newsletter ou auth) | Implementado |
| download_guide     | download_guide (ou ebook_download) | (custom) | Download de material/guia | Implementado |
| purchase           | purchase             | Purchase    | Compra confirmada (Stripe sessão concluída) | Implementado |

### Observação de Nomeclatura
Optamos por manter os nomes originais no código e fazer o **renome dentro das Tags GA4** onde necessário (ex.: `plan_selection` → `select_item`). Assim evitamos retrabalho em JS neste momento.

## 4. Parâmetros Esperados por Evento
| Evento | Parâmetros recomendados (GA4) | Origem Atual | Observações |
|--------|-------------------------------|--------------|-------------|
| select_item (plan_selection) | items[], value (opcional), currency | pricing UI | Garantir cada item: { item_id (plan_key), item_name (plan_name), price (opcional) } |
| begin_checkout | items[], value, currency | pricing → botão avançar | Seguir mesmo array do plano escolhido |
| lead | form_id, source (opcional), method (opcional) | formulários contato/newsletter | `form_id` já enviado; adicionar `source` se múltiplos canais |
| sign_up | method (email / social) | Supabase / newsletter | Padronizar `method` = 'email' por enquanto |
| download_guide | file_name, guide_id, source | newsletter-manager | Definir convenção (ex.: `guide_id: 'starter_ebook_v1'`) |
| purchase | transaction_id, value, currency, items[], coupon (opt), discount (opt) | success.html | Estrutura GA4 Ecommerce já preparada |

### Estrutura do Array `items`
```jsonc
[
  {
    "item_id": "plan_key_ex:premium_monthly",   // DO: usar chave única
    "item_name": "Plano Premium Mensal",        // Nome exibido ao usuário
    "price": 49.99,                              // Opcional (numérico)
    "quantity": 1,                               // Sempre 1 (assinatura)
    "item_category": "coaching_plan",          // Categoria padrão sugerida
    "currency": "GBP"                          // Repetido se necessário
  }
]
```

## 5. Variáveis de Camada de Dados no GTM (criar)
| Nome Variável GTM | Tipo | Nome da chave no dataLayer | Uso |
|-------------------|------|----------------------------|-----|
| dlv_transaction_id| Data Layer Variable | transaction_id | purchase |
| dlv_value         | Data Layer Variable | value          | vários eventos |
| dlv_currency      | Data Layer Variable | currency       | vários |
| dlv_items         | Data Layer Variable | items          | ecommerce |
| dlv_plan_key      | Data Layer Variable | plan_key       | enrich select_item |
| dlv_plan_name     | Data Layer Variable | plan_name      | enrich select_item |
| dlv_form_id       | Data Layer Variable | form_id        | lead/sign_up |
| dlv_source        | Data Layer Variable | source         | lead/download |
| dlv_method        | Data Layer Variable | method         | sign_up |
| dlv_file_name     | Data Layer Variable | file_name      | download_guide |
| dlv_guide_id      | Data Layer Variable | guide_id       | download_guide |

Observação: se algum parâmetro não estiver disponível ainda no push, adicionar depois no código JS correspondente.

## 6. Tags GA4 no GTM
1. **GA4 Configuration**
   - Tipo: "Configuração do Google Analytics: GA4"
   - ID de medição: `G-CMMHJP9LEY`
   - Disparo: All Pages
   - (Debug temporário) Campo user_properties / debug_mode se desejar.

2. **GA4 Event – select_item**
   - Tipo: GA4 Event
   - Nome do evento: `select_item`
   - Parâmetros: items (dlv_items), value (dlv_value), currency (dlv_currency)
   - Disparo: Evento personalizado = `plan_selection`

3. **GA4 Event – begin_checkout**
   - Nome: `begin_checkout`
   - Parâmetros: items, value, currency
   - Disparo: Evento personalizado = `begin_checkout`

4. **GA4 Event – lead**
   - Nome: `lead`
   - Parâmetros: form_id (dlv_form_id), source (dlv_source)
   - Disparo: Evento personalizado = `generate_lead`

5. **GA4 Event – sign_up**
   - Nome: `sign_up`
   - Parâmetros: method (dlv_method)
   - Disparo: Evento personalizado = `sign_up`

6. **GA4 Event – download_guide** (ou `ebook_download`)
   - Nome: `download_guide`
   - Parâmetros: file_name, guide_id, source
   - Disparo: Evento personalizado = `download_guide`

7. **GA4 Event – purchase**
   - Nome: `purchase`
   - Parâmetros: transaction_id, value, currency, items, coupon (se existir), discount (se existir)
   - Disparo: Evento personalizado = `purchase`

## 7. Meta Pixel via GTM
1. **Base Pixel**
    - Tag: HTML personalizado (Meta Pixel)
    - Código (exemplo, substituir PIXEL_ID):
```html
<!-- Meta Pixel Code -->
<script>
   !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
   n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
   n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
   t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script',
   'https://connect.facebook.net/en_US/fbevents.js');
   fbq('init', 'PIXEL_ID');
   fbq('track','PageView');
</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=PIXEL_ID&ev=PageView&noscript=1"/></noscript>
<!-- End Meta Pixel Code -->
```
    - Disparo: All Pages
    - Após publicação remover qualquer script inline redundante de Pixel nos HTML.

2. **Eventos Pixel** (Tags separadas – HTML personalizado ou Tag Meta Pixel dedicada)
    - ViewContent → Disparo: `plan_selection` (ou PageView pricing caso queira ambos)
       - Código: `fbq('track','ViewContent',{content_type:'coaching_plan',content_ids:[{{dlv_plan_key}}]});`
    - InitiateCheckout → Disparo: `begin_checkout`
       - Código: `fbq('track','InitiateCheckout',{content_type:'coaching_plan',value:{{dlv_value}},currency:{{dlv_currency}},contents:[{id:{{dlv_plan_key}},quantity:1}]});`
    - Lead → Disparo: `generate_lead`
       - Código: `fbq('track','Lead',{form_id:{{dlv_form_id}},source:{{dlv_source}}});`
    - CompleteRegistration → Disparo: `sign_up`
       - Código: `fbq('track','CompleteRegistration',{method:{{dlv_method}}});`
    - Purchase → Disparo: `purchase`
       - Código: `fbq('track','Purchase',{value:{{dlv_value}},currency:{{dlv_currency}},contents:[{id:{{dlv_plan_key}},quantity:1}],content_type:'coaching_plan'});`

Observação: garantir que as variáveis (dlv_*) estejam criadas no GTM e habilitar "Suporte a document.write" desativado (não necessário) e tag sequencie após GA4 se quiser ordem, embora não seja obrigatório.

## 8. QA / Testes
| Passo | Ação | Validar em |
|-------|------|-----------|
| 1 | Abrir Preview (Tag Assistant) | GTM mostra carregamento GA4 Config + Pixel Base |
| 2 | Selecionar um plano | Evento custom `plan_selection` aparece → Tag GA4 select_item dispara |
| 3 | Iniciar checkout | Dispara begin_checkout → GA4 / Pixel InitiateCheckout |
| 4 | Enviar formulário contato | generate_lead → GA4 lead + Pixel Lead |
| 5 | Simular cadastro/newsletter | sign_up → GA4 sign_up + Pixel CompleteRegistration (se implementado) |
| 6 | Finalizar pagamento (sandbox) | purchase → GA4 purchase + Pixel Purchase |
| 7 | DebugView GA4 | Eventos em tempo quase real, ordenados corretamente |
| 8 | Pixel Helper (extensão) | Eventos aparecem sem erro (0 warnings) |

### Console Helper
```js
// Ver últimos eventos purchase
window.dataLayer.filter(e => e.event === 'purchase');

// Ver todos os eventos disparados até agora
window.dataLayer.map(e => e.event);
```

## 9. Futuras Melhorias
| Tema | Ação | Prioridade |
|------|------|------------|
| Consent Mode | Implementar banner + gtag consent update | Alta (antes de Ads) |
| Enriquecimento purchase | Adicionar coupon / discount / duration | Média |
| view_item_list | Enviar evento na carga da página de pricing com todos os planos | Média |
| Normalizar download | Garantir file_name único + guide_id | Média |
| BigQuery Export | Ligar para análises avançadas | Baixa |
| Remover inline Pixel | Após validação completa GTM | Alta |

## 10. Conversões (GA4)
Depois que eventos aparecerem em "Eventos":
1. Administrador → "Conversões" → "Novo evento de conversão".
2. Adicionar: `lead`, `sign_up`, `purchase` (e outros que considerar chave).

## 11. Política e Privacidade
- Atualizar página de `privacy.html` indicando uso de GA4 e Pixel.
- Incluir referência a cookies de análise e marketing.
- Preparar texto para consent mode (se operar na UE / Reino Unido).

## 12. Procedimento de Deploy
1. Criar/ajustar Variáveis e Tags no GTM (Preview).
2. Validar todos os eventos (Tag Assistant + GA4 DebugView + Meta Pixel Helper) usando `analytics-test-helper.js`.
3. Marcar em GA4 (Admin → Eventos → Converter) os eventos: `lead`, `sign_up`, `purchase` (e outros se necessário).
4. Publicar container com:
   - Nome da versão: `GA4-Pixel-v1`
   - Descrição: "GA4 base + eventos (purchase, select_item, begin_checkout, lead, sign_up, download_guide) + Pixel Base + Purchase/Lead/InitiateCheckout/ViewContent/CompleteRegistration."
5. Remover (se existirem) scripts inline do Meta Pixel nos HTMLs (manter apenas via GTM).
6. Deploy do site e smoke test (verificar se GTM carrega, sem duplicidade de eventos).
7. Commit: `feat: publish GTM container GA4-Pixel-v1`.

### Checklist Rápido Antes de Publicar
- [ ] Todos os eventos aparecem no Preview (Tag Assistant) com parâmetros completos.
- [ ] GA4 DebugView mostra ordem do funil correta.
- [ ] Pixel Helper sem warnings/críticos nos principais eventos.
- [ ] Nenhum evento duplicado (comparar counts GA4 vs Pixel se aplicável).
- [ ] Conversion events já marcados em GA4 antes de tráfego real.
- [ ] Privacy / cookies aviso atualizado (se aplicável à jurisdição alvo).

## 13. Publicação do Container (Histórico)
| Data | Versão | Descrição | Notas |
|------|--------|-----------|-------|
| 2025-10-04 | GA4-Pixel-v1 | GA4 base + eventos (purchase, select_item, begin_checkout, lead, sign_up, download_guide) + Pixel Base + Purchase/Lead/InitiateCheckout/ViewContent/CompleteRegistration | Publicado após validação em Preview |

---
**Próximo passo agora:** preencher Measurement ID e Pixel ID neste documento, criar as Tags no GTM e validar.
Quando o Measurement ID for confirmado, atualizar este arquivo e marcar versão v1.1.

---
### Log de Atualizações
- 2025-10-04 (tarde): Publicado container `GA4-Pixel-v1` (upgrade v1.2). Migrado Pixel para GTM. Conversões configuradas.
- 2025-10-04 (manhã): Criadas variáveis GTM (dlv_*). Próximo ciclo era configurar Tags de Evento GA4 e migrar Meta Pixel para GTM (agora concluído).
