import logging

from django.shortcuts import render, redirect
from django.views.generic import View

from apps.portfolio.forms import ExchangeAccountForm
from apps.portfolio.models.exchange_account import ExchangeAccount


class ExchangeAccountView(View):
    def dispatch(self, request, *args, **kwargs):
        self.exchange_account = request.user.portfolio.exchange_accounts.first()
        return super().dispatch(request, *args, **kwargs)

    def get(self, request):

        context = {
            "exchange_account": self.exchange_account,
            "exchange_account_form": ExchangeAccountForm(instance=self.exchange_account)
        }
        return render(request, 'exchange_account.html', context)

    def post(self, request):
        if not self.exchange_account:
            self.exchange_account = ExchangeAccount()

        self.exchange_account.api_key = request.POST.get("api_key")
        self.exchange_account.secret_key = request.POST.get("secret_key")

        return redirect('portfolio:dashboard')
