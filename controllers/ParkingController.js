exports.getParkingStatus = async (req, res) => {
  try {
    const institution = req.query.institution;
    if (institution === 'Assam Down Town University') {
      return res.status(200).json({
        availableSpots: 6,
        occupiedSpots: 4,
        totalSpots: 10
      });
    } else {
      return res.status(200).json({
        availableSpots: 0,
        occupiedSpots: 0,
        totalSpots: 0
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.getParkingBlocks = async (req, res) => {
  try {
    const institution = req.query.institution;
    if (institution === 'Assam Down Town University') {
      return res.status(200).json({
        blocks: [
          { block: 'A', available: 10 },
          { block: 'B', available: 0 },
          { block: 'C', available: 0 }
        ]
      });
    } else {
      return res.status(200).json({ blocks: [] });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.updateParkingStatus = async (req, res) => {
  res.status(200).json({ message: 'Data Updated from IOT Successfully' });
};
