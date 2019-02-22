module.exports = {
  normalize: packs => {
    let allocationSet = new Set();
    packs.forEach(pack => {
      pack.allocations.map(allocation => allocationSet.add(allocation.coin));
    });

    let allocation = Array.from(allocationSet);

    let portfolio = {};
    allocation.forEach(
      coin => (portfolio[coin] = { coin: coin, portion: 0, overallocation: 0 })
    );

    packs.forEach(pack => {
      pack.allocations.forEach(allocation => {
        portfolio[allocation.coin].portion += allocation.portion * pack.weight;
      });
    });

    return Object.getOwnPropertyNames(portfolio).map(coin => portfolio[coin]);
  }
};
