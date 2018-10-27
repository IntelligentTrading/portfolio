from django.db import models


class Locatable(models.Model):
    longitude = models.FloatField(null=True)
    latitude = models.FloatField(null=True)

    class Meta:
        abstract = True
