import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import socket from "../socket";

function Profile() {
  const [userId, setUserId] = useState(null);
  const [totalDonated, setTotalDonated] = useState(0);
  const [newDonation, setNewDonation] = useState(null);
  const [totalReceived, setTotalReceived] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      setUserId(decoded._id);
      socket.emit("join", decoded._id); // ✅ Join personal room
    } catch (err) {
      console.error("Token decoding failed:", err);
      return;
    }

    const fetchTotalDonated = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/users/my-donations", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok && data.donations) {
          const total = data.donations.reduce(
            (sum, d) => sum + (d.quantity || 0),
            0
          );
          setTotalDonated(total);
        }
      } catch (err) {
        console.error("Donations fetch failed:", err);
        setTotalDonated(0);
      }
    };

    const fetchTotalReceived = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/users/my-received", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setTotalReceived(data.totalReceived || 0);
        }
      } catch (err) {
        console.error("Received fetch failed:", err);
        setTotalReceived(0);
      }
    };

    fetchTotalDonated();
    fetchTotalReceived();

    // 🔔 When new donation is broadcasted
    socket.on("receive-donation", (data) => {
      setNewDonation(data);
    });

    // 🔔 When donor gets a response that someone accepted
    socket.on("donation-accepted", (data) => {
      alert(`🎉 Your donation was accepted by user ID: ${data.receiverId}`);
    });

    return () => {
      socket.off("receive-donation");
      socket.off("donation-accepted");
    };
  }, []);

  const handleAcceptDonation = async () => {
    if (!newDonation || !userId) return;

    try {
      const response = await fetch("http://localhost:4000/api/users/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          donor: newDonation.donor,
          receiver: userId,
          quantity: newDonation.quantity,
          foodtype: newDonation.foodtype,
          location: newDonation.location,
          expiry: newDonation.expiryDate,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to accept donation");

      alert("✅ Donation accepted successfully!");
      setNewDonation(null);
    } catch (err) {
      console.error("Error accepting donation:", err);
      alert(err.message || "Something went wrong");
    }
  };

  const handleRejectDonation = () => {
    setNewDonation(null); // Simply dismiss
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-blue-200">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-green-700">Profile</h2>

        {userId ? (
          <>
            <div className="mb-4">
              <span className="font-semibold text-lg text-gray-700">User ID: </span>
              <span className="text-blue-600 font-bold">{userId}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-lg text-gray-700">Total Food Donated: </span>
              <span className="text-green-600 font-bold">{totalDonated} kg</span>
            </div>
            <div>
              <span className="font-semibold text-lg text-gray-700">Total Food Received: </span>
              <span className="text-purple-600 font-bold">{totalReceived} Times</span>
            </div>
          </>
        ) : (
          <div>Loading profile...</div>
        )}

        {/* 🔔 Incoming donation prompt */}
        {newDonation && (
          <div className="mt-8 p-4 border rounded shadow bg-yellow-100 text-left">
            <h3 className="font-bold text-lg text-orange-800">🚨 New Donation Available</h3>
            <p><strong>Food Type:</strong> {newDonation.foodtype}</p>
            <p><strong>Quantity:</strong> {newDonation.quantity} kg</p>
            <p><strong>Location:</strong> {newDonation.location}</p>
            <p><strong>Expires On:</strong> {new Date(newDonation.expiryDate).toLocaleDateString()}</p>

            <div className="mt-4 flex gap-4 justify-center">
              <button
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                onClick={handleAcceptDonation}
              >
                Accept
              </button>
              <button
                className="bg-red-400 hover:bg-red-500 text-white px-4 py-2 rounded"
                onClick={handleRejectDonation}
              >
                Ignore
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
