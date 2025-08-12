import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  type: { type: String, default: "other" },
  color: { type: String, default: "#4d2c5e" },
  description: String,
  reminder: { type: Boolean, default: true }
});

export default mongoose.model("Event", eventSchema);
