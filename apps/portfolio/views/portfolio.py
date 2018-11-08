from django.shortcuts import render
from django.views.generic import View

from apps.portfolio.models.portfolio import Portfolio
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
