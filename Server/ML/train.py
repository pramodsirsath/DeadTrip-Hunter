import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression

from sklearn.metrics import r2_score,mean_absolute_error


df=pd.read_csv("ML/dataset.csv")

y=df['profit']
x=df.drop(['profit'],axis=1)

X_train , X_test , y_train , y_test = train_test_split(x , y ,test_size=0.2, random_state=42)

model = LinearRegression()

model.fit(X_train,y_train)


y_pred =model.predict(X_test)

accuracy = r2_score(y_test,y_pred)
mean_absolute_error = mean_absolute_error(y_test , y_pred)


joblib.dump(model, os.path.join(os.path.dirname(__file__), "model.pkl"))
print("Model trained and saved successfully.")