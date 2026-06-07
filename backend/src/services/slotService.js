const ParkingSlot = require('../models/ParkingSlot');
const Device = require('../models/Device');
const OccupancyEvent = require('../models/OccupancyEvent');

function normalizeStatus(value) {
  if (value === true || value === 1 || value === '1') return 'occupied';
  if (value === false || value === 0 || value === '0') return 'vacant';

  const text = String(value || '').trim().toLowerCase();
  if (['occupied', 'busy', 'full'].includes(text)) return 'occupied';
  if (['vacant', 'empty', 'free', 'available'].includes(text)) return 'vacant';
  if (['error', 'fault', 'unknown'].includes(text)) return 'error';

  throw Object.assign(new Error(`Unsupported slot status: ${value}`), {
    statusCode: 400,
    publicMessage: `Unsupported slot status: ${value}`
  });
}

function buildSlotId({ block = 'A', slotNumber, id }) {
  const rawNumber = slotNumber ?? id;
  const number = Number(rawNumber);

  if (!Number.isInteger(number) || number < 1) {
    throw Object.assign(new Error('slot id must be a positive integer'), {
      statusCode: 400,
      publicMessage: 'slot id must be a positive integer'
    });
  }

  return {
    block: String(block || 'A').trim().toUpperCase(),
    slotNumber: number,
    slotId: `${String(block || 'A').trim().toUpperCase()}${number}`
  };
}

function parseBatchPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw Object.assign(new Error('request body is required'), {
      statusCode: 400,
      publicMessage: 'request body is required'
    });
  }

  const slots = Array.isArray(payload.slots)
    ? payload.slots
    : [{ id: payload.slotNumber, block: payload.block, status: payload.status }];

  if (!slots.length) {
    throw Object.assign(new Error('slots array must contain at least one slot'), {
      statusCode: 400,
      publicMessage: 'slots array must contain at least one slot'
    });
  }

  const lotId = payload.lotId || payload.lot_id || process.env.DEFAULT_LOT_ID || 'adtu-main';
  const deviceId = payload.device_id || payload.deviceId || payload.device || 'unknown-device';
  const observedAt = payload.timestamp
    ? new Date(Number(payload.timestamp) * 1000)
    : new Date();

  if (Number.isNaN(observedAt.getTime())) {
    throw Object.assign(new Error('timestamp must be a unix timestamp'), {
      statusCode: 400,
      publicMessage: 'timestamp must be a unix timestamp'
    });
  }

  return {
    lotId,
    deviceId,
    observedAt,
    slots: slots.map(slot => {
      const slotIdentity = buildSlotId({
        block: slot.block || payload.block || 'A',
        slotNumber: slot.slotNumber,
        id: slot.id
      });

      return {
        ...slotIdentity,
        status: normalizeStatus(slot.status)
      };
    })
  };
}

function summarizeSlots(slots) {
  return slots.reduce(
    (summary, slot) => {
      summary.total += 1;
      summary[slot.status] = (summary[slot.status] || 0) + 1;
      return summary;
    },
    { total: 0, vacant: 0, occupied: 0, error: 0 }
  );
}

async function applySlotBatch(payload, { ipAddress } = {}) {
  const parsed = parseBatchPayload(payload);

  await Device.findOneAndUpdate(
    { deviceId: parsed.deviceId },
    {
      lotId: parsed.lotId,
      lastIp: ipAddress,
      lastSeenAt: parsed.observedAt
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const updatedSlots = [];
  const changedSlots = [];

  for (const slot of parsed.slots) {
    const previous = await ParkingSlot.findOne({
      lotId: parsed.lotId,
      slotId: slot.slotId
    }).lean();

    const updated = await ParkingSlot.findOneAndUpdate(
      { lotId: parsed.lotId, slotId: slot.slotId },
      {
        lotId: parsed.lotId,
        block: slot.block,
        slotNumber: slot.slotNumber,
        slotId: slot.slotId,
        status: slot.status,
        deviceId: parsed.deviceId,
        lastSeenAt: parsed.observedAt
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    updatedSlots.push(updated);

    if (!previous || previous.status !== updated.status) {
      changedSlots.push(updated);
      await OccupancyEvent.create({
        lotId: parsed.lotId,
        slotId: slot.slotId,
        previousStatus: previous?.status || null,
        nextStatus: updated.status,
        deviceId: parsed.deviceId,
        observedAt: parsed.observedAt
      });
    }
  }

  const lotSlots = await ParkingSlot.find({ lotId: parsed.lotId }).lean();

  return {
    success: true,
    lotId: parsed.lotId,
    deviceId: parsed.deviceId,
    updatedCount: updatedSlots.length,
    changedCount: changedSlots.length,
    summary: summarizeSlots(lotSlots),
    slots: updatedSlots,
    changedSlots
  };
}

module.exports = {
  normalizeStatus,
  buildSlotId,
  parseBatchPayload,
  summarizeSlots,
  applySlotBatch
};
