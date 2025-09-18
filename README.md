
# Garcia Builder — Online Coaching Website

Site estático premium para o **Andre Garcia (Garcia Builder)** — coaching online em EN/PT/ES — com foco em conversão, design escuro/dourado e alta legibilidade. Publicado via **GitHub Pages**.

> **Live (GitHub Pages):** `https://andrejulio072.github.io/Garcia-Builder/`  
> **Contato rápido (WhatsApp):** `+44 7508497586`

---

## ✨ Principais recursos
- **Design System** alinhado ao logo (preto carvão + dourado `#F6C84E` + cinzas frios), vidro/blur e microinterações.
- **Hero** com imagem fitness, overlay e títulos com *title‑gradient* + *text‑glow*.
- **Cards 3×3 com 3D tilt** (VanillaTilt) para “Why Garcia Builder” e seções do About.
- **About** com texto longo (500+ caracteres), método *Assess → Build → Execute* e **galeria com lightbox**.
- **Transformations** em grade com lightbox.
- **Testimonials** (18 itens) com nomes e avatares, copy emotiva (≥150 caracteres).
- **Pricing** vendedor (4 planos) — CTAs claros.
- **FAQ** com **busca instantânea** + accordion (10 perguntas essenciais).
- **Contato** com formulário (Formspree), **WhatsApp flutuante**, links para **Instagram**, **Trainerize** e **Calendly**.
- **i18n** simples (EN/PT/ES) via `assets/i18n.js` com `data-i18n` e `data-i18n-ph`.
- **SEO básico**: `robots.txt` e `sitemap.xml` prontos.

---

## 🧱 Tech stack
- HTML5, CSS3, JavaScript (vanilla)
- [Bootstrap 5](https://getbootstrap.com) (grid/utilitários), [VanillaTilt](https://micku7zu.github.io/vanilla-tilt.js/)
- GitHub Pages (deploy)

---

## 📁 Estrutura do projeto
```
Garcia-Builder/
├─ index.html
├─ about.html
├─ pricing.html
├─ faq.html
├─ transformations.html
├─ testimonials.html
├─ contact.html
├─ robots.txt
├─ sitemap.xml
├─ assets/
│  ├─ logo.png
│  ├─ hero-fitness.jpg
│  ├─ about1.jpg  about2.jpg  about3.jpg  about4.jpg
│  ├─ t1.jpg  t2.png  t3.png  t4.png  t5.png  t6.jpg  t7.webp  t8.webp
│  └─ i18n.js
├─ css/
│  └─ global.css
└─ js/
   └─ app.js
```

---

## 🚀 Como rodar localmente
**Sem terminal (GitHub Desktop):**
1. Clone o repositório.
2. Abra `index.html` no navegador para visualizar.

**Com terminal (opcional):**
```bash
git clone https://github.com/<seu-usuario>/Garcia-Builder.git
cd Garcia-Builder
python -m http.server 5173
# abra http://localhost:5173
```

---

## 🛠️ Personalização rápida

### Textos e traduções (i18n)
- Edite `assets/i18n.js`.  
- Use os atributos `data-i18n="chave"` e `data-i18n-ph="chave"` nos HTMLs.
- Para adicionar um idioma, crie um novo objeto (ex.: `de`, `it`) com as mesmas chaves.

### Imagens
- Troque as imagens na pasta `assets/` mantendo os nomes (ou ajuste as URLs no HTML/CSS).
- **Hero** usa `assets/hero-fitness.jpg` com overlay para legibilidade.

### Pricing/planos
- Edite os cards em `pricing.html` (nomes, bullets, preço e CTA).  
- Quando tiver **Stripe**: substitua os links dos botões por URLs do *Stripe Checkout* (ou integre com *Elements*).

### Testimonials
- Edite a grade em `testimonials.html`.  
- Avatares usam `https://i.pravatar.cc/128?img=ID` (padrão). Substitua por fotos reais quando quiser.

### FAQ
- Perguntas/respostas ficam em um array JS dentro de `faq.html`.  
- A busca filtra os itens em tempo real.

### Contato
- O formulário envia via **Formspree**.  
  1. Crie um formulário em https://formspree.io  
  2. Copie o **endpoint** e substitua `YOUR_ENDPOINT` em `contact.html`.  
- **WhatsApp flutuante** já aponta para `+44 7508497586` (edite no rodapé, se necessário).  
- Links de **Instagram**, **Calendly** e **Trainerize** já estão configurados.

---

## 🌐 Deploy (GitHub Pages)
1. Faça *commit* e *push* para a branch `main`.
2. No repositório, vá em **Settings → Pages**.
3. Selecione **Deploy from a branch** e escolha `main` / **root**.
4. Acesse: `https://<seu-usuario>.github.io/Garcia-Builder/`.

> **Sitemap** (`/sitemap.xml`) e `robots.txt` já estão prontos.  
> Edite `<title>` e *meta tags* em cada página se quiser refinar SEO.

---

## 🔒 Privacidade & direitos
- Substitua imagens temporárias por fotos autorizadas/da sua autoria.
- Se desejar licenciamento aberto, adicione um `LICENSE` (ex.: MIT). Se não, mantenha **Todos os direitos reservados**.

---

## 🧩 Ideias futuras
- Stripe Checkout/Elements nos CTAs dos planos.
- Galeria/lighbox com fotos profissionais no About.
- Analytics (GA4/umami/plausible) e pixel de anúncios.
- Tema “Gold mode” alternável e microinterações GSAP.

---

## 👤 Créditos
- **Andre Garcia (Garcia Builder)** — Owner & Coach  
- Design/implementação do site focado em conversão e performance.

---

## ❓Suporte
Encontrou algum problema ou quer melhorar algo?  
Abra uma **Issue** ou me escreva no **WhatsApp**: `+44 7508497586`.
