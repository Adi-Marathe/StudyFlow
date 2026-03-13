const mongoose = require("mongoose");

const TimerPresetSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
    },
    focusTime: {
      type: Number,
      required: true,
    },
    shortBreak: {
      type: Number,
      required: true,
    },
    longBreak: {
      type: Number,
      required: true,
    },
    userId: {
      type: String, // future login ke liye
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TimerPreset", TimerPresetSchema);