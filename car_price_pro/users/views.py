from rest_framework import status, views, permissions
from rest_framework.response import Response
from .serializers import UserRegistrationSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from .models import User

class RegisterView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                return Response({
                    "message": "User registered successfully!",
                    "user": {"email": user.email, "name": user.name}
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                print(f"DATABASE ERROR: {str(e)}")
                return Response({"error": "Database error during registration."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        print(f"VALIDATION ERROR: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GoogleLoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({"error": "No token provided"}, status=400)
            
        try:
            # Verify the ID token using Google's libraries
            id_info = id_token.verify_oauth2_token(
                token, 
                requests.Request(), 
                settings.GOOGLE_CLIENT_ID
            )

            # Extract user info
            email = id_info.get('email')
            name = id_info.get('name', '')
            picture = id_info.get('picture', '')

            # Find or create user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={'name': name}
            )

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': {
                    'name': user.name,
                    'email': user.email,
                    'avatar': picture,
                    'role': 'Enterprise Node',
                    'provider': 'google'
                },
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'is_new': created
            })

        except ValueError:
            return Response({"error": "Invalid token"}, status=400)
        except Exception as e:
            print(f"GOOGLE AUTH ERROR: {str(e)}")
            return Response({"error": "Internal server error"}, status=500)
