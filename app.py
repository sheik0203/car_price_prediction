from flask import Flask, render_template, request, jsonify
import pickle
import numpy as np
import sklearn
import datetime
from sklearn.preprocessing import StandardScaler

app = Flask(__name__)
model = pickle.load(open('model.pkl', 'rb'))

@app.route('/', methods=['GET'])
@app.route('/first')
def first():
    return render_template('first.html')

@app.route('/home')
def Home():
    return render_template('index.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/upload')
def upload():
    return render_template('upload.html')

@app.route('/prediction1')
def index():
    return render_template('index.html')

@app.route('/chart')
def chart():
    return render_template('chart.html')

@app.route('/prediction')
def prediction():
    return render_template('home.html')

@app.route('/crime')
def crime():
    return render_template('crime.html')

@app.route('/crimes')
def crimes():
    return render_template('crimes.html')

@app.route('/total')
def total():
    return render_template('total.html')

@app.route('/theft')
def theft():
    return render_template('theft.html')


standard_to = StandardScaler()

@app.route("/predict", methods=['POST'])
def predict():
    if request.method == 'POST':
        try:
            # Get Inputs
            Year = int(request.form['Year'])
            Present_Price = float(request.form['Present_Price'])
            Kms_Driven = int(request.form['Kms_Driven'])
            Owner = int(request.form['Owner'])
            
            # Dynamic Car Age
            current_year = datetime.datetime.now().year
            car_age = current_year - Year

            # Validation & Conversion (Price in Lakhs)
            if Present_Price > 1000:
                Present_Price = Present_Price / 100000
                print(f"[DEBUG] Auto-converted Present_Price to {Present_Price} Lakhs")

            if Year < 1900 or Year > current_year:
                return render_template('index.html', prediction_text=f"⚠ Invalid Year. Use 1900-{current_year}")
            if Present_Price <= 0:
                return render_template('index.html', prediction_text="⚠ Showroom price must be positive")

            # Fuel type encoding
            Fuel_Type_Petrol = request.form['Fuel_Type_Petrol']
            if Fuel_Type_Petrol == 'Petrol':
                Fuel_Type_Petrol = 1
                Fuel_Type_Diesel = 0
            elif Fuel_Type_Petrol == 'Diesel':
                Fuel_Type_Petrol = 0
                Fuel_Type_Diesel = 1
            else:
                Fuel_Type_Petrol = 0
                Fuel_Type_Diesel = 0

            # Seller type encoding
            Seller_Type_Individual = request.form['Seller_Type_Individual']
            Seller_Type_Individual = 1 if Seller_Type_Individual == 'Individual' else 0

            # Transmission encoding
            Transmission_Mannual = request.form['Transmission_Mannual']
            Transmission_Mannual = 1 if Transmission_Mannual == 'Mannual' else 0

            # Feature order: [Present_Price, Kms_Driven, Owner, Age, Fuel_Type_Diesel, Fuel_Type_Petrol, Seller_Type_Individual, Transmission_Mannual]
            features = [[Present_Price, Kms_Driven, Owner, car_age, Fuel_Type_Diesel, Fuel_Type_Petrol, Seller_Type_Individual, Transmission_Mannual]]
            print(f"[DEBUG] Feature Vector: {features}")

            prediction = model.predict(features)
            output = round(prediction[0], 2)

            if output < 0:
                return render_template('index.html', prediction_text="Sorry, this car has negligible resale value.")
            else:
                return render_template('index.html', prediction_text=f"Estimated Selling Price: ₹ {output} Lakhs")
        
        except ValueError:
            return render_template('index.html', prediction_text="⚠ Please enter valid numerical values.")
        except Exception as e:
            print(f"[ERROR] {e}")
            return render_template('index.html', prediction_text="⚠ An error occurred during prediction.")
    else:
        return render_template('index.html')

if __name__ == "__main__":
    app.run(debug=True)
