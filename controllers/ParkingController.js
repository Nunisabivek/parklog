// In your ParkingController.js
const ParkingSlot = require('../models/ParkingSlot'); // Assuming the path to your model is correct

exports.getParkingStatus = async (req, res) => {
  try {
    const institution = req.query.institution;
    let availableSpots = 0;
    let occupiedSpots = 0;
    let totalSpots = 0;

    if (institution === 'Assam Down Town University') {
      // Fetch actual data from the database based on the institution
      const allSlots = await ParkingSlot.find({}); // You might want to filter by institution if you have that field

      totalSpots = allSlots.length;
      availableSpots = allSlots.filter(slot => slot.status === 'empty').length;
      occupiedSpots = allSlots.filter(slot => slot.status === 'occupied').length;

      return res.status(200).json({ availableSpots, occupiedSpots, totalSpots });
    } else {
      return res.status(200).json({ availableSpots: 0, occupiedSpots: 0, totalSpots: 0 });
    }
  } catch (error) {
    console.error('Error fetching parking status:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.getParkingBlocks = async (req, res) => {
  try {
    const institution = req.query.institution;

    if (institution === 'Assam Down Town University') {
      // Fetch actual block data from the database or however you manage blocks
      // This is a placeholder - you'll need to implement your block logic
      const slots = await ParkingSlot.find({});
      const blockCounts = slots.reduce((acc, slot) => {
        // Assuming your ParkingSlot model might have a 'block' field
        const blockIdentifier = slot.slotId ? slot.slotId.charAt(0).toUpperCase() : 'Unknown'; // Example: SlotId 'A1' belongs to block 'A'
        acc[blockIdentifier] = acc[blockIdentifier] || { available: 0, total: 0, block: blockIdentifier };
        acc[blockIdentifier].total++;
        if (slot.status === 'empty') {
          acc[blockIdentifier].available++;
        }
        return acc;
      }, {});

      const blocks = Object.values(blockCounts);
      return res.status(200).json({ blocks });
    } else {
      return res.status(200).json({ blocks: [] });
    }
  } catch (error) {
    console.error('Error fetching parking blocks:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.updateParkingStatus = async (req, res) => {
  console.log('Received data from IoT:', req.body);
  try {
    const { slotId, status } = req.body; // Assuming your IoT device sends 'slotId' and 'status'

    if (!slotId || !status) {
      return res.status(400).json({ message: 'Missing slotId or status in the request body' });
    }

    const updatedSlot = await ParkingSlot.findOneAndUpdate(
      { slotId: slotId },
      { status: status },
      { new: true, upsert: true } // upsert: true will create a new document if slotId doesn't exist
    );

    if (updatedSlot) {
      console.log('Parking slot updated:', updatedSlot);
      return res.status(200).json({ message: 'Parking status updated successfully', data: updatedSlot });
    } else {
      // This case should ideally not be hit with upsert: true
      return res.status(500).json({ message: 'Failed to update parking status (unexpected error)' });
    }
  } catch (error) {
    console.error('Error updating parking status:', error);
    return res.status(500).json({ message: 'Failed to update parking status', error: error.message });
  }
};