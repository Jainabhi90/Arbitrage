const express = require('express')
const { loadEnv } = require('../loadEnv')
const { add, remove, getActiveChatIds } = require('./adding')
const { sendTelegramDirect } = require('./sending')

loadEnv()

function extractMessage(update) {
  return update?.message || update?.edited_message || update?.channel_post || null
}

async function processTelegramUpdate(update) {
  const message = extractMessage(update)
  if (!message?.chat?.id) {
    return { handled: false, reason: 'missing-chat' }
  }

  const chatId = String(message.chat.id)
  const text = String(message.text || '').trim()

  if (/^\/start\b/i.test(text) || /^start\b/i.test(text)) {
    add(chatId, 'start')
    await sendTelegramDirect(chatId, 'Subscribed. I will send arbitrage alerts here.')
    return { handled: true, action: 'subscribed', chatId }
  }

  if (/^\/stop\b/i.test(text) || /^\/unsubscribe\b/i.test(text)) {
    remove(chatId)
    await sendTelegramDirect(chatId, 'Unsubscribed. Send /start if you want alerts again.')
    return { handled: true, action: 'unsubscribed', chatId }
  }

  if (/^\/help\b/i.test(text) || /^\/status\b/i.test(text)) {
    const activeCount = getActiveChatIds().length
    await sendTelegramDirect(
      chatId,
      `Telegram alerts are live. Active subscribers: ${activeCount}. Send /start to subscribe or /stop to unsubscribe.`
    )
    return { handled: true, action: 'help', chatId }
  }

  return { handled: false, action: 'ignored', chatId }
}

function createTelegramApp() {
  const app = express()

  app.use(express.json({ limit: '1mb' }))

  app.get('/', (req, res) => {
    res.json({
      ok: true,
      service: 'telegram-webhook'
    })
  })

  app.post('/telegram/webhook', async (req, res) => {
    try {
      await processTelegramUpdate(req.body || {})
    } catch (error) {
      console.error('Telegram webhook error:', error.message)
    }

    res.sendStatus(200)
  })

  return app
}

module.exports = {
  createTelegramApp,
  processTelegramUpdate
}

if (require.main === module) {
  const port = Number(process.env.TELEGRAM_PORT || 3001)
  const app = createTelegramApp()

  app.listen(port, () => {
    console.log(`Telegram webhook listening at http://localhost:${port}`)
  })
}
