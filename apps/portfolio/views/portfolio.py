from django.contrib import messages
from django.shortcuts import render, redirect
from django.views.generic import View

from apps.portfolio.models.portfolio import Portfolio


class PortfolioView(View):
    def dispatch(self, request, *args, **kwargs):

        if not hasattr(request.user, "portfolio"):
            Portfolio.objects.create(user=request.user)

        self.portfolio = request.user.portfolio

        if not self.portfolio.exchange_accounts.exists():
            messages.warning(request, "Please setup your exchange details first.")
            return redirect("portfolio:exchange_account")

        if not self.portfolio.allocations.exists() or self.portfolio.allocations.first().is_old:
            self.allocation_object = self.portfolio.get_new_allocation_object()
            if not self.allocation_object:
                messages.error(request, "Could not connect to the exchange. Check the API keys in connected account")
            else:
                self.allocation_object.save()
        else:
            self.allocation_object = self.portfolio.allocations.first()

        return super().dispatch(request, *args, **kwargs)

    def get(self, request):

        context = {
            "portfolio": self.portfolio,
            "allocation_object": self.allocation_object,
        }

        return render(request, 'portfolio.html', context)
