# Confirmao de E-mail para Contato

Agora o sistema possui confirmao de e-mail para usurios que entram em contato pelo formulrio do site.

**Como usar:**
- Inclua o script `assets/js/contact-send.js` no seu formulrio de contato.
- O backend est em `api/contact.js`.
- A pgina de confirmao  `confirm-contact.html`.
- Veja instrues detalhadas em `docs/confirmacao-contato.md`.

**Exemplo de formulrio:**
```html
<form onsubmit="enviarContato(this); return false;">
  <input type="text" name="nome" placeholder="Seu nome" required>
  <input type="email" name="email" placeholder="Seu e-mail" required>
  <textarea name="mensagem" placeholder="Mensagem" required></textarea>
  <button type="submit">Enviar</button>
</form>
```

**Importante:**
- Configure o e-mail do remetente no backend antes de usar em produo.
- Tokens de confirmao so armazenados localmente (troque para banco em produo).
# Garcia Builder  Professional Online Coaching Platform

Complete multilingual fitness coaching platform for **Andre Garcia (Garcia Builder)**  featuring advanced user authentication, payment processing, newsletter management, and mobile-optimized lead capture. Built with modern web technologies and deployed on **GitHub Pages**.

>  **Live Website:** https://andrejulio072.github.io/Garcia-Builder/
>  **Contact Form:** https://www.garciabuilder.fitness/contact.html
>  **Book Consultation:** https://calendly.com/andrenjulio072/consultation
>  **Instagram:** https://instagram.com/garcia.builder
>  **Trainerize:** https://www.trainerize.me/profile/garciabuilder/AndreJulio.Garcia/

---

##  Production Domains

