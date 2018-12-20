import logging
from copy import deepcopy

import requests
from datetime import datetime, timedelta
from django.core.cache import cache

from apps.common.utilities.multithreading import start_new_thread
from settings import ITF_CORE_API_URL, ITF_CORE_API_KEY

(SHORT_HORIZON, MEDIUM_HORIZON, LONG_HORIZON) = list(range(3))
(POLONIEX, BITTREX, BINANCE, BITFINEX, KUCOIN, GDAX, HITBTC) = list(range(7))


def get_BTC_price():
    BTC_price = cache.get("current_BTC_price")
    if not BTC_price:
        fix_missing_BTC_price_in_cache()
        from apps.portfolio.models import Allocation
        # last resort, steal from the most recent known one
        allocation_object = Allocation.objects.filter(BTC_price__isnull=False).first()
        BTC_price = allocation_object.BTC_price if allocation_object else None

    return int(BTC_price) if BTC_price else None

@start_new_thread
def fix_missing_BTC_price_in_cache():
    BTC_price = None
    for i in range(3):
        if BTC_price: continue
        url = ITF_CORE_API_URL + "v2/prices/BTC"
        r = requests.get(url, headers={"API-KEY": ITF_CORE_API_KEY})
        try:
            BTC_price = int(r.json()['results'][0]['price'])
            assert BTC_price > 10 ** 11
            cache.set("current_BTC_price", BTC_price, 60 * 10)
        except:
            pass

def get_allocations_from_signals(horizon="all", at_datetime=None):
    now_datetime = at_datetime or datetime.now()
    BTC_minimum_reserve = 0.0090
    BNB_minimum_reserve = 0.0010


    horizon_periods = {
        SHORT_HORIZON: 1,
        MEDIUM_HORIZON: 6,
        LONG_HORIZON: 24,
    }
    horizon_life_spans = {
        SHORT_HORIZON: 6,
        MEDIUM_HORIZON: 6,
        LONG_HORIZON: 6,
    }
    horizon_weights = {
        SHORT_HORIZON: 1,
        MEDIUM_HORIZON: 1,
        LONG_HORIZON: 1,
    }

    url = ITF_CORE_API_URL + "v2/signals/"

    signals = []
    source = BINANCE

    if horizon == "all":
        horizons = [SHORT_HORIZON, MEDIUM_HORIZON, LONG_HORIZON]
    else:
        assert horizon in [SHORT_HORIZON, MEDIUM_HORIZON, LONG_HORIZON]
        horizons = [horizon,]

    for horizon in horizons:
        search_startdate = datetime.now() - timedelta(hours=(
                horizon_periods[horizon] * horizon_life_spans[horizon]
        ))
        r = requests.get(
            url, headers={"API-KEY": ITF_CORE_API_KEY},
            params={
                "horizon": horizon,
                "source": source,
                "startdate": search_startdate.strftime('%Y-%m-%dT%H:%M:%S'),
                "page_size": 1000,
                "resample_period": 240,  # todo: bug here (blame Karla)
            })
        signals += r.json()["results"]

    tickers_dict = {
        "BTC_USDT": {
            "coin": "BTC",
            "vote": 0,
            "portion": BTC_minimum_reserve,  # hold by default
        },
        "BNB_BTC": {
            "coin": "BNB",
            "vote": 0,
            "portion": BNB_minimum_reserve,  # hold by default
        }
    }

    for signal in signals:
        transaction_currency = str(signal['transaction_currency'])
        if source == BINANCE:
            transaction_currency = "BCC" if transaction_currency == "BCH" else transaction_currency
        counter_currency = str(get_counter_currency_name(signal['counter_currency']))
        timestamp = datetime.strptime(signal['timestamp'], '%Y-%m-%dT%H:%M:%S')

        ticker = f"{transaction_currency}_{counter_currency}"
        if ticker not in tickers_dict:
            tickers_dict[ticker] = {
                "coin": transaction_currency,
                "vote": 0.0,
                "portion": 0.0,
            }

        time_weight = float(1) - (
                (now_datetime - timestamp).total_seconds() / (
                timedelta(hours=1) * horizon_periods[signal["horizon"]] *
                horizon_life_spans[signal["horizon"]]).total_seconds())

        vote = float(signal["trend"]) * horizon_weights[signal["horizon"]] * time_weight
        tickers_dict[ticker]["vote"] += vote


    # Remove tickers with negative votes
    for ticker, data in deepcopy(tickers_dict).items():
        if data["vote"] <= 0.01:
            del tickers_dict[ticker]

    votes_sum = sum([data["vote"] for ticker, data in tickers_dict.items()])
    logging.debug("First SUM of votes: " + str(votes_sum))

    # Remove tickers with low votes
    for ticker, data in deepcopy(tickers_dict).items():
        if data["vote"]/votes_sum <= 0.001:
            del tickers_dict[ticker]

    votes_sum = sum([data["vote"] for ticker, data in tickers_dict.items()])
    logging.debug("New SUM of votes: " + str(votes_sum))

    for ticker, data in deepcopy(tickers_dict).items():
        tickers_dict[ticker]["portion"] += (data["vote"] / votes_sum) // 0.0001 * 0.0001
        if tickers_dict[ticker]["portion"] < 0.0010:
            del tickers_dict[ticker]

    allocations_sum = sum([data["portion"] for ticker, data in tickers_dict.items()])
    logging.debug(f"preliminary SUM of allocations: {round(allocations_sum*100,3)}%")

    allocations_dict = {}
    for ticker, data in tickers_dict.items():
        if not data["coin"] in allocations_dict:
            allocations_dict[data["coin"]] = 0
        allocations_dict[data["coin"]] += data["portion"]

    allocations_dict["BNB"] = max([BNB_minimum_reserve, allocations_dict.get("BNB", 0)])
    allocations_dict["BTC"] = max([BTC_minimum_reserve, (0.9999 - BNB_minimum_reserve - allocations_sum + allocations_dict.get("BTC", 0))])

    allocations_list = [{"coin": coin, "portion": (portion // 0.0001 / 10000)} for coin, portion in allocations_dict.items()]
    logging.debug(f'Final SUM of allocations: {round(sum([a["portion"] for a in allocations_list])*100,3)}%')

    return allocations_list



def get_counter_currency_name(counter_currency_index):
    (BTC, ETH, USDT, XMR) = list(range(4))
    COUNTER_CURRENCY_CHOICES = (
        (BTC, 'BTC'),
        (ETH, 'ETH'),
        (USDT, 'USDT'),
        (XMR, 'XMR'),
    )
    return next((cc_name for index, cc_name in COUNTER_CURRENCY_CHOICES if index == counter_currency_index), None)
