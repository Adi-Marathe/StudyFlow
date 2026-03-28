// models/Event.js
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, "Description cannot exceed 300 characters"],
      default: "",
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, "Location cannot exceed 200 characters"],
      default: "",
    },
    start: {
      type: Date,
      required: [true, "Start date is required"],
    },
    end: {
      type: Date,
      required: [true, "End date is required"],
    },
    color: {
      type: String,
      default: "#ff7426",
      match: [/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Invalid color hex"],
    },
    reminder: {
      type: Number,
      default: 15,
      enum: {
        values: [0, 5, 15, 30, 60, 1440],
        message: "Reminder must be 0, 5, 15, 30, 60, or 1440 minutes",
      },
    },
    /* Prevents the cron job from sending the email more than once */
    reminderSent: {
      type:    Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/* Index for fast per-user queries sorted by date */
eventSchema.index({ user: 1, start: 1 });

module.exports = mongoose.model("Event", eventSchema);