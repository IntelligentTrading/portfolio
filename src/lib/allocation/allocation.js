const TRADING_CURRENCY = { id: "BTC", portion: 0.01 };

function allocateExchange(coins, exchange) {
  let total_space_required = 0;

  coins.forEach(item => {
    total_space_required += exchange.supported.includes(item.id)
      ? item.portion
      : 0;
  });

  // if a coin has used extra allocation we need:
  // 1. calculate the extra space with respect to the current exchange
  // 2. remove it from the current coin, divide it by the remaining coins - 1 and add it to the same coins

  for (i = 0; i < coins.length; i++) {
    if (
      coins[i].overallocation > 0 &&
      exchange.supported.includes(coins[i].id)
    ) {
      coins[i].portion -= coins[i].overallocation / exchange.weight;

      let percentage_redistribution =
        (coins[i].overallocation * exchange.weight) /
        (exchange.supported.length - 1);

      for (j = 0; j < coins.length; j++) {
        if (
          coins[j].id !== coins[i].id &&
          exchange.supported.includes(coins[j].id)
        )
          coins[j].portion += percentage_redistribution;
      }

      coins[i].overallocation = 0;
    }
  }

  let allocation = [];
  let average_additional_space =
    (1 - total_space_required) / exchange.supported.length;

  for (i = 0; i < coins.length; i++) {
    let allocation_item = { ...coins[i] };
    if (exchange.supported.includes(allocation_item.id)) {
      allocation_item.portion += average_additional_space;
      allocation_item.overallocation =
        average_additional_space * exchange.weight;
      coins[i].overallocation = average_additional_space * exchange.weight; // I have to track it
      allocation.push(allocation_item);
    } else allocation_item.portion = 0;
  }

  adjustTradingCurrencyAllocation(allocation);

  return allocation;
}

function allocate(exchanges, coins) {
  let desired_allocations = [];
  exchanges.forEach(exchange => {
    let allocation = allocateExchange(coins, exchange);
    desired_allocations.push({
      exchange: exchange.name,
      allocations: allocation
    });
  });
  return desired_allocations;
}

// let's set the 0.0001 BTC minimum
function adjustTradingCurrencyAllocation(allocation) {
  
  let free_allocation_space = 1;
  allocation.map(a => {
    free_allocation_space -= a.portion;
  });

  //let free_allocation_space = 1 - allocation_total;
  let initial_trading_currency_allocation = Object.assign({}, TRADING_CURRENCY);

  let tradingCurrencyIndex = allocation.findIndex(
    coin => coin.id === TRADING_CURRENCY.id
  );

  // BTC has not been allocated and there's enough space to just push it
  if (tradingCurrencyIndex < 0) {
    if (free_allocation_space < initial_trading_currency_allocation.portion) {
      allocation.sort((c1, c2) => c2.portion - c1.portion);
      allocation[0].portion -= Math.fround(
        initial_trading_currency_allocation.portion - free_allocation_space
      );
    } else {
      initial_trading_currency_allocation.portion = Math.fround(
        free_allocation_space
      );
    }
    allocation.push(initial_trading_currency_allocation);
  } else {
    allocation[tradingCurrencyIndex].portion = Math.fround(
      Math.max(
        allocation[tradingCurrencyIndex].portion,
        TRADING_CURRENCY.portion,
        free_allocation_space
      )
    );
  }
}

function checkCorrectness(desired_allocations, exchanges, AMOUNT) {
  let reallocated_amount = { total: { amount: 0, portion: 0 } };
  desired_allocations.forEach(exchange_allocation => {
    exchange_allocation.allocations.forEach(allocation => {
      reallocated_amount[allocation.id] = { amount: 0 };
    });
  });

  desired_allocations.forEach(exchange_allocation => {
    exchange_allocation.allocations.forEach(allocation => {
      let coin_amount =
        AMOUNT *
        allocation.portion *
        exchanges.find(ex => ex.name == exchange_allocation.exchange).weight;

      reallocated_amount[allocation.id].amount += coin_amount;
      reallocated_amount.total.amount += coin_amount;
    });
  });

  Object.getOwnPropertyNames(reallocated_amount).forEach(coin => {
    if (coin != "total") {
      reallocated_amount[coin].portion =
        reallocated_amount[coin].amount / AMOUNT;
      reallocated_amount.total.portion += reallocated_amount[coin].portion;
    }
  });
  return reallocated_amount;
}

module.exports = {
  allocate: (exchanges, coins) => allocate(exchanges, coins),
  checkCorrectness: (allocations, exchanges, amount) =>
    checkCorrectness(allocations, exchanges, amount)
};
