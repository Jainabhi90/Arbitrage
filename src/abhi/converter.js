function convertManifold(markets) {
  return markets.map(m => ({
    platform: "A",
    marketId: m.question.toLowerCase().replace(/\s+/g, '-').slice(0, 30),
    yesPrice: m.probability ?? 0.5,
    noPrice: m.probability ? +(1 - m.probability).toFixed(2) : 0.5,
    fees: 0.02,
    timestamp: Date.now()
  }))
}

function convertPolymarket(markets) {
  return markets.map(m => {
    const prices = JSON.parse(m.outcomePrices)  // convert string to real array

    return {
      platform: "B",
      marketId: m.question.toLowerCase().replace(/\s+/g, '-').slice(0, 30),
      yesPrice: parseFloat(prices[0]),
      noPrice: parseFloat(prices[1]),
      fees: 0.03,
      timestamp: Date.now()
    }
  })
}

module.exports = { convertManifold, convertPolymarket }