// controllers/parkingController.js
const ParkingSlot = require('../models/ParkingSlot');

// Endpoint to update parking status (called by your IoT device or simulation)
const updateParkingStatus = async (req, res) => {
  try {
    const { block, slots } = req.body;
    if (!block || !slots || !Array.isArray(slots)) {
      return res.status(400).json({ message: 'Invalid data' });
    }

    for (const slot of slots) {
      const { slotId, status } = slot;
      await ParkingSlot.findOneAndUpdate(
        { block, slotId },
        { status, updatedAt: Date.now() },
        { upsert: true }
      );
    }

    return res.status(200).json({ message: 'Parking status updated' });
  } catch (error) {
    console.error('Error updating parking status:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Endpoint to get parking status; if "block" query is provided, filter by block.
const getParkingStatus = async (req, res) => {
  try {
    const { block } = req.query;
    const filter = block ? { block } : {};
    const slots = await ParkingSlot.find(filter);

    const totalSpots = slots.length;
    const occupiedSpots = slots.filter(s => s.status === 'occupied').length;
    const availableSpots = totalSpots - occupiedSpots;

    return res.status(200).json({
      totalSpots,
      occupiedSpots,
      availableSpots,
      slots
    });
  } catch (error) {
    console.error('Error fetching parking status:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Endpoint to get aggregated data grouped by block
const getParkingBlocks = async (req, res) => {
  try {
    const blocksData = await ParkingSlot.aggregate([
      {
        $group: {
          _id: '$block',
          totalSpots: { $sum: 1 },
          occupiedSpots: {
            $sum: {
              $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          block: '$_id',
          _id: 0,
          totalSpots: 1,
          occupiedSpots: 1,
          available: { $subtract: ['$totalSpots', '$occupiedSpots'] }
        }
      }
    ]);

    return res.status(200).json({ blocks: blocksData });
  } catch (error) {
    console.error('Error grouping blocks:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  updateParkingStatus,
  getParkingStatus,
  getParkingBlocks
};
