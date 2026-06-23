const { getActiveChatIds } = require('./adding.js')
const { loadEnv } = require('../loadEnv')

loadEnv()

function getTelegramToken() {
  return String(process.env.TELEGRAM_BOT_TOKEN || '').trim()
}

function normalizeChatId(chatId) {
  return String(chatId ?? '').trim()
}

function normalizeText(text) {
  const value = String(text ?? '').trim()
  return value.length > 3900 ? `${value.slice(0, 3900)}…` : value
}

function formatOpportunityLine(opportunity, index) {
  const market = String(opportunity?.market || opportunity?.short || 'market').trim()
  const profitPct = Number(opportunity?.profit || 0) * 100
  const yesPrice = Number(opportunity?.yesPrice || 0)
  const noPrice = Number(opportunity?.noPrice || 0)
  const total = Number(opportunity?.total || 0)
  const platformA = String(opportunity?.platformA || 'A').toUpperCase()
  const platformB = String(opportunity?.platformB || 'B').toUpperCase()

  return [
    `${index + 1}. ${market}`,
    `Edge: +${profitPct.toFixed(2)}%`,
    `YES(${platformA}): ${yesPrice.toFixed(2)} | NO(${platformB}): ${noPrice.toFixed(2)} | Total: ${total.toFixed(2)}`
  ].join('\n')
}

function formatArbitrageMessage(opportunities, meta = {}) {
  const items = Array.isArray(opportunities) ? opportunities.filter(Boolean) : []
  const header = meta.topic ? `Arbitrage alert for ${meta.topic}` : 'Arbitrage alert'
  const scannedAt = meta.scannedAt ? `Scanned at: ${meta.scannedAt}` : null

  if (!items.length) {
    return normalizeText([
      header,
      scannedAt,
      '',
      'No live opportunities right now.'
    ].filter(Boolean).join('\n'))
  }

  const topItems = items.slice(0, 5)
  const lines = [
    header,
    scannedAt,
    `Top ${topItems.length} ${topItems.length === 1 ? 'opportunity' : 'opportunities'}`
  ].filter(Boolean)

  topItems.forEach((opportunity, index) => {
    lines.push('')
    lines.push(formatOpportunityLine(opportunity, index))
    if (opportunity?.expiresAt || opportunity?.timeToExpiryLabel) {
      const expiryText = opportunity.timeToExpiryLabel
        || `Expires: ${new Date(opportunity.expiresAt).toLocaleString()}`
      lines.push(expiryText)
    }
  })

  return normalizeText(lines.join('\n'))
}

async function sendTelegramDirect(chatId, text) {
  const token = getTelegramToken()
  const normalizedChatId = normalizeChatId(chatId)
  const message = normalizeText(text)

  if (!token) {
    return { ok: false, skipped: true, reason: 'Missing TELEGRAM_BOT_TOKEN' }
  }

  if (!normalizedChatId) {
    return { ok: false, skipped: true, reason: 'Missing chat id' }
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: normalizedChatId,
      text: message,
      disable_web_page_preview: true
    })
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok || payload.ok === false) {
    return {
      ok: false,
      chatId: normalizedChatId,
      status: response.status,
      error: payload.description || `Telegram sendMessage failed (${response.status})`
    }
  }

  return {
    ok: true,
    chatId: normalizedChatId,
    result: payload.result || null
  }
}

async function sendTelegramBroadcast(text, chatIds = getActiveChatIds()) {
  const recipients = Array.isArray(chatIds) ? chatIds : [chatIds]
  const uniqueRecipients = [...new Set(recipients.map(normalizeChatId).filter(Boolean))]

  if (!uniqueRecipients.length) {
    return { ok: false, skipped: true, reason: 'No Telegram subscribers' }
  }

  const results = await Promise.allSettled(
    uniqueRecipients.map(chatId => sendTelegramDirect(chatId, text))
  )

  const summary = {
    ok: false,
    sent: 0,
    failed: 0,
    total: uniqueRecipients.length,
    results: []
  }

  for (const result of results) {
    if (result.status === 'fulfilled') {
      summary.results.push(result.value)
      if (result.value?.ok) {
        summary.sent += 1
      } else {
        summary.failed += 1
      }
      continue
    }

    summary.failed += 1
    summary.results.push({
      ok: false,
      error: result.reason?.message || String(result.reason || 'Unknown Telegram error')
    })
  }

  summary.ok = summary.sent > 0
  return summary
}

module.exports = {
  sendTelegramDirect,
  sendTelegramBroadcast,
  formatArbitrageMessage
}
