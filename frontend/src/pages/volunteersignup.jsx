import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function VolunteerSignup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/volunteers/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullname: {
            firstname: firstName,
            lastname: lastName
          },
          email,
          address,
          password,
          role: "volunteer" // Tag this user as volunteer
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Signup failed');

      localStorage.setItem('token', data.token);
      alert('Volunteer signup successful!');
      navigate('/choose'); // redirect to choose page or dashboard
    } catch (err) {
      alert(`Signup failed: ${err.message}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-green-200">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-700">Join as a Volunteer</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex gap-4">
            <input
              type="text"
              required
              placeholder="First name"
              className="w-1/2 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
            />
            <input
              type="text"
              required
              placeholder="Last name"
              className="w-1/2 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
            />
          </div>

          <input
            type="email"
            required
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <input
            type="text"
            required
            placeholder="Address"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            value={address}
            onChange={e => setAddress(e.target.value)}
          />

          <input
            type="password"
            required
            placeholder="Password"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <input
            type="password"
            required
            placeholder="Confirm Password"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded transition duration-200"
          >
            Sign Up as Volunteer
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          Already signed up? <a href="/login" className="text-green-600 hover:underline">Login</a>
        </div>
      </div>
    </div>
  );
}

export default VolunteerSignup;
