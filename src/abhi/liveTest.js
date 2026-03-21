const { fetchManifoldMarkets } = require('./first')
const { fetchPolyMarkets } = require('./second')
const { convertManifold, convertPolymarket } = require('./converter')
const { matchMarkets } = require('./eventMatcher')
const { detectArb } = require('./detectArb')

async function runLiveTest() {
  console.log("Fetching from real APIs...")

  const manifoldRaw = await fetchManifoldMarkets()
  const polyRaw = await fetchPolyMarkets()

  console.log(`Manifold: ${manifoldRaw.length} markets`)
  console.log(`Polymarket: ${polyRaw.length} markets`)

  const platformA = convertManifold(manifoldRaw)
  const platformB = convertPolymarket(polyRaw)

  console.log("\nPlatform A sample:", platformA[0])
  console.log("Platform B sample:", platformB[0])

  const pairs = matchMarkets(platformA, platformB)
  console.log(`\nMatched pairs: ${pairs.length}`)

  for (const pair of pairs) {
    const result = detectArb(pair.marketA, pair.marketB)
    if (result) {
      console.log("\nARB FOUND!")
      console.log(result)
    } else {
      console.log(`No arb: ${pair.marketA.marketId}`)
    }
  }
}

runLiveTest()
