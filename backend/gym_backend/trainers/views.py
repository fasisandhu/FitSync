from rest_framework import viewsets
from .models import Trainer
from .serializers import TrainerSerializer
from django_filters.rest_framework import DjangoFilterBackend

class TrainerViewSet(viewsets.ModelViewSet):
    queryset = Trainer.objects.all()
    serializer_class = TrainerSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_active', 'gender']
