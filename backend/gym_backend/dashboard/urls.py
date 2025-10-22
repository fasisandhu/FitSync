from django.urls import path
from .views import dashboard_overview, dashboard_charts

urlpatterns = [
    path('analytics/overview/', dashboard_overview, name='dashboard-overview'),
    path('analytics/charts/', dashboard_charts, name='dashboard-charts'),
]