module.exports = {
  status: (api_key, exchangeAccount) => {
    // decrypt exchangeAccount credentials with pvt key

    const enabledExchanges = {
      binance: {
        value: 2.53439324,
        allocations: [
          {
            coin: "BTC",
            amount: 1.42321311,
            portion: 0.4999
          },
          {
            coin: "BNB",
            amount: 22.12932881,
            portion: 0.30
          },{
            coin: "LTC",
            amount: 200,
            portion: 0.1
          },{
            coin: "ADA",
            amount: 1450,
            portion: 0.1
          }
        ]
      },
      coinbase: {
        value: 0.314,
        allocations: [
          {
            coin: "LTC",
            amount: 42,
            portion: 1
          }
        ]
      }
    };

    let result = { exchange: exchangeAccount.label };
    result["data"] = enabledExchanges[exchangeAccount.label.toLowerCase()];

    return Promise.resolve(result);
  }
};