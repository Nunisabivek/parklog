const express = require('express');
const router = express.Router();
const {
  getParkingSummary,
  updateSlotStatus
} = require('../controllers/ParkingController');

// Fetch full summary (all blocks)
router.get('/summary', getParkingSummary);

// IoT or simulator posts individual slot updates here
router.post('/slot', updateSlotStatus);

module.exports = router;
