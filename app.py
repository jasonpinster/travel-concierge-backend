from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "https://travel-concierge-frontend.vercel.app"])

# Load Amadeus credentials from environment variables
AMADEUS_CLIENT_ID = os.getenv("AMADEUS_CLIENT_ID")
AMADEUS_CLIENT_SECRET = os.getenv("AMADEUS_CLIENT_SECRET")

def get_amadeus_token():
    url = "https://test.api.amadeus.com/v1/security/oauth2/token"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = {
        "grant_type": "client_credentials",
        "client_id": AMADEUS_CLIENT_ID,
        "client_secret": AMADEUS_CLIENT_SECRET,
    }
    response = requests.post(url, headers=headers, data=data)
    return response.json().get("access_token")

@app.route("/plan_trip", methods=["GET", "POST"])
def plan_trip():
    # Support both POST and GET
    if request.method == "POST":
        user_input = request.json.get("user_input", "")
    else:
        user_input = request.args.get("user_input", "")

    # Basic logic for testing — improve later with LLMs or APIs
    destination = "Sydney" if "beach" in user_input.lower() else "Melbourne"
    itinerary = f"Destination: {destination}\nDay 1: Arrival\nDay 2: Activities\nDay 3: Return"
    dining_recommendations = ["Best seafood restaurant", "Rooftop dining", "Cafe by the beach"]

    return jsonify({
        "itinerary": itinerary,
        "dining_recommendations": dining_recommendations
    })

@app.route("/search_hotels", methods=["GET"])
def search_hotels():
    location = request.args.get("location", "Melbourne")
    token = get_amadeus_token()
    
    # Get IATA city code from Amadeus
    location_url = f"https://test.api.amadeus.com/v1/reference-data/locations?keyword={location}&subType=CITY"
    headers = {"Authorization": f"Bearer {token}"}
    city_data = requests.get(location_url, headers=headers).json()
    city_code = city_data["data"][0]["iataCode"]

    # Get hotels using IATA city code
    hotels_url = f"https://test.api.amadeus.com/v1/shopping/hotel-offers?cityCode={city_code}"
    hotel_data = requests.get(hotels_url, headers=headers).json()
    hotel_names = [hotel['hotel']['name'] for hotel in hotel_data.get("data", [])]

    return jsonify({"hotels": hotel_names})

@app.route("/search_flights", methods=["GET"])
def search_flights():
    destination = request.args.get("destination", "SYD")
    token = get_amadeus_token()

    url = (
        f"https://test.api.amadeus.com/v2/shopping/flight-offers?"
        f"originLocationCode=MEL&destinationLocationCode={destination}&"
        f"departureDate=2025-09-10&adults=1"
    )
    headers = {"Authorization": f"Bearer {token}"}
    flight_data = requests.get(url, headers=headers).json()

    flights = [
        f"{f['itineraries'][0]['segments'][0]['carrierCode']} - {f['price']['total']} AUD"
        for f in flight_data.get("data", [])
    ]

    return jsonify({"flights": flights})

if __name__ == "__main__":
    app.run(debug=True)
