import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import signupIllustration from '../assets/login-illustration.svg'; // Import the new illustration

function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  // --- NO CHANGES TO ANY LOGIC ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    try {
      const response = await fetch('http://localhost:4000/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullname: {
            firstname: firstName,
            lastname: lastName
          },
          email,
          password
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Signup failed');
      localStorage.setItem('token', data.token);
      alert('Signup successful!');
      navigate('/choose');
    } catch (err) {
      alert(`Signup failed: ${err.message}`);
    }
  };
  // --- END OF UNCHANGED LOGIC ---

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="flex w-full max-w-5xl bg-white shadow-2xl rounded-2xl overflow-hidden">
        
        {/* Left Panel: Signup Form */}
        <div className="w-full lg:w-1/2 p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-6 text-center text-green-700">Join LeftOverLink</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                required
                placeholder="First name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
              />
              <input
                type="text"
                required
                placeholder="Last name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
              />
            </div>
            <input
              type="email"
              required
              placeholder="Email address"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              type="password"
              required
              placeholder="Password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <input
              type="password"
              required
              placeholder="Confirm Password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-full shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105"
            >
              Create Account
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600 hover:underline font-medium">
              Login
            </Link>
          </div>
        </div>

        {/* Right Panel: Illustration & Message */}
        <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-green-50 p-12 text-center">
           <img src={signupIllustration} alt="Signup Illustration" className="w-80 h-80 mb-4" />
          <h1 className="text-3xl font-bold text-green-800 mb-2">Be Part of the Solution</h1>
          <p className="text-green-700 max-w-sm">
            Every account created helps build a stronger network against food waste. Thank you for joining our community!
          </p>
        </div>

      </div>
    </div>
  );
}

export default SignupPage;