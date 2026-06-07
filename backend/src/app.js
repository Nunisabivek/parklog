const express = require('express');
const cors = require('cors');

const config = require('./config/env');
const parkingRoutes = require('./routes/parkingRoutes');
const slotRoutes = require('./routes/slotRoutes');
const otaRoutes = require('./routes/otaRoutes');
const tokenRoutes = require('./routes/tokenRoutes');

function createApp({ io } = {}) {
  const app = express();

  app.use(cors({
    origin: config.corsOrigins.includes('*') ? '*' : config.corsOrigins
  }));
  app.use(express.json({ limit: '256kb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use((req, res, next) => {
    req.io = io;
    next();
  });

  app.get('/', (req, res) => {
    res.json({
      service: 'ParkLOG backend',
      status: 'ok',
      docs: '/api/parking/status',
      lotId: config.defaultLotId
    });
  });

  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      lotId: config.defaultLotId,
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString()
    });
  });

  app.use('/api/parking', parkingRoutes);
  app.use('/api/slot', slotRoutes);
  app.use('/api/ota', otaRoutes);
  app.use('/api/tokens', tokenRoutes);

  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  app.use((err, req, res, next) => {
    console.error('Unhandled API error:', err);
    res.status(err.statusCode || 500).json({
      error: err.publicMessage || 'Server error'
    });
  });

  return app;
}

module.exports = createApp;
