import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import socket from "../socket";
import Badges from "../components/Badges"; // 🏅 Your badges component
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import DonationHistory from "../components/DonationHistory";


function Profile() {
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [totalDonated, setTotalDonated] = useState(0);
  const [totalReceived, setTotalReceived] = useState(0);
  const [newDonation, setNewDonation] = useState(null);
  const [graphData, setGraphData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      setUserId(decoded._id);
      const fullName = decoded.fullname
        ? `${decoded.fullname.firstname} ${decoded.fullname.lastname}`
        : "Unknown User";
      setUserName(fullName);
      socket.emit("join", decoded._id);
    } catch (err) {
      console.error("Token decoding failed:", err);
      return;
    }

    const fetchTotalDonated = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/users/my-donations", {
          headers: { Authorization: `Bearer ${token}` },
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
          headers: { Authorization: `Bearer ${token}` },
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

    const fetchGraphData = async () => {
      try {
        const [donatedRes, receivedRes] = await Promise.all([
          fetch("http://localhost:4000/api/users/donation-summary", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:4000/api/users/received-summary", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const donatedJson = await donatedRes.json();
        const receivedJson = await receivedRes.json();

        const dataMap = new Map();

        donatedJson.forEach(({ user, name, count }) => {
          dataMap.set(user, {
            user,
            name,
            donated: count,
            received: 0,
          });
        });

        receivedJson.forEach(({ user, name, count }) => {
          if (dataMap.has(user)) {
            dataMap.get(user).received = count;
          } else {
            dataMap.set(user, {
              user,
              name,
              donated: 0,
              received: count,
            });
          }
        });

        const merged = Array.from(dataMap.values());
        setGraphData(merged);
      } catch (err) {
        console.error("Error fetching graph data:", err);
      }
    };

    fetchTotalDonated();
    fetchTotalReceived();
    fetchGraphData();

    socket.on("receive-donation", (data) => setNewDonation(data));
    socket.on("donation-accepted", (data) =>
      alert(`🎉 Your donation was accepted by user ID: ${data.receiverId}`)
    );

    return () => {
      socket.off("receive-donation");
      socket.off("donation-accepted");
    };
  }, []);

  const handleAcceptDonation = async () => {
    if (!newDonation || !userId) return;

    try {
      const res = await fetch("http://localhost:4000/api/users/accept", {
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

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to accept donation");

      alert("✅ Donation accepted successfully!");
      setNewDonation(null);
    } catch (err) {
      console.error("Error accepting donation:", err);
      alert(err.message || "Something went wrong");
    }
  };

  const handleRejectDonation = () => setNewDonation(null);

  return (
  <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-200 p-6">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">

      {/* Profile Overview Card */}
<div className="flex-1 bg-white shadow-md rounded-lg p-6 flex flex-col gap-4">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-2xl font-bold text-green-700 mb-2">👤 Profile Overview</h2>
      {userId ? (
        <div className="space-y-2 text-gray-800">
          <p>
            <span className="font-semibold">Welcome:</span>{" "}
            <span className="text-blue-600 font-bold">{userName}</span>
          </p>
          <p>
            <span className="font-semibold">Total Food Donated:</span>{" "}
            <span className="text-green-600 font-bold">{totalDonated} kg</span>
          </p>
          <p>
            <span className="font-semibold">Total Food Received:</span>{" "}
            <span className="text-purple-600 font-bold">{totalReceived} Times</span>
          </p>
        </div>
      ) : (
        <p className="text-gray-500">Loading profile...</p>
      )}
    </div>

    {/* 🎖️ Badge Display */}
    <div className="mt-4 sm:mt-0 sm:ml-4">
      <Badges totalDonated={totalDonated} />
    </div>
  </div>
</div>



      {/* Graph Card */}
      <div className="flex-1 bg-white shadow-md rounded-lg p-6">
        {graphData.length > 0 ? (
          <>
            <h3 className="text-xl font-semibold mb-4 text-green-700 text-center">
              📊 Donation Interaction Overview
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={graphData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="donated" fill="#34d399" name="Donated To" />
                <Bar dataKey="received" fill="#818cf8" name="Received From" />
              </BarChart>
            </ResponsiveContainer>
          </>
        ) : (
          <p className="text-gray-500 text-center">No graph data available.</p>
        )}
      </div>
    </div>


      {/* Donation History Section */}
  <div className="max-w-6xl mx-auto mt-10">
    <h3 className="text-xl font-bold text-green-700 mb-4">📜 Donation History</h3>
    <DonationHistory />
  </div>

    {/* Bottom Floating Notification */}
    {newDonation && (
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-3xl bg-yellow-100 border border-yellow-300 p-6 rounded shadow-lg z-50">
        <h3 className="font-bold text-lg text-orange-800">🚨 New Donation Available</h3>
        <p><strong>Food Type:</strong> {newDonation.foodtype}</p>
        <p><strong>Quantity:</strong> {newDonation.quantity} kg</p>
        <p><strong>Location:</strong> {newDonation.location}</p>
        <p><strong>Expires On:</strong> {new Date(newDonation.expiryDate).toLocaleDateString()}</p>

        <div className="mt-4 flex justify-center gap-4">
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            onClick={handleAcceptDonation}
          >
            ✅ Accept
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            onClick={handleRejectDonation}
          >
            ❌ Ignore
          </button>
        </div>
      </div>
    )}
  </div>
);

}

export default Profile;
