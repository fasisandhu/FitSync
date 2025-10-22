from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AttendanceViewSet, daily_trend, peak_hours, member_activity

router = DefaultRouter()
router.register(r'attendance', AttendanceViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('attendance/analytics/daily-trend/', daily_trend, name='daily-trend'),
    path('attendance/analytics/peak-hours/', peak_hours, name='peak-hours'),
    path('attendance/analytics/member-activity/', member_activity, name='member-activity'),
]
