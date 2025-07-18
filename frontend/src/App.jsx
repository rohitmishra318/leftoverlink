import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/homepage.jsx";
import LoginPage from "./pages/loginpage";
import SignupPage from "./pages/signuppage";
import AdminDashboard from "./pages/admindashboard";
import Donor from "./pages/adddonation.jsx";
import ReceiverDetail from "./pages/nearestreceiver.jsx";
import Choose from "./pages/choose.jsx";
import ProtectedRoute from "./components/ProtectRoutes.jsx";
import Navbar from "./components/Navbar.jsx";
import Profile from "./pages/profile.jsx";
import { jwtDecode } from "jwt-decode";
import socket from "./socket.js";
import VolunteerSignup from "./pages/volunteersignup.jsx";

// ✅ Toastify import
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ✅ WhatsApp floating button
import WhatsAppJoinButton from "./components/Whatsapp.jsx";

function App() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      socket.emit("join", decoded._id); // ✅ Join room with user ID
    }
  }, []);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/volunteersignup" element={<ProtectedRoute><VolunteerSignup /></ProtectedRoute>} />
        <Route path="/donor" element={<ProtectedRoute><Donor /></ProtectedRoute>} />
        <Route path="/donor/nearestreceiver" element={<ProtectedRoute><ReceiverDetail /></ProtectedRoute>} />
        <Route path="/choose" element={<ProtectedRoute><Choose /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>

      {/* ✅ Floating WhatsApp Join Button */}
      <WhatsAppJoinButton />

      {/* ✅ Global Toast Notification Handler */}
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;
