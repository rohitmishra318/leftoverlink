import React from 'react';
import { Link } from 'react-router-dom';

function Homepage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-white to-blue-100 px-4">
      <div className="bg-white shadow-xl rounded-lg p-10 max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-green-600 mb-4">Welcome to <span className="text-blue-500">LeftOverLink</span></h1>
        <p className="text-gray-700 text-lg mb-8 leading-relaxed">
          Connect restaurants, caterers, and individuals with nearby NGOs to share surplus food and reduce waste.
          Be a part of the solution — feed someone today.
        </p>
        <Link to="/login">
          <button className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full shadow-md transition duration-300">
            Start Donating
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Homepage;
