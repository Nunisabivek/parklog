require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');

const createApp = require('./app');
const connectDatabase = require('./config/database');

async function start() {
  await connectDatabase(process.env.MONGO_URI);

  const server = http.createServer();
  const io = new Server(server, {
    cors: { origin: process.env.CORS_ORIGIN || '*' }
  });

  io.on('connection', socket => {
    console.log(`Socket connected: ${socket.id}`);
  });

  const app = createApp({ io });
  server.on('request', app);

  const port = Number(process.env.PORT || 5000);
  server.listen(port, '0.0.0.0', () => {
    console.log(`ParkLOG API listening on port ${port}`);
  });
}

start().catch(err => {
  console.error('Failed to start ParkLOG API:', err);
  process.exit(1);
});
