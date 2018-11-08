import logging
from datetime import datetime, timedelta

from django.contrib import messages
from django.shortcuts import render, redirect
from django.views.generic import View

from apps.portfolio.models.portfolio import Portfolio, ExchangeAccount, AllocationSnapshot
from apps.portfolio.services.trading import get_binance_portfolio_data


class AllocationsView(View):
    def dispatch(self, request, *args, **kwargs):
        self.portfolio = request.user.portfolio
        self.allocation_snapshot = self.portfolio.allocation_snapshots.first()

        if not self.allocation_snapshot:
            if not request.user.portfolio.exchange_accounts.first():
                messages.warning("Please setup your exchange details first.")
                return redirect("portfolio:exchange_setup")
            else:
                self.allocation_snapshot = self.portfolio.get_new_snapshot()
        elif self.allocation_snapshot.timestamp < (datetime.now() - timedelta(minutes=30)):
            self.allocation_snapshot = self.portfolio.get_new_snapshot()

        return super().dispatch(request, *args, **kwargs)

    def get(self, request):

        if not self.allocation_snapshot.realized_allocation:
            binance_data = get_binance_portfolio_data(self.portfolio.exchange_accounts.first())
            self.allocation_snapshot.realized_allocation = binance_data["allocations"]

        context = {
            "allocation_snapshot": self.allocation_snapshot,
        }

        return render(request, 'portfolio.html', context)


def merge_allocations(base_allocation, insert_allocation, key):
    portion_multiplier = float(base_allocation[key])

    for coin, portion in insert_allocation.items():
        if coin not in base_allocation:
            base_allocation[coin] = 0.0
        base_allocation[coin] += portion * portion_multiplier

    return base_allocation
