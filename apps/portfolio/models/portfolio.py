import logging
import uuid
from datetime import datetime, timedelta

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

    rebalanced_at = models.DateTimeField(null=True)


    # MODEL PROPERTIES
    @property
    def target_allocation(self):
        allocation_object = self.allocations.first()
        return allocation_object.target_allocation if allocation_object else {}


    @property
    def realized_allocation(self):
        allocation_object = self.allocations.filter(is_realized=True).first()
        return allocation_object.realized_allocation if allocation_object else {}

    @property
    def recently_rebalanced(self):
        if not self.rebalanced_at:
            return False
        return True if self.rebalanced_at > datetime.now() - timedelta(minutes=59) else False


    # MODEL FUNCTIONS
    def get_new_allocation_object(self):

        self.binance_account = self.exchange_accounts.first()

        if not self.binance_account:
            return None
        if not self.binance_account.is_active:
            return None

        response = get_binance_portfolio_data(self.binance_account)
        logging.debug(response)
        (status, exchange_response) = response


        if status == 200 and 'binance' in exchange_response:
            binance_portfolio = exchange_response['binance']

            return Allocation.objects.create(
                portfolio=self,
                target_allocation=self.target_allocation,
                realized_allocation=binance_portfolio['allocations'],
                BTC_value=float(binance_portfolio['value']),
                BTC_price=get_BTC_price()
            )

        elif status == 400 and 'detail' in exchange_response:
            if "API-key" in exchange_response['detail']:
                self.binance_account.is_active = False
                self.binance_account.save()

        return None


    def __str__(self):
        return f"{self.user.username}_portfolio"

    class Meta:
        verbose_name_plural = 'portfolios'
