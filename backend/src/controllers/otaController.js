function getLatestOta(req, res) {
  res.json({
    version: process.env.OTA_VERSION || '0.0.0',
    url: process.env.OTA_URL || null,
    checksum: process.env.OTA_CHECKSUM || null,
    required: String(process.env.OTA_REQUIRED || 'false').toLowerCase() === 'true'
  });
}

module.exports = {
  getLatestOta
};
