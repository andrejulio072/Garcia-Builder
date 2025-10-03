# Go-Live: publicar online, domínio real e visibilidade

Este guia traz caminhos práticos para começar a vender de verdade, com opções de publicação, domínio próprio e melhorias de visibilidade (SEO/Analytics/Anúncios).

## Visão rápida

- Backend de pagamentos (Stripe) já pronto em `api/stripe-server-premium.js`.
- Frontend é estático (HTML/CSS/JS) e pode ser servido pelo próprio backend Express (opção simples) ou por um CDN (Vercel/Netlify/GitHub Pages).
- Domínio pode apontar direto para o host do backend (Render) ou para o CDN (com CORS liberado no backend).

---

## Opção 1 (mais simples): Render (backend + frontend juntos)

Tudo em um único serviço Node no Render — serve o site estático e expõe a API Stripe.

1) Criar serviço no Render
   - Conecte o repositório (GitHub).
   - Ele vai detectar Node (usa `package.json`).
   - Build Command: `npm install`
   - Start Command: `node api/stripe-server-premium.js`
   - Variáveis de ambiente (Environment → Add Environment Variable):
     - `STRIPE_SECRET_KEY` (live)
     - `STRIPE_PUBLISHABLE_KEY` (live)
   - Health check path: `/health`
   - Plano: Free/Starter (iniciar), escalar depois.

2) Domínio customizado no Render
   - Em Settings → Custom Domains → Add Custom Domain → informe os seus domínios reais:
     - `garciabuilder.fitness` e `www.garciabuilder.fitness`
     - `garciabuilder.uk` e `www.garciabuilder.uk`
   - Siga as instruções de DNS (A/AAAA para o apex; CNAME para `www`) no seu provedor (Namecheap/GoDaddy/Cloudflare).
   - Render provisiona SSL automaticamente (Let's Encrypt).
   - Guia completo de DNS (Namecheap + Render): veja `docs/DNS-NAMECHEAP.md`.

3) CORS e URLs
    - Garanta que o backend (ou configuração no Render) permite os domínios finais. Exemplo de lista:
       - `https://garciabuilder.fitness`, `https://www.garciabuilder.fitness`
       - `https://garciabuilder.uk`, `https://www.garciabuilder.uk`
       - `https://garcia-builder.onrender.com`
    - Se usar outro domínio, adicione-o na lista `origin`/`CORS_ORIGINS`.

4) Pagamentos live
   - No Dashboard Stripe, pegue as chaves Live e salve no Render (Environment Variables).
   - Atualize URLs de sucesso/cancelamento e webhooks para o domínio primário (ex.: `https://www.garciabuilder.fitness/success.html`).
   - Faça um checkout real em `pricing.html` e confirme recebimento no Stripe.

---

## Opção 2: Frontend em Vercel/Netlify + Backend no Render

Mantém o backend seguro no Render e o frontend em CDN global.

1) Backend (Render)
   - Igual à Opção 1 (passos 1 e 4).

2) Frontend (Vercel ou Netlify)
   - Vercel: importe o repositório → framework “Other” (estático) → sem build → output `/`.
   - Netlify: arraste e solte ou conecte Git → Publish directory `/`.

3) Domínio
   - Configure o domínio no provedor do frontend (Vercel/Netlify) — ambos emitem SSL.
   - Backend continua no domínio do Render (ex.: `https://garcia-builder.onrender.com`).
   - Garanta que o CORS do backend permite o domínio final do frontend.
   - Se optar por usar `garciabuilder.fitness`/`garciabuilder.uk` no frontend CDN, mantenha `api` apontando ao Render.

4) Configurar URLs do frontend
   - Se houver código que chama o backend, aponte para a URL do Render (ex.: `https://garcia-builder.onrender.com`).

---

## Opção 3: Frontend no GitHub Pages + Backend no Render

Mais econômico, porém sem server-side no Pages.

1) Pages
   - Ative GitHub Pages no repositório (Branch `main`, pasta `/`).
   - Coloque o arquivo `CNAME` com o domínio (opcional) se for usar domínio próprio no Pages.

2) Backend no Render
   - Igual à Opção 1 (passos 1 e 4).

3) DNS
   - Aponte `www` para Pages e crie subdomínio `api.garciabuilder.fitness`/`api.garciabuilder.uk` apontando para o Render.
   - Garanta CORS para `https://garciabuilder.fitness`, `https://www.garciabuilder.fitness`, `https://garciabuilder.uk`, `https://www.garciabuilder.uk` no backend.

