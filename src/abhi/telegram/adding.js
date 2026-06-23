const arr = []

function normalizeChatId(chatid) {
  return String(chatid ?? '').trim()
}

function normalizeStatus(status) {
  return String(status ?? '').trim().toLowerCase()
}

function add(chatid, status = 'start') {
  const normalizedChatId = normalizeChatId(chatid)
  if (!normalizedChatId) {
    return null
  }

  const normalizedStatus = normalizeStatus(status) || 'start'
  const nextRecord = {
    chatid: normalizedChatId,
    status: normalizedStatus === '/start' ? 'start' : normalizedStatus
  }

  const existing = arr.find(user => user.chatid === normalizedChatId)
  if (existing) {
    existing.status = nextRecord.status
    return existing
  }

  arr.push(nextRecord)
  return nextRecord
}

function remove(chatid) {
  const normalizedChatId = normalizeChatId(chatid)
  if (!normalizedChatId) {
    return false
  }

  const index = arr.findIndex(user => user.chatid === normalizedChatId)
  if (index === -1) {
    return false
  }

  arr.splice(index, 1)
  return true
}

function isActive(chatid) {
  const normalizedChatId = normalizeChatId(chatid)
  return arr.some(user => user.chatid === normalizedChatId && user.status === 'start')
}

function getActiveChatIds() {
  return arr
    .filter(user => user.status === 'start')
    .map(user => user.chatid)
}

module.exports = {
  arr,
  add,
  remove,
  isActive,
  getActiveChatIds
}
