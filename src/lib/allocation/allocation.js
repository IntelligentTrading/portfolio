const mutil = require("../../api/util/math");

const TRADING_CURRENCY = { coin: "BTC", portion: 0.0001 };
const MIN_ALLOCATION = 0.0005;

function allocateExchange(allocations, exchange) {
  let total_space_required = 0;

  allocations.forEach(allocation => {
    total_space_required += exchange.supported.includes(allocation.coin)
      ? allocation.portion
      : 0;
  });

  // if a coin has used extra allocation we need:
  // 1. calculate the extra space with respect to the current exchange
  // 2. remove it from the current coin, divide it by the remaining coins - 1 and add it to the same coins

  for (i = 0; i < allocations.length; i++) {
    if (
      allocations[i].overallocation > 0 &&
      exchange.supported.includes(allocations[i].coin)
    ) {
      allocations[i].portion -= allocations[i].overallocation / exchange.weight;

      let percentage_redistribution =
        (allocations[i].overallocation * exchange.weight) /
        (exchange.supported.length - 1);

      for (j = 0; j < allocations.length; j++) {
        if (
          allocations[j].coin !== allocations[i].coin &&
          exchange.supported.includes(allocations[j].coin)
        )
          allocations[j].portion += percentage_redistribution;
      }

      allocations[i].overallocation = 0;
    }
  }

  let allocation = [];
  let average_additional_space =
    (1 - total_space_required) / exchange.supported.length;

  for (i = 0; i < allocations.length; i++) {
    let allocation_item = { ...allocations[i] };
    if (exchange.supported.includes(allocation_item.coin)) {
      allocation_item.portion += average_additional_space;
      allocation_item.overallocation =
        average_additional_space * exchange.weight;
      allocations[i].overallocation =
        average_additional_space * exchange.weight; // I have to track it
      allocation.push(allocation_item);
    } else allocation_item.portion = 0;
  }

  adjustTradingCurrencyAllocation(allocation);

  return allocation;
}

function allocate(exchanges, coins) {
  let desired_allocations = [];
  let allocable_coins = coins.filter(coin => coin.portion >= MIN_ALLOCATION);
  exchanges.forEach(exchange => {
    let allocation = allocateExchange(allocable_coins, exchange);
    desired_allocations.push({
      exchange: exchange.name,
      allocations: allocation
    });
  });
  return desired_allocations;
}

// let's set the 0.0001 BTC minimum
function adjustTradingCurrencyAllocation(allocations) {
  let free_allocation_space = 1;
  allocations.map(a => {
    free_allocation_space -= a.portion;
  });

  //let free_allocation_space = 1 - allocation_total;
  let initial_trading_currency_allocation = Object.assign({}, TRADING_CURRENCY);

  let tradingCurrencyIndex = allocations.findIndex(
    allocation => allocation.coin === TRADING_CURRENCY.coin
  );

  // BTC has not been allocated and there's enough space to just push it
  if (tradingCurrencyIndex < 0) {
    if (free_allocation_space < initial_trading_currency_allocation.portion) {
      allocations.sort((a1, a2) => a2.portion - a1.portion);
      allocations[0].portion -= mutil.down(
        initial_trading_currency_allocation.portion - free_allocation_space,
        4
      );
    } else {
      initial_trading_currency_allocation.portion = mutil.down(
        free_allocation_space,
        4
      );
    }
    allocations.push(initial_trading_currency_allocation);
  } else {
    allocations[tradingCurrencyIndex].portion = mutil.down(
      Math.max(
        allocations[tradingCurrencyIndex].portion,
        TRADING_CURRENCY.portion,
        free_allocation_space
      ),
      4
    );
  }
}

function checkCorrectness(desired_allocations, exchanges, AMOUNT) {
  let reallocated_amount = { total: { amount: 0, portion: 0 } };
  desired_allocations.forEach(exchange_allocation => {
    exchange_allocation.allocations.forEach(allocation => {
      reallocated_amount[allocation.coin] = { amount: 0 };
    });
  });

  desired_allocations.forEach(exchange_allocation => {
    exchange_allocation.allocations.forEach(allocation => {
      let coin_amount =
        AMOUNT *
        allocation.portion *
        exchanges.find(ex => ex.name == exchange_allocation.exchange).weight;

      reallocated_amount[allocation.coin].amount += coin_amount;
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

  let result = {
    allocations: reallocated_amount,
    checks: {
      overall_range_correct:
        reallocated_amount.total.portion >= 0.999 &&
        reallocated_amount.total.portion <= 1,
      trading_currency_present:
        reallocated_amount[TRADING_CURRENCY.coin] != null
    }
  };

  return result;
}

module.exports = {
  allocate: (exchanges, allocations) => allocate(exchanges, allocations),
  checkCorrectness: (allocations, exchanges, amount) =>
    checkCorrectness(allocations, exchanges, amount)
};
