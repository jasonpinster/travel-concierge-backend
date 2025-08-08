// App.jsx

import React, { useState } from "react";
import axios from "axios";

export default function App() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [flights, setFlights] = useState([]);

  const handlePlanTrip = async () => {
    setLoading(true);
    setResult(null);
    setHotels([]);
    setFlights([]);
    try {
      const response = await axios.post("https://travel-concierge-backend-meq3.onrender.com/plan_trip", {
  user_input: input,
});
      setResult(response.data);

      const dest = response.data.itinerary?.split("\n")[0]?.replace("Destination:", "").trim();
      if (dest) {
       const hotelRes = await axios.get("https://travel-concierge-backend-meq3.onrender.com/search_hotels", {
  params: { location: dest },
});
        setHotels(hotelRes.data.hotels);

        const flightRes = await axios.get("https://travel-concierge-backend-meq3.onrender.com/search_flights", {
  params: { destination: dest },
});
        setFlights(flightRes.data.flights);
      }
    } catch (err) {
      console.error("Error planning trip:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 font-sans">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">AI Travel Concierge</h1>
        <p className="mb-4 text-gray-600">
          Describe your ideal weekend trip from Melbourne. Include any preferences
          like beach, budget, food, or activities.
        </p>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded mb-4"
          rows={4}
          placeholder="e.g. A relaxing beach trip under $800 with seafood and sunset views"
        />
        <button
          onClick={handlePlanTrip}
          disabled={loading || !input.trim()}
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Planning..." : "Plan My Trip"}
        </button>

        {result && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-2">Your Trip Plan</h2>
            <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">
              {result.itinerary}
            </pre>

            <h3 className="text-xl font-medium mt-6 mb-2">Top Dining Picks</h3>
            <ul className="list-disc list-inside text-gray-800">
              {result.dining_recommendations.map((r, idx) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>

            {hotels.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-medium mb-2">Suggested Hotels</h3>
                <ul className="list-disc list-inside text-gray-800">
                  {hotels.map((h, idx) => (
                    <li key={idx}>{h}</li>
                  ))}
                </ul>
              </div>
            )}

            {flights.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-medium mb-2">Suggested Flights</h3>
                <ul className="list-disc list-inside text-gray-800">
                  {flights.map((f, idx) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
