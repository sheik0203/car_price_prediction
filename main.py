# =============================================================
#  Car Price Prediction – main.py
#  Run:  python main.py
#  Open: http://127.0.0.1:5000
# =============================================================

import os
import pickle
import warnings
import numpy as np
import pandas as pd
from flask import Flask, render_template, request, redirect, url_for, flash

warnings.filterwarnings("ignore")   # suppress sklearn version warnings

# ── App setup ─────────────────────────────────────────────────
app = Flask(__name__)
app.secret_key = "car_price_secret_2024"   # needed for flash messages

# ── Load the pre-trained model ─────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")

def load_model():
    """Load model.pkl; if missing or corrupt, retrain on car data.csv."""
    try:
        with open(MODEL_PATH, "rb") as f:
            mdl = pickle.load(f)
        # Quick sanity-check: try a dummy prediction
        mdl.predict([[5.59, 27000, 0, 6, 0, 1, 0, 1]])
        return mdl
    except Exception:
        print("[main.py] model.pkl not found / incompatible – retraining …")
        return _retrain_and_save()

def _retrain_and_save():
    """Retrain a Random-Forest model from car data.csv and save it."""
    csv_path = os.path.join(os.path.dirname(__file__), "car data.csv")
    df = pd.read_csv(csv_path)

    # Drop any duplicate / malformed header rows
    df = df[pd.to_numeric(df["Id"], errors="coerce").notna()].copy()
    df = df[["Year", "Selling_Price", "Present_Price",
             "Kms_Driven", "Fuel_Type", "Seller_Type",
             "Transmission", "Owner"]].dropna()

    import datetime
    current_year = datetime.datetime.now().year

    df["Year"]          = df["Year"].astype(int)
    df["Year"]          = current_year - df["Year"]
    df["Present_Price"] = df["Present_Price"].astype(float)
    df["Kms_Driven"]    = df["Kms_Driven"].astype(int)
    df["Selling_Price"] = df["Selling_Price"].astype(float)
    df["Owner"]         = df["Owner"].astype(int)

    df["Fuel_Type_Petrol"]       = (df["Fuel_Type"]   == "Petrol").astype(int)
    df["Fuel_Type_Diesel"]       = (df["Fuel_Type"]   == "Diesel").astype(int)
    df["Seller_Type_Individual"] = (df["Seller_Type"] == "Individual").astype(int)
    df["Transmission_Mannual"]   = (df["Transmission"]== "Manual").astype(int)

    feature_cols = ["Present_Price", "Kms_Driven", "Owner", "Year",
                    "Fuel_Type_Diesel", "Fuel_Type_Petrol",
                    "Seller_Type_Individual", "Transmission_Mannual"]
    X = df[feature_cols]
    y = df["Selling_Price"]

    from sklearn.ensemble import RandomForestRegressor
    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42)

    mdl = RandomForestRegressor(n_estimators=100, random_state=42)
    mdl.fit(X_train, y_train)

    score = mdl.score(X_test, y_test)
    print(f"[main.py] Retrained model – R² = {score:.4f}")

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(mdl, f)
    print(f"[main.py] Saved model to {MODEL_PATH}")
    return mdl

model = load_model()


# ── Route: Home (Landing page) ─────────────────────────────────
@app.route("/")
@app.route("/first")
def first():
    """Landing / home page."""
    return render_template("first.html")


# ── Route: Login ───────────────────────────────────────────────
@app.route("/login")
def login():
    """Login page (credentials handled client-side in login.html)."""
    return render_template("login.html")


# ── Route: Upload dataset ──────────────────────────────────────
@app.route("/upload")
def upload():
    """Dataset upload page."""
    return render_template("upload.html")


# ── Route: Preview uploaded dataset ───────────────────────────
@app.route("/preview", methods=["POST"])
def preview():
    """
    Receives the uploaded CSV, reads it with pandas, and shows
    the first 50 rows in preview.html as an HTML table.
    After preview the user clicks 'Train | Test' → goes to /prediction1.
    """
    if "datasetfile" not in request.files:
        flash("No file part in the request.")
        return redirect(url_for("upload"))

    dataset_file = request.files["datasetfile"]

    if dataset_file.filename == "":
        flash("No file selected. Please choose a CSV file.")
        return redirect(url_for("upload"))

    try:
        df = pd.read_csv(dataset_file, encoding="unicode_escape")
        # If the CSV has an 'Id' column, use it as index; else just show as-is
        if "Id" in df.columns:
            df.set_index("Id", inplace=True)
        # Show only first 50 rows to keep the page snappy
        df_preview = df.head(50)
        return render_template("preview.html", df_view=df_preview)
    except Exception as e:
        flash(f"Error reading file: {e}")
        return redirect(url_for("upload"))


