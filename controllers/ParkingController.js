const ParkingSlot = require('../models/ParkingSlot');

// GET /api/parking/summary
exports.getParkingSummary = async (req, res) => {
  try {
    const blocks = await ParkingSlot.getBlockSummary();
    res.json({
      institution: 'Assam Down Town University',
      lastUpdated: new Date(),
      blocks
    });
  } catch (error) {
    console.error('Error fetching parking summary:', error);
    res.status(500).json({
      error: 'Server Error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// POST /api/parking/slot
// { block, slotNumber, status }
exports.updateSlotStatus = async (req, res) => {
  const { block, slotNumber, status } = req.body;
  if (!block || !slotNumber || !['vacant','occupied'].includes(status)) {
    return res.status(400).json({ message: 'Invalid payload' });
  }

  const slotId = `${block}${slotNumber}`;
  try {
    const updated = await ParkingSlot.findOneAndUpdate(
      { slotId },
      { block, status, lastUpdated: new Date() },
      { upsert: true, new: true }
    );
    res.json({ message: 'Slot updated', slot: updated });
  } catch (error) {
    console.error('Error updating slot:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};
