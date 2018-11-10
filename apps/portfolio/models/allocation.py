from datetime import timedelta, datetime

from django.contrib.auth import get_user_model
from django.contrib.postgres.fields import JSONField
from django.dispatch import receiver

from apps.portfolio.services.signals import get_BTC_price

User = get_user_model()
from django.db.models.signals import pre_save
from django.db import models


ITF1HR, ITF6HR, ITF24HR = "ITF1HR", "ITF6HR", "ITF24HR"
ITFPRIV = "ITFPRIV"
ITF_PACKS = [ITF1HR, ITF6HR, ITF24HR,]  # ITFPRIV,

class Allocation(models.Model):

    portfolio = models.ForeignKey(
        'portfolio.Portfolio', null=False, on_delete=models.CASCADE, related_name="allocations"
    )

    # https://docs.djangoproject.com/en/2.1/ref/contrib/postgres/fields/#querying-jsonfield
    target_allocation = JSONField(default=list)
    realized_allocation = JSONField(default=list)
    is_realized = models.BooleanField(default=False)

    BTC_value = models.FloatField(null=True)
    BTC_price = models.BigIntegerField(null=True)
    _timestamp = models.DateTimeField(auto_now=True)


    # MODEL PROPERTIES
    @property
    def USD_value(self):
        if self.BTC_price and self.BTC_value:
            return self.BTC_price * self.BTC_value / 10**8 // 0.01 / 100
        else:
            return None

    @property
    def is_old(self):
        if self.portfolio.exchange_accounts.first().modified_at > (datetime.now() - timedelta(minutes=2)):
            return True
        else:
            return bool(self._timestamp < (datetime.now() - timedelta(minutes=20)))

    # MODEL FUNCTIONS

    def __str__(self):
        return f"allocation_{self.id}"

    class Meta:
        verbose_name_plural = 'allocations'
        ordering = ["-_timestamp"]


@receiver(pre_save, sender=Allocation, dispatch_uid="update BTC_price")
def update_BTC_price(sender, instance, **kwargs):
    if not getattr(instance, 'BTC_price_updated', False):
        instance.BTC_price = get_BTC_price()
        instance.BTC_price_updated = True
        instance.save()
