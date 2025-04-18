const ParkingSlot = require('../models/parkingSlot');

// GET  /api/parking/status?institution=…
exports.getParkingStatus = async (req, res) => {
  try {
    // we ignore institution for now
    const result = await ParkingSlot.getOverallSummary();
    const summary = result[0] || { total: 0, available: 0, occupied: 0 };
    return res.status(200).json({
      availableSpots: summary.available,
      occupiedSpots:  summary.occupied,
      totalSpots:     summary.total
    });
  } catch (error) {
    console.error('Error in getParkingStatus:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// GET  /api/parking/blocks?institution=…
exports.getParkingBlocks = async (req, res) => {
  try {
    const blocks = await ParkingSlot.getBlockSummary();
    return res.status(200).json({ blocks });
  } catch (error) {
    console.error('Error in getParkingBlocks:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/parking/update
// Body: { slotId: "A3", status: "occupied" }
exports.updateParkingStatus = async (req, res) => {
  try {
    const { slotId, status } = req.body;
    if (!slotId || !status) {
      return res.status(400).json({ message: 'Missing slotId or status' });
    }

    const block = slotId.charAt(0);

    const updated = await ParkingSlot.findOneAndUpdate(
      { slotId },
      { block, status, lastUpdated: new Date() },
      { upsert: true, new: true }
    );

    return res.status(200).json({ message: 'Slot updated', slot: updated });
  } catch (error) {
    console.error('Error in updateParkingStatus:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};
