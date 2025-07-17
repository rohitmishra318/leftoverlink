# backend/ai_model/app.py

from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from geopy.geocoders import Nominatim
from geopy.distance import geodesic
import random
import time

# Import MongoDB driver
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure

# Import your matching logic from matching_model.py
from matching_model import get_coordinates, calculate_distance, preprocess_and_score

app = Flask(__name__)

# --- MongoDB Configuration ---
MONGO_URI = 'mongodb://localhost:27017/'
DB_NAME = 'leftoverlink'
NGO_COLLECTION_NAME = 'ngos'
# ✅ Use your collection name 'receives'
DONATION_COLLECTION_NAME = 'receives'

# Initialize geolocator
geolocator = Nominatim(user_agent="leftoverlink-app")

# Global DataFrame for NGOs, to be populated from MongoDB
ngos_df_global = pd.DataFrame()

def load_ngo_data_from_mongodb():
    """
    Connects to MongoDB and loads NGO data, including their last donation date,
    into the global DataFrame.
    """
    global ngos_df_global
    
    print("Attempting to load NGO data from MongoDB...")
    client = None
    try:
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        ngo_collection = db[NGO_COLLECTION_NAME]

        # ✅ Use a MongoDB Aggregation Pipeline with your collection and field names
        pipeline = [
            {
                '$lookup': {
                    'from': DONATION_COLLECTION_NAME, # Changed to 'receives'
                    'localField': '_id',
                    'foreignField': 'receivedBy',      # Changed to 'receivedBy'
                    'as': 'donations'
                }
            },
            {
                '$addFields': {
                    # Changed to 'receivedAt'
                    'last_donation_date': { '$max': '$donations.receivedAt' }
                }
            },
            {
                '$project': { # Exclude the large donations array from the result
                    'donations': 0
                }
            }
        ]

        ngo_documents = list(ngo_collection.aggregate(pipeline))
        
        if ngo_documents:
            temp_ngo_data = []
            for doc in ngo_documents:
                temp_ngo_data.append({
                    "ngo_id": str(doc.get('_id')),
                    "name": doc.get('name', 'N/A'),
                    "address": doc.get('address', 'N/A'),
                    "latitude": doc.get('lat'),
                    "longitude": doc.get('lng'),
                    "last_donation_date": doc.get('last_donation_date'), # New field
                    "accepted_food_types": doc.get('accepted_food_types', ["Cooked Meals", "Raw Vegetables", "Packaged Goods"]),
                    "capacity_min": doc.get('capacity_min', 10),
                    "capacity_max": doc.get('capacity_max', 200),
                    "urgency_preference": doc.get('urgency_preference', False),
                    "current_needs": doc.get('current_needs', [])
                })
            
            temp_ngo_data = [ngo for ngo in temp_ngo_data if ngo['latitude'] is not None and ngo['longitude'] is not None]

            if temp_ngo_data:
                ngos_df_global = pd.DataFrame(temp_ngo_data)
                # Convert date column to datetime objects for calculation
                ngos_df_global['last_donation_date'] = pd.to_datetime(ngos_df_global['last_donation_date'], errors='coerce')
                print(f"Successfully loaded {len(ngos_df_global)} NGOs into DataFrame from MongoDB.")
                print(ngos_df_global[['name', 'last_donation_date']].head())
            else:
                print("WARNING: No valid NGO documents found or loaded from MongoDB.")
        else:
            print("WARNING: No NGO documents found in the database collection.")

    except Exception as e:
        print(f"CRITICAL ERROR: An unexpected error occurred during MongoDB NGO data load: {e}")
    finally:
        if client:
            client.close()
            print("MongoDB connection closed.")
    print("-" * 30)

# Call the data loading function when the app starts
with app.app_context():
    load_ngo_data_from_mongodb()


# --- API Endpoint for Suggestions ---
@app.route('/suggest-ngos', methods=['POST'])
def suggest_ngos():
    data = request.json
    print("Received donation data:", data)
    
    required_fields = ['donor_address', 'food_type', 'quantity', 'expiry_date']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required donation fields"}), 400

    donor_address = data['donor_address']
    food_type = data['food_type']
    quantity = data['quantity']
    expiry_date_str = data['expiry_date']
    print(f"Processing donation from address: {donor_address}, food type: {food_type}, quantity: {quantity}, expiry date: {expiry_date_str}")
    
    if ngos_df_global.empty:
        print("Error: NGO data is not loaded in the AI model. Cannot provide suggestions.")
        return jsonify({"error": "AI model is not ready: NGO data unavailable."}), 503
    
    time.sleep(0.5)
    donor_coords = get_coordinates(donor_address)
    if not donor_coords:
        return jsonify({"error": f"Could not geocode donor address '{donor_address}'. Please check the address."}), 400

    donation_input = {
        "donor_address": donor_address,
        "donor_latitude": donor_coords[0],
        "donor_longitude": donor_coords[1],
        "food_type": food_type,
        "quantity": quantity,
        "expiry_date": expiry_date_str
    }
    print(f"Donation input prepared: {donation_input}")
    
    suggested_df = preprocess_and_score(donation_input, ngos_df_global)
    print(f"Suggested NGOs based on donation input: {suggested_df.shape[0]} found.")
    
    if suggested_df.empty:
        return jsonify({"ngos": [], "message": "No suitable NGOs found based on criteria."}), 200
    
    suggestions = suggested_df.head(5).to_dict(orient='records')
    print(f"Top 5 NGO suggestions: {suggestions}")
    return jsonify({"ngos": suggestions}), 200

if __name__ == '__main__':
    app.run(port=5001, debug=True)