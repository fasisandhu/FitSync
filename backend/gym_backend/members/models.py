from django.db import models
from trainers.models import Trainer


class Member(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]

    full_name = models.CharField(max_length=100, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=15, null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, null=True, blank=True)
    dob = models.DateField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    emergency_contact = models.CharField(max_length=15, null=True, blank=True)
    join_date = models.DateField(auto_now_add=True)  # Typically not nullable, auto set
    active = models.BooleanField(default=True)  # BooleanFields can't have null; use NullBooleanField if needed
    trainer = models.ForeignKey(Trainer,on_delete=models.SET_NULL,null=True,blank=True,related_name='members')

    def __str__(self):
        return self.full_name or "Unnamed Member"
