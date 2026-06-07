require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');

const createApp = require('./app');
const config = require('./config/env');
const connectDatabase = require('./config/database');

async function start() {
  await connectDatabase(config.mongoUri);

  const server = http.createServer();
  const io = new Server(server, {
    cors: { origin: config.corsOrigins.includes('*') ? '*' : config.corsOrigins }
  });

  io.on('connection', socket => {
    console.log(`Socket connected: ${socket.id}`);
  });

  const app = createApp({ io });
  server.on('request', app);

  server.listen(config.port, '0.0.0.0', () => {
    console.log(`ParkLOG API listening on port ${config.port}`);
  });
}

start().catch(err => {
  console.error('Failed to start ParkLOG API:', err);
  process.exit(1);
});
