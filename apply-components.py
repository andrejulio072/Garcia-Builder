"""
Script para aplicar componentes navbar e footer em múltiplas páginas HTML
Automatiza a componentização seguindo padrão Phase 3
"""

import re
from pathlib import Path

# Páginas para processar
PAGES = [
    'blog.html',
    'contact.html',
    'faq.html',
    'transformations.html',
    'testimonials.html'
]

# Padrões regex para encontrar navbar e footer
NAVBAR_PATTERN = re.compile(
    r'<nav class="gb-navbar".*?</nav>\s*(?:<script>.*?</script>\s*)?',
    re.DOTALL
)

FOOTER_PATTERN = re.compile(
    r'<footer class="gb-footer".*?</footer>',
    re.DOTALL
)

# Componentes de substituição
NAVBAR_COMPONENT = '<!-- Navbar Component (loaded dynamically) -->\n<div data-component="navbar"></div>\n\n'
FOOTER_COMPONENT = '<!-- Footer Component (loaded dynamically) -->\n<div data-component="footer"></div>\n\n'

# Adicionar component-loader.js
LOADER_SCRIPT = '<script defer src="js/utils/component-loader.js?v=20251025"></script>'

def add_component_loader(content):
    """Adiciona component-loader.js se não existir"""
    if 'component-loader.js' in content:
        return content
    
    # Procura por i18n.js e adiciona logo após
    pattern = r'(<script defer src="assets/i18n\.js.*?</script>)'
    replacement = r'\1\n' + LOADER_SCRIPT
    
    return re.sub(pattern, replacement, content, count=1)

def replace_navbar(content):
    """Substitui navbar por componente"""
    return NAVBAR_PATTERN.sub(NAVBAR_COMPONENT, content, count=1)

def replace_footer(content):
    """Substitui footer por componente"""
    return FOOTER_PATTERN.sub(FOOTER_COMPONENT, content, count=1)

def update_cache_busting(content):
    """Atualiza versões de cache para 20251025"""
    content = re.sub(
        r'(\?v=)[\d-]+',
        r'\g<1>20251025',
        content
    )
    return content

def process_file(filepath):
    """Processa um arquivo HTML"""
    print(f"\n📄 Processando {filepath.name}...")
    
    try:
        content = filepath.read_text(encoding='utf-8')
        original_length = len(content.split('\n'))
        
        # Aplicar transformações
        content = add_component_loader(content)
        content = replace_navbar(content)
        content = replace_footer(content)
        content = update_cache_busting(content)
        
        # Salvar
        filepath.write_text(content, encoding='utf-8')
        
        new_length = len(content.split('\n'))
        diff = original_length - new_length
        
        print(f"   ✅ {filepath.name}: {original_length} → {new_length} linhas ({diff:+d})")
        
        return diff
        
    except Exception as e:
        print(f"   ❌ Erro em {filepath.name}: {e}")
        return 0

def main():
    """Função principal"""
    base_path = Path(__file__).parent
    total_lines_removed = 0
    
    print("🚀 Iniciando componentização em batch...")
    print(f"📁 Diretório: {base_path}")
    print(f"📋 Páginas: {', '.join(PAGES)}\n")
    
    for page in PAGES:
        filepath = base_path / page
        
        if not filepath.exists():
            print(f"⚠️  {page} não encontrado, pulando...")
            continue
            
        lines_removed = process_file(filepath)
        total_lines_removed += lines_removed
    
    print(f"\n✨ Concluído!")
    print(f"📊 Total removido: {total_lines_removed} linhas")
    print(f"🎯 Componentes aplicados com sucesso!")

if __name__ == '__main__':
    main()
