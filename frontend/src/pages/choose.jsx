import React from 'react';
import { useNavigate } from 'react-router-dom';

function Choose() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-blue-200">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-8 text-green-700">What would you like to do?</h2>
        <div className="flex flex-col gap-6">
          <button
            onClick={() => navigate('/donor')}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded transition duration-200 text-lg"
          >
            Donate Food
          </button>
          <button
            onClick={() => navigate('/receiver')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded transition duration-200 text-lg"
          >
            Receive Food
          </button>
        </div>
      </div>
    </div>
  );
}

export default Choose;
