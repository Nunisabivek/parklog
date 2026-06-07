const config = require('../config/env');

function getLatestOta(req, res) {
  res.json(config.ota);
}

module.exports = {
  getLatestOta
};
