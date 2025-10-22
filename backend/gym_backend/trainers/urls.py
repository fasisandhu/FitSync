from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TrainerViewSet

router = DefaultRouter()
router.register(r'trainers', TrainerViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
