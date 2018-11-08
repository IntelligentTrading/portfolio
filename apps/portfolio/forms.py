from django.forms import ModelForm

from apps.portfolio.models import ExchangeAccount


class ExchangeAccountForm(ModelForm):
    class Meta:
        model = ExchangeAccount
        fields = ['api_key', 'secret_key']
