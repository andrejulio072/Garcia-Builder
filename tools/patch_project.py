
#!/usr/bin/env python3

"""
Garcia Builder – HTML Patcher (non-destructive)
Usage:
  python tools/patch_project.py /path/to/your/project/root

What it does (per .html file):
  - Ensures <meta name="viewport"> exists.
  - Adds font preconnects (Google) if not present.
  - Adds link to css/global-optimizations.css (creates css/ if missing).
  - Converts <script ...> to <script defer ...> unless it already has defer/async
    (skips type="application/ld+json").
  - Adds <script defer src="js/app-optimizations.js"> before </body> if missing.
  - Adds loading="lazy" and decoding="async" to <img> tags, except those with class "hero" or id "hero".
    For hero images, sets fetchpriority="high" and decoding="async".
  - Creates a .bak backup of each original HTML before overwriting.
"""

import sys, os, re, pathlib

PROJECT_ROOT = None

# Simple helpers
def ensure_dir(p):
    os.makedirs(p, exist_ok=True)

def read_text(p):
    with open(p, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()

def write_text(p, s):
    with open(p, "w", encoding="utf-8") as f:
        f.write(s)

def backup_file(p):
    bak = p + ".bak"
    if not os.path.exists(bak):
        with open(p, "rb") as src, open(bak, "wb") as dst:
            dst.write(src.read())

def inject_after_head(html, snippet):
    # Insert before </head>
    if "</head>" in html.lower():
        # Find case-insensitive closing head
        m = re.search(r"</head>", html, flags=re.IGNORECASE)
        if m:
            idx = m.start()
            return html[:idx] + snippet + html[idx:]
    # If no head, just prefix
    return snippet + html

def inject_before_body_end(html, snippet):
    m = re.search(r"</body\s*>", html, flags=re.IGNORECASE)
    if m:
        idx = m.start()
        return html[:idx] + snippet + html[idx:]
    return html + snippet

def ensure_viewport(head_html):
    if re.search(r'<meta\s+name=["\']viewport["\']', head_html, flags=re.I):
        return head_html
    meta = '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
    return meta + head_html

def ensure_preconnects(head_html):
    need_fonts_gstatic = 'fonts.gstatic.com' not in head_html
    need_fonts_googleapis = 'fonts.googleapis.com' not in head_html
    snippet = ""
    if need_fonts_gstatic:
        snippet += '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
    if need_fonts_googleapis:
        snippet += '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
    return snippet + head_html

def ensure_global_opt_css(head_html):
    # Avoid duplicate insertion
    if 'global-optimizations.css' in head_html:
        return head_html
    return head_html + '<link rel="stylesheet" href="css/global-optimizations.css">\n'

def add_defer_to_scripts(html):
    def repl(m):
        tag = m.group(0)
        # Skip JSON-LD and inline type
        if re.search(r'type\s*=\s*["\']application/ld\+json["\']', tag, flags=re.I):
            return tag
        if re.search(r'\sdefer(\s|>|$)', tag, flags=re.I) or re.search(r'\sasync(\s|>|$)', tag, flags=re.I):
            return tag
        # Inject defer
        tag = re.sub(r"<script", "<script defer", tag, count=1, flags=re.I)
        return tag
    return re.sub(r"<script\b[^>]*>", repl, html, flags=re.I)

def add_lazy_to_images(html):
    def img_repl(m):
        tag = m.group(0)
        # Don't lazyload data URIs or SVG inline
        if "svg" in tag.lower() and ("<svg" in tag.lower() or "data:image/svg+xml" in tag.lower()):
            return tag

        is_hero = re.search(r'class\s*=\s*["\'][^"\']*\bhero\b', tag, flags=re.I) or \
                  re.search(r'id\s*=\s*["\']hero["\']', tag, flags=re.I)

        # Ensure decoding async
        if not re.search(r'\sdecoding\s*=', tag, flags=re.I):
            tag = re.sub(r"<img", '<img decoding="async"', tag, count=1, flags=re.I)

        if is_hero:
            # Ensure fetchpriority=high for hero
            if not re.search(r'\sfetchpriority\s*=', tag, flags=re.I):
                tag = re.sub(r"<img", '<img fetchpriority="high"', tag, count=1, flags=re.I)
            # Do NOT force loading=lazy on hero
            # Remove accidental loading=lazy if present
            tag = re.sub(r'\sloading\s*=\s*["\']lazy["\']', '', tag, flags=re.I)
        else:
            if not re.search(r'\sloading\s*=', tag, flags=re.I):
                tag = re.sub(r"<img", '<img loading="lazy"', tag, count=1, flags=re.I)

        return tag

    return re.sub(r"<img\b[^>]*>", img_repl, html, flags=re.I)

def ensure_footer_script(html):
    if 'js/app-optimizations.js' in html:
        return html
    snippet = '\n<script defer src="js/app-optimizations.js"></script>\n'
    return inject_before_body_end(html, snippet)

def patch_html_file(path):
    html = read_text(path)

    # HEAD extraction: we only need to ensure viewport, preconnects, and global CSS present somewhere in head
    head_match = re.search(r"<head\b[^>]*>(.*?)</head>", html, flags=re.I | re.S)
    if head_match:
        head_inner = head_match.group(1)

        head_inner = ensure_viewport(head_inner)
        head_inner = ensure_preconnects(head_inner)
        head_inner = ensure_global_opt_css(head_inner)

        # Rebuild head
        html = html[:head_match.start(1)] + head_inner + html[head_match.end(1):]
    else:
        # No head tag? Inject minimal head at top
        minimal_head = """<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="css/global-optimizations.css">
</head>
"""
        html = minimal_head + html

    # Add defer to scripts safely
    html = add_defer_to_scripts(html)

    # Add lazy to images
    html = add_lazy_to_images(html)

    # Ensure footer optimization script
    html = ensure_footer_script(html)

    # Write back
    backup_file(path)
    write_text(path, html)

def main():
    if len(sys.argv) < 2:
        print("Usage: python tools/patch_project.py /path/to/your/project/root")
        sys.exit(1)

    root = sys.argv[1]
    if not os.path.isdir(root):
        print("Directory not found:", root)
        sys.exit(2)

    # Ensure css/js exist and copy our assets in place if missing
    css_src = os.path.join(os.path.dirname(__file__), "..", "css", "global-optimizations.css")
    js_src  = os.path.join(os.path.dirname(__file__), "..", "js", "app-optimizations.js")

    css_dst_dir = os.path.join(root, "css")
    js_dst_dir  = os.path.join(root, "js")
    os.makedirs(css_dst_dir, exist_ok=True)
    os.makedirs(js_dst_dir, exist_ok=True)

    # Copy files (overwrite with latest toolkit to ensure in sync)
    with open(css_src, "rb") as src, open(os.path.join(css_dst_dir, "global-optimizations.css"), "wb") as dst:
        dst.write(src.read())
    with open(js_src, "rb") as src, open(os.path.join(js_dst_dir, "app-optimizations.js"), "wb") as dst:
        dst.write(src.read())

    # Walk HTML files
    patched = 0
    for dirpath, dirnames, filenames in os.walk(root):
        for fn in filenames:
            if fn.lower().endswith(".html"):
                p = os.path.join(dirpath, fn)
                try:
                    patch_html_file(p)
                    patched += 1
                except Exception as e:
                    print("Failed to patch", p, "->", e)

    print(f"Patched {patched} HTML files successfully.")
    print("Backups saved as .bak next to each file.")

if __name__ == "__main__":
    main()
