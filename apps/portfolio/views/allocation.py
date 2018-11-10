from copy import deepcopy

from django.contrib import messages
from django.shortcuts import render, redirect
from django.views.generic import View

from apps.portfolio.models.allocation import ITF_PACKS
from apps.portfolio.services.binance import binance_coins


class AllocationsView(View):
    def dispatch(self, request, *args, **kwargs):
        self.portfolio = request.user.portfolio
        self.allocation_object = self.portfolio.allocations.first()

        if not self.allocation_object:
            if not request.user.portfolio.exchange_accounts.first():
                messages.warning(request, "Please setup your exchange details first.")
                return redirect("portfolio:exchange_account")
            else:
                self.allocation_object = self.portfolio.get_new_allocation_object()
        elif self.allocation_object.is_old:
            self.allocation_object = self.portfolio.get_new_allocation_object()

        return super().dispatch(request, *args, **kwargs)

    def get(self, request):
        if not len(self.allocation_object.target_allocation):
            self.allocation_object.target_allocation = self.allocation_object.realized_allocation

        target_allocation_expanded = [
            {"coin": alloc["coin"], "portion": float(alloc["portion"])*100 // 0.01 / 100}
            for alloc in self.allocation_object.target_allocation
        ]

        target_coin_list = [alloc['coin'] for alloc in target_allocation_expanded]

        for coin in binance_coins:
            if coin not in target_coin_list:
                target_allocation_expanded.append({
                    "coin": coin,
                    "portion": 0.0
                })

        ITF_target_allocations = []
        for itf_pack in ITF_PACKS:

            itf_pack_alloc = next(
                (a for a in target_allocation_expanded if a.get('coin') == itf_pack),
                {'coin': itf_pack, 'portion': 0.0}
            )
            ITF_target_allocations.append(itf_pack_alloc)

        target_allocation_expanded[:] = [d for d in target_allocation_expanded if d.get('coin') not in ITF_PACKS]

        context = {
            "allocation_object": self.allocation_object,
            "target_allocation_expanded": target_allocation_expanded,
            "ITF_target_allocations": ITF_target_allocations,
            "binance_coins": binance_coins
        }

        return render(request, 'allocation.html', context)

    def post(self, request):

        import json
        post_target_allocation = json.loads(request.POST.get("allocation_array"))
        try:
            assert isinstance(post_target_allocation, list)
            draft_target_allocation = []
            allocation_sum = 0
            for alloc in post_target_allocation:
                draft_target_allocation.append({
                    "coin": str(alloc['coin']),
                    "portion": float(alloc['portion'])
                })
                allocation_sum += float(alloc['portion'])
            remainder = 0.9996 - allocation_sum

            final_target_allocation = []
            for alloc in draft_target_allocation:
                if alloc['coin'] == "BTC":
                    final_target_allocation.append({
                        "coin": "BTC", "portion": alloc['portion']+remainder
                    })
                else:
                    final_target_allocation.append(alloc)

        except Exception as e:
            messages.error(request, "Could not save allocatoins. Please try again or contact customer service.")

        self.allocation_object.target_allocation = final_target_allocation
        self.allocation_object.save()
        messages.success(request, "Allocation saved." + (
            f" Remainder ({remainder*100//.01/100}%) added to BTC" if remainder > 0.001 else ""
        ))

        return redirect('portfolio:allocation')
