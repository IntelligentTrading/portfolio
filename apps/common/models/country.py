import uuid

from django.db import models

from .currency import Currency


class Country(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, blank=True)
    code = models.CharField(max_length=3, blank=True)
    calling_code = models.CharField(max_length=3, blank=True)
    currency = models.ForeignKey(
        Currency, related_name='countries', null=True
    )

    def __unicode__(self):
        return self.code

    class Meta:
        verbose_name_plural = 'countries'
