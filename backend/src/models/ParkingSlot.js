const mongoose = require('mongoose');
const config = require('../config/env');

const ParkingSlotSchema = new mongoose.Schema(
  {
    lotId: {
      type: String,
      required: true,
      default: () => config.defaultLotId,
      index: true
    },
    block: {
      type: String,
      required: true,
      default: () => config.defaultBlock,
      trim: true
    },
    slotNumber: {
      type: Number,
      required: true,
      min: 1
    },
    slotId: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['vacant', 'occupied', 'error'],
      default: 'vacant',
      index: true
    },
    deviceId: {
      type: String,
      trim: true
    },
    lastSeenAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

ParkingSlotSchema.index({ lotId: 1, slotId: 1 }, { unique: true });

ParkingSlotSchema.statics.summaryForLot = function summaryForLot(lotId) {
  return this.aggregate([
    { $match: { lotId } },
    {
      $group: {
        _id: '$block',
        total: { $sum: 1 },
        vacant: { $sum: { $cond: [{ $eq: ['$status', 'vacant'] }, 1, 0] } },
        occupied: { $sum: { $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] } },
        error: { $sum: { $cond: [{ $eq: ['$status', 'error'] }, 1, 0] } }
      }
    },
    {
      $project: {
        _id: 0,
        block: '$_id',
        total: 1,
        vacant: 1,
        occupied: 1,
        error: 1
      }
    },
    { $sort: { block: 1 } }
  ]);
};

module.exports = mongoose.model('ParkingSlot', ParkingSlotSchema);
