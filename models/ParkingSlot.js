// models/ParkingSlot.js
const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
  block: {
    type: String,
    required: true
  },
  slotId: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['occupied', 'vacant'],
    default: 'vacant'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
