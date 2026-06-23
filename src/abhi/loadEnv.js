const fs = require('fs')
const path = require('path')

let envLoaded = false

function parseEnvLine(line) {
  const trimmed = String(line || '').trim()
  if (!trimmed || trimmed.startsWith('#')) {
    return null
  }

  const withoutExport = trimmed.startsWith('export ')
    ? trimmed.slice(7).trim()
    : trimmed

  const equalsIndex = withoutExport.indexOf('=')
  if (equalsIndex === -1) {
    return null
  }

  const key = withoutExport.slice(0, equalsIndex).trim()
  if (!key) {
    return null
  }

  let value = withoutExport.slice(equalsIndex + 1).trim()
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1)
  }

  value = value
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')

  return { key, value }
}

function loadEnv(envPath = path.resolve(__dirname, '..', '..', '.env')) {
  if (envLoaded) {
    return process.env
  }

  envLoaded = true

  if (!fs.existsSync(envPath)) {
    return process.env
  }

  const raw = fs.readFileSync(envPath, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const parsed = parseEnvLine(line)
    if (!parsed) {
      continue
    }

    if (process.env[parsed.key] === undefined) {
      process.env[parsed.key] = parsed.value
    }
  }

  return process.env
}

module.exports = {
  loadEnv
}
