from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'expenses', views.ExpenseViewSet)

urlpatterns = [
    path('expenses/dashboard/', views.ExpenseDashboardView.as_view(), name='expense-dashboard'),
    path('expenses/statistics/', views.ExpenseStatisticsView.as_view(), name='expense-statistics'),
    path('analytics/monthly-profits/', views.MonthlyProfitsView.as_view(), name='monthly-profits'),
    path('', include(router.urls)),
]