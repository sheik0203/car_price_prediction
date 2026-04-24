from django.db import models
from django.conf import settings

class Prediction(models.Model):
    FUEL_TYPES = [('Petrol', 'Petrol'), ('Diesel', 'Diesel'), ('CNG', 'CNG')]
    SELLER_TYPES = [('Dealer', 'Dealer'), ('Individual', 'Individual')]
    TRANSMISSION_TYPES = [('Manual', 'Manual'), ('Automatic', 'Automatic')]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='predictions')
    year = models.IntegerField()
    present_price = models.FloatField()
    kms_driven = models.IntegerField()
    fuel_type = models.CharField(max_length=10, choices=FUEL_TYPES)
    owner = models.IntegerField()
    seller_type = models.CharField(max_length=15, choices=SELLER_TYPES, default='Individual')
    transmission = models.CharField(max_length=10, choices=TRANSMISSION_TYPES, default='Manual')
    
    # Advanced Condition Inputs
    city = models.CharField(max_length=50, default='Mumbai')
    exterior_condition = models.CharField(max_length=20, default='Good')
    interior_condition = models.CharField(max_length=20, default='Good')
    accident_history = models.CharField(max_length=30, default='No Accident')
    service_history = models.CharField(max_length=30, default='Full')
    
    predicted_price = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.name} - {self.predicted_price} Lakhs"

class Vehicle(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='vehicles')
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.IntegerField()
    mileage = models.IntegerField()
    fuel_type = models.CharField(max_length=20, choices=Prediction.FUEL_TYPES)
    transmission = models.CharField(max_length=20, choices=Prediction.TRANSMISSION_TYPES)
    showroom_price = models.FloatField()
    estimated_price = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.brand} {self.model} ({self.year})"
