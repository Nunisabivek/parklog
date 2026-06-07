const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    lotId: {
      type: String,
      required: true,
      default: () => process.env.DEFAULT_LOT_ID || 'adtu-main',
      index: true
    },
    firmwareVersion: {
      type: String,
      trim: true
    },
    lastIp: {
      type: String,
      trim: true
    },
    lastSeenAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Device', DeviceSchema);
