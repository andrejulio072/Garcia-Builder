const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const canonicalBase = 'https://www.garciabuilder.fitness';
const ogImage = `${canonicalBase}/assets/og/garcia-builder-og.jpg`;
const logoUrl = `${canonicalBase}/assets/images/logo-nobackground-500.png`;

const pageMeta = {
  'index.html': {
    title: 'Garcia Builder Fitness | Online Coaching for Fat Loss & Body Transformation',
    description: 'Personalised online coaching for busy professionals who want fat loss, structure, accountability and a plan built around real life.',
    h1: 'Online Coaching Built Around Your Real Life',
    professionalService: true
  },
  'about.html': {
    title: 'About Andre Garcia | Garcia Builder Fitness',
    description: 'Meet Andre Garcia, online coach and personal trainer helping busy people build structure, lose fat and transform their body with realistic coaching.',
    h1: 'About Andre Garcia',
    professionalService: true
  },
  'pricing.html': {
    title: 'Online Coaching Packages | Garcia Builder Fitness',
    description: 'Choose the coaching structure that fits your goal: monthly coaching, rebuild programmes, transformation coaching and premium support.',
    h1: 'Online Coaching Packages',
    service: true
  },
  'transformations.html': {
    title: 'Client Transformations | Garcia Builder Fitness',
    description: 'See Garcia Builder Fitness transformations, progress stories and examples of what structured coaching can help clients achieve.',
    h1: 'Client Transformations'
  },
  'testimonials.html': {
    title: 'Client Testimonials | Garcia Builder Fitness',
    description: 'Read client feedback from Garcia Builder Fitness coaching and see how structure, accountability and support helped people progress.',
    h1: 'Client Testimonials'
  },
  'contact.html': {
    title: 'Contact Garcia Builder Fitness | Online Coaching Enquiries',
    description: 'Contact Garcia Builder Fitness to ask about online coaching, fat loss coaching, transformation programmes or consultation availability.',
    h1: 'Contact Garcia Builder Fitness'
  },
  'faq.html': {
    title: 'Online Coaching FAQ | Garcia Builder Fitness',
    description: 'Answers to common questions about Garcia Builder Fitness online coaching, training plans, nutrition support, check-ins and the coaching app.',
    h1: 'Online Coaching FAQ',
    faq: true
  },
  'blog.html': {
    title: 'Fitness, Fat Loss & Mindset Articles | Garcia Builder Fitness',
    description: 'Practical articles on fat loss, training, nutrition, mindset and building a stronger body with structure.',
    h1: 'Fitness, Fat Loss and Mindset Articles'
  },
  'privacy.html': {
    title: 'Privacy Policy | Garcia Builder Fitness',
    description: 'Read how Garcia Builder Fitness collects, uses and protects personal information submitted through the website.',
    h1: 'Privacy Policy',
    canonicalPath: '/privacy-policy'
  },
  'terms.html': {
    title: 'Terms of Service | Garcia Builder Fitness',
    description: 'Read the terms for using Garcia Builder Fitness website, coaching services and online fitness resources.',
    h1: 'Terms of Service'
  },
  'online-coaching.html': {
    title: 'Online Fitness Coaching | Garcia Builder Fitness',
    description: 'Online coaching built around your routine, goals and lifestyle with training, nutrition, accountability and support through the Garcia Builder Coaching App.',
    h1: 'Online Coaching Built Around Your Real Life',
    professionalService: true,
    service: true
  },
  'packages.html': {
    title: 'Online Coaching Packages | Garcia Builder Fitness',
    description: 'Choose the coaching structure that fits your goal: monthly coaching, rebuild programmes, transformation coaching and premium support.',
    h1: 'Online Coaching Packages',
    service: true
  },
  'apply.html': {
    title: 'Apply for Online Coaching | Garcia Builder Fitness',
    description: 'Apply for Garcia Builder Fitness online coaching and get a personalised review of your goal, routine and next steps.',
    h1: 'Apply for Online Coaching'
  },
  'consultation.html': {
    title: 'Book a Free Coaching Consultation | Garcia Builder Fitness',
    description: 'Book a free consultation to discuss your goal, current routine and the coaching structure that fits you best.',
    h1: 'Book a Free Coaching Consultation'
  },
  '28-day-fat-loss-kickstart.html': {
    title: '28-Day Fat Loss Kickstart | Free Guide by Garcia Builder Fitness',
    description: 'Download the free 28-Day Fat Loss Kickstart and learn how to rebuild structure, nutrition and training without extreme dieting.',
    h1: '28-Day Fat Loss Kickstart'
  },
  'programs.html': {
    title: 'Online Coaching Programmes | Garcia Builder Fitness',
    description: 'Explore Garcia Builder Fitness coaching programmes for fat loss, strength, muscle gain and body transformation.',
    h1: 'Online Coaching Programmes',
    service: true
  },
  'workouts.html': {
    title: 'Workout Templates | Garcia Builder Fitness',
    description: 'Browse practical workout guidance and training structure from Garcia Builder Fitness.',
    h1: 'Workout Templates'
  }
};

