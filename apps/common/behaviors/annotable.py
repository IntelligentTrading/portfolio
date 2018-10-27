from django.db import models


class Annotable(models.Model):
    notes = models.ManyToManyField('common.Note')

    class Meta:
        abstract = True

    @property
    def has_notes(self):
        return True if self.notes.count() else False
