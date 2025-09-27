# Garcia Builder — Online Coaching Website

Professional static website for **Andre Garcia (Garcia Builder)** — multilingual online fitness coaching in **EN/PT/ES** — focused on conversion, professional design, and performance. Deployed on **GitHub Pages**.

> 🔗 **Live Website:** https://andrejulio072.github.io/Garcia-Builder/
> 💬 **WhatsApp:** https://wa.me/447508497586
> 📅 **Book Consultation:** https://calendly.com/andrenjulio072/consultation
> 📸 **Instagram:** https://instagram.com/garcia.builder
> 🏋️ **Trainerize:** https://www.trainerize.me/profile/garciabuilder/AndreJulio.Garcia/

---

## ✨ Project Highlights

- **Multilingual Support** (EN/PT/ES) with complete internationalization system
- **Professional Design** with charcoal + gold (`#F6C84E`) brand colors and glass effects
- **18 Client Testimonials** with 5-star ratings and detailed success stories
- **Hero Section** with fitness imagery, overlay gradients, and compelling CTAs
- **3D Tilt Cards** using VanillaTilt for interactive value propositions
- **Transformation Gallery** with before/after images and lightbox functionality
- **5-Tier Pricing Plans** starting from £75 with clear value propositions
- **FAQ Section** with instant search and 25+ essential questions
- **Contact Integration** via Formspree, WhatsApp, Calendly, Instagram, and Trainerize
- **SEO Optimized** with sitemap, robots.txt, and performance optimizations

---

## 🧱 Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Bootstrap 5 + Custom CSS with glass effects
- **Effects**: VanillaTilt for 3D card interactions
- **Hosting**: GitHub Pages (automatic deployment)
- **Forms**: Formspree integration for contact submissions
- **Images**: Optimized with lazy loading and WebP support

---

## 📁 Project Structure

```
Garcia-Builder/
├── index.html                    # Homepage with hero, KPIs, features
├── about.html                    # About Andre, methodology, gallery
├── pricing.html                  # 5-tier pricing plans (£75-£250)
├── faq.html                      # FAQ with search functionality
├── transformations.html          # Client transformation gallery
├── testimonials.html            # 18 client testimonials with ratings
├── contact.html                 # Contact form + external links
├── programs.html                # Programs overview page
├── robots.txt                   # SEO crawler instructions
├── sitemap.xml                  # Site structure for search engines
├── logo.png                     # Brand logo
├── assets/                      # Images and translations
│   ├── i18n.js                  # Translation dictionaries (EN/PT/ES)
│   ├── logo.png                 # Main brand logo
│   ├── hero-fitness.jpg         # Hero section background
│   ├── about1.jpg - about11.jpg # About page gallery images
│   ├── t1.png - t8.webp        # Transformation before/after images
│   └── [various images]         # Additional assets
├── css/                         # Stylesheets
│   ├── global.css              # Main stylesheet with brand colors
│   └── global-optimizations.css # Performance optimizations
├── js/                          # JavaScript modules
│   ├── app.js                  # Main application logic
│   ├── i18n-shim.js           # Internationalization handler
│   ├── lightbox.js            # Image lightbox functionality
│   ├── pricing.js             # Dynamic pricing rendering
│   ├── kpi6.inject.js         # KPI cards injection
│   ├── credibility.inject.js  # Credibility cards injection
│   └── app-optimizations.js   # Performance enhancements
└── tools/                      # Development utilities
    └── patch_project.py        # HTML optimization script
```

---

## 🚀 Getting Started

### Local Development
```bash
# Clone the repository
git clone https://github.com/yourusername/Garcia-Builder.git
cd Garcia-Builder

# Serve locally (Python)
python -m http.server 5173

# Or use any static server
# Open http://localhost:5173
```

### GitHub Pages Deployment
1. Push changes to **main** branch
2. Go to **Settings → Pages**
3. Select **Deploy from branch: main / root**
4. Access at: `https://yourusername.github.io/Garcia-Builder/`

---

## 🌐 Internationalization System

Complete multilingual support with 3 languages:

### Supported Languages
- **English (EN)**: Default language, complete translations
- **Portuguese (PT)**: Full Brazilian Portuguese translations
- **Spanish (ES)**: Complete Spanish translations

