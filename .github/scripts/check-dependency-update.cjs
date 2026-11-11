const { execFileSync } = require('node:child_process');
const assert = require('node:assert/strict');
const [base, head] = process.argv.slice(2);
function git(...args) { return execFileSync('git', args, { encoding: 'utf8' }).trim(); }
function read(ref, file) { return git('show', `${ref}:${file}`); }
function fail(message) { throw new Error(message); }
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]));
  return value;
}
function version(spec) {
  const match = String(spec).match(/^([~^]?)(?:v)?(\d+)(?:\.(\d+))?(?:\.(\d+))?$/);
  if (!match) fail(`Unrecognized version requires review: ${spec}`);
  return { range: match[1], numbers: match.slice(2).map(value => Number(value || 0)) };
}
function safeVersion(before, after) {
  if (before === after) return;
  const a = version(before), b = version(after);
  if (a.range !== b.range) fail('Version range policy changed');
  if (a.numbers[0] !== b.numbers[0]) fail('Major version change requires review');
  if (a.numbers[0] === 0 && a.numbers[1] !== b.numbers[1]) fail('Pre-1.0 minor change requires review');
  for (let i = 0; i < 3; i++) {
    if (a.numbers[i] === b.numbers[i]) continue;
    if (b.numbers[i] < a.numbers[i]) fail('Dependency downgrade requires review');
    return;
  }
}
function manifest(before, after) {
  const a = JSON.parse(before), b = JSON.parse(after);
  for (const section of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
    const old = a[section] || {}, next = b[section] || {};
    assert.deepEqual(Object.keys(old).sort(), Object.keys(next).sort(), 'Added or removed dependency requires review');
    for (const name of Object.keys(old)) safeVersion(old[name], next[name]);
    delete a[section]; delete b[section];
  }
  assert.deepEqual(stable(a), stable(b), 'Non-dependency manifest changes require review');
}
function workflow(before, after) {
  const refs = text => [...text.matchAll(/^(\s*(?:-\s*)?uses:\s*)([^\s@]+)@([^\s#]+)(.*)$/gm)];
  const a = refs(before), b = refs(after);
  assert.equal(a.length, b.length, 'Action steps changed');
  for (let i = 0; i < a.length; i++) {
    assert.equal(a[i][2], b[i][2], 'Action identity changed');
    safeVersion(a[i][3], b[i][3]);
  }
  const normalize = text => text.replace(/^(\s*(?:-\s*)?uses:\s*)([^\s@]+)@([^\s#]+)(.*)$/gm, '$1$2@VERSION$4');
  assert.equal(normalize(before), normalize(after), 'Non-version workflow changes require review');
}
function check(baseRef, headRef) {
  if (!/^[a-f0-9]{40}$/.test(baseRef || '') || !/^[a-f0-9]{40}$/.test(headRef || '')) fail('Exact base and head commits are required');
  const changes = git('diff', '--name-status', '--no-renames', baseRef, headRef).split('\n').filter(Boolean);
  if (!changes.length) fail('No dependency changes');
  for (const line of changes) {
    const [status, file] = line.split('\t');
    if (status !== 'M') fail(`Added, removed, or renamed file requires review: ${file}`);
    const before = read(baseRef, file), after = read(headRef, file);
    if (/(^|\/)package\.json$/.test(file)) manifest(before, after);
    else if (/(^|\/)(package-lock\.json|npm-shrinkwrap\.json)$/.test(file)) {
      const a = JSON.parse(before), b = JSON.parse(after);
      for (const key of ['name', 'version', 'lockfileVersion']) assert.deepEqual(a[key], b[key], `Lockfile ${key} changed`);
      for (const [name, old] of Object.entries(a.packages || {})) {
        const next = b.packages?.[name];
        if (name && old.version && next?.version) safeVersion(old.version, next.version);
      }
      if (a.packages?.[''] || b.packages?.['']) manifest(JSON.stringify(a.packages?.[''] || {}), JSON.stringify(b.packages?.[''] || {}));
    } else if (/^\.github\/workflows\/[^/]+\.ya?ml$/.test(file)) workflow(before, after);
    else fail(`Unrelated file requires review: ${file}`);
  }
}
if (require.main === module) {
  try { check(base, head); console.log('Dependency-only patch/minor safety checks passed.'); }
  catch (error) { console.error(`Automatic dependency merge blocked: ${error.message}`); process.exitCode = 1; }
}
module.exports = { safeVersion, manifest, workflow, check };
