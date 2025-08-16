const mongoose = require('mongoose');

const TimerPresetSchema = new mongoose.Schema({
  label: { type: String, required: true },
  focus: { type: Number, required: true },
  short: { type: Number, required: true },
  long: { type: Number, required: true },
  userId: { type: String } // optional: add if you're using auth
}, { timestamps: true });

module.exports = mongoose.model('TimerPreset', TimerPresetSchema);
