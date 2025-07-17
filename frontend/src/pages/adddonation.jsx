import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import socket from "../socket";
import Map from '../components/Map';

function AddDonation() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [quantity, setQuantity] = useState('');
  const [foodType, setFoodType] = useState('');
  const [expiry, setExpiry] = useState(''); // YYYY-MM-DD
  const [manufactureDate, setManufactureDate] = useState(''); // YYYY-MM-DD
  const [loading, setLoading] = useState(false);
  const [suggestedReceivers, setSuggestedReceivers] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState(null);

  // 🎯 Suggest NGOs after form is filled
  useEffect(() => {
    const allFilledForSuggestions = location && quantity && foodType && expiry;
    if (!allFilledForSuggestions) {
      setShowSuggestions(false);
      setSuggestedReceivers([]);
      setSuggestionError(null);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      setSuggestionError(null);
      try {
        const res = await fetch('http://localhost:4000/api/dn/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: location,
            foodType: foodType,
            quantity: quantity,
            expiry: expiry
          })
        });

        const data = await res.json();
        console.log("Received suggestions:", data);

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch suggestions');
        }

        // ✅ FIX: Access the nested 'ngos' array to correctly get the list
        setSuggestedReceivers(data.ngos.ngos || []);
        
        setShowSuggestions(true);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
        setSuggestedReceivers([]);
        setShowSuggestions(false);
        setSuggestionError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const handler = setTimeout(() => {
      fetchSuggestions();
    }, 500);

    return () => {
      clearTimeout(handler);
    };

  }, [location, quantity, foodType, expiry]);

  // 📝 Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    let userId = null;

    if (token) {
      try {
        const decoded = jwtDecode(token);
        userId = decoded._id;
      } catch (err) {
        console.error('Invalid token:', err.message);
        alert('Session expired or invalid token. Please log in again.');
        navigate('/login');
        return;
      }
    }

    const donationData = {
      donor: userId,
      location,
      quantity: parseFloat(quantity),
      foodType,
      expiry,
      manufactureDate
    };

    try {
      setLoading(true);
      const res = await fetch('http://localhost:4000/api/users/donation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donationData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Donation failed');

      socket.emit("new-donation", {
        donor: userId,
        quantity,
        location,
        foodtype: foodType,
        expiryDate: expiry
      });

      setLocation('');
      setQuantity('');
      setFoodType('');
      setExpiry('');
      setManufactureDate('');
      setLoading(false);
      setShowSuggestions(false);
      setSuggestedReceivers([]);
      setSuggestionError(null);

      alert('Donation added successfully!');
    } catch (err) {
      setLoading(false);
      alert(`Donation failed: ${err.message}`);
    }
  };

  const inputClass = "w-full px-4 py-2 border-2 border-green-500 rounded focus:outline-none focus:ring-2 focus:ring-green-500";
  const allFilledForSuggestions = location && quantity && foodType && expiry;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-100 to-blue-200">
      
      {/* 📝 Form Section */}
      <div className="w-1/2 p-8 flex items-center justify-center">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-green-700">Donate Food</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-1 text-gray-700 font-medium">Location:</label>
              <input type="text" className={inputClass} value={location} onChange={(e) => setLocation(e.target.value)} required />
            </div>
            <div>
              <label className="block mb-1 text-gray-700 font-medium">Food Quantity (kg):</label>
              <input type="number" min="0" step="0.1" className={inputClass} value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
            </div>
            <div>
              <label className="block mb-1 text-gray-700 font-medium">What Food:</label>
              <input type="text" className={inputClass} value={foodType} onChange={(e) => setFoodType(e.target.value)} required />
            </div>
            <div>
              <label className="block mb-1 text-gray-700 font-medium">Expiry Date:</label>
              <input type="date" className={inputClass} value={expiry} onChange={(e) => setExpiry(e.target.value)} required />
            </div>
            <div>
              <label className="block mb-1 text-gray-700 font-medium">Date of Manufacture:</label>
              <input type="date" className={inputClass} value={manufactureDate} onChange={(e) => setManufactureDate(e.target.value)} required />
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded transition duration-200 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Donate Food'}
            </button>
          </form>

          {/* Loading indicator for suggestions */}
          {loading && allFilledForSuggestions && (
              <p className="text-center text-blue-600 mt-4">Getting suggestions...</p>
          )}

          {/* Error message for suggestions */}
          {suggestionError && (
              <p className="text-red-500 text-center mt-4">{suggestionError}</p>
          )}

          {/* ✅ Suggested NGOs */}
          {showSuggestions && suggestedReceivers.length > 0 && (
            <div className="mt-6 bg-blue-50 p-4 rounded-lg shadow-inner">
              <h3 className="text-lg font-semibold text-blue-700 mb-2">Suggested NGOs near you:</h3>
              <ul className="space-y-2 text-gray-700">
                {suggestedReceivers.map((ngo) => (
                  <li key={ngo.ngo_id} className="border-b pb-1">
                    <strong>{ngo.name}</strong> — {ngo.address} ({ngo.distance_km.toFixed(2)} km)
                    <br/>
                    <span className="text-sm text-gray-500">Match Score: {ngo.match_score.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showSuggestions && suggestedReceivers.length === 0 && !loading && !suggestionError && (
              <p className="text-center text-gray-600 mt-4">No suitable NGOs found for your donation criteria.</p>
          )}
        </div>
      </div>

      {/* 🗺️ Map Section */}
      <div className="w-1/2 p-8 flex items-start justify-center mt-24">
        <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-md">
          <Map />
        </div>
      </div>
    </div>
  );
}

export default AddDonation;