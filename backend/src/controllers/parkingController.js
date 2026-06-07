const ParkingSlot = require('../models/ParkingSlot');
const config = require('../config/env');
const { applySlotBatch, summarizeSlots } = require('../services/slotService');

function getLotId(req) {
  return req.query.lotId || req.body?.lotId || config.defaultLotId;
}

function serializeSlot(slot) {
  const lastUpdated = slot.lastSeenAt || slot.updatedAt;
  const ageSeconds = lastUpdated
    ? Math.max(0, Math.round((Date.now() - new Date(lastUpdated).getTime()) / 1000))
    : null;

  return {
    id: slot.slotNumber,
    slotId: slot.slotId,
    block: slot.block,
    status: slot.status,
    occupied: slot.status === 'occupied',
    stale: ageSeconds === null || ageSeconds > config.staleAfterSeconds,
    ageSeconds,
    lastUpdated
  };
}

async function getParkingStatus(req, res, next) {
  try {
    const lotId = getLotId(req);
    const slots = await ParkingSlot.find({ lotId })
      .sort({ block: 1, slotNumber: 1 })
      .lean();

    res.json({
      lotId,
      summary: summarizeSlots(slots),
      staleAfterSeconds: config.staleAfterSeconds,
      slots: slots.map(serializeSlot)
    });
  } catch (err) {
    next(err);
  }
}

async function getParkingBlocks(req, res, next) {
  try {
    const lotId = getLotId(req);
    const blocks = await ParkingSlot.summaryForLot(lotId);
    res.json({ lotId, blocks });
  } catch (err) {
    next(err);
  }
}

async function updateSlotStatus(req, res, next) {
  try {
    const result = await applySlotBatch(req.body, { ipAddress: req.ip });

    if (result.changedSlots.length && req.io) {
      req.io.emit('parking:update', {
        lotId: result.lotId,
        summary: result.summary,
        slots: result.changedSlots
      });
    }

    res.json({
      success: true,
      lotId: result.lotId,
      deviceId: result.deviceId,
      updatedCount: result.updatedCount,
      changedCount: result.changedCount,
      summary: result.summary
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getParkingStatus,
  getParkingBlocks,
  updateSlotStatus
};
