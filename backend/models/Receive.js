// models/Receive.js
const mongoose = require('mongoose');

const ReceiveSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true,
  },
  donatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  receivedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Receive', ReceiveSchema);
