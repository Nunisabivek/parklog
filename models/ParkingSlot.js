const mongoose = require('mongoose');

const ParkingSlotSchema = new mongoose.Schema({
  block:       { type: String, required: true },
  slotId:      { type: String, required: true, unique: true },
  status:      {
    type: String,
    enum: ['vacant', 'occupied', 'error'],
    default: 'vacant'
  },
  lastUpdated: { type: Date, default: Date.now }
});

// Static: summary per block
ParkingSlotSchema.statics.getBlockSummary = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$block',
        total:     { $sum: 1 },
        available: {
          $sum: {
            $cond: [{ $eq: ['$status', 'vacant'] }, 1, 0]
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
        _id:       0,
        block:     '$_id',
        total:     1,
        available: 1,
        occupied:  1
      }
    },
    { $sort: { block: 1 } }
  ]);
};

// Static: overall parking summary
ParkingSlotSchema.statics.getOverallSummary = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        total:     { $sum: 1 },
        available: {
          $sum: {
            $cond: [{ $eq: ['$status', 'vacant'] }, 1, 0]
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
        _id:       0,
        total:     1,
        available: 1,
        occupied:  1
      }
    }
  ]);
};

module.exports = mongoose.model('ParkingSlot', ParkingSlotSchema);
