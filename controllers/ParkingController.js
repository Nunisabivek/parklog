// controllers/parkingController.js
const ParkingSlot = require('../models/ParkingSlot');

/**
 * GET /api/parking/status?institution=…
 * Returns the overall totals: available vs occupied vs total.
 */
exports.getParkingStatus = async (req, res) => {
  try {
    // Run the aggregation you defined in your model
    const [summary] = await ParkingSlot.getOverallSummary();
    // If there are no slots yet, summary will be undefined
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
 * Returns an array of block summaries: { block, total, available, occupied }
 */
exports.getParkingBlocks = async (req, res) => {
  try {
    // Ignore institution for now (or filter if you store it in each record)
    const blocks = await ParkingSlot.getBlockSummary();
    return res.json({ blocks });
  } catch (err) {
    console.error('Error in getParkingBlocks:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/parking/slot
 * Body: { block, slotId, status }
 * Upserts one slot’s status from your IoT device.
 */
exports.updateSlotStatus = async (req, res) => {
  const { block, slotId, status } = req.body;
  if (!block || !slotId || !status) {
    return res.status(400).json({ message: 'Missing block, slotId, or status' });
  }

  try {
    await ParkingSlot.findOneAndUpdate(
      { slotId },
      { block, status, lastUpdated: Date.now() },
      { upsert: true, new: true }
    );
    return res.json({ message: 'Slot updated' });
  } catch (err) {
    console.error('Error in updateSlotStatus:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
