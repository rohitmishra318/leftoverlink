const mongoose = require('mongoose');
const Ngo = require('../models/ngos'); // Adjust path as needed

mongoose.connect('mongodb://localhost:27017/leftoverlink', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const ngos = [
  {
    name: "Helping Hands Foundation",
    email: "helpinghands@example.com",
    location: "Gwalior",
    lat: 26.2183,
    lng: 78.1828,
    phone: "9999000011",
    address: "Sector 9, Near Railway Station, Gwalior, MP"
  },
  {
    name: "Food for All Trust",
    email: "foodforall@example.com",
    location: "Indore",
    lat: 22.7196,
    lng: 75.8577,
    phone: "8888000022",
    address: "MG Road, Near Regal Circle, Indore, MP"
  },
  {
    name: "Roti Bank",
    email: "rotibank@example.com",
    location: "Agra",
    lat: 27.1767,
    lng: 78.0081,
    phone: "5555000055",
    address: "Tajganj, Agra, UP"
  }
];

Ngo.insertMany(ngos)
  .then(() => {
    console.log("NGO data inserted!");
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("Error inserting NGOs:", err);
    mongoose.disconnect();
  });
