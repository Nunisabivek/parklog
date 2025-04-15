const express = require('express');
const router = express.Router();
const ParkingController = require('../controllers/ParkingController');

router.post('/update', ParkingController.receiveStatus);
router.get('/status', getParkingStatus);


module.exports = router;
