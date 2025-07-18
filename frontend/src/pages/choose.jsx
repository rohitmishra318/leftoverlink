import React from 'react';
import { useNavigate } from 'react-router-dom';
import missionIllustration from '../assets/mission-illustration.svg'; // Import the new illustration
import { HeartHandshake, Trash2, Globe } from 'lucide-react'; // Import icons for stats

function Choose() {
  const navigate = useNavigate();

  // The navigation logic for donating remains, just the UI is enhanced.
  const handleDonateClick = () => {
    // Navigate to the page for adding a donation
    navigate('/donor'); 
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-12 text-center">

        {/* Main Welcome & Action Card */}
        <div className="bg-white shadow-2xl rounded-2xl p-8 md:p-12">
          <img src={missionIllustration} alt="Our Mission" className="w-64 h-64 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-green-700 leading-tight">
            Your Journey to Make a Difference Starts Here
          </h1>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
            You're part of a community dedicated to turning surplus into sustenance. Every donation you make creates a vital link, ensuring good food reaches those who need it most.
          </p>
          <div className="mt-8">
            <button
              onClick={handleDonateClick}
              className="px-10 py-4 bg-green-500 hover:bg-green-600 text-white text-xl font-bold rounded-full shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105"
            >
              Donate Food Now
            </button>
          </div>
        </div>

        {/* Impact Statistics Section */}
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Why Your Contribution Matters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Stat Card 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <div className="inline-block bg-red-100 p-3 rounded-full mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-4xl font-bold text-red-600">1/3</p>
              <p className="text-lg font-medium text-gray-700 mt-2">of all food produced globally is wasted each year.</p>
            </div>
            {/* Stat Card 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <div className="inline-block bg-blue-100 p-3 rounded-full mb-4">
                 <HeartHandshake className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-4xl font-bold text-blue-600">800M+</p>
              <p className="text-lg font-medium text-gray-700 mt-2">people worldwide face hunger and food insecurity.</p>
            </div>
            {/* Stat Card 3 */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <div className="inline-block bg-purple-100 p-3 rounded-full mb-4">
                <Globe className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-4xl font-bold text-purple-600">10%</p>
              <p className="text-lg font-medium text-gray-700 mt-2">of global greenhouse gas emissions come from food waste.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Choose;