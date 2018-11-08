import logging
from datetime import datetime, timedelta

from django.contrib import messages
from django.shortcuts import render, redirect
from django.views.generic import View

from apps.portfolio.forms import AllocationForm
from apps.portfolio.models.portfolio import Portfolio, ExchangeAccount, AllocationSnapshot
from apps.portfolio.services.trading import get_binance_portfolio_data


class AllocationsView(View):
    def dispatch(self, request, *args, **kwargs):
        self.allocation_snapshot = request.user.portfolio.allocation_snapshots.first()

        if not self.allocation_snapshot or self.allocation_snapshot.timestamp < (datetime.now() - timedelta(minutes=30)):
            if request.user.portfolio.exchange_accounts.first():
                self.allocation_snapshot = request.user.portfolio.exchange_accounts.first().get_new_snapshot()
            else:
                messages.warning("You setup your exchange details first.")
                redirect("portfolio:exchange_setup")

        return super().dispatch(request, *args, **kwargs)

    def get(self, request):

        context = {
            "allocation_snapshot": self.allocation_snapshot,
            "allocation_form": AllocationForm(instance=self.allocation_snapshot)
        }

        return render(request, 'portfolio.html', context)
