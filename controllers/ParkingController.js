// controllers/parkingController.js
const ParkingSlot = require('../models/ParkingSlot');

/**
 * GET /api/parking/status?institution=…
 * Returns overall totals: available vs occupied vs total.
 */
exports.getParkingStatus = async (req, res) => {
  try {
    const [summary] = await ParkingSlot.getOverallSummary();
    const total     = summary?.total     ?? 0;
    const available = summary?.available ?? 0;
    const occupied  = summary?.occupied  ?? 0;

    return res.json({
      availableSpots: available,
      occupiedSpots:  occupied,
      totalSpots:     total
    });
  } catch (err) {
    console.error('Error in getParkingStatus:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/parking/blocks?institution=…
 * Returns an array of per-block summaries.
 */
exports.getParkingBlocks = async (req, res) => {
  try {
    const blocks = await ParkingSlot.getBlockSummary();
    return res.json({ blocks });
  } catch (err) {
    console.error('Error in getParkingBlocks:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/parking/slot
 * Body: { block, slotNumber, status }
 * Upserts one slot’s status from your IoT device.
 */
exports.updateSlotStatus = async (req, res) => {
  try {
    const { block, slotNumber, status } = req.body;
    console.log('📥 updateSlotStatus body:', req.body);

    // validate
    if (!block || !slotNumber || !status) {
      console.error('❌ Missing field in updateSlotStatus:', req.body);
      return res
        .status(400)
        .json({ message: 'block, slotNumber & status are required' });
    }

    const slotId = `${block}${slotNumber}`; // e.g. "P1"
    console.log(`🔄 Upserting slot ${slotId} → ${status}`);

    const updated = await ParkingSlot.findOneAndUpdate(
      { slotId },
      { block, status, lastUpdated: new Date() },
      { upsert: true, new: true }
    );

    console.log('✅ updateSlotStatus result:', updated);
    return res.json({ message: 'Slot updated', slot: updated });
  } catch (err) {
    console.error('💥 updateSlotStatus error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
