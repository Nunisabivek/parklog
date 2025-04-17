require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const parkingRoutes = require('./routes/ParkingRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Mount routes
app.use('/api/parking', parkingRoutes);

// Listen on the port Railway provides (or 5000 locally)
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
