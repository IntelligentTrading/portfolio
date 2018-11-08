import requests
from django.core.cache import cache


def get_signals_data():
    url = "itt-core-stage.herokuapp.com/api/v2/signals/?source=2&startdate=2018-11-7T17:00:0&page_size=1000&resample_period=240"

def get_BTC_price():
    BTC_price = cache.get("current_BTC_price")

    if not BTC_price:
        r = requests.get(ITF_API_URL + "/price/BTC")
        BTC_price = r.json()['price']
        cache.set("current_BTC_price", BTC_price, expires=60*10)

    return BTC_price
