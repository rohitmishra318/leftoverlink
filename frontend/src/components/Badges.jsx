import React from "react";

const getBadge = (donated) => {
  if (donated >= 500) {
    return { name: "Legendary Donor", icon: "🏆", className: "bg-purple-200" };
  } else if (donated >= 250) {
    return { name: "Platinum Donor", icon: "💎", className: "bg-blue-200" };
  } else if (donated >= 100) {
    return { name: "Gold Donor", icon: "🥇", className: "bg-yellow-400" };
  } else if (donated >= 50) {
    return { name: "Silver Donor", icon: "🥈", className: "bg-gray-200" };
  } else if (donated >= 1) {
    return { name: "Bronze Donor", icon: "🥉", className: "bg-yellow-200" };
  } else {
    return null;
  }
};

const Badges = ({ totalDonated }) => {
  const badge = getBadge(totalDonated);

  if (!badge) return null;

  return (
    <div className={`mt-6 p-4 rounded-lg shadow-md ${badge.className}`}>
      <div className="text-center">
        <div className="text-4xl">{badge.icon}</div>
        <h4 className="text-lg font-semibold text-gray-800 mt-2">
          {badge.name}
        </h4>
        <p className="text-sm text-gray-600">
          You’ve donated <span className="font-bold">{totalDonated} kg</span> of food
        </p>
      </div>
    </div>
  );
};

export default Badges;
