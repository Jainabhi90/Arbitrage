const http = require('http')
const { fetchManifoldMarkets } = require('./first')
const { fetchPolyMarkets } = require('./second')
const { convertManifold, convertPolymarket } = require('./converter')
const { matchMarkets } = require('./eventMatcher')
const { detectArb } = require('./detectArb')

// memory store - latest results live here
let latestOpportunities = []
let lastScanned = null

async function scanMarkets() {
  try {
    console.log('Scanning markets...')

    const manifoldRaw = await fetchManifoldMarkets()
    const polyRaw = await fetchPolyMarkets()

    const platformA = convertManifold(manifoldRaw)
    const platformB = convertPolymarket(polyRaw)

    const pairs = matchMarkets(platformA, platformB)

    const opportunities = []

    for (const pair of pairs) {
      const result = detectArb(pair.marketA, pair.marketB)
      if (result) {
        opportunities.push(result)
        console.log(`ARB FOUND: ${result.market} → +${(result.profit * 100).toFixed(2)}%`)
      }
    }

    latestOpportunities = opportunities
    lastScanned = new Date().toLocaleTimeString()
    console.log(`Scan complete. ${pairs.length} pairs checked. ${opportunities.length} arb found.`)

  } catch (err) {
    console.error('Scan error:', err.message)
  }
}

// run immediately then every 5 seconds
scanMarkets()
setInterval(scanMarkets, 5000)

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json')

  if (req.url === '/opportunities') {
    res.end(JSON.stringify({
      opportunities: latestOpportunities,
      lastScanned,
      totalPairs: 7
    }))
  }
})

server.listen(3000, () => {
  console.log('Scanner running at http://localhost:3000')
})