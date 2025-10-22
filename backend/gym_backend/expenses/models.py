from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal

class Expense(models.Model):
    expense_name = models.CharField(max_length=200, help_text="Name/description of the expense")
    person_name = models.CharField(max_length=100, help_text="Person responsible for or receiving the expense")
    amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Expense amount"
    )
    date = models.DateField(help_text="Date of the expense")
    details = models.TextField(blank=True, null=True, help_text="Optional additional details")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = "Expense"
        verbose_name_plural = "Expenses"

    def __str__(self):
        return f"{self.expense_name} - ${self.amount} ({self.date})"
