from django.conf.urls import url

from apps.portfolio.views.allocation import AllocationsView
from apps.portfolio.views.exchange_setup import ExchangeSetupView
from apps.portfolio.views.portfolio import PortfolioView

app_name = 'portfolio'

urlpatterns = [

    url(r'^$', PortfolioView.as_view(), name='dashboard'),
    url(r'^exchange_setup$', ExchangeSetupView.as_view(), name='exchange_setup'),
    url(r'^allocations$', AllocationsView.as_view(), name='allocations'),

]
