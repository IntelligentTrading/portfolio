import json
import requests
import logging
from settings import ITF_TRADING_API_URL, ITF_TRADING_API_KEY, DEBUG


def get_binance_portfolio_data(binance_account):

    api_url_base = ITF_TRADING_API_URL
    api_url = api_url_base + "portfolio/"
    headers = {'Content-Type': 'application/json'}
    data = {
        "api_key": ITF_TRADING_API_KEY,
        "binance": {
            "api_key": binance_account.api_key,
            "secret_key": binance_account.secret_key
        }
    }

    if DEBUG:
        logging.debug(data)

    response = requests.post(api_url, json=data, headers=headers)

    logging.debug(response.text)

    if response.status_code == 200:
        data = response.json()
        return data['binance']


def set_binance_portfolio(binance_account, allocations):
    api_url_base = ITF_TRADING_API_URL
    api_url = api_url_base + "portfolio/"
    headers = {'Content-Type': 'application/json'}
    data = {
        "api_key": ITF_TRADING_API_KEY,
        "binance": {
            "api_key": binance_account.api_key,
            "secret_key": binance_account.secret_key,
            "type": "market",
            "allocations": json.dumps(allocations),
        }
    }

    if DEBUG:
        logging.debug(data)

    response = requests.put(api_url, json=data, headers=headers)
    logging.debug(response.text)

    if response.status_code == 200:
        data = response.json()
        return data
