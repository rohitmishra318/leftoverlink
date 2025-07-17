import React from 'react';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import animationData from '../assets/Share.json';

function Homepage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 px-6 py-20 space-y-20">

      {/* Main Content */}
      <div className="bg-white shadow-2xl rounded-2xl p-10 md:p-16 max-w-5xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-12">
        
        {/* Animation Section */}
        <div className="md:w-1/2 flex justify-center items-center">
          <Lottie
            animationData={animationData}
            loop={true}
            className="max-h-[26rem] w-full object-contain"
          />
        </div>

        {/* Text Section */}
        <div className="md:w-1/2 text-left space-y-6">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-green-700 leading-tight">
            <span className="text-blue-600">LeftOverLink</span>
            <br className="hidden md:block" />
            Connect. Share. Impact.
          </h1>

          <ul className="space-y-3 text-lg text-gray-700">
            <li>🥗 <span className="font-semibold text-green-600">Restaurants:</span> Donate extra food</li>
            <li>👨‍👩‍👧‍👦 <span className="font-semibold text-blue-600">Families:</span> Share meals easily</li>
            <li>🏢 <span className="font-semibold text-purple-600">NGOs:</span> Get real-time donations</li>
          </ul>

          <p className="text-gray-800 font-medium">
            Make food go where it’s needed — not wasted.
          </p>

          <Link to="/login">
            <button className="w-full md:w-auto px-10 py-4 bg-green-500 hover:bg-green-600 text-white text-xl font-bold rounded-full shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105">
              🍱 Start Donating
            </button>
          </Link>
        </div>
      </div>

      {/* Volunteer Section (no animation) */}
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-3xl mx-auto text-center border border-green-200 hover:border-green-400 transition duration-300">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-5xl">🙋‍♂️</div>
          <h2 className="text-3xl font-bold text-green-700">Join as a Volunteer</h2>
          <p className="text-gray-600 text-lg max-w-xl">
            Be the bridge between food donors and those in need. Help us make a difference by assisting with pickups, deliveries, and awareness.
          </p>
          {/* Removed the Link to /login here */}
          <Link to="/volunteersignup"> {/* This link remains, directing to volunteer signup */}
            <button className="mt-4 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105">
              Join Now
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Homepage;