const noindexPatterns = [
  /^404\.html$/,
  /^confirm-contact\.html$/,
  /^dashboard\.html$/,
  /^diagnostic\.html$/,
  /^index-inline-loader\.html$/,
  /^my-profile-production\.html$/,
  /^pricing-payment-links\.html$/,
  /^success\.html$/,
  /^test-/,
  /^thank-you-/,
  /(^|[\\/])pages[\\/]admin[\\/]/,
  /(^|[\\/])pages[\\/]auth[\\/]/,
  /(^|[\\/])pages[\\/]test[\\/]/,
  /(^|[\\/])database[\\/]admin[\\/]/
];

const oldWording = [
  [new RegExp('Trainer' + 'ize Ecosystem', 'g'), 'Garcia Builder Coaching App'],
  [new RegExp('Trainer' + 'ize app', 'g'), 'Garcia Builder Coaching App'],
  [new RegExp('Trainer' + 'ize', 'g'), 'Garcia Builder Coaching App'],
  [new RegExp('5-Step Fat Loss ' + 'Gameplan', 'g'), '28-Day Fat Loss Kickstart'],
  [new RegExp('28 Days Fat Loss ' + 'Quickstart', 'g'), '28-Day Fat Loss Kickstart'],
  [new RegExp('28-Day Fat Loss ' + 'Quickstart', 'g'), '28-Day Fat Loss Kickstart']
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function titleFromFile(relativePath, html) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch && titleMatch[1].trim()) return titleMatch[1].trim().replace(/\s+/g, ' ');
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) return `${h1Match[1].replace(/<[^>]+>/g, '').trim()} | Garcia Builder Fitness`;
  return `${path.basename(relativePath, '.html').replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} | Garcia Builder Fitness`;
}

