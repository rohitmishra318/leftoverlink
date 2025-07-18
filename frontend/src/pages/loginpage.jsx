import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import loginIllustration from '../assets/login-illustration.svg'; // Import the new illustration

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:4000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('token', data.token);
      alert('Login successful!');
      navigate('/choose');
    } catch (err) {
      alert(`Login failed: ${err.message}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">
      <div className="flex w-full max-w-4xl bg-white shadow-2xl rounded-2xl overflow-hidden">
        
        {/* Left Panel: Illustration & Welcome Text */}
        <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-green-600 text-white p-12 text-center">
          <img src={loginIllustration} alt="Login Illustration" className="w-64 h-64 mb-4" />
          <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-green-100">Log in to continue your impact and help us build a world without food waste.</p>
        </div>

        {/* Right Panel: Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-6 text-center text-green-700">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-1 text-gray-700 font-medium">Email:</label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-700 font-medium">Password:</label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-full shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105"
            >
              Login
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-green-600 hover:underline font-medium">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;