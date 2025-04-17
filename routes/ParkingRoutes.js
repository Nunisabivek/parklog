// backend/routes/ParkingRoutes.js
const express = require('express');
const router = express.Router();

const {
  getParkingSummary,    // GET /api/parking/summary
  updateSlotStatus      // POST /api/parking/update
} = require('../controllers/ParkingController');

// Fetch full summary (all blocks)
router.get('/summary', getParkingSummary);

// IoT or simulator POSTS individual slot updates here
// must be '/update' to match your ESP32 URL
router.post('/update', updateSlotStatus);

module.exports = router;
