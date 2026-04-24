import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from xgboost import XGBRegressor
from sklearn.metrics import r2_score, mean_absolute_error

def train_best_model():
    # Load dataset
    data_path = os.path.join(os.path.dirname(__file__), '..', '..', 'car data.csv')
    if not os.path.exists(data_path):
        print(f"Error: Dataset not found at {data_path}")
        return

    df = pd.read_csv(data_path)
    df.dropna(inplace=True)
    
    # Feature Engineering
    current_year = 2024
    df['Car_Age'] = current_year - df['Year']
    
    # Selecting Features (Ordered as per requirement)
    features = ['Present_Price', 'Kms_Driven', 'Car_Age', 'Fuel_Type', 'Seller_Type', 'Transmission', 'Owner']
    X = df[features].copy()
    y = df['Selling_Price']

    # Encoding Categorical Data
    le_fuel = LabelEncoder()
    le_seller = LabelEncoder()
    le_trans = LabelEncoder()

    X['Fuel_Type'] = le_fuel.fit_transform(X['Fuel_Type'].astype(str))
    X['Seller_Type'] = le_seller.fit_transform(X['Seller_Type'].astype(str))
    X['Transmission'] = le_trans.fit_transform(X['Transmission'].astype(str))
    
    # Force all columns to be numeric (handling things like commas in Kms_Driven)
    for col in ['Present_Price', 'Kms_Driven', 'Owner', 'Car_Age']:
        X[col] = pd.to_numeric(X[col], errors='coerce')
    
    # Drop any new NaNs created by coercion
    X.dropna(inplace=True)
    y = y[X.index] # Align y with cleaned X

    print("Final Feature data types:\n", X.dtypes)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Models to compare
    models = {
        "Linear Regression": LinearRegression(),
        "Random Forest": RandomForestRegressor(n_estimators=100, random_state=42),
        "XGBoost": XGBRegressor(n_estimators=100, learning_rate=0.1, random_state=42)
    }

    best_model = None
    best_score = -float('inf')
    best_name = ""

    for name, model in models.items():
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        score = r2_score(y_test, y_pred)
        print(f"{name} R2 Score: {score:.4f}")
        
        if score > best_score:
            best_score = score
            best_model = model
            best_name = name

    print(f"\nBest Model: {best_name} with R2: {best_score:.4f}")

    # Save encoders and model
    model_dir = os.path.join(os.path.dirname(__file__), '..', 'ml')
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)

    joblib.dump(best_model, os.path.join(model_dir, 'car_price_model.pkl'))
    joblib.dump(le_fuel, os.path.join(model_dir, 'le_fuel.pkl'))
    joblib.dump(le_seller, os.path.join(model_dir, 'le_seller.pkl'))
    joblib.dump(le_trans, os.path.join(model_dir, 'le_trans.pkl'))
    
    print("Model and Encoders saved successfully.")

if __name__ == "__main__":
    train_best_model()
