const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  foodType: {
    type: String,
    required: true,
    enum: ['cooked', 'raw', 'packed', 'others']
  },
  quantity: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  expiry: {
    type: Date,
    required: true
  },
  manufactureDate: {
    type: Date,
    required: false // ✅ now stored if frontend sends it
  },
  location: {
    type: String,
    required: true // ✅ because you use a plain string from frontend
  },
  status: {
    type: String,
    enum: ['available', 'claimed', 'expired'],
    default: 'available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Food', FoodSchema);
