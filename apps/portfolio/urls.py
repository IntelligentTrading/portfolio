from django.conf.urls import url

from apps.portfolio.views.allocation import AllocationsView
from apps.portfolio.views.exchange_account import ExchangeAccountView
from apps.portfolio.views.portfolio import PortfolioView

app_name = 'portfolio'

urlpatterns = [

    url(r'^$', PortfolioView.as_view(), name='dashboard'),
    url(r'^exchange_account$', ExchangeAccountView.as_view(), name='exchange_account'),
    url(r'^allocation$', AllocationsView.as_view(), name='allocation'),

]
