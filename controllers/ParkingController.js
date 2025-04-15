const ParkingSlot = require('../models/ParkingSlot');

exports.receiveStatus = async (req, res) => {
  const { slotId, status } = req.body;

  if (!slotId || !status) {
    return res.status(400).json({ error: 'Missing slotId or status' });
  }

  try {
    // Update or Create slot record
    const updated = await ParkingSlot.findOneAndUpdate(
      { slotId },
      { status },
      { new: true, upsert: true }
    );

    console.log(`✔ Slot ${slotId} updated to ${status}`);
    res.json({ message: 'Parking status updated', slotId, status });
  } catch (err) {
    console.error('❌ DB Update Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
