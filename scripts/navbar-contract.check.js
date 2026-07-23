const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const navbarHtml = read('components/navbar.html');
const loaderSource = read('js/utils/component-loader-v3-simplified.js');

const priorityTargets = [
  'index.html',
  'online-coaching.html',
  'packages.html',
  '/consultation.html',
  'transformations.html',
  'testimonials.html',
  'workouts.html',
  'nutrition-calculator.html',
  'blog.html',
  'about.html',
  'faq.html',
  'contact.html'
];

const drawerTargets = [
  'index.html',
  'online-coaching.html',
  'packages.html',
  '/consultation.html',
  'transformations.html',
  'testimonials.html',
  'workouts.html',
  'nutrition-calculator.html',
  'blog.html',
  'about.html',
  'faq.html',
  'contact.html'
];

const drawerLabels = [
  'nav.group_start',
  'nav.group_results',
  'nav.group_explore'
];

function assertPriorityOrder(source, navClass, label, targets = priorityTargets) {
  const start = source.indexOf(`class="${navClass}"`);
  assert.notEqual(start, -1, `${label} should include ${navClass}`);
  const end = source.indexOf('</nav>', start);
  const navMarkup = source.slice(start, end);
  let previousIndex = -1;

  for (const target of targets) {
    const marker = target === '/consultation.html' ? 'href="/consultation.html"' : `data-gb-nav="${target}"`;
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
    /src="Logo Files\/For Web\/logo-nobackground-500\.png"/,
    'Navbar logo should use the project-relative logo path for file:// and hosted pages'
  );
  assert.match(
    source,
    /data-gb-logo-src="Logo Files\/For Web\/logo-nobackground-500\.png"/,
    'Navbar logo resolver should keep a project-relative source'
  );
  assertPriorityOrder(source, 'gb-navbar-links', 'Desktop navbar');
  assertDrawerPattern(source, 'Drawer navbar');
}

assert.match(
  loaderSource,
  /logoEl\.hidden = false;[\s\S]{0,120}gb-logo-img--missing/,
  'Navbar logo resolver must reveal the image again after finding a valid path'
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

console.log('Navbar contract check passed.');
