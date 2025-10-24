# 🎯 Script de Implementação Automática - Google Analytics & Facebook Pixel
# Executa: .\IMPLEMENTAR-TRACKING-AUTOMATICO.ps1

param(
    [string]$GTMId = "GTM-GARCIABUILDER",
    [string]$FacebookPixelId = "FACEBOOK_PIXEL_ID"
)

Write-Host "🚀 INICIANDO IMPLEMENTAÇÃO AUTOMÁTICA DE TRACKING" -ForegroundColor Green
Write-Host "📊 GTM ID: $GTMId" -ForegroundColor Yellow
Write-Host "📱 Facebook Pixel ID: $FacebookPixelId" -ForegroundColor Yellow
Write-Host ""

# Lista de páginas para implementar tracking
$paginas = @(
    "contact.html",
    "about.html",
    "transformations.html",
    "testimonials.html",
    "programs.html",
    "faq.html",
    "success.html"
)

# Código GTM Head
$gtmHead = @"
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','$GTMId');</script>
<!-- End Google Tag Manager -->
"@

# Código GTM Body
$gtmBody = @"
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=$GTMId"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
"@

# Facebook Pixel Code
$facebookPixel = @"
<!-- Facebook Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '$FacebookPixelId');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=$FacebookPixelId&ev=PageView&noscript=1"
/></noscript>
<!-- End Facebook Pixel Code -->
"@

# Eventos de tracking básicos
$basicTracking = @"
<!-- Basic Tracking Events -->
<script>
// Page view tracking
if (typeof dataLayer !== 'undefined') {
  dataLayer.push({
    'event': 'page_view',
    'page_title': document.title,
    'page_location': window.location.href
  });
}

// Contact form tracking
document.addEventListener('submit', function(e) {
  if (e.target.querySelector('input[type="email"]') || e.target.id === 'contact-form') {
    dataLayer.push({
      'event': 'form_submit',
      'form_type': 'contact'
    });

    if (typeof fbq !== 'undefined') {
      fbq('track', 'Contact');
    }
  }
});

// Link tracking for external sites
document.addEventListener('click', function(e) {
  const link = e.target.closest('a');
  if (link && link.href.includes('whatsapp')) {
    dataLayer.push({
      'event': 'whatsapp_click',
      'link_url': link.href
    });

    if (typeof fbq !== 'undefined') {
      fbq('track', 'Contact', {contact_method: 'whatsapp'});
    }
  }
});
</script>
"@

# Função para implementar tracking em uma página
function Implementar-Tracking {
    param($arquivo)

    if (!(Test-Path $arquivo)) {
        Write-Host "❌ Arquivo não encontrado: $arquivo" -ForegroundColor Red
        return
    }

    Write-Host "📝 Processando: $arquivo" -ForegroundColor Cyan

    $conteudo = Get-Content $arquivo -Raw -Encoding UTF8

    # Verificar se já tem GTM
    if ($conteudo -match "googletagmanager") {
        Write-Host "   ⚠️  GTM já implementado" -ForegroundColor Yellow
    } else {
        # Adicionar GTM no head
        $conteudo = $conteudo -replace "(<head[^>]*>)", "`$1`n$gtmHead"

        # Adicionar GTM noscript no body
        $conteudo = $conteudo -replace "(<body[^>]*>)", "`$1`n$gtmBody"

        Write-Host "   ✅ GTM implementado" -ForegroundColor Green
    }

    # Verificar se já tem Facebook Pixel
    if ($conteudo -match "fbevents\.js") {
        Write-Host "   ⚠️  Facebook Pixel já implementado" -ForegroundColor Yellow
    } else {
        # Adicionar Facebook Pixel antes do </head>
        $conteudo = $conteudo -replace "(</head>)", "$facebookPixel`n`$1"
        Write-Host "   ✅ Facebook Pixel implementado" -ForegroundColor Green
    }

    # Verificar se já tem tracking básico
    if ($conteudo -match "Basic Tracking Events") {
        Write-Host "   ⚠️  Tracking básico já implementado" -ForegroundColor Yellow
    } else {
        # Adicionar tracking básico antes do </body>
        $conteudo = $conteudo -replace "(</body>)", "$basicTracking`n`$1"
        Write-Host "   ✅ Tracking básico implementado" -ForegroundColor Green
    }

    # Salvar arquivo
    $conteudo | Set-Content $arquivo -Encoding UTF8
    Write-Host "   💾 Arquivo salvo" -ForegroundColor Green
    Write-Host ""
}

# Implementar em todas as páginas
foreach ($pagina in $paginas) {
    Implementar-Tracking $pagina
}

Write-Host "🎉 IMPLEMENTAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Substituir 'GTM-GARCIABUILDER' pelo ID real do GTM" -ForegroundColor White
Write-Host "2. Substituir 'FACEBOOK_PIXEL_ID' pelo ID real do Facebook Pixel" -ForegroundColor White
Write-Host "3. Testar implementação com Tag Assistant" -ForegroundColor White
Write-Host "4. Configurar conversões no GA4" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Para atualizar IDs automaticamente:" -ForegroundColor Cyan
Write-Host ".\IMPLEMENTAR-TRACKING-AUTOMATICO.ps1 -GTMId 'GTM-ABC123' -FacebookPixelId '123456789'" -ForegroundColor White
