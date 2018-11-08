from django.conf.urls import url
from apps.portfolio.views.portfolio import PortfolioView, ExchangeSetupView

app_name = 'portfolio'

urlpatterns = [

    url(r'^$', PortfolioView.as_view(), name='dashboard'),
    url(r'^exchange_setup$', ExchangeSetupView.as_view(), name='exchange'),



]
