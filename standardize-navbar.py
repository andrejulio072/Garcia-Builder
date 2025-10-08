# Standardize Navbar Across All Pages
# This script will update all HTML pages with the same navbar structure

import os
import re

# Standard navbar HTML (exact structure to use)
STANDARD_NAVBAR = '''<nav class="navbar">
  <div class="container inner">
    <a class="brand" href="index.html" style="display:flex;align-items:center;gap:14px;min-height:56px;">
      <img src="Logo Files/For Web/logo-nobackground-500.png" alt="Garcia Builder Logo" decoding="async" loading="eager" style="height: 48px;"/>
      <span class="title-gradient" style="font-size:2rem;line-height:1.1;font-weight:800;">Garcia Builder</span>
    </a>
    <nav class="nav">
      <a data-i18n="nav.home" href="index.html">Home</a>
      <a data-i18n="nav.about" href="about.html">About</a>
      <a data-i18n="nav.trans" href="transformations.html">Transformations</a>
      <a data-i18n="nav.testi" href="testimonials.html">Testimonials</a>
      <a data-i18n="nav.pricing" href="pricing.html">Pricing</a>
      <a data-i18n="nav.blog" href="blog.html" style="display:none;">Blog</a>
      <a data-i18n="nav.faq" href="faq.html">FAQ</a>
      <a data-i18n="nav.contact" href="contact.html">Contact</a>
    </nav>

    <!-- Auth buttons will be dynamically inserted here by auth-guard.js -->
    <div id="auth-buttons"></div>

    <div class="lang">
      <select id="lang-select">
        <option data-i18n="nav.lang.en" value="en">EN</option>
        <option data-i18n="nav.lang.pt" value="pt">PT</option>
        <option data-i18n="nav.lang.es" value="es">ES</option>
      </select>
    </div>
  </div>
</nav>'''

# Pages to update
PAGES = [
    'index.html',
    'about.html',
    'pricing.html',
    'contact.html',
    'faq.html',
    'testimonials.html',
    'transformations.html',
    'blog.html'
]

# CSS to ensure is included
CSS_LINK = '<link rel="stylesheet" href="css/enhanced-navbar.css?v=20251008">'

def standardize_navbar(html_content, page_name):
    """Replace existing navbar with standard one"""
    
    # Find and replace navbar (pattern matches from <nav class="navbar"> to </nav>)
    pattern = r'<nav class="navbar">.*?</nav>'
    
    # Add active class to current page
    navbar = STANDARD_NAVBAR
    page_key = page_name.replace('.html', '')
    
    # Add active class based on page
    if page_key == 'index':
        navbar = navbar.replace('href="index.html">Home', 'href="index.html" class="active">Home')
    elif page_key in navbar:
        navbar = navbar.replace(f'href="{page_name}"', f'href="{page_name}" class="active"')
    
    # Replace navbar
    html_content = re.sub(pattern, navbar, html_content, flags=re.DOTALL)
    
    return html_content

def ensure_css_linked(html_content):
    """Ensure enhanced-navbar.css is linked"""
    if 'enhanced-navbar.css' not in html_content:
        # Find css/global.css and add after it
        html_content = html_content.replace(
            '<link rel="stylesheet" href="css/global.css',
            f'<link rel="stylesheet" href="css/global.css'
        )
        html_content = html_content.replace(
            '<link rel="stylesheet" href="css/global.css">',
            f'<link rel="stylesheet" href="css/global.css">\n    {CSS_LINK}'
        )
        html_content = html_content.replace(
            '<link href="css/global.css?v=20251003-2030" rel="stylesheet"/>',
            f'<link href="css/global.css?v=20251003-2030" rel="stylesheet"/>\n{CSS_LINK}'
        )
    return html_content

def main():
    updated_files = []
    
    for page in PAGES:
        if not os.path.exists(page):
            print(f"⚠️  {page} not found")
            continue
        
        print(f"📝 Processing {page}...")
        
        try:
            with open(page, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Standardize navbar
            content = standardize_navbar(content, page)
            
            # Ensure CSS is linked
            content = ensure_css_linked(content)
            
            with open(page, 'w', encoding='utf-8') as f:
                f.write(content)
            
            updated_files.append(page)
            print(f"✅ {page} updated!")
            
        except Exception as e:
            print(f"❌ Error processing {page}: {e}")
    
    print(f"\n🎉 Successfully updated {len(updated_files)} files:")
    for file in updated_files:
        print(f"   - {file}")

if __name__ == "__main__":
    main()
