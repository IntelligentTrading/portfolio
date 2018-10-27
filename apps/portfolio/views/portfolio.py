import logging

from django.shortcuts import render
from django.views.generic import View
import json
import requests

from apps.portfolio.models.portfolio import Portfolio
from settings import ITF_TRADING_API_URL, ITF_TRADING_API_KEY


class PortfolioView(View):
    def dispatch(self, request, *args, **kwargs):

        if not Portfolio.objects.filter(user=request.user):
            Portfolio.objects.create(user=request.user)

        return super().dispatch(request, *args, **kwargs)


    def get(self, request):

        binance_account = request.user.portfolio.exchange_accounts.first()
        binance_data = get_binance_portfolio_data(binance_account)

        context = {
            # "portfolio": request.user.portfolio,
            "allocations": binance_data["allocations"],
            "BTC_value": binance_data["value"],
        }

        return render(request, 'portfolio.html', context)



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

    logging.debug(data)

    response = requests.post(api_url, json=data, headers=headers)

    logging.debug(response.text)

    if response.status_code == 200:
        data = response.json()
        return data['binance']
