import json
import os
import sys

import joblib
import pandas as pd


FEATURE_COLUMNS = ["distance", "fare", "fuel_price", "mileage", "weight"]


def main():
    if len(sys.argv) < 2:
        raise ValueError("Prediction features JSON is required")

    features = json.loads(sys.argv[1])
    row = {
        column: float(features.get(column) or 0)
        for column in FEATURE_COLUMNS
    }

    model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
    model = joblib.load(model_path)
    prediction = model.predict(pd.DataFrame([row], columns=FEATURE_COLUMNS))[0]

    print(round(float(prediction), 2))


if __name__ == "__main__":
    main()
