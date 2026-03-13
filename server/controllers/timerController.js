const TimerPreset = require("../models/TimerPreset");

// ➕ CREATE preset (DB me save)
exports.createPreset = async (req, res) => {
  try {
    const { label, focusTime, shortBreak, longBreak } = req.body;

    if (!label || !focusTime || !shortBreak || !longBreak) {
      return res.status(400).json({ message: "All fields required" });
    }

    const preset = new TimerPreset({
      label,
      focusTime,
      shortBreak,
      longBreak,
    });

    const savedPreset = await preset.save();
    res.status(201).json(savedPreset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📥 GET all presets (refresh ke baad bhi dikhe)
exports.getPresets = async (req, res) => {
  try {
    const presets = await TimerPreset.find().sort({ createdAt: -1 });
    res.json(presets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ❌ DELETE preset
exports.deletePreset = async (req, res) => {
  try {
    await TimerPreset.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};