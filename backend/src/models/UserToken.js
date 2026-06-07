const mongoose = require('mongoose');

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
      default: () => process.env.DEFAULT_LOT_ID || 'adtu-main'
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
