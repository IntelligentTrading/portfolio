from django.db import models
from django.utils.timezone import now


class Expirable(models.Model):
    valid_at = models.DateTimeField(null=True, blank=True)
    expired_at = models.DateTimeField(null=True, blank=True)

    @property
    def is_expired(self):
        return True if self.expired_at and self.expired_at < now() else False

    class Meta:
        abstract = True
