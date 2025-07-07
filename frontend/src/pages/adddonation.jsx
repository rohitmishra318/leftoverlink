import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import socket from "../socket";
import Map from '../components/Map'; // 🗺️ Your map component

function AddDonation() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [quantity, setQuantity] = useState('');
  const [foodType, setFoodType] = useState('');
  const [expiry, setExpiry] = useState('');
  const [manufactureDate, setManufactureDate] = useState('');
  const [loading, setLoading] = useState(false);

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
      }
    }

    const donationData = {
      donor: userId,
      location,
      quantity,
      foodType,
      expiry,
      manufactureDate
    };

    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/users/donation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donationData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Donation failed');

      socket.emit("new-donation", {
        donor: userId,
        quantity,
        location,
        foodtype: foodType,
        expiryDate: expiry
      });

      // Clear form
      setLocation('');
      setQuantity('');
      setFoodType('');
      setExpiry('');
      setManufactureDate('');
      setLoading(false);

      alert('Donation added successfully!');
    } catch (err) {
      setLoading(false);
      alert(`Donation failed: ${err.message}`);
    }
  };

  const inputClass = "w-full px-4 py-2 border-2 border-green-500 rounded focus:outline-none focus:ring-2 focus:ring-green-500";

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-100 to-blue-200">
      {/* Left Half - Form */}
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
        </div>
      </div>

       {/* Right Half - Map */}
<div className="w-1/2 p-8 flex items-start justify-center mt-24">
  <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-md">
    <Map />
  </div>
</div>



    </div>
  );
}

export default AddDonation;
