from django.db import models
from members.models import Member
from datetime import timedelta

class Plan(models.Model):
    name = models.CharField(max_length=100)
    duration_days = models.IntegerField()  # e.g., 30, 90, 365
    price = models.DecimalField(max_digits=8, decimal_places=2)

    def __str__(self):
        return f"{self.name} - {self.duration_days} days"


class Subscription(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='subscriptions')  # Keep CASCADE - delete subscription when member is deleted
    plan = models.ForeignKey(Plan, on_delete=models.SET_NULL, null=True)
    start_date = models.DateField()
    end_date = models.DateField(blank=True)  # make it optional
    is_active = models.BooleanField(default=True)
    
    def save(self, *args, **kwargs):
        # Auto calculate end_date
        if self.plan and self.start_date:
            self.end_date = self.start_date + timedelta(days=self.plan.duration_days)
        super().save(*args, **kwargs)

    def __str__(self):
        plan_name = self.plan.name if self.plan else "No Plan"
        return f"{self.member.full_name} - {plan_name}"

class Payment(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('paid', 'Paid'),
        ('pending', 'Pending'),
        ('failed', 'Failed'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('bank', 'Bank Transfer'),
    ]

    subscription = models.ForeignKey(Subscription, on_delete=models.SET_NULL, null=True, related_name='payments')  # SET_NULL - keep payment when subscription is deleted
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    payment_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=PAYMENT_STATUS_CHOICES, default='paid')
    method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES, default='cash')
    
    # Store member and subscription info to preserve data
    member_name = models.CharField(max_length=100, blank=True)
    member_email = models.EmailField(blank=True)
    subscription_plan_name = models.CharField(max_length=100, blank=True)
    subscription_start_date = models.DateField(null=True, blank=True)
    subscription_end_date = models.DateField(null=True, blank=True)

    def save(self, *args, **kwargs):
        # Store subscription and member info before saving
        if self.subscription:
            if self.subscription.member:
                self.member_name = self.subscription.member.full_name or ""
                self.member_email = self.subscription.member.email or ""
            if self.subscription.plan:
                self.subscription_plan_name = self.subscription.plan.name
            self.subscription_start_date = self.subscription.start_date
            self.subscription_end_date = self.subscription.end_date
        super().save(*args, **kwargs)

    def __str__(self):
        member_name = ""
        if self.subscription and self.subscription.member:
            member_name = self.subscription.member.full_name
        elif self.member_name:
            member_name = self.member_name
        
        return f"{member_name} - {self.amount} - {self.status}"
