const allocationEngine = require("../../lib/allocation/allocation");
const normalizer = require("../../lib/allocation/normalization");
let portfolio = require("../../lib/portfolio/info");
const tradingClient = require("../trading/client");

module.exports = {
  allocate: (exchanges, packs) => {
    let promises = [];
    exchanges.map(exchange => {
      promises.push(tradingClient.status("trading_api_key", exchange));
    });

    promises.push(
      Promise.resolve({
        binance: ["BTC", "ETH", "XRP"],
        coinbase: ["BTC", "ETH", "LTC"]
      })
    );

    return Promise.all(promises)
      .then(fulfillments => {
        const connectedExchanges = fulfillments.slice(
          0,
          fulfillments.length - 2
        );

        let total = 0;
        connectedExchanges.forEach(x => {
          total += x[Object.getOwnPropertyNames(x)[0]].value;
        });

        const supportedCoinsLists = fulfillments[fulfillments.length - 1];
        connectedExchanges.forEach(exchange => {
          const exchangeLabel = Object.getOwnPropertyNames(exchange)[0];
          const idx = exchanges.findIndex(x => x.label === exchangeLabel);
          if (idx >= 0) {
            exchanges[idx].supported = supportedCoinsLists[exchangeLabel];
            exchanges[idx].weight = exchange[exchangeLabel].value / total;
          }
        });
      })
      .then(() => {
        let coins = normalizer.normalize(packs);
        let desired_allocations = allocationEngine.allocate(
          exchanges.filter(x => x.supported && x.supported.length > 0),
          coins
        );
        return Promise.resolve(desired_allocations);
      });
  },
  checkAllocations: desired_allocations => {
    return Promise.resolve(
      allocationEngine.checkCorrectness(
        desired_allocations,
        exchanges,
        portfolio.amount()
      )
    );
  }
};
