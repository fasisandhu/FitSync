from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Attendance
from .serializers import AttendanceSerializer
from django_filters.rest_framework import DjangoFilterBackend
from django.core.paginator import Paginator
from django.db.models import Count, Case, When, IntegerField, F, FloatField
from django.db.models.functions import Cast

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all().order_by('-date', '-time')
    serializer_class = AttendanceSerializer
    filter_backends = [DjangoFilterBackend] 
    filterset_fields = ['member', 'date', 'status']
    search_fields = ['member__full_name', 'remarks']

@api_view(['GET'])
def daily_trend(request):
    """
    Returns attendance count for each day in the specified range
    Query params: days (default: 7)
    """
    days = int(request.GET.get('days', 7))
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=days-1)
    
    data = []
    current_date = start_date
    
    while current_date <= end_date:
        # Get attendance counts for this date
        day_attendance = Attendance.objects.filter(date=current_date)
        
        present_count = day_attendance.filter(status='present').count()
        late_count = day_attendance.filter(status='late').count()
        absent_count = day_attendance.filter(status='absent').count()
        total_count = present_count + late_count + absent_count
        
        data.append({
            'date': current_date.strftime('%Y-%m-%d'),
            'present': present_count,
            'late': late_count,
            'absent': absent_count,
            'total': total_count
        })
        
        current_date += timedelta(days=1)
    
    return Response({'data': data})

@api_view(['GET'])
def peak_hours(request):
    """
    Returns attendance by hour of the day
    """
    # Get all attendance records with their hours
    attendance_by_hour = {}
    total_records = 0
    
    for hour in range(24):
        hour_str = f"{hour:02d}:00"
        count = Attendance.objects.filter(
            time__hour=hour
        ).count()
        attendance_by_hour[hour_str] = count
        total_records += count
    
    # Calculate percentages and format data
    data = []
    for hour_str, count in attendance_by_hour.items():
        percentage = round((count / total_records * 100), 1) if total_records > 0 else 0
        data.append({
            'hour': hour_str,
            'count': count,
            'percentage': percentage
        })
    
    # Sort by hour and filter out zero counts for cleaner output
    data = [item for item in data if item['count'] > 0]
    data.sort(key=lambda x: x['hour'])
    
    return Response({'data': data})

@api_view(['GET'])
def member_activity(request):
    """
    Returns most active members with their attendance statistics
    """
    # Get pagination parameters
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 20))  # Default 20 per page
    
    # More efficient query with database-level calculations
    member_stats = Attendance.objects.select_related('member').values(
        'member__id', 
        'member__full_name'
    ).annotate(
        total_attendance=Count('id'),
        present_count=Count(Case(When(status='present', then=1), output_field=IntegerField())),
        late_count=Count(Case(When(status='late', then=1), output_field=IntegerField())),
        absent_count=Count(Case(When(status='absent', then=1), output_field=IntegerField())),
        # Calculate attendance rate in database
        attendance_rate=Cast(
            (Count(Case(When(Q(status='present') | Q(status='late'), then=1))) * 100.0) / 
            Count('id'), 
            FloatField()
        )
    ).order_by('-total_attendance')
    
    # Apply pagination
    paginator = Paginator(member_stats, page_size)
    page_obj = paginator.get_page(page)
    
    data = []
    for member in page_obj:
        data.append({
            'member_id': member['member__id'],
            'member_name': member['member__full_name'],
            'total_attendance': member['total_attendance'],
            'present_count': member['present_count'],
            'late_count': member['late_count'],
            'absent_count': member['absent_count'],
            'attendance_rate': round(member['attendance_rate'], 1) if member['attendance_rate'] else 0
        })
    
    return Response({
        'data': data,
        'pagination': {
            'current_page': page,
            'total_pages': paginator.num_pages,
            'total_count': paginator.count,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous()
        }
    })

# Example Filters You Can Use:
# /api/attendance/?member=1 → All attendance of member 1
# /api/attendance/?member=1&status=late → Only late days
# /api/attendance/?date=2025-07-01 → Attendance of a specific day