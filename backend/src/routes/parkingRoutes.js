const express = require('express');
const {
  getParkingStatus,
  getParkingBlocks,
  updateSlotStatus
} = require('../controllers/parkingController');

const router = express.Router();

router.get('/status', getParkingStatus);
router.get('/blocks', getParkingBlocks);

// Legacy route kept for existing ESP32 code that posts form data here.
router.post('/slot', updateSlotStatus);

module.exports = router;
