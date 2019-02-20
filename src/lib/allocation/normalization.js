module.exports = {
  normalize: packs => {
    let coinsSet = new Set();
    packs.forEach(pack => {
      pack.allocations.map(allocation => coinsSet.add(allocation.coin));
    });

    let coins = Array.from(coinsSet);

    let portfolio = {};
    coins.forEach(
      coin => (portfolio[coin] = { id: coin, portion: 0, overallocation: 0 })
    );

    packs.forEach(pack => {
      pack.allocations.forEach(allocation => {
        portfolio[allocation.coin].portion += allocation.portion * pack.weight;
      });
    });

    return Object.getOwnPropertyNames(portfolio).map(coin => portfolio[coin]);
  }
};
