const express = require('express');
const router = express.Router();
const { getParkingStatus, getParkingBlocks, updateParkingStatus } = require('../controllers/ParkingController');

router.get('/status', getParkingStatus);   // to get available data
router.get('/blocks', getParkingBlocks);   // to get blocks data
router.post('/update', updateParkingStatus); // iot will post here

module.exports = router;
