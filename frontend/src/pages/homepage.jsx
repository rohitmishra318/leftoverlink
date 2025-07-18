import React from 'react';
import { Link } from 'react-router-dom';
import { Gift, Truck, HeartHandshake } from 'lucide-react'; // Icons for steps
import heroBackground from '../assets/hero-background.jpg'; // Import the hero image
import partnerLogos from '../assets/partner-logos.png';   // Import the partner logos

function Homepage() {
  return (
    <div className="bg-gray-50 text-gray-800">

      {/* 1. Hero Section */}
      <section 
        className="relative text-white text-center py-32 px-4" 
        style={{ backgroundImage: `url(${heroBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4">
            Connect. Share. Impact.
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            We bridge the gap between surplus food and those in need. Join our mission to fight hunger and reduce waste in our community.
          </p>
          <Link to="/login">
            <button className="px-10 py-4 bg-green-500 hover:bg-green-600 text-white text-xl font-bold rounded-full shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105">
              🍱 Start Donating
            </button>
          </Link>
        </div>
      </section>

      {/* 2. How It Works Section */}
      <section className="py-20 px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-green-700 mb-4">How It Works</h2>
          <p className="text-lg text-gray-600 mb-12">Donating surplus food is simple, fast, and impactful. Follow these three easy steps.</p>
          <div className="grid md:grid-cols-3 gap-12 text-left">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
              <Gift className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-2xl font-semibold mb-2">1. List Your Donation</h3>
              <p>Quickly post details about your surplus food—what it is, the quantity, and its expiry date. Our AI can even help describe it from a photo.</p>
            </div>
            {/* Step 2 */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
              <Truck className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-2xl font-semibold mb-2">2. Get Matched</h3>
              <p>Our smart system instantly notifies the most suitable and nearby NGOs who need what you have, prioritizing those who haven't received aid recently.</p>
            </div>
            {/* Step 3 */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
              <HeartHandshake className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-2xl font-semibold mb-2">3. Food is Received</h3>
              <p>An NGO or a volunteer accepts your donation and arranges for pickup. You get confirmation, and food goes where it’s needed most.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Our Impact Section */}
      <section className="bg-green-700 text-white py-20 px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-12">Our Impact, Together</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-4">
              <p className="text-5xl font-extrabold">1,200+</p>
              <p className="text-lg mt-2">Meals Donated</p>
            </div>
            <div className="p-4">
              <p className="text-5xl font-extrabold">50+</p>
              <p className="text-lg mt-2">NGOs & Restaurants Onboard</p>
            </div>
            <div className="p-4">
              <p className="text-5xl font-extrabold">95%</p>
              <p className="text-lg mt-2">Food Utilized</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Partners Section */}
      <section className="py-20 px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Trusted By Restaurants & NGOs</h2>
          <p className="text-lg text-gray-600 mb-12">We're proud to partner with organizations committed to making a difference.</p>
          <div className="flex justify-center">
             <img src={partnerLogos} alt="Partner logos" className="max-w-3xl" />
          </div>
        </div>
      </section>

    </div>
  );
}

export default Homepage;