### Implementation
- **Translation File**: [`assets/i18n.js`](assets/i18n.js) contains all text content
- **HTML Attributes**: `data-i18n="key"` for text, `data-i18n-ph="key"` for placeholders
- **Language Switcher**: Dropdown in navigation saves preference to localStorage
- **Dynamic Loading**: JavaScript applies translations on page load and language change

### Translation Structure
```javascript
const I18N = {
  en: {
    nav: { home: "Home", about: "About", ... },
    testimonials: { t1: "Client feedback...", ... },
    // ... all sections
  },
  pt: { /* Portuguese translations */ },
  es: { /* Spanish translations */ }
};
```

---

## 💬 Client Testimonials

**18 authentic testimonials** with detailed success stories:

### Featured Clients
- **Eduarda Ribeiro**: "Andre gave me structure, habits I could actually follow..."
- **Conrad Norman**: "As a busy dad I didn't think I had time. Andre simplified training..."
- **Mariana Vieira**: "Twelve weeks later my friends keep asking what I changed..."
- **Carlos Alberto Romano**: "Down 9 kg and sleeping better than ever..."
- **Ana Paula Tannus**: "I kept my social life and still transformed..."

### Testimonial Features
- ⭐ **5-star ratings** for all clients
- 📸 **Profile avatars** (currently placeholder, ready for real photos)
- 📝 **150+ character detailed feedback** per testimonial
- 🌐 **Fully translated** in all three languages
- 📱 **Responsive grid layout** (3 columns → 1 on mobile)

---

## 💰 Pricing Plans

**5 comprehensive tiers** designed for different client needs:

### Plan Structure
- **Starter Plan**: £75/month - Basic coaching essentials
- **Standard Plan**: £125/month - Most popular choice
- **Premium Plan**: £175/month - Advanced support
- **Elite Plan**: £225/month - VIP treatment
- **Transformation Plan**: £250/month - Complete transformation package

### Features
- 📊 **Clear value propositions** for each tier
- 🎯 **Highlighted "Most Popular"** plan
- 💳 **Ready for Stripe integration** (checkout URLs configurable)
- 🌐 **Fully translatable** pricing descriptions

---

## 🎨 Design System

### Brand Colors
- **Primary**: Charcoal dark backgrounds
- **Accent**: Gold `#F6C84E` for CTAs and highlights
- **Text**: High contrast whites and cool grays
- **Effects**: Glass blur effects with subtle transparency

### Typography
- **Font Family**: Inter (400, 600, 700, 800, 900 weights)
- **Headers**: Gradient text with glow effects using `.title-gradient .text-glow`
- **Body Text**: High contrast for excellent readability

### Components
- **Cards**: 22px border radius, consistent drop shadows
- **Buttons**: Gold primary, outlined secondary styles
- **Grid**: Responsive 3-column layout, mobile-first approach
- **3D Effects**: VanillaTilt integration for interactive cards

---

## 🔧 Key Features

### Hero Section
- **Background**: Fitness imagery with overlay for text contrast
- **CTA**: Prominent "Book Free Consultation" button
- **Navigation**: Sticky navbar with language switcher

### About Page
- **Story**: Comprehensive background about Andre Garcia
- **Methodology**: "Assess → Build → Execute" framework
- **Gallery**: 11 images with lightbox functionality
- **Credentials**: Dynamic injection of qualifications

### Transformations
- **Before/After**: Client transformation images
- **Lightbox**: Click to view full-size images
- **Grid Layout**: Consistent aspect ratios

### FAQ System
- ⚡ **Instant Search**: Filter questions as you type
- 📋 **25+ Questions**: Covering all common client concerns
- 🔽 **Accordion**: Expandable answers
- 🌐 **Multilingual**: All content translated

### Contact Integration
- 📧 **Formspree**: Contact form submissions
- 💬 **WhatsApp Float**: Persistent chat button
- 📅 **Calendly**: Direct booking integration
- 📸 **Instagram**: Social media link
- 🏋️ **Trainerize**: Training platform integration

---

## 📈 Performance Optimizations

### Loading Performance
- ⚡ **Lazy Loading**: Images load as needed
- 🚀 **Deferred Scripts**: Non-critical JS loads after page render
- 🔤 **Font Preloading**: Google Fonts optimized loading
- 📱 **Mobile Optimized**: Fast loading on mobile networks

