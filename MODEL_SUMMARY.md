# Model Summary

## Algorithm used
- Random Forest Regressor (`sklearn.ensemble.RandomForestRegressor`)
- Trained with `n_estimators=100` and `random_state=42`

## Purpose
- Predict the used car resale price (`Selling_Price`).
- The Flask application uses this model to estimate price from user-provided car attributes.

## Dataset used
- File: `car data.csv`
- Training features selected from the dataset:
  - `Present_Price`
  - `Kms_Driven`
  - `Owner`
  - `Year` (converted to car age)
  - `Fuel_Type` (encoded as petrol/diesel)
  - `Seller_Type` (encoded as Individual/Dealer)
  - `Transmission` (encoded as Manual/Automatic)

## Dataset volume
- Total records: `301`

## Notes
- The app drops malformed rows and duplicates before training.
- The target label is `Selling_Price`.
- The model is saved as `model.pkl` in the project root.
