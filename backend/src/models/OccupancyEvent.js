const mongoose = require('mongoose');

const OccupancyEventSchema = new mongoose.Schema(
  {
    lotId: {
      type: String,
      required: true,
      index: true
    },
    slotId: {
      type: String,
      required: true,
      index: true
    },
    previousStatus: {
      type: String,
      enum: ['vacant', 'occupied', 'error', null],
      default: null
    },
    nextStatus: {
      type: String,
      enum: ['vacant', 'occupied', 'error'],
      required: true
    },
    deviceId: {
      type: String,
      trim: true
    },
    observedAt: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('OccupancyEvent', OccupancyEventSchema);
