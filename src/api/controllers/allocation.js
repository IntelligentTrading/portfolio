const allocationEngine = require('../../lib/allocation/allocation')
const normalizer = require('../../lib/allocation/normalization')
let portfolio = require('../../lib/portfolio/info')
const tradingClient = require('../trading/client')

const exchangesCtrl = require('./exchanges')

module.exports = {
  allocate: async (exchanges, packs) => {
    let promises = []
    exchanges.map(exchange => {
      promises.push(tradingClient.status(exchange))
    })

    promises.push(exchangesCtrl.currencies())

    return Promise.all(promises)
      .then(fulfillments => {
        const connectedExchanges = fulfillments
          .slice(0, exchanges.length)
          .filter(f => f != null)

        let total = 0
        connectedExchanges.forEach(x => {
          total += x.value
        })

        const supportedCoinsLists = fulfillments[exchanges.length]
        connectedExchanges.forEach(ce => {
          const idx = exchanges.findIndex(x => x.label === ce.exchange)
          if (idx >= 0) {
            exchanges[idx].supported = supportedCoinsLists[ce.exchange]
            exchanges[idx].weight = ce.value / total
          }
        })
      })
      .then(() => {
        let coins = normalizer.normalize(packs)
        let desired_allocations = allocationEngine.allocate(exchanges, coins)
        return Promise.resolve(desired_allocations)
      })
  },
  checkAllocations: desired_allocations => {
    return Promise.resolve(
      allocationEngine.checkCorrectness(
        desired_allocations,
        exchanges,
        portfolio.amount()
      )
    )
  }
}
