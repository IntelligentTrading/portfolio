from copy import deepcopy

from django.contrib import messages
from django.shortcuts import render, redirect
from django.views.generic import View

from apps.portfolio.services.binance import binance_coins


class AllocationsView(View):
    def dispatch(self, request, *args, **kwargs):
        self.portfolio = request.user.portfolio
        self.allocation_object = self.portfolio.allocations.first()

        if not self.allocation_object:
            if not request.user.portfolio.exchange_accounts.first():
                messages.warning("Please setup your exchange details first.")
                return redirect("portfolio:exchange_setup")
            else:
                self.allocation_object = self.portfolio.get_new_allocation_object()
        elif self.allocation_object.is_over_20min_old:
            self.allocation_object = self.portfolio.get_new_allocation_object()

        return super().dispatch(request, *args, **kwargs)

    def get(self, request):
        if not len(self.allocation_object.target_allocation):
            self.allocation_object.target_allocation = self.allocation_object.realized_allocation

        target_allocation_expanded = [
            {"coin": alloc["coin"], "portion": alloc["portion"]*100 // 0.01 / 100}
            for alloc in self.allocation_object.target_allocation
        ]

        target_coin_list = [alloc['coin'] for alloc in target_allocation_expanded]

        for coin in binance_coins:
            if coin not in target_coin_list:
                target_allocation_expanded.append({
                    "coin": coin,
                    "portion": 0.0
                })

        context = {
            "allocation_object": self.allocation_object,
            "target_allocation_expanded": target_allocation_expanded,
            "binance_coins": binance_coins
        }

        return render(request, 'allocations.html', context)


def merge_allocations(base_allocation, insert_allocation, key):
    portion_multiplier = float(base_allocation[key])

    for coin, portion in insert_allocation.items():
        if coin not in base_allocation:
            base_allocation[coin] = 0.0
        base_allocation[coin] += portion * portion_multiplier

    return base_allocation
