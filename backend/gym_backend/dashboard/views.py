from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from datetime import datetime, timedelta

# Import your existing models
try:
    from members.models import Member
except ImportError:
    Member = None

try:
    from attendance.models import Attendance
except ImportError:
    Attendance = None

try:
    from subscriptions.models import Subscription, Payment
except ImportError:
    Subscription = None
    Payment = None

try:
    from trainers.models import Trainer
except ImportError:
    Trainer = None

# Remove TrainerClient since it doesn't exist
TrainerClient = None


@api_view(['GET'])
def dashboard_overview(request):
    """
    Returns comprehensive dashboard overview statistics
    """
    today = timezone.now().date()
    current_month_start = today.replace(day=1)
    last_month_start = (current_month_start - timedelta(days=1)).replace(day=1)
    last_month_end = current_month_start - timedelta(days=1)
    week_ago = today - timedelta(days=7)
    
    # Attendance statistics
    attendance_stats = {
        "today_present": 0,
        "today_late": 0,
        "today_absent": 0,
        "weekly_average": 0,
        "monthly_average": 0
    }
    
    if Attendance:
        today_attendance = Attendance.objects.filter(date=today)
        attendance_stats = {
            "today_present": today_attendance.filter(status='present').count(),
            "today_late": today_attendance.filter(status='late').count(),
            "today_absent": today_attendance.filter(status='absent').count(),
            "weekly_average": Attendance.objects.filter(
                date__gte=week_ago,
                status='present'
            ).values('date').annotate(
                daily_count=Count('id')
            ).aggregate(
                avg=Avg('daily_count')
            )['avg'] or 0,
            "monthly_average": Attendance.objects.filter(
                date__gte=current_month_start,
                status='present'
            ).values('date').annotate(
                daily_count=Count('id')
            ).aggregate(
                avg=Avg('daily_count')
            )['avg'] or 0
        }
    
    # Member statistics
    member_stats = {
        "total_members": 0,
        "active_members": 0,
        "new_this_month": 0,
        "expiring_subscriptions": 0
    }
    
    if Member and Subscription:
        total_members = Member.objects.count()
        # Active subscriptions are those that haven't expired and are active
        active_subscriptions = Subscription.objects.filter(
            end_date__gte=today,
            is_active=True
        ).count()
        new_members_this_month = Member.objects.filter(
            join_date__gte=current_month_start
        ).count()
        # Subscriptions expiring in the next 7 days
        expiring_subscriptions = Subscription.objects.filter(
            end_date__lte=today + timedelta(days=7),
            end_date__gte=today,
            is_active=True
        ).count()
        
        member_stats = {
            "total_members": total_members,
            "active_members": active_subscriptions,
            "new_this_month": new_members_this_month,
            "expiring_subscriptions": expiring_subscriptions
        }
    
    # Revenue statistics
    revenue_stats = {
        "this_month": 0.0,
        "last_month": 0.0,
        "growth_percentage": 0.0,
        "pending_payments": 0.0
    }

    if Payment:
        # Check if Payment model has status field, if not use different logic
        try:
            this_month_revenue = Payment.objects.filter(
                payment_date__gte=current_month_start,
                status='paid'
            ).aggregate(
                total=Sum('amount')
            )['total'] or 0
            
            last_month_revenue = Payment.objects.filter(
                payment_date__gte=last_month_start,
                payment_date__lte=last_month_end,
                status='paid'
            ).aggregate(
                total=Sum('amount')
            )['total'] or 0
            
            pending_payments = Payment.objects.filter(
                status='pending'
            ).aggregate(
                total=Sum('amount')
            )['total'] or 0
        except:
            # Fallback if status field doesn't exist
            this_month_revenue = Payment.objects.filter(
                payment_date__gte=current_month_start
            ).aggregate(
                total=Sum('amount')
            )['total'] or 0
            
            last_month_revenue = Payment.objects.filter(
                payment_date__gte=last_month_start,
                payment_date__lte=last_month_end
            ).aggregate(
                total=Sum('amount')
            )['total'] or 0
            
            pending_payments = 0
        
        growth_percentage = 0
        if last_month_revenue > 0:
            growth_percentage = ((this_month_revenue - last_month_revenue) / last_month_revenue) * 100
        
        revenue_stats = {
            "this_month": float(this_month_revenue),
            "last_month": float(last_month_revenue),
            "growth_percentage": round(growth_percentage, 1),
            "pending_payments": float(pending_payments)
        }
    
    # Trainer statistics
    trainer_stats = {
        "total_trainers": 0,
        "active_trainers": 0,
        "total_clients": 0
    }
    
    if Trainer:
        try:
            total_trainers = Trainer.objects.count()
            # Check if is_active field exists
            try:
                active_trainers = Trainer.objects.filter(is_active=True).count()
            except:
                active_trainers = total_trainers
            
            # Since TrainerClient doesn't exist, we'll use members assigned to trainers
            if Member:
                try:
                    # Count members who have a trainer assigned
                    total_clients = Member.objects.filter(trainer__isnull=False).count()
                except:
                    total_clients = 0
            else:
                total_clients = 0
                
            trainer_stats = {
                "total_trainers": total_trainers,
                "active_trainers": active_trainers,
                "total_clients": total_clients
            }
        except:
            pass
    
    return Response({
        "data": {
            "attendance": attendance_stats,
            "members": member_stats,
            "revenue": revenue_stats,
            "trainers": trainer_stats
        }
    })


@api_view(['GET'])
def dashboard_charts(request):
    """
    Returns data for dashboard charts
    """
    today = timezone.now().date()
    current_month_start = today.replace(day=1)
    
    # Weekly attendance trend
    weekly_attendance = []
    if Attendance:
        for i in range(7):
            date = today - timedelta(days=6-i)
            try:
                count = Attendance.objects.filter(
                    date=date,
                    status='present'
                ).count()
            except:
                count = Attendance.objects.filter(date=date).count()
            weekly_attendance.append({
                "date": date.strftime("%Y-%m-%d"),
                "count": count
            })
    
    # Monthly revenue trend (last 6 months)
    monthly_revenue = []
    if Payment:
        for i in range(6):
            month_start = (current_month_start - timedelta(days=i*30)).replace(day=1)
            next_month = (month_start + timedelta(days=32)).replace(day=1)
            try:
                revenue = Payment.objects.filter(
                    payment_date__gte=month_start,
                    payment_date__lt=next_month,
                    status='paid'
                ).aggregate(total=Sum('amount'))['total'] or 0
            except:
                revenue = Payment.objects.filter(
                    payment_date__gte=month_start,
                    payment_date__lt=next_month
                ).aggregate(total=Sum('amount'))['total'] or 0
            
            monthly_revenue.append({
                "month": month_start.strftime("%Y-%m"),
                "revenue": float(revenue)
            })
    
    return Response({
        "data": {
            "weekly_attendance": weekly_attendance,
            "monthly_revenue": list(reversed(monthly_revenue))
        }
    })
