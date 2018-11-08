import uuid
from django.contrib.postgres.fields import JSONField
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.dispatch import receiver

from apps.portfolio.services.trading import get_binance_portfolio_data

User = get_user_model()
from django.db.models.signals import post_save, pre_save
from django.db import models
from apps.common.behaviors import Timestampable


class Portfolio(Timestampable, models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.OneToOneField(
        User, null=False, on_delete=models.CASCADE, related_name="portfolio"
    )


    # MODEL PROPERTIES


    # MODEL FUNCTIONS
    def __str__(self):
        return f"{self.user.username}_portfolio"

    class Meta:
        verbose_name_plural = 'portfolios'



class ExchangeAccount(Timestampable, models.Model):

    portfolio = models.ForeignKey(
        'portfolio.Portfolio', null=False, on_delete=models.CASCADE, related_name="exchange_accounts"
    )

    # exchange = models.SmallIntegerField(choices=EXCHANGE_CHOICES, null=False)
    api_key = models.CharField(max_length=64, null=True, blank=True)
    secret_key = models.CharField(max_length=64, null=True, blank=True)


    # MODEL PROPERTIES

    # MODEL FUNCTIONS
    def get_new_snapshot(self):
        allocation_snapshot = AllocationSnapshot()
        allocation_snapshot.allocation_data = get_binance_portfolio_data(self)


    def __str__(self):
        return f"{self.portfolio.user.username}_binance_account"

    class Meta:
        verbose_name_plural = 'exchange_accounts'



class AllocationSnapshot(models.Model):

    portfolio = models.ForeignKey(
        'portfolio.Portfolio', null=False, on_delete=models.CASCADE, related_name="allocation_snapshots"
    )

    # https://docs.djangoproject.com/en/2.1/ref/contrib/postgres/fields/#querying-jsonfield
    allocation_data = JSONField(blank=False)
    is_realized = models.BooleanField(default=False)

    BTC_price = models.BigIntegerField(null=True)
    _timestamp = models.DateTimeField(auto_now=True)


    # MODEL PROPERTIES

    # MODEL FUNCTIONS
    def __str__(self):
        return f"snapshot_{self.id}"

    class Meta:
        verbose_name_plural = 'allocation_snapshots'
        ordering = ["-_timestamp"]


@receiver(pre_save, sender=AllocationSnapshot, dispatch_uid="update BTC_price")
def update_BTC_price(sender, instance, **kwargs):
    if not getattr(instance, 'BTC_price_updated', False):
        instance.BTC_price = cache.get("current_BTC_price")
        instance.BTC_price_updated = True
        instance.save()
