const express = require('express');
const { updateSlotStatus } = require('../controllers/parkingController');
const requireDeviceKey = require('../middleware/deviceAuth');

const router = express.Router();

router.post('/update', requireDeviceKey, updateSlotStatus);

module.exports = router;
