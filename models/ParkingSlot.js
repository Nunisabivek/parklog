// backend/models/ParkingSlot.js

const mongoose = require('mongoose');

const ParkingSlotSchema = new mongoose.Schema({
  block: {
    type: String,
    required: true
  },
  slotId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['empty', 'occupied', 'error'],   // matches your ESP32 code
    default: 'empty'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Static: summary per block
ParkingSlotSchema.statics.getBlockSummary = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$block',
        total: { $sum: 1 },
        available: {
          $sum: {
            $cond: [{ $eq: ['$status', 'empty'] }, 1, 0]
          }
        },
        occupied: {
          $sum: {
            $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        block: '$_id',
        total: 1,
        available: 1,
        occupied: 1
      }
    },
    { $sort: { block: 1 } }
  ]);
};

// Static: overall parking summary (for /status)
ParkingSlotSchema.statics.getOverallSummary = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        available: {
          $sum: {
            $cond: [{ $eq: ['$status', 'empty'] }, 1, 0]
          }
        },
        occupied: {
          $sum: {
            $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        total: 1,
        available: 1,
        occupied: 1
      }
    }
  ]);
};

module.exports = mongoose.model('ParkingSlot', ParkingSlotSchema);