function descriptionFromHtml(html) {
  const match = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["'][^>]*>/i);
  if (match && match[1].trim()) return match[1].trim();
  const p = html.match(/<p[^>]*>([\s\S]{40,240}?)<\/p>/i);
  if (p) return p[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 160);
  return 'Online coaching, fat loss support and practical fitness guidance from Garcia Builder Fitness.';
}

function canonicalPathFor(relativePath, meta) {
  const normalized = relativePath.replace(/\\/g, '/');
  if (meta && meta.canonicalPath) return meta.canonicalPath;
  if (normalized === 'index.html') return '/';
  if (normalized.startsWith('blog/')) return `/blog/${path.basename(normalized, '.html')}`;
  return `/${normalized}`;
}

function breadcrumbName(meta, relativePath) {
  if (meta && meta.h1) return meta.h1;
  return path.basename(relativePath, '.html').replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function jsonLdFor(relativePath, meta, canonicalUrl, title, description) {
  const scripts = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Garcia Builder Fitness',
      url: canonicalBase,
      logo: logoUrl,
      sameAs: []
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Garcia Builder Fitness',
      url: canonicalBase
    }
  ];

  if (meta && meta.professionalService) {
    scripts.push({
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      name: 'Garcia Builder Fitness',
      url: canonicalBase,
      areaServed: ['Dublin', 'Ireland', 'Online'],
      serviceType: ['Online fitness coaching', 'Fat loss coaching', 'Body transformation coaching', 'Personal training']
    });
  }

  if (meta && meta.service) {
    scripts.push({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Online Fitness Coaching',
      provider: {
        '@type': 'Organization',
        name: 'Garcia Builder Fitness',
        url: canonicalBase
      },
      areaServed: ['Online', 'Dublin', 'Ireland'],
      serviceType: 'Online fitness coaching'
    });
  }

  if (meta && meta.faq) {
    scripts.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        ['Who is Garcia Builder Fitness coaching for?', 'Garcia Builder Fitness coaching is for busy people who want structure, accountability and realistic support with training, nutrition and fat loss.'],
        ['Do I need a gym?', 'No. Coaching can be built around gym training or home training depending on your routine, equipment and goal.'],
        ['How does online coaching work?', 'You receive training structure, nutrition support, check-ins and ongoing accountability through the Garcia Builder Coaching App.'],
        ['What app do clients use?', 'Clients use the Garcia Builder Coaching App, powered by My PT Hub for platform-specific tracking and coaching delivery.'],
        ['Do I get nutrition support?', 'Yes. Nutrition support is built around realistic habits, food structure and your goal instead of extreme dieting.'],
        ['How do weekly check-ins work?', 'Weekly check-ins review progress, routine, training, nutrition and obstacles so the plan can be adjusted.'],
        ['Can beginners apply?', 'Yes. Beginners can apply if they want coaching structure and are ready to follow a realistic plan.'],
        ['Is this only for fat loss?', 'No. Coaching can support fat loss, strength, muscle gain, body recomposition and confidence in training.']
      ].map(([name, text]) => ({
        '@type': 'Question',
        name,
        acceptedAnswer: {
          '@type': 'Answer',
          text
        }
      }))
    });
  }

  if (relativePath !== 'index.html' && !relativePath.includes('thank-you-')) {
    scripts.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${canonicalBase}/`
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: breadcrumbName(meta, relativePath),
          item: canonicalUrl
        }
      ]
    });
  }

  if (relativePath.startsWith('blog/') || path.basename(relativePath).startsWith('blog-')) {
    scripts.push({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title.replace(/\s*\|\s*Garcia Builder Fitness$/, ''),
      description,
      author: {
        '@type': 'Person',
        name: 'Andre Garcia'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Garcia Builder Fitness',
        logo: {
          '@type': 'ImageObject',
          url: logoUrl
        }
      },
      mainEntityOfPage: canonicalUrl,
      datePublished: '2026-07-04',
      dateModified: '2026-07-04'
    });
  }

  return scripts.map((schema) => `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`).join('\n');
}

function seoBlock(relativePath, html) {
  const baseName = path.basename(relativePath);
  const meta = pageMeta[baseName] || {};
  const title = meta.title || titleFromFile(relativePath, html);
  const description = meta.description || descriptionFromHtml(html);
  const canonicalUrl = `${canonicalBase}${canonicalPathFor(relativePath, meta)}`;
  const robots = noindexPatterns.some((pattern) => pattern.test(relativePath)) ? 'noindex, follow' : 'index, follow';
  const ogType = relativePath.startsWith('blog/') || baseName.startsWith('blog-') ? 'article' : 'website';

  return [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}">`,
    `<meta name="robots" content="${robots}">`,
    `<link rel="canonical" href="${canonicalUrl}">`,
    `<meta property="og:type" content="${ogType}">`,
    `<meta property="og:site_name" content="Garcia Builder Fitness">`,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:url" content="${canonicalUrl}">`,
    `<meta property="og:image" content="${ogImage}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeHtml(title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(description)}">`,
    `<meta name="twitter:image" content="${ogImage}">`,
    jsonLdFor(relativePath, meta, canonicalUrl, title, description)
  ].join('\n  ');
}

