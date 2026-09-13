const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const publicRoot = path.join(root, 'public');

function read(base, relativePath) {
  const absolutePath = path.join(base, relativePath);
  assert.ok(fs.existsSync(absolutePath), `${relativePath} must exist in ${path.basename(base)}`);
  return fs.readFileSync(absolutePath, 'utf8');
}

function readTestimonials(base) {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(read(base, path.join('js', 'testimonials-data.js')), sandbox);
  assert.ok(Array.isArray(sandbox.window.GB_TESTIMONIALS), 'GB_TESTIMONIALS must be an array');
  return sandbox.window.GB_TESTIMONIALS;
}

function countTransformations(base) {
  const html = read(base, 'transformations.html');
  return (html.match(/class="[^"]*\btransformation-item\b[^"]*"/g) || []).length;
}

const sourceTestimonials = readTestimonials(root);
const publicTestimonials = readTestimonials(publicRoot);
const sourceTransformations = countTransformations(root);
const publicTransformations = countTransformations(publicRoot);

assert.ok(sourceTestimonials.length > 0, 'The source testimonials collection must not be empty');
assert.ok(sourceTransformations > 0, 'The source transformations page must contain result cards');
assert.equal(
  publicTestimonials.length,
  sourceTestimonials.length,
  'The public build must preserve every testimonial from the source collection'
);
assert.equal(
  publicTransformations,
  sourceTransformations,
  'The public build must preserve every transformation card from the source page'
);

console.log(
  `Public results pages check passed (${publicTestimonials.length} testimonials, ${publicTransformations} transformations).`
);