---

## Domínio e DNS (resumo prático)

- Compre o domínio (Namecheap/GoDaddy/Cloudflare Registrar).
- Decida onde vai hospedar (Render, Vercel/Netlify + Render, Pages + Render).
- Crie registros:
      - `A`/`AAAA` para raiz (apex) quando exigido pelo host (Render indica os IPs).
      - `CNAME` para `www` apontando ao host `.onrender.com`.
      - Para API dedicada: `api.garciabuilder.fitness`/`api.garciabuilder.uk` como `CNAME` para o host do backend.
- Ative/espere SSL (automático na maioria). Sempre use HTTPS nas URLs.

---

## SEO e visibilidade (rápido e direto)

1) Sitemap e robots
   - Gere o sitemap automaticamente: `npm run sitemap` (defina `SITE_URL` antes).
   - `robots.txt` já preparado com linha `Sitemap: https://www.garciabuilder.fitness/sitemap.xml` — ajuste para o primário real.

2) Search Console e Bing
   - Google Search Console: verifique o domínio (DNS) e envie o sitemap.
   - Bing Webmaster Tools: repita o processo.

3) Titles, meta e Open Graph
   - Garanta títulos únicos por página, meta description clara e tags OG/Twitter para social.
   - Opcional: adicionar JSON-LD (Organization/Website/Breadcrumbs) na `index.html`.

4) Performance e Core Web Vitals
   - Comprima imagens (WebP), lazy-load onde possível.
   - Lighthouse (Chrome) e PageSpeed Insights para diagnóstico.

5) Analytics e Pixels
   - Instale GA4 (Google Analytics) e opcionalmente Meta Pixel/LinkedIn Insight.

6) Conteúdo e confiança
   - Depoimentos, antes/depois, perguntas frequentes (já existem páginas).
   - Políticas (privacidade/termos) e informações de contato claras.

7) Anúncios e canais
   - Google Ads com palavras-chave long-tail + correspondência de intenção (ex.: “personal trainer online Londres”).
   - Instagram/TikTok com CTAs para `pricing.html`.
   - Campanhas de e-mail (lista de newsletter).

---

## Checklist de publicação

- [ ] Chaves STRIPE (Live) configuradas no host.
- [ ] CORS liberado para: `https://garciabuilder.fitness`, `https://www.garciabuilder.fitness`, `https://garciabuilder.uk`, `https://www.garciabuilder.uk`, `https://garcia-builder.onrender.com`.
- [ ] Supabase → Auth → `Site URL` (primário) e `Additional Redirect URLs` (todos os domínios + `.onrender.com`).
- [ ] Stripe → success/cancel/webhooks usando domínio primário.
- [ ] `SITE_URL` definido e `npm run sitemap` executado (commit o `sitemap.xml`).
- [ ] `robots.txt` aponta para o sitemap do domínio primário.
- [ ] Search Console e Bing verificados + sitemap enviado.
- [ ] Teste de checkout real concluído e confirmado no Stripe.
- [ ] Páginas principais revisadas (title/description/OG/Links).

### Stripe (Live)

- Set STRIPE_SECRET_KEY (live) and STRIPE_PUBLISHABLE_KEY (live)
- Configure webhook endpoint to [https://garciabuilder.fitness/api/stripe-webhook](https://garciabuilder.fitness/api/stripe-webhook) and add events
- Add STRIPE_WEBHOOK_SECRET from Stripe to Render and redeploy
- In Stripe Dashboard → Settings → Public details, set your Terms of Service URL and Privacy Policy URL:
   - Terms of Service: <https://garciabuilder.fitness/terms.html>
   - Privacy Policy: <https://garciabuilder.fitness/privacy.html>
   This is required to enable consent collection during Checkout and avoid 400 errors.

---

## Problemas comuns

- CORS bloqueando requests do frontend → adicionar domínio na lista `origin` do backend.
- SSL pendente → aguarde emissão (pode levar alguns minutos após DNS).
- Sitemap com URLs antigas (GitHub Pages) → gere novamente e faça deploy.
- Checkout em modo test → confirme que as chaves Live foram salvas no host.

---

Dúvidas? Ver também `docs/SEO-QUICK-WINS.md` para ações rápidas de visibilidade.
