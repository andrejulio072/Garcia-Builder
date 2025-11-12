const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('assets/i18n.js', 'utf8');

const sandbox = {
  window: { location: { href: '', pathname: '', origin: '', hash: '', search: '' } },
  document: {
    addEventListener() {},
    querySelectorAll() { return []; },
    getElementById() { return null; }
  },
  localStorage: {
    getItem() { return null; },
    setItem() {}
  },
  Event: function () {},
  console
};

sandbox.window.addEventListener = () => {};
sandbox.window.dispatchEvent = () => {};
sandbox.window.GB_I18N = {};

vm.createContext(sandbox);
vm.runInContext(code, sandbox);

const dicts = sandbox.window.DICTS;

const collect = (obj, prefix = '', set = new Set()) => {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const [key, value] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        collect(value, path, set);
      } else {
        set.add(path);
      }
    }
  } else if (prefix) {
    set.add(prefix);
  }
  return set;
};

const locales = Object.keys(dicts);
const keySets = {};
for (const locale of locales) {
  keySets[locale] = collect(dicts[locale]);
}

const base = 'en';
for (const locale of locales) {
  if (locale === base) continue;
  const missing = [...keySets[base]].filter(k => !keySets[locale].has(k)).sort();
  const extra = [...keySets[locale]].filter(k => !keySets[base].has(k)).sort();
  console.log(`Locale ${locale}: missing ${missing.length}, extra ${extra.length}`);
  if (missing.length) {
    console.log('  Missing keys:');
    console.log('   ', missing.join('\n    '));
  }
  if (extra.length) {
    console.log('  Extra keys:');
    console.log('   ', extra.join('\n    '));
  }
  console.log('');
}
