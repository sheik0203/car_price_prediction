from django.contrib import admin
from .models import Prediction, Vehicle

@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = ('user', 'year', 'fuel_type', 'predicted_price', 'created_at')
    list_filter = ('fuel_type', 'transmission', 'created_at')
    search_fields = ('user__email', 'year')

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('brand', 'model', 'year', 'fuel_type', 'estimated_price', 'user')
    list_filter = ('brand', 'fuel_type', 'year')
    search_fields = ('brand', 'model', 'user__email')
