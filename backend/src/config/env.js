function bool(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function number(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function list(value, fallback = []) {
  if (!value) return fallback;
  return String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

const config = {
  port: number(process.env.PORT, 5000),
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/parklog',
  corsOrigins: list(process.env.CORS_ORIGIN, ['*']),
  defaultLotId: process.env.DEFAULT_LOT_ID || 'adtu-main',
  defaultBlock: process.env.DEFAULT_BLOCK || 'A',
  staleAfterSeconds: number(process.env.STALE_AFTER_SECONDS, 45),
  requireDeviceApiKey: bool(process.env.REQUIRE_DEVICE_API_KEY, false),
  deviceApiKey: process.env.DEVICE_API_KEY || '',
  ota: {
    version: process.env.OTA_VERSION || '0.0.0',
    url: process.env.OTA_URL || null,
    checksum: process.env.OTA_CHECKSUM || null,
    required: bool(process.env.OTA_REQUIRED, false)
  }
};

module.exports = config;
