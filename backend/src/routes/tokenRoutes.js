const express = require('express');
const { registerToken } = require('../controllers/tokenController');

const router = express.Router();

router.post('/register', registerToken);

module.exports = router;
