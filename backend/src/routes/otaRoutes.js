const express = require('express');
const { getLatestOta } = require('../controllers/otaController');

const router = express.Router();

router.get('/latest', getLatestOta);

module.exports = router;
