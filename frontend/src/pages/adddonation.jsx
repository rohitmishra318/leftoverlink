import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios'; // ✅ Import axios
import socket from "../socket";
import Map from '../components/Map';
import { Gift, Send } from 'lucide-react';
import { toast } from 'react-toastify';

function AddDonation() {
  const navigate = useNavigate();

  // ✅ All state hooks go inside the component
  const [userId, setUserId] = useState(null);
  const [location, setLocation] = useState('');
  const [quantity, setQuantity] = useState('');
  const [foodType, setFoodType] = useState('');
  const [expiry, setExpiry] = useState('');
  const [manufactureDate, setManufactureDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedReceivers, setSuggestedReceivers] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState(null);

  // ✅ Decode JWT and set userId
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded._id); // Adjust key based on your JWT payload
      } catch (err) {
        console.error('Failed to decode token:', err);
      }
    }
  }, []);

  // Fetch suggestions when input is filled
  useEffect(() => {
    const allFilled = location && quantity && foodType && expiry;
    if (!allFilled) {
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
          body: JSON.stringify({ location, foodType, quantity, expiry })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch suggestions');
        setSuggestedReceivers(data.ngos.ngos || []);
        setShowSuggestions(true);
      } catch (err) {
        setSuggestedReceivers([]);
        setShowSuggestions(false);
        setSuggestionError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const handler = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(handler);
  }, [location, quantity, foodType, expiry]);

  // ✅ Updated: Accept optional receiver ID
  const handleSubmit = async (e, targetReceiverId = null) => {
    e.preventDefault();

    if (!userId) {
      toast.error("User not logged in");
      return;
    }

    if (!location || !quantity || !foodType || !expiry || !manufactureDate) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const donationData = {
        donor: userId,
        location,
        quantity: parseFloat(quantity),
        foodType,
        expiry,
        manufactureDate,
        receiver: targetReceiverId || undefined
      };
      console.log("Submitting donation data:", donationData);

      const res = await axios.post(
        "http://localhost:4000/api/users/donation",
        donationData
      );

      toast.success("Donation added successfully");
      setLocation("");
      setQuantity("");
      setFoodType("");
      setExpiry("");
      setManufactureDate("");

      const socketPayload = {
        donorId: userId,
        location,
        quantity,
        foodType,
        expiry,
        manufactureDate,
        ...(targetReceiverId && { receiverId: targetReceiverId })
      };

      socket.emit("new-donation", socketPayload);
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to add donation");
    }
  };

  const allFilledForSuggestions = location && quantity && foodType && expiry;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">

        {/* Form */}
        <div className="flex flex-col gap-8">
          <div className="bg-white shadow-2xl rounded-2xl p-8">
            <div className="text-center mb-6">
              <div className="inline-block bg-green-100 p-3 rounded-full">
                <Gift className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-green-700 mt-4">Create a Donation</h2>
              <p className="text-gray-600">Fill in the details below to broadcast a donation or get suggestions.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-1 text-gray-700 font-medium">Location:</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" required />
              </div>
              <div>
                <label className="block mb-1 text-gray-700 font-medium">Food Quantity (kg):</label>
                <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="0" step="0.1" className="w-full px-4 py-3 border border-gray-300 rounded-lg" required />
              </div>
              <div>
                <label className="block mb-1 text-gray-700 font-medium">Food Type:</label>
                <input type="text" value={foodType} onChange={(e) => setFoodType(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-gray-700 font-medium">Expiry Date:</label>
                  <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label className="block mb-1 text-gray-700 font-medium">Manufacture Date:</label>
                  <input type="date" value={manufactureDate} onChange={(e) => setManufactureDate(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-green-500 text-white py-3 rounded-full font-bold hover:bg-green-600 transition">
                {loading ? 'Submitting...' : 'Submit & Broadcast to All'}
              </button>
            </form>
          </div>

          {/* AI Suggestions */}
          {showSuggestions && (
            <div className="bg-white shadow-2xl rounded-2xl p-8">
              <h3 className="text-2xl font-semibold text-blue-700 mb-4">AI-Powered Suggestions</h3>
              {loading && allFilledForSuggestions && (<p className="text-center text-blue-600">Getting suggestions...</p>)}
              {suggestionError && (<p className="text-red-500 text-center">{suggestionError}</p>)}
              {suggestedReceivers.length > 0 && (
                <ul className="space-y-4 text-gray-700">
                  {suggestedReceivers.map((ngo) => (
                    <li key={ngo.ngo_id} className="border rounded-lg p-4 hover:border-green-400">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-lg">{ngo.name}</p>
                          <p className="text-sm">{ngo.address}</p>
                        </div>
                        <button
                          onClick={(e) => handleSubmit(e, ngo.ngo_id)}
                          className="ml-4 flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full"
                          disabled={loading}
                        >
                          <Send size={16} />
                          Send
                        </button>
                      </div>
                      <div className="flex justify-between text-sm mt-2 pt-2 border-t">
                        <span className="text-green-600">{ngo.distance_km.toFixed(2)} km away</span>
                        <span className="text-blue-600">Match Score: {ngo.match_score.toFixed(2)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {suggestedReceivers.length === 0 && !loading && !suggestionError && (
                <p className="text-center text-gray-600">No suitable NGOs found for your donation criteria.</p>
              )}
            </div>
          )}
        </div>

        {/* Map Component */}
        <div className="bg-white shadow-2xl rounded-2xl p-4 h-[500px] lg:h-auto">
          <Map />
        </div>
      </div>
    </div>
  );
}

export default AddDonation;
