from django.contrib.auth.models import User
from django.db import models


class Authorable(models.Model):
    author = models.ForeignKey(User, related_name="%(class)ss")
    authored_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        abstract = True
