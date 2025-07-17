import React, { useEffect, useState } from "react";

function DonationHistory() {
  const [donatedHistory, setDonatedHistory] = useState([]);
  const [receivedHistory, setReceivedHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("donated");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchDonations = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/users/donationhistory", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log("RAW donation data:", data.donations);
        setDonatedHistory(data.donations || []);
      } catch (err) {
        console.error("Error fetching donation history:", err);
      }
    };

    const fetchReceived = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/users/receivedhistory", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setReceivedHistory(data.received || []);
      } catch (err) {
        console.error("Error fetching received history:", err);
      }
    };

    fetchDonations();
    fetchReceived();
  }, []);

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "N/A";

  const getFullName = (user) => {
    if (!user || !user.fullname) return "N/A";
    return `${user.fullname.firstname || ""} ${user.fullname.lastname || ""}`.trim();
  };

  const Table = ({ data, type }) => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow rounded-lg">
        <thead className="bg-green-200">
          <tr>
            <th className="py-2 px-4 text-left">Food Type</th>
            <th className="py-2 px-4 text-left">Quantity</th>
            <th className="py-2 px-4 text-left">
              {type === "donated" ? "Donated To" : "Received From"}
            </th>
            <th className="py-2 px-4 text-left">Location</th>
            <th className="py-2 px-4 text-left">
              {type === "donated" ? "Expiry" : "Received On"}
            </th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td className="py-4 px-4 text-center text-gray-500" colSpan={5}>
                No history found.
              </td>
            </tr>
          ) : (
            data.map((item, index) => {
              const isDonated = type === "donated";
              const food = item.food || {};

              const foodType = food.foodType || "N/A";
              const quantity = food.quantity || "N/A";
              const location = food.location || "N/A";
              const date = isDonated
                ? formatDate(food.expiry)
                : formatDate(item.receivedAt || food.expiry);

              const name = isDonated
                ? getFullName(item.receivedBy)
                : getFullName(item.donatedBy);

              return (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{foodType}</td>
                  <td className="py-2 px-4">{quantity} kg</td>
                  <td className="py-2 px-4">{name}</td>
                  <td className="py-2 px-4">{location}</td>
                  <td className="py-2 px-4">{date}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded shadow mt-8">
      <div className="flex gap-4 mb-4 border-b">
        <button
          className={`px-4 py-2 font-semibold ${
            activeTab === "donated"
              ? "border-b-4 border-green-500 text-green-700"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("donated")}
        >
          🥫 Donated
        </button>
        <button
          className={`px-4 py-2 font-semibold ${
            activeTab === "received"
              ? "border-b-4 border-purple-500 text-purple-700"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("received")}
        >
          📦 Received
        </button>
      </div>

      {activeTab === "donated" ? (
        <Table data={donatedHistory} type="donated" />
      ) : (
        <Table data={receivedHistory} type="received" />
      )}
    </div>
  );
}

export default DonationHistory;
