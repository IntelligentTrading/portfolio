from django.contrib.auth import get_user_model

User = get_user_model()
from django.db import models
from apps.common.behaviors import Timestampable



class ExchangeAccount(Timestampable, models.Model):

    portfolio = models.ForeignKey(
        'portfolio.Portfolio', null=False, on_delete=models.CASCADE, related_name="exchange_accounts"
    )

    # exchange = models.SmallIntegerField(choices=EXCHANGE_CHOICES, null=False)
    api_key = models.CharField(max_length=64, null=True, blank=True)
    secret_key = models.CharField(max_length=64, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    # MODEL PROPERTIES

    # MODEL FUNCTIONS

    def __str__(self):
        return f"{self.portfolio.user.username}_binance_account"

    class Meta:
        verbose_name_plural = 'exchange_accounts'
