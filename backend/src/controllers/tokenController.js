const UserToken = require('../models/UserToken');

async function registerToken(req, res, next) {
  try {
    const {
      token,
      platform = 'unknown',
      lotId = process.env.DEFAULT_LOT_ID || 'adtu-main',
      subscribedSlotIds = []
    } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'token is required' });
    }

    const saved = await UserToken.findOneAndUpdate(
      { token },
      {
        platform,
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
