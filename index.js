require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

// ⬆️ NEW dependencies for Socket.IO
const http     = require('http');
const { Server } = require('socket.io');

const parkingRoutes = require('./routes/ParkingRoutes');
const ParkingSlot   = require('./models/ParkingSlot'); // your Mongoose model

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

// health check at root
app.get('/', (req, res) => {
  res.send('ParkLOG backend 🏷️ is up and running');
});

// ─── ROUTES ──────────────────────────────────────
app.use('/api/parking', parkingRoutes);

// ─── SOCKET.IO SETUP & LIVE POLL ────────────────
// Wrap Express in a raw HTTP server
const server = http.createServer(app);
// Attach Socket.IO
const io = new Server(server, {
  cors: { origin: '*' }
});

// Log new connections (optional)
io.on('connection', socket => {
  console.log('🔌 Socket connected:', socket.id);
});

// Every 20 s, fetch latest 10 slots and broadcast
setInterval(async () => {
  try {
    const live = await ParkingSlot
      .find()
      .sort({ lastUpdated: -1 })
      .limit(10);
    io.emit('liveUpdate', live);
  } catch (err) {
    console.error('Error fetching live slots:', err);
  }
}, 20_000);

// ─── START SERVER ────────────────────────────────
// Swap app.listen → server.listen
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () =>
  console.log(`🚀 Server + sockets running on port ${PORT}`)
);
