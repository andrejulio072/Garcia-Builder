const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const navbarHtml = read('components/navbar.html');
const loaderSource = read('js/utils/component-loader-v3-simplified.js');
const navbarCss = read('css/components/navbar-component.css');

const primaryTargets = [
  '/',
  '/online-coaching',
  '/packages',
  '/transformations',
  '/testimonials'
];

const moreTargets = [
  '/workouts',
  '/nutrition-calculator',
  '/blog',
  '/about',
  '/faq',
  '/contact'
];

const drawerTargets = [
  '/',
  '/online-coaching',
  '/packages',
  '/consultation',
  '/transformations',
  '/testimonials',
  '/workouts',
  '/nutrition-calculator',
  '/blog',
  '/about',
  '/faq',
  '/contact'
];

const drawerLabels = [
  'nav.group_start',
  'nav.group_results',
  'nav.group_explore'
];

function assertPriorityOrder(source, navClass, label, targets = primaryTargets) {
  const start = source.indexOf(`class="${navClass}"`);
  assert.notEqual(start, -1, `${label} should include ${navClass}`);
  const end = source.indexOf('</nav>', start);
  const navMarkup = source.slice(start, end);
  let previousIndex = -1;

  for (const target of targets) {
    const marker = target === '/consultation' ? 'href="/consultation"' : `data-gb-nav="${target}"`;
    const currentIndex = navMarkup.indexOf(marker);
    assert.notEqual(currentIndex, -1, `${label} should include ${target}`);
    assert.ok(currentIndex > previousIndex, `${label} should keep ${target} in visitor-priority order`);
    previousIndex = currentIndex;
  }
}

function assertDrawerPattern(source, label) {
  assertPriorityOrder(source, 'gb-menu-links', label, drawerTargets);
  for (const i18nKey of drawerLabels) {
    assert.match(source, new RegExp(`data-i18n="${i18nKey.replace('.', '\\.')}"`), `${label} should include ${i18nKey}`);
  }
  assert.match(source, /gb-menu-link gb-menu-link--cta/, `${label} should emphasize consultation as the primary action`);
  assert.doesNotMatch(source, /class="gb-menu-actions"/, `${label} should keep the grouped link pattern without a separate action row`);
}

const primaryPages = [
  'index.html',
  'about.html',
  'workouts.html',
  'transformations.html',
  'testimonials.html',
  'pricing.html',
  'blog.html',
  'faq.html',
  'contact.html'
];

for (const source of [navbarHtml, loaderSource]) {
  assert.doesNotMatch(
    source,
    /data:image\/svg\+xml[\s\S]{0,500}Garcia Builder/i,
    'Navbar logo fallback must not render an orange text-only Garcia Builder SVG'
  );
  assert.match(
    source,
    /src="\/assets\/images\/logo-nobackground-256\.webp"/,
    'Navbar logo should use the right-sized WebP source on hosted pages'
  );
  assert.match(
    source,
    /data-gb-logo-src="assets\/images\/logo-nobackground-256\.webp"/,
    'Navbar logo resolver should keep a project-relative WebP source'
  );
  assertPriorityOrder(source, 'gb-navbar-links', 'Desktop primary navbar');
  assertPriorityOrder(source, 'gb-navbar-more-links', 'Desktop More menu', moreTargets);
  assert.doesNotMatch(
    source,
    /class="gb-navbar-utility"/,
    'Desktop navbar should not render a competing utility row'
  );
  assert.match(
    source,
    /gb-navbar-more-menu[\s\S]*id="auth-buttons-navbar"/,
    'Desktop account controls should live in the More panel'
  );
  assert.match(
    source,
    /gb-navbar-links[\s\S]*gb-navbar-link--assessment/,
    'Desktop primary navbar should include the free assessment action'
  );
  assert.match(
    source,
    /class="gb-navbar-action-cta"[^>]*href="\/consultation"|href="\/consultation"[^>]*class="gb-navbar-action-cta"/,
    'Desktop navbar should expose one focused consultation action'
  );
  assertDrawerPattern(source, 'Drawer navbar');
}

assert.match(
  loaderSource,
  /logoEl\.hidden = false;[\s\S]{0,120}gb-logo-img--missing/,
  'Navbar logo resolver must reveal the image again after finding a valid path'
);
assert.match(
  loaderSource,
  /if \(!isFileProtocol\(\)\)[\s\S]{0,220}addCandidate\(`\/\$\{relativeBase\}`\)/,
  'Navbar logo resolver should try the hosted root path before route-relative fallbacks'
);

for (const page of primaryPages) {
  const html = read(page);
  assert.equal(
    (html.match(/data-component="navbar"/g) || []).length,
    1,
    `${page} should load exactly one shared navbar component`
  );
  assert.match(
    html,
    /css\/components\/navbar-component\.css/,
    `${page} should include the shared navbar CSS`
  );
  assert.match(
    html,
    /js\/utils\/component-loader-v3-simplified\.js/,
    `${page} should include the shared component loader`
  );
  assert.doesNotMatch(
    html,
    /<nav[\s\S]{0,300}class=["'][^"']*\bnavbar\b(?![\s\S]*data-component="navbar")/i,
    `${page} should not contain a separate hard-coded legacy navbar`
  );
}

assert.match(
  navbarCss,
  /Final desktop navigation system[\s\S]*?\.gb-navbar-content\s*\{[\s\S]*?height:\s*76px;/,
  'Desktop navbar should use one explicitly constrained row'
);
assert.match(
  navbarCss,
  /Final desktop navigation system[\s\S]*?\.gb-navbar-links\s*\{[\s\S]*?display:\s*flex;/,
  'Desktop widths should show the primary navigation links'
);
assert.match(
  navbarCss,
  /Final desktop navigation system[\s\S]*?\.gb-navbar-more\s*\{[\s\S]*?display:\s*block;/,
  'Desktop widths should expose secondary navigation through the More panel'
);
assert.match(
  navbarCss,
  /Final desktop navigation system[\s\S]*?\.gb-navbar \.gb-hamburger\s*\{[\s\S]*?display:\s*none;/,
  'Desktop widths should use the full navbar rather than the mobile hamburger'
);
assert.match(
  navbarCss,
  /@media \(max-width: 1024px\)[\s\S]*?\.gb-navbar-links\s*\{[\s\S]*?display:\s*none;/,
  'The existing mobile breakpoint should continue to use the navigation drawer'
);

console.log('Navbar contract check passed.');
