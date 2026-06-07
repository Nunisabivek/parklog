const UserToken = require('../models/UserToken');
const config = require('../config/env');

const allowedPlatforms = new Set(['ios', 'android', 'web', 'unknown']);

async function registerToken(req, res, next) {
  try {
    const {
      token,
      platform = 'unknown',
      lotId = config.defaultLotId,
      subscribedSlotIds = []
    } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'token is required' });
    }

    const saved = await UserToken.findOneAndUpdate(
      { token },
      {
        platform: allowedPlatforms.has(platform) ? platform : 'unknown',
        lotId,
        subscribedSlotIds,
        lastSeenAt: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    res.json({ success: true, token: saved });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  registerToken
};
