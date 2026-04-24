from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.core.files.storage import default_storage
import os
import subprocess

class DatasetUploadView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        if 'file' not in request.FILES:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
        
        file = request.FILES['file']
        if not file.name.endswith('.csv'):
            return Response({"error": "Only CSV files are allowed"}, status=status.HTTP_400_BAD_REQUEST)

        # Save file to root for training script access
        file_path = os.path.join(os.path.dirname(__file__), '..', 'car data.csv')
        
        with open(file_path, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)

        # Trigger retraining script
        try:
            train_script = os.path.join(os.path.dirname(__file__), '..', 'ml', 'train_model.py')
            result = subprocess.run(['python', train_script], capture_output=True, text=True)
            
            if result.returncode == 0:
                return Response({
                    "message": "Dataset uploaded and model retrained successfully",
                    "log": result.stdout
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "error": "Model retraining failed",
                    "details": result.stderr
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            return Response({"error": f"Internal process error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
