#!/usr/bin/env node
/**
 * Regression check for lead forms.
 *
 * The public browser code must not insert arbitrary form metadata directly into
 * Supabase `leads`, because production schemas may not have fields like
 * `guide_id` or `page`. Metadata should go through `/api/lead` as `notes`.
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function extractBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  assert(start !== -1, `Missing marker: ${startMarker}`);

  const end = source.indexOf(endMarker, start);
  assert(end !== -1, `Missing marker after ${startMarker}: ${endMarker}`);

  return source.slice(start, end);
}

const newsletterManager = read('js/components/newsletter-manager.js');
const saveLeadBlock = extractBetween(
  newsletterManager,
  'const saveLeadToDatabase = async (leadInfo) => {',
  '  // Save newsletter subscriber'
);

assert(
  saveLeadBlock.includes("postJson('/api/lead', payload)"),
  'saveLeadToDatabase must send lead captures through /api/lead.'
);

assert(
  !saveLeadBlock.includes(".from('leads')") && !saveLeadBlock.includes('.from("leads")'),
  'saveLeadToDatabase must not insert directly into Supabase leads from the browser.'
);

assert(
  !saveLeadBlock.includes('insert([leadInfo])'),
  'saveLeadToDatabase must not insert raw leadInfo metadata as table columns.'
);

assert(
  saveLeadBlock.includes("localStorage.getItem('garcia_leads')"),
  'saveLeadToDatabase should keep a local fallback if /api/lead is unavailable.'
);

const leadApi = read('api/lead.js');
const leadInsertBlock = extractBetween(
  leadApi,
  'const insertPayload = {',
  '    const leadInsert = await insertLeadWithSchemaFallback'
);

['email:', 'name:', 'source:', 'notes:'].forEach((field) => {
  assert(leadInsertBlock.includes(field), `api/lead.js insert candidates missing ${field}`);
});

['guide_id:', 'page:', 'page_path:', 'source_page:', 'user_agent:'].forEach((field) => {
  assert(
    !leadInsertBlock.includes(field),
    `api/lead.js insert candidates should not send metadata column ${field}; use notes instead.`
  );
});

assert(
  leadApi.includes('insertLeadWithSchemaFallback'),
  'api/lead.js should retry lead inserts against narrower schemas.'
);

assert(
  leadInsertBlock.includes('insertPayload') && leadInsertBlock.includes('insertCandidates'),
  'api/lead.js should include full and fallback insert payloads.'
);

assert(
  leadApi.includes('SUPABASE_URL') && leadApi.includes('NEXT_PUBLIC_SUPABASE_URL'),
  'api/lead.js should accept both SUPABASE_URL and NEXT_PUBLIC_SUPABASE_URL.'
);

console.log('Lead form Supabase contract check passed.');
