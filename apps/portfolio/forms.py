from django.forms import ModelForm

from apps.portfolio.models import ExchangeAccount, AllocationSnapshot


class ExchangeAccountForm(ModelForm):
    class Meta:
        model = ExchangeAccount
        fields = ['api_key', 'secret_key']


class AllocationForm(ModelForm):
    class Meta:
        model = AllocationSnapshot
        fields = ['allocation_data']
