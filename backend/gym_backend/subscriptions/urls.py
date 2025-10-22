from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PaymentViewSet, PlanViewSet, SubscriptionViewSet,
    monthly_revenue, payment_methods, renewal_rate
)

router = DefaultRouter()
router.register(r'plans', PlanViewSet)
router.register(r'subscriptions', SubscriptionViewSet)
router.register(r'payments', PaymentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # Payment analytics
    path('payments/analytics/monthly-revenue/', monthly_revenue, name='monthly-revenue'),
    path('payments/analytics/payment-methods/', payment_methods, name='payment-methods'),
    # Subscription analytics
    path('subscriptions/analytics/renewal-rate/', renewal_rate, name='renewal-rate'),
]
