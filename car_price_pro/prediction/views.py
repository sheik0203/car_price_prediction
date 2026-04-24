from rest_framework import status, views, viewsets, permissions
from rest_framework.response import Response
from .models import Prediction, Vehicle
from .serializers import PredictionSerializer, VehicleSerializer
from .ml_model import CarPriceModel
from .cv_service import DamageDetector
from django.db import models
import os
import logging

logger = logging.getLogger(__name__)

# Lazy load model
_model_instance = None
def get_model():
    global _model_instance
    if _model_instance is None:
        _model_instance = CarPriceModel()
    return _model_instance

class VehicleViewSet(viewsets.ModelViewSet):
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Vehicle.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Auto-predict price if not provided
        data = serializer.validated_data
        try:
            model = get_model()
            est_price = model.predict(
                year=data.get('year'),
                present_price=data.get('showroom_price'),
                kms_driven=data.get('mileage'),
                fuel_type=data.get('fuel_type'),
                seller_type='Dealer', # Default for inventory
                transmission=data.get('transmission'),
                owner=0
            )
            serializer.save(user=self.request.user, estimated_price=est_price)
        except Exception as e:
            print(f"Prediction error: {e}")
            serializer.save(user=self.request.user)

class AnalyzeVehicleView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        images = []
        for i in range(4):
            img = request.FILES.get(f'images[{i}]') or request.FILES.get('images')
            if img: images.append(img)
        
        if not images:
            for key in request.FILES:
                images.append(request.FILES[key])

        if not images:
            return Response({"error": "No images provided for analysis"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            detector = DamageDetector()
            damages, penalty = detector.analyze_images(images)
            
            return Response({
                "damages": damages,
                "penalty_factor": penalty,
                "summary": f"{len(damages)} damage areas identified across {len(images)} angles."
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"CV Analysis Error: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PredictPriceView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        serializer = PredictionSerializer(data=request.data)
        if serializer.is_valid():
            try:
                model = get_model()
                data = serializer.validated_data
                predicted_price = model.predict(**data)
                
                # Market Analytics Logic
                price_range = [round(predicted_price * 0.95, 2), round(predicted_price * 1.05, 2)]
                
                # Heuristic Confidence Score
                confidence = 0.85
                if data['kms_driven'] < 30000: confidence += 0.05
                if data['year'] > 2020: confidence += 0.05
                
                # AI Explanations
                explanations = []
                if data['year'] > 2021: explanations.append("Low vehicle age significantly preserves asset value.")
                else: explanations.append("Agerelated depreciation is the primary value driver.")
                
                if data['kms_driven'] < 50000: explanations.append("Low mileage indicates well-maintained internals.")
                if data['fuel_type'] == 'Diesel': explanations.append("High torque diesel engines maintain strong secondary market demand.")
                
                # Mock similar cars (could be query from DB)
                similar_cars = [
                    {"model": "Luxury Sedan", "year": data['year']-1, "km": "45k", "price": f"₹{round(predicted_price*0.9, 2)}L"},
                    {"model": "Premium Coupe", "year": data['year'], "km": "32k", "price": f"₹{round(predicted_price*1.1, 2)}L"},
                ]

                # Save with extended metadata
                serializer.save(
                    user=request.user, 
                    predicted_price=predicted_price
                )
                
                response_data = serializer.data
                response_data.update({
                    "price_range": price_range,
                    "confidence": round(confidence * 100),
                    "explanation": explanations,
                    "similar_cars": similar_cars
                })
                
                return Response(response_data, status=status.HTTP_201_CREATED)
            except ValueError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PredictionHistoryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        predictions = Prediction.objects.filter(user=request.user).order_by('-created_at')
        return Response(PredictionSerializer(predictions, many=True).data)

class PredictionDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def delete(self, request, pk):
        try:
            prediction = Prediction.objects.get(pk=pk, user=request.user)
            prediction.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Prediction.DoesNotExist:
            return Response({"error": "Prediction not found"}, status=status.HTTP_404_NOT_FOUND)

class AnalyticsDashboardView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        user = request.user
        predictions = Prediction.objects.filter(user=user)
        vehicles = Vehicle.objects.filter(user=user)
        
        # Real-time aggregations for charts
        # Real-time aggregations for charts - sorted by year
        history_data = [{"year": p.year, "price": p.predicted_price} for p in predictions.order_by('year')]
        fuel_dist = [
            {"name": "Petrol", "value": vehicles.filter(fuel_type="Petrol").count()},
            {"name": "Diesel", "value": vehicles.filter(fuel_type="Diesel").count()},
            {"name": "CNG", "value": vehicles.filter(fuel_type="CNG").count()},
        ]
        
        # Get popular fuel type
        pop_fuel = vehicles.values('fuel_type').annotate(count=models.Count('fuel_type')).order_by('-count').first()
        popular_fuel = pop_fuel['fuel_type'] if pop_fuel else "N/A"
        
        return Response({
            "total_vehicles": vehicles.count(),
            "total_predictions": predictions.count(),
            "avg_price": vehicles.aggregate(models.Avg('estimated_price'))['estimated_price__avg'] or 0,
            "popular_fuel": popular_fuel,
            "history_data": history_data,
            "fuel_dist": fuel_dist
        })