# ── Route: Prediction form ─────────────────────────────────────
@app.route("/prediction1")
def index():
    """
    Car price prediction form page (index.html).
    Navigated to after the user clicks 'Train | Test' in preview.html.
    """
    return render_template("index.html")


# ── Route: Run prediction ──────────────────────────────────────
@app.route("/predict", methods=["POST"])
def predict():
    """
    Receives form data from index.html, runs the ML model,
    and returns the predicted selling price.

    Feature order expected by the model:
        [Present_Price, Kms_Driven, Owner, Year (age),
         Fuel_Type_Diesel, Fuel_Type_Petrol,
         Seller_Type_Individual, Transmission_Mannual]
    """
    try:
        # Get and validate inputs
        year_input = request.form.get("Year")
        present_price_input = request.form.get("Present_Price")
        kms_driven_input = request.form.get("Kms_Driven")
        owner_input = request.form.get("Owner")

        if not all([year_input, present_price_input, kms_driven_input, owner_input]):
            return render_template("index.html", prediction_text="⚠ Please fill in all fields.")

        year = int(year_input)
        present_price = float(present_price_input)
        kms_driven = int(kms_driven_input)
        owner = int(owner_input)

        # 1. Price Validation & Conversion (Ensure it's in Lakhs)
        # If user enters a large value (e.g. 500,000 instead of 5.0), we convert it to lakhs.
        if present_price > 1000:
            present_price = present_price / 100000
            print(f"[DEBUG] Auto-converted Present_Price from {present_price_input} to {present_price} Lakhs")

        # 2. Dynamic Car Age Calculation
        import datetime
        current_year = datetime.datetime.now().year
        car_age = current_year - year

        # 3. Input Validation
        if year < 1900 or year > current_year:
            return render_template("index.html", prediction_text=f"⚠ Invalid Year. Please enter a year between 1900 and {current_year}.")
        if present_price <= 0 or present_price > 1000: # Max 1000 lakhs = 10 Cr
            return render_template("index.html", prediction_text="⚠ Invalid Showroom Price. Please enter price in Lakhs (e.g. 5.5 for 5,50,000).")
        if kms_driven < 0 or kms_driven > 1000000:
            return render_template("index.html", prediction_text="⚠ Invalid Kilometers. Please enter a value between 0 and 1,000,000.")
        if owner < 0 or owner > 3:
            return render_template("index.html", prediction_text="⚠ Owner count should be between 0 and 3.")

        # Fuel type encoding
        fuel_raw = request.form.get("Fuel_Type_Petrol", "Petrol")
        fuel_type_petrol = 1 if fuel_raw == "Petrol" else 0
        fuel_type_diesel = 1 if fuel_raw == "Diesel" else 0

        # Seller type encoding
        seller_raw = request.form.get("Seller_Type_Individual", "Dealer")
        seller_type_individual = 1 if seller_raw == "Individual" else 0

        # Transmission encoding
        trans_raw = request.form.get("Transmission_Mannual", "Mannual")
        transmission_mannual = 1 if trans_raw == "Mannual" else 0

        # Feature order matches training: [Present_Price, Kms_Driven, Owner, Car_Age, Fuel_Type_Diesel, Fuel_Type_Petrol, Seller_Type_Individual, Transmission_Mannual]
        features = [[
            present_price,
            kms_driven,
            owner,
            car_age,
            fuel_type_diesel,
            fuel_type_petrol,
            seller_type_individual,
            transmission_mannual
        ]]

        # Print feature vector for debugging
        print(f"[DEBUG] Feature Vector: {features}")

        prediction = model.predict(features)
        output = round(float(prediction[0]), 2)

        if output < 0:
            result_text = "Sorry, the model predicts this car cannot be sold at a profit."
        else:
            result_text = f"✅ Estimated Selling Price: ₹ {output} Lakhs"

        return render_template("index.html", prediction_text=result_text)

    except ValueError:
        return render_template("index.html", prediction_text="⚠ Invalid input type. Please enter numbers where required.")
    except Exception as e:
        print(f"[ERROR] Prediction failed: {e}")
        error_text = f"⚠ Prediction error: {e}. Please check your inputs."
        return render_template("index.html", prediction_text=error_text)


# ── Route: Analysis / Chart ────────────────────────────────────
@app.route("/chart")
def chart():
    return render_template("chart.html")


# ── Route: Prediction results page (alternative) ──────────────
@app.route("/prediction")
def prediction():
    return render_template("home.html")


# ── Remaining routes referenced by templates ──────────────────
@app.route("/crime")
def crime():
    return render_template("crime.html")

@app.route("/crimes")
def crimes():
    return render_template("crimes.html")

@app.route("/total")
def total():
    return render_template("total.html")

@app.route("/theft")
def theft():
    return render_template("theft.html")


# ── Run ───────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 55)
    print("  Car Price Prediction App")
    print("  Open: http://127.0.0.1:5000")
    print("=" * 55)
    app.run(debug=True)
