# backend/ai_model/matching_model.py

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from geopy.geocoders import Nominatim
from geopy.distance import geodesic

# Initialize geolocator for converting addresses to coordinates
geolocator = Nominatim(user_agent="leftoverlink-ai-service")

def get_coordinates(address):
    """
    Converts an address string to (latitude, longitude) coordinates.
    Returns None if geocoding fails.
    """
    try:
        location = geolocator.geocode(address, timeout=10) # Increased timeout
        if location:
            return (location.latitude, location.longitude)
        print(f"Warning: Could not geocode address: {address}")
        return None
    except Exception as e:
        print(f"Error geocoding {address}: {e}")
        return None

def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculates the geodesic (great-circle) distance between two points
    given their latitude and longitude in kilometers.
    Returns infinity (np.inf) if any coordinate is missing.
    """
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return np.inf # Return infinity if coordinates are missing
    point1 = (lat1, lon1)
    point2 = (lat2, lon2)
    return geodesic(point1, point2).km

# backend/ai_model/matching_model.py

# ... (keep all imports and other functions like get_coordinates, calculate_distance) ...

def preprocess_and_score(donation_input, ngos_df):
    """
    Calculates a match score for each NGO, now including a recency score
    to prioritize NGOs that haven't received donations recently.
    """
    # ... (keep the FOOD_TYPE_MAP and initial data processing) ...
    FOOD_TYPE_MAP = {
        'raw': 'Raw Vegetables',
        'cooked': 'Cooked Meals',
        'packaged': 'Packaged Goods'
    }

    if ngos_df.empty:
        return pd.DataFrame()

    donation_food_keyword = donation_input['food_type'].lower()
    donation_food_type = FOOD_TYPE_MAP.get(donation_food_keyword, donation_food_keyword)
    donation_quantity = donation_input['quantity']
    donation_expiry_date_str = donation_input['expiry_date']
    donor_lat = donation_input.get('donor_latitude')
    donor_lon = donation_input.get('donor_longitude')
    
    # ... (keep urgency calculation) ...
    try:
        donation_expiry_date = datetime.strptime(donation_expiry_date_str, "%Y-%m-%d")
    except ValueError:
        return pd.DataFrame()
    days_until_expiry = (donation_expiry_date - datetime.now()).days
    urgency_score_donation = 1.0
    if days_until_expiry <= 1: urgency_score_donation = 3.0
    elif days_until_expiry <= 3: urgency_score_donation = 2.0
    
    ngos_scored_df = ngos_df.copy()

    # ... (keep distance calculation) ...
    ngos_scored_df['distance_km'] = ngos_scored_df.apply(
        lambda row: calculate_distance(donor_lat, donor_lon, row['latitude'], row['longitude']), axis=1
    )

    # --- ✅ ADJUSTED Weights for different criteria ---
    WEIGHT_DISTANCE = 0.30
    WEIGHT_FOOD_TYPE = 0.25
    WEIGHT_QUANTITY = 0.15
    WEIGHT_URGENCY = 0.10
    WEIGHT_RECENCY = 0.20 # New weight for fairness
    WEIGHT_CURRENT_NEEDS = 0.15 # Bonus weight

    # --- Score Calculations (Distance, Food Type, Quantity, Urgency remain the same) ---
    # 1. Distance Score (no change)
    max_distance = ngos_scored_df['distance_km'].replace([np.inf, -np.inf], np.nan).max()
    if pd.isna(max_distance) or max_distance == 0:
        ngos_scored_df['distance_score'] = 1.0
    else:
        ngos_scored_df['distance_score'] = (1 - (ngos_scored_df['distance_km'] / max_distance)).clip(0, 1)
    
    # ... (food_type_score, quantity_score, final_urgency_score, current_needs_bonus logic is the same) ...
    ngos_scored_df['food_type_score'] = ngos_scored_df['accepted_food_types'].apply(lambda types: 1.0 if donation_food_type in types else 0.0)
    ngos_scored_df['quantity_score'] = ngos_scored_df.apply(lambda row: 1.0 if row['capacity_min'] <= donation_quantity <= row['capacity_max'] else 0.5, axis=1)
    ngos_scored_df['urgency_score_ngo'] = ngos_scored_df['urgency_preference'].apply(lambda pref: 1.0 if pref and urgency_score_donation > 1.0 else 0.5)
    ngos_scored_df['final_urgency_score'] = urgency_score_donation * ngos_scored_df['urgency_score_ngo']
    ngos_scored_df['current_needs_bonus'] = ngos_scored_df['current_needs'].apply(lambda needs: WEIGHT_CURRENT_NEEDS if donation_food_type in needs else 0.0)


    # --- ✅ NEW: Recency Score Calculation ---
    current_time = pd.to_datetime(datetime.now())
    # Calculate days since last donation. Fill NaT (never donated) with a large number (e.g., 999 days).
    ngos_scored_df['days_since_donation'] = (current_time - ngos_scored_df['last_donation_date']).dt.days.fillna(999)
    
    # Normalize the score: the more days, the higher the score.
    max_days = ngos_scored_df['days_since_donation'].max()
    if max_days > 0:
        ngos_scored_df['recency_score'] = (ngos_scored_df['days_since_donation'] / max_days).clip(0, 1)
    else:
        ngos_scored_df['recency_score'] = 1.0 # All have donated recently or never

    # --- ✅ UPDATED: Calculate final combined match score ---
    ngos_scored_df['match_score'] = (
        ngos_scored_df['distance_score'] * WEIGHT_DISTANCE +
        ngos_scored_df['food_type_score'] * WEIGHT_FOOD_TYPE +
        ngos_scored_df['quantity_score'] * WEIGHT_QUANTITY +
        ngos_scored_df['final_urgency_score'] * WEIGHT_URGENCY +
        ngos_scored_df['recency_score'] * WEIGHT_RECENCY + # Add recency score to the mix
        ngos_scored_df['current_needs_bonus']
    )

    # --- Filtering and Sorting (no changes) ---
    ngos_scored_df = ngos_scored_df[ngos_scored_df['food_type_score'] > 0]
    ngos_scored_df = ngos_scored_df[ngos_scored_df['distance_km'] != np.inf]
    ngos_scored_df = ngos_scored_df.sort_values(by='match_score', ascending=False)
    
    print("\n--- Detailed NGO Scores (including recency) ---")
    print(ngos_scored_df[['name', 'distance_km', 'recency_score', 'days_since_donation', 'match_score']].head())
    
    return ngos_scored_df[['ngo_id', 'name', 'address', 'distance_km', 'match_score']]