from django.contrib import admin
from django.urls import path, include
from users.views import RegisterView
from rest_framework_simplejwt.views import TokenObtainPairView

admin.site.site_header = "Car Price AI Admin"
admin.site.site_title = "Car Price AI Portal"
admin.site.index_title = "Welcome to the Enterprise Car AI Management"

from users.views import RegisterView, GoogleLoginView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/login/', TokenObtainPairView.as_view(), name='login'),
    path('api/auth/google/', GoogleLoginView.as_view(), name='google_login'),
    # Prefixing all prediction app routes with /api/
    path('api/', include('prediction.urls')),
]
