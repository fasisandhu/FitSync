from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from .models import Payment, Plan, Subscription
from .serializers import PaymentSerializer, PlanSerializer, SubscriptionSerializer
from django_filters.rest_framework import DjangoFilterBackend

class PlanViewSet(viewsets.ModelViewSet):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer

class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['member', 'is_active']

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['subscription', 'status', 'method']

@api_view(['GET'])
def monthly_revenue(request):
    """
    Returns monthly revenue for the specified number of months
    Query params: months (default: 6)
    """
    months = int(request.GET.get('months', 6))
    
    # Calculate start date
    end_date = timezone.now().date()
    start_date = end_date - relativedelta(months=months-1)
    start_date = start_date.replace(day=1)  # Start from first day of month
    
    data = []
    current_date = start_date
    
    while current_date <= end_date:
        # Get payments for this month (only paid payments)
        month_payments = Payment.objects.filter(
            payment_date__year=current_date.year,
            payment_date__month=current_date.month,
            status='paid'
        )
        
        # Calculate monthly stats
        revenue = month_payments.aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        payment_count = month_payments.count()
        avg_payment = month_payments.aggregate(
            avg=Avg('amount')
        )['avg'] or 0
        
        data.append({
            'month': current_date.strftime('%Y-%m'),
            'revenue': float(revenue),
            'payment_count': payment_count,
            'avg_payment': round(float(avg_payment), 2) if avg_payment else 0
        })
        
        # Move to next month
        current_date = current_date + relativedelta(months=1)
    
    return Response({'data': data})

@api_view(['GET'])
def payment_methods(request):
    """
    Returns payment method distribution
    """
    # Get all paid payments grouped by method
    method_stats = Payment.objects.filter(status='paid').values('method').annotate(
        count=Count('id'),
        total_amount=Sum('amount')
    ).order_by('-total_amount')
    
    # Calculate total for percentage calculation
    total_payments = Payment.objects.filter(status='paid').count()
    
    data = []
    for stat in method_stats:
        percentage = round((stat['count'] / total_payments * 100), 1) if total_payments > 0 else 0
        
        # Get display name for method
        method_display = dict(Payment.PAYMENT_METHOD_CHOICES).get(stat['method'], stat['method'])
        
        data.append({
            'method': method_display.lower(),
            'count': stat['count'],
            'total_amount': float(stat['total_amount'] or 0),
            'percentage': percentage
        })
    
    return Response({'data': data})

@api_view(['GET'])
def renewal_rate(request):
    """
    Returns subscription renewal statistics
    """
    today = timezone.now().date()
    
    # Total subscriptions
    total_subscriptions = Subscription.objects.count()
    
    # Active subscriptions (end_date >= today)
    active_subscriptions = Subscription.objects.filter(
        is_active=True,
        end_date__gte=today
    ).count()
    
    # Expired subscriptions (end_date < today)
    expired_subscriptions = Subscription.objects.filter(
        Q(is_active=False) | Q(end_date__lt=today)
    ).count()
    
    # Calculate renewal rate
    renewal_rate = 0
    if total_subscriptions > 0:
        renewal_rate = round((active_subscriptions / total_subscriptions * 100), 1)
    
    # Expiring this month
    this_month_start = today.replace(day=1)
    next_month_start = this_month_start + relativedelta(months=1)
    
    expiring_this_month = Subscription.objects.filter(
        is_active=True,
        end_date__gte=this_month_start,
        end_date__lt=next_month_start
    ).count()
    
    # Expiring next month
    next_next_month_start = next_month_start + relativedelta(months=1)
    
    expiring_next_month = Subscription.objects.filter(
        is_active=True,
        end_date__gte=next_month_start,
        end_date__lt=next_next_month_start
    ).count()
    
    data = {
        'total_subscriptions': total_subscriptions,
        'active_subscriptions': active_subscriptions,
        'expired_subscriptions': expired_subscriptions,
        'renewal_rate': renewal_rate,
        'expiring_this_month': expiring_this_month,
        'expiring_next_month': expiring_next_month
    }
    
    return Response({'data': data})

# Now You Can Use:
# /api/subscriptions/?member=1 → All subs of member 1
# /api/subscriptions/?is_active=true → All active subs
# /api/subscriptions/?member=1&is_active=true → Active subs of member 1
