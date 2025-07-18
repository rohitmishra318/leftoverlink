// src/pages/Profile.jsx

import React, { useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode";              // ← default import
import socket from "../socket";
import Badges from "../components/Badges";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import DonationHistory from "../components/DonationHistory";
import { User, BarChart2, BookOpen } from "lucide-react";

function Profile() {
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("Unknown User");
  const [totalDonated, setTotalDonated] = useState(0);
  const [totalReceived, setTotalReceived] = useState(0);
  const [newDonation, setNewDonation] = useState(null);
  const [graphData, setGraphData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (err) {
      console.error("Invalid token:", err);
      return;
    }

    // Extract _id and fullname from token payload
    setUserId(decoded._id);
    if (
      decoded.fullname &&
      decoded.fullname.firstname &&
      decoded.fullname.lastname
    ) {
      
      setUserName(
        `${decoded.fullname.firstname} ${decoded.fullname.lastname}`
      );
    }

    // Join socket room
    socket.emit("join", decoded._id);

    // Fetch totals and graph...
    const fetchTotalsAndGraph = async () => {
      // helper to fetch with Bearer
      const fetchWithAuth = (url) =>
        fetch(url, { headers: { Authorization: `Bearer ${token}` } })
          .then((r) => r.json());

      try {
        const donationsData = await fetchWithAuth(
          "http://localhost:4000/api/users/my-donations"
        );
        if (donationsData.donations) {
          const total = donationsData.donations.reduce(
            (sum, d) => sum + (d.quantity || 0),
            0
          );
          setTotalDonated(total);
        }
      } catch {
        setTotalDonated(0);
      }

      try {
        const receivedData = await fetchWithAuth(
          "http://localhost:4000/api/users/my-received"
        );
        setTotalReceived(receivedData.totalReceived || 0);
      } catch {
        setTotalReceived(0);
      }

      try {
        const [dJson, rJson] = await Promise.all([
          fetchWithAuth("http://localhost:4000/api/users/donation-summary"),
          fetchWithAuth("http://localhost:4000/api/users/received-summary")
        ]);

        const map = new Map();
        dJson.forEach(({ user, name, count }) =>
          map.set(user, { user, name, donated: count, received: 0 })
        );
        rJson.forEach(({ user, name, count }) => {
          if (map.has(user)) {
            map.get(user).received = count;
          } else {
            map.set(user, { user, name, donated: 0, received: count });
          }
        });
        setGraphData(Array.from(map.values()));
      } catch (err) {
        console.error("Graph data error:", err);
      }
    };

    fetchTotalsAndGraph();

    // Socket listeners
    socket.on("receive-donation", setNewDonation);
    socket.on("donation-accepted", ({ receiverId }) =>
      alert(`🎉 Your donation was accepted by user ID: ${receiverId}`)
    );

    return () => {
      socket.off("receive-donation");
      socket.off("donation-accepted");
    };
  }, []);

  const handleAcceptDonation = async () => {
    if (!newDonation || !userId) return;
     console.log("Accepting donation:", newDonation);
    try {
      const res = await fetch("http://localhost:4000/api/users/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
         body: JSON.stringify({
        donor:    newDonation.donorId,     // matches AddDonation’s donorId
        receiver: userId,
        quantity: newDonation.quantity,
        foodtype: newDonation.foodType,    // matches AddDonation’s foodType
        location: newDonation.location,
        expiry:   newDonation.expiry       // matches AddDonation’s expiry
      }),
      });
      const { message } = await res.json();
      if (!res.ok) throw new Error(message || "Accept failed");
      alert("✅ Donation accepted!");
      setNewDonation(null);
    } catch (err) {
      alert(err.message || "Error accepting donation");
    }
  };

  const handleRejectDonation = () => {
    setNewDonation(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top: Profile & Chart */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2 bg-white shadow rounded-lg p-8">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 p-3 rounded-full">
                <User className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="ml-4 text-3xl font-bold text-green-700">
                Profile Overview
              </h2>
            </div>
            <div className="flex flex-col md:flex-row justify-between">
              <div>
                <p className="text-2xl text-gray-800">
                  Welcome,{" "}
                  <span className="font-bold text-blue-600">{userName}</span>
                </p>
                <div className="mt-4 flex flex-wrap gap-6">
                  <p>
                    <span className="font-semibold">Donated:</span>{" "}
                    <span className="text-green-600 font-bold">
                      {totalDonated.toFixed(1)} kg
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold">Received:</span>{" "}
                    <span className="text-purple-600 font-bold">
                      {totalReceived} times
                    </span>
                  </p>
                </div>
              </div>
              <Badges totalDonated={totalDonated} />
            </div>
          </div>
          {/* Interaction Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            {graphData.length > 0 ? (
              <>
                <h3 className="text-center text-green-700 font-semibold mb-4">
                  Interaction Overview
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={graphData}>
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="donated" fill="#10B981" name="Donated To" />
                    <Bar dataKey="received" fill="#8B5CF6" name="Received From" />
                  </BarChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="text-center text-gray-500">
                <BarChart2 className="mx-auto mb-2" />
                No interaction data yet.
              </div>
            )}
          </div>
        </div>

        {/* Donation History */}
        <div className="bg-white shadow rounded-lg p-8">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="ml-4 text-3xl font-bold text-blue-700">
              Donation History
            </h3>
          </div>
          <DonationHistory />
        </div>
      </div>

      {/* New Donation Popup */}
      {newDonation && (
        <div className="fixed bottom-6 inset-x-0 mx-auto max-w-lg bg-white border-yellow-400 border-2 p-6 rounded-xl shadow-lg animate-pulse">
          <h3 className="flex items-center text-yellow-800 font-bold text-xl mb-4">
            <span className="mr-3">🚨</span> New Donation Available
          </h3>
          <div className="space-y-2 text-gray-700">
            <p>
              <strong>Food:</strong> {newDonation.foodtype}
            </p>
            <p>
              <strong>Qty:</strong> {newDonation.quantity} kg
            </p>
            <p>
              <strong>Location:</strong> {newDonation.location}
            </p>
            <p>
              <strong>Expires:</strong>{" "}
              {new Date(newDonation.expiryDate).toLocaleDateString()}
            </p>
          </div>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={handleAcceptDonation}
              className="px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
            >
              ✅ Accept
            </button>
            <button
              onClick={handleRejectDonation}
              className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
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
