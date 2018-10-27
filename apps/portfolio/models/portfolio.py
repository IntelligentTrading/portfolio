import uuid
from django.contrib.postgres.fields import JSONField
from django.conf.global_settings import AUTH_USER_MODEL
from django.db import models
from apps.common.behaviors import Timestampable


class Portfolio(Timestampable, models.Model):

    user = models.OneToOneField(AUTH_USER_MODEL)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)


    # MODEL PROPERTIES

    # MODEL FUNCTIONS
    def __str__(self):
        return f"{user.id}_portfolio"

    class Meta:
        verbose_name_plural = 'portfolios'






class ExchangeAccount(Timestampable, models.Model):

    portfolio = models.ForeignKey(
        'portfolio.Portfolio', null=False, on_delete=models.CASCADE, related_name="exchange_accounts"
    )

    api_key = models.CharField(max_length=64, null=True, blank=True)
    secret_key = models.CharField(max_length=64, null=True, blank=True)


    # MODEL PROPERTIES

    # MODEL FUNCTIONS
    def __str__(self):
        return f"binance_account_{self.id}"

    class Meta:
        verbose_name_plural = 'exchange_accounts'






class AllocationSnapshot(models.Model):

    portfolio = models.ForeignKey(
        'portfolio.Portfolio', null=False, on_delete=models.CASCADE, related_name="allocation_snapshots"
    )

    # https://docs.djangoproject.com/en/2.1/ref/contrib/postgres/fields/#querying-jsonfield
    allocation_data = JSONField(blank=False)

    BTC_price = models.BigIntegerField(null=True)
    timestamp = models.DateTimeField(auto_now_add=True)


    # MODEL PROPERTIES

    # MODEL FUNCTIONS
    def __str__(self):
        return f"snapshot_{self.id}"

    class Meta:
        verbose_name_plural = 'allocation_snapshots'
