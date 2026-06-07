const config = require('../config/env');

function requireDeviceKey(req, res, next) {
  if (!config.requireDeviceApiKey) {
    return next();
  }

  const provided = req.get('x-device-key') || req.query.deviceKey;

  if (!config.deviceApiKey || provided !== config.deviceApiKey) {
    return res.status(401).json({ error: 'Valid device API key required' });
  }

  return next();
}

module.exports = requireDeviceKey;
