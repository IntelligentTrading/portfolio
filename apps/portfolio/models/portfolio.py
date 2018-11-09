import uuid

from django.contrib.auth import get_user_model
from django.core.cache import cache

from apps.portfolio.models import Allocation
from apps.portfolio.services.signals import get_BTC_price
from apps.portfolio.services.trading import get_binance_portfolio_data

User = get_user_model()
from django.db import models
from apps.common.behaviors import Timestampable


class Portfolio(Timestampable, models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.OneToOneField(
        User, null=False, on_delete=models.CASCADE, related_name="portfolio"
    )


    # MODEL PROPERTIES
    @property
    def target_allocation(self):
        return self.allocations.first().target_allocation

    @property
    def realized_allocation(self):
        return self.allocations.filter(is_realized=True).first().realized_allocation

    # MODEL FUNCTIONS
    def get_new_allocation_object(self):
        if not self.exchange_accounts.exists():
            return None

        portfolio_data = get_binance_portfolio_data(self.exchange_accounts.first())
        return Allocation(
            portfolio=self,
            target_allocation=self.target_allocation,
            realized_allocation=portfolio_data['allocations'],
            BTC_value=portfolio_data['value'],
            BTC_price=get_BTC_price()
        )

    def __str__(self):
        return f"{self.user.username}_portfolio"

    class Meta:
        verbose_name_plural = 'portfolios'




