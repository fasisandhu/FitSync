from django.db import models

class Trainer(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female')
    ]

    full_name = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(unique=True, blank=True, null=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True, null=True)
    expertise = models.TextField(blank=True, null=True)
    join_date = models.DateField(auto_now_add=True)  # This is auto-filled, no need to make blank/null
    is_active = models.BooleanField(default=True)    # BooleanFields don’t accept null unless explicitly stated

    def __str__(self):
        return self.full_name or "Unnamed Trainer"
