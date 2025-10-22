from rest_framework import serializers
from .models import Expense
from decimal import Decimal

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ['id', 'expense_name', 'person_name', 'amount', 'date', 'details', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def validate_amount(self, value):
        """Validate that amount is positive"""
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value

    def validate_expense_name(self, value):
        """Validate expense name is not empty"""
        if not value.strip():
            raise serializers.ValidationError("Expense name cannot be empty")
        return value.strip()

    def validate_person_name(self, value):
        """Validate person name (optional field)"""
        if value is None:
            return value
        return value.strip() if value.strip() else None

class ExpenseCreateSerializer(ExpenseSerializer):
    """Serializer for creating expenses with additional validation"""
    
    class Meta(ExpenseSerializer.Meta):
        fields = ['expense_name', 'person_name', 'amount', 'date', 'details']

class ExpenseListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing expenses"""
    
    class Meta:
        model = Expense
        fields = ['id', 'expense_name', 'person_name', 'amount', 'date', 'created_at','details']

class ExpenseStatisticsSerializer(serializers.Serializer):
    """Serializer for expense statistics"""
    total_expenses = serializers.IntegerField()
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    average_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    monthly_total = serializers.DecimalField(max_digits=10, decimal_places=2)
    monthly_count = serializers.IntegerField()