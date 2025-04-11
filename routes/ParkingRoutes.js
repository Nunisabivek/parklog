// routes/parkingRoutes.js
const express = require('express');
const router = express.Router();
const { updateParkingStatus, getParkingStatus, getParkingBlocks } = require('../controllers/ParkingController');

router.post('/update', updateParkingStatus);
router.get('/status', getParkingStatus);
router.get('/blocks', getParkingBlocks);

module.exports = router;
