const allocationEngine = require('../../lib/allocation/allocation')
const normalizer = require('../../lib/allocation/normalization')
let portfolio = require('../../lib/portfolio/info')
const tradingClient = require('../trading/client')

const exchangesCtrl = require('./exchanges')

module.exports = {
  // user potentially connected exchanges
  allocate: async (exchanges, packs) => {
    let promises = []
    exchanges.map(exchange => {
      promises.push(tradingClient.status(exchange))
    })

    promises.push(exchangesCtrl.currencies())

    return Promise.all(promises)
      .then(fulfillments => {
        // user connected exchanges ie with a status
        const connectedExchanges = []
        fulfillments
          .slice(0, exchanges.length)
          .filter(f => f != null)
          .map(connectedExchange => {
            connectedExchanges.push(new ConfiguredExchange(connectedExchange))
          })

        let total = 0
        connectedExchanges.forEach(x => {
          total += x.value
        })

        const supportedCoinsLists = fulfillments[exchanges.length]
        connectedExchanges.forEach(ce => {
          ce.supportedCoins = supportedCoinsLists[ce.label]
          ce.weight = ce.weight / total
        })

        return connectedExchanges
      })
      .then(connectedExchanges => {
        let coins = normalizer.normalize(packs)
        let desired_allocations = allocationEngine.allocate(
          connectedExchanges,
          coins
        )
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

class ConfiguredExchange {
  constructor (exchangeObject) {
    const properties = Object.getOwnPropertyNames(exchangeObject)
    if (properties.length > 0) {
      this.label = properties[0]
      this.value = exchangeObject[this.label].value
      this.allocations = exchangeObject[this.label].allocations
      this.supportedCoins = []
      this.weight = 0
    }
  }

  supports (coin) {
    return this.supportedCoins[coin] != null
  }

  supportedCoinsLength () {
    return Object.getOwnPropertyNames(this.supportedCoins).length
  }
}
