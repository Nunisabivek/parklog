const express = require('express');
const router  = express.Router();

const {
  getParkingStatus,
  getParkingBlocks,
  updateParkingStatus
} = require('../controllers/parkingController');

// Overall summary
router.get('/status', getParkingStatus);

// Block‑by‑block summary
router.get('/blocks', getParkingBlocks);

// IoT (ESP32) posts updates here
router.post('/update', updateParkingStatus);

module.exports = router;
