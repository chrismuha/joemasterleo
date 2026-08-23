const { execFileSync } = require('node:child_process')

const base = String(process.env.CHANGE_SAFETY_BASE || process.argv[2] || '').trim()
const allowMarker = '[allow-dependency-regression]'
const failures = []

function git(args, options = {}) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options }).trim()
}

function readJsonAt(ref, file) {
  try { return JSON.parse(git(['show', `${ref}:${file}`])) } catch { return null }
}

function versionTuple(spec) {
  const match = String(spec || '').match(/(?:^|[^0-9])(\d+)\.(\d+)\.(\d+)(?:[-+]|$)/)
  return match ? match.slice(1).map(Number) : null
}

function compareVersions(before, after) {
  const a = versionTuple(before)
  const b = versionTuple(after)
  if (!a || !b) return 0
  for (let i = 0; i < 3; i += 1) {
    if (a[i] !== b[i]) return b[i] > a[i] ? 1 : -1
  }
  return 0
}

if (!base || /^0+$/.test(base)) {
  console.log('Change safety: no comparison base; static checks only.')
} else {
  try { git(['cat-file', '-e', `${base}^{commit}`]) } catch {
    console.error(`Change safety: base commit ${base} is unavailable. Checkout full history.`)
    process.exit(1)
  }

  const before = readJsonAt(base, 'package.json')
  const after = readJsonAt('HEAD', 'package.json')
  const message = git(['log', '--format=%B', `${base}..HEAD`])
  const explicitlyAllowed = message.includes(allowMarker)

  if (before && after && !explicitlyAllowed) {
    const sections = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']
    const oldLocation = new Map()
    for (const section of sections) {
      for (const [name, spec] of Object.entries(before[section] || {})) oldLocation.set(name, { section, spec })
    }
    const newLocation = new Map()
    for (const section of sections) {
      for (const [name, spec] of Object.entries(after[section] || {})) newLocation.set(name, { section, spec })
    }
    for (const [name, oldValue] of oldLocation) {
      const next = newLocation.get(name)
      if (!next) failures.push(`Dependency removed without approval: ${name} (${oldValue.section})`)
      else if (compareVersions(oldValue.spec, next.spec) < 0) failures.push(`Dependency downgraded: ${name} ${oldValue.spec} -> ${next.spec}`)
      else if (oldValue.section === 'dependencies' && next.section === 'devDependencies') failures.push(`Runtime dependency moved to development-only: ${name}`)
    }
  }

  const added = git(['diff', '--name-only', '--diff-filter=A', base, 'HEAD']).split('\n').filter(Boolean)
  const forbiddenPath = /(^|\/)(node_modules|dist|release|out|coverage)(\/|$)|(^|\/)(\.env(?!\.(example|sample)$)|id_rsa|id_ed25519)$|\.(pem|key|p12|pfx)$/i
  for (const file of added) {
    if (forbiddenPath.test(file)) failures.push(`Unsafe generated or sensitive file added: ${file}`)
    try {
      const size = Number(git(['cat-file', '-s', `HEAD:${file}`]))
      if (size > 10 * 1024 * 1024) failures.push(`Oversized file added (>10 MiB): ${file}`)
      const content = size <= 1024 * 1024 ? git(['show', `HEAD:${file}`]) : ''
      if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(content)) failures.push(`Private key material detected: ${file}`)
    } catch { /* Git will report malformed objects elsewhere. */ }
  }
}

if (failures.length) {
  console.error('\nChange safety checks failed:')
  for (const failure of [...new Set(failures)]) console.error(`- ${failure}`)
  console.error(`\nIf a dependency regression is intentional, explain it in the commit and include ${allowMarker}.`)
  process.exit(1)
}
console.log('Change safety checks passed.')

