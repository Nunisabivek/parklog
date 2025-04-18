require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const parkingRoutes = require('./routes/ParkingRoutes');

const app = express();

// ─── MIDDLEWARE ─────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── MONGODB CONNECTION ──────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ─── ROUTES ──────────────────────────────────────
app.use('/api/parking', parkingRoutes);

// ─── START SERVER ────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
