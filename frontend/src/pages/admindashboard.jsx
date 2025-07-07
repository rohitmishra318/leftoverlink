import React, { useState } from 'react';

const initialVerifiedNGOs = [
  { id: 1, name: 'Helping Hands', email: 'helping@ngo.org' },
  { id: 2, name: 'Food For All', email: 'foodforall@ngo.org' },
];

function AdminDashboard() {
  const [verifiedNGOs, setVerifiedNGOs] = useState(initialVerifiedNGOs);
  const [ngoName, setNgoName] = useState('');
  const [ngoEmail, setNgoEmail] = useState('');

  // Sample static value for total food donated in kg (replace with actual backend call later)
  const totalFoodKg = 1345;

  const handleAddNGO = (e) => {
    e.preventDefault();
    if (!ngoName || !ngoEmail) {
      alert('Please fill in all fields.');
      return;
    }
    const newNGO = {
      id: verifiedNGOs.length + 1,
      name: ngoName,
      email: ngoEmail,
    };
    setVerifiedNGOs([...verifiedNGOs, newNGO]);
    setNgoName('');
    setNgoEmail('');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4 text-green-700">Admin Dashboard</h2>

      {/* Total Food Donated */}
      <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded shadow text-green-800">
        <h3 className="text-xl font-semibold mb-2">Total Food Donated</h3>
        <p className="text-3xl font-bold">{totalFoodKg} kg</p>
      </div>

      {/* Verified NGOs */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Verified NGOs</h3>
        <ul className="bg-white rounded shadow p-4">
          {verifiedNGOs.map((ngo) => (
            <li key={ngo.id} className="border-b last:border-b-0 py-2 flex justify-between">
              <span>{ngo.name}</span>
              <span className="text-gray-500">{ngo.email}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Add New NGO */}
      <div className="bg-white rounded shadow p-4">
        <h3 className="text-xl font-semibold mb-2">Add New NGO</h3>
        <form onSubmit={handleAddNGO} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">NGO Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
              value={ngoName}
              onChange={e => setNgoName(e.target.value)}
              required
              placeholder="Enter NGO name"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">NGO Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
              value={ngoEmail}
              onChange={e => setNgoEmail(e.target.value)}
              required
              placeholder="Enter NGO email"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded transition duration-200"
          >
            Add NGO
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminDashboard;
