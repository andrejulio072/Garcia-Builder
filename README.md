
# Garcia Builder — Online Coaching Website

Site estático premium para o **Andre Garcia (Garcia Builder)** — coaching online em **EN/PT/ES** — com foco em conversão, visual profissional e performance. Publicado em **GitHub Pages**.

> 🔗 **Website (Live):** https://andrejulio072.github.io/Garcia-Builder/  
> 💬 **WhatsApp:** https://wa.me/447508497586  
> 📅 **Calendly (consulta):** https://calendly.com/andrenjulio072/consultation  
> 📸 **Instagram:** https://instagram.com/garcia.builder  
> 🏋️ **Trainerize:** https://www.trainerize.me/profile/garciabuilder/AndreJulio.Garcia/

---

## ✨ Destaques do projeto
- **Design System** alinhado ao logo (carvão + dourado `#F6C84E` + cinzas frios), com **glass/blur** e microinterações.
- **Hero** com imagem fitness, **overlay** e títulos com *title‑gradient* + *text‑glow* (legibilidade top).
- **Cards 3×3** com **3D tilt** (VanillaTilt + glare) para seções de valor e *About*.
- **About** com **texto longo (~500+ caracteres)** contando a história, método *Assess → Build → Execute* e **galeria com lightbox**.
- **Transformations** em grade consistente (aspect‑ratio fixo) + lightbox.
- **Testimonials** (18 itens) com nomes, avatares, e copy emotiva (≥150 caracteres).
- **Pricing** vendedor (4 planos, mínimo £80) com CTAs claros.
- **FAQ** com **busca instantânea** + accordion (10 perguntas essenciais).
- **Contato** com formulário (Formspree), **WhatsApp flutuante**, links para **Instagram**, **Calendly** e **Trainerize**.
- **i18n** (EN/PT/ES) via `assets/i18n.js` com `data-i18n` e `data-i18n-ph` nos HTMLs.
- **SEO básico**: `robots.txt` e `sitemap.xml` prontos para indexação.

---

## 🧱 Stack & libs
- **HTML5, CSS3, JavaScript (vanilla)** — sem build step.
- **Bootstrap 5** (grid/utilities) + **VanillaTilt** (efeito 3D).
- **GitHub Pages** para deploy contínuo (branch `main`).

---

## 📁 Estrutura
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

## 🚀 Como rodar / publicar

### Local (sem terminal)
1. Clone com **GitHub Desktop**.
2. Abra `index.html` no navegador.

### Local (com terminal, opcional)
```bash
git clone https://github.com/<seu-usuario>/Garcia-Builder.git
cd Garcia-Builder
python -m http.server 5173
# abra http://localhost:5173
```

### Deploy (GitHub Pages)
1. Commit & push na **main**.
2. **Settings → Pages** → *Deploy from a branch* → `main` / *root*.
3. Acesse: `https://<seu-usuario>.github.io/Garcia-Builder/`.

> `sitemap.xml` e `robots.txt` já estão no projeto.  
> Para refinar SEO, personalize `<title>` e meta‑tags em cada página.

---

## 🔧 Personalização rápida

### Textos e traduções
- Edite `assets/i18n.js`.  
- Use `data-i18n="chave"` para textos e `data-i18n-ph="chave"` para placeholders.  
- Para outro idioma (ex.: `it`), replique as chaves com as traduções.

### Imagens
- Substitua arquivos em `assets/` mantendo os nomes (ou ajuste as URLs).  
- O **hero** usa `assets/hero-fitness.jpg` com overlay (garante contraste).

### Pricing
- Edite os cards em `pricing.html` (nomes, bullets, preço, CTAs).  
- **Stripe (opcional):** ao criar *Products/Prices*, use **Stripe Checkout** e cole as URLs nos botões.

### Testimonials
- Ficam em `testimonials.html`.  
- Avatares são do `https://i.pravatar.cc/128?img=ID`. Troque por fotos reais quando quiser.

### FAQ
- Array de perguntas/respostas está embutido em `faq.html`.  
- A busca filtra os itens conforme você digita.

### Contato
- Formulário envia via **Formspree**.  
  1) Crie um form em https://formspree.io  
  2) Copie o **endpoint** e substitua `YOUR_ENDPOINT` em `contact.html`.  
- **WhatsApp flutuante** aponta para `+44 7508497586` (edite no rodapé se mudar).  
- **Calendly**, **Instagram** e **Trainerize** já estão linkados.

---

## 🧑‍💻 Qualidade: UX, A11y e Performance
- **Legibilidade**: contraste alto (escuro + dourado), tamanhos grandes e espaçamento consistente.
- **Acessibilidade**: navegação por teclado nas seções, estados :focus visíveis, textos sem jargão.  
- **Performance**: código enxuto, sem frameworks pesados; imagens otimizáveis (troque por WebP quando possível).
- **Consistência visual**: cards com raio 22px, bordas `var(--line)`, sombras profundas e efeitos sutis.

---

## 🔌 Integrações & links oficiais
- 🌐 **Website:** https://andrejulio072.github.io/Garcia-Builder/  
- 💬 **WhatsApp:** https://wa.me/447508497586  
- 📅 **Calendly:** https://calendly.com/andrenjulio072/consultation  
- 📸 **Instagram:** https://instagram.com/garcia.builder  
- 🏋️ **Trainerize:** https://www.trainerize.me/profile/garciabuilder/AndreJulio.Garcia/  
- 💳 **Stripe:** pendente (Checkout/Elements a definir).

---

## 🔒 Privacidade & direitos
- Utilize apenas imagens com direito de uso (ou autorais).  
- Se optar por licenciamento aberto, adicione `LICENSE` (ex.: MIT). Caso contrário, mantenha **Todos os direitos reservados**.

---

## 🗺️ Roadmap (sugestões)
- Stripe Checkout (botões dos planos).
- Galeria pro About com fotos profissionais (quando disponíveis).
- Análises: GA4/Plausible e event tracking de CTA.
- Tema alternável (dark/gold) com CSS variables.
- Microinterações adicionais (GSAP/ScrollTrigger).

---

## 👤 Créditos & Contato
**Andre Garcia (Garcia Builder)** — Coach & Owner  
**Site:** https://andrejulio072.github.io/Garcia-Builder/  
**WhatsApp:** https://wa.me/447508497586 | **Instagram:** https://instagram.com/garcia.builder | **Calendly:** https://calendly.com/andrenjulio072/consultation

Se tiver qualquer dúvida, abra uma **Issue** ou entre em contato pelos links acima.
