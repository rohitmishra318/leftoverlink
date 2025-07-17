import React, { useContext, useState } from "react";
import { NotificationContext } from "../context/Notificationcontext";
import { Bell, User } from "lucide-react"; // ✅ Add User icon
import { useNavigate } from "react-router-dom"; // ✅ For navigation
import axios from "axios";

const Navbar = () => {
  const { notifications, setNotifications } = useContext(NotificationContext);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate(); // ✅ Hook to navigate

  const clearNotifications = () => setNotifications([]);

  const updateNotificationStatus = (index, newStatus) => {
    setNotifications((prev) =>
      prev.map((n, i) =>
        i === index ? { ...n, status: newStatus } : n
      )
    );
  };

  const handleAccept = async (notification, index) => {
    try {
      const response = await fetch("http://localhost:4000/api/users/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          donor: notification.data.donor,
          receiver: notification.data.receiverId,
          quantity: notification.data.quantity,
          foodtype: notification.data.foodtype,
          location: notification.data.location,
          expiry: notification.data.expiryDate,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to accept donation");
      }

      updateNotificationStatus(index, "accepted");
    } catch (error) {
      console.error("Error accepting donation:", error);
    }
  };

  const handleIgnore = (index) => {
    updateNotificationStatus(index, "ignored");
  };

  return (
    <nav className="bg-green-700 p-4 flex justify-between items-center text-white">
      <h1 className="text-xl font-bold">Food Donation</h1>

      <div className="flex items-center gap-4 relative">
        {/* ✅ Profile Icon */}
        <button
          onClick={() => navigate("/profile")}
          className="hover:text-gray-200 transition"
          title="Go to Profile"
        >
          <User className="w-6 h-6" />
        </button>

        {/* 🔔 Notification Bell */}
        <button onClick={() => setOpen(!open)} className="relative">
          <Bell className="w-6 h-6" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 rounded-full h-4 w-4 text-xs flex items-center justify-center">
              {notifications.length}
            </span>
          )}
        </button>

        {/* 🔔 Notification Dropdown */}
        {open && (
          <div className="absolute right-0 mt-12 w-[22rem] bg-white text-black shadow-lg rounded-lg p-5 z-[9999] max-h-[75vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-2">Notifications</h3>

            {notifications.length === 0 ? (
              <p className="text-gray-500">No notifications</p>
            ) : (
              notifications.map((n, idx) => (
                <div key={idx} className="border-b border-gray-300 py-2">
                  {n.type === "donation" ? (
                    <>
                      <p>🎁 New Donation from <b>{n.data.donor}</b></p>
                      <p>{n.data.quantity}kg - {n.data.foodtype}</p>

                      <div className="mt-1 text-sm text-gray-600">
                        Status:{" "}
                        <span
                          className={
                            n.status === "accepted"
                              ? "text-green-600 font-medium"
                              : n.status === "ignored"
                              ? "text-red-500 font-medium"
                              : "text-yellow-500 font-medium"
                          }
                        >
                          {n.status || "Pending"}
                        </span>
                      </div>

                      {(!n.status || n.status === "pending") && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleAccept(n, idx)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                          >
                            ✅ Accept
                          </button>
                          <button
                            onClick={() => handleIgnore(idx)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                          >
                            ❌ Ignore
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <p>✅ Your donation was accepted</p>
                      <p>By user ID: <b>{n.data.receiverId}</b></p>
                    </>
                  )}
                </div>
              ))
            )}

            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="mt-2 w-full bg-green-600 text-white py-1 rounded"
              >
                Clear All
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