function stripManagedSeo(head) {
  return head
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>\s*/gi, '')
    .replace(/<meta\b(?=[^>]*\bname\s*=\s*["']description["'])[^>]*>\s*/gi, '')
    .replace(/<meta\b(?=[^>]*\bname\s*=\s*["']robots["'])[^>]*>\s*/gi, '')
    .replace(/<link\b(?=[^>]*\brel\s*=\s*["']canonical["'])[^>]*>\s*/gi, '')
    .replace(/<meta\b(?=[^>]*\bproperty\s*=\s*["']og:[^"']+["'])[^>]*>\s*/gi, '')
    .replace(/<meta\b(?=[^>]*\bname\s*=\s*["']twitter:[^"']+["'])[^>]*>\s*/gi, '')
    .replace(/<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi, '');
}

function addAltFallbacks(html) {
  return html.replace(/<img\b([^>]*?)>/gi, (match, attrs) => {
    if (/\salt\s*=/i.test(attrs)) return match;
    const src = (attrs.match(/\ssrc\s*=\s*["']([^"']+)["']/i) || [])[1] || '';
    let alt = '';
    if (/logo/i.test(src)) alt = 'Garcia Builder Fitness logo';
    else if (/transformations|before|after|progress/i.test(src)) alt = 'Garcia Builder Fitness client transformation progress';
    else if (/about|coach|andre|trainer/i.test(src)) alt = 'Andre Garcia, online fitness coach and personal trainer';
    return `<img${attrs} alt="${alt}">`;
  });
}

function updateHead(relativePath) {
  const filePath = path.join(rootDir, relativePath);
  let html = fs.readFileSync(filePath, 'utf8');

  for (const [pattern, replacement] of oldWording) {
    html = html.replace(pattern, replacement);
  }
  html = html.replace(/https?:\/\/garciabuilder\.fitness/g, canonicalBase);
  html = html.replace(/FB_PIXEL_ID\s*=\s*['"]1102565141856929['"]/g, "FB_PIXEL_ID='958060389933459'");
  html = html.replace(/tr\?id=1102565141856929/g, 'tr?id=958060389933459');
  html = addAltFallbacks(html);

  const meta = pageMeta[path.basename(relativePath)];
  if (meta && meta.h1) {
    let h1Seen = false;
    html = html.replace(/<h1\b([^>]*)>[\s\S]*?<\/h1>/gi, (match, attrs) => {
      if (h1Seen) return match.replace(/^<h1\b/i, '<h2').replace(/<\/h1>$/i, '</h2>');
      h1Seen = true;
      return `<h1${attrs}>${meta.h1}</h1>`;
    });
    if (!h1Seen && /<body\b[^>]*>/i.test(html)) {
      html = html.replace(/(<body\b[^>]*>)/i, `$1\n<h1 class="visually-hidden">${meta.h1}</h1>`);
    }
  }

  const headMatch = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i);
  if (!headMatch) return false;

  const originalHead = headMatch[1];
  let head = stripManagedSeo(originalHead);
  const block = seoBlock(relativePath, html);
  if (/<meta\s+name=["']viewport["'][^>]*>/i.test(head)) {
    head = head.replace(/(<meta\s+name=["']viewport["'][^>]*>\s*)/i, `$1\n  ${block}\n  `);
  } else if (/<meta\s+charset\b[^>]*>/i.test(head)) {
    head = head.replace(/(<meta\s+charset\b[^>]*>\s*)/i, `$1\n  ${block}\n  `);
  } else {
    head = `\n  ${block}\n${head}`;
  }

  const updated = html.replace(originalHead, head);
  if (updated !== fs.readFileSync(filePath, 'utf8')) {
    fs.writeFileSync(filePath, updated);
    return true;
  }
  return false;
}

function walk(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'public' || entry.name === 'coverage') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(full));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(path.relative(rootDir, full));
    }
  }
  return results;
}

fs.mkdirSync(path.join(rootDir, 'assets', 'og'), { recursive: true });
const ogTarget = path.join(rootDir, 'assets', 'og', 'garcia-builder-og.jpg');
if (!fs.existsSync(ogTarget)) {
  const source = path.join(rootDir, 'assets', 'images', 'hero', 'hero.jpg');
  if (fs.existsSync(source)) fs.copyFileSync(source, ogTarget);
}

let changed = 0;
for (const relativePath of walk(rootDir)) {
  if (relativePath.startsWith('components' + path.sep)) continue;
  if (updateHead(relativePath)) changed += 1;
}

const robots = `User-agent: *\nAllow: /\n\nDisallow: /api/\nDisallow: /.vercel/\nDisallow: /private/\nDisallow: /admin/\nDisallow: /pages/admin/\nDisallow: /pages/auth/\nDisallow: /pages/test/\nDisallow: /dashboard.html\nDisallow: /my-profile-production.html\nDisallow: /pricing-payment-links.html\nDisallow: /test-\n\nSitemap: ${canonicalBase}/sitemap.xml\n`;
fs.writeFileSync(path.join(rootDir, 'robots.txt'), robots);

execFileSync(process.execPath, [path.join(rootDir, 'scripts', 'generate-sitemap.js')], { stdio: 'inherit' });
console.log(`[seo] Updated ${changed} HTML files`);