### SEO Features
- 🗺️ **Sitemap**: Complete site structure in `sitemap.xml`
- 🤖 **Robots.txt**: Search engine crawler instructions
- 🏷️ **Meta Tags**: Optimized for each page
- 📊 **Structured Data**: Ready for rich snippets

---

## 🛠️ Development Tools

### Optimization Script
Use `tools/patch_project.py` to optimize HTML files:

```bash
python tools/patch_project.py /path/to/Garcia-Builder
```

**Optimizations Applied:**
- Adds viewport meta tags
- Injects Google Fonts preconnects
- Adds `defer` to script tags
- Optimizes images with `loading="lazy"`
- Creates backups before modifications

### Dynamic Components
- **KPI Injection**: [`js/kpi6.inject.js`](js/kpi6.inject.js) creates performance metrics
- **Credibility Cards**: [`js/credibility.inject.js`](js/credibility.inject.js) shows qualifications
- **Pricing Grid**: [`js/pricing.js`](js/pricing.js) renders pricing plans dynamically

---

## 🔗 External Integrations

### Direct Links
- 🌐 **Website**: https://andrejulio072.github.io/Garcia-Builder/
- 💬 **WhatsApp**: https://wa.me/447508497586
- 📅 **Calendly**: https://calendly.com/andrenjulio072/consultation
- 📸 **Instagram**: https://instagram.com/garcia.builder
- 🏋️ **Trainerize**: https://www.trainerize.me/profile/garciabuilder/AndreJulio.Garcia/

### Ready for Integration
- 💳 **Stripe Checkout**: Configure payment URLs in pricing CTAs
- 📊 **Analytics**: Ready for GA4 or Plausible integration
- 📧 **Email Marketing**: Contact form exports to your email system

---

## 📱 Mobile & Accessibility

### Mobile Optimization
- 📱 **Responsive Design**: Works perfectly on all device sizes
- 👆 **Touch-Friendly**: Optimized button sizes and interactions
- ⚡ **Fast Loading**: Optimized images and deferred scripts
- 🔄 **Consistent Layout**: No horizontal scrolling issues

### Accessibility Features
- ⌨️ **Keyboard Navigation**: Full keyboard support
- 🔍 **High Contrast**: Excellent readability ratios
- 🗣️ **Screen Readers**: Semantic HTML structure
- 🎯 **Focus States**: Clear visual focus indicators

---

## 🚀 Future Roadmap

- [ ] **Stripe Integration**: Complete payment processing for pricing plans
- [ ] **Professional Photos**: Replace placeholder avatars with client photos
- [ ] **Analytics Dashboard**: Track visitor behavior and conversions
- [ ] **Blog Section**: Content marketing for SEO
- [ ] **Client Portal**: Member area for existing clients
- [ ] **Advanced Animations**: GSAP/ScrollTrigger for enhanced UX
- [ ] **A/B Testing**: Optimize conversion rates

---

## 🆘 Support & Issues

### Common Solutions
1. **Language not switching**: Check browser console for JavaScript errors
2. **Images not loading**: Verify file paths in `assets/` folder
3. **Form not submitting**: Ensure Formspree endpoint is configured
4. **Mobile layout issues**: Check viewport meta tag

### Getting Help
- 🐛 **GitHub Issues**: Report bugs or request features
- 💬 **WhatsApp**: Direct contact with Andre Garcia
- 📅 **Calendly**: Book technical consultation
- 📸 **Instagram**: Follow for updates

---

## 👤 About the Coach

**Andre Garcia (Garcia Builder)**
*Certified Online Fitness Coach*

Specializing in sustainable transformations through evidence-based training and flexible nutrition. Fluent in English, Portuguese, and Spanish, serving clients worldwide with personalized coaching approaches.

### Contact Andre
- **Website**: https://andrejulio072.github.io/Garcia-Builder/
- **WhatsApp**: https://wa.me/447508497586
- **Instagram**: https://instagram.com/garcia.builder
- **Book Consultation**: https://calendly.com/andrenjulio072/consultation

---

## 📄 License

This project is proprietary to Garcia Builder. All rights reserved.

For licensing inquiries or usage permissions, contact Andre Garcia via the links above.

---

*Last updated: January 2025 • Built with ❤️ for fitness transformations*
