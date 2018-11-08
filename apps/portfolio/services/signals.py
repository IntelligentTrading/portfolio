import requests
from datetime import datetime, timedelta
from django.core.cache import cache

from apps.portfolio.models import AllocationSnapshot
from settings import ITF_CORE_API_URL, ITF_CORE_API_KEY


def get_signals_data():
    url = ITF_CORE_API_URL + "v2/signals/" # + "?source=2&startdate=2018-11-7T17:00:0&page_size=1000&resample_period=240"
    r = requests.get(
        url, headers={"API-KEY": ITF_CORE_API_KEY},
        params={
            "source": 2,
            "startdate": (datetime.now() - timedelta(minutes=6*240)).strftime('%Y/%m/%dT%H:%M:%S'),
            "page_size": 1000,
            "resample_period": 240
        })


def get_BTC_price():
    BTC_price = int(cache.get("current_BTC_price"))

    if not BTC_price:
        url = ITF_CORE_API_URL + "v2/prices/BTC"
        r = requests.get(url, headers={"API-KEY": ITF_CORE_API_KEY})
        try:
            BTC_price = int(r.json()['results'][0]['price'])
            assert BTC_price > 10 ** 11
            cache.set("current_BTC_price", BTC_price, 60*10)
        except:
            # last resort, steal from the most recent known one
            BTC_price = AllocationSnapshot.objects.first().BTC_price

    return BTC_price
