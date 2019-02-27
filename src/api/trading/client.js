module.exports = {
  status: (api_key, exchangeAccount) => {
    // decrypt exchangeAccount credentials with pvt key

    const enabledExchanges = [
      {
        binance: {
          value: 2.53439324,
          allocations: [
            {
              coin: "ETH",
              amount: 231.12321311,
              portion: 0.4999
            },
            {
              coin: "BCC",
              amount: 22.12932881,
              portion: 0.4999
            }
          ]
        }
      }
    ];

    return Promise.resolve(
      enabledExchanges.find(x =>
        Object.getOwnPropertyNames(x).includes(exchangeAccount.label)
      )
    );
  }
};
