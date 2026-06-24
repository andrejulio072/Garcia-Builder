const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/filter-supabase-backup.js <input.sql> [output.sql]');
  process.exit(1);
}

const inputPath = path.resolve(args[0]);
const outputPath = path.resolve(args[1] || `${inputPath.replace(/\.backup$/i, '')}.public-only.sql`);

if (!fs.existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  process.exit(1);
}

const text = fs.readFileSync(inputPath, 'utf8');
const lines = text.split(/\r?\n/);

const statementContains = (statement, regex) => regex.test(statement);

const isReservedStatement = (statement) => {
  const trimmed = statement.trim();
  return (
    /^create role\b/i.test(trimmed) ||
    /^alter role\b/i.test(trimmed) ||
    /^drop role\b/i.test(trimmed) ||
    /^grant .* to .*\b(?:anon|authenticated|authenticator|postgres|service_role|supabase_admin|supabase_auth_admin|supabase_etl_admin|supabase_read_only_user|supabase_realtime_admin|supabase_replication_admin|supabase_storage_admin|pgbouncer)\b/i.test(trimmed) ||
    /^revoke /i.test(trimmed) ||
    /^create schema\b(?!.*\bpublic\b)/i.test(trimmed) ||
    /^drop schema\b/i.test(trimmed) ||
    /^comment on schema\b(?!.*\bpublic\b)/i.test(trimmed) ||
    /^alter default privileges .* schema (?!public)\b/i.test(trimmed) ||
    /^set role\b/i.test(trimmed) ||
    /^set session authorization\b/i.test(trimmed)
  );
};

const shouldKeepStatement = (statement) => {
  const trimmed = statement.trim();
  if (!trimmed) return false;

  // Keep comments as standalone lines, but drop comments attached to excluded statements.
  const isCommentOnly = /^\s*--/.test(trimmed) && !/;\s*$/.test(trimmed);
  if (isCommentOnly) {
    return true;
  }

  if (isReservedStatement(trimmed)) {
    return false;
  }

  if (/^create extension\b/i.test(trimmed)) return true;
  if (/^comment on extension\b/i.test(trimmed)) return true;
  if (/^set\b/i.test(trimmed)) return true;
  if (/^copy\s+public\./i.test(trimmed)) return true;
  if (/^create table\s+public\./i.test(trimmed)) return true;
  if (/^alter table\s+public\./i.test(trimmed)) return true;
  if (/^comment on table\s+public\./i.test(trimmed)) return true;
  if (/^comment on column\s+public\./i.test(trimmed)) return true;
  if (/^create sequence\s+public\./i.test(trimmed)) return true;
  if (/^alter sequence\s+public\./i.test(trimmed)) return true;
  if (/^create view\s+public\./i.test(trimmed)) return true;
  if (/^drop view\s+public\./i.test(trimmed)) return true;
  if (/^create function\s+public\./i.test(trimmed)) return true;
  if (/^alter function\s+public\./i.test(trimmed)) return true;
  if (/^comment on function\s+public\./i.test(trimmed)) return true;
  if (/^grant .* on .* public\./i.test(trimmed)) return true;
  if (/^revoke .* on .* public\./i.test(trimmed)) return true;
  if (/^alter default privileges .* schema public\b/i.test(trimmed)) return true;
  if (/\bpublic\./i.test(trimmed)) return true;

  return false;
};

const normalizeCreateExtension = (statement) => {
  return statement.replace(/^create extension\s+(if not exists\s+)?/i, 'CREATE EXTENSION IF NOT EXISTS ');
};

let outputStatements = [];
let currentStatement = [];
let inCopyBlock = false;
let copyKeep = false;

const flushStatement = () => {
  if (!currentStatement.length) return;
  const statement = currentStatement.join('\n').trim();
  currentStatement = [];

  if (statement === '') return;

  if (inCopyBlock) {
    return;
  }

  if (/^create extension\b/i.test(statement)) {
    outputStatements.push(normalizeCreateExtension(statement));
    return;
  }

  if (shouldKeepStatement(statement)) {
    outputStatements.push(statement);
  }
};

for (const line of lines) {
  const trimmed = line.trim();

  if (inCopyBlock) {
    currentStatement.push(line);
    if (trimmed === '\\.') {
      inCopyBlock = false;
      if (copyKeep && shouldKeepStatement(currentStatement.join('\n'))) {
        outputStatements.push(currentStatement.join('\n'));
      }
      currentStatement = [];
      copyKeep = false;
    }
    continue;
  }

  if (/^copy\s+public\./i.test(trimmed)) {
    inCopyBlock = true;
    copyKeep = true;
    currentStatement = [line];
    continue;
  }

  if (/^copy\s+/i.test(trimmed) && !/public\./i.test(trimmed)) {
    inCopyBlock = true;
    copyKeep = false;
    currentStatement = [line];
    continue;
  }

  currentStatement.push(line);

  if (trimmed.endsWith(';')) {
    flushStatement();
  }
}

flushStatement();

const outputText = outputStatements.join('\n\n') + '\n';
fs.writeFileSync(outputPath, outputText, 'utf8');
console.log(`Filtered backup written to: ${outputPath}`);
console.log(`Statements kept: ${outputStatements.length}`);
