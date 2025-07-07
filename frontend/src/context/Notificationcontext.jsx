import React, { createContext, useState, useEffect } from "react";
import socket from "../socket";
import { jwtDecode } from "jwt-decode";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const decoded = jwtDecode(token);
    socket.emit("join", decoded._id); // join personal room

    socket.on("receive-donation", (data) => {
      setNotifications((prev) => [...prev, { type: "donation", data }]);
    });

    socket.on("donation-accepted", (data) => {
      setNotifications((prev) => [...prev, { type: "accepted", data }]);
    });

    return () => {
      socket.off("receive-donation");
      socket.off("donation-accepted");
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
