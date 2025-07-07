import React, { useState } from 'react';

const Card = ({ title, description }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      className={`cursor-pointer bg-white shadow-md rounded-lg p-4 transition-all duration-300 ease-in-out 
        ${isExpanded ? 'max-h-screen' : 'max-h-32 overflow-hidden'}`}
    >
      <h3 className="text-lg font-semibold text-green-700 mb-2">{title}</h3>
      
      <p className={`text-gray-700 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-70 line-clamp-2'}`}>
        {description}
      </p>

      <div className="mt-2 text-right text-sm text-green-600 underline">
        {isExpanded ? 'Show Less ▲' : 'Show More ▼'}
      </div>
    </div>
  );
};

export default Card;
