import logging

from django.shortcuts import render, redirect
from django.views.generic import View

from apps.portfolio.forms import ExchangeAccountForm
from apps.portfolio.models.portfolio import Portfolio, ExchangeAccount
from apps.portfolio.services.trading import get_binance_portfolio_data


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


class ExchangeSetupView(View):
    def dispatch(self, request, *args, **kwargs):
        self.exchange_account = request.user.portfolio.exchange_accounts.first()
        return super().dispatch(request, *args, **kwargs)

    def get(self, request):

        context = {
            "exchange_account": self.exchange_account,
            "exchange_setup_form": ExchangeAccountForm(instance=self.exchange_account)
        }
        return render(request, 'exchange_setup.html', context)

    def post(self, request):
        if not self.exchange_account:
            self.exchange_account = ExchangeAccount()

        self.exchange_account.api_key = request.POST.get("api_key")
        self.exchange_account.secret_key = request.POST.get("secret_key")

        return redirect('portfolio:dashboard')