import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function NearestReceiver() {
  const location = useLocation();
  const navigate = useNavigate();
  const ngo = location.state?.ngo || {
    name: "Hope NGO",
    address: "Sector 12, Gwalior",
    distance: "2.5 km",
    time: "8 mins",
    rating: 4.7,
    reviews: 120,
  };

  // Dummy data if not passed via navigation
  const receiverDetails = {
    name: ngo.name,
    address: ngo.address,
    distance: ngo.distance || "2.5 km",
    time: ngo.time || "8 mins",
    rating: ngo.rating || 4.7,
    reviews: ngo.reviews || 120,
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-blue-200">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-green-700 text-center">Nearest Receiver Details</h2>
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-green-600">{receiverDetails.name}</h3>
          <p className="text-gray-700 mb-2">{receiverDetails.address}</p>
          <div className="flex items-center mb-2">
            <span className="mr-4">
              <strong>Distance:</strong> {receiverDetails.distance}
            </span>
            <span>
              <strong>Time:</strong> {receiverDetails.time}
            </span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">
              <strong>Rating:</strong> {receiverDetails.rating} ⭐
            </span>
            <span className="text-gray-500">({receiverDetails.reviews} reviews)</span>
          </div>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded transition duration-200"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default NearestReceiver;