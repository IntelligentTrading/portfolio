from django.contrib.auth import get_user_model
from django.contrib.postgres.fields import JSONField
from django.core.cache import cache
from django.dispatch import receiver

User = get_user_model()
from django.db.models.signals import pre_save
from django.db import models


class Allocation(models.Model):

    portfolio = models.ForeignKey(
        'portfolio.Portfolio', null=False, on_delete=models.CASCADE, related_name="allocations"
    )

    # https://docs.djangoproject.com/en/2.1/ref/contrib/postgres/fields/#querying-jsonfield
    target_allocation = JSONField(default=dict)
    realized_allocation = JSONField(default=dict)
    is_realized = models.BooleanField(default=False)

    BTC_price = models.BigIntegerField(null=True)
    _timestamp = models.DateTimeField(auto_now=True)


    # MODEL PROPERTIES

    # MODEL FUNCTIONS
    def __str__(self):
        return f"allocation_{self.id}"

    class Meta:
        verbose_name_plural = 'allocations'
        ordering = ["-_timestamp"]


@receiver(pre_save, sender=Allocation, dispatch_uid="update BTC_price")
def update_BTC_price(sender, instance, **kwargs):
    if not getattr(instance, 'BTC_price_updated', False):
        instance.BTC_price = cache.get("current_BTC_price")
        instance.BTC_price_updated = True
        instance.save()
