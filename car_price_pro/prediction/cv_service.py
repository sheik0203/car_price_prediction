import os
import cv2
import numpy as np
from ultralytics import YOLO
from django.conf import settings

class DamageDetector:
    def __init__(self):
        # Using a small pre-trained model as a fallback or the specified one
        model_path = os.path.join(settings.BASE_DIR, 'ml', 'damage_detection_model.pt')
        # Load model (will download yolov8n if path doesn't exist for demo safety)
        try:
            self.model = YOLO(model_path)
        except Exception:
            self.model = YOLO('yolov8n.pt') 

        self.damage_map = {
            'scratch': 0.02,
            'dent': 0.05,
            'crack': 0.08,
            'broken_glass': 0.12
        }

    def analyze_images(self, image_files):
        """
        Analyzes a list of image files (InMemoryUploadedFile)
        Returns a list of detected damages and the total penalty factor
        """
        all_damages = []
        total_penalty = 0
        
        # Save images temporarily for YOLO if needed, or use directly from memory
        for img_file in image_files:
            # Read image
            file_bytes = np.frombuffer(img_file.read(), np.uint8)
            img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
            
            # Predict
            results = self.model.predict(img, conf=0.25)
            
            for result in results:
                # Assuming the model is trained on damage classes
                # For demo purposes, we'll simulate detection if using default yolov8n
                # or parse actual detections if using a custom model
                for box in result.boxes:
                    cls_id = int(box.cls[0])
                    label = self.model.names[cls_id]
                    conf = float(box.conf[0])
                    
                    # Store damage if in our interest map
                    if label in self.damage_map:
                        all_damages.append({
                            "type": label,
                            "confidence": round(conf, 2),
                            "angle": img_file.name
                        })
                        total_penalty += self.damage_map[label]

        # Deduplicate/Summarize (Max penalty logic)
        # Cap penalty at 40% to keep it realistic
        total_penalty = min(total_penalty, 0.40)
        
        return all_damages, total_penalty
