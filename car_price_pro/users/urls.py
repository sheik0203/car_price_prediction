from django.urls import path
from .views import RegisterView
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path('', RegisterView.as_view(), name='register_or_login'), # This handles the base /api/register/ or /api/login/
]
