from rest_framework import serializers
from .models import Prediction, Vehicle
from django.contrib.auth import get_user_model

User = get_user_model()

class PredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prediction
        fields = '__all__'
        read_only_fields = ('user', 'predicted_price', 'created_at')

class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = '__all__'
        read_only_fields = ('user', 'created_at')
