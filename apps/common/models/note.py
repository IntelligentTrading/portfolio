import uuid

from django.db import models

from ..behaviors import Authorable
from ..behaviors import Timestampable


class Note(Timestampable, Authorable, models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    text = models.TextField(default="", blank=True)
