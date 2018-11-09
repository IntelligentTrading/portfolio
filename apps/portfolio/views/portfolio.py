from datetime import timedelta, datetime

from django.contrib import messages
from django.shortcuts import render, redirect
from django.views.generic import View

from apps.portfolio.models.portfolio import Portfolio
from apps.portfolio.services.trading import get_binance_portfolio_data


class PortfolioView(View):
    def dispatch(self, request, *args, **kwargs):

        if not Portfolio.objects.filter(user=request.user):
            self.portfolio = Portfolio.objects.create(user=request.user)

        self.exchange_account = self.portfolio.exchange_accounts.first()

        if not self.exchange_account:
            messages.warning("Please setup your exchange details first.")
            redirect("portfolio:exchange_setup")
        elif not self.portfolio.allocations.first():
            self.allocation_object = self.portfolio.get_new_allocation_object()
        else:
            self.allocation_object = self.portfolio.allocations.first()

        if self.allocation_object.timestamp < (datetime.now() - timedelta(minutes=30)):
            self.allocation_object = self.portfolio.get_new_allocation_object()

        return super().dispatch(request, *args, **kwargs)

    def get(self, request):

        binance_data = get_binance_portfolio_data(self.exchange_account)
        # self.allocation_object.realized_allocation = binance_data["allocations"]
        # self.allocation_object.save()

        context = {
            "portfolio": self.portfolio,
            "allocations": binance_data["allocations"],
            "BTC_value": binance_data["value"],
        }

        return render(request, 'portfolio.html', context)
