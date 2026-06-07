const express = require('express');
const { updateSlotStatus } = require('../controllers/parkingController');

const router = express.Router();

router.post('/update', updateSlotStatus);

module.exports = router;
