import joblib
import os
import numpy as np

class CarPriceModel:
    def __init__(self):
        ml_dir = os.path.join(os.path.dirname(__file__), '..', 'ml')
        self.model = joblib.load(os.path.join(ml_dir, 'car_price_model.pkl'))
        self.le_fuel = joblib.load(os.path.join(ml_dir, 'le_fuel.pkl'))
        self.le_seller = joblib.load(os.path.join(ml_dir, 'le_seller.pkl'))
        self.le_trans = joblib.load(os.path.join(ml_dir, 'le_trans.pkl'))

    def predict(self, year, present_price, kms_driven, fuel_type, seller_type, transmission, owner, **kwargs):
        # Extract advanced inspection metrics for realism adjustments
        ext_cond = kwargs.get('exterior_condition', 'Good')
        int_cond = kwargs.get('interior_condition', 'Good')
        acc_hist = kwargs.get('accident_history', 'No Accident')
        
        from datetime import datetime
        current_year = datetime.now().year
        car_age = current_year - int(year)
        
        # Debug Logging
        print("--- Inference Debug ---")
        print("Manufacturing Year:", year)
        print("Car Age:", car_age)

        # Preprocessing: Categorical Encoding
        try:
            fuel_enc = self.le_fuel.transform([fuel_type])[0]
            seller_enc = self.le_seller.transform([seller_type])[0]
            trans_enc = self.le_trans.transform([transmission])[0]
        except Exception as e:
            print(f"Encoding Error: {e}")
            fuel_enc, seller_enc, trans_enc = 0, 0, 0

        # Feature Vector: EXACT ORDER REQUIRED BY USER
        # [present_price, kms_driven, car_age, fuel_type, seller_type, transmission, owner]
        features = np.array([[
            float(present_price), 
            int(kms_driven), 
            car_age, 
            fuel_enc, 
            seller_enc, 
            trans_enc,
            int(owner)
        ]])
        
        print("Feature Vector (to model):", features)

        # Model Inference (60% Weight)
        prediction = self.model.predict(features)
        ml_price = float(prediction[0])
        
        # Rule-Based Depreciation (40% Weight)
        # 0–1 year → 10% dep | 2–3 years → 20% | 4–5 years → 35% | 6+ years → 50%
        if car_age <= 1:
            dep_factor = 0.90
        elif car_age <= 3:
            dep_factor = 0.80
        elif car_age <= 5:
            dep_factor = 0.65
        else:
            dep_factor = 0.50
            
        rule_based_price = float(present_price) * dep_factor
        
        # 4. Hybrid Calculation
        # final_price = 0.6 * ml_prediction + 0.4 * depreciation_price
        final_price = (0.6 * ml_price) + (0.4 * rule_based_price)
        
        print(f"DEBUG: ML Result: {ml_price} | Rule Result: {rule_based_price}")
        print(f"DEBUG: Final Hybrid Price: {final_price}")

        # 5. Condition-Based Heuristic Adjustments (The "Cars24" Realism Layer)
        condition_adj = 1.0
        
        # Exterior Adjustments
        ext_map = {'Excellent': 1.05, 'Good': 1.0, 'Average': 0.90, 'Poor': 0.80}
        condition_adj *= ext_map.get(ext_cond, 1.0)
        
        # Interior Adjustments
        int_map = {'Excellent': 1.05, 'Good': 1.0, 'Average': 0.92, 'Poor': 0.82}
        condition_adj *= int_map.get(int_cond, 1.0)
        
        # Accident Adjustments
        acc_map = {'No Accident': 1.0, 'Minor': 0.85, 'Major': 0.60}
        condition_adj *= acc_map.get(acc_hist, 1.0)
        
        final_price = final_price * condition_adj
        
        print(f"DEBUG: Condition Adj Factor: {condition_adj} | New Final: {final_price}")

        # 6. Logical Constraints
        if final_price > float(present_price):
            final_price = float(present_price) * 0.9
            
        print("-----------------------")
        return round(max(0.1, final_price), 2)
