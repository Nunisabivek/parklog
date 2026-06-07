const mongoose = require('mongoose');
const config = require('../config/env');

const UserTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    platform: {
      type: String,
      enum: ['ios', 'android', 'web', 'unknown'],
      default: 'unknown'
    },
    lotId: {
      type: String,
      required: true,
      default: () => config.defaultLotId
    },
    subscribedSlotIds: {
      type: [String],
      default: []
    },
    lastSeenAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserToken', UserTokenSchema);
