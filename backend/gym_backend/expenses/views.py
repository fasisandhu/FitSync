from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import models
from django.db.models import Q, Sum, Avg, Count, Min, Max
from django.db.models.functions import TruncMonth, TruncDate
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from datetime import datetime, timedelta
from decimal import Decimal
from .models import Expense
from .serializers import (
    ExpenseSerializer, 
    ExpenseCreateSerializer, 
    ExpenseListSerializer,
)

class ExpenseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing expenses
    Provides CRUD operations for expenses
    """
    queryset = Expense.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['person_name', 'date']
    search_fields = ['expense_name', 'person_name', 'details']
    ordering_fields = ['date', 'amount', 'created_at']
    ordering = ['-date', '-created_at']

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return ExpenseCreateSerializer
        elif self.action == 'list':
            return ExpenseListSerializer
        return ExpenseSerializer

    def get_queryset(self):
        """Filter queryset based on query parameters"""
        queryset = Expense.objects.all()
        
        # Date range filtering
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
            
        # Amount range filtering
        amount_min = self.request.query_params.get('amount_min', None)
        amount_max = self.request.query_params.get('amount_max', None)
        
        if amount_min:
            queryset = queryset.filter(amount__gte=amount_min)
        if amount_max:
            queryset = queryset.filter(amount__lte=amount_max)
            
        return queryset

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent expenses (last 10)"""
        recent_expenses = self.get_queryset()[:10]
        serializer = ExpenseListSerializer(recent_expenses, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_person(self, request):
        """Get expenses grouped by person"""
        person_expenses = self.get_queryset().values('person_name').annotate(
            total_amount=Sum('amount'),
            expense_count=Count('id')
        ).order_by('-total_amount')
        
        return Response(person_expenses)

    @action(detail=False, methods=['get'])
    def monthly_summary(self, request):
        """Get monthly expense summary"""
        monthly_data = self.get_queryset().annotate(
            month=TruncMonth('date')
        ).values('month').annotate(
            total_amount=Sum('amount'),
            expense_count=Count('id'),
            average_amount=Avg('amount')
        ).order_by('-month')
        
        return Response(monthly_data)

class ExpenseDashboardView(APIView):
    """
    API view for expense dashboard data
    """
    
    def get(self, request):
        """Get dashboard statistics"""
        # Total statistics
        total_expenses = Expense.objects.count()
        total_amount = Expense.objects.aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        average_amount = Expense.objects.aggregate(Avg('amount'))['amount__avg'] or Decimal('0')
        
        # Current month statistics
        now = datetime.now()
        current_month_start = now.replace(day=1)
        current_month_expenses = Expense.objects.filter(date__gte=current_month_start)
        monthly_total = current_month_expenses.aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        monthly_count = current_month_expenses.count()
        
        # Recent expenses
        recent_expenses = Expense.objects.order_by('-created_at')[:5]
        recent_serializer = ExpenseListSerializer(recent_expenses, many=True)
        
        # Top spenders
        top_spenders = Expense.objects.values('person_name').annotate(
            total_spent=Sum('amount'),
            expense_count=Count('id')
        ).order_by('-total_spent')[:5]
        
        # Monthly trend (last 6 months)
        six_months_ago = now - timedelta(days=180)
        monthly_trend = Expense.objects.filter(
            date__gte=six_months_ago
        ).annotate(
            month=TruncMonth('date')
        ).values('month').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('month')
        
        dashboard_data = {
            'total_expenses': total_expenses,
            'total_amount': total_amount,
            'average_amount': average_amount,
            'monthly_total': monthly_total,
            'monthly_count': monthly_count,
            'recent_expenses': recent_serializer.data,
            'top_spenders': list(top_spenders),
            'monthly_trend': list(monthly_trend)
        }
        
        return Response(dashboard_data)

class ExpenseStatisticsView(APIView):
    """
    API view for detailed expense statistics
    """
    
    def get(self, request):
        """Get detailed statistics"""
        # Date range from query parameters
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        queryset = Expense.objects.all()
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        
        # Calculate statistics
        stats = queryset.aggregate(
            total_expenses=Count('id'),
            total_amount=Sum('amount'),
            average_amount=Avg('amount'),
            min_amount=models.Min('amount'),
            max_amount=models.Max('amount')
        )
        
        # Daily breakdown
        daily_breakdown = queryset.annotate(
            day=TruncDate('date')
        ).values('day').annotate(
            daily_total=Sum('amount'),
            daily_count=Count('id')
        ).order_by('-day')
        
        # Category breakdown (by person)
        person_breakdown = queryset.values('person_name').annotate(
            person_total=Sum('amount'),
            person_count=Count('id'),
            person_average=Avg('amount')
        ).order_by('-person_total')
        
        statistics_data = {
            'summary': {
                'total_expenses': stats['total_expenses'] or 0,
                'total_amount': stats['total_amount'] or Decimal('0'),
                'average_amount': stats['average_amount'] or Decimal('0'),
                'min_amount': stats['min_amount'] or Decimal('0'),
                'max_amount': stats['max_amount'] or Decimal('0'),
            },
            'daily_breakdown': list(daily_breakdown),
            'person_breakdown': list(person_breakdown),
            'date_range': {
                'from': date_from,
                'to': date_to
            }
        }
        
        return Response(statistics_data)

class MonthlyProfitsView(APIView):
    """
    API view for monthly profits analysis (Income - Expenses)
    """
    
    def get(self, request):
        """Get monthly profits data"""
        # Date range from query parameters (optional)
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        # Default to last 12 months if no date range provided
        if not date_from and not date_to:
            now = datetime.now()
            date_from = (now - timedelta(days=365)).strftime('%Y-%m-%d')
            date_to = now.strftime('%Y-%m-%d')
        
        # Get monthly expenses
        expenses_queryset = Expense.objects.all()
        if date_from:
            expenses_queryset = expenses_queryset.filter(date__gte=date_from)
        if date_to:
            expenses_queryset = expenses_queryset.filter(date__lte=date_to)
        
        monthly_expenses = expenses_queryset.annotate(
            month=TruncMonth('date')
        ).values('month').annotate(
            total_expenses=Sum('amount')
        ).order_by('month')
        
        # Get monthly income from payments
        from subscriptions.models import Payment  # Import Payment model
        
        payments_queryset = Payment.objects.filter(status='paid')
        if date_from:
            payments_queryset = payments_queryset.filter(payment_date__gte=date_from)
        if date_to:
            payments_queryset = payments_queryset.filter(payment_date__lte=date_to)
        
        monthly_income = payments_queryset.annotate(
            month=TruncMonth('payment_date')
        ).values('month').annotate(
            total_income=Sum('amount')
        ).order_by('month')
        
        # Combine income and expenses data
        profits_data = {}
        
        # Add expenses data
        for expense in monthly_expenses:
            month_key = expense['month'].strftime('%Y-%m')
            profits_data[month_key] = {
                'month': month_key,
                'income': Decimal('0'),
                'expenses': expense['total_expenses'] or Decimal('0'),
                'profit': Decimal('0')
            }
        
        # Add income data
        for income in monthly_income:
            month_key = income['month'].strftime('%Y-%m')
            if month_key not in profits_data:
                profits_data[month_key] = {
                    'month': month_key,
                    'income': Decimal('0'),
                    'expenses': Decimal('0'),
                    'profit': Decimal('0')
                }
            profits_data[month_key]['income'] = income['total_income'] or Decimal('0')
        
        # Calculate profits
        for month_data in profits_data.values():
            month_data['profit'] = month_data['income'] - month_data['expenses']
        
        # Convert to list and sort by month
        result = list(profits_data.values())
        result.sort(key=lambda x: x['month'])
        
        return Response({
            'profits_data': result,
            'date_range': {
                'from': date_from,
                'to': date_to
            },
            'summary': {
                'total_income': sum(item['income'] for item in result),
                'total_expenses': sum(item['expenses'] for item in result),
                'total_profit': sum(item['profit'] for item in result),
                'months_count': len(result)
            }
        })
