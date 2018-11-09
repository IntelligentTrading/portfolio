import uuid

from django.contrib.auth import get_user_model

from apps.portfolio.models import Allocation
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
        return self.allocations.filter(is_realized=True).first.realized_allocation

    # MODEL FUNCTIONS
    def get_new_allocation_object(self):
        allocation_object = Allocation(portfolio=self)
        if self.exchange_accounts.first():
            allocation_object.realized_allocation = get_binance_portfolio_data(self.exchange_accounts.first())
        return allocation_object

    def __str__(self):
        return f"{self.user.username}_portfolio"

    class Meta:
        verbose_name_plural = 'portfolios'




