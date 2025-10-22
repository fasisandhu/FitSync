from attendance.serializers import AttendanceSerializer
from subscriptions.serializers import SubscriptionSerializer
from trainers.serializers import TrainerSerializer
from rest_framework import serializers
from .models import Member

class MemberSerializer(serializers.ModelSerializer):
    subscriptions = SubscriptionSerializer(many=True, read_only=True)
    attendance = AttendanceSerializer(many=True, read_only=True)
    trainer_detail = TrainerSerializer(source='trainer', read_only=True)
    
    class Meta:
        model = Member
        fields = '__all__'
        read_only_fields = ('join_date',)

    def validate_email(self, value):
        # Exclude current instance during update
        if self.instance and self.instance.email == value:
            return value
        
        if Member.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value
    
    def validate_phone(self, value):
        # Exclude current instance during update
        if self.instance and self.instance.phone == value:
            return value
        
        if Member.objects.filter(phone=value).exists():
            raise serializers.ValidationError("Phone number already exists")
        return value