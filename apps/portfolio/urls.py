from django.conf.urls import url
from apps.portfolio.views.portfolio import PortfolioView

app_name = 'portfolio'

urlpatterns = [

    url(r'^$', PortfolioView.as_view(), name='home'),

]
