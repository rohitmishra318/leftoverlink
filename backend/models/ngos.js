const mongoose = require('mongoose');

const NgoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  lat: { type: Number, required: true },   // Latitude for map
  lng: { type: Number, required: true },   // Longitude for map
  phone: { type: String },
  address: { type: String }
});

module.exports = mongoose.model('Ngo', NgoSchema);