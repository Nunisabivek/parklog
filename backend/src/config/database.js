const mongoose = require('mongoose');

async function connectDatabase(uri) {
  if (!uri) {
    throw new Error('MONGO_URI is required. Copy .env.example to .env and set MONGO_URI.');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
}

module.exports = connectDatabase;
