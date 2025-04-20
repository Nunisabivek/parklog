// routes/parkingRoutes.js
const express = require('express');
const router  = express.Router();

const {
  getParkingStatus,
  getParkingBlocks,
  updateSlotStatus
} = require('../controllers/ParkingController');

// GET  /api/parking/status?institution=…
router.get('/status', getParkingStatus);

// GET  /api/parking/blocks?institution=…
router.get('/blocks', getParkingBlocks);

// POST /api/parking/slot   (your IoT will POST slot updates here)
router.post('/slot', updateSlotStatus);

module.exports = router;
