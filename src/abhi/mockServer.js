const http = require('http')
const { getMockPrices } = require('./mockPrices')
const { matchMarkets } = require('./eventMatcher')
const { detectArb } = require('./detectArb')

const server = http.createServer((req, res) => {

  // allow frontend to talk to this server
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json')

  if (req.url === '/opportunities') {
    const prices = getMockPrices()

    const platformAPrices = prices.filter(p => p.platform === "A")
    const platformBPrices = prices.filter(p => p.platform === "B")

    const pairs = matchMarkets(platformAPrices, platformBPrices)

    const opportunities = []

    for (const pair of pairs) {
      const result = detectArb(pair.marketA, pair.marketB)
      if (result) {
        opportunities.push(result)
      }
    }

    res.end(JSON.stringify(opportunities))
  }
})

server.listen(3000, () => {
  console.log('Mock server running at http://localhost:3000')
})