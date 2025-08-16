const TimerPreset = require('../models/TimerPreset');

// ✅ Create new preset
exports.createPreset = async (req, res) => {
  try {
    const newPreset = new TimerPreset(req.body);
    const saved = await newPreset.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ Get all presets
exports.getPresets = async (req, res) => {
  try {
    const presets = await TimerPreset.find();
    res.json(presets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Delete preset by ID
exports.deletePreset = async (req, res) => {
  try {
    await TimerPreset.findByIdAndDelete(req.params.id);
    res.json({ message: 'Preset deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
