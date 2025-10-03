# Próximas Implementações e Otimizações (Prioridade Máxima)

Status: aberto • Última atualização: 2025-10-03

## 0) Incidentes de Produção (URGENTE)
- [ ] Verificar e corrigir carregamento da logo em todas as páginas
  - Causa provável: caminho "logo files" vs "Logo Files" (case + espaço). Adicionado rewrite no servidor.
  - Ação: varrer HTML e padronizar para `Logo Files/For Web/logo-nobackground-500.png`
- [ ] Testimonials: cards sem imagem
  - Causa provável: CSP bloqueando imagens externas (randomuser.me) e `img-src` restrito.
  - Ação: CSP relaxado para `imgSrc: 'self' data: https:`. Validar em produção.
- [ ] Contact form: layout e UX quebrando
  - Ação: revisar CSS responsivo + estados de erro/sucesso; alinhar labels/inputs; validar i18n.
- [ ] FAQ: perguntas não aparecem
  - Causa provável: script bloqueado por CSP/inline
  - Ação: habilitado `'unsafe-inline'` em `script-src`; validar execução e dataset i18n.
- [ ] Login: logo não renderiza e layout quebrado
  - Causa provável: caminho da logo + CSS não carregado por CSP
  - Ação: após deploy, validar login.html e aplicar hotfixes.

## 1) SEO e Indexação (ALTA)
- [ ] Enviar `sitemap-index.xml` no GSC (feito) e monitorar cobertura
- [ ] Remover páginas de teste do `sitemap.xml` no próximo ciclo
- [ ] Implementar canonical tags consistentes

## 2) Analytics & Ads (ALTA)
- [ ] Substituir IDs reais (GTM/Pixel) e publicar container
- [ ] Marcar conversões no GA4 (lead, inquiry, ebook, purchase)
- [ ] Testar eventos no Preview (GTM)

## 3) Performance (MÉDIA)
- [ ] Lazy-load sistemático em imagens (hero/testimonials)
- [ ] Preload de fontes críticas
- [ ] Compressão e cache no CDN

## 4) Conteúdo (MÉDIA)
- [ ] Blog seed (3 posts pilares)
- [ ] Provas sociais adicionais

## 5) Segurança (MÉDIA)
- [ ] CSP com nonces (fase 2) reduzindo `'unsafe-inline'`
- [ ] Rate-limit formulários (já há limiter global)

---

## Diagnóstico Pós-Deploy
- [ ] Validar logo nas páginas: index, login, pricing, testimonials, faq, contact
- [ ] Validar FAQ rendering em `faq.html`
- [ ] Validar testimonials imagens e hover
- [ ] Validar contact form (envio + UX)
- [ ] Validar tracking (GTM/GA4/Pixel) nas principais rotas

## Observações Técnicas
- CSP anterior bloqueava inline scripts e imagens externas.
- Problema recorrente com diretório `Logo Files` (case-sensitive em servidores). Adicionado middleware de rewrite para normalizar `/logo files/` → `/Logo Files/`.
- Supabase e Analytics liberados em `connectSrc`.
