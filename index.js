const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const parkingRoutes = require('./routes/ParkingRoutes');

const app = express();
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Atlas Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/parking', parkingRoutes);

const PORT = process.env.PORT;

//app.listen(PORT, '0.0.0.0', () => {
   // console.log(`🚀 Server running on http://192.168.29.249:${PORT}`);
//});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on PORT ${PORT}`);
});
