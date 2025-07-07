import React, { useContext, useState } from "react";
import { NotificationContext } from "../context/Notificationcontext";
import { Bell } from "lucide-react"; // Optional icon library

const Navbar = () => {
  const { notifications, setNotifications } = useContext(NotificationContext);
  const [open, setOpen] = useState(false);

  const clearNotifications = () => setNotifications([]);

  return (
    <nav className="bg-green-700 p-4 flex justify-between text-white">
      <h1 className="text-xl font-bold">Food Donation</h1>

      <div className="relative">
        <button onClick={() => setOpen(!open)} className="relative">
          <Bell className="w-6 h-6" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 rounded-full h-4 w-4 text-xs flex items-center justify-center">
              {notifications.length}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-80 bg-white text-black shadow-lg rounded-lg p-4 z-50">
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
            <button
              onClick={clearNotifications}
              className="mt-2 w-full bg-green-600 text-white py-1 rounded"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
