const mongoose = require('mongoose');
// Make sure this path to your Ngo model is correct
const Ngo = require('../models/ngos'); 

mongoose.connect('mongodb://localhost:27017/leftoverlink', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const ngos = [
  {
    _id: "68676d899743c8916f28d5e0", // Manually set the _id
    name: "Rohit Mishra",
    email: "rohit318mishra@gmail.com",
    location: "Gwalior",
    lat: 26.2134,
    lng: 78.1987,
    phone: "9876543210",
    address: "City Centre, Gwalior, MP"
  },
  {
    _id: "68676e9a9743c8916f28d5e4", // Manually set the _id
    name: "Karan Mishra",
    email: "karan14032a@gmail.com",
    location: "Gwalior",
    lat: 26.2039,
    lng: 78.1639,
    phone: "9988776655",
    address: "Lashkar, Gwalior, MP"
  },
  {
    _id: "68677abbd2805f3414f198b1", // Manually set the _id
    name: "Deepa Mishra",
    email: "deepa2010mishra@gmail.com",
    location: "Gwalior",
    lat: 26.228,
    lng: 78.242,
    phone: "9123456789",
    address: "Morar, Gwalior, MP"
  },
  {
    _id: "6878b6e80753a4ccc4507a98", // Manually set the _id
    name: "Helping Legs",
    email: "helpinglegs@gmail.com",
    location: "Gwalior",
    lat: 26.237,
    lng: 78.191,
    phone: "8877665544",
    address: "Thatipur, Gwalior, MP"
  },
  {
    _id: "6878b7280753a4ccc4507a9a", // Manually set the _id
    name: "jinx help",
    email: "jinxhelp@gmail.com",
    location: "Gwalior",
    lat: 26.248,
    lng: 78.17,
    phone: "7766554433",
    address: "DD Nagar, Gwalior, MP"
  },
  {
    _id: "6878b77c0753a4ccc4507a9c", // Manually set the _id
    name: "john wick",
    email: "johnwick@gmail.com",
    location: "Gwalior",
    lat: 26.195,
    lng: 78.188,
    phone: "6655443322",
    address: "Phool Bagh, Gwalior, MP"
  }
];

// This will insert the NGOs with your specified _id values
Ngo.insertMany(ngos)
  .then(() => {
    console.log("NGO data successfully inserted with custom IDs!");
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("Error inserting NGOs:", err);
    mongoose.disconnect();
  });