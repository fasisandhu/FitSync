from django.db import models
from members.models import Member

class Attendance(models.Model):
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
    ]

    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='attendance')
    date = models.DateField(auto_now_add=True)
    time = models.TimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='present')
    remarks = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('member', 'date')  # Prevent double check-ins

    def __str__(self):
        return f"{self.member.full_name} - {self.date} - {self.status}"
