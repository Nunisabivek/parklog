const mongoose = require('mongoose');

const ParkingSlotSchema = new mongoose.Schema({
  slotId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['empty', 'occupied', 'error'], default: 'empty' },
});

module.exports = mongoose.model('ParkingSlot', ParkingSlotSchema);