- Primary (recommended): [https://www.garciabuilder.fitness](https://www.garciabuilder.fitness)
- Alternate: [https://www.garciabuilder.uk](https://www.garciabuilder.uk)

DNS setup and go-live checklists:

- DNS + Render (Namecheap): [docs/DNS-NAMECHEAP.md](docs/DNS-NAMECHEAP.md)
- Full Go-Live guide: [docs/GO-LIVE.md](docs/GO-LIVE.md)

---

##  Project Highlights

###  **Frontend & UX**
- **Multilingual Support** (EN/PT/ES) with complete internationalization system
- **Professional Design** with charcoal + gold (`#F6C84E`) brand colors and glassmorphism effects
- **Mobile-First Responsive** design optimized for all devices
- **Exit Intent Popup** with intelligent triggers and session management
- **18 Client Testimonials** with 5-star ratings and detailed success stories
- **Transformation Gallery** with before/after images and lightbox functionality

###  **Authentication & User Management**
- **OAuth Integration** with Google and Facebook login
- **Supabase Authentication** with secure session management
- **User Dashboards** with personalized profiles and progress tracking
- **Admin Panel** for trainer management and user oversight
- **Auth Guards** protecting sensitive pages and content

###  **Payment & Business Logic**
- **Stripe Integration** with multiple payment methods
- **Payment Links** for quick checkout and course sales
- **5-Tier Pricing Plans** from 75 to 250 with clear value propositions
- **Currency Conversion** support for international clients
- **Discount System** with promotional codes

###  **Marketing & Lead Generation**
- **Newsletter System** with automated email sequences
- **Lead Capture Forms** with validation and database storage
- **Exit Intent Technology** to maximize conversion rates
- **Contact Integration** via Formspree, Calendly, and Instagram DMs
- **CRM Integration** with lead tracking and management

###  **Analytics & Performance**
- **SEO Optimized** with sitemap, robots.txt, and meta tags
- **Performance Monitoring** with Google Analytics integration
- **A/B Testing** capabilities for conversion optimization
- **Database Analytics** for user behavior tracking

---

##  Tech Stack

### **Frontend**
- **HTML5/CSS3/JavaScript** - Modern web standards
- **Bootstrap 5** - Responsive framework
- **VanillaTilt** - 3D card interactions
- **Custom CSS** - Glassmorphism and modern effects

### **Backend & Database**
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Real-time subscriptions** - Live data updates
- **Row Level Security** - Database security policies
- **Edge Functions** - Serverless API endpoints

### **Payment Processing**
- **Stripe** - Complete payment infrastructure
- **Webhook handling** - Secure payment verification
- **Multiple currencies** - International support
- **Subscription management** - Recurring payments

### **Authentication**
- **OAuth 2.0** - Google and Facebook integration
- **JWT tokens** - Secure session management
- **Password reset** - Email-based recovery
- **Multi-factor support** - Enhanced security

### **DevOps & Deployment**
- **GitHub Pages** - Static site hosting
- **GitHub Actions** - CI/CD pipeline
- **Environment variables** - Secure configuration
- **Version control** - Git workflow

---

##  Project Structure

```
Garcia-Builder/
  Core Pages
    index.html                 # Homepage with lead capture
    about.html                 # About Andre & methodology
    pricing.html               # Pricing plans & payment links
    programs.html              # Program descriptions
    testimonials.html          # Client success stories
    transformations.html       # Before/after gallery
    contact.html               # Contact form & links
    faq.html                   # FAQ with search

  Authentication Pages
    login.html                 # OAuth & email login
    reset-password.html        # Password recovery
    dashboard.html             # User dashboard
    my-profile.html            # Profile management
    admin-dashboard.html       # Admin panel
    admin-trainers.html        # Trainer management
    trainer-dashboard.html     # Trainer interface

  Business Pages
    stripe-oficial.html        # Stripe integration
    pricing-payment-links.html # Payment processing
    success.html               # Payment success
    become-trainer.html        # Trainer application
    certificacao-completa.html # Certification page
    profile-manager.html       # Profile editing

  Assets & Resources
    assets/
       i18n/                  # Translation files
       images/                # Optimized images
       logo.png               # Brand assets
       transformations/       # Client photos
    css/
       global.css             # Main styles
       newsletter.css         # Newsletter system
       auth.css               # Authentication UI
       dashboard.css          # Dashboard styles
       credibility.css        # Trust elements
    js/
        app.js                 # Main application
        auth.js                # Authentication logic
        newsletter-manager.js  # Lead capture system
        stripe-payments.js     # Payment processing
        supabase-config.js     # Database config
        [30+ specialized modules]

  Documentation
    docs/
       setup/                 # Setup guides
          OAUTH-SETUP-GUIDE.md
          SUPABASE-SETUP.md
          README-STRIPE.md
          NEWSLETTER-SETUP-GUIDE.md
       testing/               # Test files
           test-mobile-popup.html
           test-homepage-popup.html
           MOBILE-POPUP-TESTING.md
    archive/                   # Archived files
        docs-obsoletos/        # Old documentation
        testes-obsoletos/      # Legacy tests
        backups/               # File backups
        config-info/           # Configuration files

  Database & Configuration
    supabase-schema-update.sql # Database schema
    newsletter-database-schema.sql # Newsletter tables
    .env.example              # Environment template
    package.json              # Dependencies
    start-server.bat          # Local development

  Development Tools
     .github/                   # GitHub workflows
     .vscode/                   # VS Code settings
     tools/                     # Development scripts
     robots.txt                 # SEO configuration
     sitemap.xml                # Site structure
```

---

##  Getting Started

### Local Development
```bash
---

##  Quick Start

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/Garcia-Builder.git
cd Garcia-Builder

# Start local server (choose one method)
python -m http.server 8000         # Python 3
python2 -m SimpleHTTPServer 8000   # Python 2
npx serve .                        # Node.js
php -S localhost:8000              # PHP

# Open browser
# Visit: http://localhost:8000
```

### Environment Setup

1. **Create Environment File**
   ```bash
   cp .env.example .env
   ```

2. **Configure Variables**
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key

   # Stripe Configuration
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...

   # OAuth Keys
   GOOGLE_CLIENT_ID=your_google_client_id
   FACEBOOK_APP_ID=your_facebook_app_id

   # API Keys
   FORMSPREE_ENDPOINT=https://formspree.io/f/your_form_id
   ```

### GitHub Pages Deployment
1. Push changes to **main** branch
2. Go to **Settings  Pages**
3. Select **Deploy from branch: main / root**
4. Access at: `https://yourusername.github.io/Garcia-Builder/`

---

##  Authentication System

### OAuth Integration
- **Google OAuth**: Complete setup with consent screens
- **Facebook Login**: App-based authentication
- **Session Management**: Secure JWT token handling
- **Protected Routes**: Dashboard and admin access control

### User Roles & Permissions
- **Client**: Access to personal dashboard and programs
- **Trainer**: Manage clients and programs
- **Admin**: Full system access and user management

### Setup Guides
-  [OAuth Setup Guide](docs/setup/OAUTH-SETUP-GUIDE.md)
-  [Authentication Quick Start](GUIA-RAPIDO-AUTH.md)

---

##  Payment Integration

### Stripe Configuration
- **Payment Links**: Direct checkout for programs
- **Subscription Management**: Recurring payments
- **Webhook Handling**: Secure payment verification
- **Multiple Currencies**: International support

### Pricing Structure
- **5-Tier System**: 75 to 250 monthly plans
- **Payment Options**: One-time and subscription
- **Discount Codes**: Promotional pricing support

### Setup Documentation
-  [Stripe Setup Guide](docs/setup/README-STRIPE.md)
-  [Payment Links Guide](GUIA-PAYMENT-LINKS.md)

---

##  Newsletter & Lead Capture

### Exit Intent System
- **Mobile Optimized**: Touch-friendly popup triggers
- **Session Control**: Smart display logic
- **Analytics Integration**: Conversion tracking
- **A/B Testing**: Multiple popup variants

### Features
-  **Exit Intent Detection**: Captures leaving users
-  **Mobile Triggers**: Scroll and interaction based
-  **Session Management**: Prevents popup spam
-  **Lead Tracking**: Supabase integration
-  **Multilingual**: Full i18n support

### Implementation Files
- **JavaScript**: `js/newsletter-manager.js`
- **Styling**: `css/newsletter.css`
- **Database**: `newsletter-database-schema.sql`

---

##  Internationalization (i18n)

### Language Support
- **English (EN)**: Default language
- **Portuguese (PT)**: Complete Brazilian Portuguese
- **Spanish (ES)**: Full Spanish translations

### Technical Implementation
```javascript
// Translation structure
const I18N = {
  en: {
    nav: { home: "Home", about: "About" },
    hero: { title: "Transform Your Body", subtitle: "..." }
  },
  pt: { /* Portuguese translations */ },
  es: { /* Spanish translations */ }
};

// Usage in HTML
<h1 data-i18n="hero.title">Transform Your Body</h1>
<input data-i18n-ph="contact.email" placeholder="Your email">
```

### Translation Features
-  **Complete Coverage**: All UI text translated
-  **Persistent Selection**: Language choice saved to localStorage
-  **Dynamic Switching**: No page reload required
-  **Form Support**: Placeholders and validation messages

---

##  Analytics & Tracking

### Conversion Tracking
- **Newsletter Signups**: Lead capture analytics
- **Button Clicks**: CTA performance tracking
- **Page Views**: User journey analysis
- **Payment Success**: Revenue tracking

### Performance Monitoring
- **Load Times**: Page speed optimization
- **Mobile Experience**: Touch interaction tracking
- **Error Monitoring**: JavaScript error reporting

---

##  Development & Testing

### Test Files & Validation
```
docs/testing/
 test-mobile-popup.html      # Mobile popup testing
 test-homepage-popup.html    # Homepage integration test
 test-newsletter.html        # Newsletter system test
 test-payment-flow.html      # Payment integration test
 MOBILE-POPUP-TESTING.md    # Testing documentation
```

### Quality Assurance
- **Mobile Testing**: Cross-device compatibility
- **Payment Testing**: Stripe test mode validation
- **Authentication Testing**: OAuth flow verification
- **Performance Testing**: Load time optimization

### Development Tools
- **Local Server**: Multiple options for development
- **Environment Variables**: Secure configuration management
- **Database Scripts**: Schema updates and migrations
- **Optimization Tools**: Image compression and code minification

---

##  Deployment & Production

### Production Configuration
- **Environment**: GitHub Pages static hosting
- **CDN**: Optimized asset delivery
- **SSL**: Automatic HTTPS certificates
- **Performance**: Optimized for speed and SEO

### Monitoring & Maintenance
- **Uptime Monitoring**: Site availability tracking
- **Performance Metrics**: Speed and conversion monitoring
- **Security Updates**: Regular dependency updates
- **Backup Strategy**: Code and database backups

---

##  Prximos Passos para Vender de Verdade

- Guia de publicao com domnio real e Render/Vercel/Netlify: `docs/GO-LIVE.md`
- Aes rpidas de SEO para aparecer no Google: `docs/SEO-QUICK-WINS.md`
- Gerar sitemap com seu domnio:

```powershell
$env:SITE_URL="https://www.garciabuilder.fitness"; npm run sitemap
```

Depois faa commit do `sitemap.xml` e envie no Google Search Console.

##  Documentation & Support

### Setup Guides
-  [Supabase Setup](docs/setup/SUPABASE-SETUP.md)
-  [OAuth Configuration](docs/setup/OAUTH-SETUP-GUIDE.md)
-  [Stripe Integration](docs/setup/README-STRIPE.md)
-  [Newsletter System](docs/setup/NEWSLETTER-SETUP-GUIDE.md)

### Testing Documentation
-  [Mobile Testing Guide](docs/testing/MOBILE-POPUP-TESTING.md)
-  [Test File Documentation](docs/testing/)

### Project History
-  [Implementation Timeline](IMPLEMENTACAO-COMPLETA.md)
-  [Feature Completion](MELHORIAS-COMPLETAS.md)
-  [Project Updates](DASHBOARD-MELHORADO.md)

---

##  Contributing

### Development Workflow
1. **Fork** the repository
2. **Create feature branch**: `git checkout -b feature-name`
3. **Make changes** following code style guidelines
4. **Test thoroughly** on all supported devices
5. **Submit pull request** with detailed description

### Code Standards
- **HTML**: Semantic markup and accessibility
- **CSS**: Mobile-first responsive design
- **JavaScript**: Modern ES6+ syntax
- **Documentation**: Clear comments and README updates

---

##  License & Contact

### Project Information
- **Version**: 2.0 (Complete Platform)
- **Status**: Production Ready
- **Last Updated**: December 2024
- **Maintainer**: Andre Garcia (Garcia Builder)

### Contact & Support
-  **Email**: andre@garciabuilder.fitness
-  **Book Consultation**: https://calendly.com/andrenjulio072/consultation
-  **Instagram**: https://instagram.com/garcia.builder
-  **Trainerize**: https://www.trainerize.me/profile/garciabuilder/AndreJulio.Garcia/
-  **Contact Form**: https://www.garciabuilder.fitness/contact.html

### Business Information
- **Services**: Online Fitness Coaching
- **Specialization**: Body Transformation & Strength Training
- **Languages**: English, Portuguese, Spanish
- **Location**: UK-based, International Clients

---

##  Client Success Stories

> *"Andre gave me structure, habits I could actually follow, and most importantly - results that last."*
> ** Eduarda Ribeiro** 

> *"As a busy dad I didn't think I had time. Andre simplified training and nutrition into something I could manage."*
> ** Conrad Norman** 

> *"Twelve weeks later my friends keep asking what I changed. It wasn't just my body - my whole mindset shifted."*
> ** Mariana Vieira** 

**18 verified testimonials** with detailed transformation stories available on the live website.

---

**Ready to transform your body?** 
 [**Book Your Free Consultation**](https://calendly.com/andrenjulio072/consultation) 

### Dynamic Components
- **KPI Injection**: [`js/kpi6.inject.js`](js/kpi6.inject.js) creates performance metrics
- **Credibility Cards**: [`js/credibility.inject.js`](js/credibility.inject.js) shows qualifications
- **Pricing Grid**: [`js/pricing.js`](js/pricing.js) renders pricing plans dynamically

---

##  External Integrations

### Direct Links
-  **Website**: https://andrejulio072.github.io/Garcia-Builder/
-  **Calendly**: https://calendly.com/andrenjulio072/consultation
-  **Instagram**: https://instagram.com/garcia.builder
-  **Contact Form**: https://www.garciabuilder.fitness/contact.html
-  **Trainerize**: https://www.trainerize.me/profile/garciabuilder/AndreJulio.Garcia/

### Ready for Integration
-  **Stripe Checkout**: Configure payment URLs in pricing CTAs
-  **Analytics**: Ready for GA4 or Plausible integration
-  **Email Marketing**: Contact form exports to your email system

---

##  Mobile & Accessibility

### Mobile Optimization
-  **Responsive Design**: Works perfectly on all device sizes
-  **Touch-Friendly**: Optimized button sizes and interactions
-  **Fast Loading**: Optimized images and deferred scripts
-  **Consistent Layout**: No horizontal scrolling issues

### Accessibility Features
-  **Keyboard Navigation**: Full keyboard support
-  **High Contrast**: Excellent readability ratios
-  **Screen Readers**: Semantic HTML structure
-  **Focus States**: Clear visual focus indicators

---

##  Future Roadmap

- [ ] **Stripe Integration**: Complete payment processing for pricing plans
- [ ] **Professional Photos**: Replace placeholder avatars with client photos
- [ ] **Analytics Dashboard**: Track visitor behavior and conversions
- [ ] **Blog Section**: Content marketing for SEO
- [ ] **Client Portal**: Member area for existing clients
- [ ] **Advanced Animations**: GSAP/ScrollTrigger for enhanced UX
- [ ] **A/B Testing**: Optimize conversion rates

---

##  Support & Issues

### Common Solutions
1. **Language not switching**: Check browser console for JavaScript errors
2. **Images not loading**: Verify file paths in `assets/` folder
3. **Form not submitting**: Ensure Formspree endpoint is configured
4. **Mobile layout issues**: Check viewport meta tag

### Getting Help
-  **GitHub Issues**: Report bugs or request features
-  **Contact Form**: Send a message via https://www.garciabuilder.fitness/contact.html
-  **Calendly**: Book technical consultation
-  **Instagram**: Follow for updates

---

##  About the Coach

**Andre Garcia (Garcia Builder)**
*Certified Online Fitness Coach*

Specializing in sustainable transformations through evidence-based training and flexible nutrition. Fluent in English, Portuguese, and Spanish, serving clients worldwide with personalized coaching approaches.

### Contact Andre
- **Website**: https://andrejulio072.github.io/Garcia-Builder/
- **Email**: andre@garciabuilder.fitness
- **Instagram**: https://instagram.com/garcia.builder
- **Book Consultation**: https://calendly.com/andrenjulio072/consultation

---

##  License

This project is proprietary to Garcia Builder. All rights reserved.

For licensing inquiries or usage permissions, contact Andre Garcia via the links above.

---

*Last updated: January 2025  Built with  for fitness transformations*
