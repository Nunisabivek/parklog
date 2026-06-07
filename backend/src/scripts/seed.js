require('dotenv').config();

const mongoose = require('mongoose');
const connectDatabase = require('../config/database');
const config = require('../config/env');
const ParkingSlot = require('../models/ParkingSlot');
const Device = require('../models/Device');

const DEFAULT_PATTERN = new Set([2, 5, 9]);

async function seed() {
  await connectDatabase(config.mongoUri);

  const now = new Date();
  const slotCount = Number(process.env.SEED_SLOT_COUNT || 12);
  const block = process.env.SEED_BLOCK || config.defaultBlock;
  const lotId = process.env.SEED_LOT_ID || config.defaultLotId;
  const deviceId = process.env.SEED_DEVICE_ID || 'ESP32-DEMO';

  await Device.findOneAndUpdate(
    { deviceId },
    {
      lotId,
      firmwareVersion: 'demo',
      lastSeenAt: now
    },
    { upsert: true, setDefaultsOnInsert: true }
  );

  for (let slotNumber = 1; slotNumber <= slotCount; slotNumber++) {
    const slotId = `${block}${slotNumber}`;
    const status = DEFAULT_PATTERN.has(slotNumber) ? 'occupied' : 'vacant';

    await ParkingSlot.findOneAndUpdate(
      { lotId, slotId },
      {
        lotId,
        block,
        slotNumber,
        slotId,
        status,
        deviceId,
        lastSeenAt: now
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  console.log(`Seeded ${slotCount} ParkLOG slots for lot ${lotId}.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
