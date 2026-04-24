from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VehicleViewSet, PredictPriceView, 
    PredictionHistoryView, AnalyticsDashboardView,
    PredictionDetailView, AnalyzeVehicleView
)

router = DefaultRouter()
router.register(r'vehicles', VehicleViewSet, basename='vehicle')

urlpatterns = [
    path('', include(router.urls)),
    path('predict/', PredictPriceView.as_view(), name='predict'),
    path('history/', PredictionHistoryView.as_view(), name='history'),
    path('history/<int:pk>/', PredictionDetailView.as_view(), name='history-detail'),
    path('analytics/', AnalyticsDashboardView.as_view(), name='analytics'),
    path('analyze-vehicle/', AnalyzeVehicleView.as_view(), name='analyze-vehicle'),
]
